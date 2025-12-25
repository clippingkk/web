import AppleStandaloneLoginButton from '@/components/auth/apple-standalone'
import GithubStandaloneLoginButton from '@/components/auth/github-standalone'
/* METAMASK DISABLED
import MetaMaskStandaloneLoginButton from '@/components/auth/metamask-standalone'
*/

function ThirdPartEntry() {
  return (
    <div className='flex flex-col w-full space-y-3'>
      <div className='relative mb-2'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-300 dark:border-zinc-600' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-4 bg-slate-200 dark:bg-slate-900 text-gray-500 dark:text-zinc-400 font-medium'>
            Or continue with
          </span>
        </div>
      </div>

      {/* METAMASK DISABLED
      <MetaMaskStandaloneLoginButton />
      */}
      <AppleStandaloneLoginButton />
      <GithubStandaloneLoginButton />

      <div className='pt-2 text-center'>
        <p className='text-xs text-gray-500 dark:text-zinc-500'>
          Secure authentication powered by OAuth
        </p>
      </div>
    </div>
  )
}

export default ThirdPartEntry
