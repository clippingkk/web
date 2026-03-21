import { useMemo } from 'react'

import { type NftItem, useFetchMyNfTsQuery } from '../../schema/generated'
import NFTGallaryItem from './nft-gallary-item'

type NFTGallaryProps = {
  uid: number
  onPick: (nft: NftItem, realImage: string) => void
}

// FIXME:
// 这里是有可能被改动改成其他人的 nft 的，需要后端校验 nft 的合法性
function NFTGallary(props: NFTGallaryProps) {
  const { data, loading } = useFetchMyNfTsQuery({
    variables: {
      uid: props.uid,
    },
  })

  const nftList = useMemo(() => {
    const ls = data?.me.nfts.edges ?? []
    return ls.filter((x) => x.contractType === 'ERC721')
  }, [data?.me.nfts.edges])

  if (loading) {
    return (
      <div className="grid w-144 grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mx-auto mt-4 flex w-32 flex-col items-center">
            <div className="h-32 w-32 animate-pulse rounded-t-lg bg-gray-300 dark:bg-gray-700" />
            <div className="w-32 rounded-b-lg bg-gray-200 p-2 dark:bg-gray-800">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="mt-1 h-2 w-14 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!loading && nftList.length === 0) {
    return (
      <h6 className="text-center">
        Sorry, You have no NFT for now. maybe try it later
      </h6>
    )
  }

  return (
    <div className="grid w-144 grid-cols-2">
      {nftList.map((x) => (
        <NFTGallaryItem data={x} key={x.tokenID} onClick={props.onPick} />
      ))}
    </div>
  )
}

export default NFTGallary
