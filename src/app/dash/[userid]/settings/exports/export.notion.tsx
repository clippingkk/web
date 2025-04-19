'use client'
import Image from 'next/image'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { toast } from 'react-hot-toast'
import * as Yup from 'yup'
import BrandNotionLogo from '@/assets/brand-notion.svg'
import InputField from '@annatarhe/lake-ui/form-input-field'
import Modal from '@annatarhe/lake-ui/modal'
import { ExportDestination, useExportDataToMutation } from '@/schema/generated'

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
      <button
        onClick={() => setVisible(true)}
        className="flex flex-col items-center justify-center w-full h-full p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <Image
          src={BrandNotionLogo}
          width={BrandNotionLogo.width / 1.5}
          height={BrandNotionLogo.height / 1.5}
          className='mb-3'
          alt='notion'
        />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {t('app.settings.export.notion.title', 'Notion')}
        </span>
      </button>
      <Modal
        title={t('app.settings.export.notion.title')}
        isOpen={visible}
        onClose={() => setVisible(false)}
      >
        <div className='w-full p-4'>
          <iframe
            src="//player.bilibili.com/player.html?aid=503430935&bvid=BV1Tg411G7gG&cid=349347987&page=1"
            scrolling="no"
            allow='fullscreen'
            className='border-0 w-144 max-h-96 m-auto hidden lg:block'
            height='768px'
            width='1024px'
          />
          <form className='w-full flex flex-col justify-center items-center' onSubmit={formik.handleSubmit}>
            <InputField
              label='Notion Token'
              name='notionToken'
              className='w-full flex items-center'
              placeholder='Notion Token'
              value={formik.values.notionToken}
              error={formik.errors.notionToken}
              onChange={formik.handleChange}
            />
            <InputField
              label='Notion Page ID'
              name='notionPageId'
              className='w-full flex items-center'
              placeholder='Notion Page ID'
              value={formik.values.notionPageId}
              error={formik.errors.notionPageId}
              onChange={formik.handleChange}
            />
            <div className='w-full text-right mt-4'>
              <button
                type='submit'
                className='px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 active:scale-95'
              >
                {t('app.settings.export.notion.submit')}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default ExportToNotion
