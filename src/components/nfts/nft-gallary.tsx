import { useQuery } from '@apollo/client'
import React, { useMemo } from 'react'
import { NftItem, useFetchMyNfTsQuery } from '../../schema/generated'
import NFTGallaryItem from './nft-gallary-item'

type NFTGallaryProps = {
  uid: number
  onPick: (nft: NftItem, realImage: string) => void
}

// FIXME:
// 这里是有可能被改动改成其他人的 nft 的，需要后端校验 nft 的合法性
function NFTGallary(props: NFTGallaryProps) {
  const { data } = useFetchMyNfTsQuery({
    variables: {
      uid: props.uid
    }
  })

  const nftList = useMemo(() => {
    const ls = data?.me.nfts.edges ?? []
    return ls.filter(x => x.contractType === 'ERC721')
  }, [data?.me.nfts.edges])

  return (
    <div className=' w-144 grid grid-cols-2'>
      {nftList.map(x => (
        <NFTGallaryItem
          data={x}
          key={x.tokenID}
          onClick={props.onPick}
        />
      ))}
    </div>
  )
}

export default NFTGallary
