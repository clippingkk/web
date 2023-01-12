import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import userReducer, { initParseFromLS } from './user/user'
import rootSaga from './saga';
import appReducer from './app/app';
import { IUserAction, TUserState } from './user/type';
import { TAppAction, TAppState } from './app/type';

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
    return getDefaultMiddleware({ thunk: false }).prepend(saga);
  },
})

saga.run(rootSaga)
const nt = initParseFromLS()


export default store
