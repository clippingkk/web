import React from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'

function Loading() {
  return (
    <div className='w-full relative'>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/2 right-1/4 w-64 h-64 bg-cyan-600/20 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto py-12 px-4 max-w-7xl">
        {/* Header section skeleton */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 mb-4">
            <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
            <div className="h-5 w-30 bg-gray-700/50 rounded-xl animate-pulse"></div>
          </div>

          <div className="h-15 bg-gray-700/50 mb-6 max-w-xl mx-auto rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-700/50 max-w-3xl mx-auto mb-2 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-700/50 max-w-2xl mx-auto rounded-lg animate-pulse"></div>
        </div>

        {/* Pricing cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto relative">
          {/* Decorative arrow */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <ChevronRight className="h-12 w-12 text-indigo-500/50" />
          </div>

          {/* Free plan card skeleton */}
          <div className="rounded-2xl p-8 backdrop-blur-md border border-gray-700/30 bg-gray-800/30 hover:bg-gray-800/40 transition-all duration-300 flex flex-col">
            <div className="h-9 w-36 bg-gray-700/50 mb-3 rounded-lg animate-pulse"></div>
            <div className="h-5 bg-gray-700/50 mb-6 rounded-lg animate-pulse"></div>
            
            <div className="space-y-4 mb-8 flex-grow">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="h-6 w-6 bg-gray-700/50 rounded-full mr-3 animate-pulse"></div>
                  <div className="h-5 bg-gray-700/50 flex-grow rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="h-12 bg-gray-700/50 rounded-lg animate-pulse"></div>
          </div>

          {/* Premium plan card skeleton */}
          <div className="rounded-2xl p-8 backdrop-blur-md border border-gray-700/30 bg-gray-800/30 hover:bg-gray-800/40 transition-all duration-300 flex flex-col">
            <div className="h-9 w-44 bg-gray-700/50 mb-3 rounded-lg animate-pulse"></div>
            <div className="h-5 bg-gray-700/50 mb-6 rounded-lg animate-pulse"></div>
            
            <div className="space-y-4 mb-8 flex-grow">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="h-6 w-6 bg-gray-700/50 rounded-full mr-3 animate-pulse"></div>
                  <div className="h-5 bg-gray-700/50 flex-grow rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="h-12 bg-gray-700/50 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* FAQ section skeleton */}
        <div className="mt-24 text-center">
          <div className="max-w-md mx-auto mb-10 border-t border-gray-700/30"></div>
          <div className="h-5 w-72 bg-gray-700/50 rounded-lg mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading
