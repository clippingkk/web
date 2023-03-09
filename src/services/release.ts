import { request } from './ajax'

export type IVersionItem = {
    id: number,
    platform: string,
    version: number,
    info: string,
    url: string,
    createdAt: string
}

export async function getVersions(platform: string): Promise<IVersionItem[]> {
    const response = await (request(`/version/${platform}?take=5`) as Promise<IVersionItem[]>)

    return response.map(x => ({
      ...x,
      // info: x.info.replace(/\n/g, '')
    }))
}
