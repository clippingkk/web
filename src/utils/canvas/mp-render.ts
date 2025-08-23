import type { Clipping } from '@/gql/graphql'
import type { WenquBook } from '../../services/wenqu'

export type BasicUserInfo = {
  id: number
  name: string
  avatar: string
}

export type PostShareConfig = {
  width: number
  height: number
  dpr: number
  bannerInfo?: {
    avatarUrl: string
    username: string
  }
  padding: number
  baseTextSize: number
  textFont: string[]
  clipping: Clipping
  bookInfo: WenquBook
}

export interface IPostShareRender {
  setup(): void
  renderBackground(): Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveToLocal(): Promise<any>
  renderText(): Promise<void>
  renderTitle(): Promise<void>
  renderAuthor(): Promise<void>
  renderBanner(): Promise<void>
  renderMyInfo(user?: BasicUserInfo): Promise<void>
  renderQRCode(): Promise<void>
  resizePosterHeight(): Promise<void>
}
