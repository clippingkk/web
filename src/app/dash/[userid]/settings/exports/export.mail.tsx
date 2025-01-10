import { useFormik } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import { Button, Modal, TextInput } from '@mantine/core'
import { ExportDestination, ProfileDocument, ProfileQuery, ProfileQueryVariables, useExportDataToMutation } from '@/schema/generated'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { useDisclosure } from '@mantine/hooks'
import { useParams } from 'next/navigation'
import { useSuspenseQuery } from '@apollo/client'

function ExportToMail() {
  const [visible, { open, close }] = useDisclosure()
  const { t } = useTranslation()

  const userDomain = useParams<{ userid: string }>().userid
  const isTypeUid = !Number.isNaN(parseInt(userDomain))
  const { data: p } = useSuspenseQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, {
    variables: {
      id: isTypeUid ? ~~userDomain : undefined,
      domain: isTypeUid ? undefined : userDomain
    }
  })

  const [mutate, { loading }] = useExportDataToMutation({
    onCompleted() {
      toast.success(t('app.settings.export.success'))
      close()
    },
    onError(err) {
      toast.error(err.toString())
    }
  })

  const formik = useFormik({
    initialValues: {
      endpoint: p.me.email,
    },
    validationSchema: Yup.object({
      endpoint: Yup.string().email().max(255),
    }),
    onSubmit(vals) {
      if (!formik.isValid) {
        return
      }
      return mutate({
        variables: {
          destination: ExportDestination.Mail,
          args: vals.endpoint!
        }
      }).then((d) => {
        if (d.data) {
          formik.resetForm()
        }
        if (d.errors) {
          formik.setErrors({ endpoint: d.errors[0].message })
        }
      })
    }
  })
  return (
    <React.Fragment>
      <Button
        variant="gradient"
        className='bg-gradient-to-br from-indigo-400 to-cyan-500'
        onClick={open}
        size='lg'
      >
        <EnvelopeIcon className='w-6 h-6 text-slate-900' />
        <span className='ml-2 text-slate-900'>{t('app.settings.export.email.button')}</span>
      </Button>
      <Modal
        opened={visible}
        onClose={close}
        centered
        size='lg'
        overlayProps={{ backgroundOpacity: 0.55, blur: 8 }}
        title={t('app.settings.export.email.title')}
      >
        <form className='w-full' onSubmit={formik.handleSubmit}>
          <p>{t('app.settings.export.email.tips')}</p>
          <TextInput
            placeholder={t('app.settings.export.email.title')}
            type='email'
            className='my-4'
            {...formik.getFieldProps('endpoint')}
          />
          <div className='flex justify-end w-full'>
            <Button
              type='submit'
              className='w-full capitalize'
              loading={loading}
            >
              {t('app.settings.export.email.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </React.Fragment>
  )
}

export default ExportToMail
