import { combineReducers } from 'redux'
import { Tuple, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import userReducer from './user/user'
import rootSaga from './saga';
import appReducer from './app/app';
import { TUserState } from './user/type';
import { TAppState } from './app/type';

export type TGlobalStore = {
  user: TUserState,
  app: TAppState
}

const saga = createSagaMiddleware()

const store = configureStore({
  reducer: combineReducers({
    user: userReducer,
    app: appReducer,
  }),
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ thunk: false }).prepend(saga as any);
  },
  preloadedState: typeof window !== 'undefined' ? (window as any).__PRELOADED_STATE__ : {}
})

saga.run(rootSaga)

export default store
