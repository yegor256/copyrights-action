/**
 * SPDX-FileCopyrightText: Copyright (c) 2024-2026 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const { configs } = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/'],
  },
  {
    ...configs.all,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'module'
    },
    rules: {
      ...configs.all.rules,
      'comma-dangle': 'off',
      'indent': ['error', 2],
      'max-len': ['error', { code: 100 }],
      'no-implicit-globals': 'off',
      'no-magic-numbers': 'off',
      'no-undef': 'off',
      'one-var': 'off'
    }
  }
];
