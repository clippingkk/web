/**
 * Request header src/proxy.ts sets to the page's pathname + search, so server
 * code can build a sign-in `next` without threading the URL through props.
 */
export const CK_PATH_HEADER = 'x-ck-path'
