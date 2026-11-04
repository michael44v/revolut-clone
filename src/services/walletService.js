
import { apiRequest } from './api';
import { financialStore } from './financialStore';

export const walletService = {
  async getWallets() {
    const res = await apiRequest('/wallets');

    if (
      res?.success &&
      res?.data &&
      Array.isArray(res.data.wallets)
    ) {
      return {
        ...res,
        data: {
          ...res.data,
          wallets: res.data.wallets,
          totalUsdEquivalent:
            Number(res.data.totalUsdEquivalent) || 0,
        },
      };
    }

    // Local fallback
    const wallets = financialStore.getWallets();

    return {
      success: true,
      message: 'Wallets retrieved from local store',
      data: {
        wallets: Array.isArray(wallets) ? [...wallets] : [],
        totalUsdEquivalent:
          Number(financialStore.calculateTotalUsd()) || 0,
      },
    };
  },

  async getWalletDetails(currency) {
    const res = await apiRequest(
      `/wallets/details?currency=${encodeURIComponent(currency)}`
    );

    if (res?.success && res?.data) {
      return res;
    }

    const wallet = financialStore.getWallet(currency);

    return {
      success: !!wallet,
      message: wallet ? 'Wallet details retrieved' : 'Wallet not found',
      data: wallet || null,
    };
  },

  async addFunds(currency, amount) {
    const res = await apiRequest('/wallets', {
      method: 'POST',
      body: { currency, amount },
    });

    if (res?.success && res?.data) {
      await financialStore.addFunds(currency, amount);
      return res;
    }

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

    if (res?.success && res?.data) {
      await financialStore.exchangeCurrency({
        fromCurrency,
        toCurrency,
        amount,
      });
      return res;
    }

    try {
      const result = await financialStore.exchangeCurrency({
        fromCurrency,
        toCurrency,
        amount,
      });

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
