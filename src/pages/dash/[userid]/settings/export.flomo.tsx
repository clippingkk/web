import { useMutation } from '@apollo/client'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import Dialog from '../../../../components/dialog/dialog'
import { ExportDestination } from '../../../../../__generated__/globalTypes'
import FieldInput from '../../../../components/input'
import { exportDataTo, exportDataToVariables } from '../../../../schema/mutations/__generated__/exportDataTo'
import exportDataMutation from '../../../../schema/mutations/export-data.graphql'
import { Button } from '@mantine/core'

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
      <Button
        variant="gradient"
        className='bg-gradient-to-br from-indigo-400 to-cyan-500'
        onClick={() => setVisible(true)}
      >
        flomo
      </Button>
      {visible && (
        <Dialog
          title={t('app.settings.export.flomo.title')}
          onCancel={() => setVisible(false)}
          onOk={() => formik.handleSubmit()}
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
                  // className='w-64 bg-blue-400 rounded py-4 hover:bg-blue-500 duration-150'
                  variant="gradient"
                  className='bg-gradient-to-br from-indigo-400 to-cyan-500'
                  type='submit'
                >
                  {t('app.settings.export.flomo.submit')}
                </Button>
              </div>

            </form>
          </div>
        </Dialog>
      )}
    </React.Fragment>
  )
}

export default ExportToFlomo
