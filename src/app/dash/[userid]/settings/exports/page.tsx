import React from 'react'
import { useTranslation } from '@/i18n'
import ExportToFlomo from './export.flomo'
import ExportToMail from './export.mail'
import ExportToNotion from './export.notion'

async function Exports() {
  const { t } = await useTranslation()

  return (
    <div className="w-full py-4">
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
        {t('app.settings.exports.availableOptions', 'Available Export Options')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export cards with consistent styling */}
        <div className="bg-white dark:bg-gray-800/60 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm">
          <div className="p-5">
            <ExportToFlomo />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm">
          <div className="p-5">
            <ExportToNotion />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/60 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm">
          <div className="p-5">
            <ExportToMail />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Exports
