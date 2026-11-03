-- Schema for Revolut-Inspired Fintech Backend (Procedural PHP & MySQLi)
-- Stores financial balances as integer minor units (e.g. cents) exclusively.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_settings`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `cards`;
DROP TABLE IF EXISTS `exchange_rates`;
DROP TABLE IF EXISTS `transfer_requests`;
DROP TABLE IF EXISTS `ledger_entries`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `wallets`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users table
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_uid` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `revtag` VARCHAR(64) NOT NULL UNIQUE,
  `kyc_status` ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'verified',
  `tier` VARCHAR(50) DEFAULT 'Standard',
  `is_demo` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_revtag` (`revtag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Sessions / Refresh tokens table
CREATE TABLE `user_sessions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `refresh_token_hash` VARCHAR(64) NOT NULL,
  `device_name` VARCHAR(100) DEFAULT 'Mobile App',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `is_revoked` TINYINT(1) DEFAULT 0,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_user` (`user_id`),
  INDEX `idx_sessions_token` (`refresh_token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Wallets table
CREATE TABLE `wallets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `wallet_uid` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NOT NULL,
  `currency` VARCHAR(4) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `symbol` VARCHAR(8) NOT NULL,
  `flag` VARCHAR(8) NOT NULL,
  `balance_minor` BIGINT NOT NULL DEFAULT 0,
  `is_primary` TINYINT(1) DEFAULT 0,
  `account_number` VARCHAR(32) DEFAULT NULL,
  `routing_number` VARCHAR(32) DEFAULT NULL,
  `iban` VARCHAR(40) DEFAULT NULL,
  `bic` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('active', 'frozen', 'closed') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_currency` (`user_id`, `currency`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_wallets_user` (`user_id`),
  INDEX `idx_wallets_currency` (`currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Transactions table
CREATE TABLE `transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `transaction_uid` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NOT NULL,
  `wallet_id` INT UNSIGNED DEFAULT NULL,
  `idempotency_key` VARCHAR(128) DEFAULT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `subtitle` VARCHAR(200) DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'General',
  `icon_name` VARCHAR(50) DEFAULT 'ArrowUpRight',
  `type` ENUM('debit', 'credit', 'exchange', 'fee') NOT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'completed',
  `currency` VARCHAR(4) NOT NULL,
  `symbol` VARCHAR(8) NOT NULL,
  `amount_minor` BIGINT NOT NULL,
  `fee_minor` BIGINT NOT NULL DEFAULT 0,
  `reference` VARCHAR(100) NOT NULL,
  `counterparty_name` VARCHAR(150) DEFAULT NULL,
  `metadata_json` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE SET NULL,
  INDEX `idx_transactions_user` (`user_id`),
  INDEX `idx_transactions_wallet` (`wallet_id`),
  INDEX `idx_transactions_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Double-entry ledger entries table
CREATE TABLE `ledger_entries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` INT UNSIGNED NOT NULL,
  `wallet_id` INT UNSIGNED DEFAULT NULL,
  `entry_type` ENUM('debit', 'credit') NOT NULL,
  `amount_minor` BIGINT NOT NULL,
  `currency` VARCHAR(4) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE SET NULL,
  INDEX `idx_ledger_tx` (`transaction_id`),
  INDEX `idx_ledger_wallet` (`wallet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Transfer Requests table
CREATE TABLE `transfer_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `request_uid` VARCHAR(64) NOT NULL UNIQUE,
  `requester_id` INT UNSIGNED NOT NULL,
  `payer_id` INT UNSIGNED DEFAULT NULL,
  `payer_identifier` VARCHAR(191) NOT NULL,
  `amount_minor` BIGINT NOT NULL,
  `currency` VARCHAR(4) NOT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_requests_requester` (`requester_id`),
  INDEX `idx_requests_payer` (`payer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Exchange Rates table
CREATE TABLE `exchange_rates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `pair` VARCHAR(10) NOT NULL UNIQUE,
  `base_currency` VARCHAR(4) NOT NULL,
  `quote_currency` VARCHAR(4) NOT NULL,
  `rate` DECIMAL(14, 6) NOT NULL,
  `change_percentage` VARCHAR(16) NOT NULL DEFAULT '0.00%',
  `is_up` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Cards table
CREATE TABLE `cards` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `card_uid` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'Virtual',
  `brand` VARCHAR(30) NOT NULL DEFAULT 'Visa',
  `card_number_masked` VARCHAR(30) NOT NULL,
  `card_number_encrypted` VARCHAR(255) NOT NULL,
  `expiry` VARCHAR(8) NOT NULL,
  `cvv` VARCHAR(4) NOT NULL,
  `cardholder_name` VARCHAR(150) NOT NULL,
  `is_frozen` TINYINT(1) DEFAULT 0,
  `gradient_start` VARCHAR(20) DEFAULT '#1F232F',
  `gradient_end` VARCHAR(20) DEFAULT '#0B0C10',
  `accent_color` VARCHAR(20) DEFAULT '#635BFF',
  `monthly_limit_minor` BIGINT DEFAULT 500000,
  `current_spend_minor` BIGINT DEFAULT 0,
  `contactless_enabled` TINYINT(1) DEFAULT 1,
  `online_payments_enabled` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_cards_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notifications table
CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `notification_uid` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'account',
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'Bell',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifs_user` (`user_id`),
  INDEX `idx_notifs_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. User Settings table
CREATE TABLE `user_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `theme_mode` ENUM('light', 'dark', 'system') DEFAULT 'system',
  `biometrics_enabled` TINYINT(1) DEFAULT 0,
  `push_notifications_enabled` TINYINT(1) DEFAULT 1,
  `email_notifications_enabled` TINYINT(1) DEFAULT 1,
  `hide_balances_default` TINYINT(1) DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
