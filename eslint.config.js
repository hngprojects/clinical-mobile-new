const expo = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Expo's opinionated React Native + TypeScript rules
  ...expo,
  // Disable ESLint rules that conflict with Prettier formatting
  prettierConfig,
  // Project-level overrides
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    ignores: ['dist/', 'android/', 'ios/', '.expo/', 'node_modules/', 'expo-env.d.ts'],
  },
];
