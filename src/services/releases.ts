import { request, IBaseResponseData } from './ajax'

export type IVersionItem = {
    id: number,
    platform: string,
    version: number,
    info: string,
    url: string,
    createdAt: string
}

export interface IVersionListResponse extends IBaseResponseData {
    data: IVersionItem[]
}

export function getVersions(platform: string): Promise<IVersionListResponse> {
    return request(`/version/${platform}?take=5`) as Promise<IVersionListResponse>
}
