import { MessageSquare } from 'lucide-react'
import { getTranslation } from '@/i18n'
import { getClippingData } from '../data'
import Comment from './comment'
import CommentBox from './commentBox'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
}

async function CommentsContent(props: PageProps) {
  const { clippingid } = await props.params
  const cid = ~~clippingid

  const { t } = await getTranslation()

  const { clipping, me, bookData } = await getClippingData(cid)

  if (clipping && me) {
    return (
      <div className='pb-6 border-b border-gray-100 dark:border-zinc-800'>
        <CommentBox me={me} book={bookData} clipping={clipping} />
        {
          <div className='py-4'>
            {clipping.comments.map((m) => (
              <div
                key={m.id}
                className='transition-all duration-200 hover:translate-x-1'
              >
                <Comment comment={m} currentUser={me} />
              </div>
            ))}
            {clipping.comments.length === 0 && (
              <div className='py-12 text-center'>
                <MessageSquare className='h-12 w-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3' />
                <p className='text-gray-500 dark:text-zinc-400'>
                  {t('app.clipping.comments.empty')}
                </p>
              </div>
            )}
          </div>
        }
      </div>
    )
  }
}

export default CommentsContent
