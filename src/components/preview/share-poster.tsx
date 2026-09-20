import { QRCodeSVG } from 'qrcode.react'
import type { CSSProperties, Ref } from 'react'

import type { Clipping, User } from '@/schema/generated'
import type { WenquBook } from '@/services/wenqu'

import { isLatin, LATIN_STACK, posterFontFamily } from './poster-fonts'
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
  const dateText =
    date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat(locale).format(date)
      : ''
  return (
    <div
      ref={ref}
      style={{
        width: 375,
        boxSizing: 'border-box',
        padding: 28,
        background: palette.background,
        color: palette.color,
        fontFamily: LATIN_STACK,
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
        <strong style={{ fontSize: 20, fontWeight: 700 }}>
          ClippingKK<span style={{ color: palette.accent }}>.</span>
        </strong>
        <span
          style={{
            fontFamily: posterFontFamily(label),
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          {label}
        </span>
      </header>
      {clipping ? (
        <>
          <div
            aria-hidden="true"
            style={{
              color: palette.accent,
              fontSize: 96,
              height: 76,
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            “
          </div>
          <blockquote
            style={{
              ...textStyle,
              fontFamily: posterFontFamily(clipping.content),
              fontSize: 25,
              lineHeight: 1.75,
              fontWeight: 400,
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
            <h2
              style={{
                ...textStyle,
                fontFamily: posterFontFamily(book.title || clipping.title),
                fontSize: 19,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {book.title || clipping.title}
            </h2>
            {book.author && (
              <p
                style={{
                  ...textStyle,
                  fontFamily: posterFontFamily(book.author),
                  fontStyle: isLatin(book.author) ? 'italic' : 'normal',
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
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
              <strong
                style={{
                  ...textStyle,
                  fontFamily: posterFontFamily(clipping.creator.name),
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {clipping.creator.name}
              </strong>
              {dateText && (
                <div
                  style={{
                    fontFamily: posterFontFamily(dateText),
                    fontSize: 11,
                    marginTop: 3,
                  }}
                >
                  {dateText}
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
              fontFamily: posterFontFamily(book.title),
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.3,
              marginTop: 28,
            }}
          >
            {book.title}
          </h1>
          {book.author && (
            <p
              style={{
                ...textStyle,
                fontFamily: posterFontFamily(book.author),
                fontStyle: isLatin(book.author) ? 'italic' : 'normal',
                fontSize: 17,
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
                fontFamily: posterFontFamily(book.summary),
                fontSize: 16,
                lineHeight: 1.85,
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
          <strong style={{ fontSize: 22, fontWeight: 700 }}>ClippingKK.</strong>
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
