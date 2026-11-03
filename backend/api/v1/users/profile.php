<?php
/**
 * GET /api/v1/users/profile.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';

$user = require_authenticated_user();
$conn = get_db_connection();

$stmt = $conn->prepare("SELECT theme_mode, biometrics_enabled, push_notifications_enabled FROM user_settings WHERE user_id = ? LIMIT 1");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$settings = $stmt->get_result()->fetch_assoc();
$stmt->close();

json_success('Profile retrieved successfully', [
    'profile' => [
        'id' => $user['user_uid'],
        'name' => $user['name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'avatar' => $user['avatar_url'],
        'tag' => $user['revtag'],
        'tier' => $user['tier'],
        'kycStatus' => $user['kyc_status'],
        'isDemo' => (bool) $user['is_demo']
    ],
    'settings' => [
        'themeMode' => $settings['theme_mode'] ?? 'system',
        'biometricsEnabled' => (bool) ($settings['biometrics_enabled'] ?? false),
        'pushNotificationsEnabled' => (bool) ($settings['push_notifications_enabled'] ?? true)
    ]
]);
