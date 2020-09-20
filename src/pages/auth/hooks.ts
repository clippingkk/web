import { navigate, useNavigate } from "@reach/router"
import mixpanel from "mixpanel-browser"
import * as sentry from '@sentry/browser'
import { useEffect } from "react"
import profile from "../../utils/profile"
import { LazyQueryResult } from "@apollo/client"
import { auth } from "../../schema/__generated__/auth"
import { authVariables } from "../../schema/__generated__/auth"

export function useAuthSuccessed(result: LazyQueryResult<auth, authVariables>) {
  const navigate = useNavigate()
  useEffect(() => {
    const {called, error, data, loading} = result
    if (called && !error && data && !loading) {
      profile.token = data.auth.token
      profile.uid = data.auth.user.id
      const me = data.auth.user
      sentry.setUser({
        email: me.email,
        id: me.id.toString(),
        username: me.name
      })
      mixpanel.identify(me.id.toString())
      mixpanel.people.set({
        "$email": me.email,
        "Sign up date": me.createdAt,
        "USER_ID": me.id.toString(),
      });
      mixpanel.track('login')
      // redirect
      navigate(`/dash/${me.id}/home`)
    }
  }, [result])
}
