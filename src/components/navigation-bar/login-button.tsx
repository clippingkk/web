import Link from 'next/link'

function LoginButton() {
  return (
    <Link
      href="/auth/auth-v4"
      className="inline-flex items-center rounded-xl bg-blue-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
    >
      Login
    </Link>
  )
}

export default LoginButton
