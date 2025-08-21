import { useTranslation } from '@/i18n'
import type { Clipping, User } from '@/schema/generated'
import ClippingLite from '../clipping-item/clipping-lite'

type TopClippingsProps = {
  clippings: (Pick<Clipping, 'id' | 'title' | 'content'> & {
    creator: Pick<User, 'domain' | 'id' | 'name' | 'avatar'>
  })[]
}

async function TopClippings(props: TopClippingsProps) {
  const { t } = await useTranslation()

  return (
    <div className='relative overflow-hidden px-4 py-20 sm:px-6'>
      {/* Background decoration */}
      <div className='absolute inset-0 z-0 overflow-hidden'>
        <div className='absolute -bottom-8 left-1/2 h-80 w-full max-w-7xl -translate-x-1/2 rounded-full bg-gradient-to-t from-blue-500/10 to-transparent blur-3xl' />
        <div className='absolute top-40 right-0 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl' />
        <div className='absolute top-20 left-10 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl' />
      </div>

      {/* Content */}
      <div className='relative z-10 mx-auto max-w-7xl'>
        <div className='mb-16 flex flex-col items-center'>
          {/* Section Title with gradient */}
          <h2 className='font-lato mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl'>
            {t('app.public.clippings')}
          </h2>

          {/* Section description with subtle style */}
          <p className='mb-2 max-w-2xl text-center text-slate-600 dark:text-slate-300'>
            {t('app.explore.books') ||
              'Explore clippings from books around the world'}
          </p>

          {/* Decorative line */}
          <div className='mt-2 mb-10 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400' />
        </div>

        {/* Clippings grid with improved spacing and responsiveness */}
        <div className='grid w-full grid-cols-1 gap-10 lg:grid-cols-2'>
          {props.clippings?.length === 0 ? (
            <div className='col-span-full py-12 text-center text-slate-500 dark:text-slate-400'>
              <p>{t('app.no.clippings') || 'No clippings found'}</p>
            </div>
          ) : (
            props.clippings?.map((c) => (
              <div
                key={c.id}
                className='transform transition-transform duration-300 hover:-translate-y-1'
              >
                <ClippingLite clipping={c} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TopClippings
