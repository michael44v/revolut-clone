<?php
/**
 * GET /api/v1/wallets/transactions.php?currency=USD
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';

$user = require_authenticated_user();
$currency = sanitize_string($_GET['currency'] ?? '');
$limit = min((int) ($_GET['limit'] ?? 20), 50);

$txs = get_user_transactions((int) $user['id'], $limit);
if ($currency) {
    $txs = array_values(array_filter($txs, fn($t) => strtoupper($t['currency']) === strtoupper($currency)));
}

json_success('Wallet transactions retrieved', ['transactions' => $txs]);
