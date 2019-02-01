import { API_HOST } from '../constants/config'

export interface IBaseResponseData {
  status: Number
  msg: String
  data: any
}

export async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = sessionStorage.getItem('token')
  if (token) {
    options.headers = {
      'Authorization': `Bearer ${token}`
    }
  }
  options.credentials = 'include'
  options.mode = 'cors'

  const response: IBaseResponseData = await fetch(API_HOST + url, options).then(res => res.json())
  if (response.status !== 200) {
    // TODO: show error msg
    console.log(response.msg)
    return Promise.reject(response.msg)
  }

  return response.data
}
