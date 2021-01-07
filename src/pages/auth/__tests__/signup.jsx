
import React from 'react'
import configureStore from 'redux-mock-store'

import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor, screen, cleanup } from '@testing-library/react'
import Signup from '../signup'
import { Router } from '@reach/router'
import { Provider } from 'react-redux'
import { act } from 'react-dom/test-utils'
// test.afterEach(cleanup)
const mockStore = configureStore()

const s = mockStore({})

test('signp page shown', async () => {
  render(
    <Provider store={s}>
      <MockedProvider mocks={[]} addTypename={false}>
        <Router>
          <Signup path='/signup' default />
        </Router>
      </MockedProvider>
    </Provider>
  )

  await waitFor(() => screen.getByText('let me in'))
  act(() => {
    
  })
  expect(screen.getByText('let me in').tagName).toEqual('button'.toUpperCase())
})
