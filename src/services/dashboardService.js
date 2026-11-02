/**
 * Secondary services: cards, savings, analytics, rates
 */

export const cardService = {
  async getCards() {
    return {
      success: true,
      message: 'Cards retrieved',
      data: [
        {
          id: 'crd_01',
          type: 'Virtual',
          brand: 'Visa',
          cardNumberMasked: '•••• •••• •••• 4892',
          expiry: '09/28',
          cvv: '•••',
          cardholderName: 'ALEX RIVERA',
          isFrozen: false,
          colorGradient: ['#1F232F', '#0B0C10'],
          accentColor: '#635BFF',
          contactlessEnabled: true,
          onlinePaymentsEnabled: true,
          monthlyLimit: 5000,
          currentSpend: 1342.5,
        },
        {
          id: 'crd_02',
          type: 'Disposable Virtual',
          brand: 'Mastercard',
          cardNumberMasked: '•••• •••• •••• 8310',
          expiry: '05/26',
          cvv: '•••',
          cardholderName: 'ALEX RIVERA',
          isFrozen: false,
          colorGradient: ['#E11D48', '#881337'],
          accentColor: '#FDA4AF',
          contactlessEnabled: false,
          onlinePaymentsEnabled: true,
          monthlyLimit: 1000,
          currentSpend: 145.2,
        },
      ],
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
    return {
      success: true,
      message: 'Analytics summary retrieved',
      data: {
        totalSpent: 2840.5,
        totalIncome: 5500.0,
        currency: 'USD',
        symbol: '$',
        categories: [
          { name: 'Shopping', amount: 1140, percentage: 40, color: '#635BFF' },
          { name: 'Food & Dining', amount: 620, percentage: 22, color: '#F59E0B' },
          { name: 'Bills & Utilities', amount: 510, percentage: 18, color: '#0EA5E9' },
          { name: 'Entertainment', amount: 320, percentage: 11, color: '#EC4899' },
          { name: 'Transport', amount: 250.5, percentage: 9, color: '#10B981' },
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
      data: [
        { pair: 'EUR/USD', rate: 1.0824, change: '+0.15%', isUp: true },
        { pair: 'GBP/USD', rate: 1.2915, change: '+0.32%', isUp: true },
        { pair: 'USD/NGN', rate: 1485.0, change: '-0.40%', isUp: false },
        { pair: 'BTC/USD', rate: 94250.0, change: '+2.85%', isUp: true },
      ],
    };
  },
};
