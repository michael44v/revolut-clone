/**
 * Wallet service
 * Provides multi-currency wallet management and live balances.
 * Demo balances specified by user:
 * - USD: $5,250.00
 * - GBP: £1,850.00
 * - EUR: €2,400.00
 * - NGN: ₦3,500,000.00
 */

const INITIAL_WALLETS = [
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

// In-memory state for simulator
let currentWallets = [...INITIAL_WALLETS];

export const walletService = {
  async getWallets() {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      message: 'Wallets retrieved',
      data: {
        wallets: [...currentWallets],
        totalUsdEquivalent: 11485.5,
      },
    };
  },

  async getWalletDetails(currency) {
    await new Promise((r) => setTimeout(r, 150));
    const wallet = currentWallets.find((w) => w.currency === currency) || currentWallets[0];
    return {
      success: true,
      message: 'Wallet details retrieved',
      data: wallet,
    };
  },

  async addFunds(currency, amount) {
    await new Promise((r) => setTimeout(r, 400));
    currentWallets = currentWallets.map((w) => {
      if (w.currency === currency) {
        const newBal = w.balance + Number(amount);
        return {
          ...w,
          balance: newBal,
          minorUnits: Math.round(newBal * 100),
        };
      }
      return w;
    });

    const updated = currentWallets.find((w) => w.currency === currency);
    return {
      success: true,
      message: `Added ${updated.symbol}${Number(amount).toLocaleString()} successfully`,
      data: updated,
    };
  },

  async convertCurrency(fromCurrency, toCurrency, amount, exchangeRate) {
    await new Promise((r) => setTimeout(r, 450));
    const numAmount = Number(amount);
    const convertedAmount = numAmount * exchangeRate;

    currentWallets = currentWallets.map((w) => {
      if (w.currency === fromCurrency) {
        const bal = w.balance - numAmount;
        return { ...w, balance: bal, minorUnits: Math.round(bal * 100) };
      }
      if (w.currency === toCurrency) {
        const bal = w.balance + convertedAmount;
        return { ...w, balance: bal, minorUnits: Math.round(bal * 100) };
      }
      return w;
    });

    return {
      success: true,
      message: `Converted ${numAmount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
      data: {
        fromCurrency,
        toCurrency,
        amount: numAmount,
        convertedAmount,
        wallets: currentWallets,
      },
    };
  },
};
