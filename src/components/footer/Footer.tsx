import { useTranslation } from '@/i18n'
import { Code, Coffee, ExternalLink, Github, Heart, Server } from 'lucide-react'

const version = JSON.parse(process.env.GIT_COMMIT ?? '{}')

function ICPInfo() {
  return (
    <a
      href="http://www.miitbeian.gov.cn/"
      target="_blank"
      className="group flex items-center gap-1.5 transition-colors duration-300 hover:text-blue-400 dark:hover:text-blue-300"
      rel="noreferrer"
    >
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
        豫ICP备15003571号
      </span>
      <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </a>
  )
}

type FooterLinkProps = {
  href: string
  children: React.ReactNode
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function FooterLink({ href, children, icon: Icon }: FooterLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2 transition-all duration-300 hover:text-blue-400 dark:hover:text-blue-300"
    >
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
        {children}
      </span>
      <Icon className="h-4 w-4 text-blue-500/80 opacity-75 transition-all duration-300 group-hover:opacity-100 dark:text-blue-400/80" />
    </a>
  )
}

async function Footer() {
  const { t } = await useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-slate-200/50 bg-white/80 backdrop-blur-sm dark:border-slate-800/30 dark:bg-slate-900/80">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"></div>

        {/* Glow effects */}
        <div className="absolute -bottom-20 left-1/2 h-60 w-full max-w-5xl -translate-x-1/2 rounded-full bg-blue-400/10 opacity-60 blur-3xl dark:bg-blue-500/5"></div>
        <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-cyan-400/10 opacity-50 blur-3xl dark:bg-cyan-500/5"></div>
        <div className="absolute bottom-40 left-20 h-32 w-32 rounded-full bg-blue-400/10 opacity-40 blur-3xl dark:bg-blue-500/5"></div>

        {/* Subtle gradient lines */}
        <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent dark:via-blue-500/10"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 px-6 py-16 md:grid-cols-3 md:py-20">
          {/* Left column - About */}
          <div className="space-y-6 md:col-span-1">
            <div className="space-y-3">
              <h3 className="font-lato bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
                ClippingKK
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t(
                  'app.slogan',
                  'Share your favorite book clippings with the world'
                )}
              </p>
            </div>

            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                {t('footer.builtWith', 'Built with')}{' '}
                <Heart className="h-4 w-4 animate-pulse fill-red-500 text-red-500" />{' '}
                {t('footer.by', 'by')} AnnatarHe
              </p>

              {version && (
                <div className="flex items-center gap-1.5 text-xs">
                  <code className="rounded bg-slate-100/80 px-2 py-0.5 font-mono text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                    {version}
                  </code>
                </div>
              )}

              <div className="pt-2 dark:text-slate-300">
                <FooterLink href="#" icon={Server}>
                  {t('footer.hostedOn', 'Hosted on')} Server
                </FooterLink>
              </div>
            </div>
          </div>

          {/* Middle column - Links */}
          <div className="space-y-6 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {t('footer.links', 'Links')}
            </h3>
            <div className="space-y-4 text-sm dark:text-slate-300">
              <FooterLink
                href="https://github.com/clippingkk/web"
                icon={Github}
              >
                {t('footer.sourceCode', 'Source Code')}
              </FooterLink>
              <FooterLink href="https://annatarhe.github.io" icon={Coffee}>
                {t('footer.blog', 'Blog')}
              </FooterLink>
              <FooterLink href="https://annatarhe.com" icon={Code}>
                {t('footer.otherProjects', 'Other Projects')}
              </FooterLink>
            </div>
          </div>

          {/* Right column - Legal */}
          <div className="space-y-6 md:col-span-1">
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {t('footer.legal', 'Legal')}
            </h3>
            <div className="space-y-4 text-sm dark:text-slate-300">
              <ICPInfo />
              <p className="text-sm text-slate-500">
                &copy; {currentYear} AnnatarHe
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar with subtle gradient */}
        <div className="relative mt-4 border-t border-slate-200/50 py-8 dark:border-slate-800/30">
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <span className="relative">
              <span className="absolute -inset-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-0 blur-sm transition-opacity duration-1000 group-hover:opacity-100 dark:via-blue-500/10"></span>
              {t(
                'footer.madeWithLove',
                'Made with love for readers around the world'
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
