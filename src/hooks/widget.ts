import { useEffect } from 'react'

export function useWebWidgetScript() {
  const scriptUrl = 'https://web-widget-script.pages.dev/bundle.js'
  useEffect(() => {
    // prevent duplicate injection
    if (document.querySelector('script[data-is-web-widget-bundle]')) {
      return
    }
    const dom = document.createElement('script')
    dom.src = scriptUrl
    dom.dataset.isWebWidgetBundle = 'true'
    document.body.appendChild(dom)
    return () => {
      document.body.removeChild(dom)
    }
  }, [])
}
