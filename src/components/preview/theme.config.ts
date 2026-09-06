export enum Theme {
  classic = 0,
  colorful = 1,
  dark = 2,
  young = 3,
  light = 4,
}

export const themes = [
  {
    id: Theme.classic,
    name: 'Classic',
    background: '#f6f0e4',
    color: '#201c19',
    accent: '#a33624',
  },
  {
    id: Theme.colorful,
    name: 'Colorful',
    background: 'linear-gradient(145deg, #ffce32, #ff775e)',
    color: '#29143d',
    accent: '#622475',
  },
  {
    id: Theme.dark,
    name: 'Noir',
    background: 'linear-gradient(145deg, #101827, #293956)',
    color: '#ffffff',
    accent: '#b9f36c',
  },
  {
    id: Theme.young,
    name: 'Young',
    background: 'linear-gradient(145deg, #bbf579, #65dccd)',
    color: '#12352d',
    accent: '#235a49',
  },
  {
    id: Theme.light,
    name: 'Bright',
    background: 'linear-gradient(145deg, #d5c5ff, #b7e5ff)',
    color: '#292047',
    accent: '#64429f',
  },
] as const
