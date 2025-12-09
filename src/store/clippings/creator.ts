export function extraFile(file: DataTransferItem): Promise<string> {
  return new Promise((resolve, reject) => {
    const f = new FileReader()
    f.onload = (readEvent) => {
       
      resolve((readEvent.target as any).result)
    }

    const uploadFile = file.getAsFile()
    if (!uploadFile) {
      reject('nil')
      return
    }

    f.readAsText(uploadFile)
  })
}
