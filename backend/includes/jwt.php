<?php
/**
 * Standards-compliant, lightweight procedural JWT implementation (HMAC-SHA256)
 */

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_generate(array $payload, string $secret, int $expirySeconds = 86400): string {
    $header = [
        'typ' => 'JWT',
        'alg' => 'HS256'
    ];

    $issuedAt = time();
    $payload['iat'] = $issuedAt;
    $payload['exp'] = $issuedAt + $expirySeconds;

    $base64UrlHeader = base64url_encode(json_encode($header));
    $base64UrlPayload = base64url_encode(json_encode($payload));

    $signature = hash_hmac('sha256', "{$base64UrlHeader}.{$base64UrlPayload}", $secret, true);
    $base64UrlSignature = base64url_encode($signature);

    return "{$base64UrlHeader}.{$base64UrlPayload}.{$base64UrlSignature}";
}

function jwt_verify(string $jwt, string $secret): ?array {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return null;
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $signature = base64url_decode($base64UrlSignature);
    $expectedSignature = hash_hmac('sha256', "{$base64UrlHeader}.{$base64UrlPayload}", $secret, true);

    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }

    $payload = json_decode(base64url_decode($base64UrlPayload), true);
    if (!$payload || !is_array($payload)) {
        return null;
    }

    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null; // Expired
    }

    return $payload;
}
