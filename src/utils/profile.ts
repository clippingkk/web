'use client';
import store from "../store"
import { AUTH_LOGIN } from "../store/user/type"
import { ProfileDocument, ProfileQuery, ProfileQueryVariables } from "../schema/generated"
import { makeApolloClient } from "../services/ajax";

class MyProfile {
  private _token = ''
  private _uid = -1
  static readonly TOKEN_KEY = 'clippingkk-token'
  static readonly UID_KEY = 'clippingkk-uid'

  constructor() {
    if (!process.browser) {
      return
    }
    const t = localStorage.getItem(MyProfile.TOKEN_KEY)
    const u = localStorage.getItem(MyProfile.UID_KEY)

    if (t) {
      this._token = t
    }
    if (u) {
      this._uid = ~~u
    }
  }

  get token(): string {
    return this._token
  }
  get uid(): number {
    return this._uid
  }

  set token(v: string) {
    this._token = v
    localStorage.setItem(MyProfile.TOKEN_KEY, v)
  }
  set uid(uid: number) {
    this._uid = uid
    localStorage.setItem(MyProfile.UID_KEY, uid.toString())
  }

  onLogout() {
    localStorage.clear()
    sessionStorage.clear()
  }
}

export default new MyProfile()

export function getMyHomeLink(p?: Pick<ProfileQuery['me'], 'id' | 'domain'>) {
  if (!p) {
    return '/auth/auth-v3'
  }
  const id = p.domain.length > 2 ? p.domain : p.id
  return `/dash/${id}/home`
}
