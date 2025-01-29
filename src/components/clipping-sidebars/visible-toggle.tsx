'use client'
import { useTranslation } from '@/i18n/client'
import { Clipping, User, useToggleClippingVisibleMutation } from '@/schema/generated'
import { toastPromiseDefaultOption } from '@/services/misc'
import { Switch } from '@mantine/core'
import { useApolloClient } from '@apollo/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { SidebarContainer, SidebarButton } from './base/container'

type Props = {
  clipping?: Pick<Clipping, 'id' | 'visible'> & { creator: Pick<User, 'id'> }
  me?: Pick<User, 'id'>
}

function VisibleToggle({ clipping, me }: Props) {
  const { t } = useTranslation()
  const client = useApolloClient()
  const r = useRouter()

  const [toggleClippingVisible] = useToggleClippingVisibleMutation({
    onCompleted() {
      client.resetStore()
      r.refresh()
    }
  })

  if (clipping?.creator.id !== me?.id) {
    return null
  }

  const isVisible = clipping?.visible ?? true

  return (
    <SidebarContainer>
      <SidebarButton className="justify-between">
        <div className="flex items-center gap-2">
          {isVisible ? (
            <Eye className="w-4 h-4 text-purple-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-teal-500" />
          )}
          <label className="font-medium text-gray-700 dark:text-gray-300">
            {t('app.clipping.visible')}
          </label>
        </div>
        <Switch
          size="md"
          color="teal"
          name="visible"
          checked={isVisible}
          onChange={() => {
            if (!clipping) {
              return
            }
            toast.promise(
              toggleClippingVisible({
                variables: {
                  ids: [clipping.id]
                }
              }),
              toastPromiseDefaultOption
            )
          }}
        />
      </SidebarButton>
    </SidebarContainer>
  )
}

export default VisibleToggle
