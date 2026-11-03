import { apiRequest } from './api';
import { financialStore } from './financialStore';

/**
 * Wallet service
 * Connects to PHP backend:
 * GET  /api/v1/wallets
 * POST /api/v1/wallets (deposit funds)
 * GET  /api/v1/wallets/details?currency=...
 * POST /api/v1/exchange/convert
 */

export const walletService = {
  async getWallets() {
    const res = await apiRequest('/wallets');
    if (res && res.success && res.data) {
      return res;
    }

    // Fallback to local financialStore
    const wallets = financialStore.getWallets();
    const totalUsdEquivalent = financialStore.calculateTotalUsd();
    return {
      success: true,
      message: 'Wallets retrieved',
      data: {
        wallets: [...wallets],
        totalUsdEquivalent,
      },
    };
  },

  async getWalletDetails(currency) {
    const res = await apiRequest(`/wallets/details?currency=${encodeURIComponent(currency)}`);
    if (res && res.success && res.data) {
      return res;
    }

    const wallet = financialStore.getWallet(currency);
    return {
      success: true,
      message: 'Wallet details retrieved',
      data: wallet,
    };
  },

  async addFunds(currency, amount) {
    const res = await apiRequest('/wallets', {
      method: 'POST',
      body: { currency, amount },
    });

    if (res && res.success && res.data) {
      // Also sync local store
      await financialStore.addFunds(currency, amount);
      return res;
    }

    // Offline fallback
    try {
      const result = await financialStore.addFunds(currency, amount);
      return {
        success: true,
        message: `Added ${result.wallet.symbol}${Number(amount).toFixed(2)} successfully`,
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
    const res = await apiRequest('/exchange/convert', {
      method: 'POST',
      body: { fromCurrency, toCurrency, amount },
    });

    if (res && res.success && res.data) {
      await financialStore.exchangeCurrency({ fromCurrency, toCurrency, amount });
      return res;
    }

    // Offline fallback
    try {
      const result = await financialStore.exchangeCurrency({ fromCurrency, toCurrency, amount });
      return {
        success: true,
        message: `Converted ${amount} ${fromCurrency} to ${result.convertedAmount.toFixed(2)} ${toCurrency}`,
        data: result,
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
