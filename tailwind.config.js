module.exports = {
  darkMode: 'class',
  // future: {
  //   removeDeprecatedGapUtilities: true,
  //   purgeLayersByDefault: true,
  // },
  content: [
    'src/**/*.tsx',
    'src/**/*.jsx',
    './node_modules/tailwindcss-dark-mode/prefers-dark.js',
    'src/prefers-dark.ts'
  ],
  plugins: [
    require('@tailwindcss/forms'),
  ],
  // whitelist: ['mode-dark'],
  theme: {
    extend: {
      fontFamily: {
        lxgw: ['var(--font-lxgw)'],
        lato: ['var(--font-lato)'],
      },
      width: {
        '128': '32rem',
        '144': '36rem',
      },
      height: {
        '128': '32rem',
        '144': '36rem',
        '156': '40rem',
      }
    }
  },
  // variants: {
  //   backgroundColor: ['dark', 'dark-hover', 'dark-group-hover', 'dark-even', 'dark-odd', 'hover'],
  //   borderColor: ['dark', 'dark-disabled', 'dark-focus', 'dark-focus-within', 'hover'],
  //   textColor: ['dark', 'dark-hover', 'dark-active', 'dark-placeholder', 'hover']
  // },
  // plugins: [
  //   require('tailwindcss-dark-mode')()
  // ]
}
