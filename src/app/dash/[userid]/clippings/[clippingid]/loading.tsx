function Loading() {
  return (
    <div className='container w-full mt-4 lg:mt-20'>
      <div className='flex flex-col lg:flex-row w-full h-156 gap-6 px-4'>
        <div className='h-32 lg:h-full flex-1 animate-pulse bg-slate-400 rounded-xs' />
        <div className='h-24 lg:w-96 animate-pulse lg:h-full bg-slate-400 rounded-xs' />
      </div>
      <div className='w-full px-4'>
        <div className='w-full h-64 mt-12 mb-8 animate-pulse bg-slate-400 rounded-xs' />
      </div>
    </div>
  )
}

export default Loading
