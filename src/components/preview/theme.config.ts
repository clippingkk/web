import { RGBColor } from '../../services/mp'

export enum Theme {
    classic = 0,
    colorful = 1,
    dark = 2,
    young = 3,
    light = 4,
}

export type ThemeConfig = {
    padding: string
    bg: string
    fontColor: string
    fontFamily: string
    footerBlur: string
    footerBg: string
    qrLineColor?: RGBColor
    withQRCodeBg?: boolean
}

export const themeList: {[k in Theme]: ThemeConfig} = {
  [Theme.classic]: {
    padding: '1rem',
    bg: '#fff',
    fontColor: '#000',
    fontFamily: '',
    footerBlur: '30px',
    footerBg: 'rgba(255, 255, 255, .3)'
  },
  [Theme.colorful]: {
    padding: '1rem',
    bg: '',
    fontColor: '',
    fontFamily: '',
    footerBlur: '30px',
    footerBg: 'rgba(255, 255, 255, .3)'
  },
  [Theme.dark]: {
    padding: '1rem',
    bg: 'rgba(27, 41, 68, 1)',
    fontColor: '#cdd5f3',
    fontFamily: '',
    footerBlur: '30px',
    footerBg: 'rgba(89, 123, 192, 0.6)',
    qrLineColor: { r: 255, g: 255, b: 255 },
    withQRCodeBg: true,
  },
  [Theme.young]: {
    padding: '1rem',
    bg: 'linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1)',
    fontColor: 'rgba(27, 41, 68, 1)',
    fontFamily: '',
    footerBlur: '30px',
    footerBg: 'rgba(255, 255, 255, .3)'
  },
  [Theme.light]: {
    padding: '1rem',
    bg: 'linear-gradient(225deg,#9cccfc 0,#e6cefd 99.54%)',
    fontColor: '#343746',
    fontFamily: '',
    footerBlur: '30px',
    footerBg: 'rgba(255, 255, 255, .3)'
  },
}
