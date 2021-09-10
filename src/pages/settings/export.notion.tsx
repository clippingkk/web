import { useMutation } from '@apollo/client'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import Dialog from '../../components/dialog/dialog'
import { ExportDestination } from '../../../__generated__/globalTypes'
import FieldInput from '../../components/input'
import exportDataMutation from '../../schema/mutations/export-data.graphql'
import { exportDataTo, exportDataToVariables } from '../../schema/mutations/__generated__/exportDataTo'

function ExportToNotion() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [mutate] = useMutation<exportDataTo, exportDataToVariables>(exportDataMutation)
  const formik = useFormik({
    initialValues: {
      notionToken: '',
      notionPageId: ''
    },
    validationSchema: Yup.object({
      notionToken: Yup.string().min(5).max(255),
      notionPageId: Yup.string().min(5).max(255),
    }),
    onSubmit(vals) {
      // validate
      if (!formik.isValid || vals.notionPageId.length < 5 || vals.notionToken.length < 5) {
        return
      }
      mutate({
        variables: {
          destination: ExportDestination.notion,
          args: `${vals.notionToken}|${vals.notionPageId}`
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
        className='from-blue-400 to-blue-600 py-4 px-8 rounded hover:shadow-lg bg-gradient-to-br duration-300 dark:text-gray-200 hover:scale-110 transform focus:outline-none mx-4'
        onClick={() => setVisible(true)}
      >
        notion
      </button>
      {visible && (
        <Dialog
          title={t('app.settings.export.notion.title')}
          onCancel={() => setVisible(false)}
          onOk={() => formik.handleSubmit()}
        >
          <div className='w-full'>
            <iframe
              src="//player.bilibili.com/player.html?aid=503430935&bvid=BV1Tg411G7gG&cid=349347987&page=1"
              scrolling="no"
              allow='fullscreen'
              className='border-0 w-144 max-h-96 m-auto hidden lg:block'
              height='768px'
              width='1024px'
            />
            <form className='w-full flex flex-col justify-center items-center' onSubmit={formik.handleSubmit}>
              <FieldInput
                name='notionToken'
                value={formik.values.notionToken}
                error={formik.errors.notionToken}
                onChange={formik.handleChange}
              />
              <FieldInput
                name='notionPageId'
                value={formik.values.notionPageId}
                error={formik.errors.notionPageId}
                onChange={formik.handleChange}
              />
              <div
                className='w-full text-right'
              >
                <button
                  className='w-64 bg-blue-400 rounded py-4 hover:bg-blue-500 duration-150'
                  type='submit'
                >
                  {t('app.settings.export.notion.submit')}
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </React.Fragment>
  )
}

export default ExportToNotion
