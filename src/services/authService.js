import { financialStore } from './financialStore';

/**
 * Authentication service
 * Fully compatible with future procedural PHP auth endpoints:
 * /api/v1/auth/login.php
 * /api/v1/auth/register.php
 * /api/v1/auth/logout.php
 */

const DEMO_USER = {
  id: 'usr_demo_1001',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 234-5678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  tag: '@alexrivera',
  kycStatus: 'verified',
  tier: 'Metal Premium',
  isDemo: true,
  createdAt: '2024-01-15T09:00:00Z',
};

export const authService = {
  async login(email, password) {
    await new Promise((r) => setTimeout(r, 300));
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
        errors: ['Missing credentials'],
      };
    }

    if (email.toLowerCase() === 'alex.rivera@example.com' || email.toLowerCase().includes('demo')) {
      await financialStore.init(DEMO_USER.id);
      return {
        success: true,
        message: 'Logged in successfully as Demo User',
        data: {
          user: DEMO_USER,
          token: `sim_jwt_token_demo_${Date.now()}`,
        },
      };
    }

    const userId = `usr_${Math.abs(
      email
        .split('')
        .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(16)}`;

    const standardUser = {
      id: userId,
      name: email.split('@')[0],
      email: email.toLowerCase(),
      avatar: null,
      tag: `@${email.split('@')[0]}`,
      kycStatus: 'verified',
      tier: 'Standard',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    await financialStore.init(userId);

    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: standardUser,
        token: `sim_jwt_token_user_${Date.now()}`,
      },
    };
  },

  async loginAsDemo() {
    await new Promise((r) => setTimeout(r, 200));
    await financialStore.init(DEMO_USER.id);
    return {
      success: true,
      message: 'Logged in as Demo User',
      data: {
        user: DEMO_USER,
        token: `sim_jwt_token_demo_${Date.now()}`,
      },
    };
  },

  async register(name, email, password) {
    await new Promise((r) => setTimeout(r, 350));
    if (!name || !email || !password) {
      return {
        success: false,
        message: 'All fields are required',
        errors: ['Invalid input'],
      };
    }

    const userId = `usr_${Math.abs(
      email
        .split('')
        .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(16)}`;

    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      avatar: null,
      tag: `@${name.toLowerCase().replace(/\s+/g, '')}`,
      kycStatus: 'verified',
      tier: 'Standard',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    await financialStore.init(userId);

    return {
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token: `sim_jwt_token_user_${Date.now()}`,
      },
    };
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 100));
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  },
};
