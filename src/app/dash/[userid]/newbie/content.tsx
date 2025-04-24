'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import ButtonSimple from '@/components/button/button-simple'
import MetamaskBindButton from '@/components/externalAccount/metamask.bind'
import FieldInput from '@/components/input'
import ProgressBlock from '@/components/progress/progress-block'
import { useUpdateProfileMutation } from '@/schema/generated'
import { toastPromiseDefaultOption, uploadImage } from '@/services/misc'

// redirected from a new signup by loginV3
function NewbiePageContent({ uid }: { uid: number }) {
  // TODO:
  // 1. update name
  // 2. update domain
  // 3. bind metamask
  // 4. bind apple
  // 5. bind github
  // 6. update avatar / select nft ?
  // 7. optional. respect query parameters

  const { t } = useTranslation()

  const [doUpdateUserProfile, doUpdateResponse] = useUpdateProfileMutation()

  const [phase, setPhase] = useState(0)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')

  const newNameSubmitDisabled = useMemo(() => {
    if (newName.length < 3) {
      return true
    }
    if (newName.length > 32) {
      return true
    }
    if (/[<>\\+\ ]/.test(newName)) {
      return true
    }
    return false
  }, [newName])

  const newDomainSubmitDisabled = useMemo(() => {
    return !(/[a-z\.]{3,32}/.test(newDomain))
  }, [newDomain])

  const { push: navigate } = useRouter()

  useEffect(() => {
    if (phase < 6) {
      return
    }
    const userUniqueID = newDomain ? newDomain : uid
    navigate(`/dash/${userUniqueID}/upload`)
  }, [phase, uid, navigate, newDomain])

  const [avatar, setAvatar] = useState<File | null>(null)

  return (
    <div className='w-full h-full pt-10'>
      <h2 className='text-3xl text-center dark:text-white'>Update my profile</h2>
      <div className='mt-4'>
        <ProgressBlock
          value={phase + 1}
          max={6}
        >
          <div>
            <h3 className='w-full text-center mt-2 block dark:text-white'>
              Progress: {phase + 1} / 6
            </h3>
            <hr className=' mt-8 mb-20 w-full' />
          </div>
        </ProgressBlock>
      </div>

      <div className='w-96 mt-28 flex justify-center items-center mx-auto'>
        {phase === 0 && (
          <div className='w-full with-fade-in'>
            <h5 className='text-center text-lg mb-2 dark:text-white'>Choose my name</h5>
            <span className=' w-full text-center mb-2 block dark:text-white'>
              <kbd className='px-1 py-2 bg-pink-400 rounded-sm mr-1'>&lt;</kbd>
              <kbd className='px-1 py-2 bg-pink-400 rounded-sm mr-1'>&gt;</kbd>
              <kbd className='px-1 py-2 bg-pink-400 rounded-sm mr-1'>\</kbd>
              <kbd className='px-1 py-2 bg-pink-400 rounded-sm mr-1'>+</kbd>
              not allowed
            </span>
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
              className='w-full px-2 py-4 rounded-sm'
            />
            <ButtonSimple
              loading={doUpdateResponse.loading}
              onClick={() => {
                toast.promise(
                  doUpdateUserProfile({
                    variables: {
                      name: newName
                    }
                  }),
                  toastPromiseDefaultOption
                ).then(() => {
                  setPhase(1)
                  setNewDomain(newName.toLowerCase())
                })
              }}
              disabled={newNameSubmitDisabled}
              text='Confirm'
            />
          </div>
        )}

        {phase === 1 && (
          <div className='w-full with-fade-in'>
            <div className='w-full mb-4'>
              <h5 className='text-center text-lg mb-2 dark:text-white'>choose my domain</h5>
              <span className=' w-full text-center block dark:text-white'>TODO: rules here</span>
            </div>
            <input
              type="text"
              maxLength={32}
              minLength={3}
              value={newDomain}
              className='w-full px-2 py-4 rounded-sm'
              placeholder='my.name.domain'
              onChange={e => {
                const val = e.target.value
                // cannot startsWith number or something
                setNewDomain(val)
              }}
            />
            <ButtonSimple
              disabled={newDomainSubmitDisabled}
              loading={doUpdateResponse.loading}
              onClick={() => {
                toast.promise(
                  doUpdateUserProfile({
                    variables: {
                      domain: newDomain
                    }
                  }),
                  toastPromiseDefaultOption
                ).then(() => {
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
            <FieldInput
              type='file'
              name='avatar'
              onChange={e => {
                if (!e.target.files) {
                  return
                }
                const f = e.target.files[0]
                setAvatar(f)
              }}
              inputProps={{
                accept: 'image/png, image/jpeg'
              }}
              value={undefined}
            />
            <ButtonSimple
              loading={doUpdateResponse.loading}
              disabled={avatar === null}
              onClick={async () => {
                if (!avatar) {
                  return
                }
                const tl = toast.loading('uploading avatar...')
                try {
                  const resp = await uploadImage(avatar)
                  await doUpdateUserProfile({
                    variables: {
                      avatar: resp.filePath
                    }
                  })
                  setPhase(p => p + 1)
                  toast.success(t('app.profile.editor.updated'), { id: tl })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                  toast.error(e.toString(), { id: tl })
                }
              }}
              text='Confirm my avatar'
            />
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

export default NewbiePageContent
