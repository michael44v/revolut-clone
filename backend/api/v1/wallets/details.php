<?php
/**
 * GET /api/v1/wallets/details.php?currency=USD
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/wallet_functions.php';

$user = require_authenticated_user();
$currency = sanitize_string($_GET['currency'] ?? 'USD');

if (!validate_supported_currency($currency)) {
    json_error('Invalid currency requested', 400);
}

$wallet = get_wallet_by_currency((int) $user['id'], $currency);
if (!$wallet) {
    json_error('Wallet not found', 404);
}

json_success('Wallet details retrieved', $wallet);
