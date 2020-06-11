import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { API_HOST } from '../constants/config'
import swal from 'sweetalert'

export interface IBaseResponseData {
  status: Number
  msg: string
  data: any
}

let token = sessionStorage.getItem('token')

export async function request(url: string, options: RequestInit = {}): Promise<any> {
  if (token) {
    options.headers = {
      'Authorization': `Bearer ${token}`
    }
  }
  options.credentials = 'include'
  options.mode = 'cors'

  try {
    const response: IBaseResponseData = await fetch(API_HOST + '/api' + url, options).then(res => res.json())
    if (response.status !== 200) {
      throw new Error(response.msg)
    }

    return response.data
  } catch (e) {
    swal({
      title: 'Oops',
      text: '请求挂了... 一会儿再试试',
      icon: 'info'
    })
    return Promise.reject(e)
  }
}

export function updateToken(t: string) {
  token = t
  client.setLink(new HttpLink({
    uri: API_HOST + '/graphql',
    headers: {
      'Authorization': `Bearer ${t}`
    }
  }))
}

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: API_HOST + '/graphql',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }),
});
