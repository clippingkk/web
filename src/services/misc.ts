import { request } from './ajax'

export type TUploadResponse = {
  filePath: string
}

export function uploadImage(file: File): Promise<TUploadResponse> {
  const fd = new FormData()
  fd.append('image', file)
  return request('/v1/misc/upload', {
    method: 'POST',
    body: fd
  })
}

export const toastPromiseDefaultOption = {
  loading: 'Loading',
  success: 'Success',
  error: (err: Error) => err.toString()
}
