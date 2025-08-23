'use client'
import Switch from '@annatarhe/lake-ui/form-switch-field'
import { useApolloClient } from '@apollo/client/react'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useMutation } from '@apollo/client/react'
import {
  type Clipping,
  ToggleClippingVisibleDocument,
  type ToggleClippingVisibleMutation,
  type User,
} from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'
import { toastPromiseDefaultOption } from '@/services/misc'
import { SidebarButton, SidebarContainer } from './base/container'

type Props = {
  clipping?: Pick<Clipping, 'id' | 'visible'> & { creator: Pick<User, 'id'> }
  me?: Pick<User, 'id'>
}

function VisibleToggle({ clipping, me }: Props) {
  const { t } = useTranslation()
  const client = useApolloClient()
  const r = useRouter()

  const [toggleClippingVisible, { loading }] = useMutation<ToggleClippingVisibleMutation>(ToggleClippingVisibleDocument,
    {
      onCompleted() {
        client.resetStore()
        r.refresh()
      },
    }
  )

  if (clipping?.creator.id !== me?.id) {
    return null
  }

  const isVisible = clipping?.visible ?? true

  return (
    <SidebarContainer>
      <SidebarButton className='justify-between'>
        <div className='flex items-center gap-2'>
          {isVisible ? (
            <Eye className='h-4 w-4 text-purple-500' />
          ) : (
            <EyeOff className='h-4 w-4 text-teal-500' />
          )}
          <label className='font-medium text-gray-700 dark:text-gray-300'>
            {t('app.clipping.visible')}
          </label>
        </div>
        <Switch
          label={null}
          value={isVisible}
          loading={loading}
          onChange={() => {
            if (!clipping) {
              return
            }
            toast.promise(
              toggleClippingVisible({
                variables: {
                  ids: [clipping.id],
                },
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
