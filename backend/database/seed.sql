SET NAMES utf8mb4;
-- Seed Data for Revolut-Inspired Fintech Backend
-- Demo user: alex.rivera@example.com / demo123
-- Balances: USD $5,250.00 (525000), GBP £1,850.00 (185000), EUR €2,400.00 (240000), NGN ₦3,500,000.00 (350000000)

-- 1. Demo User
INSERT INTO `users` (
  `id`, `user_uid`, `name`, `email`, `password_hash`, `phone`, `avatar_url`, `revtag`, `kyc_status`, `tier`, `is_demo`
) VALUES (
  1,
  'usr_demo_1001',
  'Alex Rivera',
  'alex.rivera@example.com',
  '$2y$10$35YJkNtgVbHToHJSyAQb/O5g1EuY5t3XxbU6gw0eDzCwWfYjfqjb.',
  '+1 (555) 234-5678',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  '@alexrivera',
  'verified',
  'Metal Premium',
  1
) ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 2. Demo User Settings
INSERT INTO `user_settings` (
  `user_id`, `theme_mode`, `biometrics_enabled`, `push_notifications_enabled`, `email_notifications_enabled`, `hide_balances_default`
) VALUES (
  1, 'system', 1, 1, 1, 0
) ON DUPLICATE KEY UPDATE `theme_mode` = VALUES(`theme_mode`);

-- 3. Demo User Wallets (Integer minor units)
INSERT INTO `wallets` (
  `id`, `wallet_uid`, `user_id`, `currency`, `name`, `symbol`, `flag`, `balance_minor`, `is_primary`, `account_number`, `routing_number`, `iban`, `bic`
) VALUES
(
  1, 'wlt_usd_01', 1, 'USD', 'US Dollar', '$', '🇺🇸', 525000, 1, '8392019481', '021000021', 'US89BANK0210000218392019481', 'REVUS33X'
),
(
  2, 'wlt_gbp_02', 1, 'GBP', 'British Pound', '£', '🇬🇧', 185000, 0, '49201934', '04-00-75', 'GB29REVO04007549201934', 'REVOGB2L'
),
(
  3, 'wlt_eur_03', 1, 'EUR', 'Euro', '€', '🇪🇺', 240000, 0, '9284729104', NULL, 'LT12325000009284729104', 'REVOLT21'
),
(
  4, 'wlt_ngn_04', 1, 'NGN', 'Nigerian Naira', '₦', '🇳🇬', 350000000, 0, '0129482910', NULL, 'NG02REV0129482910', 'REVONG22'
) ON DUPLICATE KEY UPDATE `balance_minor` = VALUES(`balance_minor`);

-- 4. Exchange Rates (Fixed base rates relative to USD)
INSERT INTO `exchange_rates` (`pair`, `base_currency`, `quote_currency`, `rate`, `change_percentage`, `is_up`) VALUES
('EUR/USD', 'EUR', 'USD', 1.082400, '+0.15%', 1),
('USD/EUR', 'USD', 'EUR', 0.923873, '-0.15%', 0),
('GBP/USD', 'GBP', 'USD', 1.291500, '+0.32%', 1),
('USD/GBP', 'USD', 'GBP', 0.774293, '-0.32%', 0),
('USD/NGN', 'USD', 'NGN', 1485.000000, '-0.40%', 0),
('NGN/USD', 'NGN', 'USD', 0.000673, '+0.40%', 1),
('EUR/GBP', 'EUR', 'GBP', 0.838095, '-0.17%', 0),
('GBP/EUR', 'GBP', 'EUR', 1.193182, '+0.17%', 1),
('BTC/USD', 'BTC', 'USD', 94250.000000, '+2.85%', 1)
ON DUPLICATE KEY UPDATE `rate` = VALUES(`rate`);

-- 5. Cards for Demo User
INSERT INTO `cards` (
  `id`, `card_uid`, `user_id`, `type`, `brand`, `card_number_masked`, `card_number_encrypted`, `expiry`, `cvv`, `cardholder_name`, `is_frozen`, `gradient_start`, `gradient_end`, `accent_color`, `monthly_limit_minor`, `current_spend_minor`
) VALUES
(
  1, 'crd_01', 1, 'Virtual', 'Visa', '•••• •••• •••• 4892', '4532892019384892', '09/28', '842', 'ALEX RIVERA', 0, '#1F232F', '#0B0C10', '#635BFF', 500000, 134250
),
(
  2, 'crd_02', 1, 'Disposable Virtual', 'Mastercard', '•••• •••• •••• 8310', '5399281049208310', '05/26', '193', 'ALEX RIVERA', 0, '#E11D48', '#881337', '#FDA4AF', 100000, 14520
) ON DUPLICATE KEY UPDATE `cardholder_name` = VALUES(`cardholder_name`);

-- 6. Initial Demo Transactions
INSERT INTO `transactions` (
  `id`, `transaction_uid`, `user_id`, `wallet_id`, `idempotency_key`, `title`, `subtitle`, `category`, `icon_name`, `type`, `status`, `currency`, `symbol`, `amount_minor`, `reference`, `counterparty_name`
) VALUES
(
  1, 'tx_982103', 1, 1, 'idem_01', 'Apple Store Regent St', 'Electronics & Gadgets', 'Shopping', 'Smartphone', 'debit', 'completed', 'USD', '$', -12900, 'APL*PAY-948291', 'Apple Store'
),
(
  2, 'tx_982102', 1, 1, 'idem_02', 'Salary Deposit - TechCorp', 'Monthly Payroll Transfer', 'Income', 'ArrowDownLeft', 'credit', 'completed', 'USD', '$', 450000, 'SALARY/2025-05/TECHCORP', 'TechCorp Inc.'
),
(
  3, 'tx_982101', 1, 1, 'idem_03', 'Starbucks Coffee', 'Food & Drinks', 'Food', 'Coffee', 'debit', 'completed', 'USD', '$', -675, 'SBUX*10492-SEATTLE', 'Starbucks'
),
(
  4, 'tx_982100', 1, 1, 'idem_04', 'Spotify Subscription', 'Recurring Subscription', 'Entertainment', 'Music', 'debit', 'completed', 'USD', '$', -1099, 'RECURRING*SPOTIFY-PREM', 'Spotify AB'
),
(
  5, 'tx_982099', 1, 1, 'idem_05', 'Transferred to Sarah Jenkins', 'Dinner split 🍕', 'Transfer', 'ArrowUpRight', 'debit', 'completed', 'USD', '$', -4500, 'SPLIT-DINNER-REV99', 'Sarah Jenkins'
),
(
  6, 'tx_982098', 1, 1, 'idem_06', 'Currency Exchange (USD to EUR)', 'Simulated Exchange Rate 0.92', 'Exchange', 'Repeat', 'exchange', 'completed', 'USD', '$', -50000, 'FX-USDEUR-202598', 'Internal Treasury'
) ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 7. Double-entry Ledger entries corresponding to the transactions
INSERT INTO `ledger_entries` (
  `transaction_id`, `wallet_id`, `entry_type`, `amount_minor`, `currency`, `description`
) VALUES
(1, 1, 'debit', 12900, 'USD', 'Apple Store Regent St debit'),
(2, 1, 'credit', 450000, 'USD', 'Salary deposit credit'),
(3, 1, 'debit', 675, 'USD', 'Starbucks purchase debit'),
(4, 1, 'debit', 1099, 'USD', 'Spotify subscription debit'),
(5, 1, 'debit', 4500, 'USD', 'Sarah Jenkins transfer debit'),
(6, 1, 'debit', 50000, 'USD', 'Currency exchange source debit'),
(6, 3, 'credit', 46000, 'EUR', 'Currency exchange destination credit');

-- 8. Notifications
INSERT INTO `notifications` (
  `notification_uid`, `user_id`, `type`, `title`, `message`, `icon`, `is_read`
) VALUES
('notif_01', 1, 'security', 'Security Alert: New Sign-in', 'A successful simulation sign-in was recognized on your account.', 'Shield', 0),
('notif_02', 1, 'transfer', 'Payment Received', 'Salary transfer from TechCorp was settled into your USD wallet.', 'ArrowDownLeft', 0),
('notif_03', 1, 'card', 'Card Payment Approved', '$129.00 spent at Apple Store Regent St with Virtual Visa ••4892.', 'CreditCard', 1),
('notif_04', 1, 'account', 'Exchange Rate Watch', 'EUR/USD rose 0.15% to 1.0824 in today’s financial session.', 'Repeat', 1);
