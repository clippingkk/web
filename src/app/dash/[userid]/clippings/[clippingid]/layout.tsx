import styles from './clipping.module.css'

type Props = {
  children: React.ReactNode
  content: React.ReactNode
  sidebar: React.ReactNode
  comments: React.ReactNode
}

function Layout(props: Props) {
  const { content, sidebar, comments } = props
  return (
    <div className={`${styles.clipping} anna-fade-in flex flex-col`}>
      <div className="with-slide-in w-full mt-4 flex flex-col gap-4 lg:mt-24 mb-4">
        {content}
        {sidebar}
      </div>
      {comments}
    </div>
  )
}

export default Layout
