export async function useTranslation(
  _lng?: string,
  _ns?: string | string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: { keyPrefix?: string } = {}
) {
  return {
    t: (k: string) => k,
    i18n: {},
  }
}
