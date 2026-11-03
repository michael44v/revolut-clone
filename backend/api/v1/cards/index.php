<?php
/**
 * GET /api/v1/cards/index.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/functions.php';

$user = require_authenticated_user();
$cards = get_user_cards((int) $user['id']);

json_success('Virtual cards retrieved', $cards);
