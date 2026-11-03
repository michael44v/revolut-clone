<?php
/**
 * POST /api/v1/cards/update_status.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/functions.php';

$user = require_authenticated_user();
$input = get_json_input();
$cardId = sanitize_string($input['cardId'] ?? ($input['id'] ?? ''));

if (!$cardId) {
    json_error('Card ID required', 400);
}

$card = toggle_card_freeze((int) $user['id'], $cardId);
if (!$card) {
    json_error('Card not found', 404);
}

$msg = $card['isFrozen'] ? 'Card frozen successfully' : 'Card unfrozen successfully';
json_success($msg, $card);
