import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user/user'
import appReducer from './app/app'
import { TUserState } from './user/type'
import { TAppState } from './app/type'

export type TGlobalStore = {
  user: TUserState,
  app: TAppState
}

const store = configureStore({
  reducer: combineReducers({
    user: userReducer,
    app: appReducer,
  }),
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ thunk: false })
  },
  preloadedState: typeof window !== 'undefined' ? (window as any).__PRELOADED_STATE__ : {}
})

export default store
