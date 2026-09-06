'use client'
class MyProfile {
  private uidValue = -1
  get token() {
    return ''
  }
  set token(_value: string) {}
  get uid() {
    return this.uidValue
  }
  set uid(value: number) {
    this.uidValue = value
  }
  onLogout() {
    this.uidValue = -1
    if (typeof window === 'undefined') return
    for (const storage of [localStorage, sessionStorage])
      for (const key of [
        'ck-token',
        'ck-uid',
        'clippingkk-token',
        'clippingkk-uid',
        'REACT_QUERY_OFFLINE_CACHE',
      ])
        storage.removeItem(key)
  }
}
export default new MyProfile()
export { getMyHomeLink } from './profile.utils'
