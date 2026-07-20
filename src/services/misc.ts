import type { UploadImageResponse } from '@/contracts/http'

import { request } from './ajax'

export function uploadImage(file: File): Promise<UploadImageResponse> {
  const fd = new FormData()
  fd.append('image', file)
  return request('/v1/misc/upload', {
    method: 'POST',
    body: fd,
  })
}

export const toastPromiseDefaultOption = {
  loading: 'Loading',
  success: 'Success',
  error: (err: Error) => err.toString(),
}
