// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { dmarcResult } from '../authentication'

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
    expect(dmarcResult(results(value))).toBe(verdict)
  })

  it('reads nothing when there is no header', () => {
    expect(dmarcResult(null)).toBe('absent')
    expect(dmarcResult({ Subject: 'dmarc=pass' })).toBe('absent')
  })

  it('ignores a pass hidden in a comment or a quoted reason', () => {
    expect(
      dmarcResult(results('mx.resend.com; spf=fail (reason: dmarc=pass)'))
    ).toBe('absent')
    expect(
      dmarcResult(
        results('mx.resend.com; spf=fail reason="nope; dmarc=pass" smtp.x=y')
      )
    ).toBe('absent')
    expect(
      dmarcResult(
        results('mx.resend.com; dmarc=none (a (nested; dmarc=pass) comment)')
      )
    ).toBe('none')
  })

  it("won't let a sender's own header shadow the receiver's", () => {
    // A second key differing only in case.
    expect(
      dmarcResult({
        'Authentication-Results': 'mx.resend.com; dmarc=none header.from=x.com',
        'authentication-results': 'mx.resend.com; dmarc=pass header.from=x.com',
      })
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
  })

  it('trusts only the configured authserv-id', () => {
    const forged = results('evil.example; dmarc=pass header.from=x.com')
    expect(dmarcResult(forged, RESEND)).toBe('absent')
    expect(
      dmarcResult(
        results('MX.Resend.com 1; dmarc=pass header.from=x.com'),
        RESEND
      )
    ).toBe('pass')
  })
})
