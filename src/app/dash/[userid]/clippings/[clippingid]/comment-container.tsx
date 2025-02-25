import { useTranslation } from '@/i18n'
import { FetchClippingQuery, ProfileQuery } from '@/schema/generated'
import { WenquBook } from '@/services/wenqu'
import Comment from './comment'
import CommentBox from './commentBox'

type Props = {
  me?: ProfileQuery['me']
  clipping?: FetchClippingQuery['clipping']
  book: WenquBook | null
}

async function CommentContainer({ me, clipping, book }: Props) {
  const { t } = await useTranslation()

  if (!me || me.id === 0) {
    return null
  }

  return (
    <div className='container px-2 lg:px-20 mb-4'>
      <div
        className='w-full h-full rounded-sm p-4 backdrop-blur-sm bg-slate-200 dark:bg-slate-800 bg-opacity-50 dark:bg-opacity-50 shadow-sm'
        style={{
          // backgroundImage: 'linear-gradient(180deg, oklch(71.33% 0.16 292.24 / 6.75%) 0%, oklch(71.33% 0.16 292.24 / 36.75%) 100%)',
        }}
      >
        <>
          <h3 className='text-2xl lg:text-4xl font-light lg:mb-4'>{t('app.clipping.comments.title')}</h3>
          {clipping && me && (
            <CommentBox me={me} book={book} clipping={clipping} />
          )}
          <ul>
            {clipping?.comments.map(m => (
              <Comment key={m.id} comment={m} />
            ))}
          </ul>
        </>
      </div>
    </div>
  )
}

export default CommentContainer
