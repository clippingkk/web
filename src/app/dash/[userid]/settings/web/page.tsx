'use client'

import SelectField from '@annatarhe/lake-ui/form-select-field'
import SegmentedControl from '@annatarhe/lake-ui/segmented-control'
import Cookies from 'js-cookie'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  SettingsCard,
  SettingsRow,
  SettingsSection,
} from '@/components/settings/settings-section'
import { useTheme } from '@/components/theme/use-theme'
import { STORAGE_LANG_KEY } from '@/constants/storage'
import { useTranslation } from '@/i18n/client'
import type { ThemePreference } from '@/lib/theme'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '简体中文' },
  { value: 'ko', label: '한국어' },
]

function normalize(language: string) {
  if (language.startsWith('zh')) return 'zh'
  if (language.startsWith('ko')) return 'ko'
  return 'en'
}

function GeneralSettingsPage() {
  const { t, i18n } = useTranslation(undefined, 'settings')
  const router = useRouter()
  const { preference, setPreference } = useTheme()
  const [chosen, setChosen] = useState<string | null>(null)
  const [switching, startSwitch] = useTransition()

  // The refresh brings the new language's strings; I18nProvider switches once
  // they arrive, so nothing renders as raw keys in between.
  const onLanguageChange = (value: string) => {
    setChosen(value)
    Cookies.set(STORAGE_LANG_KEY, value, { expires: 365, sameSite: 'lax' })
    startSwitch(() => router.refresh())
  }

  return (
    <SettingsSection
      title={t('general.title')}
      description={t('general.description')}
    >
      <SettingsCard>
        <SettingsRow
          label={t('general.language')}
          description={t('general.languageDescription')}
          control={
            <SelectField
              label={t('general.language')}
              className="w-48 [&_label]:sr-only"
              options={LANGUAGES}
              value={chosen ?? normalize(i18n.language ?? 'en')}
              disabled={switching}
              onChange={(e) => onLanguageChange(e.target.value)}
            />
          }
        />
        <SettingsRow
          label={t('general.theme')}
          description={t('general.themeDescription')}
          control={
            <SegmentedControl
              aria-label={t('general.theme')}
              size="sm"
              value={preference}
              onValueChange={(value: ThemePreference) => setPreference(value)}
              options={[
                {
                  value: 'system',
                  label: t('general.themeSystem'),
                  icon: <Monitor className="size-4" />,
                },
                {
                  value: 'light',
                  label: t('general.themeLight'),
                  icon: <Sun className="size-4" />,
                },
                {
                  value: 'dark',
                  label: t('general.themeDark'),
                  icon: <Moon className="size-4" />,
                },
              ]}
            />
          }
        />
      </SettingsCard>
    </SettingsSection>
  )
}

export default GeneralSettingsPage
