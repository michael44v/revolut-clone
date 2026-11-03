<?php
/**
 * Procedural Card & Analytics helper functions
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/notification_functions.php';

function get_user_cards(int $userId): array {
    $conn = get_db_connection();
    $stmt = $conn->prepare("SELECT card_uid as id, type, brand, card_number_masked, card_number_encrypted, expiry, cvv, cardholder_name, is_frozen, gradient_start, gradient_end, accent_color, monthly_limit_minor, current_spend_minor, contactless_enabled, online_payments_enabled FROM cards WHERE user_id = ? ORDER BY id ASC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();

    $cards = [];
    while ($row = $res->fetch_assoc()) {
        $cards[] = [
            'id' => $row['id'],
            'type' => $row['type'],
            'brand' => $row['brand'],
            'cardNumberMasked' => $row['card_number_masked'],
            'fullCardNumber' => chunk_split($row['card_number_encrypted'], 4, ' '),
            'expiry' => $row['expiry'],
            'cvv' => $row['cvv'],
            'cardholderName' => $row['cardholder_name'],
            'isFrozen' => (bool) $row['is_frozen'],
            'colorGradient' => [$row['gradient_start'], $row['gradient_end']],
            'accentColor' => $row['accent_color'],
            'monthlyLimit' => minor_to_amount((int) $row['monthly_limit_minor']),
            'currentSpend' => minor_to_amount((int) $row['current_spend_minor']),
            'contactlessEnabled' => (bool) $row['contactless_enabled'],
            'onlinePaymentsEnabled' => (bool) $row['online_payments_enabled']
        ];
    }
    $stmt->close();
    return $cards;
}

function toggle_card_freeze(int $userId, string $cardUid): ?array {
    $conn = get_db_connection();
    $stmt = $conn->prepare("SELECT id, brand, card_number_masked, is_frozen FROM cards WHERE user_id = ? AND card_uid = ? LIMIT 1");
    $stmt->bind_param("is", $userId, $cardUid);
    $stmt->execute();
    $res = $stmt->get_result();
    $card = $res->fetch_assoc();
    $stmt->close();

    if (!$card) return null;

    $newStatus = $card['is_frozen'] ? 0 : 1;
    $stmtUpdate = $conn->prepare("UPDATE cards SET is_frozen = ? WHERE id = ?");
    $stmtUpdate->bind_param("ii", $newStatus, $card['id']);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    $statusWord = $newStatus ? 'frozen' : 'unfrozen';
    create_notification(
        $userId,
        'card',
        $newStatus ? 'Card Frozen' : 'Card Unfrozen',
        "{$card['brand']} card ({$card['card_number_masked']}) has been {$statusWord}.",
        'CreditCard'
    );

    $cards = get_user_cards($userId);
    foreach ($cards as $c) {
        if ($c['id'] === $cardUid) return $c;
    }
    return null;
}

function get_analytics_summary(int $userId): array {
    $conn = get_db_connection();

    // Sum positive and negative movements for the user
    $stmt = $conn->prepare("SELECT
        COALESCE(SUM(CASE WHEN amount_minor < 0 THEN ABS(amount_minor) ELSE 0 END), 0) as total_spent_minor,
        COALESCE(SUM(CASE WHEN amount_minor > 0 THEN amount_minor ELSE 0 END), 0) as total_income_minor
        FROM transactions WHERE user_id = ? AND status = 'completed'");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $spent = minor_to_amount((int) $row['total_spent_minor']);
    $income = minor_to_amount((int) $row['total_income_minor']);

    // Breakdown by category
    $stmtCat = $conn->prepare("SELECT category, COALESCE(SUM(ABS(amount_minor)), 0) as cat_spend_minor FROM transactions WHERE user_id = ? AND amount_minor < 0 AND status = 'completed' GROUP BY category ORDER BY cat_spend_minor DESC LIMIT 5");
    $stmtCat->bind_param("i", $userId);
    $stmtCat->execute();
    $catRes = $stmtCat->get_result();

    $colors = ['#635BFF', '#F59E0B', '#0EA5E9', '#10B981', '#EC4899'];
    $categories = [];
    $i = 0;
    while ($cRow = $catRes->fetch_assoc()) {
        $catSpend = minor_to_amount((int) $cRow['cat_spend_minor']);
        $pct = $spent > 0 ? round(($catSpend / $spent) * 100) : 0;
        $categories[] = [
            'name' => $cRow['category'],
            'amount' => $catSpend,
            'percentage' => (int) $pct,
            'color' => $colors[$i % count($colors)]
        ];
        $i++;
    }
    $stmtCat->close();

    if (empty($categories)) {
        $categories = [
            ['name' => 'Shopping', 'amount' => 1140, 'percentage' => 40, 'color' => '#635BFF'],
            ['name' => 'Food & Dining', 'amount' => 620, 'percentage' => 22, 'color' => '#F59E0B'],
            ['name' => 'Bills & Utilities', 'amount' => 510, 'percentage' => 18, 'color' => '#0EA5E9'],
            ['name' => 'Entertainment', 'amount' => 320, 'percentage' => 11, 'color' => '#EC4899'],
            ['name' => 'Transport', 'amount' => 250.5, 'percentage' => 9, 'color' => '#10B981'],
        ];
    }

    return [
        'totalSpent' => $spent,
        'totalIncome' => $income,
        'currency' => 'USD',
        'symbol' => '$',
        'categories' => $categories,
        'weeklyTrends' => [
            ['day' => 'Mon', 'amount' => 45],
            ['day' => 'Tue', 'amount' => 120],
            ['day' => 'Wed', 'amount' => 80],
            ['day' => 'Thu', 'amount' => 210],
            ['day' => 'Fri', 'amount' => 340],
            ['day' => 'Sat', 'amount' => 190],
            ['day' => 'Sun', 'amount' => 95],
        ]
    ];
}
