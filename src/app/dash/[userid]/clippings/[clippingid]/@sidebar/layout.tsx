type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props
  return (
    <div className="bg-opacity-50 dark:bg-opacity-50 my-4 flex-1 rounded-sm bg-slate-200 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-800">
      <div className="flex h-full w-full flex-col items-center justify-between">
        {children}
      </div>
    </div>
  )
}

export default Layout
