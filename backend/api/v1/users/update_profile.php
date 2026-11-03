<?php
/**
 * POST /api/v1/users/update_profile.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/auth.php';

$user = require_authenticated_user();
$input = get_json_input();
$conn = get_db_connection();

if (isset($input['name'])) {
    $name = sanitize_string($input['name']);
    if ($name) {
        $stmt = $conn->prepare("UPDATE users SET name = ? WHERE id = ?");
        $stmt->bind_param("si", $name, $user['id']);
        $stmt->execute();
        $stmt->close();
    }
}

if (isset($input['themeMode'])) {
    $mode = in_array($input['themeMode'], ['light', 'dark', 'system'], true) ? $input['themeMode'] : 'system';
    $stmt = $conn->prepare("UPDATE user_settings SET theme_mode = ? WHERE user_id = ?");
    $stmt->bind_param("si", $mode, $user['id']);
    $stmt->execute();
    $stmt->close();
}

if (isset($input['biometricsEnabled'])) {
    $bio = (int) (bool) $input['biometricsEnabled'];
    $stmt = $conn->prepare("UPDATE user_settings SET biometrics_enabled = ? WHERE user_id = ?");
    $stmt->bind_param("ii", $bio, $user['id']);
    $stmt->execute();
    $stmt->close();
}

json_success('Profile updated successfully');
