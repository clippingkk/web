'use client'

import Modal from '@annatarhe/lake-ui/modal'
import { useCallback, useState } from 'react'

import type { ProfileQuery } from '@/schema/generated'
import { getUserSlug } from '@/utils/profile.utils'

import SearchBar from '../searchbar/searchbar'
import LoggedNavigationBar from './authed'
import BrandLink from './brand-link'
import {
  NAV_INNER_CLASSES,
  NAV_LEFT_ZONE_CLASSES,
  NAV_RIGHT_ZONE_CLASSES,
  NAV_SHELL_CLASSES,
} from './constants'
import LoginButton from './login-button'
import LoginByQRCode from './login-by-qrcode'
import PrimaryNav from './primary-nav'

type NavigationBarProps = {
  myProfile?: ProfileQuery['me']
}

function NavigationBar(props: NavigationBarProps) {
  const { myProfile: profile } = props
  const [searchVisible, setSearchVisible] = useState(false)
  const [loginByQRCodeModalVisible, setLoginByQRCodeModalVisible] =
    useState(false)

  const onSearchbarClose = useCallback(() => {
    setSearchVisible(false)
  }, [])

  const profileSlug = profile ? getUserSlug(profile) : null
  const brandHref = profileSlug ? `/dash/${profileSlug}/home` : '/'

  return (
    <>
      <nav className={NAV_SHELL_CLASSES}>
        <div className={NAV_INNER_CLASSES}>
          <div className={NAV_LEFT_ZONE_CLASSES}>
            <BrandLink href={brandHref} />
            {!profile ? <LoginButton /> : null}
          </div>

          {profile && profileSlug ? (
            <PrimaryNav profileSlug={profileSlug} />
          ) : null}

          {profile && profileSlug ? (
            <div className={NAV_RIGHT_ZONE_CLASSES}>
              <LoggedNavigationBar
                onSearch={() => setSearchVisible(true)}
                uidOrDomain={profileSlug}
                onPhoneLogin={() => setLoginByQRCodeModalVisible(true)}
                profile={profile}
              />
            </div>
          ) : null}
        </div>
      </nav>

      <SearchBar
        profile={profile}
        visible={searchVisible}
        onClose={onSearchbarClose}
      />
      <Modal
        isOpen={loginByQRCodeModalVisible}
        onClose={() => {
          setLoginByQRCodeModalVisible(false)
        }}
        title="Login by QR Code"
      >
        <LoginByQRCode />
      </Modal>
    </>
  )
}

export default NavigationBar
