<?php
/**
 * GET /api/v1/exchange/rates.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';

$conn = get_db_connection();
$result = $conn->query("SELECT pair, base_currency, quote_currency, rate, change_percentage, is_up, updated_at FROM exchange_rates ORDER BY id ASC");

$rates = [];
while ($row = $result->fetch_assoc()) {
    $rates[] = [
        'pair' => $row['pair'],
        'baseCurrency' => $row['base_currency'],
        'quoteCurrency' => $row['quote_currency'],
        'rate' => (float) $row['rate'],
        'change' => $row['change_percentage'],
        'isUp' => (bool) $row['is_up'],
        'isSimulated' => true,
        'updatedAt' => date('c', strtotime($row['updated_at']))
    ];
}

json_success('Simulated market exchange rates retrieved', ['rates' => $rates]);
