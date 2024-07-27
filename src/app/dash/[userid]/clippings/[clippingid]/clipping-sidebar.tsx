import React, { useCallback, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import Switch from '@/components/switcher'
import Card from '@/components/card/card'
import { WenquBook } from '@/services/wenqu'
import { UserContent } from '@/store/user/type'
import { useTranslation } from 'react-i18next'
import { IN_APP_CHANNEL } from '@/services/channel'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import BookInfoChanger from '@/components/book-info-changer/bookInfoChanger'
import { ArrowDownIcon, ArrowUpIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { Clipping, User, useToggleClippingVisibleMutation } from '@/schema/generated'
import { Button, NavLink, Tooltip } from '@mantine/core'
import ClippingAISummaryModal from '@/components/clipping-item/aiSummary'
import { toastPromiseDefaultOption } from '@/services/misc'

type ClippingSidebarProps = {
  clipping?: Pick<Clipping, 'id' | 'visible' | 'content' | 'title' | 'createdAt' | 'nextClipping' | 'prevClipping'> & { creator: Pick<User, 'id' | 'name' | 'domain'> }
  book: WenquBook | null
  me?: UserContent
  inAppChannel: IN_APP_CHANNEL
  onTogglePreviewVisible: () => void
}

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

function ClippingSidebar(props: ClippingSidebarProps) {
  const { clipping, me, book } = props

  const { t } = useTranslation()
  const client = useApolloClient()
  const [execToggleClipping] = useToggleClippingVisibleMutation()
  const [aiSummaryVisible, setAISummaryVisible] = useState(false)

  const [updateClippingBookId, setUpdateClippingBookId] = useState(-1)

  const updateClipping = useCallback(() => {
    if (!clipping) {
      return
    }

    setUpdateClippingBookId(clipping.id)
  }, [clipping?.id])

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
    me?.id.toString()

  const siblingLink = getSiblingLink(props.inAppChannel, clippingDomain, clipping)
  return (
    <div className='flex-1 p-4 shadow bg-slate-200 dark:bg-slate-800 my-4 rounded bg-opacity-50 dark:bg-opacity-50 backdrop-blur -z-10'>
      <div className='flex w-full h-full flex-col justify-between items-center'>
        <ul className={'w-full p-0 list-none'}>
          <li className='w-full mb-4'>
            <Button
              variant='gradient'
              className='bg-gradient-to-r from-indigo-600 to-cyan-700 transition-all active:scale-95'
              fullWidth
              leftSection={
                <SparklesIcon className=' w-4 h-4' />
              }
              onClick={() => {
                setAISummaryVisible(true)
              }}
            >
              {t('app.clipping.aiSummary')}
            </Button>
            <ClippingAISummaryModal
              open={aiSummaryVisible}
              cid={clipping?.id}
              onClose={() => {
                setAISummaryVisible(false)
              }}
            />
          </li>

          {me.id === clipping?.creator.id && (
            <li className='w-full mb-4'>
              <Button
                variant='gradient'
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                fullWidth
                onClick={updateClipping}
              >
                {t('app.clipping.update')}
              </Button>
              <BookInfoChanger
                bookName={clipping.title}
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
          )}

          <li className='w-full mb-4'>
            <Button
              variant='gradient'
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              fullWidth
              onClick={props.onTogglePreviewVisible}
            >
              {t('app.clipping.shares')}
            </Button>
          </li>
          <li className='w-full mb-4'>
            <Button
              component='a'
              disabled={!book}
              href={book ? `https://book.douban.com/subject/${book?.doubanId}` : 'javascript:void(0)'}
              target="_blank"
              rel="noreferrer"
              variant='gradient'
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              fullWidth
            >
              {t('app.clipping.link')}
            </Button>
          </li>
          <li className='w-full mb-4'>
            <Button
              variant='gradient'
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              fullWidth
              onClick={onCopyEmbedHtml}
            >
              {t('app.clipping.embed.title')}
            </Button>
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
                    toast.promise(
                      execToggleClipping({
                        variables: {
                          ids: [clipping.id]
                        }
                      }),
                      toastPromiseDefaultOption)
                      .then(res => {
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
              <Tooltip label={t('app.clipping.sidebar.prev')}>
                <NavLink
                  component={Link}
                  href={siblingLink.prev}
                  className='active:scale-95 transition-all duration-150'
                  leftSection={
                    <ArrowUpIcon className='w-4 h-4 mr-2' />
                  }
                  label={t('app.clipping.sidebar.prev')}
                />
              </Tooltip>
            </li>
          )}
          {siblingLink.next && (
            <li className='w-full mb-4'>
              <Tooltip
                label={t('app.clipping.sidebar.next')}
              >
                <NavLink
                  component={Link}
                  href={siblingLink.next}
                  className='active:scale-95 transition-all duration-150'
                  leftSection={
                    <ArrowDownIcon className='w-4 h-4 mr-2' />
                  }
                  label={t('app.clipping.sidebar.next')}
                />
              </Tooltip>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default ClippingSidebar
