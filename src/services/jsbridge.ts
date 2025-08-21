/* eslint-disable */
const isAndroid =
  navigator.userAgent.indexOf('Android') > -1 ||
  navigator.userAgent.indexOf('Adr') > -1
const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

// 这是必须要写的，用来创建一些设置
function setupWebViewJavascriptBridge(callback: any) {
  // Android使用
  if (isAndroid) {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge)
    } else {
      document.addEventListener(
        'WebViewJavascriptBridgeReady',
        () => {
          callback(WebViewJavascriptBridge)
        },
        false
      )
    }
    console.log('tag', '安卓')
    sessionStorage.phoneType = 'android'
  }

  // iOS使用
  if (isiOS) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge)
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback)
    }
    window.WVJBCallbacks = [callback]
    var WVJBIframe = document.createElement('iframe')
    WVJBIframe.style.display = 'none'
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
    document.documentElement.appendChild(WVJBIframe)
    setTimeout(() => {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
    console.log('tag', 'ios')
    sessionStorage.phoneType = 'ios'
  }
}
// 注册回调函数，第一次连接时调用 初始化函数(android需要初始化,ios不用)
class CKBaseJSBrdige {
  get inWebview(): boolean {
    return window.WVJBCallbacks
  }
  constructor() {
    setupWebViewJavascriptBridge((bridge: any) => {
      if (isAndroid) {
        // 初始化
        bridge.init((_message: any, responseCallback: any) => {
          var data = {
            'Javascript Responds': 'Wee!',
          }
          responseCallback(data)
        })
      }
    })
  }

  // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
  callHandler(name: string, data: any, callback: any) {
    setupWebViewJavascriptBridge((bridge: any) => {
      bridge.callHandler(name, data, callback)
    })
  }
  // APP调js方法 （参数分别为:js提供的方法名  回调）
  registerHandler(name: string, callback: any) {
    setupWebViewJavascriptBridge((bridge: any) => {
      bridge.registerHandler(name, (data: any, responseCallback: any) => {
        callback(data, responseCallback)
      })
    })
  }
}

export default new CKBaseJSBrdige()
