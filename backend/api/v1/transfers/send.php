<?php
/**
 * POST /api/v1/transfers/send.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';

$user = require_authenticated_user();
$input = get_json_input();

$recipient = sanitize_string($input['recipientName'] ?? ($input['recipient'] ?? ''));
$amount = validate_positive_amount($input['amount'] ?? 0);
$currency = strtoupper(sanitize_string($input['currency'] ?? 'USD'));
$reference = sanitize_string($input['reference'] ?? 'Personal Transfer');
$idempotencyKey = $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? ($input['idempotencyKey'] ?? null);

if (!$recipient || !$amount || !validate_supported_currency($currency)) {
    json_error('Valid recipient, amount and supported currency required', 400);
}

$amountMinor = amount_to_minor($amount);

try {
    $res = transfer_send((int) $user['id'], $recipient, $amountMinor, $currency, $reference, $idempotencyKey);
    json_success('Transfer executed successfully', [
        'transaction_uid' => $res['transaction_uid'],
        'wallet' => $res['wallet']
    ]);
} catch (Exception $e) {
    json_error($e->getMessage(), 400);
}
