export const EXTRA_AND_UPLOAD_FILE_TO_SERVER = 'clippings.EXTRA_AND_UPLOAD_FILE_TO_SERVER'

export type TClippingsFile = {
  type: string,
  file: DataTransferItem
}

export function syncClippings(file: DataTransferItem) {
  return { 
    type: EXTRA_AND_UPLOAD_FILE_TO_SERVER,
    file
  }
}
