<?php
/**
 * POST /api/v1/auth/logout.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';

$user = require_authenticated_user();
revoke_user_sessions((int) $user['id']);

json_success('Logged out successfully', null);
