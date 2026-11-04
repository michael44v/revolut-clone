
import { apiRequest } from './api';
import { financialStore } from './financialStore';

export const transactionService = {
  async getTransactions(limit = 20, category = '', search = '') {
    const params = new URLSearchParams();

    if (limit) params.append('limit', limit);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await apiRequest(
      `/transactions?${params.toString()}`
    );

    if (
      res?.success &&
      res?.data &&
      Array.isArray(res.data.transactions)
    ) {
      return {
        ...res,
        data: {
          ...res.data,
          transactions: res.data.transactions,
          totalCount:
            Number(res.data.totalCount) ||
            res.data.transactions.length,
        },
      };
    }

    // Local fallback
    const txs = financialStore.getTransactions(limit);
    const transactions = Array.isArray(txs) ? txs : [];

    return {
      success: true,
      message: 'Transactions retrieved from local store',
      data: {
        transactions,
        totalCount: transactions.length,
      },
    };
  },

  async getTransactionDetails(id) {
    const res = await apiRequest(
      `/transactions/details?id=${encodeURIComponent(id)}`
    );

    if (res?.success && res?.data) {
      return res;
    }

    const tx = financialStore.getTransaction(id);

    if (!tx) {
      return {
        success: false,
        message: 'Transaction not found',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Transaction details found',
      data: tx,
    };
  },

  async createSimulatedTransfer({
    recipientName,
    amount,
    currency,
    reference,
  }) {
    const res = await apiRequest('/transfers/send', {
      method: 'POST',
      body: { recipientName, amount, currency, reference },
    });

    if (res?.success && res?.data) {
      await financialStore.sendTransfer({
        recipientName,
        amount,
        currency,
        reference,
      });
      return res;
    }

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

  async createSimulatedRequest({
    fromName,
    amount,
    currency,
    note,
  }) {
    const res = await apiRequest('/transfers/request', {
      method: 'POST',
      body: { fromName, amount, currency, note },
    });

    if (res?.success && res?.data) {
      await financialStore.requestPayment({
        fromName,
        amount,
        currency,
        note,
      });
      return res;
    }

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
