import Tooltip from '@annatarhe/lake-ui/tooltip'
import { ExternalLink, Terminal, Webhook } from 'lucide-react'
import { useTranslation } from '@/i18n'
import CodeBlock from '../highlighter/server'

const cliExample = `
ck-cli 
  --token="CLI_TOKEN" 
  parse
  --input My Clippings.txt
  --output http
`

async function DeveloperFeatures() {
  const { t } = await useTranslation()
  return (
    <>
      <li className='flex items-start'>
        <Terminal className='mt-1 mr-3 h-5 w-5 flex-shrink-0 text-indigo-400' />
        <div>
          <span className='font-medium'>Upload with </span>
          <Tooltip
            content={
              <div className='flex flex-col'>
                <span className='mb-2 font-medium'>Command Line Interface</span>
                <CodeBlock lang='bash'>{cliExample}</CodeBlock>
              </div>
            }
          >
            <a
              href='https://github.com/clippingkk/cli'
              target='_blank'
              className='mx-1 inline-flex cursor-pointer rounded-2xl px-2 py-1 text-xs hover:opacity-80'
              rel='noopener'
            >
              CLI
              <ExternalLink size={8} />
            </a>
          </Tooltip>

          <span>and</span>

          <Tooltip
            content={
              <div className='flex flex-col'>
                <span className='font-medium'>
                  {t('app.plan.premium.features.dev.ci.title')}
                </span>
                <span className='mt-2 text-sm opacity-80'>
                  {t('app.plan.premium.features.dev.ci.description')}
                </span>
              </div>
            }
          >
            <a
              href='https://github.com/clippingkk/cli'
              target='_blank'
              className='mx-1 inline-flex cursor-pointer rounded-2xl px-2 py-1 text-xs hover:opacity-80'
              rel='noopener'
            >
              CI
              <ExternalLink size={8} />
            </a>
          </Tooltip>
        </div>
      </li>
      <li className='flex items-start'>
        <Webhook className='mt-1 mr-3 h-5 w-5 flex-shrink-0 text-purple-400' />
        <span>{t('app.plan.premium.features.dev.webhook')}</span>
      </li>
    </>
  )
}

export default DeveloperFeatures
