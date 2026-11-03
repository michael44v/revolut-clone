<?php
/**
 * POST /api/v1/notifications/mark_read.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';

$user = require_authenticated_user();
$input = get_json_input();
$notifId = sanitize_string($input['id'] ?? '');

if (!$notifId) {
    json_error('Notification ID required', 400);
}

$conn = get_db_connection();
$stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND notification_uid = ?");
$stmt->bind_param("is", $user['id'], $notifId);
$stmt->execute();
$stmt->close();

json_success('Notification marked as read');
