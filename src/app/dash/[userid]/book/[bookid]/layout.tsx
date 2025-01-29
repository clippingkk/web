
type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  return (
    <section className='page anna-fade-in'>
      {children}
    </section>
  )
}
export default Layout
