// import 'regenerator-runtime/runtime'
// import Enzyme from 'enzyme'
// import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import fetch from 'cross-fetch'

// Enzyme.configure({ adapter: new Adapter() })

if (!global.fetch) {
  global.fetch = fetch
}
