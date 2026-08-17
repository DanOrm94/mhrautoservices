import { json, requireAdmin, type Env } from '../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const key = new URL(request.url).searchParams.get('key')
  if (!key) return json({ error: 'Missing key' }, { status: 400 })
  const object = await env.ASSETS.get(key)
  if (!object) return new Response('Not found', { status: 404 })
  return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable' } })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const key = new URL(request.url).searchParams.get('key')
  if (!key) return json({ error: 'Missing key' }, { status: 400 })
  await env.ASSETS.delete(key)
  return json({ ok: true })
}
