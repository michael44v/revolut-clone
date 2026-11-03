<?php
/**
 * GET /api/v1/wallets/index.php
 * POST /api/v1/wallets/index.php (Simulated Add Funds)
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/wallet_functions.php';

$user = require_authenticated_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = get_json_input();
    $currency = strtoupper(sanitize_string($input['currency'] ?? 'USD'));
    $amount = validate_positive_amount($input['amount'] ?? 0);

    if (!$amount || !validate_supported_currency($currency)) {
        json_error('Valid positive amount and supported currency required', 400);
    }

    $amountMinor = amount_to_minor($amount);
    $idempotencyKey = $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? ($input['idempotencyKey'] ?? null);

    try {
        $result = wallet_deposit((int) $user['id'], $currency, $amountMinor, $idempotencyKey);
        json_success("Added {$currency} " . number_format($amount, 2) . " successfully", $result['wallet']);
    } catch (Exception $e) {
        json_error($e->getMessage(), 400);
    }
} else {
    $data = get_user_wallets((int) $user['id']);
    json_success('Wallets retrieved successfully', $data);
}
