import AV from 'leancloud-storage'
import { LEANCLOUD } from '../constants/config'

AV.init({
  appId: LEANCLOUD.APP_ID,
  appKey: LEANCLOUD.APP_KEY,
  serverURL: LEANCLOUD.SERVER_URL
})
