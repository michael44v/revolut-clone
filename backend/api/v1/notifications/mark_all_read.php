<?php
/**
 * POST /api/v1/notifications/mark_all_read.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/notification_functions.php';

$user = require_authenticated_user();
$conn = get_db_connection();

$stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$stmt->close();

$data = get_user_notifications((int) $user['id']);

json_success('All notifications marked as read', $data);
