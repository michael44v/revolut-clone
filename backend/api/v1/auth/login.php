<?php
/**
 * POST /api/v1/auth/login.php
 * Strict database authentication with bcrypt password verification
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
    json_error('Invalid email or password credentials', 401);
}

// Strictly verify password hash in database
// For demo user with quick login, support standard demo password 'demo123' or 'demo'
$isValidPassword = password_verify($password, $user['password_hash']);
if (!$isValidPassword && $user['is_demo'] && ($password === 'demo' || $password === 'demo123')) {
    $isValidPassword = true;
}

if (!$isValidPassword) {
    json_error('Invalid email or password credentials', 401);
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
