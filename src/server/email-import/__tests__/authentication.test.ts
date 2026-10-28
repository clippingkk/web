// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { dmarcResult, resendDmarcResult } from '../authentication'

const RESEND = 'mx.resend.com'
const results = (value: string) => ({ 'Authentication-Results': value })

describe('dmarcResult', () => {
  it.each([
    [
      'mx.resend.com; spf=pass smtp.mailfrom=icloud.com; dkim=pass header.d=icloud.com; dmarc=pass header.from=icloud.com',
      'pass',
    ],
    ['mx.resend.com; dmarc=fail (p=quarantine) header.from=x.com', 'fail'],
    ['mx.resend.com; dmarc=none header.from=x.com', 'none'],
    ['mx.resend.com; DMARC = TempError header.from=x.com', 'temperror'],
    ['mx.resend.com; dmarc=bestguesspass header.from=x.com', 'other'],
    ['mx.resend.com; spf=pass smtp.mailfrom=x.com', 'absent'],
    ['mx.resend.com; none', 'absent'],
  ])('%j → %s', (value, verdict) => {
    expect(dmarcResult(results(value), RESEND)).toBe(verdict)
  })

  it('trusts a pass only from the pinned authserv-id', () => {
    const pass = results('mx.resend.com; dmarc=pass header.from=x.com')
    expect(dmarcResult(pass)).toBe('unpinned')
    expect(dmarcResult(pass, 'other.example')).toBe('unpinned')
    expect(dmarcResult(pass, RESEND)).toBe('pass')
    // Anyone's failure still counts, pinned or not.
    expect(
      dmarcResult(results('evil.example; dmarc=fail header.from=x.com'))
    ).toBe('fail')
  })

  it('reads a header folded over several lines', () => {
    expect(
      dmarcResult(
        results(
          'mx.resend.com;\r\n\tspf=pass smtp.mailfrom=x.com;\r\n\tdmarc=pass header.from=x.com'
        ),
        RESEND
      )
    ).toBe('pass')
  })

  it('reads nothing when there is no header', () => {
    expect(dmarcResult(null)).toBe('absent')
    expect(dmarcResult({ Subject: 'dmarc=pass' })).toBe('absent')
  })

  it('ignores a pass hidden in a comment or a quoted reason', () => {
    expect(
      dmarcResult(
        results('mx.resend.com; spf=fail (reason: dmarc=pass)'),
        RESEND
      )
    ).toBe('absent')
    expect(
      dmarcResult(
        results('mx.resend.com; spf=fail reason="nope; dmarc=pass" smtp.x=y'),
        RESEND
      )
    ).toBe('absent')
    expect(
      dmarcResult(
        results('mx.resend.com; dmarc=none (a (nested; dmarc=pass) comment)'),
        RESEND
      )
    ).toBe('none')
  })

  it("won't let a sender's own header shadow the receiver's", () => {
    // A second key differing only in case.
    expect(
      dmarcResult(
        {
          'Authentication-Results':
            'mx.resend.com; dmarc=none header.from=x.com',
          'authentication-results':
            'mx.resend.com; dmarc=pass header.from=x.com',
        },
        RESEND
      )
    ).toBe('none')
    // Repeated headers joined on one value.
    expect(
      dmarcResult(
        results(
          'mx.resend.com; dmarc=none header.from=x.com\nevil.example; dmarc=pass'
        )
      )
    ).toBe('none')
    expect(
      dmarcResult(
        results(
          'mx.resend.com; dmarc=none header.from=x.com, evil.example; dmarc=pass'
        )
      )
    ).toBe('none')
    // A pass joined on by comma doesn't borrow the receiver's authserv-id.
    expect(
      dmarcResult(
        results(
          'mx.resend.com; spf=pass smtp.mailfrom=x.com, evil.example; dmarc=pass'
        ),
        RESEND
      )
    ).toBe('unpinned')
  })

  it('trusts only the configured authserv-id', () => {
    const forged = results('evil.example; dmarc=pass header.from=x.com')
    expect(dmarcResult(forged, RESEND)).toBe('unpinned')
    expect(
      dmarcResult(
        results('MX.Resend.com 1; dmarc=pass header.from=x.com'),
        RESEND
      )
    ).toBe('pass')
  })
})

describe('resendDmarcResult', () => {
  it.each([
    ['pass', 'pass'],
    ['fail', 'fail'],
    ['gray', 'none'],
    ['processing_failed', 'temperror'],
    ['unknown', 'absent'],
    ['PASS', 'pass'],
    ['bestguesspass', 'other'],
    ['constructor', 'other'],
  ])('dmarc %j → %s', (dmarc, verdict) => {
    expect(resendDmarcResult({ spf: 'pass', dkim: 'pass', dmarc })).toBe(
      verdict
    )
  })

  it('gives no verdict for mail received before Resend reported one', () => {
    expect(resendDmarcResult(null)).toBeNull()
    expect(resendDmarcResult(undefined)).toBeNull()
  })

  it('reads a reported verdict without a DMARC result as absent', () => {
    expect(resendDmarcResult({ spf: 'pass' })).toBe('absent')
    expect(resendDmarcResult({ dmarc: null })).toBe('absent')
  })
})
