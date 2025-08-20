/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func: Function, wait: number, immediate?: boolean) {
  let timeout: NodeJS.Timeout | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearTimeout(timeout as any)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}
