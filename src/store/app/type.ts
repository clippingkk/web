export const CHANGE_BACKGROUND = 'app.CHANGE_BACKGROUND'

export type TAppAction = {
  type: string
  background: string
}

export type TAppState = {
  background: string
}

export function changeBackground(background: string): TAppAction {
  return {
    type: CHANGE_BACKGROUND,
    background
  }
}
