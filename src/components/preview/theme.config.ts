export enum Theme {
  classic = 0,
  colorful = 1,
  dark = 2,
  young = 3,
  light = 4,
}

// `surface` tints the note card and `line` draws hairlines; both stay legible
// over every stop of the theme's gradient.
export const themes = [
  {
    id: Theme.classic,
    name: 'Classic',
    background: '#f6f0e4',
    color: '#201c19',
    accent: '#a33624',
    surface: 'rgba(32, 28, 25, 0.055)',
    line: 'rgba(32, 28, 25, 0.16)',
  },
  {
    id: Theme.colorful,
    name: 'Colorful',
    background: 'linear-gradient(145deg, #ffce32, #ff775e)',
    color: '#29143d',
    accent: '#622475',
    surface: 'rgba(255, 255, 255, 0.32)',
    line: 'rgba(41, 20, 61, 0.2)',
  },
  {
    id: Theme.dark,
    name: 'Noir',
    background: 'linear-gradient(145deg, #101827, #293956)',
    color: '#ffffff',
    accent: '#b9f36c',
    surface: 'rgba(255, 255, 255, 0.07)',
    line: 'rgba(255, 255, 255, 0.16)',
  },
  {
    id: Theme.young,
    name: 'Young',
    background: 'linear-gradient(145deg, #bbf579, #65dccd)',
    color: '#12352d',
    accent: '#235a49',
    surface: 'rgba(255, 255, 255, 0.36)',
    line: 'rgba(18, 53, 45, 0.18)',
  },
  {
    id: Theme.light,
    name: 'Bright',
    background: 'linear-gradient(145deg, #d5c5ff, #b7e5ff)',
    color: '#292047',
    accent: '#64429f',
    surface: 'rgba(255, 255, 255, 0.46)',
    line: 'rgba(41, 32, 71, 0.16)',
  },
] as const
