import React from 'react'
import { ExternalLink, Heart, Server, Github, Code, Coffee } from 'lucide-react'
import { useTranslation } from '@/i18n'

const version = JSON.parse(process.env.GIT_COMMIT ?? '{}')

function ICPInfo() {
  return (
    <a
      href="http://www.miitbeian.gov.cn/"
      target="_blank"
      className="transition-colors duration-300 hover:text-indigo-400 dark:hover:text-purple-300 flex items-center gap-1.5 group"
      rel="noreferrer"
    >
      <span className="group-hover:transform group-hover:translate-x-0.5 transition-transform duration-300">豫ICP备15003571号</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FooterLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: React.ComponentType<any> }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 transition-all duration-300 hover:text-indigo-400 dark:hover:text-purple-300 group"
    >
      <span className="group-hover:transform group-hover:translate-x-0.5 transition-transform duration-300">{children}</span>
      <Icon className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-all duration-300" />
    </a>
  )
}

async function Footer() {
  const { t } = await useTranslation()
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="relative mt-6 border-t border-gray-200 dark:border-gray-800/30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-100/90 dark:via-gray-900/80 dark:to-gray-900/95 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent dark:from-purple-900/10" />

      <div className="relative mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 py-8 md:py-12">
          {/* Left column - About */}
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                ClippingKK
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('footer.tagline', 'Share your favorite book clippings with the world')}  
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('footer.builtWith', 'Built with')} <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> {t('footer.by', 'by')} AnnatarHe
              </p>
              
              {version && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                  <code className="bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded font-mono">
                    {version}
                  </code>
                </div>
              )}
              
              <div className="pt-2">
                <FooterLink href="#" icon={Server}>
                  {t('footer.hostedOn', 'Hosted on')} Server
                </FooterLink>
              </div>
            </div>
          </div>
          
          {/* Middle column - Links */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('footer.links', 'Links')}
            </h3>
            <div className="space-y-3 text-sm">
              <FooterLink href="https://github.com/clippingkk/web" icon={Github}>
                {t('footer.sourceCode', 'Source Code')}
              </FooterLink>
              <FooterLink href="https://annatarhe.com" icon={Coffee}>
                {t('footer.blog', 'Blog')}
              </FooterLink>
              <FooterLink href="https://annatarhe.com/projects" icon={Code}>
                {t('footer.otherProjects', 'Other Projects')}
              </FooterLink>
            </div>
          </div>
          
          {/* Right column - Legal */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('footer.legal', 'Legal')}
            </h3>
            <div className="space-y-3 text-sm">
              <ICPInfo />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                &copy; {currentYear} AnnatarHe
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom bar with subtle gradient border */}
        <div className="relative py-6 border-t border-gray-200/50 dark:border-gray-800/30 mt-4">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            {t('footer.madeWithLove', 'Made with love for readers around the world')}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
