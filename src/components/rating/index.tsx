import { cn } from '@/utils/cn'
import { Star } from 'lucide-react'

interface Props {
  /** rating from 0 to 10 */
  rating: number
  className?: string
}

function Rating({ rating, className }: Props) {
  return (
    <div className={cn('flex items-center', className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${i < Math.round(rating / 2) ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

export default Rating
