import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import FieldInput, { FieldInputSize } from '../../components/input'
import Dialog from '../../components/dialog/dialog'
import { toast } from 'react-toastify'
import exportDataMutation from '../../schema/mutations/export-data.graphql'
import { useMutation } from '@apollo/client'
import { exportDataTo, exportDataToVariables } from '../../schema/mutations/__generated__/exportDataTo'
import { ExportDestination } from '../../../__generated__/globalTypes'

type ExportsProps = {
}

function ExportToFlomo() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [mutate] = useMutation<exportDataTo, exportDataToVariables>(exportDataMutation)
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
          destination: ExportDestination.flomo,
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
      className='from-blue-400 to-blue-600 py-4 px-8 rounded hover:shadow-lg bg-gradient-to-br duration-300 dark:text-gray-200 hover:scale-110 transform focus:outline-none'
       onClick={() => setVisible(true)}
       >
        flomo
    </button>
      {visible && (
        <Dialog
          title={t('app.settings.export.flomo.title')}
          onCancel={() => setVisible(false)}
          onOk={() => formik.handleSubmit}
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

              <button
                className='w-64'
                type='submit'
              >
                {t('app.settings.export.flomo.submit')}
              </button>
              </div>

            </form>
          </div>
        </Dialog>
      )}
    </React.Fragment>
  )
}

function Exports(props: ExportsProps) {
  return (
    <div className='w-full flex justify-center items-center'>
      <ExportToFlomo />
    </div>
  )
}

export default Exports
