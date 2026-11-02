import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { storage } from '../utils/storage';
import { lightColors, darkColors, typography, spacing, radii, shadows } from '../theme/tokens';

const THEME_STORAGE_KEY = 'app_user_theme_preference';

const ThemeContext = createContext({
  themeMode: 'system', // 'light' | 'dark' | 'system'
  isDark: false,
  colors: lightColors,
  typography,
  spacing,
  radii,
  shadows,
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await storage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemeModeState(saved);
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    try {
      await storage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      // Ignore
    }
  };

  const isDark =
    themeMode === 'system'
      ? deviceColorScheme === 'dark'
      : themeMode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        typography,
        spacing,
        radii,
        shadows,
        setThemeMode,
        isLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
