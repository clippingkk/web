import { describe, expect, it } from 'vitest'

import { uploadProcessMachine } from '@/hooks/my-file.machine'

import {
  IMPORT_STEPS,
  isTextFile,
  isUploadRoute,
  stepIndex,
  UploadStep,
} from '../uploader'

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

describe('isTextFile', () => {
  it('accepts plain text by type or by extension', () => {
    expect(isTextFile({ name: 'notes', type: 'text/plain' })).toBe(true)
    expect(isTextFile({ name: 'My Clippings.txt', type: '' })).toBe(true)
    expect(isTextFile({ name: 'MY CLIPPINGS.TXT', type: '' })).toBe(true)
  })

  it('rejects everything else', () => {
    expect(isTextFile({ name: 'cover.png', type: 'image/png' })).toBe(false)
    expect(isTextFile({ name: 'clippings.txt.zip', type: '' })).toBe(false)
  })
})
