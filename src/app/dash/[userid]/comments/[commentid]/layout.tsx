
type Props = {
  children: React.ReactNode
}
function Layout({ children }: Props) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  )
}

export default Layout
