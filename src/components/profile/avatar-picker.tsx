import { Button, Divider, Group } from '@mantine/core'
import React, { useCallback, useState } from 'react'
import Modal from '@annatarhe/lake-ui/modal'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Dropzone } from '@mantine/dropzone'
import { toastPromiseDefaultOption, uploadImage } from '../../services/misc'
import NFTGallary from '../nfts/nft-gallary'

type AvatarPickerProps = {
  uid: number
  onCancel: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (nextAvatar: string) => Promise<any>
  opened: boolean
}

function AvatarPicker(props: AvatarPickerProps) {
  const { t } = useTranslation()
  const { uid, onCancel, opened, onSubmit } = props
  const [nextImage, setNextImage] = useState<string | File | null>(null)

  const onConfirm = useCallback(async () => {
    if (!nextImage) {
      toast.error('disabled')
      return
    }
    if (typeof nextImage === 'string') {
      return onSubmit(nextImage)
    }
    // upload
    return toast.promise(
      uploadImage(nextImage).then(res => onSubmit(res.filePath)),
      toastPromiseDefaultOption
    )
  }, [onSubmit, nextImage])

  return (
    <Modal
      title={t('app.auth.avatar')}
      onClose={onCancel}
      isOpen={opened}
    >
      <div>
        <NFTGallary
          uid={uid}
          onPick={(_, realImage) => {
            setNextImage(realImage)
          }}
        />
        <Divider
          my='lg'
          label='Or you can also upload avatar manually'
          labelPosition='center'
        />
        <Dropzone
          accept={['image/png', 'image/jpeg', 'image/sgv+xml', 'image/gif']}
          onDrop={f => {
            setNextImage(f[0])
          }}
        >
          {nextImage && typeof nextImage !== 'string' && (
            <div>{nextImage.name}</div>
          )}
          {!nextImage && (
            <div>Please drop your avatar here</div>
          )}
        </Dropzone>
        <Divider />
        <Group align='right' className='mt-4'>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant='filled'
            disabled={nextImage === null}
            onClick={onConfirm}>Submit</Button>
        </Group>
      </div>
    </Modal>
  )
}

export default AvatarPicker
