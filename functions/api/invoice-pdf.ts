import { json, requireAdmin, type Env } from '../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const key = new URL(request.url).searchParams.get('key')
  if (!key || !key.startsWith('invoices/')) return json({ error: 'Invalid key' }, { status: 400 })
  const object = await env.ASSETS.get(key)
  if (!object) return json({ error: 'Invoice not found' }, { status: 404 })
  return new Response(object.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${key.split('/').pop()}"` } })
}
