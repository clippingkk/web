import { useTranslation } from '@/i18n'
import { FetchClippingQuery, ProfileQuery } from '@/schema/generated'
import { WenquBook } from '@/services/wenqu'
import Comment from './comment'
import CommentBox from './commentBox'
import { MessageSquare } from 'lucide-react'

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
    <div className='w-full mb-8 transition-all duration-300 ease-in-out'>
      <div
        className='w-full h-full rounded-lg p-6 backdrop-blur-lg bg-slate-200 dark:bg-slate-800 bg-opacity-60 dark:bg-opacity-60 shadow-md hover:shadow-lg transition-all duration-300'
      >
        <div className='space-y-6'>
          <div className='flex items-center gap-2 border-b border-slate-300 dark:border-slate-700 pb-4'>
            <MessageSquare className='h-6 w-6 text-indigo-500 dark:text-indigo-400' />
            <h3 className='text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent'>
              {t('app.clipping.comments.title')}
            </h3>
          </div>
          
          {clipping && me && (
            <div className='py-2'>
              <CommentBox me={me} book={book} clipping={clipping} />
            </div>
          )}
          
          {clipping?.comments.length ? (
            <ul className='space-y-4 divide-y divide-slate-300 dark:divide-slate-700'>
              {clipping.comments.map(m => (
                <li key={m.id} className='pt-4 first:pt-0'>
                  <Comment comment={m} />
                </li>
              ))}
            </ul>
          ) : (
            <div className='py-4 text-center text-slate-500 dark:text-slate-400 italic'>
              {t('app.clipping.comments.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentContainer
