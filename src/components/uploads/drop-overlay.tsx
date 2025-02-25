import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import { useTranslation } from '@/i18n/client'

type Props = {
  onClose: () => void
}

function DropOverlay(props: Props) {
  const { t } = useTranslation()
  const { onClose } = props

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className='absolute inset-0 bg-slate-900/30 backdrop-blur-xl transition-all duration-300 ease-in-out dark:bg-slate-900/50' />
      
      {/* Content Container */}
      <div className='relative transform transition-all duration-300 ease-in-out hover:scale-105'>
        <div className='relative flex flex-col items-center justify-center rounded-3xl bg-linear-to-br from-orange-500/90 via-rose-500/90 to-purple-600/90 p-20 lg:p-32'>
          {/* Glow effect */}
          <div className='absolute inset-0 -z-10 rounded-3xl bg-linear-to-br from-orange-500 via-rose-500 to-purple-600 opacity-50 blur-2xl transition-all duration-300 ease-in-out group-hover:opacity-70' />
          
          {/* Icon with glow */}
          <div className='relative'>
            <div className='absolute inset-0 -z-10 animate-pulse blur-xl'>
              <ArrowDownTrayIcon className='h-16 w-16 text-white/50' />
            </div>
            <ArrowDownTrayIcon className='h-16 w-16 text-white transition-transform duration-300 ease-in-out hover:scale-110' />
          </div>

          {/* Text with gradient */}
          <p className='mt-8 bg-linear-to-r from-white to-white/80 bg-clip-text text-5xl font-bold text-transparent transition-all duration-300 ease-in-out lg:text-6xl'>
            {t('app.upload.dropHere')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DropOverlay
