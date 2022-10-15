import React from 'react'
import Image from 'next/image'
import { useBackgroundImage } from '../../hooks/theme'
import logo from '../../assets/logo.png'
import Head from 'next/head'
import OGWithAuth from '../../components/og/og-with-auth'
import AuthByAppleButton from '../../components/auth.apple'
import AuthByMetamask from '../../components/auth.metamask'
import AuthByGithub from '../../components/auth.github'
import Link from 'next/link'

type AuthV2Props = {
}

function AuthV2(props: AuthV2Props) {
  const bg = useBackgroundImage()

  return (
    <React.Fragment>
      <Head>
        <title>Login by ...</title>
        <OGWithAuth urlPath='auth/auth-v2' />
      </Head>
      <section
        className='anna-page-container h-screen object-cover bg-center bg-cover'
        style={{
          backgroundImage: `url(${bg})`
        }}
      >
        <div
          className='flex w-full h-full backdrop-blur-xl bg-black bg-opacity-30 justify-center items-center'
        >
          <div className='p-12 rounded backdrop-blur-xl shadow bg-opacity-10 bg-blue-400'>
            <div className='flex justify-center items-center flex-col mb-4'>
              <Image
                src={logo}
                alt="clippingkk logo"
                // className='w-24 h-24 lg:w-48 lg:h-48 shadow rounded'
                width={96}
                height={96}
              />
              <h1 className='text-center font-bold text-3xl dark:text-gray-100 mt-4'>ClippingKK</h1>
            </div>

            <div>
              TODO: email
            </div>


          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default AuthV2
