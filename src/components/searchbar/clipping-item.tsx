import { UserContent } from '@/store/user/type'
import Link from 'next/link'
import { Book, Quote } from 'lucide-react'
import { useMemo } from 'react'

type Props = {
  clipping: { id: number, content: string, title?: string, bookName?: string }
  profile: Pick<UserContent, 'id' | 'domain'>
  onClick: () => void
  highlightText?: string
}

function SearchClippingItem(props: Props) {
  const { clipping: c, profile, onClick, highlightText = '' } = props

  // Memoize highlighted content to avoid recalculating on every render
  const highlightedContent = useMemo(() => {
    if (!highlightText || highlightText.length < 2) {
      return <>{c.content}</>
    }

    // Case insensitive search
    const regex = new RegExp(`(${highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = c.content.split(regex)

    return parts.map((part, index) => {
      // Check if this part matches our highlight text (case insensitive)
      if (part.toLowerCase() === highlightText.toLowerCase()) {
        return (
          <mark
            key={index}
            className="bg-transparent text-purple-600 dark:text-purple-400 font-medium px-0.5"
          >
            {part}
          </mark>
        )
      }
      return <span key={index}>{part}</span>
    })
  }, [c.content, highlightText])

  return (
    <li
      className="relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group with-slide-in"
    >
      {/* Enhanced gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-500/20 to-pink-500/20 
        dark:from-indigo-600/10 dark:via-purple-500/10 dark:to-pink-500/10 
        group-hover:from-indigo-600/30 group-hover:via-purple-500/30 group-hover:to-pink-500/30 
        dark:group-hover:from-indigo-600/20 dark:group-hover:via-purple-500/20 dark:group-hover:to-pink-500/20 
        rounded-lg opacity-75 transition-all duration-500 group-hover:opacity-100 group-hover:blur-[0.5px]" />

      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] blur-[1px]" />
      </div>

      <Link
        href={`/dash/${profile.domain.length > 3 ? profile.domain : profile.id}/clippings/${c.id}`}
        className="block relative p-5 rounded-lg dark:bg-slate-800/90 bg-white/90 backdrop-blur-md transition-all duration-300"
        onClick={onClick}
        aria-label={`View clipping: ${c.content.substring(0, 50)}${c.content.length > 50 ? '...' : ''}`}
      >
        <div className="flex flex-col gap-3">
          {/* Main content with improved typography */}
          <p className="text-base sm:text-lg text-slate-800 dark:text-white leading-relaxed font-medium">
            <Quote className="w-4 h-4 inline-block mr-2 text-purple-500 align-text-bottom opacity-75" />
            {highlightedContent}
          </p>

          {/* Book info if available */}
          {c.bookName && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Book className="w-3.5 h-3.5 text-indigo-500" />
              <span className="line-clamp-1">{c.bookName}</span>
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}

export default SearchClippingItem
