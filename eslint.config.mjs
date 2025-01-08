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
    ],
    'rules': {
      'indent': [
        'error',
        2
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
      ]
    }
  }]

export default config
