<?php
/**
 * GET /api/v1/cards/details.php?id=crd_01
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/functions.php';

$user = require_authenticated_user();
$cardId = sanitize_string($_GET['id'] ?? '');

if (!$cardId) {
    json_error('Card ID required', 400);
}

$cards = get_user_cards((int) $user['id']);
foreach ($cards as $c) {
    if ($c['id'] === $cardId) {
        json_success('Card details retrieved', $c);
    }
}

json_error('Card not found', 404);
