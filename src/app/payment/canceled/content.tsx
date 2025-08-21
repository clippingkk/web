'use client'
import Link from 'next/link'

function CanceledPageContent() {
  return (
    <>
      <span>Sorry we could not process your payment, please try again</span>
      <Link href='/pricing' className='mt-8'>
        go to plans
      </Link>
    </>
  )
}

export default CanceledPageContent
