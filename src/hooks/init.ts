'use client';

import { useEffect } from "react"
import store from "../store"
import { AUTH_LOGIN } from "../store/user/type"
import { initParseFromLS } from "../store/user/user"

export function useLayoutInit() {
  useEffect(() => {
    const nt = initParseFromLS()
    // 初次加载
    if (nt) {
      store.dispatch({ type: AUTH_LOGIN, token: nt.token, profile: nt.profile })
    }
  }, [])
}
