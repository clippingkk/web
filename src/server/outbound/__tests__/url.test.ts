// @vitest-environment node

import { EventEmitter } from 'node:events'
import type { IncomingMessage } from 'node:http'
import { request } from 'node:https'
import type { RequestOptions } from 'node:https'

import {
  assertOutboundUrl,
  createPinnedLookup,
  isBlockedAddress,
  outboundFetch,
  OutboundUrlError,
  type OutboundExchange,
  type OutboundRequest,
} from '../url'

vi.mock('node:https', () => ({
  request: vi.fn(),
}))

const publicResolve = async () => [{ address: '1.1.1.1', family: 4 }] as const

beforeEach(() => {
  vi.mocked(request).mockReset()
  vi.mocked(request).mockImplementation(() => {
    throw new Error('https.request should not be called')
  })
})

describe('isBlockedAddress', () => {
  it.each([
    '0.0.0.0',
    '0.255.255.255',
    '10.0.0.0',
    '10.255.255.255',
    '100.64.0.0',
    '100.100.100.200',
    '100.127.255.255',
    '127.0.0.1',
    '127.255.255.255',
    '169.254.0.1',
    '169.254.169.254',
    '172.16.0.0',
    '172.31.255.255',
    '192.0.0.8',
    '192.0.2.1',
    '192.168.0.1',
    '192.168.255.255',
    '198.18.0.1',
    '198.51.100.1',
    '203.0.113.1',
    '224.0.0.1',
    '240.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    '::10.0.0.1',
    'fc00::1',
    'fd00:ec2::254',
    'fe80::1',
    'febf::1',
    'fe80::1%eth0',
    'fec0::1',
    'ff02::1',
    '::ffff:127.0.0.1',
    '::ffff:10.0.0.1',
    '::ffff:169.254.169.254',
    '64:ff9b::7f00:1',
    '64:ff9b::a9fe:a9fe',
    '64:ff9b:1::a00:1',
    '2002:7f00:1::',
    '2002:a00:1::',
    '2002:a9fe:a9fe::',
    '2001:0:4136:e378:8000:63bf:3fff:fdd2',
  ])('blocks %s', (address) => {
    expect(isBlockedAddress(address)).toBe(true)
  })

  it.each([
    '1.1.1.1',
    '8.8.8.8',
    '11.0.0.1',
    '100.128.0.1',
    '172.15.255.255',
    '172.32.0.1',
    '192.0.1.1',
    '192.169.1.1',
    '2001:4860:4860::8888',
    '::ffff:8.8.8.8',
    '64:ff9b::808:808',
    '2002:0808:0808::',
  ])('allows %s', (address) => {
    expect(isBlockedAddress(address)).toBe(false)
  })
})

describe('assertOutboundUrl', () => {
  it.each([
    'http://1.1.1.1/hook',
    'http://hooks.example/hook',
    'https://127.0.0.1/hook',
    'https://127.0.0.1./hook',
    'https://2130706433/',
    'https://0x7f000001/',
    'https://127.1/',
    'https://0177.0.0.1/',
    'https://0/',
    'https://①②⑦.0.0.1/',
    'https://10.1.2.3/',
    'https://172.16.5.5/',
    'https://192.168.1.1/',
    'https://169.254.169.254/latest/meta-data/',
    'https://100.64.1.1/',
    'https://100.100.100.200/',
    'https://[::1]/',
    'https://[::ffff:169.254.169.254]/latest/meta-data/',
    'https://[fc00::1]/',
    'https://[fd00:ec2::254]/',
    'https://[fe80::1]/',
    'https://[64:ff9b::a9fe:a9fe]/',
    'https://[2002:7f00:1::]/',
    'https://localhost/hook',
    'https://LOCALHOST/hook',
    'https://foo.localhost/hook',
    'https://printer.local/hook',
    'https://db.internal/hook',
    'https://metadata.google.internal/computeMetadata/v1/',
    'https://localhost.localdomain/',
    'https://intranet/secret',
    'https://user:pass@hooks.example/hook',
    'https://hooks.example@127.0.0.1/',
    'ftp://hooks.example/',
    'file:///etc/passwd',
    'not a url',
  ])('rejects %s before DNS', async (input) => {
    const resolve = vi.fn(publicResolve)
    await expect(assertOutboundUrl(input, { resolve })).rejects.toThrow(
      OutboundUrlError
    )
    await expect(assertOutboundUrl(input, { resolve })).rejects.toThrow(
      /public https address/
    )
    expect(resolve).not.toHaveBeenCalled()
  })

  it('allows a public address literal without resolving it', async () => {
    const resolve = vi.fn(publicResolve)
    const target = await assertOutboundUrl('https://1.1.1.1:8443/hook', {
      resolve,
    })

    expect(resolve).not.toHaveBeenCalled()
    expect(target.url.href).toBe('https://1.1.1.1:8443/hook')
    expect(target.addresses).toEqual([{ address: '1.1.1.1', family: 4 }])
  })

  it('normalizes a public name and keeps every resolved address', async () => {
    const target = await assertOutboundUrl('HTTPS://Hooks.Example./hook', {
      resolve: async (hostname) => {
        expect(hostname).toBe('hooks.example')
        return [
          { address: '1.1.1.1', family: 4 },
          { address: '2606:4700:4700::1111', family: 6 },
        ]
      },
    })

    expect(target.url.href).toBe('https://hooks.example/hook')
    expect(target.addresses).toEqual([
      { address: '1.1.1.1', family: 4 },
      { address: '2606:4700:4700::1111', family: 6 },
    ])
  })

  it.each([
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'fc00::1',
    'fd00:ec2::254',
    'fe80::1',
    '64:ff9b::a9fe:a9fe',
  ])('rejects a name that resolves to %s', async (address) => {
    await expect(
      assertOutboundUrl('https://rebind.example/hook', {
        resolve: async () => [
          { address, family: address.includes(':') ? 6 : 4 },
        ],
      })
    ).rejects.toThrow(/public https address/)
  })

  it('rejects a name when any resolved address is private', async () => {
    await expect(
      assertOutboundUrl('https://rebind.example/hook', {
        resolve: async () => [
          { address: '1.1.1.1', family: 4 },
          { address: '10.0.0.1', family: 4 },
        ],
      })
    ).rejects.toThrow(/public https address/)
  })

  it('does not surface resolver failures', async () => {
    const error = await assertOutboundUrl('https://missing.example/hook', {
      resolve: async () => {
        throw new Error('ENOTFOUND missing.example 10.0.0.1')
      },
    }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(OutboundUrlError)
    expect((error as Error).message).toBe('URL host could not be resolved')
    expect((error as Error).message).not.toContain('10.0.0.1')
  })
})

describe('outboundFetch', () => {
  function exchange(
    status: number,
    extra: Partial<OutboundExchange> = {}
  ): OutboundExchange {
    return { status, headers: {}, body: '', ...extra }
  }

  it('does not dial a blocked target', async () => {
    const transport = vi.fn()
    await expect(
      outboundFetch('https://169.254.169.254/latest/meta-data/', { transport })
    ).rejects.toThrow(/public https address/)
    expect(transport).not.toHaveBeenCalled()
  })

  it('sends the pinned addresses from the pre-fetch lookup', async () => {
    const seen: OutboundRequest[] = []
    const response = await outboundFetch('https://hooks.example/hook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Host: '169.254.169.254' },
      body: '{"ok":true}',
      resolve: async () => [{ address: '1.1.1.1', family: 4 }],
      transport: async (outbound) => {
        seen.push(outbound)
        return exchange(200, { body: 'sent' })
      },
    })

    expect(response).toMatchObject({ status: 200, body: 'sent' })
    expect(seen).toHaveLength(1)
    expect(seen[0]?.addresses).toEqual([{ address: '1.1.1.1', family: 4 }])
    expect(seen[0]?.headers.Host).toBeUndefined()
    expect(seen[0]?.headers['Content-Type']).toBe('application/json')
    expect(seen[0]?.body).toBe('{"ok":true}')
  })

  it('follows a redirect only after the next host is allowed', async () => {
    const seen: string[][] = []
    const transport = vi
      .fn<OutboundTransportLike>()
      .mockResolvedValueOnce(
        exchange(302, { headers: { location: 'https://next.example/done' } })
      )
      .mockResolvedValueOnce(exchange(200, { body: 'done' }))

    const response = await outboundFetch('https://start.example/hook', {
      method: 'POST',
      body: 'payload',
      resolve: async (hostname) => {
        if (hostname === 'start.example')
          return [{ address: '1.1.1.1', family: 4 }]
        if (hostname === 'next.example')
          return [{ address: '8.8.8.8', family: 4 }]
        throw new Error(hostname)
      },
      transport: async (outbound) => {
        seen.push(outbound.addresses.map((item) => item.address))
        return transport(outbound)
      },
    })

    expect(response.body).toBe('done')
    expect(response.url).toBe('https://next.example/done')
    expect(seen).toEqual([['1.1.1.1'], ['8.8.8.8']])
    expect(transport.mock.calls[1]?.[0]).toMatchObject({ method: 'GET' })
    expect(transport.mock.calls[1]?.[0].body).toBeUndefined()
  })

  it('keeps the method when the redirect says to', async () => {
    const transport = vi
      .fn<OutboundTransportLike>()
      .mockResolvedValueOnce(exchange(307, { headers: { Location: '/stay' } }))
      .mockResolvedValueOnce(exchange(204))

    await outboundFetch('https://hooks.example/hook', {
      method: 'POST',
      body: 'payload',
      resolve: publicResolve,
      transport,
    })

    expect(transport).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'POST',
        body: 'payload',
        url: expect.objectContaining({ href: 'https://hooks.example/stay' }),
      })
    )
  })

  it.each([
    'http://169.254.169.254/latest/meta-data/',
    'https://127.0.0.1/',
    'https://metadata.google.internal/',
    'file:///etc/passwd',
    'javascript:alert(1)',
  ])('does not follow a redirect to %s', async (location) => {
    const transport = vi
      .fn<OutboundTransportLike>()
      .mockResolvedValue(exchange(302, { headers: { location } }))

    await expect(
      outboundFetch('https://hooks.example/hook', {
        resolve: publicResolve,
        transport,
      })
    ).rejects.toThrow(/public https address/)
    expect(transport).toHaveBeenCalledOnce()
  })

  it('does not follow a redirect that rebinds to a private address', async () => {
    let calls = 0
    const transport = vi.fn<OutboundTransportLike>(async () =>
      exchange(302, { headers: { location: 'https://rebind.example/secret' } })
    )

    await expect(
      outboundFetch('https://hooks.example/hook', {
        resolve: async (hostname) => {
          calls += 1
          if (hostname === 'hooks.example')
            return [{ address: '1.1.1.1', family: 4 }]
          return [{ address: '169.254.169.254', family: 4 }]
        },
        transport,
      })
    ).rejects.toThrow(/public https address/)
    expect(calls).toBe(2)
    expect(transport).toHaveBeenCalledOnce()
  })

  it('stops after the redirect cap', async () => {
    let hop = 0
    const transport = vi.fn<OutboundTransportLike>(async () => {
      hop += 1
      return exchange(302, {
        headers: { location: `https://hop${hop}.example/` },
      })
    })

    await expect(
      outboundFetch('https://start.example/', {
        resolve: publicResolve,
        transport,
        maxRedirects: 3,
      })
    ).rejects.toThrow(/too many redirects/)
    expect(transport).toHaveBeenCalledTimes(4)
  })

  it('rejects a body over the cap without returning it', async () => {
    await expect(
      outboundFetch('https://hooks.example/hook', {
        resolve: publicResolve,
        maxBytes: 8,
        transport: async () => exchange(200, { body: '0123456789' }),
      })
    ).rejects.toThrow(/size limit/)
  })

  it('aborts when the timeout fires', async () => {
    await expect(
      outboundFetch('https://hooks.example/hook', {
        resolve: publicResolve,
        timeoutMs: 20,
        transport: (outbound) =>
          new Promise((_resolve, reject) => {
            outbound.signal.addEventListener('abort', () => {
              reject(new OutboundUrlError('outbound request timed out'))
            })
          }),
      })
    ).rejects.toThrow(/timed out/)
  })
})

type OutboundTransportLike = (
  request: OutboundRequest
) => Promise<OutboundExchange>

describe('createPinnedLookup', () => {
  const lookup = createPinnedLookup([
    { address: '1.1.1.1', family: 4 },
    { address: '2606:4700:4700::1111', family: 6 },
  ])

  it('ignores the hostname and returns only the pinned addresses', () => {
    lookup('169.254.169.254', { all: true }, (error, addresses) => {
      expect(error).toBeNull()
      expect(addresses).toEqual([
        { address: '1.1.1.1', family: 4 },
        { address: '2606:4700:4700::1111', family: 6 },
      ])
    })
  })

  it('filters by address family', () => {
    lookup(
      'metadata.google.internal',
      { family: 4 },
      (error, address, family) => {
        expect(error).toBeNull()
        expect(address).toBe('1.1.1.1')
        expect(family).toBe(4)
      }
    )
  })

  it('fails when the requested family was not pinned', () => {
    const v4Only = createPinnedLookup([{ address: '1.1.1.1', family: 4 }])
    v4Only('hooks.example', { family: 6 }, (error, address) => {
      expect(error).toMatchObject({ code: 'ENOTFOUND' })
      expect(address).toBe('')
    })
  })
})

describe('default HTTPS transport', () => {
  class FakeResponse extends EventEmitter {
    statusCode = 200
    headers: Record<string, string | string[]> = {}
    destroy = vi.fn()
  }

  class FakeRequest extends EventEmitter {
    write = vi.fn()
    end = vi.fn()
    destroy = vi.fn()
  }

  function capture(respond: (response: FakeResponse) => void) {
    let options: RequestOptions | undefined
    vi.mocked(request).mockImplementation(((
      next: RequestOptions,
      callback: (response: IncomingMessage) => void
    ) => {
      options = next
      const response = new FakeResponse()
      const req = new FakeRequest()
      req.end.mockImplementation(() => {
        callback(response as unknown as IncomingMessage)
        respond(response)
      })
      return req
    }) as unknown as typeof request)
    return () => options
  }

  it('dials with the pinned lookup and refuses to re-resolve', async () => {
    const options = capture((response) => {
      response.emit('data', Buffer.from('ok'))
      response.emit('end')
    })

    const result = await outboundFetch('https://hooks.example/hook', {
      resolve: async () => [{ address: '1.1.1.1', family: 4 }],
    })

    expect(result).toMatchObject({ status: 200, body: 'ok' })
    const lookup = options()?.lookup
    expect(options()).toMatchObject({
      protocol: 'https:',
      hostname: 'hooks.example',
      servername: 'hooks.example',
      agent: false,
      rejectUnauthorized: true,
    })
    const pinned = await new Promise<unknown>((resolve, reject) => {
      if (!lookup) {
        reject(new Error('missing lookup'))
        return
      }
      lookup('10.0.0.1', { all: true }, (error, addresses) => {
        if (error) reject(error)
        else resolve(addresses)
      })
    })
    expect(pinned).toEqual([{ address: '1.1.1.1', family: 4 }])
  })

  it('drops a redirect body and checks the next host before dialing it', async () => {
    const responses: FakeResponse[] = []
    vi.mocked(request).mockImplementation(((
      _options: RequestOptions,
      callback: (incoming: IncomingMessage) => void
    ) => {
      const response = new FakeResponse()
      responses.push(response)
      const first = responses.length === 1
      if (first) {
        response.statusCode = 302
        response.headers = { location: 'https://next.example/done' }
      }
      const req = new FakeRequest()
      req.end.mockImplementation(() => {
        callback(response as unknown as IncomingMessage)
        if (first) response.emit('data', Buffer.from('should-not-be-read'))
        else {
          response.emit('data', Buffer.from('landed'))
          response.emit('end')
        }
      })
      return req
    }) as unknown as typeof request)

    const result = await outboundFetch('https://hooks.example/hook', {
      resolve: async (hostname) =>
        hostname === 'next.example'
          ? [{ address: '8.8.8.8', family: 4 }]
          : [{ address: '1.1.1.1', family: 4 }],
    })

    expect(responses[0]?.destroy).toHaveBeenCalledOnce()
    expect(result.body).toBe('landed')
    expect(result.url).toBe('https://next.example/done')
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('stops reading once the body cap is exceeded', async () => {
    const response = new FakeResponse()
    vi.mocked(request).mockImplementation(((
      _options: RequestOptions,
      callback: (incoming: IncomingMessage) => void
    ) => {
      const req = new FakeRequest()
      req.end.mockImplementation(() => {
        callback(response as unknown as IncomingMessage)
        response.emit('data', Buffer.alloc(40))
        response.emit('data', Buffer.alloc(40))
        response.emit('end')
      })
      return req
    }) as unknown as typeof request)

    await expect(
      outboundFetch('https://hooks.example/hook', {
        resolve: publicResolve,
        maxBytes: 50,
      })
    ).rejects.toThrow(/size limit/)
    expect(response.destroy).toHaveBeenCalled()
  })

  it('rejects a declared content-length over the cap before reading', async () => {
    const response = new FakeResponse()
    response.headers = { 'content-length': '999999' }
    vi.mocked(request).mockImplementation(((
      _options: RequestOptions,
      callback: (incoming: IncomingMessage) => void
    ) => {
      const req = new FakeRequest()
      req.end.mockImplementation(() => {
        callback(response as unknown as IncomingMessage)
      })
      return req
    }) as unknown as typeof request)

    await expect(
      outboundFetch('https://hooks.example/hook', {
        resolve: publicResolve,
        maxBytes: 50,
      })
    ).rejects.toThrow(/size limit/)
    expect(response.destroy).toHaveBeenCalledOnce()
  })
})
