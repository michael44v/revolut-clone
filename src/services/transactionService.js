import { financialStore } from './financialStore';

/**
 * Transaction Service
 * Realistic simulated double-entry ledger history adhering to procedural PHP JSON API contract.
 */

export const transactionService = {
  async getTransactions(limit = 20) {
    await new Promise((r) => setTimeout(r, 120));
    const txs = financialStore.getTransactions(limit);
    return {
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions: txs,
        totalCount: txs.length,
      },
    };
  },

  async getTransactionDetails(id) {
    await new Promise((r) => setTimeout(r, 100));
    const tx = financialStore.getTransaction(id);
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
    await new Promise((r) => setTimeout(r, 300));
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
        errors: [err.message],
      };
    }
  },

  async createSimulatedRequest({ fromName, amount, currency, note }) {
    await new Promise((r) => setTimeout(r, 250));
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
        errors: [err.message],
      };
    }
  },
};
