/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  rules: {
    // Add any project-specific overrides here
  },
};
