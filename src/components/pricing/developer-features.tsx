import { Button, HoverCard, Text, Badge } from '@mantine/core'
import { CodeHighlight } from '@mantine/code-highlight'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Terminal, GitBranch, Webhook, ExternalLink } from 'lucide-react'

const cliExample = `
ck-cli 
  --token="CLI_TOKEN" 
  parse
  --input My\ Clippings.txt
  --output http
`

function DeveloperFeatures() {
  const { t } = useTranslation()
  return (
    <>
      <li className='flex items-start'>
        <Terminal className="h-5 w-5 mr-3 text-indigo-400 mt-1 flex-shrink-0" />
        <div>
          <span className="font-medium">Upload with </span>
          <HoverCard width={320} shadow="md" position="right" withArrow>
            <HoverCard.Target>
              <Badge className="inline-flex mx-1 cursor-pointer hover:opacity-80" variant="light" color="indigo">
                CLI
              </Badge>
            </HoverCard.Target>
            <HoverCard.Dropdown className='dark:text-gray-100 rounded-lg backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90 border border-white/10 dark:border-gray-700/30'>
              <div className='flex flex-col'>
                <Text className='mb-2 font-medium'>Command Line Interface</Text>
                <CodeHighlight language='bash' code={cliExample} className="rounded-lg overflow-hidden" />
                <Button
                  component='a'
                  href='https://github.com/clippingkk/cli'
                  target='_blank'
                  className='mt-4'
                  rightSection={<ExternalLink size={16} />}
                  variant="light"
                  color="blue"
                  size="sm"
                >
                  View Code
                </Button>
              </div>
            </HoverCard.Dropdown>
          </HoverCard>

          <span>and</span>

          <HoverCard width={280} shadow="md" position="right" withArrow>
            <HoverCard.Target>
              <Badge className="inline-flex mx-1 cursor-pointer hover:opacity-80" variant="light" color="cyan">
                CI
              </Badge>
            </HoverCard.Target>
            <HoverCard.Dropdown className='dark:text-gray-100 rounded-lg backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90 border border-white/10 dark:border-gray-700/30'>
              <div className='w-full'>
                <Text className="font-medium">{t('app.plan.premium.features.dev.ci.title')}</Text>
                <Text size="sm" className="mt-2 opacity-80">{t('app.plan.premium.features.dev.ci.description')}</Text>
              </div>
            </HoverCard.Dropdown>
          </HoverCard>
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
