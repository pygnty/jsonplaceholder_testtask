import js from '@eslint/js';
import globals from 'globals';
import jest from 'eslint-plugin-jest';

export default [
  { ignores: ['node_modules/', 'coverage/'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'object-shorthand': 'error',
      'prefer-template': 'error',
    },
  },

  {
    files: ['tests/**/*.js'],
    ...jest.configs['flat/recommended'],
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
    },
  },
];
