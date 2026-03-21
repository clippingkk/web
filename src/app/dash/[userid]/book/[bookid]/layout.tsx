type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  return (
    <section className="page anna-fade-in">
      <div className="mt-4 mb-8 w-full lg:mt-8">{children}</div>
    </section>
  )
}
export default Layout
