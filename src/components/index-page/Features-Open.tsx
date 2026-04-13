import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { getTranslation } from '@/i18n'

import BrandFlomoLogo from '../../assets/brand-flomo.png'
import BrandNotionLogo from '../../assets/brand-notion.svg'
import BrandServerLogo from '../../assets/brand-server.svg'
import logoDark from '../../assets/logo-dark.svg'
import logoLight from '../../assets/logo-light.svg'

async function FeaturesOpen() {
  const { t } = await getTranslation()
  return (
    <div className="flex w-full flex-col items-center justify-around py-16 lg:flex-row">
      <h3
        className={
          'mb-8 flex max-w-xs overflow-x-visible bg-linear-to-br from-gray-400 to-blue-500 bg-clip-text pb-4 text-center text-4xl font-extrabold text-transparent lg:mb-0 lg:text-7xl'
        }
      >
        {t('app.index.features.open.title')}
      </h3>
      <div className="flex items-center">
        <div className="flex items-center">
          <Image
            src={logoLight}
            alt="clippingkk logo"
            className="h-10 w-10 rounded-sm shadow-lg lg:h-20 lg:w-20 dark:hidden"
            width={40}
            height={40}
          />
          <Image
            src={logoDark}
            alt="clippingkk logo"
            className="hidden h-10 w-10 rounded-sm shadow-lg lg:h-20 lg:w-20 dark:block"
            width={40}
            height={40}
          />
          <ArrowRight className="mx-8 h-16 w-16 font-bold text-green-400" />
        </div>
        <div className="flex flex-col rounded-sm border-4 border-dashed border-gray-600">
          <a
            className="rounded-sm p-8 transition-colors duration-100 hover:bg-gray-400"
            href="https://www.bilibili.com/video/BV1Tg411G7gG"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={BrandNotionLogo}
              width={BrandNotionLogo.width}
              height={BrandNotionLogo.height}
              alt="notion"
            />
          </a>

          <a
            className="block rounded-sm p-8 transition-colors duration-100 hover:bg-gray-400"
            href="https://annatarhe.notion.site/flomo-170afd99f866403d922a363b5b1b7706"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={BrandFlomoLogo}
              width={BrandFlomoLogo.width / 2}
              height={BrandFlomoLogo.height / 2}
              alt="flomo"
            />
          </a>
          <a
            className="flex items-center rounded-sm p-8 transition-colors duration-100 hover:bg-gray-400"
            href="https://annatarhe.notion.site/Webhook-24f26f59c0764365b3deb8e4c8e770ae"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={BrandServerLogo} width={30} height={30} alt="server" />
            <span className="ml-4 block text-2xl font-bold dark:text-gray-100">
              {t('app.index.features.open.f3')}
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default FeaturesOpen
