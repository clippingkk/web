import Skeleton from '@annatarhe/lake-ui/skeleton'
import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import { FetchMyNfTsDocument } from '@/gql/graphql'

import { type NftItem } from '../../schema/generated'
import NFTGallaryItem from './nft-gallary-item'

type NFTGallaryProps = {
  uid: number
  selectedTokenID?: string | null
  emptyLabel: string
  onPick: (nft: NftItem, realImage: string) => void
}

// FIXME: the server should verify the picked NFT really belongs to the user.
function NFTGallary(props: NFTGallaryProps) {
  const { uid, selectedTokenID, emptyLabel, onPick } = props
  const { data, loading } = useQuery(FetchMyNfTsDocument, {
    variables: { uid },
  })

  const nftList = useMemo(
    () =>
      (data?.me.nfts.edges ?? []).filter((x) => x.contractType === 'ERC721'),
    [data?.me.nfts.edges]
  )

  if (loading) {
    return (
      <div aria-hidden="true" className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className="rounded-lake-control aspect-square w-full"
          />
        ))}
      </div>
    )
  }

  if (nftList.length === 0) {
    return (
      <p className="text-lake-fg-subtle py-10 text-center text-sm">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {nftList.map((x) => (
        <NFTGallaryItem
          key={x.tokenID}
          data={x}
          selected={x.tokenID === selectedTokenID}
          onClick={onPick}
        />
      ))}
    </div>
  )
}

export default NFTGallary
