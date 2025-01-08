export async function useTranslation(
  lng?: string,
  ns?: string | string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: { keyPrefix?: string } = {}
) {
  return {
    t: (k: string) => k,
    i18n: {},
  }
}
