<?php
/**
 * Main API Entry Point & Router for Local Built-in Server or Shared Hosting
 */

require_once __DIR__ . '/config/cors.php';
handle_cors();

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// If request points directly to a real php file, let PHP handle it
$filePath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath) && str_ends_with($filePath, '.php')) {
    require $filePath;
    exit;
}

// Clean up base path
$route = preg_replace('#^/api/v1/#', '', $uri);
$route = trim($route, '/');

$routeMap = [
    'auth/register' => 'api/v1/auth/register.php',
    'auth/login' => 'api/v1/auth/login.php',
    'auth/logout' => 'api/v1/auth/logout.php',
    'auth/me' => 'api/v1/auth/me.php',
    'users/profile' => 'api/v1/users/profile.php',
    'users/update_profile' => 'api/v1/users/update_profile.php',
    'wallets' => 'api/v1/wallets/index.php',
    'wallets/details' => 'api/v1/wallets/details.php',
    'wallets/transactions' => 'api/v1/wallets/transactions.php',
    'transactions' => 'api/v1/transactions/index.php',
    'transactions/details' => 'api/v1/transactions/details.php',
    'transfers/send' => 'api/v1/transfers/send.php',
    'transfers/request' => 'api/v1/transfers/request.php',
    'transfers/history' => 'api/v1/transfers/history.php',
    'exchange/rates' => 'api/v1/exchange/rates.php',
    'exchange/convert' => 'api/v1/exchange/convert.php',
    'cards' => 'api/v1/cards/index.php',
    'cards/details' => 'api/v1/cards/details.php',
    'cards/update_status' => 'api/v1/cards/update_status.php',
    'analytics/dashboard' => 'api/v1/analytics/dashboard.php',
    'notifications' => 'api/v1/notifications/index.php',
    'notifications/mark_read' => 'api/v1/notifications/mark_read.php',
    'notifications/mark_all_read' => 'api/v1/notifications/mark_all_read.php',
    'dashboard' => 'api/v1/dashboard/index.php',
];

if (isset($routeMap[$route])) {
    require __DIR__ . '/' . $routeMap[$route];
    exit;
}

// Default root response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode([
    'success' => true,
    'message' => 'Revolut-Inspired FinTech Procedural PHP REST API v1 is active',
    'data' => [
        'version' => '1.0.0',
        'status' => 'healthy',
        'engine' => 'PHP ' . PHP_VERSION,
        'database' => 'MySQLi (Prepared Statements)'
    ]
], JSON_PRETTY_PRINT);
