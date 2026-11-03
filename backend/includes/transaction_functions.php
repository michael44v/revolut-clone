<?php
/**
 * Procedural Transaction, Transfer and Currency Exchange Functions
 * Double-Entry Accounting with strict atomicity and idempotency.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/wallet_functions.php';
require_once __DIR__ . '/notification_functions.php';

function get_user_transactions(int $userId, int $limit = 30, ?string $category = null, ?string $search = null): array {
    $conn = get_db_connection();

    $query = "SELECT transaction_uid as id, title, subtitle, category, icon_name, type, status, currency, symbol, amount_minor, fee_minor, reference, counterparty_name, created_at FROM transactions WHERE user_id = ?";
    $types = "i";
    $params = [$userId];

    if ($category && $category !== 'All') {
        if ($category === 'Income') {
            $query .= " AND amount_minor > 0";
        } elseif ($category === 'Transfers') {
            $query .= " AND category IN ('Transfer', 'Deposit')";
        } elseif ($category === 'Shopping') {
            $query .= " AND category IN ('Shopping', 'Food')";
        } elseif ($category === 'Exchange') {
            $query .= " AND category = 'Exchange'";
        }
    }

    if ($search) {
        $query .= " AND (title LIKE ? OR reference LIKE ? OR subtitle LIKE ?)";
        $searchTerm = "%{$search}%";
        $types .= "sss";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $query .= " ORDER BY id DESC LIMIT ?";
    $types .= "i";
    $params[] = $limit;

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();

    $transactions = [];
    while ($row = $res->fetch_assoc()) {
        $amountMinor = (int) $row['amount_minor'];
        $amount = minor_to_amount($amountMinor);

        $transactions[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'],
            'category' => $row['category'],
            'iconName' => $row['icon_name'],
            'type' => $row['type'],
            'status' => $row['status'],
            'currency' => $row['currency'],
            'symbol' => $row['symbol'],
            'amount' => $amount,
            'amountMinor' => $amountMinor,
            'fee' => minor_to_amount((int) $row['fee_minor']),
            'reference' => $row['reference'],
            'counterparty' => $row['counterparty_name'],
            'date' => date('M j, g:i A', strtotime($row['created_at'])),
            'timestamp' => date('c', strtotime($row['created_at']))
        ];
    }
    $stmt->close();

    return $transactions;
}

/**
 * Execute outward transfer with double-entry ledger entries
 */
function transfer_send(int $userId, string $recipientName, int $amountMinor, string $currency, ?string $reference = null, ?string $idempotencyKey = null): array {
    $conn = get_db_connection();
    $conn->begin_transaction();

    try {
        $wallet = get_wallet_by_currency($userId, $currency);
        if (!$wallet) {
            throw new Exception("Wallet for {$currency} not found");
        }

        // Lock wallet for update
        $stmtLock = $conn->prepare("SELECT balance_minor FROM wallets WHERE id = ? FOR UPDATE");
        $stmtLock->bind_param("i", $wallet['internalId']);
        $stmtLock->execute();
        $res = $stmtLock->get_result()->fetch_assoc();
        $stmtLock->close();

        $currentBalanceMinor = (int) $res['balance_minor'];
        if ($currentBalanceMinor < $amountMinor) {
            throw new Exception("Insufficient funds in {$currency} wallet");
        }

        $newBalMinor = $currentBalanceMinor - $amountMinor;

        // Deduct from sender wallet
        $stmtUpdate = $conn->prepare("UPDATE wallets SET balance_minor = ? WHERE id = ?");
        $stmtUpdate->bind_param("ii", $newBalMinor, $wallet['internalId']);
        $stmtUpdate->execute();
        $stmtUpdate->close();

        // Transaction record
        $txUid = 'tx_' . time() . '_' . bin2hex(random_bytes(3));
        $title = "Transfer to {$recipientName}";
        $subtitle = $reference ?: 'Personal Transfer';
        $category = 'Transfer';
        $iconName = 'ArrowUpRight';
        $type = 'debit';
        $status = 'completed';
        $symbol = get_currency_symbol($currency);
        $ref = $reference ?: 'TRF-' . substr((string) time(), -6);
        $debitAmountMinor = -$amountMinor;

        $stmtTx = $conn->prepare("INSERT INTO transactions (transaction_uid, user_id, wallet_id, idempotency_key, title, subtitle, category, icon_name, type, status, currency, symbol, amount_minor, reference, counterparty_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtTx->bind_param("siisssssssssiss", $txUid, $userId, $wallet['internalId'], $idempotencyKey, $title, $subtitle, $category, $iconName, $type, $status, $currency, $symbol, $debitAmountMinor, $ref, $recipientName);
        $stmtTx->execute();
        $txId = $stmtTx->insert_id;
        $stmtTx->close();

        // Balanced double-entry entries
        $descDebit = "Transfer debit of {$currency} " . number_format(minor_to_amount($amountMinor), 2);
        $stmtL1 = $conn->prepare("INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount_minor, currency, description) VALUES (?, ?, 'debit', ?, ?, ?)");
        $stmtL1->bind_param("iiiss", $txId, $wallet['internalId'], $amountMinor, $currency, $descDebit);
        $stmtL1->execute();
        $stmtL1->close();

        // Check if recipient is a registered user with a wallet to complete inter-account credit
        $stmtRecip = $conn->prepare("SELECT id FROM users WHERE revtag = ? OR email = ? LIMIT 1");
        $stmtRecip->bind_param("ss", $recipientName, $recipientName);
        $stmtRecip->execute();
        $recipUser = $stmtRecip->get_result()->fetch_assoc();
        $stmtRecip->close();

        if ($recipUser) {
            $recipWallet = get_wallet_by_currency((int) $recipUser['id'], $currency);
            if ($recipWallet) {
                $stmtRecipUpdate = $conn->prepare("UPDATE wallets SET balance_minor = balance_minor + ? WHERE id = ?");
                $stmtRecipUpdate->bind_param("ii", $amountMinor, $recipWallet['internalId']);
                $stmtRecipUpdate->execute();
                $stmtRecipUpdate->close();

                // Recipient ledger entry
                $descCredit = "Transfer received credit from user #{$userId}";
                $stmtL2 = $conn->prepare("INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount_minor, currency, description) VALUES (?, ?, 'credit', ?, ?, ?)");
                $stmtL2->bind_param("iiiss", $txId, $recipWallet['internalId'], $amountMinor, $currency, $descCredit);
                $stmtL2->execute();
                $stmtL2->close();
            }
        }

        $conn->commit();

        create_notification(
            $userId,
            'transfer',
            'Transfer Sent',
            "Sent {$symbol}" . number_format(minor_to_amount($amountMinor), 2) . " to {$recipientName}.",
            'ArrowUpRight'
        );

        return [
            'transaction_uid' => $txUid,
            'wallet' => get_wallet_by_currency($userId, $currency)
        ];
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

/**
 * Currency Exchange with atomic double-entry balance adjustment
 */
function currency_exchange(int $userId, string $fromCurr, string $toCurr, int $fromAmountMinor): array {
    $conn = get_db_connection();
    $conn->begin_transaction();

    try {
        $fromCurr = strtoupper($fromCurr);
        $toCurr = strtoupper($toCurr);

        if ($fromCurr === $toCurr) {
            throw new Exception("Cannot exchange identical currencies");
        }

        $fromWallet = get_wallet_by_currency($userId, $fromCurr);
        $toWallet = get_wallet_by_currency($userId, $toCurr);

        if (!$fromWallet || !$toWallet) {
            throw new Exception("One or both currency wallets do not exist");
        }

        // Fetch direct or calculated exchange rate
        $rates = get_all_rates_to_usd();
        $fromInUsd = $rates[$fromCurr] ?? 1.0;
        $toInUsd = $rates[$toCurr] ?? 1.0;
        $rate = $fromInUsd / $toInUsd;

        $fromAmount = minor_to_amount($fromAmountMinor);
        $toAmount = round($fromAmount * $rate, 2);
        $toAmountMinor = amount_to_minor($toAmount);

        // Lock from-wallet
        $stmtLock = $conn->prepare("SELECT balance_minor FROM wallets WHERE id = ? FOR UPDATE");
        $stmtLock->bind_param("i", $fromWallet['internalId']);
        $stmtLock->execute();
        $currBalMinor = (int) $stmtLock->get_result()->fetch_assoc()['balance_minor'];
        $stmtLock->close();

        if ($currBalMinor < $fromAmountMinor) {
            throw new Exception("Insufficient {$fromCurr} balance for exchange");
        }

        // Deduct source
        $stmtDeduct = $conn->prepare("UPDATE wallets SET balance_minor = balance_minor - ? WHERE id = ?");
        $stmtDeduct->bind_param("ii", $fromAmountMinor, $fromWallet['internalId']);
        $stmtDeduct->execute();
        $stmtDeduct->close();

        // Credit destination
        $stmtCredit = $conn->prepare("UPDATE wallets SET balance_minor = balance_minor + ? WHERE id = ?");
        $stmtCredit->bind_param("ii", $toAmountMinor, $toWallet['internalId']);
        $stmtCredit->execute();
        $stmtCredit->close();

        // Create transaction receipt
        $txUid = 'tx_' . time() . '_' . bin2hex(random_bytes(3));
        $title = "Exchange {$fromCurr} to {$toCurr}";
        $subtitle = "Rate: 1 {$fromCurr} = " . number_format($rate, 4) . " {$toCurr}";
        $category = "Exchange";
        $iconName = "Repeat";
        $type = "exchange";
        $status = "completed";
        $symbol = get_currency_symbol($fromCurr);
        $ref = "FX-{$fromCurr}{$toCurr}-" . substr((string) time(), -6);
        $debitMinor = -$fromAmountMinor;

        $stmtTx = $conn->prepare("INSERT INTO transactions (transaction_uid, user_id, wallet_id, title, subtitle, category, icon_name, type, status, currency, symbol, amount_minor, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtTx->bind_param("siissssssssis", $txUid, $userId, $fromWallet['internalId'], $title, $subtitle, $category, $iconName, $type, $status, $fromCurr, $symbol, $debitMinor, $ref);
        $stmtTx->execute();
        $txId = $stmtTx->insert_id;
        $stmtTx->close();

        // Balanced double entry entries
        $descDeduct = "Exchange outflow: {$fromCurr} " . number_format($fromAmount, 2);
        $stmtL1 = $conn->prepare("INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount_minor, currency, description) VALUES (?, ?, 'debit', ?, ?, ?)");
        $stmtL1->bind_param("iiiss", $txId, $fromWallet['internalId'], $fromAmountMinor, $fromCurr, $descDeduct);
        $stmtL1->execute();
        $stmtL1->close();

        $descAdd = "Exchange inflow: {$toCurr} " . number_format($toAmount, 2);
        $stmtL2 = $conn->prepare("INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount_minor, currency, description) VALUES (?, ?, 'credit', ?, ?, ?)");
        $stmtL2->bind_param("iiiss", $txId, $toWallet['internalId'], $toAmountMinor, $toCurr, $descAdd);
        $stmtL2->execute();
        $stmtL2->close();

        $conn->commit();

        create_notification(
            $userId,
            'account',
            'Currency Exchanged',
            "Swapped {$symbol}" . number_format($fromAmount, 2) . " to " . get_currency_symbol($toCurr) . number_format($toAmount, 2) . " at " . number_format($rate, 4) . ".",
            'Repeat'
        );

        return [
            'fromWallet' => get_wallet_by_currency($userId, $fromCurr),
            'toWallet' => get_wallet_by_currency($userId, $toCurr),
            'fromCurrency' => $fromCurr,
            'toCurrency' => $toCurr,
            'fromAmount' => $fromAmount,
            'toAmount' => $toAmount,
            'rate' => $rate,
            'transaction_uid' => $txUid
        ];
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}
