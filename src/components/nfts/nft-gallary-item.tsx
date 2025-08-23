import { useEffect, useMemo, useState } from 'react'
import type { NftItem } from '@/gql/graphql'
import type { NFTMetadata } from '../../services/nft'

type NFTGallaryItemProps = {
  data: NftItem
  onClick?: (data: NftItem, realImage: string) => void
}

function NFTGallaryItem(props: NFTGallaryItemProps) {
  const metadata = useMemo<NFTMetadata | null>(() => {
    try {
      return JSON.parse(props.data.metadata)
    } catch (e) {
      console.error(e)
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
    return <div className=' w-28 h-28 animate-pulse bg-gray-500' />
  }
  return (
    <div
      className=' w-32 mx-auto flex justify-center items-center mt-4'
      onClick={() => {
        if (props.onClick) {
          props.onClick(props.data, realImageUrl)
        }
      }}
    >
      <div className='bg-gray-400 bg-opacity-0 hover:bg-opacity-30 duration-300'>
        <img
          src={realImageUrl}
          // width={80}
          //  height={80}
          // className='w-28 h-28'
          className='w-full h-full rounded-t-lg'
          alt={props.data.name}
        />
        <div className='p-2 rounded-b-lg'>
          <h6 className=' text-white text-sm'>{props.data.name}</h6>
          <span className=' text-white text-xs'>{metadata?.name ?? ''}</span>
        </div>
      </div>
    </div>
  )
}

export default NFTGallaryItem
