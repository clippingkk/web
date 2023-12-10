import { useMutation } from '@apollo/client'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import Dialog from '../../../../components/dialog/dialog'
import FieldInput from '../../../../components/input'
import { Button } from '@mantine/core'
import { ExportDestination, useExportDataToMutation } from '../../../../schema/generated'

function ExportToNotion() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  const [mutate] = useExportDataToMutation({})
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
          destination: ExportDestination.Notion,
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
      <Button
        variant="gradient"
        className='bg-gradient-to-br from-indigo-400 to-cyan-500'
        onClick={() => setVisible(true)}
      >
        notion
      </Button>
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
                <Button
                  variant="gradient"
                  className='bg-gradient-to-br from-indigo-400 to-cyan-500'
                  type='submit'
                >
                  {t('app.settings.export.notion.submit')}
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </React.Fragment>
  )
}

export default ExportToNotion
