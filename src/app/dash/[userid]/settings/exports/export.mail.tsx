'use client'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import Modal from '@annatarhe/lake-ui/modal'
import { ExportDestination, ProfileDocument, ProfileQuery, ProfileQueryVariables, useExportDataToMutation } from '@/schema/generated'
import { useParams } from 'next/navigation'
import { useSuspenseQuery } from '@apollo/client'
import { Mail } from 'lucide-react'

function ExportToMail() {
  const [visible, setVisible] = useState(false)
  const open = () => setVisible(true)
  const close = () => setVisible(false)
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
      <button
        onClick={open}
        className="flex flex-col items-center justify-center w-full h-full p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <Mail className="w-12 h-12 mb-3 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {t('app.settings.export.email.button', 'Email')}
        </span>
      </button>
      <Modal
        isOpen={visible}
        onClose={close}
        title={t('app.settings.export.email.title')}
      >
        <form className='w-full p-4' onSubmit={formik.handleSubmit}>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('app.settings.export.email.tips')}</p>
          
          <div className="mb-4">
            <input
              placeholder={t('app.settings.export.email.title')}
              type='email'
              className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400'
              {...formik.getFieldProps('endpoint')}
            />
            {formik.errors.endpoint && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formik.errors.endpoint}</p>
            )}
          </div>
          
          <div className='flex justify-end w-full mt-4'>
            <button
              type='submit'
              disabled={loading}
              className='w-full px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('app.common.loading', 'Loading...')}
                </span>
              ) : t('app.settings.export.email.submit')}
            </button>
          </div>
        </form>
      </Modal>
    </React.Fragment>
  )
}

export default ExportToMail
