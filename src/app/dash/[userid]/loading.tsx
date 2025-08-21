import Loading2Icon from '@/components/icons/loading2.svg'

function DashboardLoadingPage() {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center min-h-screen'>
      <Loading2Icon />
      <span className='dark:text-gray-100 mt-4'>Loading...</span>
    </div>
  )
}

export default DashboardLoadingPage
