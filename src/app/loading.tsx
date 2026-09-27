import Spinner from '@annatarhe/lake-ui/spinner'

/**
 * Also the root layout's Suspense fallback, so it renders before providers
 * and the language cookie are available: no copy beyond the brand mark and
 * the spinner's own label.
 */
function Loading() {
  return (
    <div
      data-ui="editorial"
      className="bg-lake-canvas text-lake-fg flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6"
    >
      <span
        aria-hidden="true"
        className="rounded-lake-control bg-lake-fg font-reading text-lake-canvas flex size-10 items-center justify-center text-lg font-semibold"
      >
        K
      </span>
      <Spinner size="md" label="Loading ClippingKK" />
    </div>
  )
}

export default Loading
