'use client'

import Button from '@annatarhe/lake-ui/button'
import InputField from '@annatarhe/lake-ui/form-input-field'
import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { SyncHomelessBookDocument } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

function HomelessBookSyncInput({ bookName }: { bookName: string }) {
  const { t } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const [doubanId, setDoubanId] = useState('')
  const [sync, { loading }] = useMutation(SyncHomelessBookDocument)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = doubanId.trim()
    if (!/^\d{4,}$/.test(id)) {
      toast.error(t('admin.invalidId'))
      return
    }
    try {
      await sync({ variables: { title: bookName, doubanID: id } })
      toast.success(t('admin.synced', { title: bookName }))
      setDoubanId('')
      router.refresh()
    } catch {
      toast.error(t('admin.failed'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center justify-end gap-2">
      <InputField
        aria-label={t('admin.columns.action')}
        inputMode="numeric"
        placeholder={t('admin.placeholder')}
        value={doubanId}
        onChange={(e) => setDoubanId(e.target.value)}
        className="w-36"
      />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={loading}
        disabled={!/^\d{4,}$/.test(doubanId.trim())}
      >
        {t('admin.sync')}
      </Button>
    </form>
  )
}

export default HomelessBookSyncInput
