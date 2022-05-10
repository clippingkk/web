import { createStore, combineReducers, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import userReducer, { initParseFromLS } from './user/user'
import rootSaga from './saga';
import appReducer from './app/app';
import { AUTH_LOGIN, TUserState } from './user/type';
import { TAppState } from './app/type';

export type TGlobalStore = {
  user: TUserState,
  app: TAppState
}

const saga = createSagaMiddleware()

const store = createStore(
  combineReducers({
    user: userReducer,
    app: appReducer,
  }),
  // composeWithDevTools(
  applyMiddleware(saga)
  // )
)

saga.run(rootSaga)
const nt = initParseFromLS()

// 初次加载
if (nt) {
  store.dispatch({ type: AUTH_LOGIN, token: nt.token, profile: nt.profile })
}

export default store
