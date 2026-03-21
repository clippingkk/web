type Props = {
  content: string
}

function CommentContent({ content }: Props) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {content}
      </p>
    </div>
  )
}
export default CommentContent
