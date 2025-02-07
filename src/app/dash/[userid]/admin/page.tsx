import React from 'react'
import { UncheckBooksQueryDocument } from '@/schema/generated'
import { Box } from '@mantine/core'
import { getApolloServerClient } from '@/services/apollo.server'
import { uncheckBooksQuery, uncheckBooksQueryVariables } from '@/schema/__generated__/uncheckBooksQuery'
import HomelessBooksTable from './content'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ offset?: string }>
}

async function AdminPanel(props: PageProps) {
  const params = await props.params
  const sp = await props.searchParams
  const uid = ~~params.userid

  const offset = sp.offset ? ~~sp.offset : 0

  const ac = getApolloServerClient()

  const { data } = await ac.query<uncheckBooksQuery, uncheckBooksQueryVariables>({
    query: UncheckBooksQueryDocument,
    variables: {
      pagination: {
        limit: 50,
        offset
      }
    }
  })

  return (
    <div className='container mx-auto'>
      <Box>
        <>
          <div>
            <h3 className='text-3xl text-center dark:text-gray-50 my-8'>无家可归的书目们</h3>
            <div className='flex justify-center items-center'>
              <Link href={`/dash/${uid}/admin?offset=${offset + 50}`} className={'text-white block text-center w-full rounded bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300'}>
                下一页
              </Link>
              <Link href={`/dash/${uid}/admin?offset=${offset - 50}`} className={'text-white block text-center w-full rounded bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300'}>
                上一页
              </Link>
            </div>
          </div>
          <HomelessBooksTable data={data.adminDashboard.uncheckedBooks} />
        </>
      </Box>
    </div>
  )
}

export default AdminPanel
