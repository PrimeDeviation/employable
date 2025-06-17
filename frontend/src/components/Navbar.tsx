import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const navSections = [
  {
    label: 'Core',
    links: [
      { to: '/', label: 'Home' },
      { to: '/login', label: 'Login' },
      { to: '/account', label: 'Account' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { to: '/resources', label: 'Browse' },
      { to: '/search', label: 'Search/Filtering' },
      { to: '/resource/:id', label: 'Detailed View' },
    ],
  },
  {
    label: 'Team & Management',
    links: [
      { to: '/teams', label: 'My Teams' },
      { to: '/resource-management', label: 'Resource Management' },
      { to: '/availability', label: 'Availability/Rate' },
    ],
  },
  {
    label: 'Engagement',
    links: [
      { to: '/messages', label: 'Messaging/Contact' },
      { to: '/contracts', label: 'Contracts' },
      { to: '/payments', label: 'Payments' },
    ],
  },
  {
    label: 'Profile',
    links: [
      { to: '/profile', label: 'Profile Population' },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/admin', label: 'Admin Panel' },
    ],
  },
];

const Navbar: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const navRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { theme, isDark, setTheme } = useDarkMode();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseEnter = (sectionLabel: string) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenSection(sectionLabel);
  };

  const handleMouseLeave = () => {
    // Add a small delay before closing to allow moving to dropdown
    closeTimeoutRef.current = setTimeout(() => {
      setOpenSection(null);
    }, 150);
  };

  const handleDropdownEnter = () => {
    // Clear any pending close timeout when entering dropdown
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownLeave = () => {
    // Close immediately when leaving dropdown area
    setOpenSection(null);
  };

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
        <div className="flex h-16 items-center justify-center relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="font-bold text-lg text-indigo-700 dark:text-indigo-300 mr-8 hover:underline focus:outline-none">Employable Agents</Link>

              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navSections.map((section, idx) => (
                    <div
                      key={section.label}
                      className="relative"
                      ref={el => { navRefs.current[idx] = el; }}
                      onMouseEnter={() => handleMouseEnter(section.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                        aria-haspopup="true"
                        aria-expanded={openSection === section.label}
                      >
                        {section.label}
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {openSection === section.label && navRefs.current[idx] && (
                        <div
                          className="fixed w-56 bg-white dark:bg-gray-800 rounded shadow-lg dark:shadow-none py-2 z-50 border border-gray-200 dark:border-gray-700"
                          style={{
                            top: (navRefs.current[idx]?.getBoundingClientRect().bottom || 0) + 4,
                            left: (navRefs.current[idx]?.getBoundingClientRect().left || 0) + (navRefs.current[idx]?.offsetWidth || 0) / 2 - 112,
                          }}
                          onMouseEnter={handleDropdownEnter}
                          onMouseLeave={handleDropdownLeave}
                        >
                          {section.links.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-700 rounded transition whitespace-nowrap"
                              onClick={() => setOpenSection(null)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                className="ml-8 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition focus:outline-none"
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