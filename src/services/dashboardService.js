import { financialStore } from './financialStore';

/**
 * Secondary services: cards, savings, analytics, rates, notifications
 */

export const cardService = {
  async getCards() {
    await new Promise((r) => setTimeout(r, 100));
    return {
      success: true,
      message: 'Cards retrieved',
      data: financialStore.getCards(),
    };
  },

  async toggleFreeze(cardId) {
    await new Promise((r) => setTimeout(r, 150));
    const card = await financialStore.toggleCardFreeze(cardId);
    if (!card) {
      return { success: false, message: 'Card not found', errors: ['Card not found'] };
    }
    return {
      success: true,
      message: card.isFrozen ? 'Card frozen successfully' : 'Card unfrozen successfully',
      data: card,
    };
  },
};

export const notificationService = {
  async getNotifications() {
    await new Promise((r) => setTimeout(r, 80));
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
    await new Promise((r) => setTimeout(r, 100));
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
    await new Promise((r) => setTimeout(r, 100));
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
    await new Promise((r) => setTimeout(r, 120));
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
    return {
      success: true,
      message: 'Live market rates retrieved',
      data: [
        { pair: 'EUR/USD', rate: 1.0824, change: '+0.15%', isUp: true },
        { pair: 'GBP/USD', rate: 1.2915, change: '+0.32%', isUp: true },
        { pair: 'USD/NGN', rate: 1485.0, change: '-0.40%', isUp: false },
        { pair: 'BTC/USD', rate: 94250.0, change: '+2.85%', isUp: true },
      ],
    };
  },
};
