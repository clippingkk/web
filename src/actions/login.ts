'use server'
export async function syncLoginStateToServer(_data: {
  uid: number
  token: string
}) {
  throw new Error('Browser login now requires Gate. Open /auth.')
}
