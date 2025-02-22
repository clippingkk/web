import { NextResponse } from 'next/server'
import heapdump from 'heapdump'
import { join } from 'path'
import { tmpdir } from 'os'
import { createReadStream, unlink } from 'fs'
import { promisify } from 'util'
import dayjs from 'dayjs'

const unlinkAsync = promisify(unlink)

/**
 * Generate a heap dump for debugging memory issues
 * This endpoint is protected and only accessible in development or with proper authorization
 * @returns Streamed heap dump file for download
 */
export async function GET(req: Request) {
  // Security check - only allow in development or with proper authorization
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || authHeader !== 'LLLLLLLLLLLLLL') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  try {
    // Generate unique filename with timestamp
    const timestamp = dayjs().format('yyyy-MM-dd-HH-mm-ss')
    const filename = `heapdump-${timestamp}.heapsnapshot`
    const filepath = join(tmpdir(), filename)

    // Generate heap dump
    await new Promise((resolve, reject) => {
      heapdump.writeSnapshot(filepath, (err, filename) => {
        if (err) reject(err)
        resolve(filename)
      })
    })

    // Create read stream for the file
    const stream = createReadStream(filepath)

    // Create response with appropriate headers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = new Response(stream as any, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    })

    // Delete the file after the stream ends
    response.clone().blob().then(async () => {
      try {
        await unlinkAsync(filepath)
        console.log(`Deleted heap dump file: ${filepath}`)
      } catch (err) {
        console.error(`Failed to delete heap dump file: ${filepath}`, err)
      }
    })

    return response
  } catch (error) {
    console.error('Error generating heap dump:', error)
    return NextResponse.json(
      { error: 'Failed to generate heap dump' },
      { status: 500 }
    )
  }
}
