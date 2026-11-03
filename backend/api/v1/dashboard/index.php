<?php
/**
 * GET /api/v1/dashboard/index.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';
require_once __DIR__ . '/../../../includes/wallet_functions.php';
require_once __DIR__ . '/../../../includes/transaction_functions.php';
require_once __DIR__ . '/../../../includes/notification_functions.php';
require_once __DIR__ . '/../../../includes/functions.php';

$user = require_authenticated_user();
$userId = (int) $user['id'];

$walletsData = get_user_wallets($userId);
$recentTxs = get_user_transactions($userId, 6);
$analytics = get_analytics_summary($userId);
$notifs = get_user_notifications($userId, 10);
$cards = get_user_cards($userId);

json_success('Dashboard state retrieved', [
    'user' => [
        'id' => $user['user_uid'],
        'name' => $user['name'],
        'email' => $user['email'],
        'avatar' => $user['avatar_url'],
        'tag' => $user['revtag'],
        'tier' => $user['tier'],
        'isDemo' => (bool) $user['is_demo']
    ],
    'wallets' => $walletsData['wallets'],
    'totalUsdEquivalent' => $walletsData['totalUsdEquivalent'],
    'transactions' => $recentTxs,
    'analytics' => $analytics,
    'notifications' => $notifs['notifications'],
    'unreadNotificationsCount' => $notifs['unreadCount'],
    'cards' => $cards
]);
