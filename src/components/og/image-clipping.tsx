import type { WenquBook } from '../../services/wenqu'

type ClippingOpenGraphImageProps = {
  content: string
  b: WenquBook
  logoSrc: string
}

const logoSize = 80

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _maxLines = 7

function OGImageClipping(props: ClippingOpenGraphImageProps) {
  const { content, b, logoSrc } = props
  let renderContent = content

  let contentFontSize = '3rem'

  // TODO: 23 chars every line
  if (renderContent.length > 23 * 7) {
    contentFontSize = '2.5rem'
  }
  if (renderContent.length > 23 * 8) {
    contentFontSize = '2.2rem'
  }
  if (renderContent.length > 23 * 9) {
    contentFontSize = '2rem'
  }
  if (renderContent.length > 23 * 10) {
    contentFontSize = '1.8rem'
  }

  if (content.length > 23 * 17) {
    renderContent = `${content.slice(0, 23 * 15)}...`
  }

  return (
    <div
      style={{
        background: 'linear-gradient(65deg, #0072CF, rgba(5, 79, 144, .4))',
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '2rem',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginBottom: '1rem',
          marginTop: '1rem',
        }}
      >
        <img src={logoSrc} width={logoSize} height={logoSize} />
      </div>
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <h2 style={{ fontSize: contentFontSize, lineHeight: '1.5' }}>
          {renderContent}
        </h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <h4 style={{ fontSize: '2rem' }}>{b?.title}</h4>
          <h5 style={{ fontSize: '1.5rem', textAlign: 'right' }}>
            {b?.author}
          </h5>
        </div>
      </div>
    </div>
  )
}

export default OGImageClipping
