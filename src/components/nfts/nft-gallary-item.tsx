import { useEffect, useMemo, useState } from 'react'

import type { NftItem } from '../../schema/generated'
import type { NFTMetadata } from '../../services/nft'

type NFTGallaryItemProps = {
  data: NftItem
  onClick?: (data: NftItem, realImage: string) => void
}

function NFTGallaryItem(props: NFTGallaryItemProps) {
  const metadata = useMemo<NFTMetadata | null>(() => {
    try {
      return JSON.parse(props.data.metadata)
    } catch {
      return null
    }
  }, [props.data.metadata])

  const realImageUrl = useMemo(() => {
    const url = metadata?.image
    if (!url) {
      return null
    }

    if (url.startsWith('ipfs')) {
      return url.replace('ipfs://', 'https://gateway.moralisipfs.com/ipfs/')
    }
    return url
  }, [metadata?.image])

  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isImageLoadError, setIsImageLoadError] = useState<boolean | null>(null)

  useEffect(() => {
    if (!realImageUrl) {
      return
    }
    let m: HTMLImageElement | null = document.createElement('img')
    m.onload = () => {
      setIsImageLoaded(true)
    }
    m.onerror = () => {
      setIsImageLoadError(true)
    }
    m.src = realImageUrl
    return () => {
      m = null
    }
  }, [realImageUrl])

  if (isImageLoadError) {
    return null
  }

  if (!isImageLoaded || !realImageUrl) {
    return <div className="h-28 w-28 animate-pulse bg-gray-500" />
  }
  return (
    <button
      type="button"
      className="mx-auto mt-4 flex w-32 cursor-pointer items-center justify-center border-none bg-transparent p-0"
      onClick={() => {
        if (props.onClick) {
          props.onClick(props.data, realImageUrl)
        }
      }}
    >
      <div className="bg-opacity-0 hover:bg-opacity-30 bg-gray-400 duration-300">
        <img
          src={realImageUrl}
          className="h-full w-full rounded-t-lg"
          alt={props.data.name}
        />
        <div className="rounded-b-lg p-2">
          <h6 className="text-sm text-white">{props.data.name}</h6>
          <span className="text-xs text-white">{metadata?.name ?? ''}</span>
        </div>
      </div>
    </button>
  )
}

export default NFTGallaryItem
