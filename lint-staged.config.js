module.exports = {
  // Backend TypeScript/JavaScript files
  'apps/backend/**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write'
  ],

  // Frontend TypeScript/JavaScript files
  'apps/frontend/**/*.{js,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],

  // JSON files
  '**/*.json': [
    'prettier --write'
  ],

  // Markdown files
  '**/*.md': [
    'prettier --write'
  ],

  // CSS/SCSS files
  '**/*.{css,scss}': [
    'prettier --write'
  ]
};
