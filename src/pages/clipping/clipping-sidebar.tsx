import React, { useCallback } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import Switch from 'react-input-switch'
import Card from '../../components/card/card'
import { toggleClippingVisible, toggleClippingVisibleVariables } from '../../schema/mutations/__generated__/toggleClippingVisible'
import toggleClippingVisibleMutation from '../../schema/mutations/toggle-clipping-visible.graphql'
import { updateClippingBook } from '../../store/clippings/type'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
import { useDispatch } from 'react-redux'
import { UserContent } from '../../store/user/type'
import { useTranslation } from 'react-i18next'
import { Link } from '@reach/router'
import { IN_APP_CHANNEL } from '../../services/channel'
const styles = require('./clipping.css').default

type ClippingSidebarProps = {
  clipping: fetchClipping_clipping | undefined
  book: WenquBook | null
  me: UserContent
  inAppChannel: IN_APP_CHANNEL
  onTogglePreviewVisible: () => void
}

function getSiblingLink(iac: IN_APP_CHANNEL, uid: number, clipping?: fetchClipping_clipping) {
  let prev = '', next = ''
  if (!clipping) {
    return { prev, next }
  }
  switch (iac) {
    case IN_APP_CHANNEL.clippingFromBook:
      prev = clipping.prevClipping.bookClippingID ? `/dash/${uid}/clippings/${clipping?.prevClipping.bookClippingID}?iac=${iac}` : ''
      next = clipping.nextClipping.bookClippingID ? `/dash/${uid}/clippings/${clipping?.nextClipping.bookClippingID}?iac=${iac}` : ''
    case IN_APP_CHANNEL.clippingFromUser:
    default:
      prev = clipping.prevClipping.userClippingID ? `/dash/${uid}/clippings/${clipping?.prevClipping.userClippingID}?iac=${iac}` : ''
      next = clipping.nextClipping.userClippingID ? `/dash/${uid}/clippings/${clipping?.nextClipping.userClippingID}?iac=${iac}` : ''
  }
  return {
    prev,
    next
  }
}

function ClippingSidebar(props: ClippingSidebarProps) {
  const { clipping, me, book } = props

  const { t } = useTranslation()
  const client = useApolloClient()
  const dispatch = useDispatch()
  const [execToggleClipping] = useMutation<toggleClippingVisible, toggleClippingVisibleVariables>(toggleClippingVisibleMutation)
  const updateClipping = useCallback(() => {
    if (!clipping) {
      return
    }
    dispatch(updateClippingBook(clipping.id))
  }, [clipping])

  const siblingLink = getSiblingLink(props.inAppChannel, me.id, clipping)
  return (
    <Card className='flex-1 hidden lg:block'>
      <div className='flex w-full h-full flex-col justify-between items-center'>
        <ul className={'w-full p-0 list-none'}>
          <li className='w-full mb-4'>
            <button
              className={styles['action-btn']}
              onClick={updateClipping}
            >
              {t('app.clipping.update')}
            </button>
          </li>

          <li className='w-full mb-4'>
            <button
              className={styles['action-btn']}
              onClick={props.onTogglePreviewVisible}
            >
              {t('app.clipping.shares')}
            </button>
          </li>
          <li className='w-full mb-4'>
            <a
              href={`https://book.douban.com/subject/${book?.doubanId}`}
              target="_blank"
              className={styles['action-btn']}
            >
              {t('app.clipping.link')}
            </a>
          </li>
          {clipping?.creator.id === me.id && (
            <li className='w-full mb-4'>
              <div className={styles['action-btn'] + ' w-full flex items-center justify-between'}>
                <label htmlFor="">{t('app.clipping.visible')}</label>
                <Switch
                  value={clipping.visible ? 1 : 0}
                  onChange={() => {
                    if (!clipping) {
                      return
                    }
                    execToggleClipping({
                      variables: {
                        ids: [clipping.id]
                      }
                    }).then(() => {
                      client.resetStore()
                    })
                  }}
                />
              </div>
            </li>
          )}
        </ul>
        <ul className='w-full list-none p-0'>
          {siblingLink.prev && (
            <li className='w-full mb-4'>
              <Link
                to={siblingLink.prev}
                className={styles['action-btn']}
                title={t('app.clipping.sidebar.prev')}
              >
                {t('app.clipping.sidebar.prev')}
              </Link>
            </li>
          )}
          {siblingLink.next && (
            <li className='w-full mb-4'>
              <Link
                to={siblingLink.next}
                className={styles['action-btn']}
                title={t('app.clipping.sidebar.next')}
              >
                {t('app.clipping.sidebar.next')}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </Card>
  )
}

export default ClippingSidebar
