import { DevicePhoneMobileIcon } from '@heroicons/react/24/solid'
import type { Metadata } from 'next'
import Link from 'next/link'

import AuthByAppleButton from '@/components/auth.apple'
import AuthByGithub from '@/components/auth.github'
/* METAMASK DISABLED
import AuthByMetamask from '@/components/auth.metamask'
import MetaMaskProviderWrapper from '@/components/auth/metamask-provider-wrapper'
*/
import CKLogo from '@/components/logo/CKLogo'
import { generateMetadata as authGenerateMetadata } from '@/components/og/og-with-auth'
import { getBackgroundImageServer } from '@/hooks/theme.server'

export async function generateMetadata(): Promise<Metadata> {
  return authGenerateMetadata('auth/auth-v2')
}

async function AuthV2Page() {
  const bg = await getBackgroundImageServer()
  return (
    <section
      className="anna-page-container h-screen bg-cover bg-center object-cover"
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
    >
      <div className="bg-opacity-30 flex h-full w-full items-center justify-center bg-black backdrop-blur-xl">
        <div className="bg-opacity-10 rounded-sm bg-blue-400 p-12 shadow-sm backdrop-blur-xl">
          <div className="mb-4 flex flex-col items-center justify-center">
            <CKLogo />
            <h1 className="mt-4 text-center text-3xl font-bold dark:text-gray-100">
              ClippingKK
            </h1>
          </div>

          <div>
            <h2 className="mb-4 text-2xl dark:text-gray-100">Login by ...</h2>
            <Link
              href="/auth/phone"
              className="mt-4 block w-full rounded-sm bg-blue-400 py-4 text-center text-white transition-all duration-300 hover:bg-blue-500 disabled:bg-gray-300 disabled:hover:bg-gray-300"
            >
              <DevicePhoneMobileIcon className="mr-2 inline-block h-6 w-6" />
              Phone Number
            </Link>
            <hr className="my-4" />
            {/* METAMASK DISABLED
            <MetaMaskProviderWrapper>
              <AuthByMetamask />
            </MetaMaskProviderWrapper>
            */}
            <AuthByAppleButton />
            <AuthByGithub />

            <div className="mt-4">
              <p className="text-center dark:text-white">
                If you have any question, please email to
                <br />
                <a href="email:annatar.he+ck@gmail.com" className="underline">
                  annatar.he+ck@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthV2Page
