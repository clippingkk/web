import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type ViewAllButtonProps = {
  count: number
  userId: number
  userDomain?: string | null
}

export default function ViewAllButton({
  count,
  userId,
  userDomain,
}: ViewAllButtonProps) {
  return (
    <div className="mt-8 text-center">
      <Link
        href={`/dash/${userDomain || userId}/comments`}
        className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <span>View all {count} comments</span>
        <ChevronRight className="h-5 w-5 transition-transform duration-200 hover:translate-x-1" />
      </Link>
    </div>
  )
}
