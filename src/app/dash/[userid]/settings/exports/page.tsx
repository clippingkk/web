import { getTranslation } from '@/i18n'

import ExportToFlomo from './export.flomo'
import ExportToMail from './export.mail'
import ExportToNotion from './export.notion'

async function Exports() {
  const { t } = await getTranslation()

  return (
    <div className="w-full py-4">
      <h3 className="mb-6 text-xl font-medium text-gray-700 dark:text-gray-300">
        {t('app.settings.exports.availableOptions', 'Available Export Options')}
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Export cards with consistent styling */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60">
          <div className="p-5">
            <ExportToFlomo />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60">
          <div className="p-5">
            <ExportToNotion />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60">
          <div className="p-5">
            <ExportToMail />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Exports
