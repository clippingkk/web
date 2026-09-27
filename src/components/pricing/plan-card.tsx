import Card from '@annatarhe/lake-ui/card'
import { Check } from 'lucide-react'
import type React from 'react'

import { cn } from '@/lib/utils'

type PlanCardProps = {
  id: string
  name: string
  description: string
  price: string
  badge?: React.ReactNode
  featuresLabel: string
  features: string[]
  action: React.ReactNode
  /** The plan the page recommends: a raised card with an accent hairline. */
  emphasis?: boolean
}

function PlanCard(props: PlanCardProps) {
  const {
    id,
    name,
    description,
    price,
    badge,
    featuresLabel,
    features,
    action,
    emphasis = false,
  } = props
  const headingId = `${id}-title`
  return (
    <section aria-labelledby={headingId} className="h-full">
      <Card
        variant={emphasis ? 'elevated' : 'bordered'}
        padding="lg"
        className={cn(
          'flex h-full flex-col gap-6',
          emphasis && 'border-lake-accent/40'
        )}
      >
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id={headingId} className="type-title text-lake-fg">
              {name}
            </h2>
            {badge}
          </div>
          <p className="type-body text-lake-fg-muted">{description}</p>
          <p className="type-meta">{price}</p>
        </header>
        <div className="border-lake-line flex-1 border-t pt-5">
          <p className="type-eyebrow mb-3">{featuresLabel}</p>
          <ul className="flex flex-col gap-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="text-lake-fg flex items-start gap-3 text-sm leading-relaxed"
              >
                <Check
                  aria-hidden="true"
                  className="text-lake-accent-text mt-0.5 size-4 shrink-0"
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">{action}</div>
      </Card>
    </section>
  )
}

export default PlanCard
