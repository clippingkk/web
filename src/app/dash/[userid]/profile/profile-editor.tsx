'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import TextareaField from '@annatarhe/lake-ui/form-textarea-field'
import Modal from '@annatarhe/lake-ui/modal'
import { useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { PenLine } from 'lucide-react'
import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import { UpdateProfileDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { isUsableDomain } from '@/utils/profile.utils'

type ProfileEditorProps = {
  name: string
  bio: string
  domain: string
  /** Opened from the library's "finish your profile" nudge. */
  defaultOpen?: boolean
}

/**
 * The domain follows the server's rule (see updateUserProfile). The current
 * value is always accepted, so a legacy domain that predates the rule never
 * blocks editing the bio.
 */
function makeSchema(currentDomain: string, messages: Record<string, string>) {
  return z.object({
    name: z.string().trim().max(64).optional(),
    bio: z
      .string()
      .max(255)
      .refine((v) => v.split('\n').length <= 4, messages.bioTooLong),
    domain: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (v) =>
          v === '' ||
          (!!currentDomain && v === currentDomain.toLowerCase()) ||
          isUsableDomain(v),
        messages.domainInvalid
      ),
  })
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>

function ProfileEditor(props: ProfileEditorProps) {
  const { name, bio, domain, defaultOpen = false } = props
  const { t } = useTranslation(undefined, 'profile')
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(defaultOpen)
  const [updateProfile] = useMutation(UpdateProfileDocument)
  const canRename = name.startsWith('user.')
  const currentDomain = domain.toLowerCase()
  const domainLocked = isUsableDomain(domain)

  const schema = useMemo(
    () =>
      makeSchema(domain, {
        bioTooLong: t('editor.bioTooLong'),
        domainInvalid: t('editor.domainInvalid'),
      }),
    [domain, t]
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', bio, domain },
  })

  const close = () => {
    reset()
    setOpen(false)
    // drop ?with_profile_editor so a refresh doesn't reopen the dialog
    if (defaultOpen) router.replace(pathname as Route)
  }

  const onSubmit = async (values: FormValues) => {
    // A usable domain is permanent; an unchanged one is not sent (null leaves
    // it alone, an empty string would fail the server's rule).
    const nextDomain =
      domainLocked || !values.domain || values.domain === currentDomain
        ? null
        : values.domain
    try {
      await updateProfile({
        variables: {
          name: canRename && values.name ? values.name : null,
          bio: values.bio !== bio ? values.bio : null,
          domain: nextDomain,
          avatar: null,
        },
      })
      toast.success(t('editor.saved'))
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('editor.failed'))
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={<PenLine className="size-4" />}
        onClick={() => setOpen(true)}
      >
        {t('edit')}
      </Button>
      <Modal
        isOpen={open}
        onClose={close}
        title={t('editor.title')}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              {t('editor.cancel')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="profile-editor"
              loading={isSubmitting}
            >
              {t('editor.save')}
            </Button>
          </div>
        }
      >
        <form
          id="profile-editor"
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          {canRename ? (
            <InputField
              label={t('editor.name')}
              placeholder={t('editor.namePlaceholder')}
              autoComplete="nickname"
              data-autofocus
              {...register('name')}
              error={errors.name?.message}
            />
          ) : null}
          <div className="flex flex-col gap-1.5">
            <InputField
              label={t('editor.domain')}
              placeholder="your-name"
              autoCapitalize="none"
              spellCheck={false}
              disabled={domainLocked}
              {...register('domain')}
              error={errors.domain?.message}
            />
            <p className="type-meta">
              {domainLocked ? t('editor.domainLocked') : t('editor.domainHint')}
            </p>
          </div>
          <TextareaField
            label={t('editor.bio')}
            placeholder={t('editor.bioPlaceholder')}
            rows={4}
            {...register('bio')}
            error={errors.bio?.message}
          />
        </form>
      </Modal>
    </>
  )
}

export default ProfileEditor
