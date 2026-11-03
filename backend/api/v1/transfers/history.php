<?php
/**
 * GET /api/v1/transfers/history.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';

$user = require_authenticated_user();
$limit = min((int) ($_GET['limit'] ?? 30), 100);

$txs = get_user_transactions((int) $user['id'], $limit, 'Transfers');

json_success('Transfer history retrieved', ['transfers' => $txs]);
