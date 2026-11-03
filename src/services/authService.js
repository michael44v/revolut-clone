import { apiRequest } from './api';
import { financialStore } from './financialStore';

/**
 * Authentication service
 * Communicates strictly with PHP backend endpoints:
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
      // Synchronize local financial store with authenticated user ID
      await financialStore.init(res.data.user.id);
      return res;
    }

    // Do NOT create synthetic sessions for unauthenticated users.
    // Return the actual error message from the backend or network failure.
    return {
      success: false,
      message: res?.message || 'Invalid email or password credentials',
      data: null,
    };
  },

  async loginAsDemo() {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'alex.rivera@example.com', password: 'demo123' },
    });

    if (res && res.success && res.data) {
      await financialStore.init(res.data.user.id);
      return res;
    }

    // If backend is unreachable, fallback to the seeded demo store
    if (res?.isNetworkError) {
      await financialStore.init('usr_demo_1001');
      return {
        success: true,
        message: 'Logged in as Demo User (Offline Mode)',
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
    }

    return {
      success: false,
      message: res?.message || 'Failed to authenticate demo account',
      data: null,
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

    return {
      success: false,
      message: res?.message || 'Failed to register account',
      data: null,
    };
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

  async updateAvatar(imageBase64OrUrl) {
    const isBase64 = imageBase64OrUrl.startsWith('data:') || imageBase64OrUrl.length > 500;
    const body = isBase64 ? { imageBase64: imageBase64OrUrl } : { avatarUrl: imageBase64OrUrl };

    const res = await apiRequest('/users/update_avatar', {
      method: 'POST',
      body,
    });

    if (res && res.success && res.data) {
      return res;
    }

    return {
      success: false,
      message: res?.message || 'Failed to update avatar',
      data: null,
    };
  },
};
