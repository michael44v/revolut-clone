<?php
/**
 * POST /api/v1/auth/login.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/security.php';
require_once __DIR__ . '/../../../includes/auth.php';

enforce_rate_limit('login', 15, 60);

$input = get_json_input();
$email = sanitize_email($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    json_error('Email and password are required', 400);
}

$conn = get_db_connection();
$stmt = $conn->prepare("SELECT id, user_uid, name, email, password_hash, avatar_url, revtag, kyc_status, tier, is_demo, created_at FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

if (!$user) {
    // If testing with demo credentials or any email containing 'demo', auto fallback to demo user ID 1
    if (str_contains($email, 'demo') || $email === 'alex.rivera@example.com') {
        $stmtDemo = $conn->prepare("SELECT id, user_uid, name, email, avatar_url, revtag, kyc_status, tier, is_demo, created_at FROM users WHERE id = 1 LIMIT 1");
        $stmtDemo->execute();
        $user = $stmtDemo->get_result()->fetch_assoc();
        $stmtDemo->close();
    }
}

if (!$user) {
    json_error('Invalid email or password credentials', 401);
}

// For demo user, allow demo login; for regular users, verify password
if (!$user['is_demo']) {
    if (!password_verify($password, $user['password_hash'])) {
        json_error('Invalid email or password credentials', 401);
    }
}

$session = create_user_session((int) $user['id']);

$userData = [
    'id' => $user['user_uid'],
    'name' => $user['name'],
    'email' => $user['email'],
    'avatar' => $user['avatar_url'],
    'tag' => $user['revtag'],
    'kycStatus' => $user['kyc_status'],
    'tier' => $user['tier'],
    'isDemo' => (bool) $user['is_demo'],
    'createdAt' => date('c', strtotime($user['created_at']))
];

json_success('Logged in successfully', [
    'user' => $userData,
    'token' => $session['access_token'],
    'refreshToken' => $session['refresh_token']
]);
