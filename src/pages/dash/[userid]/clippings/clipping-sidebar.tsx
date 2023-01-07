import React, { useCallback, useState } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import Switch from '../../../../components/switcher'
import Card from '../../../../components/card/card'
import { toggleClippingVisible, toggleClippingVisibleVariables } from '../../../../schema/mutations/__generated__/toggleClippingVisible'
import toggleClippingVisibleMutation from '../../../../schema/mutations/toggle-clipping-visible.graphql'
import { fetchClipping_clipping } from '../../../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../../../services/wenqu'
import { useDispatch } from 'react-redux'
import { UserContent } from '../../../../store/user/type'
import { useTranslation } from 'react-i18next'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { toast } from 'react-hot-toast'

import styles from './clipping.module.css'
import Link from 'next/link'
import BookInfoChanger from '../../../../components/book-info-changer/bookInfoChanger'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid'

type ClippingSidebarProps = {
  clipping: fetchClipping_clipping | undefined
  book: WenquBook | null
  me: UserContent
  inAppChannel: IN_APP_CHANNEL
  onTogglePreviewVisible: () => void
}

function getSiblingLink(iac: IN_APP_CHANNEL, domain: string, clipping?: fetchClipping_clipping) {
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

function ClippingSidebar(props: ClippingSidebarProps) {
  const { clipping, me, book } = props

  const { t } = useTranslation()
  const client = useApolloClient()
  const dispatch = useDispatch()
  const [execToggleClipping] = useMutation<toggleClippingVisible, toggleClippingVisibleVariables>(toggleClippingVisibleMutation)

  const [updateClippingBookId, setUpdateClippingBookId] = useState(-1)

  const updateClipping = useCallback(() => {
    if (!clipping) {
      return
    }

    setUpdateClippingBookId(clipping.id)
  }, [clipping?.id])

  // const updateClipping = useCallback(() => {
  //   if (!clipping) {
  //     return
  //   }
  //   dispatch(updateClippingBook(clipping.id))
  // }, [clipping])

  const onCopyEmbedHtml = useCallback(() => {
    const template = `
    <blockquote class="ck-clipping-card" data-cid='${clipping?.id}'>
  <p lang="zh" dir="ltr" class="ck-content">
  ${clipping?.content}
  </p>
  <p class="ck-author">
    —— 《${book?.title ?? clipping?.title}》 <small>${book?.author ?? ''}</small>
  </p>
  <p class="ck-info">
    <span>${clipping?.creator.name}</span> 摘录于 <time>${clipping?.createdAt}</time>
  </p>
</blockquote>
<script async src="https://web-widget-script.pages.dev/bundle.js" charset="utf-8"></script>
`
    navigator.clipboard.writeText(template).then(() => {
      toast.success('copied. just paste to your website')
    })
  }, [clipping, book])

  const clippingDomain = clipping ?
    (
      clipping.creator.domain.length > 2 ?
        clipping.creator.domain :
        clipping.creator.id.toString()
    ) :
    me.id.toString()

  const siblingLink = getSiblingLink(props.inAppChannel, clippingDomain, clipping)
  return (
    <Card className='flex-1 hidden lg:block'>
      <div className='flex w-full h-full flex-col justify-between items-center'>
        <ul className={'w-full p-0 list-none'}>
          <li className='w-full mb-4'>
            <button
              className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100 '
              onClick={updateClipping}
            >
              {t('app.clipping.update')}
            </button>
            <BookInfoChanger
              clippingID={clipping?.id ?? -1}
              visible={updateClippingBookId >= 0}
              onClose={() => {
                setUpdateClippingBookId(-1)
              }}
              onConfirm={newBookId => {
                setUpdateClippingBookId(-1)
                return Promise.resolve(1)
              }}
            />
          </li>

          <li className='w-full mb-4'>
            <button
              className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100 '
              onClick={props.onTogglePreviewVisible}
            >
              {t('app.clipping.shares')}
            </button>
          </li>
          <li className='w-full mb-4'>
            <a
              href={`https://book.douban.com/subject/${book?.doubanId}`}
              target="_blank"
              className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100 '
              rel="noreferrer"
            >
              {t('app.clipping.link')}
            </a>
          </li>
          <li className='w-full mb-4'>
            <button
              className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100'
              onClick={onCopyEmbedHtml}
            >
              copy embed html
            </button>
          </li>
          {clipping?.creator.id === me.id && (
            <li className='w-full mb-4'>
              <div
                className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100 items-center justify-between'
              >
                <label htmlFor="">{t('app.clipping.visible')}</label>
                <Switch
                  disabled={false}
                  name='visible'
                  checked={clipping.visible}
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
                href={siblingLink.prev}
                className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100 items-center'
                title={t('app.clipping.sidebar.prev')}>
                  <ArrowUpIcon className='w-4 h-4 mr-2' />
                {t('app.clipping.sidebar.prev')}

              </Link>
            </li>
          )}
          {siblingLink.next && (
            <li className='w-full mb-4'>
              <Link
                href={siblingLink.next}
                className='bg-gray-400 bg-opacity-70 border-0 w-full p-4 box-border flex m-0 cursor-pointer hover:bg-gray-100 items-center'
                title={t('app.clipping.sidebar.next')}>
                  <ArrowDownIcon className='w-4 h-4 mr-2' />
                {t('app.clipping.sidebar.next')}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
}

export default ClippingSidebar
