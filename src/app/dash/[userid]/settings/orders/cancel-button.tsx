'use client'
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
    <button
      onClick={() => mutate(subscriptionId)}
      disabled={status === SubscriptionStatus.Canceled || isPending}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${status === SubscriptionStatus.Canceled || isPending ? 
        'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed' : 
        'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'}`}
    >
      {isPending ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('app.common.processing')}
        </span>
      ) : (
        t('app.common.cancel')
      )}
    </button>
  )
}

export default CancelButton