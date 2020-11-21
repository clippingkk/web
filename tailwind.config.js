module.exports = {
  darkMode: 'class',
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [
    'src/**/*.tsx',
    'src/**/*.jsx',
    './node_modules/tailwindcss-dark-mode/prefers-dark.js',
    'src/prefers-dark.ts'
  ],
  // whitelist: ['mode-dark'],
  theme: {
    extend: {}
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
