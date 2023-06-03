'use client';

import { useEffect } from "react"
import store from "../store"
import { AUTH_LOGIN } from "../store/user/type"
import { initParseFromLS } from "../utils/storage";
import { useApolloClient } from "@apollo/client";

export function useLayoutInit() {
  const client = useApolloClient()
  useEffect(() => {
    (async function () {
      const nt = await initParseFromLS(client)
      // 初次加载
      if (!nt) {
        return
      }

      store.dispatch({ type: AUTH_LOGIN, token: nt.token, profile: nt.profile })
    })()
  }, [])
}
