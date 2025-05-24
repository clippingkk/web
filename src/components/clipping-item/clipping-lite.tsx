import Tooltip from '@annatarhe/lake-ui/tooltip'
import { BookOpenText, Quote } from 'lucide-react'
import Image from 'next/image'
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
      <Image
        src={imageUrl}
        alt="User avatar"
        className="h-full w-full object-cover"
        loading="lazy"
        width={36}
        height={36}
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
        className="group relative flex min-h-64 w-full max-w-4xl flex-col rounded-2xl border border-slate-200/20 bg-white/80 p-6 text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-xl lg:min-h-72 dark:border-slate-700/30 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800/90"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl opacity-50 dark:opacity-30">
          <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/60 to-blue-600/60 blur-2xl dark:from-cyan-500/40 dark:to-blue-700/40" />
          <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-500/40 to-cyan-400/40 blur-3xl dark:from-blue-600/30 dark:to-cyan-500/30" />
        </div>

        {/* Quote icon */}
        <div className="absolute top-3 left-3 text-blue-500/20 dark:text-blue-400/10">
          <Quote size={36} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 pt-7 pb-4">
          <p
            className={`font-lxgw text-xl leading-relaxed text-slate-800 dark:text-slate-100 ${styles.clippingText}`}
          >
            {c.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 dark:border-slate-700/50">
          {/* User info */}
          <div className="flex items-center">
            <SimpleAvatar avatar={c.creator.avatar} />
            <span className="ml-2 max-w-36 overflow-hidden font-medium text-ellipsis text-slate-700 dark:text-slate-200">
              {c.creator.name}
            </span>
          </div>

          {/* Book title */}
          <div className="ml-4 flex items-center gap-2">
            <LinkIndicator>
              <BookOpenText
                size={16}
                className="text-slate-700 dark:text-slate-200"
              />
            </LinkIndicator>
            <Tooltip content={c.title}>
              <span className="font-lxgw mt-1 line-clamp-1 max-w-48 text-right text-sm text-slate-600 opacity-90 transition-opacity group-hover:opacity-100 dark:text-slate-300">
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
