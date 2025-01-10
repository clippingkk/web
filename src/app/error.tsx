'use client'

import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { Alert } from '@mantine/core'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto flex justify-center items-center flex-col h-screen">
      <Alert variant="light" color="red" title="Something went wrong!" icon={<ExclamationCircleIcon className="w-6 h-6" />}>
        {error.message}
      </Alert>

      <button
        className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow-lg mt-4 hover:bg-blue-500 duration-150"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}
