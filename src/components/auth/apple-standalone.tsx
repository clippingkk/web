'use client'
export default function AppleStandaloneLoginButton({
  className,
}: {
  className?: string
  onSuccess?: () => void
}) {
  return (
    <a className={className} href="/api/auth/login">
      Continue with Gate
    </a>
  )
}
