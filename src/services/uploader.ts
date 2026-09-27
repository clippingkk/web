/** Mirrors the state names of uploadProcessMachine (hooks/my-file.machine). */
export enum UploadStep {
  None = 'none',
  Parse = 'parse',
  SearchingBook = 'searchingBook',
  Uploading = 'uploading',
  Done = 'done',
  Error = 'error',
}

/** The visible stages of an import, in order. */
export const IMPORT_STEPS = [
  UploadStep.Parse,
  UploadStep.SearchingBook,
  UploadStep.Uploading,
  UploadStep.Done,
] as const

/** Position of a step in IMPORT_STEPS; -1 before starting or on error. */
export function stepIndex(step: UploadStep): number {
  return (IMPORT_STEPS as readonly UploadStep[]).indexOf(step)
}

/** The import page has its own drop zone, so the global one stands down. */
export function isUploadRoute(pathname?: string | null): boolean {
  return !!pathname && /^\/dash\/[^/]+\/upload\/?$/.test(pathname)
}
