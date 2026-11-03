<?php
/**
 * POST /api/v1/transfers/request.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/notification_functions.php';

$user = require_authenticated_user();
$input = get_json_input();

$payer = sanitize_string($input['fromName'] ?? ($input['payer'] ?? ''));
$amount = validate_positive_amount($input['amount'] ?? 0);
$currency = strtoupper(sanitize_string($input['currency'] ?? 'USD'));
$note = sanitize_string($input['note'] ?? 'Payment Request');

if (!$payer || !$amount || !validate_supported_currency($currency)) {
    json_error('Valid payer, positive amount and currency required', 400);
}

$conn = get_db_connection();
$reqUid = 'req_' . time() . '_' . bin2hex(random_bytes(3));
$amountMinor = amount_to_minor($amount);

$stmt = $conn->prepare("INSERT INTO transfer_requests (request_uid, requester_id, payer_identifier, amount_minor, currency, note, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
$stmt->bind_param("sisiss", $reqUid, $user['id'], $payer, $amountMinor, $currency, $note);
$stmt->execute();
$stmt->close();

$symbol = get_currency_symbol($currency);
create_notification(
    $user['id'],
    'transfer',
    'Payment Requested',
    "Requested {$symbol}" . number_format($amount, 2) . " from {$payer}. Status: Pending.",
    'ArrowDownLeft'
);

json_success('Payment request created successfully', [
    'request_uid' => $reqUid,
    'status' => 'pending',
    'amount' => $amount,
    'currency' => $currency
]);
