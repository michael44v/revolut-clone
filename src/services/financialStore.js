import { storage } from '../utils/storage';

/**
 * Centralized Financial State Store
 *
 * Maintains isolated financial state (wallets, transactions, cards, notifications)
 * for the Demo account and dynamically registered accounts.
 * Persists data across sessions via storage (SecureStore on native, localStorage on web).
 */

const DEMO_USER_ID = 'usr_demo_1001';

const INITIAL_DEMO_WALLETS = [
  {
    id: 'wlt_usd_01',
    currency: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    balance: 5250.0,
    minorUnits: 525000,
    isPrimary: true,
    accountNumber: '8392019481',
    routingNumber: '021000021',
    iban: 'US89BANK0210000218392019481',
    bic: 'REVUS33X',
  },
  {
    id: 'wlt_gbp_02',
    currency: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    balance: 1850.0,
    minorUnits: 185000,
    isPrimary: false,
    accountNumber: '49201934',
    sortCode: '04-00-75',
    iban: 'GB29REVO04007549201934',
    bic: 'REVOGB2L',
  },
  {
    id: 'wlt_eur_03',
    currency: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    balance: 2400.0,
    minorUnits: 240000,
    isPrimary: false,
    accountNumber: '9284729104',
    iban: 'LT12325000009284729104',
    bic: 'REVOLT21',
  },
  {
    id: 'wlt_ngn_04',
    currency: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    balance: 3500000.0,
    minorUnits: 350000000,
    isPrimary: false,
    accountNumber: '0129482910',
    bankName: 'Simulation FinTech Bank',
    iban: 'NG02REV0129482910',
    bic: 'REVONG22',
  },
];

const INITIAL_STARTER_WALLETS = [
  {
    id: 'wlt_usd_starter',
    currency: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    balance: 100.0,
    minorUnits: 10000,
    isPrimary: true,
    accountNumber: '9102837461',
    routingNumber: '021000021',
    iban: 'US89BANK0210000219102837461',
    bic: 'REVUS33X',
  },
  {
    id: 'wlt_gbp_starter',
    currency: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    balance: 50.0,
    minorUnits: 5000,
    isPrimary: false,
    accountNumber: '58392019',
    sortCode: '04-00-75',
    iban: 'GB29REVO04007558392019',
    bic: 'REVOGB2L',
  },
  {
    id: 'wlt_eur_starter',
    currency: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    balance: 50.0,
    minorUnits: 5000,
    isPrimary: false,
    accountNumber: '1029384756',
    iban: 'LT12325000001029384756',
    bic: 'REVOLT21',
  },
  {
    id: 'wlt_ngn_starter',
    currency: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    balance: 50000.0,
    minorUnits: 5000000,
    isPrimary: false,
    accountNumber: '0987654321',
    bankName: 'Simulation FinTech Bank',
    iban: 'NG02REV0987654321',
    bic: 'REVONG22',
  },
];

const INITIAL_DEMO_TRANSACTIONS = [
  {
    id: 'tx_982103',
    title: 'Apple Store Regent St',
    subtitle: 'Electronics & Gadgets',
    category: 'Shopping',
    iconName: 'Smartphone',
    amount: -129.0,
    currency: 'USD',
    symbol: '$',
    type: 'debit',
    status: 'completed',
    date: 'Today, 2:45 PM',
    timestamp: '2025-05-10T14:45:00Z',
    cardLast4: '4892',
    reference: 'APL*PAY-948291',
    fee: 0.0,
  },
  {
    id: 'tx_982102',
    title: 'Salary Deposit - TechCorp',
    subtitle: 'Monthly Payroll Transfer',
    category: 'Income',
    iconName: 'ArrowDownLeft',
    amount: 4500.0,
    currency: 'USD',
    symbol: '$',
    type: 'credit',
    status: 'completed',
    date: 'Yesterday, 9:00 AM',
    timestamp: '2025-05-09T09:00:00Z',
    cardLast4: null,
    reference: 'SALARY/2025-05/TECHCORP',
    fee: 0.0,
  },
  {
    id: 'tx_982101',
    title: 'Starbucks Coffee',
    subtitle: 'Food & Drinks',
    category: 'Food',
    iconName: 'Coffee',
    amount: -6.75,
    currency: 'USD',
    symbol: '$',
    type: 'debit',
    status: 'completed',
    date: 'May 8, 8:15 AM',
    timestamp: '2025-05-08T08:15:00Z',
    cardLast4: '4892',
    reference: 'SBUX*10492-SEATTLE',
    fee: 0.0,
  },
  {
    id: 'tx_982100',
    title: 'Spotify Subscription',
    subtitle: 'Recurring Subscription',
    category: 'Entertainment',
    iconName: 'Music',
    amount: -10.99,
    currency: 'USD',
    symbol: '$',
    type: 'debit',
    status: 'completed',
    date: 'May 6, 12:00 AM',
    timestamp: '2025-05-06T00:00:00Z',
    cardLast4: '8310',
    reference: 'RECURRING*SPOTIFY-PREM',
    fee: 0.0,
  },
  {
    id: 'tx_982099',
    title: 'Transferred to Sarah Jenkins',
    subtitle: 'Dinner split 🍕',
    category: 'Transfer',
    iconName: 'ArrowUpRight',
    amount: -45.0,
    currency: 'USD',
    symbol: '$',
    type: 'debit',
    status: 'completed',
    date: 'May 5, 8:30 PM',
    timestamp: '2025-05-05T20:30:00Z',
    cardLast4: null,
    reference: 'SPLIT-DINNER-REV99',
    fee: 0.0,
  },
  {
    id: 'tx_982098',
    title: 'Currency Exchange (USD to EUR)',
    subtitle: 'Simulated Exchange Rate 0.92',
    category: 'Exchange',
    iconName: 'Repeat',
    amount: -500.0,
    currency: 'USD',
    symbol: '$',
    type: 'exchange',
    status: 'completed',
    date: 'May 4, 3:12 PM',
    timestamp: '2025-05-04T15:12:00Z',
    cardLast4: null,
    reference: 'FX-USDEUR-202598',
    fee: 0.0,
  },
];

const INITIAL_STARTER_TRANSACTIONS = [
  {
    id: 'tx_starter_01',
    title: 'Welcome Bonus Credit',
    subtitle: 'FinTech Simulation Welcome Gift',
    category: 'Income',
    iconName: 'ArrowDownLeft',
    amount: 100.0,
    currency: 'USD',
    symbol: '$',
    type: 'credit',
    status: 'completed',
    date: 'Today, Just now',
    timestamp: new Date().toISOString(),
    cardLast4: null,
    reference: 'BONUS-REG-WELCOME',
    fee: 0.0,
  },
];

const INITIAL_CARDS = [
  {
    id: 'crd_01',
    type: 'Virtual',
    brand: 'Visa',
    cardNumberMasked: '•••• •••• •••• 4892',
    fullCardNumber: '4532 8920 1938 4892',
    expiry: '09/28',
    cvv: '842',
    cardholderName: 'ALEX RIVERA',
    isFrozen: false,
    colorGradient: ['#1F232F', '#0B0C10'],
    accentColor: '#635BFF',
    contactlessEnabled: true,
    onlinePaymentsEnabled: true,
    monthlyLimit: 5000,
    currentSpend: 1342.5,
  },
  {
    id: 'crd_02',
    type: 'Disposable Virtual',
    brand: 'Mastercard',
    cardNumberMasked: '•••• •••• •••• 8310',
    fullCardNumber: '5399 2810 4920 8310',
    expiry: '05/26',
    cvv: '193',
    cardholderName: 'ALEX RIVERA',
    isFrozen: false,
    colorGradient: ['#E11D48', '#881337'],
    accentColor: '#FDA4AF',
    contactlessEnabled: false,
    onlinePaymentsEnabled: true,
    monthlyLimit: 1000,
    currentSpend: 145.2,
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_01',
    type: 'security',
    title: 'Security Alert: New Sign-in',
    message: 'A successful simulation sign-in was recognized on your account.',
    time: '10m ago',
    read: false,
    icon: 'Shield',
  },
  {
    id: 'notif_02',
    type: 'transfer',
    title: 'Payment Received',
    message: 'Salary transfer from TechCorp was settled into your USD wallet.',
    time: '1h ago',
    read: false,
    icon: 'ArrowDownLeft',
  },
  {
    id: 'notif_03',
    type: 'card',
    title: 'Card Payment Approved',
    message: '$129.00 spent at Apple Store Regent St with Virtual Visa ••4892.',
    time: '3h ago',
    read: true,
    icon: 'CreditCard',
  },
  {
    id: 'notif_04',
    type: 'account',
    title: 'Exchange Rate Watch',
    message: 'EUR/USD rose 0.15% to 1.0824 in today’s financial session.',
    time: 'Yesterday',
    read: true,
    icon: 'Repeat',
  },
];

// Fixed deterministic exchange rates relative to USD (1 unit of currency = X USD)
export const EXCHANGE_RATES_TO_USD = {
  USD: 1.0,
  GBP: 1.2915,
  EUR: 1.0824,
  NGN: 0.000673, // 1 USD = ~1485 NGN
};

// Rates map for direct conversion
export function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1.0;
  const fromInUsd = EXCHANGE_RATES_TO_USD[fromCurrency] || 1.0;
  const toInUsd = EXCHANGE_RATES_TO_USD[toCurrency] || 1.0;
  return fromInUsd / toInUsd;
}

export function getCurrencySymbol(curr) {
  switch (curr) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'NGN': return '₦';
    case 'USD':
    default: return '$';
  }
}

class FinancialStore {
  constructor() {
    this.currentUserId = DEMO_USER_ID;
    this.userStores = {};
    this.listeners = new Set();
    this.isInitialized = false;
  }

  async init(userId = DEMO_USER_ID) {
    this.currentUserId = userId;
    const storeKey = `app_fin_store_${userId}`;
    try {
      const saved = await storage.getItem(storeKey);
      if (saved) {
        this.userStores[userId] = JSON.parse(saved);
      } else {
        this.userStores[userId] = this.createInitialUserData(userId);
        await this.persist();
      }
    } catch (_e) {
      if (!this.userStores[userId]) {
        this.userStores[userId] = this.createInitialUserData(userId);
      }
    }
    this.isInitialized = true;
    this.notify();
  }

  createInitialUserData(userId) {
    const isDemo = userId === DEMO_USER_ID;
    return {
      wallets: isDemo ? JSON.parse(JSON.stringify(INITIAL_DEMO_WALLETS)) : JSON.parse(JSON.stringify(INITIAL_STARTER_WALLETS)),
      transactions: isDemo ? JSON.parse(JSON.stringify(INITIAL_DEMO_TRANSACTIONS)) : JSON.parse(JSON.stringify(INITIAL_STARTER_TRANSACTIONS)),
      cards: JSON.parse(JSON.stringify(INITIAL_CARDS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
    };
  }

  getCurrentData() {
    if (!this.userStores[this.currentUserId]) {
      this.userStores[this.currentUserId] = this.createInitialUserData(this.currentUserId);
    }
    return this.userStores[this.currentUserId];
  }

  async persist() {
    const storeKey = `app_fin_store_${this.currentUserId}`;
    try {
      await storage.setItem(storeKey, JSON.stringify(this.getCurrentData()));
    } catch (_e) {
      // Ignore
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getCurrentData());
      } catch (_e) {
        // Ignore
      }
    }
  }

  // Calculate total USD equivalent deterministically
  calculateTotalUsd() {
    const data = this.getCurrentData();
    let total = 0;
    for (const w of data.wallets) {
      const rateToUsd = EXCHANGE_RATES_TO_USD[w.currency] || 1;
      total += w.balance * rateToUsd;
    }
    return Math.round(total * 100) / 100;
  }

  getWallets() {
    return this.getCurrentData().wallets;
  }

  getWallet(currency) {
    return this.getCurrentData().wallets.find((w) => w.currency === currency) || this.getCurrentData().wallets[0];
  }

  getTransactions(limit = 20) {
    return this.getCurrentData().transactions.slice(0, limit);
  }

  getTransaction(id) {
    return this.getCurrentData().transactions.find((t) => t.id === id);
  }

  getCards() {
    return this.getCurrentData().cards;
  }

  getNotifications() {
    return this.getCurrentData().notifications;
  }

  async addFunds(currency, amount) {
    const num = Number(amount);
    const data = this.getCurrentData();
    const wallet = data.wallets.find((w) => w.currency === currency);
    if (!wallet) return null;

    wallet.balance += num;
    wallet.minorUnits = Math.round(wallet.balance * 100);

    const symbol = getCurrencySymbol(currency);
    const newTx = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: `Deposit to ${currency} Wallet`,
      subtitle: 'Simulated Card Deposit',
      category: 'Deposit',
      iconName: 'ArrowDownLeft',
      amount: num,
      currency,
      symbol,
      type: 'credit',
      status: 'completed',
      date: 'Today, Just now',
      timestamp: new Date().toISOString(),
      cardLast4: '4892',
      reference: `DEP-${currency}-${Date.now().toString().slice(-6)}`,
      fee: 0.0,
    };
    data.transactions.unshift(newTx);

    // Push notification
    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'transfer',
      title: 'Funds Added',
      message: `Successfully deposited ${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })} into your ${currency} wallet.`,
      time: 'Just now',
      read: false,
      icon: 'ArrowDownLeft',
    });

    await this.persist();
    return { wallet, transaction: newTx };
  }

  async sendTransfer({ recipientName, amount, currency, reference }) {
    const num = Number(amount);
    const data = this.getCurrentData();
    const wallet = data.wallets.find((w) => w.currency === currency);
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.balance < num) {
      throw new Error(`Insufficient funds in ${currency} wallet`);
    }

    wallet.balance -= num;
    wallet.minorUnits = Math.round(wallet.balance * 100);

    const symbol = getCurrencySymbol(currency);
    const newTx = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: `Transfer to ${recipientName}`,
      subtitle: reference || 'Personal Transfer',
      category: 'Transfer',
      iconName: 'ArrowUpRight',
      amount: -num,
      currency,
      symbol,
      type: 'debit',
      status: 'completed',
      date: 'Today, Just now',
      timestamp: new Date().toISOString(),
      cardLast4: null,
      reference: reference || `TRF-${Date.now().toString().slice(-6)}`,
      fee: 0.0,
    };
    data.transactions.unshift(newTx);

    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'transfer',
      title: 'Transfer Sent',
      message: `Sent ${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${recipientName}.`,
      time: 'Just now',
      read: false,
      icon: 'ArrowUpRight',
    });

    await this.persist();
    return { wallet, transaction: newTx };
  }

  async requestPayment({ fromName, amount, currency, note }) {
    const num = Number(amount);
    const data = this.getCurrentData();
    const symbol = getCurrencySymbol(currency);

    // Creates an incoming pending request receipt. Does NOT credit balance until marked received.
    const newTx = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: `Payment Request from ${fromName}`,
      subtitle: note || 'Payment Request',
      category: 'Request',
      iconName: 'ArrowDownLeft',
      amount: num,
      currency,
      symbol,
      type: 'credit',
      status: 'pending',
      date: 'Today, Just now',
      timestamp: new Date().toISOString(),
      cardLast4: null,
      reference: `REQ-${Date.now().toString().slice(-6)}`,
      fee: 0.0,
    };
    data.transactions.unshift(newTx);

    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'transfer',
      title: 'Payment Requested',
      message: `Requested ${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })} from ${fromName}. Status: Pending.`,
      time: 'Just now',
      read: false,
      icon: 'ArrowDownLeft',
    });

    await this.persist();
    return { transaction: newTx };
  }

  async exchangeCurrency({ fromCurrency, toCurrency, amount }) {
    const num = Number(amount);
    const rate = getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = Math.round(num * rate * 100) / 100;

    const data = this.getCurrentData();
    const fromWallet = data.wallets.find((w) => w.currency === fromCurrency);
    const toWallet = data.wallets.find((w) => w.currency === toCurrency);

    if (!fromWallet || !toWallet) {
      throw new Error('Invalid currencies selected');
    }
    if (fromWallet.balance < num) {
      throw new Error(`Insufficient ${fromCurrency} balance for exchange`);
    }

    fromWallet.balance -= num;
    fromWallet.minorUnits = Math.round(fromWallet.balance * 100);

    toWallet.balance += convertedAmount;
    toWallet.minorUnits = Math.round(toWallet.balance * 100);

    const fromSymbol = getCurrencySymbol(fromCurrency);
    const toSymbol = getCurrencySymbol(toCurrency);

    const newTx = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: `Exchange ${fromCurrency} to ${toCurrency}`,
      subtitle: `Rate: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`,
      category: 'Exchange',
      iconName: 'Repeat',
      amount: -num,
      currency: fromCurrency,
      symbol: fromSymbol,
      type: 'exchange',
      status: 'completed',
      date: 'Today, Just now',
      timestamp: new Date().toISOString(),
      cardLast4: null,
      reference: `FX-${fromCurrency}${toCurrency}-${Date.now().toString().slice(-6)}`,
      fee: 0.0,
      details: {
        fromCurrency,
        toCurrency,
        fromAmount: num,
        toAmount: convertedAmount,
        rate,
      },
    };
    data.transactions.unshift(newTx);

    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'account',
      title: 'Currency Exchanged',
      message: `Swapped ${fromSymbol}${num.toFixed(2)} to ${toSymbol}${convertedAmount.toFixed(2)} at ${rate.toFixed(4)}.`,
      time: 'Just now',
      read: false,
      icon: 'Repeat',
    });

    await this.persist();
    return {
      fromWallet,
      toWallet,
      convertedAmount,
      rate,
      transaction: newTx,
    };
  }

  async toggleCardFreeze(cardId) {
    const data = this.getCurrentData();
    const card = data.cards.find((c) => c.id === cardId);
    if (!card) return null;

    card.isFrozen = !card.isFrozen;

    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'card',
      title: card.isFrozen ? 'Card Frozen' : 'Card Unfrozen',
      message: `${card.brand} card (••${card.cardNumberMasked.slice(-4)}) has been ${card.isFrozen ? 'frozen for security' : 'reactivated'}.`,
      time: 'Just now',
      read: false,
      icon: 'CreditCard',
    });

    await this.persist();
    return card;
  }

  async markAllNotificationsRead() {
    const data = this.getCurrentData();
    data.notifications.forEach((n) => {
      n.read = true;
    });
    await this.persist();
    return data.notifications;
  }
}

export const financialStore = new FinancialStore();
