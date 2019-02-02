import { createStore, combineReducers, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { composeWithDevTools } from 'redux-devtools-extension'
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

const store = createStore(
  combineReducers({
    user: userReducer,
    app: appReducer,
  }),
  composeWithDevTools(
    applyMiddleware(saga)
  )
)

saga.run(rootSaga)

export default store
