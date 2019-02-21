import { request } from "./ajax";

export type TUploadResponse = {
  filePath: string
}


export function uploadImage(file: File): Promise<TUploadResponse> {
  const fd = new FormData()
  fd.append('image', file)
  return request('/misc/upload/image', {
    method: 'POST',
    body: fd
  })
}
