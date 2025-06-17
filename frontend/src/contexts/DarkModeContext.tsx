import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface DarkModeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
  loading: boolean;
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggleDarkMode: () => {},
  loading: true,
});

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load dark mode preference from profile or localStorage
  useEffect(() => {
    const loadDarkModePreference = async () => {
      try {
        if (user) {
          // User is logged in, fetch from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('dark_mode')
            .eq('id', user.id)
            .single();

          if (profile && profile.dark_mode !== null) {
            setIsDark(profile.dark_mode);
            applyDarkMode(profile.dark_mode);
          } else {
            // Fallback to localStorage if profile doesn't have preference
            const localPreference = localStorage.getItem('darkMode');
            const darkMode = localPreference === 'true';
            setIsDark(darkMode);
            applyDarkMode(darkMode);
          }
        } else {
          // User not logged in, use localStorage
          const localPreference = localStorage.getItem('darkMode');
          const darkMode = localPreference === 'true';
          setIsDark(darkMode);
          applyDarkMode(darkMode);
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
        // Fallback to localStorage
        const localPreference = localStorage.getItem('darkMode');
        const darkMode = localPreference === 'true';
        setIsDark(darkMode);
        applyDarkMode(darkMode);
      } finally {
        setLoading(false);
      }
    };

    loadDarkModePreference();
  }, [user]);

  const applyDarkMode = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    applyDarkMode(newDarkMode);

    // Save to localStorage immediately for responsiveness
    localStorage.setItem('darkMode', newDarkMode.toString());

    // Save to profile if user is logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ dark_mode: newDarkMode })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving dark mode preference:', error);
      }
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode, loading }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  return useContext(DarkModeContext);
}; 