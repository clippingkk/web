import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EmailBindingDialog from './email-binding-dialog'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}))
vi.mock('react-hot-toast', () => ({
  toast: { success: mocks.success, error: mocks.error },
}))
vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

const submit = (id: string) =>
  fireEvent.submit(document.getElementById(id) as HTMLFormElement)

describe('EmailBindingDialog', () => {
  let fetchMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset()
    fetchMock = vi.spyOn(globalThis, 'fetch')
  })

  it('sends a code to the new address, then verifies it', async () => {
    const onClose = vi.fn()
    render(<EmailBindingDialog isOpen onClose={onClose} max={10} />)

    fireEvent.change(screen.getByLabelText('email.add.email'), {
      target: { value: 'reader@icloud.com' },
    })
    fetchMock.mockResolvedValueOnce(
      reply(201, { data: { id: 3, email: 'reader@icloud.com' } })
    )
    submit('email-binding-email')

    await screen.findByText('email.add.codeTitle')
    expect(fetchMock).toHaveBeenCalledWith('/api/v3/email-bindings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'reader@icloud.com' }),
    })

    const code = screen.getByLabelText('email.add.code')
    fireEvent.change(code, { target: { value: '12345' } })
    submit('email-binding-code')
    await screen.findByText('email.add.codeInvalid')

    fireEvent.change(code, { target: { value: '000000' } })
    fetchMock.mockResolvedValueOnce(reply(400, { code: 'INVALID_CODE' }))
    submit('email-binding-code')
    await screen.findByText('email.errors.INVALID_CODE')

    fireEvent.change(code, { target: { value: '424242' } })
    fetchMock.mockResolvedValueOnce(reply(200, { data: { verified: true } }))
    submit('email-binding-code')

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v3/email-bindings/3/verify',
      expect.objectContaining({ body: JSON.stringify({ code: '424242' }) })
    )
    expect(mocks.success).toHaveBeenCalledWith('email.add.verified')
    expect(mocks.refresh).toHaveBeenCalled()
  })

  it('opens a pending address at the code step and can resend', async () => {
    render(
      <EmailBindingDialog
        isOpen
        onClose={vi.fn()}
        max={10}
        binding={{ id: 7, email: 'pending@example.com' }}
      />
    )

    expect(screen.getByText('email.add.codeTitle')).toBeTruthy()
    fetchMock.mockResolvedValueOnce(
      reply(201, { data: { id: 7, email: 'pending@example.com' } })
    )
    fireEvent.click(screen.getByText('email.add.resend'))

    await waitFor(() =>
      expect(mocks.success).toHaveBeenCalledWith('email.add.resent')
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v3/email-bindings',
      expect.objectContaining({
        body: JSON.stringify({ email: 'pending@example.com' }),
      })
    )
  })

  it('explains why an address cannot be added', async () => {
    render(<EmailBindingDialog isOpen onClose={vi.fn()} max={10} />)

    fireEvent.change(screen.getByLabelText('email.add.email'), {
      target: { value: 'taken@example.com' },
    })
    fetchMock.mockResolvedValueOnce(reply(409, { code: 'EMAIL_ALREADY_BOUND' }))
    submit('email-binding-email')

    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith(
        'email.errors.EMAIL_ALREADY_BOUND'
      )
    )
    expect(screen.queryByText('email.add.codeTitle')).toBeNull()
  })
})
