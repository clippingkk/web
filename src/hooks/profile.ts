export function useIsPremium(premiumEndAt?: string) {
  if (!premiumEndAt) {
    return false
  }
  return new Date(premiumEndAt).getTime() > Date.now()
}
