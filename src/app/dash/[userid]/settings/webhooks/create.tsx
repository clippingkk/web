'use client'
import { useTranslation } from '@/i18n/client'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useCreateNewWebHookMutation, WebHookStep } from '@/schema/generated'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Button from '@/components/button'
import Tooltip from '@annatarhe/lake-ui/tooltip'

type Props = {
  onClose: () => void
  isPremium: boolean
}

function WebHookCreate({ onClose, isPremium }: Props) {
  const { t } = useTranslation()
  const [createMutation] = useCreateNewWebHookMutation()
  const router = useRouter()
  const formik = useFormik({
    initialValues: {
      hookUrl: '',
    },
    validationSchema: Yup.object({
      hookUrl: Yup.string().url().max(255),
    }),
    async onSubmit(vals) {
      if (vals.hookUrl.length <= 3 || !formik.isValid) {
        return
      }
      return createMutation({
        variables: {
          step: WebHookStep.OnCreateClippings,
          hookUrl: vals.hookUrl
        }
      }).then(() => {
        toast.success(t('app.common.done'))
        formik.resetForm()
        router.refresh()
        onClose()
      })
    }
  })

  return (
    <form className="w-full p-4" onSubmit={formik.handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>{t('app.settings.webhook.title')}</span>
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="url"
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="https://example.com"
          {...formik.getFieldProps('hookUrl')}
        />
        {formik.touched.hookUrl && formik.errors.hookUrl && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.hookUrl}</p>
        )}
      </div>
  
      <div className="flex justify-end gap-4 mt-6">
        <Button
          onClick={() => onClose()}
        >
          {t('app.common.cancel')}
        </Button>
    
        <Tooltip
          disabled={formik.isValid && isPremium}
          content={!isPremium ? t('app.payment.webhookRequired') : formik.errors.hookUrl}
        >
          <Button
            disabled={formik.values.hookUrl.length <= 3 || !formik.isValid || !isPremium}
            loading={formik.isSubmitting}
            type="submit"
          >
            {t('app.settings.webhook.submit')}
          </Button>
        </Tooltip>
      </div>
    </form>
  )
}

export default WebHookCreate