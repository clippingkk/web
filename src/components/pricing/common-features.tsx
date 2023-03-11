import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Button, HoverCard, Text } from '@mantine/core'
import { Prism } from '@mantine/prism'
import React from 'react'

type CommonFeaturesProps = {
}

const cliExample = `
ck-cli 
  --token="CLI_TOKEN" 
  parse
  --input My\ Clippings.txt
  --output http
`

function CommonFeatures(props: CommonFeaturesProps) {
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
          <HoverCard.Dropdown className=' dark:text-gray-100'>
            <Text>Continuous Integration</Text>
            <Text>You can add integration with GithubAction and more...</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </li>
      <li className='mb-4'>
        ✅ Access via iOS app
      </li>
      <li className='mb-4'>
        ✅ Email supports
      </li>
    </>
  )
}

export default CommonFeatures
