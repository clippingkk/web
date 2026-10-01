import { buttonStyles } from '@annatarhe/lake-ui/button'
import { ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Where Apple lets subscribers manage or cancel an App Store subscription. */
export const APP_STORE_SUBSCRIPTIONS_URL =
  'https://apps.apple.com/account/subscriptions'

type AppStoreLinkProps = {
  label: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

/** App Store subscriptions can only be changed by Apple, never through Stripe. */
export default function AppStoreLink({
  label,
  size = 'md',
  fullWidth = false,
}: AppStoreLinkProps) {
  return (
    <a
      href={APP_STORE_SUBSCRIPTIONS_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        buttonStyles({ variant: 'secondary', size }),
        fullWidth && 'w-full'
      )}
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </a>
  )
}
