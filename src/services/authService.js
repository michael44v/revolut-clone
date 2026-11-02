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
    await new Promise((r) => setTimeout(r, 450));
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
        errors: ['Missing credentials'],
      };
    }

    if (email.toLowerCase() === 'alex.rivera@example.com' || email.includes('demo')) {
      return {
        success: true,
        message: 'Logged in successfully',
        data: {
          user: DEMO_USER,
          token: 'sim_jwt_token_demo_user_' + Date.now(),
        },
      };
    }

    const standardUser = {
      id: 'usr_' + Math.floor(Math.random() * 89999 + 10000),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      avatar: null,
      tag: '@' + email.split('@')[0],
      kycStatus: 'verified',
      tier: 'Standard',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: standardUser,
        token: 'sim_jwt_token_user_' + Date.now(),
      },
    };
  },

  async loginAsDemo() {
    await new Promise((r) => setTimeout(r, 300));
    return {
      success: true,
      message: 'Logged in as Demo User',
      data: {
        user: DEMO_USER,
        token: 'sim_jwt_token_demo_' + Date.now(),
      },
    };
  },

  async register(name, email, password) {
    await new Promise((r) => setTimeout(r, 500));
    if (!name || !email || !password) {
      return {
        success: false,
        message: 'All fields are required',
        errors: ['Invalid input'],
      };
    }

    const newUser = {
      id: 'usr_' + Math.floor(Math.random() * 89999 + 10000),
      name,
      email: email.toLowerCase(),
      avatar: null,
      tag: '@' + name.toLowerCase().replace(/\s+/g, ''),
      kycStatus: 'pending',
      tier: 'Standard',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token: 'sim_jwt_token_user_' + Date.now(),
      },
    };
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  },
};
