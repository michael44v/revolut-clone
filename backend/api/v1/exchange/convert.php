<?php
/**
 * POST /api/v1/exchange/convert.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';

$user = require_authenticated_user();
$input = get_json_input();

$fromCurrency = strtoupper(sanitize_string($input['fromCurrency'] ?? ''));
$toCurrency = strtoupper(sanitize_string($input['toCurrency'] ?? ''));
$amount = validate_positive_amount($input['amount'] ?? 0);

if (!$amount || !validate_supported_currency($fromCurrency) || !validate_supported_currency($toCurrency)) {
    json_error('Valid positive amount and supported currencies (USD, GBP, EUR, NGN) required', 400);
}

$amountMinor = amount_to_minor($amount);

try {
    $res = currency_exchange((int) $user['id'], $fromCurrency, $toCurrency, $amountMinor);
    json_success("Converted {$amount} {$fromCurrency} to {$res['toAmount']} {$toCurrency}", $res);
} catch (Exception $e) {
    json_error($e->getMessage(), 400);
}
