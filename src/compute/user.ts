export function checkIsPremium(premiumEndAt?: string | null) {
  return premiumEndAt ? new Date(premiumEndAt).getTime() > new Date().getTime() : false
}
