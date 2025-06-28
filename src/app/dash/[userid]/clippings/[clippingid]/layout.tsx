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
      <div className="with-slide-in w-full mt-4 flex flex-col gap-4 lg:mt-24 lg:flex-row">
        <div
          className={
            'bg-opacity-50 w-full my-4 flex-3 rounded-xl p-4 text-black shadow-sm lg:p-10 dark:bg-slate-800 dark:text-slate-200'
          }
          data-glow
          style={
              {
                '--base': 80,
                '--spread': 500,
                '--outer': 1,
                backdropFilter: 'blur(calc(var(--cardblur, 5) * 1px))',
              } as React.CSSProperties
          }
        >
          {content}
        </div>
        {sidebar}
      </div>
      {comments}
    </div>
  )
}

export default Layout
