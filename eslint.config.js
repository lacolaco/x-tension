// @ts-check
import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default defineConfig(
  globalIgnores(['.output/', '.wxt/', 'dist/', 'node_modules/', '*.config.js', '*.config.ts']),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    linterOptions: {
      noInlineConfig: true
    }
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.test.ts'],
    extends: [angular.configs.tsRecommended],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // Enforce signal best practices including readonly
      '@angular-eslint/prefer-signals': [
        'error',
        {
          preferReadonlySignalProperties: true,
        },
      ],
      // Enforce proper promise handling
      '@typescript-eslint/no-floating-promises': 'error',
      'no-void': 'error',
      // Restrict unsafe type assertions
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      // Enforce readonly on members that are never reassigned
      '@typescript-eslint/prefer-readonly': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      // Allow non-null assertions in tests - test will fail if assumption is wrong
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
