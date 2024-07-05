import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Alert, Button, Divider, LoadingOverlay, Modal, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'react-i18next'
import { useFetchUserPersonalityQuery } from '@/schema/generated'
import CKLexicalBaseEditor from '@/components/RichTextEditor'

type PersonalityViewProps = {
  uid?: number
  domain?: string
}

function PersonalityView(props: PersonalityViewProps) {
  const { uid, domain } = props
  const { t } = useTranslation()
  const [visible, { open, close }] = useDisclosure()

  const { data, loading, error } = useFetchUserPersonalityQuery({
    variables: {
      id: uid,
      domain
    },
    skip: !visible
  })

  const personalityData = data?.me.personalityByAI

  return (
    <>
      <Tooltip
        label={t('app.profile.personality.tooltip') ?? ''}
        withArrow
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Button
          onClick={open}
          size='sm'
          leftSection={<ArrowTopRightOnSquareIcon className='w-4 h-4' />}
          className=' ml-4'
        >
          {t('app.profile.personality.title')}
        </Button>
      </Tooltip>
      <Modal
        opened={visible}
        onClose={close}
        title={t('app.profile.personality.title')}
        centered
        size='xl'
        className='w-128'
        overlayProps={{ backgroundOpacity: 0.7, blur: 10 }}
      >
        <div className='w-full min-h-60 flex items-center flex-col px-4'>
          <LoadingOverlay visible={loading} />
          {personalityData && (
            <CKLexicalBaseEditor
              editable={false}
              className='w-full px-2 focus:shadow focus:bg-slate-300 focus:outline-none rounded transition-all duration-150'
              markdown={personalityData}
            />
          )}
          {error && (
            <Alert color='red' title='Oops'>
              {error.clientErrors.map((e) => e.message).join(', ')}
              {error.networkError?.message}
              {error.graphQLErrors.map((e) => e.message).join(', ')}
            </Alert>
          )}
        </div>
      </Modal>
    </>
  )
}

export default PersonalityView
