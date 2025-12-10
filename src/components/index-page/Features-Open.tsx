import { ArrowRightIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { getTranslation } from '@/i18n'
import BrandFlomoLogo from '../../assets/brand-flomo.png'
import BrandNotionLogo from '../../assets/brand-notion.svg'
import BrandServerLogo from '../../assets/brand-server.svg'
import logo from '../../assets/logo.png'

async function FeaturesOpen() {
  const { t } = await getTranslation()
  return (
    <div className='flex items-center w-full justify-around py-16 lg:flex-row flex-col'>
      <h3
        className={
          'lg:text-7xl text-4xl font-extrabold text-center max-w-xs mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-gray-400 to-blue-500 bg-clip-text text-transparent bg-linear-to-br'
        }
      >
        {t('app.index.features.open.title')}
      </h3>
      <div className='flex items-center'>
        <div className='flex items-center'>
          <Image
            src={logo}
            alt='clippingkk logo'
            className='w-10 h-10 lg:w-20 lg:h-20 rounded-sm shadow-lg'
            width={40}
            height={40}
          />
          <ArrowRightIcon className='h-16 w-16 mx-8 text-green-400 font-bold' />
        </div>
        <div className=' flex flex-col border-4 border-dashed border-gray-600 rounded-sm'>
          <a
            className='p-8 hover:bg-gray-400 duration-100 transition-colors rounded-sm'
            href='https://www.bilibili.com/video/BV1Tg411G7gG'
            target='_blank'
            rel='noreferrer'
          >
            <Image
              src={BrandNotionLogo}
              width={BrandNotionLogo.width}
              height={BrandNotionLogo.height}
              alt='notion'
            />
          </a>

          <a
            className='block p-8 hover:bg-gray-400 duration-100 transition-colors rounded-sm'
            href='https://annatarhe.notion.site/flomo-170afd99f866403d922a363b5b1b7706'
            target='_blank'
            rel='noreferrer'
          >
            <Image
              src={BrandFlomoLogo}
              width={BrandFlomoLogo.width / 2}
              height={BrandFlomoLogo.height / 2}
              alt='flomo'
            />
          </a>
          <a
            className='p-8 hover:bg-gray-400 duration-100 transition-colors rounded-sm flex items-center'
            href='https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae'
            target='_blank'
            rel='noreferrer'
          >
            <Image src={BrandServerLogo} width={30} height={30} alt='server' />
            <span className='block ml-4 text-2xl font-bold dark:text-gray-100'>
              {t('app.index.features.open.f3')}
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default FeaturesOpen
