import { Badge } from '@mantine/core'
import { CodeHighlight } from '@mantine/code-highlight'
import Button from '../button'
import React from 'react'
import { useTranslation } from '@/i18n'
import { Terminal, Webhook, ExternalLink } from 'lucide-react'
import Tooltip from '@annatarhe/lake-ui/tooltip'

const cliExample = `
ck-cli 
  --token="CLI_TOKEN" 
  parse
  --input My\ Clippings.txt
  --output http
`

async function DeveloperFeatures() {
  const { t } = await useTranslation()
  return (
    <>
      <li className='flex items-start'>
        <Terminal className="h-5 w-5 mr-3 text-indigo-400 mt-1 flex-shrink-0" />
        <div>
          <span className="font-medium">Upload with </span>
          <Tooltip content={
            <div className='flex flex-col'>
              <span className='mb-2 font-medium'>Command Line Interface</span>
              <CodeHighlight language='bash' code={cliExample} className="rounded-lg overflow-hidden" />
              <a
                href='https://github.com/clippingkk/cli'
                target='_blank'
                className='mt-4 inline-block'
              >
                <Button
                  rightIcon={<ExternalLink size={16} />}
                  variant="outline"
                  size="sm"
                >
                  View Code
                </Button>
              </a>
            </div>
          }>
            <Badge className="inline-flex mx-1 cursor-pointer hover:opacity-80" variant="light" color="indigo">
              CLI
            </Badge>
          </Tooltip>

          <span>and</span>

          <Tooltip content={
            <div className='flex flex-col'>
              <span className="font-medium">{t('app.plan.premium.features.dev.ci.title')}</span>
              <span className="mt-2 opacity-80 text-sm">{t('app.plan.premium.features.dev.ci.description')}</span>
            </div>
          }>
            <Badge className="inline-flex mx-1 cursor-pointer hover:opacity-80" variant="light" color="cyan">
              CI
            </Badge>
          </Tooltip>
        </div>
      </li>
      <li className='flex items-start'>
        <Webhook className="h-5 w-5 mr-3 text-purple-400 mt-1 flex-shrink-0" />
        <span>{t('app.plan.premium.features.dev.webhook')}</span>
      </li>
    </>
  )
}

export default DeveloperFeatures
