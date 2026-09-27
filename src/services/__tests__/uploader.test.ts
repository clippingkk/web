import { describe, expect, it } from 'vitest'

import { uploadProcessMachine } from '@/hooks/my-file.machine'

import { IMPORT_STEPS, isUploadRoute, stepIndex, UploadStep } from '../uploader'

describe('upload steps', () => {
  it('uses the state machine state names', () => {
    const states = Object.keys(uploadProcessMachine.config.states ?? {})
    for (const step of Object.values(UploadStep)) {
      expect(states).toContain(step)
    }
  })

  it('orders the visible steps', () => {
    expect(IMPORT_STEPS.map(stepIndex)).toEqual([0, 1, 2, 3])
    expect(stepIndex(UploadStep.None)).toBe(-1)
    expect(stepIndex(UploadStep.Error)).toBe(-1)
  })
})

describe('isUploadRoute', () => {
  it('matches the import page for ids and domains', () => {
    expect(isUploadRoute('/dash/42/upload')).toBe(true)
    expect(isUploadRoute('/dash/annatar/upload/')).toBe(true)
  })

  it('ignores other pages', () => {
    expect(isUploadRoute('/dash/42/uploads')).toBe(false)
    expect(isUploadRoute('/dash/42/home')).toBe(false)
    expect(isUploadRoute(null)).toBe(false)
  })
})
