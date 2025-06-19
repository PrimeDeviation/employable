module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:boundaries/recommended',
  ],
  settings: {
    'boundaries/elements': [
      {
        type: 'legacy',
        pattern: 'pages',
      },
      {
        type: 'feature',
        pattern: 'features/*',
      },
    ],
    'boundaries/rules': [
      {
        from: ['feature'],
        to: ['legacy'],
        disallow: {
          'import-all': true,
          'import-default': true,
          'import-named': true,
        },
        message: 'Architectural Pattern Violation: A "feature" slice cannot import from the legacy "pages" directory.'
      },
    ],
  },
}; 