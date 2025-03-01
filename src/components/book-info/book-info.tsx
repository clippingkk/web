'use client'
import React, { useCallback, useState } from 'react'
import { WenquBook } from '../../services/wenqu'
import BlurhashView from '@annatarhe/blurhash-react'
import { useTranslation } from 'react-i18next'
import BookSharePreview from '../preview/preview-book'
import { Calendar, Clock, Share2, Star, BookOpen } from 'lucide-react'

type TBookInfoProp = {
  uid: number
  book: WenquBook
  duration?: number
  isLastReadingBook?: boolean
}

function BookInfo({ book, uid, duration }: TBookInfoProp) {
  const { t } = useTranslation()
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible(v => !v)
  }, [])
  return (
    <div className="relative mt-16 md:mt-24 w-full ">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/30 via-white/20 to-white/5 dark:from-gray-800/30 dark:via-gray-800/20 dark:to-gray-900/5 backdrop-blur-lg"></div>
      
      {/* Main content container */}
      <div className="w-full max-w-7xl mx-auto rounded-2xl  backdrop-blur-lg bg-gradient-to-br from-white/70 via-white/60 to-white/40 dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/40 shadow-xl border border-gray-200 dark:border-gray-700">
        
        {/* Book content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8">
          
          {/* Book cover column */}
          <div className="md:col-span-1">
            <div className="relative -mt-32 md:-mt-40 mx-auto w-64 md:w-full max-w-xs transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
              <div className="absolute inset-0 -z-10 blur-md opacity-30 scale-95 translate-y-4"></div>
              <BlurhashView
                blurhashValue={book.edges?.imageInfo?.blurHashValue ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
                src={book.image}
                height={384}
                width={320}
                className="w-full aspect-[4/5] object-cover rounded-xl shadow-xl transition-all duration-300"
                alt={book.title}
              />
            </div>
            
            {/* Share button (mobile only) */}
            <div className="mt-6 flex justify-center md:hidden">
              <button
                onClick={() => togglePreviewVisible()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Share2 className="w-5 h-5" />
                <span>{t('app.book.share')}</span>
              </button>
            </div>
          </div>
          
          {/* Book details column */}
          <div className="md:col-span-2 lg:col-span-3 font-lxgw">
            {/* Title and rating */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 inline-block text-transparent bg-clip-text">
                  {book.title}
                </h1>
                
                <div className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{book.rating.toFixed(1)}/10</span>
                </div>
              </div>
              
              {/* Author and publication info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <h2 className="text-xl font-semibold">{book.author}</h2>
                  {book.press && (
                    <span className="text-sm opacity-75">· {book.press}</span>
                  )}
                </div>
                
                {/* Reading stats */}
                {duration && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{t('app.book.readingDuration', { count: duration })}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons (desktop) */}
            <div className="hidden md:flex mt-6 gap-4">
              <button
                onClick={() => togglePreviewVisible()}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('app.book.share')}</span>
              </button>
            </div>
            
            {/* Book metadata */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {book.pubdate && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400">Published</h3>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{book.pubdate}</p>
                  </div>
                </div>
              )}
              
              {book.totalPages > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400">Pages</h3>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{book.totalPages}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Book summary */}
            <div className="mt-8 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-6 rounded-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {book.summary}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share preview modal */}
      <BookSharePreview
        onCancel={togglePreviewVisible}
        onOk={togglePreviewVisible}
        background={book.image}
        opened={sharePreviewVisible}
        book={book}
        uid={uid}
      />
    </div>
  )
}

export default BookInfo
