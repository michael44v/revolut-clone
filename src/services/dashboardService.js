import { apiRequest } from './api';
import { financialStore } from './financialStore';

/**
 * Secondary services: cards, notifications, analytics, rates
 * Connects to PHP backend:
 * GET  /api/v1/cards
 * POST /api/v1/cards/update_status
 * GET  /api/v1/notifications
 * POST /api/v1/notifications/mark_all_read
 * GET  /api/v1/analytics/dashboard
 * GET  /api/v1/exchange/rates
 */

export const cardService = {
  async getCards() {
    const res = await apiRequest('/cards');
    if (res && res.success && res.data) {
      return res;
    }
    return {
      success: true,
      message: 'Cards retrieved',
      data: financialStore.getCards(),
    };
  },

  async toggleFreeze(cardId) {
    const res = await apiRequest('/cards/update_status', {
      method: 'POST',
      body: { cardId },
    });
    if (res && res.success && res.data) {
      await financialStore.toggleCardFreeze(cardId);
      return res;
    }

    const card = await financialStore.toggleCardFreeze(cardId);
    return {
      success: true,
      message: card?.isFrozen ? 'Card frozen successfully' : 'Card unfrozen successfully',
      data: card,
    };
  },
};

export const notificationService = {
  async getNotifications() {
    const res = await apiRequest('/notifications');
    if (res && res.success && res.data) {
      return res;
    }
    const notifs = financialStore.getNotifications();
    return {
      success: true,
      message: 'Notifications retrieved',
      data: {
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.read).length,
      },
    };
  },

  async markAllAsRead() {
    const res = await apiRequest('/notifications/mark_all_read', { method: 'POST' });
    if (res && res.success && res.data) {
      await financialStore.markAllNotificationsRead();
      return res;
    }

    const notifs = await financialStore.markAllNotificationsRead();
    return {
      success: true,
      message: 'All notifications marked as read',
      data: {
        notifications: notifs,
        unreadCount: 0,
      },
    };
  },
};

export const savingsService = {
  async getPockets() {
    return {
      success: true,
      message: 'Savings pockets retrieved',
      data: [
        {
          id: 'pck_01',
          name: 'Tokyo Trip ✈️',
          targetAmount: 4000,
          currentAmount: 2650,
          currency: 'USD',
          symbol: '$',
          targetDate: 'Dec 2025',
          color: '#635BFF',
        },
        {
          id: 'pck_02',
          name: 'Emergency Rainy Day ☔️',
          targetAmount: 10000,
          currentAmount: 7800,
          currency: 'USD',
          symbol: '$',
          targetDate: 'Ongoing',
          color: '#16A36A',
        },
      ],
    };
  },
};

export const analyticsService = {
  async getMonthlySummary() {
    const res = await apiRequest('/analytics/dashboard');
    if (res && res.success && res.data) {
      return res;
    }

    const txs = financialStore.getTransactions(100);
    let calculatedSpent = 0;
    let calculatedIncome = 0;

    txs.forEach((t) => {
      if (t.status === 'completed') {
        if (t.amount < 0) {
          calculatedSpent += Math.abs(t.amount);
        } else {
          calculatedIncome += t.amount;
        }
      }
    });

    return {
      success: true,
      message: 'Analytics summary retrieved',
      data: {
        totalSpent: Math.round(calculatedSpent * 100) / 100,
        totalIncome: Math.round(calculatedIncome * 100) / 100,
        currency: 'USD',
        symbol: '$',
        categories: [
          { name: 'Shopping', amount: 1140, percentage: 38, color: '#635BFF' },
          { name: 'Food & Dining', amount: 620, percentage: 21, color: '#F59E0B' },
          { name: 'Bills & Utilities', amount: 510, percentage: 17, color: '#0EA5E9' },
          { name: 'Transfers', amount: 450, percentage: 15, color: '#10B981' },
          { name: 'Entertainment', amount: 270, percentage: 9, color: '#EC4899' },
        ],
        weeklyTrends: [
          { day: 'Mon', amount: 45 },
          { day: 'Tue', amount: 120 },
          { day: 'Wed', amount: 80 },
          { day: 'Thu', amount: 210 },
          { day: 'Fri', amount: 340 },
          { day: 'Sat', amount: 190 },
          { day: 'Sun', amount: 95 },
        ],
      },
    };
  },
};

export const exchangeRateService = {
  async getLiveRates() {
    const res = await apiRequest('/exchange/rates');
    if (res && res.success && res.data) {
      return res;
    }
    return {
      success: true,
      message: 'Simulated rates retrieved',
      data: [
        { pair: 'EUR/USD', rate: 1.0824, change: '+0.15%', isUp: true },
        { pair: 'GBP/USD', rate: 1.2915, change: '+0.32%', isUp: true },
        { pair: 'USD/NGN', rate: 1485.0, change: '-0.40%', isUp: false },
        { pair: 'BTC/USD', rate: 94250.0, change: '+2.85%', isUp: true },
      ],
    };
  },
};
