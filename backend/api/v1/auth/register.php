<?php
/**
 * POST /api/v1/auth/register.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/security.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/wallet_functions.php';

enforce_rate_limit('register', 10, 60);

$input = get_json_input();
$name = sanitize_string($input['name'] ?? '');
$email = sanitize_email($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$name || !$email || !$password) {
    json_error('All fields (name, email, password) are required', 400);
}

if (!validate_email($email)) {
    json_error('Invalid email format', 400);
}

if (strlen($password) < 6) {
    json_error('Password must be at least 6 characters', 400);
}

$conn = get_db_connection();

// Check unique email
$stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
$stmtCheck->bind_param("s", $email);
$stmtCheck->execute();
if ($stmtCheck->get_result()->fetch_assoc()) {
    $stmtCheck->close();
    json_error('An account with this email already exists', 409);
}
$stmtCheck->close();

$userUid = 'usr_' . bin2hex(random_bytes(5));
$revtag = '@' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name)) . rand(10, 99);
$hash = password_hash($password, PASSWORD_BCRYPT);

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("INSERT INTO users (user_uid, name, email, password_hash, revtag, kyc_status, tier, is_demo) VALUES (?, ?, ?, ?, ?, 'verified', 'Standard', 0)");
    $stmt->bind_param("sssss", $userUid, $name, $email, $hash, $revtag);
    $stmt->execute();
    $userId = $stmt->insert_id;
    $stmt->close();

    // Create user settings
    $stmtSet = $conn->prepare("INSERT INTO user_settings (user_id) VALUES (?)");
    $stmtSet->bind_param("i", $userId);
    $stmtSet->execute();
    $stmtSet->close();

    // Initialize starter wallets ($100 USD, £50 GBP, €50 EUR, ₦50,000 NGN)
    initialize_user_starter_wallets($userId);

    // Initial welcome notification
    create_notification($userId, 'security', 'Welcome to Revolut Simulation', 'Your account has been registered with isolated starter balances.', 'Shield');

    $conn->commit();

    $session = create_user_session($userId);

    $userData = [
        'id' => $userUid,
        'name' => $name,
        'email' => $email,
        'avatar' => null,
        'tag' => $revtag,
        'kycStatus' => 'verified',
        'tier' => 'Standard',
        'isDemo' => false,
        'createdAt' => date('c')
    ];

    json_success('Account created successfully', [
        'user' => $userData,
        'token' => $session['access_token'],
        'refreshToken' => $session['refresh_token']
    ], 201);
} catch (Exception $e) {
    $conn->rollback();
    json_error('Failed to create account: ' . $e->getMessage(), 500);
}
