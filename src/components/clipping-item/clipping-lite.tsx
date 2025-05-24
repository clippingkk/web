import Tooltip from '@annatarhe/lake-ui/tooltip'
import { BookOpenText, Quote } from 'lucide-react'
import Link from 'next/link'
import { CDN_DEFAULT_DOMAIN } from '../../constants/config'
import { Clipping, User } from '../../schema/generated'
import { IN_APP_CHANNEL } from '../../services/channel'
import LinkIndicator from '../link-indicator'
import styles from './clipping-lite.module.css'

type ClippingLiteProps = {
  clipping: Pick<Clipping, 'id' | 'title' | 'content'> & {
    creator: Pick<User, 'domain' | 'id' | 'name' | 'avatar'>
  }
}

function SimpleAvatar({ avatar }: { avatar: string }) {
  const imageUrl = avatar.startsWith('http')
    ? avatar
    : `${CDN_DEFAULT_DOMAIN}/${avatar}`
  return (
    <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/30 shadow-md">
      <img
        src={imageUrl}
        alt="User avatar"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

function ClippingLite(props: ClippingLiteProps) {
  const { clipping: c } = props

  return (
    <div className="flex w-full justify-center">
      <Link
        href={`/dash/${c.creator.domain.length > 2 ? c.creator.domain : c.creator.id}/clippings/${c.id}?iac=${IN_APP_CHANNEL.clippingFromUser}`}
        className="group relative flex min-h-64 w-full max-w-4xl flex-col rounded-2xl border border-slate-200/20 bg-white/10 p-6 text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:shadow-xl lg:min-h-72 dark:border-slate-700/20 dark:bg-slate-800/10 dark:text-slate-200 dark:hover:bg-slate-800/20"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-10 h-full w-full overflow-hidden rounded-2xl opacity-20 dark:opacity-30">
          <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/60 to-blue-600/60 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-500/40 to-cyan-400/40 blur-3xl" />
        </div>

        {/* Quote icon */}
        <div className="absolute top-3 left-3 text-blue-500/30 dark:text-blue-400/20">
          <Quote size={36} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 pt-7 pb-4">
          <p
            className={`font-lxgw text-xl leading-relaxed ${styles.clippingText}`}
          >
            {c.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/20 pt-3 dark:border-slate-700/20">
          {/* User info */}
          <div className="flex items-center">
            <SimpleAvatar avatar={c.creator.avatar} />
            <span className="ml-2 max-w-36 overflow-hidden font-medium text-ellipsis">
              {c.creator.name}
            </span>
          </div>

          {/* Book title */}
          <div className="ml-4 flex items-center gap-2">
            <LinkIndicator>
              <BookOpenText size={16} className="text-white" />
            </LinkIndicator>
            <Tooltip content={c.title}>
              <span className="font-lxgw mt-1 line-clamp-1 max-w-48 text-right text-sm opacity-80 transition-opacity group-hover:opacity-100">
                {c.title}
              </span>
            </Tooltip>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ClippingLite
