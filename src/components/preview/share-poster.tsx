import { QRCodeSVG } from 'qrcode.react'
import type { CSSProperties, Ref } from 'react'

import type { Clipping, User } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'

import { Theme, themes } from './theme.config'

export type ShareClipping = Pick<
  Clipping,
  'id' | 'title' | 'content' | 'createdAt'
> & {
  creator: Pick<User, 'id' | 'name' | 'avatar'>
}
export type PosterData = {
  book: WenquBook
  uid: number
  clipping?: ShareClipping
}

export function posterLink(
  { book, uid, clipping }: PosterData,
  origin: string
) {
  return clipping
    ? `${origin}/dash/${clipping.creator.id}/clippings/${clipping.id}`
    : `${origin}/dash/${uid}/book/${book.doubanId}`
}

export default function SharePoster({
  data,
  theme,
  images,
  origin,
  locale,
  label,
  ref,
}: {
  data: PosterData
  theme: Theme
  images: Record<string, string>
  origin: string
  locale: string
  label: string
  ref?: Ref<HTMLDivElement>
}) {
  const palette = themes.find((item) => item.id === theme) ?? themes[3]
  const { book, clipping } = data
  const date = clipping ? new Date(clipping.createdAt) : null
  const textStyle: CSSProperties = {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    margin: 0,
  }
  return (
    <div
      ref={ref}
      style={{
        width: 375,
        boxSizing: 'border-box',
        padding: 28,
        background: palette.background,
        color: palette.color,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'left',
        lineHeight: 1.5,
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.color}`,
          paddingBottom: 16,
        }}
      >
        <strong style={{ fontSize: 20, letterSpacing: -1 }}>
          ClippingKK<span style={{ color: palette.accent }}>.</span>
        </strong>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
          {label}
        </span>
      </header>
      {clipping ? (
        <>
          <div
            aria-hidden="true"
            style={{
              color: palette.accent,
              fontSize: 100,
              height: 90,
              fontWeight: 900,
              lineHeight: 1.3,
            }}
          >
            “
          </div>
          <blockquote
            style={{
              ...textStyle,
              fontSize: 27,
              lineHeight: 1.65,
              fontWeight: 800,
              letterSpacing: '-0.6px',
              paddingBottom: 32,
            }}
          >
            {clipping.content}
          </blockquote>
          <div
            style={{
              borderLeft: `4px solid ${palette.accent}`,
              paddingLeft: 14,
              marginBottom: 28,
            }}
          >
            <h2 style={{ ...textStyle, fontSize: 19, fontWeight: 800 }}>
              {book.title || clipping.title}
            </h2>
            {book.author && (
              <p style={{ ...textStyle, fontSize: 13, marginTop: 6 }}>
                {book.author}
              </p>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            {images.avatar && (
              <img
                src={images.avatar}
                alt={clipping.creator.name}
                width={42}
                height={42}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <strong style={{ ...textStyle, fontSize: 13 }}>
                {clipping.creator.name}
              </strong>
              {date && !Number.isNaN(date.getTime()) && (
                <div style={{ fontSize: 11, marginTop: 3 }}>
                  {new Intl.DateTimeFormat(locale).format(date)}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {images.cover && (
            <img
              src={images.cover}
              alt={book.title}
              width={180}
              style={{
                display: 'block',
                height: 'auto',
                margin: '32px auto',
                boxShadow: '10px 12px 0 rgba(0,0,0,0.15)',
              }}
            />
          )}
          <h1
            style={{
              ...textStyle,
              fontSize: 34,
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginTop: 28,
            }}
          >
            {book.title}
          </h1>
          {book.author && (
            <p
              style={{
                ...textStyle,
                fontSize: 16,
                fontWeight: 700,
                marginTop: 14,
                color: palette.accent,
              }}
            >
              {book.author}
            </p>
          )}
          {book.summary && (
            <p
              style={{
                ...textStyle,
                fontSize: 16,
                lineHeight: 1.8,
                marginTop: 24,
              }}
            >
              {book.summary}
            </p>
          )}
        </>
      )}
      <footer
        style={{
          marginTop: 32,
          borderTop: `2px solid ${palette.color}`,
          paddingTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <strong style={{ fontSize: 22, letterSpacing: '-1px' }}>
            ClippingKK.
          </strong>
          <div style={{ fontSize: 10, marginTop: 5 }}>
            {new URL(origin).hostname}
          </div>
        </div>
        <QRCodeSVG
          value={posterLink(data, origin)}
          size={84}
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
          style={{ flexShrink: 0 }}
        />
      </footer>
    </div>
  )
}
