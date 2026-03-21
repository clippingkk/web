import AISummaryBtn from '@/components/clipping-sidebars/ai-summary-btn'
import CopyEmbedHTMLBtn from '@/components/clipping-sidebars/copy-embed-html-btn'
import DoubanLinkBtn from '@/components/clipping-sidebars/douban-link.btn'
import ClippingShareButton from '@/components/clipping-sidebars/share-clipping-btn'
import SiblingNav from '@/components/clipping-sidebars/sibling-nav'
import UpdateClippingBtn from '@/components/clipping-sidebars/update-clipping-btn'
import VisibleToggle from '@/components/clipping-sidebars/visible-toggle'
import type { Clipping, User } from '@/schema/generated'
import type { IN_APP_CHANNEL } from '@/services/channel'
import type { WenquBook } from '@/services/wenqu'

type ClippingSidebarProps = {
  clipping?: Pick<
    Clipping,
    | 'id'
    | 'visible'
    | 'content'
    | 'title'
    | 'createdAt'
    | 'nextClipping'
    | 'prevClipping'
    | 'pageAt'
  > & { creator: Pick<User, 'id' | 'name' | 'domain' | 'avatar'> }
  book: WenquBook | null
  me?: Pick<User, 'id' | 'name' | 'domain' | 'avatar'>
  inAppChannel: IN_APP_CHANNEL
}

function ClippingSidebar(props: ClippingSidebarProps) {
  const { clipping, me, inAppChannel, book } = props

  const clippingDomain = clipping
    ? clipping.creator.domain.length > 2
      ? clipping.creator.domain
      : clipping.creator.id.toString()
    : me?.id.toString()

  return (
    <div className="space-y-6">
      {/* Book Info Card */}
      {book && (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative rounded-2xl border border-gray-200/50 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/50">
            <div className="flex items-start gap-4">
              {book.image && (
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-24 w-16 rounded-lg object-cover shadow-sm"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold text-gray-900 dark:text-zinc-50">
                  {book.title}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                  {book.author}
                </p>
                {book.rating && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(book.rating / 2) ? 'fill-current' : 'fill-gray-300 dark:fill-zinc-600'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500 dark:text-zinc-500">
                      {book.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Section with Card-based Design */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-zinc-500">
          <span className="inline-block h-1 w-1 rounded-full bg-blue-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <AISummaryBtn clipping={clipping} me={me} book={book} />
          </div>
          <ClippingShareButton book={book} clipping={clipping} />
          <DoubanLinkBtn book={book} />
          <CopyEmbedHTMLBtn clipping={clipping} book={book} />
          <VisibleToggle clipping={clipping} me={me} />
          <div className="col-span-2">
            <UpdateClippingBtn clipping={clipping} me={me} />
          </div>
        </div>
      </div>

      {/* Navigation Section with Enhanced Design */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent to-gray-50/50 dark:to-zinc-800/30" />
        <div className="relative rounded-2xl border border-gray-200/30 bg-white/30 p-4 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/30">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-zinc-500">
            <span className="inline-block h-1 w-1 rounded-full bg-purple-400" />
            Navigate
          </h3>
          <SiblingNav
            clipping={clipping}
            iac={inAppChannel}
            domain={clippingDomain}
          />
        </div>
      </div>
    </div>
  )
}

export default ClippingSidebar
