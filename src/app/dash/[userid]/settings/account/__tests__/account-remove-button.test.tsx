import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AccountRemoveButton from '../AccountRemoveButton'

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))

vi.mock('react-hot-toast', () => ({ toast }))

vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

function openDialog() {
  fireEvent.click(screen.getByText('account.deleteButton'))
}

function confirmButton() {
  return screen
    .getByText('account.confirm')
    .closest('button') as HTMLButtonElement
}

function type(value: string) {
  fireEvent.change(screen.getByLabelText(/account\.confirm(Word)?Label/), {
    target: { value },
  })
}

describe('AccountRemoveButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    toast.error.mockReset()
  })

  it('asks for the reader’s name', () => {
    render(<AccountRemoveButton name="Ada" />)
    openDialog()

    type('someone')
    expect(confirmButton().disabled).toBe(true)
    type('Ada')
    expect(confirmButton().disabled).toBe(false)
  })

  it('asks readers without a name for a fixed word instead of locking them out', () => {
    render(<AccountRemoveButton name="" />)
    openDialog()

    expect(confirmButton().disabled).toBe(true)
    type('account.confirmWord')
    expect(confirmButton().disabled).toBe(false)
  })

  it('says so when the request cannot be sent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    render(<AccountRemoveButton name="Ada" />)
    openDialog()
    type('Ada')

    await act(async () => fireEvent.click(confirmButton()))

    expect(toast.error).toHaveBeenCalledWith('account.failed')
    expect(screen.getByText('account.confirm')).toBeTruthy()
  })
})
