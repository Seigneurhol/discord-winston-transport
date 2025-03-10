import js from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginSecurity from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Base configurations
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  // TODO See if I uses these rules in the future
  // ...tsEslint.configs.recommendedTypeChecked,
  ...tsEslint.configs.strict,
  ...tsEslint.configs.stylistic,
  pluginSecurity.configs.recommended,
  ...compat.extends('airbnb-base'),

  // TypeScript-specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      security: pluginSecurity,
      prettier,
    },
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        NodeJS: true,
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // TODO See if I uses these rules in the future
      // '@typescript-eslint/no-explicit-any': 'warn',
      // '@typescript-eslint/no-unsafe-assignment': 'warn',
      // '@typescript-eslint/no-unsafe-member-access': 'warn',
      // '@typescript-eslint/no-unsafe-call': 'warn',

      // General rules
      'no-console': 'warn',
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'security/detect-object-injection': 'off',
      'no-shadow': 'off', // Turned off in favor of @typescript-eslint/no-shadow

      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.ts', '**/tests/**'],
        },
      ],
    },
  },

  // JavaScript-specific configuration
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      'coverage/**/*',
      'build/**/*',
      '**/*.d.ts',
      '**/*.min.*',
      'eslint.config.mjs',
      'bin/**',
    ],
  },

  // Prettier must be last
  eslintConfigPrettier,
];
