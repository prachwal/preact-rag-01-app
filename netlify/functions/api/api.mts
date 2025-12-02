import type { Context } from '@netlify/functions'

export default (request: Request, _context: Context) => {
  try {
    const url = new URL(request.url)
    const subject = url.searchParams.get('name') ?? 'World'

    return new Response(`Hello ${subject}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(errorMessage, {
      status: 500,
    })
  }
}
