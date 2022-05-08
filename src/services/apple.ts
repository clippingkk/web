export type AppleAuthResponse = {
  authorization: {
    code: string
    id_token: string
    state: string
  }
}
