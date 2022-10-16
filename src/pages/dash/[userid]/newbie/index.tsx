import { useMutation } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import ButtonSimple from '../../../../components/button/button-simple'
import DashboardContainer from '../../../../components/dashboard-container/container'
import GithubBindButton from '../../../../components/externalAccount/github.bind'
import MetamaskBindButton from '../../../../components/externalAccount/metamask.bind'
import ProgressBlock from '../../../../components/progress/progress-block'
import updateUserProfileMutation from '../../../../schema/mutations/update-profile.graphql'
import { updateProfile, updateProfileVariables } from '../../../../schema/mutations/__generated__/updateProfile'
import { TGlobalStore } from '../../../../store'

type NewbiePageProps = {
}

// redirected from a new signup by loginV3
function NewbiePage(props: NewbiePageProps) {
  // TODO:
  // 1. update name
  // 2. update domain
  // 3. bind metamask
  // 4. bind apple
  // 5. bind github
  // 6. update avatar / select nft ?
  // 7. optional. respect query parameters

  const uid = useSelector<TGlobalStore, number>(s => s.user.profile.id)

  const [doUpdateUserProfile] = useMutation<updateProfile, updateProfileVariables>(updateUserProfileMutation)

  const [phase, setPhase] = useState(1)

  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')

  const newNameSubmitDisabled = useMemo(() => {
    if (newName.length < 3) {
      return true
    }
    if (newName.length > 32) {
      return true
    }
    return false
  }, [newName])

  const newDomainSubmitDisabled = useMemo(() => {
    if (newDomain.length < 3) {
      return true
    }
    if (newDomain.length > 32) {
      return true
    }
    return false
  }, [newDomain])

  const { push: navigate } = useRouter()

  useEffect(() => {
    if (phase < 6) {
      return
    }
    // jump to home
    const userUniqueID = newDomain ? newDomain : uid
    // TODO: maybe redirect to upload page is better ?
    navigate(`/dash/${userUniqueID}/upload`)
  }, [phase, uid, navigate, newDomain])

  return (
    <div className='w-full h-full pt-10'>
      <h2 className='text-3xl text-center'>Update my profile</h2>

      <div className='mt-4'>
        <ProgressBlock
          value={phase + 1}
          max={5}
        >
          <div>
            <h3 className='w-full text-center mt-2 block'>
              Progress: {phase + 1} / 5
            </h3>
            <hr className=' mt-8 mb-20 w-full' />
          </div>
        </ProgressBlock>
      </div>

      <div className='w-96 mt-28 flex justify-center items-center mx-auto'>
        {phase === 0 && (
          <div className='w-full'>
            <h5 className='text-center text-lg mb-2'>Choose my name</h5>
            <input
              type="text"
              maxLength={32}
              minLength={3}
              value={newName}
              onChange={e => {
                const val = e.target.value
                // cannot startsWith number or something
                setNewName(val)
              }}
              placeholder='name'
              className='w-full px-2 py-4 rounded'
            />
            <ButtonSimple
              onClick={() => {
                // TODO: more check
                doUpdateUserProfile({
                  variables: {
                    name: newName
                  }
                }).then(res => {
                  setPhase(1)
                  // TODO: set default newDomain
                  setNewDomain(newName.toLowerCase())
                })
              }}
              disabled={newNameSubmitDisabled}
              text='Confirm'
            />
          </div>
        )}

        {phase === 1 && (
          <div className='w-full'>
            <div className='w-full mb-4'>
              <h5 className='text-center text-lg mb-2'>choose my domain</h5>
              <span className=' w-full text-center block'>TODO: rules here</span>
            </div>
            <input
              type="text"
              maxLength={32}
              minLength={3}
              value={newDomain}
              className='w-full px-2 py-4 rounded'
              placeholder='my.name.domain'
              onChange={e => {
                const val = e.target.value
                // cannot startsWith number or something
                setNewDomain(val)
              }}
            />
            <ButtonSimple
              disabled={newDomainSubmitDisabled}
              onClick={() => {
                // TODO: more check
                doUpdateUserProfile({
                  variables: {
                    domain: newDomain
                  }
                }).then(res => {
                  setPhase(2)
                })
              }}
              text='Confirm my domain'
            />
          </div>
        )}

        {phase === 2 && (
          <MetamaskBindButton
            onBound={() => {
              setPhase(5)
            }}
          />
        )}
        {phase === 3 && (
          <div>
            TODO: bind apple
          </div>
        )}
        {phase === 4 && (
          <div>
            TODO: bind github
          </div>
        )}
        {phase === 5 && (
          <div>
            TODO: setup avatar or NFT
          </div>
        )}

        {phase >= 6 && (
          <div>
            Syncing...
          </div>
        )}

      </div>
    </div>
  )
}

NewbiePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      <Head>
        <title>Welcome to clippings~</title>
      </Head>
      {page}
    </DashboardContainer>
  )
}

export default NewbiePage
