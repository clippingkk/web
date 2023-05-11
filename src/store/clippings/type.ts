export const EXTRA_AND_UPLOAD_FILE_TO_SERVER = 'clippings.EXTRA_AND_UPLOAD_FILE_TO_SERVER'

export type TClippingsFile = {
  type: string,
  file: DataTransferItem
  navigate: (url: string) => void
}

export function syncClippings(file: DataTransferItem, navigate: () => void) {
  return { 
    type: EXTRA_AND_UPLOAD_FILE_TO_SERVER,
    file,
    navigate
  }
}

export type TClippingBookUpdateAction = {
  type: string,
  clippingId: number,
}
