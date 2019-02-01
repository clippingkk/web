import { createStore, combineReducers, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { composeWithDevTools } from 'redux-devtools-extension'
import userReducer from './user/user'
import rootSaga from './saga';

const saga = createSagaMiddleware()

const store = createStore(
  combineReducers({
    user: userReducer
  }),
  composeWithDevTools(
    applyMiddleware(saga)
  )
)

saga.run(rootSaga)

export default store
