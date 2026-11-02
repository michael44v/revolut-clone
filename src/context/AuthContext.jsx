import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

const AUTH_TOKEN_KEY = 'app_auth_jwt_token';
const AUTH_USER_KEY = 'app_auth_user_data';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isDemoUser: false,
  isLoading: true,
  login: async () => {},
  loginAsDemo: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await storage.getItem(AUTH_TOKEN_KEY);
        const storedUserData = await storage.getItem(AUTH_USER_KEY);
        if (storedToken && storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setUser(parsedUser);
          setIsDemoUser(Boolean(parsedUser.isDemo));
        }
      } catch (err) {
        console.warn('Failed restoring auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success && response.data) {
      const { user: userData, token } = response.data;
      setUser(userData);
      setIsDemoUser(false);
      await storage.setItem(AUTH_TOKEN_KEY, token);
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: response.message || 'Login failed' };
  };

  const loginAsDemo = async () => {
    const response = await authService.loginAsDemo();
    if (response.success && response.data) {
      const { user: userData, token } = response.data;
      setUser(userData);
      setIsDemoUser(true);
      await storage.setItem(AUTH_TOKEN_KEY, token);
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Failed to start demo' };
  };

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    if (response.success && response.data) {
      const { user: userData, token } = response.data;
      setUser(userData);
      setIsDemoUser(false);
      await storage.setItem(AUTH_TOKEN_KEY, token);
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: response.message || 'Registration failed' };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setIsDemoUser(false);
      try {
        await storage.deleteItem(AUTH_TOKEN_KEY);
        await storage.deleteItem(AUTH_USER_KEY);
      } catch (err) {
        // Ignore
      }
    }
  };

  const updateUser = (updater) => {
    setUser((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      storage.setItem(AUTH_USER_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isDemoUser,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
