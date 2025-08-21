import { franc } from 'franc-min'
import convert6393to1 from 'iso-639-3-to-1'
import { QRCodeSVG } from 'qrcode.react'
import { type ForwardedRef, forwardRef, useMemo } from 'react'
import Avatar from '@/components/avatar/avatar'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'
import { useTranslation } from '@/i18n/client'
import type { Clipping, User } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'
import { type Theme, themeList } from './theme.config'

const lxgwFontLanguages = ['zh', 'jp', 'ko']

type Preview4ClippingProps = {
  clipping: Pick<Clipping, 'id' | 'title' | 'content' | 'createdAt'> & {
    creator: Pick<User, 'id' | 'name' | 'avatar'>
  }
  book: WenquBook | null
  theme: Theme
  ref?: ForwardedRef<HTMLDivElement>
}

function Preview4Clipping(props: Preview4ClippingProps) {
  const { clipping, book, theme, ref } = props
  const { t } = useTranslation()
  const themeConfig = themeList[theme]
  const isFontLXGW = useMemo(() => {
    if (!clipping.content) {
      return false
    }
    const lng = convert6393to1(franc(clipping.content))
    return lxgwFontLanguages.includes(lng)
  }, [clipping.content])

  const createdAt = useMemo(() => {
    return new Intl.DateTimeFormat().format(new Date(clipping.createdAt))
  }, [clipping.createdAt])

  const avatar = useMemo(() => {
    const originalAvatar = clipping.creator.avatar
    return originalAvatar.startsWith('http')
      ? originalAvatar
      : `${CDN_DEFAULT_DOMAIN}/${originalAvatar}`
  }, [clipping.creator.avatar])

  return (
    <div
      ref={ref}
      className={isFontLXGW ? 'font-lxgw' : 'font-lato'}
      style={{
        width: '375px',
        background: themeConfig.bg,
        padding: themeConfig.padding,
        color: themeConfig.fontColor,
      }}
    >
      <div
        style={{
          margin: `calc(${themeConfig.padding} * 2) 0`,
        }}
      >
        <Avatar
          img={avatar}
          className='rounded-full shadow-sm'
          name={clipping.creator.name}
        />
        <h4 className='my-2 text-sm'>{clipping.creator.name}</h4>
        <span className='text-xs'>
          {t('app.clipping.share.excerptAt', {
            date: createdAt,
            interpolation: { escapeValue: false },
          })}
        </span>
      </div>

      <div className='flex min-h-[20rem] flex-1 items-center justify-center text-lg leading-loose'>
        <p>{clipping.content}</p>
      </div>

      <div
        style={{
          margin: `calc(${themeConfig.padding} * 2) 0`,
        }}
      >
        <h5 className='my-2 text-right text-sm'>{book?.title}</h5>
        <h6 className='my-2 text-right text-xs'>{book?.author}</h6>
      </div>

      <div
        className='flex items-center justify-between rounded-lg p-4'
        style={{
          marginBottom: themeConfig.padding,
          background: themeConfig.footerBg,
          backdropFilter: themeConfig.footerBlur,
        }}
      >
        <div className='flex flex-col items-start justify-center'>
          <h2 className='text-xl leading-loose font-bold'>ClippingKK</h2>
          <h3 className='text-xs leading-loose'>{t('app.slogan')}</h3>
        </div>
        <QRCodeSVG
          value={`https://clippingkk.annatarhe.com/dash/${clipping.creator.id}/clippings/${clipping.id}`}
          size={90}
        />
      </div>
    </div>
  )
}

export default forwardRef(Preview4Clipping)
