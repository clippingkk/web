type Props = {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  return (
    <section className='page anna-fade-in'>
      <div className='w-full mt-4 lg:mt-8 mb-8'>{children}</div>
    </section>
  )
}
export default Layout
