'use client'
import Image from 'next/image'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import BrandFlomoLogo from '@/assets/brand-flomo.png'
import { ExportDestination, useExportDataToMutation } from '@/schema/generated'

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
      <button
        onClick={() => setVisible(true)}
        className="flex flex-col items-center justify-center w-full h-full p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <Image
          className='mb-3'
          src={BrandFlomoLogo}
          width={BrandFlomoLogo.width / 2.5}
          height={BrandFlomoLogo.height / 2.5}
          alt='flomo'
        />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {t('app.settings.export.flomo.title', 'Flomo')}
        </span>
      </button>
      <Modal
        isOpen={visible}
        onClose={() => setVisible(false)}
        title={t('app.settings.export.flomo.title')}
      >
        <div className='w-full p-4'>
          <form className='w-full' onSubmit={formik.handleSubmit}>
            <InputField
              name='endpoint'
              className='w-full flex items-center'
              placeholder='Flomo Endpoint'
              value={formik.values.endpoint}
              error={formik.errors.endpoint}
              onChange={formik.handleChange}
            />
            <div className='w-full text-right mt-4'>
              <button
                type='submit'
                className='px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 active:scale-95'
              >
                {t('app.settings.export.flomo.submit')}
              </button>
            </div>

          </form>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ExportToFlomo
