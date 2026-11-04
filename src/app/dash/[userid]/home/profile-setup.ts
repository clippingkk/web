/**
 * Whether the library banner should ask the owner to finish their profile.
 * The banner names three things: a name, an avatar and a short link.
 * Bio is not one of them.
 */

/** Phone signup stores `user.` plus exactly 8 hex characters. */
const GENERATED_PHONE_NAME = /^user\.[0-9a-f]{8}$/i

export type ProfileSetupFields = {
  name: string
  avatar?: string | null
  domain?: string | null
}

/**
 * A name the reader chose. Blank is missing. The phone-signup placeholder
 * is missing. A Gate display name is not, even when it starts with `user.`
 * (the email local-part or `preferred_username` is copied as-is).
 */
export function hasChosenName(name: string) {
  const trimmed = name.trim()
  return trimmed.length > 0 && !GENERATED_PHONE_NAME.test(trimmed)
}

/** An avatar is set. The literal string "null" is an old empty value. */
export function hasAvatar(avatar?: string | null) {
  const value = avatar?.trim()
  return !!value && value.toLowerCase() !== 'null'
}

/**
 * A short link is any saved domain that can actually be opened.
 * All-digit domains never win against `/dash/<id>`. Legacy domains that
 * fail the current slug rule (a dot, one or two characters) still resolve,
 * so they count.
 */
export function hasShortLink(domain?: string | null) {
  const value = domain?.trim()
  return !!value && !/^\d+$/.test(value)
}

export function profileNeedsSetup(user: ProfileSetupFields) {
  return (
    !hasChosenName(user.name) ||
    !hasAvatar(user.avatar) ||
    !hasShortLink(user.domain)
  )
}
