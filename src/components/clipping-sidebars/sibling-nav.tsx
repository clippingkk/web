import { useTranslation } from '@/i18n'
import { Tooltip } from '@mantine/core'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { SidebarContainer, SidebarButton, SidebarIcon, SidebarText } from './base/container'
import { Clipping } from '@/schema/generated'
import { IN_APP_CHANNEL } from '@/services/channel'

function getSiblingLink(iac: IN_APP_CHANNEL, domain?: string, clipping?: Pick<Clipping, 'prevClipping' | 'nextClipping'>) {
  let prev = '', next = ''
  if (!clipping) {
    return { prev, next }
  }
  switch (iac) {
    case IN_APP_CHANNEL.clippingFromBook:
      prev = clipping.prevClipping.bookClippingID ? `/dash/${domain}/clippings/${clipping?.prevClipping.bookClippingID}?iac=${iac}` : ''
      next = clipping.nextClipping.bookClippingID ? `/dash/${domain}/clippings/${clipping?.nextClipping.bookClippingID}?iac=${iac}` : ''
    case IN_APP_CHANNEL.clippingFromUser:
    default:
      prev = clipping.prevClipping.userClippingID ? `/dash/${domain}/clippings/${clipping?.prevClipping.userClippingID}?iac=${iac}` : ''
      next = clipping.nextClipping.userClippingID ? `/dash/${domain}/clippings/${clipping?.nextClipping.userClippingID}?iac=${iac}` : ''
  }
  return {
    prev,
    next
  }
}

type Props = {
  clipping?: Pick<Clipping, 'id' | 'visible' | 'content' | 'title' | 'createdAt' | 'nextClipping' | 'prevClipping'>
  iac: IN_APP_CHANNEL
  domain?: string
}

async function SiblingNav(props: Props) {
  const { t } = await useTranslation()
  const { clipping, iac, domain } = props
  const { prev, next } = getSiblingLink(iac, domain, clipping)

  return (
    <>
      {prev && (
        <SidebarContainer>
          <Tooltip label={t('app.clipping.sidebar.prev')}>
            <Link
              href={prev}
              className='group'
            >
              <SidebarButton>
                <SidebarIcon>
                  <ArrowUp className="w-full h-full" />
                </SidebarIcon>
                <SidebarText>
                  {t('app.clipping.sidebar.prev')}
                </SidebarText>
              </SidebarButton>
            </Link>
          </Tooltip>
        </SidebarContainer>
      )}
      {next && (
        <SidebarContainer>
          <Tooltip label={t('app.clipping.sidebar.next')}>
            <Link
              href={next}
              className='group'
            >
              <SidebarButton>
                <SidebarIcon className="text-teal-500 group-hover:text-teal-600">
                  <ArrowDown className="w-full h-full" />
                </SidebarIcon>
                <SidebarText>
                  {t('app.clipping.sidebar.next')}
                </SidebarText>
              </SidebarButton>
            </Link>
          </Tooltip>
        </SidebarContainer>
      )}
    </>
  )
}

export default SiblingNav
