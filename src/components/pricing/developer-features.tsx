import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Button, HoverCard, Text } from '@mantine/core'
import { Prism } from '@mantine/prism'
import React from 'react'
import { useTranslation } from 'react-i18next'

type DeveloperFeaturesProps = {
}

const cliExample = `
ck-cli 
  --token="CLI_TOKEN" 
  parse
  --input My\ Clippings.txt
  --output http
`

function DeveloperFeatures(props: DeveloperFeaturesProps) {
  const { t } = useTranslation()
  return (
    <>
      <li className='mb-4'>
        ✅ Upload with
        <HoverCard>
          <HoverCard.Target>
            <span className=' inline-block mx-1'>
              CLI
            </span>
          </HoverCard.Target>
          <HoverCard.Dropdown className=' dark:text-gray-100'>
            <div className='flex flex-col'>
              <Text className='mb-2'>Command Line Interface</Text>
              <Prism language='bash'>
                {cliExample}
              </Prism>
              <Button
                component='a'
                href='https://github.com/clippingkk/cli'
                target='_blank'
                className='mt-4'
                rightIcon={<ArrowTopRightOnSquareIcon />}
              >
                Code
              </Button>
            </div>
          </HoverCard.Dropdown>
        </HoverCard>

        and

        <HoverCard>
          <HoverCard.Target>
            <span className=' inline-block mx-1'>
              CI
            </span>
          </HoverCard.Target>
          <HoverCard.Dropdown className='dark:text-gray-100'>
            <div className='w-128'>
              <Text>{t('app.plan.premium.features.dev.ci.title')}</Text>
              <Text>{t('app.plan.premium.features.dev.ci.description')}</Text>
            </div>
          </HoverCard.Dropdown>
        </HoverCard>
      </li>
      <li className='mb-4'>
        {t('app.plan.premium.features.dev.webhook')}
      </li>
    </>
  )
}

export default DeveloperFeatures
