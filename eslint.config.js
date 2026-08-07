const expo = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const reactNativeA11yPlugin = require('eslint-plugin-react-native-a11y');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Expo's opinionated React Native + TypeScript rules
  ...expo,
  // Disable ESLint rules that conflict with Prettier formatting
  prettierConfig,
  // Project-level overrides
  {
    plugins: { prettier: prettierPlugin, 'jsx-a11y': jsxA11yPlugin },
    rules: {
      'prettier/prettier': 'warn',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-redundant-roles': 'off',
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    plugins: { 'react-native-a11y': reactNativeA11yPlugin },
    rules: {
      'react-native-a11y/has-valid-accessibility-descriptors': 'warn',
      'react-native-a11y/no-nested-touchables': 'warn',
    },
  },
  {
    ignores: ['dist/', 'android/', 'ios/', '.expo/', 'node_modules/', 'expo-env.d.ts'],
  },
];
