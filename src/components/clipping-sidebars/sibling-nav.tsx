import { useTranslation } from '@/i18n'
import { Clipping } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'
import Tooltip from '@annatarhe/lake-ui/tooltip'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import {
  SidebarButton,
  SidebarContainer,
  SidebarIcon,
  SidebarText,
} from './base/container'

function getSiblingLink(
  iac: IN_APP_CHANNEL,
  domain?: string,
  clipping?: Pick<Clipping, 'prevClipping' | 'nextClipping'>
) {
  let prev = '',
    next = ''
  if (!clipping) {
    return { prev, next }
  }
  switch (iac) {
    case IN_APP_CHANNEL.clippingFromBook:
      prev = clipping.prevClipping.bookClippingID
        ? `/dash/${domain}/clippings/${clipping?.prevClipping.bookClippingID}?iac=${iac}`
        : ''
      next = clipping.nextClipping.bookClippingID
        ? `/dash/${domain}/clippings/${clipping?.nextClipping.bookClippingID}?iac=${iac}`
        : ''
    case IN_APP_CHANNEL.clippingFromUser:
    default:
      prev = clipping.prevClipping.userClippingID
        ? `/dash/${domain}/clippings/${clipping?.prevClipping.userClippingID}?iac=${iac}`
        : ''
      next = clipping.nextClipping.userClippingID
        ? `/dash/${domain}/clippings/${clipping?.nextClipping.userClippingID}?iac=${iac}`
        : ''
  }
  return {
    prev,
    next,
  }
}

type Props = {
  clipping?: Pick<
    Clipping,
    | 'id'
    | 'visible'
    | 'content'
    | 'title'
    | 'createdAt'
    | 'nextClipping'
    | 'prevClipping'
  >
  iac: IN_APP_CHANNEL
  domain?: string
}

async function SiblingNav(props: Props) {
  const { t } = await useTranslation()
  const { clipping, iac, domain } = props
  const { prev, next } = getSiblingLink(iac, domain, clipping)

  return (
    <div className="space-y-2">
      {prev && (
        <SidebarContainer>
          <Tooltip content={t('app.clipping.sidebar.prev')}>
            <Link href={prev} className="group block">
              <SidebarButton>
                <SidebarIcon className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  <ArrowUp className="h-full w-full" />
                </SidebarIcon>
                <SidebarText>{t('app.clipping.sidebar.prev')}</SidebarText>
              </SidebarButton>
            </Link>
          </Tooltip>
        </SidebarContainer>
      )}
      {next && (
        <SidebarContainer>
          <Tooltip content={t('app.clipping.sidebar.next')}>
            <Link href={next} className="group block">
              <SidebarButton>
                <SidebarIcon className="text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                  <ArrowDown className="h-full w-full" />
                </SidebarIcon>
                <SidebarText>{t('app.clipping.sidebar.next')}</SidebarText>
              </SidebarButton>
            </Link>
          </Tooltip>
        </SidebarContainer>
      )}
      {!prev && !next && (
        <div className="text-center py-4">
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {t('app.clipping.sidebar.noNavigation', 'No more clippings')}
          </span>
        </div>
      )}
    </div>
  )
}

export default SiblingNav
