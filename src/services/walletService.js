import { financialStore } from './financialStore';

/**
 * Wallet service
 * Provides multi-currency wallet management and live balances.
 * Demo balances specified by user:
 * - USD: $5,250.00
 * - GBP: £1,850.00
 * - EUR: €2,400.00
 * - NGN: ₦3,500,000.00
 * Starter balances for newly registered accounts:
 * - USD: $100.00
 * - GBP: £50.00
 * - EUR: €50.00
 * - NGN: ₦50,000.00
 */

export const walletService = {
  async getWallets() {
    await new Promise((r) => setTimeout(r, 120));
    const wallets = financialStore.getWallets();
    const totalUsdEquivalent = financialStore.calculateTotalUsd();
    return {
      success: true,
      message: 'Wallets retrieved successfully',
      data: {
        wallets: [...wallets],
        totalUsdEquivalent,
      },
    };
  },

  async getWalletDetails(currency) {
    await new Promise((r) => setTimeout(r, 100));
    const wallet = financialStore.getWallet(currency);
    return {
      success: true,
      message: 'Wallet details retrieved',
      data: wallet,
    };
  },

  async addFunds(currency, amount) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const result = await financialStore.addFunds(currency, amount);
      if (!result) {
        return {
          success: false,
          message: 'Wallet not found',
          errors: ['Invalid currency specified'],
        };
      }
      return {
        success: true,
        message: `Added ${result.wallet.symbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} successfully`,
        data: result.wallet,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to add funds',
        errors: [err.message],
      };
    }
  },

  async convertCurrency(fromCurrency, toCurrency, amount) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await financialStore.exchangeCurrency({ fromCurrency, toCurrency, amount });
      return {
        success: true,
        message: `Converted ${amount} ${fromCurrency} to ${res.convertedAmount.toFixed(2)} ${toCurrency}`,
        data: res,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Currency conversion failed',
        errors: [err.message],
      };
    }
  },
};
