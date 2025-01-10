export async function digestMessage(message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hash = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hash)) // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex
}
