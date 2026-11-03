<?php
/**
 * GET /api/v1/analytics/dashboard.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/functions.php';

$user = require_authenticated_user();
$analytics = get_analytics_summary((int) $user['id']);

json_success('Analytics summary retrieved', $analytics);
