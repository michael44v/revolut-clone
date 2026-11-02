/**
 * Transaction Service
 * Realistic simulated ledger history matching procedural backend double-entry specifications.
 */

const INITIAL_TRANSACTIONS = [
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
    subtitle: 'Simulated Exchange Rate 1.08',
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

let transactionsStore = [...INITIAL_TRANSACTIONS];

export const transactionService = {
  async getTransactions(limit = 20) {
    await new Promise((r) => setTimeout(r, 180));
    return {
      success: true,
      message: 'Transactions retrieved',
      data: {
        transactions: transactionsStore.slice(0, limit),
        totalCount: transactionsStore.length,
      },
    };
  },

  async getTransactionDetails(id) {
    await new Promise((r) => setTimeout(r, 120));
    const tx = transactionsStore.find((t) => t.id === id);
    if (!tx) {
      return { success: false, message: 'Transaction not found', errors: ['Not found'] };
    }
    return {
      success: true,
      message: 'Transaction details found',
      data: tx,
    };
  },

  async createSimulatedTransfer({ recipientName, amount, currency, reference }) {
    await new Promise((r) => setTimeout(r, 500));
    const num = Number(amount);
    const newTx = {
      id: 'tx_' + Math.floor(Math.random() * 899999 + 100000),
      title: `Transfer to ${recipientName}`,
      subtitle: reference || 'Personal Transfer',
      category: 'Transfer',
      iconName: 'ArrowUpRight',
      amount: -num,
      currency: currency || 'USD',
      symbol: currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : '$',
      type: 'debit',
      status: 'completed',
      date: 'Just now',
      timestamp: new Date().toISOString(),
      cardLast4: null,
      reference: reference || 'TRF-' + Math.floor(Math.random() * 89999 + 10000),
      fee: 0.0,
    };

    transactionsStore.unshift(newTx);
    return {
      success: true,
      message: 'Transfer completed successfully',
      data: newTx,
    };
  },
};
