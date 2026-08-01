import { extname } from 'node:path'

import type { UploadImageResponse } from '@/contracts/http'
import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { json, options, route } from '@/server/http'
import { uploadObject } from '@/server/integrations'

export const maxDuration = 300

export const POST = route(async (request) => {
  const uid = await requireUserId(request)
  const form = await request.formData()
  const image = form.get('image')
  if (!(image instanceof File)) throw new ApiError('image is required')
  if (image.size > 8 * 1024 * 1024)
    throw new ApiError('file too large. max size is 8MB')
  if (!image.type.startsWith('image/'))
    throw new ApiError('only image uploads are allowed')
  const extension =
    extname(image.name)
      .toLowerCase()
      .replace(/[^.a-z0-9]/g, '') || '.bin'
  const filePath = await uploadObject(
    `avatar/user-${uid}${extension}`,
    new Uint8Array(await image.arrayBuffer()),
    image.type
  )
  return json<UploadImageResponse>({ filePath }, 201)
}, 'avatar.upload')
export const OPTIONS = options
