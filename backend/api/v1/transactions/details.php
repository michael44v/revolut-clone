<?php
/**
 * GET /api/v1/transactions/details.php?id=tx_982103
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';

$user = require_authenticated_user();
$txId = sanitize_string($_GET['id'] ?? '');

if (!$txId) {
    json_error('Transaction identifier required', 400);
}

$conn = get_db_connection();
$stmt = $conn->prepare("SELECT transaction_uid as id, title, subtitle, category, icon_name, type, status, currency, symbol, amount_minor, fee_minor, reference, counterparty_name, created_at FROM transactions WHERE user_id = ? AND transaction_uid = ? LIMIT 1");
$stmt->bind_param("is", $user['id'], $txId);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

if (!$row) {
    json_error('Transaction not found', 404);
}

$tx = [
    'id' => $row['id'],
    'title' => $row['title'],
    'subtitle' => $row['subtitle'],
    'category' => $row['category'],
    'iconName' => $row['icon_name'],
    'type' => $row['type'],
    'status' => $row['status'],
    'currency' => $row['currency'],
    'symbol' => $row['symbol'],
    'amount' => minor_to_amount((int) $row['amount_minor']),
    'fee' => minor_to_amount((int) $row['fee_minor']),
    'reference' => $row['reference'],
    'counterparty' => $row['counterparty_name'],
    'date' => date('M j, g:i A', strtotime($row['created_at'])),
    'timestamp' => date('c', strtotime($row['created_at']))
];

json_success('Transaction details retrieved', $tx);
