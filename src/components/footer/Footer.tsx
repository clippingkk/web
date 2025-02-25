import React from 'react'
import { ExternalLink, Heart, Server } from 'lucide-react'

const version = JSON.parse(process.env.GIT_COMMIT ?? '{}')

function ICPInfo() {
  return (
    <a
      href="http://www.miitbeian.gov.cn/"
      target="_blank"
      className="transition-colors hover:text-purple-500 dark:hover:text-purple-400"
      rel="noreferrer"
    >
      豫ICP备15003571号
    </a>
  )
}

function Footer() {
  return (
    <footer className="relative">
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-100 dark:to-gray-900/50 backdrop-blur-lg" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-12 md:py-20">
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-lg font-medium">
              Build with <Heart className="w-5 h-5 text-red-500 fill-red-500" /> by AnnatarHe
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Version: {version}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Host on</span>
              <a
                href="https://www.leancloud.cn/"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-purple-500 dark:hover:text-purple-400"
              >
                Web Server
                <Server className="w-4 h-4" />
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-4">
            <a
              href="https://annatarhe.com"
              target="_blank"
              className="text-sm font-medium transition-colors hover:text-purple-500 dark:hover:text-purple-400"
              rel="noreferrer"
            >
              &copy; {new Date().getFullYear()} AnnatarHe
            </a>
            <ICPInfo />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
