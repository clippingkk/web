import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const config = [
  ...compat.extends('next', 'next/core-web-vitals', 'next/typescript', 'plugin:@tanstack/query/recommended'),
  {
    'ignores': [
      'tailwind.config.js',
      'src/gql/**/*.ts',
      'src/**/*.mdx',
      'src/types.g.ts',
      'src/schema/generated.tsx'
    ],
    'rules': {
      'indent': [
        'error',
        2,
        { 'SwitchCase': 1 }
      ],
      'react/jsx-indent': [
        2,
        2
      ],
      'no-tabs': 0,
      'semi': [
        'error',
        'never'
      ],
      'react-hooks/rules-of-hooks': 'warn',
      'quotes': [
        2,
        'single',
        {
          'avoidEscape': true
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'all',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ]
    }
  }]

export default config
