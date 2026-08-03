import { yoga } from '@/server/graphql/yoga'
import { options, route } from '@/server/http'

export const maxDuration = 180

const handler = route(async (request) => yoga.fetch(request), 'graphql.request')

export const GET = handler
export const POST = handler
export const OPTIONS = options
