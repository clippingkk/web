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
    <div className='w-full mb-8'>
      <div className='w-full rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 p-6 border-b border-gray-200 dark:border-zinc-800'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-400 dark:bg-blue-400 rounded-xl'>
              <MessageSquare className='h-5 w-5 text-white' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-zinc-50'>
              {t('app.clipping.comments.title')}
            </h3>
          </div>
        </div>
        
        <div className='p-6 space-y-6'>
          {clipping && me && (
            <div className='pb-6 border-b border-gray-100 dark:border-zinc-800'>
              <CommentBox me={me} book={book} clipping={clipping} />
            </div>
          )}
          
          {clipping?.comments.length ? (
            <div className='space-y-4'>
              {clipping.comments.map(m => (
                <div key={m.id} className='transition-all duration-200 hover:translate-x-1'>
                  <Comment comment={m} />
                </div>
              ))}
            </div>
          ) : (
            <div className='py-12 text-center'>
              <MessageSquare className='h-12 w-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3' />
              <p className='text-gray-500 dark:text-zinc-400'>
                {t('app.clipping.comments.empty')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentContainer
