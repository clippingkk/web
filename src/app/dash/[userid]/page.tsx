import type { Route } from 'next'
import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ userid: string }>
}

export default async function DashIndexPage(props: PageProps) {
  const { userid } = await props.params
  redirect(`/dash/${userid}/home` as Route)
}
