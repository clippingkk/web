type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props
  return (
    <aside className="sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-lg backdrop-blur-sm p-6">
        <div className="flex flex-col gap-6">
          {children}
        </div>
      </div>
    </aside>
  )
}

export default Layout
