import Spinner from '@annatarhe/lake-ui/spinner'

import LogoMark from '@/components/shell/logo-mark'

/**
 * Also the root layout's Suspense fallback, so it renders before providers
 * and the language cookie are available: no copy beyond the brand mark and
 * the spinner's own label.
 */
function Loading() {
  return (
    <div className="bg-lake-canvas text-lake-fg flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6">
      <LogoMark className="h-9" />
      <Spinner size="md" label="Loading ClippingKK" />
    </div>
  )
}

export default Loading
