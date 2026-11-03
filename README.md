# Revolut-Inspired FinTech Application (Phase 1 Frontend)

A high-performance, mobile-first fintech simulation application inspired by Revolut's visual design. Built with **React Native**, **Expo SDK 58**, and **Expo Router** using **pure JavaScript and JSX** exclusively (no TypeScript or TSX).

---

## 🌟 Features Implemented in Phase 1

### 1. Onboarding & Authentication
- **Welcome Screen:** Full-bleed hero banner, simulated currency badges, and one-tap demo account login.
- **Interactive Onboarding:** 3-step feature tour showcasing multi-currency freedom, virtual cards, and smart savings pockets.
- **Dual Authentication Modes:**
  - **Demo Account:** Instant access with predefined balances ($5,250 USD, £1,850 GBP, €2,400 EUR, ₦3,500,000 NGN).
  - **New User Registration:** Dynamic user creation with starter balances ($100 USD, £50 GBP, €50 EUR, ₦50,000 NGN) and complete data isolation.
- **Biometric / Face ID Support:** Cross-platform biometric hardware detection and toggle using `expo-local-authentication`.
- **Session Persistence:** Cross-platform secure session management using `expo-secure-store` on native Android/iOS and `localStorage` on web.

### 2. Multi-Currency Wallets & Home Dashboard
- **Live Balances:** Real-time synchronized wallets for USD, GBP, EUR, and NGN with deterministic exchange rates.
- **Privacy Mode:** One-tap balance visibility toggle (`••••••••`).
- **Quick Action Sheet:**
  - **Add Money:** Deposits simulated funds into selected wallets and updates ledger transactions.
  - **Send Money:** Deducts funds and creates a verified transfer record.
  - **Request Payment:** Creates incoming pending transaction records without premature ledger credits.
  - **Exchange Currency:** Converts funds between any currency pair at live exchange rates and updates both balances simultaneously.
- **Notifications Bottom Sheet:**
  - Unread badge indicator.
  - Realistic banking, security, and transaction notifications.
  - Functional "Mark all as read" button.

### 3. Auxiliary Financial Screens
- **Virtual Cards:**
  - Visa and disposable Mastercard graphics with dynamic gradients.
  - Unmask card numbers and CVV codes.
  - Freeze and unfreeze cards instantly with live status notifications.
  - Monthly limit tracking bar.
- **Transfers & Payments:**
  - Contact shortcuts and live search bar.
  - Category filters: All, Income, Transfers, Shopping, Exchange.
  - Transaction receipts with double-entry settlement notes.
- **Analytics & Insights:**
  - Total inflow vs. outflow summary.
  - Weekly activity histogram.
  - Multi-currency portfolio allocation breakdown.
  - Target-tracking savings pockets.
- **Profile & Settings:**
  - Personal profile and tier badge.
  - Light / Dark / System theme preference switcher with centralized design tokens.
  - Face ID / Biometrics toggle.
  - Push notification preferences.
  - Secure logout clearing active session.

---

## 🏗️ Architecture & Procedural PHP Backend Migration

The frontend service layer in `src/services/` is strictly decoupled from UI components. All services return the standardized JSON envelope:

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Future PHP Integration Guide
When transitioning from the Phase 1 simulated financial store to the Phase 2 procedural PHP backend:
1. Set the environment variable `EXPO_PUBLIC_API_URL` to your PHP backend endpoint (e.g. `https://api.yourfintech.com/api/v1`).
2. Update `src/services/api.js` to dispatch fetch requests to the PHP endpoints:
   - `/auth/login.php`
   - `/auth/register.php`
   - `/wallets/list.php`
   - `/transactions/create_transfer.php`
   - `/cards/toggle_freeze.php`
3. Backend database requirements: Plain procedural PHP with MySQLi prepared statements exclusively, avoiding MVC, ORMs, PDO, or frameworks.

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm or bun

### Setup & Launch
```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on web
npx expo start --web

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

### Verification & Linting
```bash
# Run ESLint checks
npm run lint

# Run Expo Doctor dependency diagnostics
npx expo-doctor

# Run Automated Playwright Verification
python3 scripts/verify_e2e.py
```

---

## 🔑 Demo Credentials
- **Email:** `alex.rivera@example.com` (or any email containing `demo`)
- **Password:** Any password (simulation mode)
- **One-Tap Access:** Tap **"Continue with Demo Account"** on the Welcome screen.
