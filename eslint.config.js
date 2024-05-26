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
    files: ['**/*.cjs', 'test/cjslib/**/*.js', 'src/checkType.js'],
    rules: {
      // This package is defined as a module, but needs to use `require` to work
      'no-undef': 'off',
    },
  },
]
