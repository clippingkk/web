import React from 'react'
import { UncheckBooksQueryDocument, UncheckBooksQueryQuery, UncheckBooksQueryQueryVariables } from '@/schema/generated'
import { Box } from '@mantine/core'
import { getApolloServerClient } from '@/services/apollo.server'
import HomelessBooksTable from './content'
import Link from 'next/link'
import { cookies } from 'next/headers'

type PageProps = {
  params: Promise<{ userid: string }>
  searchParams: Promise<{ offset?: string }>
}

async function AdminPanel(props: PageProps) {
  const [ck, params, sp] = await Promise.all([cookies(), props.params, props.searchParams])
  const uid = ~~params.userid

  const token = ck.get('token')

  const offset = sp.offset ? ~~sp.offset : 0

  const ac = getApolloServerClient()

  const { data } = await ac.query<UncheckBooksQueryQuery, UncheckBooksQueryQueryVariables>({
    query: UncheckBooksQueryDocument,
    variables: {
      pagination: {
        limit: 50,
        offset
      }
    },
    context: {
      headers: {
        'Authorization': 'Bearer ' + token?.value,
      }
    }
  })

  return (
    <div className='container mx-auto'>
      <Box>
        <>
          <div>
            <h3 className='text-3xl text-center dark:text-gray-50 my-8'>无家可归的书目们</h3>
            <div className='flex justify-center items-center gap-8'>
              <Link href={`/dash/${uid}/admin?offset=${offset + 50}`} className={'text-white block text-center w-full rounded-sm bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300'}>
                Next Page
              </Link>
              <Link href={`/dash/${uid}/admin?offset=${offset - 50}`} className={'text-white block text-center w-full rounded-sm bg-blue-400 hover:bg-blue-500 py-4 disabled:bg-gray-300 disabled:hover:bg-gray-300 transition-all duration-300'}>
                Prev Page
              </Link>
            </div>
          </div>
          <HomelessBooksTable data={data.adminDashboard.uncheckedBooks ?? []} />
        </>
      </Box>
    </div>
  )
}

export default AdminPanel
