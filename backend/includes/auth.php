<?php
/**
 * Procedural Authentication & Authorization helpers
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/response.php';

function get_auth_bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
        return $matches[1];
    }
    return null;
}

function require_authenticated_user(): array {
    $token = get_auth_bearer_token();
    if (!$token) {
        json_error('Authorization token required', 401);
    }

    $appConfig = require __DIR__ . '/../config/app.php';
    $payload = jwt_verify($token, $appConfig['jwt_secret']);

    if (!$payload || empty($payload['sub'])) {
        json_error('Invalid or expired authorization token', 401);
    }

    $userId = (int) $payload['sub'];
    $conn = get_db_connection();

    $stmt = $conn->prepare("SELECT id, user_uid, name, email, phone, avatar_url, revtag, kyc_status, tier, is_demo FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();
    $stmt->close();

    if (!$user) {
        json_error('User account does not exist or has been disabled', 401);
    }

    return $user;
}

function create_user_session(int $userId, string $deviceName = 'Mobile App'): array {
    $appConfig = require __DIR__ . '/../config/app.php';
    $conn = get_db_connection();

    $accessToken = jwt_generate([
        'sub' => $userId,
        'type' => 'access'
    ], $appConfig['jwt_secret'], $appConfig['jwt_expiry']);

    $rawRefreshToken = bin2hex(random_bytes(32));
    $refreshTokenHash = hash('sha256', $rawRefreshToken);
    $expiresAt = date('Y-m-d H:i:s', time() + $appConfig['refresh_expiry']);
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    $stmt = $conn->prepare("INSERT INTO user_sessions (user_id, refresh_token_hash, device_name, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $userId, $refreshTokenHash, $deviceName, $ip, $expiresAt);
    $stmt->execute();
    $stmt->close();

    return [
        'access_token' => $accessToken,
        'refresh_token' => $rawRefreshToken,
        'expires_in' => $appConfig['jwt_expiry']
    ];
}

function revoke_user_sessions(int $userId): void {
    $conn = get_db_connection();
    $stmt = $conn->prepare("UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();
}
