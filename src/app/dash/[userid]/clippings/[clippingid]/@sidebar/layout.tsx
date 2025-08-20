type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props
  return (
    <aside className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="space-y-6">{children}</div>
    </aside>
  )
}

export default Layout
