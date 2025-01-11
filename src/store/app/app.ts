import { TAppAction, TAppState, CHANGE_BACKGROUND } from './type'

const init: TAppState = {
  background: ''
}

export default function appReducer(state = init, action: TAppAction): TAppState {
  switch (action.type) {
    case CHANGE_BACKGROUND:
      return { background: action.background }
    default:
      return state
  }
}
