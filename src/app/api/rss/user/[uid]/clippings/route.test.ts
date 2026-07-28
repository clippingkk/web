const { connection } = vi.hoisted(() => ({
  connection: vi.fn<() => Promise<void>>(),
}))

vi.mock('next/server', () => ({ connection }))

import { GET } from './route'

beforeEach(() => {
  connection.mockResolvedValue()
})

test('defers RSS generation to request time', async () => {
  const params = Promise.resolve().then(() => {
    expect(connection).toHaveBeenCalledOnce()
    return { uid: '0' }
  })

  await expect(
    GET(new Request('https://clippingkk.example/api/rss/user/0/clippings'), {
      params,
    })
  ).rejects.toMatchObject({ message: 'user id not found' })
})
