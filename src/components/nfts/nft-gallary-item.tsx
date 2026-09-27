import Skeleton from '@annatarhe/lake-ui/skeleton'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import type { NftItem } from '../../schema/generated'
import type { NFTMetadata } from '../../services/nft'

type NFTGallaryItemProps = {
  data: NftItem
  selected?: boolean
  onClick?: (data: NftItem, realImage: string) => void
}

function NFTGallaryItem(props: NFTGallaryItemProps) {
  const { data, selected, onClick } = props
  const metadata = useMemo<NFTMetadata | null>(() => {
    try {
      return JSON.parse(data.metadata)
    } catch {
      return null
    }
  }, [data.metadata])

  const imageUrl = useMemo(() => {
    const url = metadata?.image
    if (!url) return null
    return url.startsWith('ipfs')
      ? url.replace('ipfs://', 'https://gateway.moralisipfs.com/ipfs/')
      : url
  }, [metadata?.image])

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!imageUrl) return
    let active = true
    const img = document.createElement('img')
    img.onload = () => active && setStatus('ready')
    img.onerror = () => active && setStatus('error')
    img.src = imageUrl
    return () => {
      active = false
    }
  }, [imageUrl])

  if (!imageUrl || status === 'error') return null
  if (status === 'loading') {
    return <Skeleton className="rounded-lake-control aspect-square w-full" />
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onClick?.(data, imageUrl)}
      className={cn(
        'rounded-lake-control flex w-full flex-col overflow-hidden border text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-lake-ring',
        selected
          ? 'border-lake-accent ring-lake-accent ring-1'
          : 'border-lake-line hover:border-lake-line-strong'
      )}
    >
      <img
        src={imageUrl}
        alt={data.name}
        className="aspect-square w-full object-cover"
      />
      <span className="flex flex-col p-2">
        <span className="text-lake-fg truncate text-sm font-medium">
          {data.name}
        </span>
        <span className="type-meta truncate">{metadata?.name ?? ''}</span>
      </span>
    </button>
  )
}

export default NFTGallaryItem
