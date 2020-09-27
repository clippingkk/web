module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [
    "src/**/*.tsx",
    "src/**/*.jsx"
  ],
  whitelist: ['mode-dark'],
  theme: {
    extend: {}
  },
  variants: {
    backgroundColor: ['dark', 'dark-hover', 'dark-group-hover', 'dark-even', 'dark-odd', 'hover'],
    borderColor: ['dark', 'dark-disabled', 'dark-focus', 'dark-focus-within', 'hover'],
    textColor: ['dark', 'dark-hover', 'dark-active', 'dark-placeholder', 'hover']
  },
  plugins: [
    require('tailwindcss-dark-mode')()
  ]
}
