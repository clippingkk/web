import CommentContainer from '../comment-container'
import { getClippingData } from '../data'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
}

async function CommentsContent(props: PageProps) {
  const { clippingid } = await props.params
  const cid = ~~clippingid
  
  const { clipping, me, bookData } = await getClippingData(cid)

  return (
    <CommentContainer me={me} clipping={clipping} book={bookData} />
  )
}

export default CommentsContent