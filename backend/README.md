# Revolut FinTech Backend API (Procedural PHP & MySQLi)

This backend implements a RESTful JSON API using **pure procedural PHP 8.2+ and MySQLi exclusively**. It enforces double-entry ledger bookkeeping, integer minor unit arithmetic, and JWT authentication without any PHP frameworks, ORMs, PDO, or MVC patterns.

---

## 📁 Architecture & Directory Structure

```text
backend/
├── config/
│   ├── database.php          # Reusable MySQLi connection with prepared statements
│   ├── app.php               # Environment configuration and JWT secrets
│   └── cors.php              # Strict CORS & preflight header handler
│
├── includes/
│   ├── response.php          # JSON envelope formatting helpers
│   ├── auth.php              # JWT verification, user retrieval, session management
│   ├── jwt.php               # Standards-compliant HMAC-SHA256 JWT encoder/decoder
│   ├── validation.php        # Input sanitization and minor unit conversions
│   ├── functions.php         # Cards, analytics, and auxiliary functions
│   ├── wallet_functions.php  # Authoritative wallet balance management & deposits
│   ├── transaction_functions.php # Atomic transfers & currency exchanges
│   ├── notification_functions.php# Notification management
│   └── security.php          # Rate limiting & security safeguards
│
├── api/
│   └── v1/
│       ├── auth/             # register.php, login.php, logout.php, me.php
│       ├── users/            # profile.php, update_profile.php
│       ├── wallets/          # index.php, details.php, transactions.php
│       ├── transactions/     # index.php, details.php
│       ├── transfers/        # send.php, request.php, history.php
│       ├── exchange/         # rates.php, convert.php
│       ├── cards/            # index.php, details.php, update_status.php
│       ├── analytics/        # dashboard.php
│       ├── notifications/    # index.php, mark_read.php, mark_all_read.php
│       └── dashboard/        # index.php
│
├── database/
│   ├── schema.sql            # Normalized 10-table schema (integer minor units)
│   └── seed.sql              # Seed data for demo user and market rates
│
├── .htaccess                 # Apache rewrite configuration for REST endpoints
├── .env.example              # Sample environment configuration
├── index.php                 # Direct request router
└── README.md
```

---

## 🗄️ Database Setup

1. **Create Database & User in MySQL/MariaDB:**
   ```sql
   CREATE DATABASE fintech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'fintech_user'@'localhost' IDENTIFIED BY 'fintech_secret_pass_123';
   GRANT ALL PRIVILEGES ON fintech_db.* TO 'fintech_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Run Migrations & Seed:**
   ```bash
   mysql --default-character-set=utf8mb4 -u fintech_user -pfintech_secret_pass_123 fintech_db < backend/database/schema.sql
   mysql --default-character-set=utf8mb4 -u fintech_user -pfintech_secret_pass_123 fintech_db < backend/database/seed.sql
   ```

---

## 🚀 Running the API Server

### Built-in PHP Development Server:
```bash
php -S 127.0.0.1:8000 -t backend backend/index.php
```

### Apache / Nginx / Shared Hosting:
Point document root to the `backend/` directory. The included `.htaccess` file rewrites all incoming requests through `index.php`.

---

## 🔑 Demo Account Credentials

- **Email:** `alex.rivera@example.com`
- **Password:** `demo123` (or any password in demo simulation mode)
- **Predefined Balances (in minor units):**
  - **USD:** $5,250.00 (`525000` cents)
  - **GBP:** £1,850.00 (`185000` pence)
  - **EUR:** €2,400.00 (`240000` cents)
  - **NGN:** ₦3,500,000.00 (`350000000` kobo)

---

## 🧪 Testing the API

Run the automated backend test suite:
```bash
python3 scripts/test_php_backend.py
```
Verifies 12 test suites:
- Authentication & JWT issuance
- Multi-currency wallet balance calculation
- Deposit funds & ledger sync
- Outward transfer & balance deduction
- Insufficient balance rollback
- Atomic double-entry currency exchange
- Card freeze / unfreeze status toggling
- Notification read status update
- Analytics income vs. spend aggregation
- Isolated starter balances for new registrations ($100 USD, £50 GBP, €50 EUR, ₦50,000 NGN)
