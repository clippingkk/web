import React from 'react'
import { useProfileQuery } from '../schema/generated'
import profile from '../utils/profile'
import { useDispatch } from 'react-redux'
import { AUTH_LOGIN } from '../store/user/type'
import { useLayoutInit } from '../hooks/init'

type InitProviderProps = {
  children: React.ReactNode
}

function InitProvider(props: InitProviderProps) {
  useLayoutInit()
  const dispatch = useDispatch()
  useProfileQuery({
    variables: {
      id: profile.uid,
    },
    skip: profile.uid <= 0,
    onCompleted(data) {
      dispatch({ type: AUTH_LOGIN, profile: data.me, token: profile.token })
    },
  })
  return props.children
}

export default InitProvider
