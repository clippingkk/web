/** The signed-in reader as the shell needs it; a subset of the server Viewer. */
export type ShellViewer = {
  id: number
  name: string
  avatar?: string | null
  slug: string
  isPremium: boolean
  isAdmin: boolean
}
