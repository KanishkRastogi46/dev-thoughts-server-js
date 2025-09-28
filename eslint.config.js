// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname, // Or your project's root directory
});

export default [
  // Basic ESLint recommended rules
  js.configs.recommended,

  // TypeScript specific configurations
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json', // Path to your tsconfig.json
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs['eslint-recommended'].rules,
      ...typescriptPlugin.configs.recommended.rules,
      // Add or override specific TypeScript rules here
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Prettier integration
  prettierConfig, // Disables ESLint rules that conflict with Prettier
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // Enforces Prettier formatting
    },
  },

  // Custom rules or overrides for your project
  {
    rules: {
      'no-console': 'warn', // Example: warn on console.log
      // Add other project-specific rules here
    },
  },
];