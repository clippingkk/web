import { client } from "../services/ajax"
import meQuery from '../schema/profile.graphql'
import { profile, profileVariables } from "../schema/__generated__/profile"
import store from "../store"
import { AUTH_LOGIN } from "../store/user/type"

class MyProfile {
  private _token = ''
  private _uid = -1
  static readonly TOKEN_KEY = 'clippingkk-token'
  static readonly UID_KEY = 'clippingkk-uid'

  constructor() {
    const t = localStorage.getItem(MyProfile.TOKEN_KEY)
    const u = localStorage.getItem(MyProfile.UID_KEY)

    if (t) {
      this._token = t
    }
    if (u) {
      this._uid = ~~u
    }

    setTimeout(() => {
      this.initProfileData()
    }, 10)
  }

  private initProfileData() {
    if (this.uid === -1) {
      return
    }
    client.query<profile, profileVariables>({
      query: meQuery,
      variables: {
        id: this.uid
      }
    }).then((res) => {
      store.dispatch({ type: AUTH_LOGIN, profile: res.data.me, token: this.token })
    })
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
