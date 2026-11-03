import { apiRequest } from './api';
import { financialStore } from './financialStore';

/**
 * Authentication service
 * Communicates with PHP endpoints:
 * POST /api/v1/auth/login
 * POST /api/v1/auth/register
 * POST /api/v1/auth/logout
 * GET  /api/v1/auth/me
 */

export const authService = {
  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (res && res.success && res.data) {
      // Synchronize local financial store with user ID
      await financialStore.init(res.data.user.id);
      return res;
    }

    // Fallback to local simulation if PHP backend is unavailable
    if (res?.isNetworkError) {
      if (email.toLowerCase() === 'alex.rivera@example.com' || email.toLowerCase().includes('demo')) {
        return this.loginAsDemo();
      }
      const userId = `usr_${Math.abs(email.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0)).toString(16)}`;
      await financialStore.init(userId);
      return {
        success: true,
        message: 'Logged in (offline simulation)',
        data: {
          user: {
            id: userId,
            name: email.split('@')[0],
            email: email.toLowerCase(),
            avatar: null,
            tag: `@${email.split('@')[0]}`,
            kycStatus: 'verified',
            tier: 'Standard',
            isDemo: false,
          },
          token: `sim_token_${Date.now()}`,
        },
      };
    }

    return res;
  },

  async loginAsDemo() {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'alex.rivera@example.com', password: 'demo' },
    });

    if (res && res.success && res.data) {
      await financialStore.init(res.data.user.id);
      return res;
    }

    // Offline simulation fallback
    await financialStore.init('usr_demo_1001');
    return {
      success: true,
      message: 'Logged in as Demo User',
      data: {
        user: {
          id: 'usr_demo_1001',
          name: 'Alex Rivera',
          email: 'alex.rivera@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          tag: '@alexrivera',
          kycStatus: 'verified',
          tier: 'Metal Premium',
          isDemo: true,
        },
        token: `sim_jwt_token_demo_${Date.now()}`,
      },
    };
  },

  async register(name, email, password) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });

    if (res && res.success && res.data) {
      await financialStore.init(res.data.user.id);
      return res;
    }

    if (res?.isNetworkError) {
      const userId = `usr_${Math.abs(email.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0)).toString(16)}`;
      await financialStore.init(userId);
      return {
        success: true,
        message: 'Account created (offline simulation)',
        data: {
          user: {
            id: userId,
            name,
            email: email.toLowerCase(),
            avatar: null,
            tag: `@${name.toLowerCase().replace(/\s+/g, '')}`,
            kycStatus: 'verified',
            tier: 'Standard',
            isDemo: false,
          },
          token: `sim_jwt_token_user_${Date.now()}`,
        },
      };
    }

    return res;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (_e) {
      // Ignore
    }
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  },

  async getCurrentUser() {
    return await apiRequest('/auth/me');
  },
};
