import eslint from '@eslint/js'
import nodePlugin from 'eslint-plugin-n'

export default [
  eslint.configs.recommended,
  nodePlugin.configs['flat/recommended'],
  {
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.cjs', 'test/cjslib/**/*.js', 'test/ambiguous/file.cjs.js', 'src/checkType.js'],
    rules: {
      // This package is defined as a module, but needs to use `require` to work
      'no-undef': 'off',
    },
  },
  {
    files: ['src/moduleType.js', 'test/moduleType.js'],
    rules: {
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          ignores: ['import.meta.dirname', 'test.describe'],
        },
      ],
    },
  },
]
