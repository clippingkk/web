import React from 'react'
import { useTranslation } from '@/i18n'
import { Clipping, User } from '../../schema/generated'
import ClippingLite from '../clipping-item/clipping-lite'

type TopClippingsProps = {
  clippings: (Pick<Clipping, 'id' | 'title' | 'content'> & { creator: Pick<User, 'domain' | 'id' | 'name' | 'avatar'> })[]
}

async function TopClippings(props: TopClippingsProps) {
  const { t } = await useTranslation()

  return (
    <div className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-t from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16">
          {/* Section Title with gradient */}
          <h2 className="font-lato text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
            {t('app.public.clippings')}
          </h2>
          
          {/* Section description with subtle style */}
          <p className="max-w-2xl text-center text-slate-600 dark:text-slate-300 mb-2">
            {t('app.explore.books') || 'Explore clippings from books around the world'}
          </p>
          
          {/* Decorative line */}
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-2 mb-10" />
        </div>
        
        {/* Clippings grid with improved spacing and responsiveness */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
          {props.clippings?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
              <p>{t('app.no.clippings') || 'No clippings found'}</p>
            </div>
          ) : (
            props.clippings?.map(c => (
              <div key={c.id} className="transform hover:-translate-y-1 transition-transform duration-300">
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
