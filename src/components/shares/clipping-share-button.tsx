import { useTranslation } from '@/i18n/client'
import { Button } from '@mantine/core'
import { useState } from 'react'
import Preview from '../preview/preview4'
import { WenquBook } from '@/services/wenqu'
import { Clipping, User } from '@/schema/generated'

type Props = {
  book: WenquBook
  clipping: Pick<Clipping, 'id' | 'title' | 'content' | 'createdAt'> & { creator: Pick<User, 'id' | 'name' | 'avatar'> }
}

function ClippingShareButton({ book, clipping }: Props) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button
        variant='gradient'
        gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
        fullWidth
        onClick={() => setVisible(!visible)}
      >
        {t('app.clipping.shares')}
      </Button>
      {visible && (
        <Preview
          onCancel={() => setVisible(false)}
          onOk={() => setVisible(false)}
          background={book.image}
          clipping={clipping}
          book={book}
        />
      )}
    </>
  )
}

export default ClippingShareButton
