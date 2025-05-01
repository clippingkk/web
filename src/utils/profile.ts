'use client'
import Cookies from 'js-cookie'

class MyProfile {
  private _token = ''
  private _uid = -1
  static readonly TOKEN_KEY = 'clippingkk-token'
  static readonly UID_KEY = 'clippingkk-uid'

  constructor() {
    if (typeof localStorage === 'undefined') {
      return
    }
    let t = localStorage.getItem(MyProfile.TOKEN_KEY)
    let u = localStorage.getItem(MyProfile.UID_KEY)

    if (!t) {
      t = Cookies.get('token') ?? ''
    }
    if (!u) {
      u = Cookies.get('uid') ?? null
    }

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
    this._token = ''
    this._uid = -1
    Cookies.remove('token')
    Cookies.remove('uid')
    localStorage.clear()
    sessionStorage.clear()
  }
}

export default new MyProfile()

export { getMyHomeLink } from './profile.utils'
