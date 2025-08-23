import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'
import {
  FetchMyNfTsDocument,
  type FetchMyNfTsQuery,
  type FetchMyNfTsQueryVariables,
  type NftItem,
} from '@/gql/graphql'
import NFTGallaryItem from './nft-gallary-item'

type NFTGallaryProps = {
  uid: number
  onPick: (nft: NftItem, realImage: string) => void
}

// FIXME:
// 这里是有可能被改动改成其他人的 nft 的，需要后端校验 nft 的合法性
function NFTGallary(props: NFTGallaryProps) {
  const { data, loading } = useQuery<
    FetchMyNfTsQuery,
    FetchMyNfTsQueryVariables
  >(FetchMyNfTsDocument, {
    variables: {
      uid: props.uid,
    },
  })

  const nftList = useMemo(() => {
    const ls = data?.me.nfts.edges ?? []
    return ls.filter((x) => x.contractType === 'ERC721')
  }, [data?.me.nfts.edges])

  if (loading) {
    return <span>loading NFTs...</span>
  }

  if (!loading && nftList.length === 0) {
    return (
      <h6 className='text-center'>
        Sorry, You have no NFT for now. maybe try it later
      </h6>
    )
  }

  return (
    <div className='grid w-144 grid-cols-2'>
      {nftList.map((x) => (
        <NFTGallaryItem data={x} key={x.tokenID} onClick={props.onPick} />
      ))}
    </div>
  )
}

export default NFTGallary
