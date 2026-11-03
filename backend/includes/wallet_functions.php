<?php
/**
 * Procedural Wallet and Multi-Currency Ledger Functions
 * Double-Entry Accounting Architecture using integer minor units exclusively.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/notification_functions.php';

function get_user_wallets(int $userId): array {
    $conn = get_db_connection();
    $stmt = $conn->prepare("SELECT id, wallet_uid, currency, name, symbol, flag, balance_minor, is_primary, account_number, routing_number, iban, bic, status FROM wallets WHERE user_id = ? ORDER BY is_primary DESC, id ASC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();

    $wallets = [];
    $totalUsdEquivalent = 0.0;

    // Rates map relative to USD
    $rates = get_all_rates_to_usd();

    while ($row = $res->fetch_assoc()) {
        $currency = $row['currency'];
        $balance = minor_to_amount((int) $row['balance_minor']);

        // Convert balance to USD equivalent
        $rateToUsd = $rates[$currency] ?? 1.0;
        $totalUsdEquivalent += ($balance * $rateToUsd);

        $wallets[] = [
            'id' => $row['wallet_uid'],
            'internalId' => (int) $row['id'],
            'currency' => $row['currency'],
            'name' => $row['name'],
            'symbol' => $row['symbol'],
            'flag' => $row['flag'],
            'balance' => $balance,
            'minorUnits' => (int) $row['balance_minor'],
            'isPrimary' => (bool) $row['is_primary'],
            'accountNumber' => $row['account_number'],
            'routingNumber' => $row['routing_number'],
            'iban' => $row['iban'],
            'bic' => $row['bic'],
            'status' => $row['status']
        ];
    }
    $stmt->close();

    return [
        'wallets' => $wallets,
        'totalUsdEquivalent' => round($totalUsdEquivalent, 2)
    ];
}

function get_wallet_by_currency(int $userId, string $currency): ?array {
    $conn = get_db_connection();
    $currency = strtoupper($currency);

    $stmt = $conn->prepare("SELECT id, wallet_uid, currency, name, symbol, flag, balance_minor, is_primary, account_number, routing_number, iban, bic, status FROM wallets WHERE user_id = ? AND currency = ? LIMIT 1");
    $stmt->bind_param("is", $userId, $currency);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();

    if (!$row) return null;

    return [
        'id' => $row['wallet_uid'],
        'internalId' => (int) $row['id'],
        'currency' => $row['currency'],
        'name' => $row['name'],
        'symbol' => $row['symbol'],
        'flag' => $row['flag'],
        'balance' => minor_to_amount((int) $row['balance_minor']),
        'minorUnits' => (int) $row['balance_minor'],
        'isPrimary' => (bool) $row['is_primary'],
        'accountNumber' => $row['account_number'],
        'routingNumber' => $row['routing_number'],
        'iban' => $row['iban'],
        'bic' => $row['bic'],
        'status' => $row['status']
    ];
}

function get_all_rates_to_usd(): array {
    $conn = get_db_connection();
    $result = $conn->query("SELECT pair, rate FROM exchange_rates WHERE quote_currency = 'USD'");
    $rates = ['USD' => 1.0];
    if ($result) {
        while ($r = $result->fetch_assoc()) {
            $base = explode('/', $r['pair'])[0];
            $rates[$base] = (float) $r['rate'];
        }
    }
    if (!isset($rates['GBP'])) $rates['GBP'] = 1.2915;
    if (!isset($rates['EUR'])) $rates['EUR'] = 1.0824;
    if (!isset($rates['NGN'])) $rates['NGN'] = 0.000673;
    return $rates;
}

function initialize_user_starter_wallets(int $userId): void {
    $conn = get_db_connection();

    $starterWallets = [
        ['USD', 'US Dollar', '$', '🇺🇸', 10000, 1, '9102837461', '021000021', 'US89BANK0210000219102837461', 'REVUS33X'],
        ['GBP', 'British Pound', '£', '🇬🇧', 5000, 0, '58392019', '04-00-75', 'GB29REVO04007558392019', 'REVOGB2L'],
        ['EUR', 'Euro', '€', '🇪🇺', 5000, 0, '1029384756', NULL, 'LT12325000001029384756', 'REVOLT21'],
        ['NGN', 'Nigerian Naira', '₦', '🇳🇬', 5000000, 0, '0987654321', NULL, 'NG02REV0987654321', 'REVONG22']
    ];

    $stmt = $conn->prepare("INSERT INTO wallets (wallet_uid, user_id, currency, name, symbol, flag, balance_minor, is_primary, account_number, routing_number, iban, bic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($starterWallets as $w) {
        $walletUid = 'wlt_' . strtolower($w[0]) . '_' . bin2hex(random_bytes(4));
        $stmt->bind_param("sissssiiisss", $walletUid, $userId, $w[0], $w[1], $w[2], $w[3], $w[4], $w[5], $w[6], $w[7], $w[8], $w[9]);
        $stmt->execute();
    }
    $stmt->close();
}

/**
 * Add simulated deposit to wallet with double-entry ledger entry
 */
function wallet_deposit(int $userId, string $currency, int $amountMinor, ?string $idempotencyKey = null): array {
    $conn = get_db_connection();
    $conn->begin_transaction();

    try {
        $wallet = get_wallet_by_currency($userId, $currency);
        if (!$wallet) {
            throw new Exception("Wallet for {$currency} not found");
        }

        // Lock wallet record for update
        $stmtLock = $conn->prepare("SELECT balance_minor FROM wallets WHERE id = ? FOR UPDATE");
        $stmtLock->bind_param("i", $wallet['internalId']);
        $stmtLock->execute();
        $lockRes = $stmtLock->get_result()->fetch_assoc();
        $stmtLock->close();

        $newBalMinor = (int) $lockRes['balance_minor'] + $amountMinor;

        // Update wallet
        $stmtUpdate = $conn->prepare("UPDATE wallets SET balance_minor = ? WHERE id = ?");
        $stmtUpdate->bind_param("ii", $newBalMinor, $wallet['internalId']);
        $stmtUpdate->execute();
        $stmtUpdate->close();

        // Create transaction record
        $txUid = 'tx_' . time() . '_' . bin2hex(random_bytes(3));
        $title = "Deposit to {$currency} Wallet";
        $subtitle = "Simulated Card Deposit";
        $category = "Deposit";
        $iconName = "ArrowDownLeft";
        $type = "credit";
        $status = "completed";
        $symbol = get_currency_symbol($currency);
        $reference = 'DEP-' . $currency . '-' . substr((string) time(), -6);

        $stmtTx = $conn->prepare("INSERT INTO transactions (transaction_uid, user_id, wallet_id, idempotency_key, title, subtitle, category, icon_name, type, status, currency, symbol, amount_minor, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtTx->bind_param("siisssssssssis", $txUid, $userId, $wallet['internalId'], $idempotencyKey, $title, $subtitle, $category, $iconName, $type, $status, $currency, $symbol, $amountMinor, $reference);
        $stmtTx->execute();
        $txInternalId = $stmtTx->insert_id;
        $stmtTx->close();

        // Create double-entry ledger credit
        $desc = "Deposit credit to {$currency} wallet";
        $stmtLedger = $conn->prepare("INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount_minor, currency, description) VALUES (?, ?, 'credit', ?, ?, ?)");
        $stmtLedger->bind_param("iiiss", $txInternalId, $wallet['internalId'], $amountMinor, $currency, $desc);
        $stmtLedger->execute();
        $stmtLedger->close();

        $conn->commit();

        create_notification(
            $userId,
            'transfer',
            'Funds Added',
            "Successfully deposited {$symbol}" . number_format(minor_to_amount($amountMinor), 2) . " into your {$currency} wallet.",
            'ArrowDownLeft'
        );

        $updatedWallet = get_wallet_by_currency($userId, $currency);
        return [
            'wallet' => $updatedWallet,
            'transaction_uid' => $txUid
        ];
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}
