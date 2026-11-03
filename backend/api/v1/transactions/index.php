<?php
/**
 * GET /api/v1/transactions/index.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';

$user = require_authenticated_user();

$limit = min((int) ($_GET['limit'] ?? 20), 100);
$category = sanitize_string($_GET['category'] ?? '');
$search = sanitize_string($_GET['search'] ?? '');

$txs = get_user_transactions((int) $user['id'], $limit, $category, $search);

json_success('Transactions retrieved successfully', [
    'transactions' => $txs,
    'totalCount' => count($txs)
]);
