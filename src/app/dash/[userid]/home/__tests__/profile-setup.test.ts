import { describe, expect, it } from 'vitest'

import { profileNeedsSetup } from '../profile-setup'

const ready = {
  name: 'Ada Lovelace',
  avatar: 'https://cdn.example/ada.png',
  domain: 'ada',
}

describe('profileNeedsSetup', () => {
  it('stays quiet when name, avatar and short link are set', () => {
    expect(profileNeedsSetup(ready)).toBe(false)
  })

  it('ignores bio: a filled profile with no bio is finished', () => {
    expect(profileNeedsSetup({ ...ready })).toBe(false)
  })

  it('accepts a legacy dotted short link', () => {
    expect(profileNeedsSetup({ ...ready, domain: 'annatar.he' })).toBe(false)
  })

  it('accepts a short legacy domain and a Gate name that starts with user.', () => {
    expect(
      profileNeedsSetup({
        name: 'user.smith',
        avatar: 'photos/a.png',
        domain: 'ab',
      })
    ).toBe(false)
  })

  it('asks when the phone-signup placeholder name is still in place', () => {
    expect(profileNeedsSetup({ ...ready, name: 'user.a1b2c3d4' })).toBe(true)
    expect(profileNeedsSetup({ ...ready, name: '  ' })).toBe(true)
  })

  it('asks when the avatar is empty or the old null sentinel', () => {
    expect(profileNeedsSetup({ ...ready, avatar: '' })).toBe(true)
    expect(profileNeedsSetup({ ...ready, avatar: 'null' })).toBe(true)
    expect(profileNeedsSetup({ ...ready, avatar: ' NULL ' })).toBe(true)
  })

  it('asks when there is no openable short link', () => {
    expect(profileNeedsSetup({ ...ready, domain: '' })).toBe(true)
    expect(profileNeedsSetup({ ...ready, domain: '   ' })).toBe(true)
    expect(profileNeedsSetup({ ...ready, domain: '12345' })).toBe(true)
  })
})
