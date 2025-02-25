import Image from 'next/image'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import FieldInput from '../../../../../components/input'
import { Button, Modal } from '@mantine/core'
import BrandNotionLogo from '@/assets/brand-notion.svg'
import BrandFlomoLogo from '@/assets/brand-flomo.png'
import { ExportDestination, useExportDataToMutation } from '../../../../../schema/generated'

function ExportToFlomo() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [mutate] = useExportDataToMutation()
  const formik = useFormik({
    initialValues: {
      endpoint: '',
    },
    validationSchema: Yup.object({
      endpoint: Yup.string().url().max(255),
    }),
    onSubmit(vals) {
      // validate
      if (!vals.endpoint.startsWith('https://flomoapp.com/')) {
        toast.error(t('app.settings.export.flomo.notFlomo'))
        return
      }

      mutate({
        variables: {
          destination: ExportDestination.Flomo,
          args: vals.endpoint
        }
      }).then(() => {
        toast.success(t('app.settings.export.success'))
        formik.resetForm()
        setVisible(false)
      }).catch(e => {
        toast.error(e.toString())
      })
    }
  })
  return (
    <React.Fragment>
      <Button
        variant="gradient"
        className='bg-linear-to-br from-indigo-400 to-cyan-500'
        onClick={() => setVisible(true)}
        size='lg'
      >
        <Image
          className='py-4 px-4'
          src={BrandFlomoLogo}
          width={BrandFlomoLogo.width / 2}
          height={BrandFlomoLogo.height / 2}
          alt='flomo'
        />
      </Button>
      <Modal
        opened={visible}
        onClose={() => setVisible(false)}
        centered
        size='lg'
        overlayProps={{ backgroundOpacity: 0.55, blur: 8 }}
        title={t('app.settings.export.flomo.title')}
      >
        <div className='w-full'>
          <form className='w-full' onSubmit={formik.handleSubmit}>
            <FieldInput
              name='endpoint'
              value={formik.values.endpoint}
              error={formik.errors.endpoint}
              onChange={formik.handleChange}
            />
            <div
              className='w-full text-right'
            >

              <Button
                // className='w-64 bg-blue-400 rounded-sm py-4 hover:bg-blue-500 duration-150'
                variant="gradient"
                className='bg-linear-to-br from-indigo-400 to-cyan-500'
                type='submit'
              >
                {t('app.settings.export.flomo.submit')}
              </Button>
            </div>

          </form>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ExportToFlomo
