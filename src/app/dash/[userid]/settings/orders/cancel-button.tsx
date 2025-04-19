'use client'
import { Button } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { SubscriptionStatus } from '@/schema/generated'
import { cancelPaymentSubscription } from '@/services/payment'
import { toast } from 'react-hot-toast'
import { toastPromiseDefaultOption } from '@/services/misc'
import { useTranslation } from '@/i18n/client'
import { useRouter } from 'next/navigation'

type Props = {
  subscriptionId: string
  status: SubscriptionStatus
}

function CancelButton({ subscriptionId, status }: Props) {
  const router = useRouter()
  const { mutate, isPending } = useMutation({
    mutationFn: async (subscriptionId: string) =>
      toast.promise(
        cancelPaymentSubscription(subscriptionId), toastPromiseDefaultOption),
    onSuccess() {
      router.refresh()
    }
  })
  const { t } = useTranslation()
  return (
    <Button
      onClick={() => mutate(subscriptionId)}
      disabled={status === SubscriptionStatus.Canceled || isPending}
    >
      {t('app.common.cancel')}
    </Button>
  )
}

export default CancelButton