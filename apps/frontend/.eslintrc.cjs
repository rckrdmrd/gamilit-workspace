const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = 'eslint-rules';

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'plugin:storybook/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'rulesdir'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    // Custom rule to prevent API route issues (auto-fix enabled)
    'rulesdir/no-api-route-issues': 'error',
    // Prevent hardcoded API routes - must use API_ENDPOINTS from apiConfig.ts
    // Note: Manual review required for routes. Run: grep -r "apiClient\\.get.*'/v1" apps/frontend/src
    // ESQuery regex limitations prevent automated checking. See README.md for API configuration guidelines.
  },
};
