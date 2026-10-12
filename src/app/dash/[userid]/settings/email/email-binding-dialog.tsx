'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import { useTranslation } from '@/i18n/client'
import type { EmailBindingSummary } from '@/server/email-import/bindings'

/** Error codes from /api/v3/email-bindings that have their own message. */
const ERROR_CODES = new Set([
  'INVALID_EMAIL',
  'ALREADY_VERIFIED',
  'EMAIL_ALREADY_BOUND',
  'TOO_MANY_EMAIL_BINDINGS',
  'TOO_MANY_CODES',
  'TOO_MANY_ATTEMPTS',
  'CODE_EXPIRED',
  'INVALID_CODE',
])

type Target = Pick<EmailBindingSummary, 'id' | 'email'>

async function post(url: string, body: unknown) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    return {
      ok: response.ok,
      payload: await response.json().catch(() => null),
    }
  } catch {
    return { ok: false, payload: null }
  }
}

type EmailBindingDialogProps = {
  isOpen: boolean
  onClose: () => void
  max: number
  /** A pending address to verify; without one the dialog asks for an address first. */
  binding?: Target | null
}

/**
 * Adds a sending address in two steps: the address, then the code mailed to
 * it. Remount it (with a `key`) to start over.
 */
function EmailBindingDialog(props: EmailBindingDialogProps) {
  const { isOpen, onClose, max, binding } = props
  const { t } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [target, setTarget] = useState<Target | null>(binding ?? null)
  const [resending, setResending] = useState(false)
  const changed = useRef(false)

  const emailSchema = useMemo(
    () =>
      z.object({
        email: z.email(t('email.add.emailInvalid')).max(255),
      }),
    [t]
  )
  const codeSchema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .trim()
          .regex(/^\d{6}$/, t('email.add.codeInvalid')),
      }),
    [t]
  )
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })
  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  const errorText = (payload: unknown) => {
    const code = (payload as { code?: string } | null)?.code
    return code && ERROR_CODES.has(code)
      ? t(`email.errors.${code}`, { max })
      : t('email.errors.generic')
  }

  const close = () => {
    onClose()
    if (changed.current) router.refresh()
  }

  const sendCode = async (email: string) => {
    const { ok, payload } = await post('/api/v3/email-bindings', { email })
    if (!ok) {
      toast.error(errorText(payload))
      return null
    }
    changed.current = true
    return payload.data as EmailBindingSummary
  }

  const onEmail = async ({ email }: z.infer<typeof emailSchema>) => {
    const created = await sendCode(email)
    if (created) setTarget({ id: created.id, email: created.email })
  }

  const onCode = async ({ code }: z.infer<typeof codeSchema>) => {
    if (!target) return
    const { ok, payload } = await post(
      `/api/v3/email-bindings/${target.id}/verify`,
      { code }
    )
    if (!ok) {
      codeForm.setError('code', { message: errorText(payload) })
      return
    }
    changed.current = true
    toast.success(t('email.add.verified'))
    close()
  }

  const resend = async () => {
    if (!target) return
    setResending(true)
    try {
      if (await sendCode(target.email)) {
        codeForm.reset()
        toast.success(t('email.add.resent'))
      }
    } finally {
      setResending(false)
    }
  }

  const submitting = target
    ? codeForm.formState.isSubmitting
    : emailForm.formState.isSubmitting

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={target ? t('email.add.codeTitle') : t('email.add.title')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            {t('email.add.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={target ? 'email-binding-code' : 'email-binding-email'}
            loading={submitting}
          >
            {target ? t('email.add.submit') : t('email.add.sendCode')}
          </Button>
        </div>
      }
    >
      {target ? (
        <form
          id="email-binding-code"
          className="flex flex-col gap-4"
          onSubmit={codeForm.handleSubmit(onCode)}
        >
          <p className="text-lake-fg-muted text-sm">
            {t('email.add.codeDescription', { email: target.email })}
          </p>
          <InputField
            label={t('email.add.code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            data-autofocus
            {...codeForm.register('code')}
            error={codeForm.formState.errors.code?.message}
          />
          <div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              loading={resending}
              onClick={resend}
            >
              {t('email.add.resend')}
            </Button>
          </div>
        </form>
      ) : (
        <form
          id="email-binding-email"
          className="flex flex-col gap-4"
          onSubmit={emailForm.handleSubmit(onEmail)}
        >
          <p className="text-lake-fg-muted text-sm">
            {t('email.add.description')}
          </p>
          <InputField
            label={t('email.add.email')}
            type="email"
            autoComplete="email"
            placeholder={t('email.add.emailPlaceholder')}
            maxLength={255}
            data-autofocus
            {...emailForm.register('email')}
            error={emailForm.formState.errors.email?.message}
          />
        </form>
      )}
    </Modal>
  )
}

export default EmailBindingDialog
