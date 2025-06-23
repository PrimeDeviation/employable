import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useTeamInvitations } from '../features/team-management/hooks/useTeamInvitations';

// Direct navigation links
const directLinks = [
  { to: '/resources', label: 'Browse Resources' },
  { to: '/teams/browse', label: 'Browse Teams' },
  { to: '/offers', label: 'Browse Offers' },
  { to: '/teams', label: 'My Teams' },
  { to: '/contracts', label: 'Contracts' },
  { to: '/account', label: 'Profile' },
];

const Navbar: React.FC = () => {
  const { theme, isDark, setTheme } = useDarkMode();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLButtonElement | null>(null);
  const { pendingCount } = useTeamInvitations();

  // TODO: Replace with actual admin check from auth context
  const isAdmin = false; // This should come from your auth context

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        );
      case 'light':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 3.25zm0 10a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5zm6.75-.75a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-1zm-13.5 0a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-1zm10.72-6.47a.75.75 0 011.06 1.06l-.71.71a.75.75 0 11-1.06-1.06l.71-.71zm-8.49 8.49a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zm12.02 1.06a.75.75 0 01-1.06-1.06l.71-.71a.75.75 0 111.06 1.06l-.71.71zm-8.49-8.49a.75.75 0 01-1.06 1.06l-.71-.71a.75.75 0 111.06-1.06l.71.71z" />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow dark:shadow-none z-50 relative" style={{ zIndex: 100 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center relative">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-bold text-lg text-indigo-700 dark:text-indigo-300 hover:underline focus:outline-none">
              Employable Agents
            </Link>
          </div>

          {/* Centered Navigation */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-baseline space-x-6">
              {/* Direct Navigation Links */}
              {directLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors relative"
                >
                  {link.label}
                  {link.to === '/teams' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex-shrink-0 absolute right-0">
            <div className="relative">
              <button
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition focus:outline-none"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                type="button"
                aria-label="Theme selector"
                ref={themeMenuRef}
              >
                {getThemeIcon()}
              </button>
              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'light' ? 'bg-indigo-50 dark:bg-indigo-900' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 3.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 3.25zm0 10a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5zm6.75-.75a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-1zm-13.5 0a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-1zm10.72-6.47a.75.75 0 011.06 1.06l-.71.71a.75.75 0 11-1.06-1.06l.71-.71zm-8.49 8.49a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zm12.02 1.06a.75.75 0 01-1.06-1.06l.71-.71a.75.75 0 111.06 1.06l-.71.71zm-8.49-8.49a.75.75 0 01-1.06 1.06l-.71-.71a.75.75 0 111.06-1.06l.71.71z" />
                    </svg>
                    Light
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'bg-indigo-50 dark:bg-indigo-900' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    Dark
                  </button>
                  <button
                    onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'system' ? 'bg-indigo-50 dark:bg-indigo-900' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    System
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 