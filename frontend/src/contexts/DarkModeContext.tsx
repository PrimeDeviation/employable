import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

type ThemePreference = 'light' | 'dark' | 'system';

interface DarkModeContextType {
  theme: ThemePreference;
  isDark: boolean;
  setTheme: (theme: ThemePreference) => void;
  loading: boolean;
}

const DarkModeContext = createContext<DarkModeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
  loading: true,
});

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Function to get system preference
  const getSystemPreference = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Function to calculate actual dark mode state based on theme
  const calculateIsDark = (themePreference: ThemePreference): boolean => {
    switch (themePreference) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
        return getSystemPreference();
      default:
        return false;
    }
  };

  // Apply dark mode to DOM
  const applyDarkMode = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  // Load theme preference from profile or localStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        if (user) {
          // User is logged in, fetch from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme')
            .eq('id', user.id)
            .single();

          if (profile && profile.theme) {
            const userTheme = profile.theme as ThemePreference;
            setThemeState(userTheme);
            const calculatedDark = calculateIsDark(userTheme);
            setIsDark(calculatedDark);
            applyDarkMode(calculatedDark);
          } else {
            // Fallback to localStorage if profile doesn't have preference
            const localPreference = localStorage.getItem('theme') as ThemePreference;
            const fallbackTheme = localPreference || 'system';
            setThemeState(fallbackTheme);
            const calculatedDark = calculateIsDark(fallbackTheme);
            setIsDark(calculatedDark);
            applyDarkMode(calculatedDark);
          }
        } else {
          // User not logged in, use localStorage
          const localPreference = localStorage.getItem('theme') as ThemePreference;
          const fallbackTheme = localPreference || 'system';
          setThemeState(fallbackTheme);
          const calculatedDark = calculateIsDark(fallbackTheme);
          setIsDark(calculatedDark);
          applyDarkMode(calculatedDark);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to system
        setThemeState('system');
        const systemDark = getSystemPreference();
        setIsDark(systemDark);
        applyDarkMode(systemDark);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [user]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        applyDarkMode(e.matches);
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme]);

  const setTheme = async (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    const calculatedDark = calculateIsDark(newTheme);
    setIsDark(calculatedDark);
    applyDarkMode(calculatedDark);

    // Save to localStorage immediately for responsiveness
    localStorage.setItem('theme', newTheme);

    // Save to profile if user is logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  return (
    <DarkModeContext.Provider value={{ theme, isDark, setTheme, loading }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  return useContext(DarkModeContext);
}; 