type Props = {
  children: React.ReactNode
}
function Layout({ children }: Props) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  )
}

export default Layout
