import PromptPal from '@prompt-pal/node-sdk'
import { PP_API, PP_TOKEN } from '../constants/config'
import { getLocalToken } from './ajax'

const client = new PromptPal(PP_API, PP_TOKEN, {
  applyTemporaryToken(ctx) {
    return Promise.resolve({
      token: `Bearer ${getLocalToken()}`,
      limit: 1000,
      remaining: 1,
    })
  },
})

export default client

