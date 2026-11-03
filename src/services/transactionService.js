import { apiRequest } from './api';
import { financialStore } from './financialStore';

/**
 * Transaction Service
 * Connects to PHP backend:
 * GET  /api/v1/transactions
 * GET  /api/v1/transactions/details?id=...
 * POST /api/v1/transfers/send
 * POST /api/v1/transfers/request
 */

export const transactionService = {
  async getTransactions(limit = 20, category = '', search = '') {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await apiRequest(`/transactions?${params.toString()}`);
    if (res && res.success && res.data) {
      return res;
    }

    // Local fallback
    const txs = financialStore.getTransactions(limit);
    return {
      success: true,
      message: 'Transactions retrieved',
      data: {
        transactions: txs,
        totalCount: txs.length,
      },
    };
  },

  async getTransactionDetails(id) {
    const res = await apiRequest(`/transactions/details?id=${encodeURIComponent(id)}`);
    if (res && res.success && res.data) {
      return res;
    }

    const tx = financialStore.getTransaction(id);
    if (!tx) {
      return { success: false, message: 'Transaction not found', data: null };
    }
    return {
      success: true,
      message: 'Transaction details found',
      data: tx,
    };
  },

  async createSimulatedTransfer({ recipientName, amount, currency, reference }) {
    const res = await apiRequest('/transfers/send', {
      method: 'POST',
      body: { recipientName, amount, currency, reference },
    });

    if (res && res.success && res.data) {
      await financialStore.sendTransfer({ recipientName, amount, currency, reference });
      return res;
    }

    // Fallback
    try {
      const result = await financialStore.sendTransfer({
        recipientName,
        amount,
        currency,
        reference,
      });
      return {
        success: true,
        message: 'Transfer completed successfully',
        data: result.transaction,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Transfer failed',
        data: null,
      };
    }
  },

  async createSimulatedRequest({ fromName, amount, currency, note }) {
    const res = await apiRequest('/transfers/request', {
      method: 'POST',
      body: { fromName, amount, currency, note },
    });

    if (res && res.success && res.data) {
      await financialStore.requestPayment({ fromName, amount, currency, note });
      return res;
    }

    // Fallback
    try {
      const result = await financialStore.requestPayment({
        fromName,
        amount,
        currency,
        note,
      });
      return {
        success: true,
        message: 'Payment request initiated',
        data: result.transaction,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Payment request failed',
        data: null,
      };
    }
  },
};
