
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
  }

  get token(): string {
    return this._token
  }
  get uid(): number {
    return this._uid
  }

  set token(v: string) {
    localStorage.setItem(MyProfile.TOKEN_KEY, v)
  }
  set uid(uid: number) {
    localStorage.setItem(MyProfile.UID_KEY, uid.toString())
  }
}

export default new MyProfile()
