import { render, screen } from '@testing-library/react'
import type { Route } from 'next'
import { describe, expect, it, vi } from 'vitest'

import { UploadStep } from '@/services/uploader'

import ImportPanel from '../import-panel'

vi.mock('react-hot-toast', () => ({ toast: { error: vi.fn() } }))

vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/hooks/use-clippings-import', () => ({
  useClippingsImport: () => ({
    step: UploadStep.None,
    at: 0,
    count: 0,
    errors: [],
    result: null,
    failedStep: null,
    start: vi.fn(),
    reset: vi.fn(),
  }),
}))

describe('ImportPanel', () => {
  it('defaults visibility to Only me', () => {
    render(<ImportPanel libraryHref={'/dash/1/home' as Route} />)

    expect(
      screen
        .getByRole('radio', { name: 'visibility.private' })
        .getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen
        .getByRole('radio', { name: 'visibility.public' })
        .getAttribute('aria-checked')
    ).toBe('false')
    expect(screen.getByRole('button', { name: 'submitPrivate' })).toBeTruthy()
  })
})
