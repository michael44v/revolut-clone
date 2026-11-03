<?php
/**
 * GET /api/v1/notifications/index.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/notification_functions.php';

$user = require_authenticated_user();
$limit = min((int) ($_GET['limit'] ?? 30), 100);

$data = get_user_notifications((int) $user['id'], $limit);

json_success('Notifications retrieved', $data);
