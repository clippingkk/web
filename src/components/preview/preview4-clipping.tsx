import React, { ForwardedRef, forwardRef, useMemo } from 'react'
import { franc } from 'franc-min'
import convert6393to1 from 'iso-639-3-to-1'
import { Clipping, User } from '../../schema/generated'
import { WenquBook } from '../../services/wenqu'
import Image from 'next/image'
import { Avatar } from '@mantine/core'
import { KonzertThemeMap } from '../../services/utp'
import { Theme, themeList } from './theme.config'
import { useTranslation } from 'react-i18next'

const lxgwFontLanguages = ['zh', 'jp', 'ko']

type Preview4ClippingProps = {
  clipping: Pick<Clipping, 'id' | 'title' | 'content' | 'createdAt'> & { creator: Pick<User, 'id' | 'name' | 'avatar'> }
  book: WenquBook | null
  theme: Theme
}

function Preview4Clipping(props: Preview4ClippingProps, ref: ForwardedRef<any>) {
  const { clipping, book, theme } = props
  const { t } = useTranslation()

  const themeConfig = themeList[theme]
  // const { data: qrcodeImage } = useQuery({
  //   queryKey: ['clipping', clipping.id, 'qrcode', [clipping.id, themeConfig.qrLineColor]],
  //   queryFn: async () => {
  //     return FetchQRCode(
  //       `c=${clipping.id}`,
  //       'pages/landing/landing',
  //       90,
  //       true,
  //       themeConfig.qrLineColor
  //     )
  //   }
  // })
  const qrcodeImage = null

  const isFontLXGW = useMemo(() => {
    if (!book?.title) {
      return false
    }
    const lng = convert6393to1(franc(book.title))
    return lxgwFontLanguages.includes(lng)
  }, [book?.title])

  const createdAt = useMemo(() => {
    return new Intl.DateTimeFormat()
      .format(new Date(clipping.createdAt))
  }, [clipping.createdAt])

  return (
    <div
      ref={ref}
      className={isFontLXGW ? 'font-lxgw' : 'font-lato'}
      style={{
        width: '375px',
        background: themeConfig.bg,
        padding: themeConfig.padding,
        color: themeConfig.fontColor
      }}
    >
      <div
        style={{
          margin: `calc(${themeConfig.padding} * 2) 0`,
        }}
      >
        <Avatar
          src={clipping.creator.avatar}
          size={50}
          alt={clipping.creator.name}
        />
        <h4 className='my-2 text-sm'>{clipping.creator.name}</h4>
        <span className='text-xs'>
          {t('app.clipping.share.excerptAt', { date: createdAt })}
        </span>
      </div>

      <div className='min-h-[20rem] flex-1 justify-center items-center text-lg leading-loose flex'
      >
        <p>
          {clipping.content}
        </p>
      </div>

      <div
        style={{
          margin: `calc(${themeConfig.padding} * 2) 0`,
        }}
      >
        <h5 className='my-2 text-sm text-right'>{book?.title}</h5>
        <h6 className='my-2 text-xs text-right'>{book?.author}</h6>
      </div>

      <div
        className='flex justify-between items-center p-4 rounded-lg'
        style={{
          marginBottom: themeConfig.padding,
          background: themeConfig.footerBg,
          backdropFilter: themeConfig.footerBlur,
        }}
      >
        <div className='flex items-start flex-col justify-center'>
          <h2 className='text-xl leading-loose font-bold'>
            ClippingKK
          </h2>
          <h3 className='text-xs leading-loose'>
            {t('app.slogan')}
          </h3>
        </div>

        {qrcodeImage && (
          <Image
            src={qrcodeImage}
            alt='clipping'
            width={90}
            height={90}
          />
        )}
      </div>

    </div>
  )
}

export default forwardRef(Preview4Clipping)
