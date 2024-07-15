import PromptPal from '@prompt-pal/node-sdk'
import { PP_API, PP_TOKEN } from '../constants/config'

const client = new PromptPal(PP_API, PP_TOKEN)

export default client

