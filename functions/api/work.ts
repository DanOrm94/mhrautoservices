import { json, requireAdmin, type Env } from '../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare('SELECT id, title, vehicle, category, description, image_url, created_at, updated_at FROM recent_work ORDER BY created_at DESC').all()
  return json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json<{ title?: string; vehicle?: string; category?: string; description?: string; image_key?: string; image_url?: string }>().catch(() => ({}))
  if (!body.title || !body.vehicle || !body.image_key) return json({ error: 'title, vehicle and image_key are required' }, { status: 400 })
  const result = await env.DB.prepare('INSERT INTO recent_work (title, vehicle, category, description, image_key, image_url) VALUES (?, ?, ?, ?, ?, ?)').bind(body.title, body.vehicle, body.category || 'General', body.description || '', body.image_key, body.image_url || '').run()
  return json({ id: result.meta.last_row_id }, { status: 201 })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, { status: 400 })
  const row = await env.DB.prepare('SELECT image_key FROM recent_work WHERE id = ?').bind(id).first<{ image_key: string }>()
  await env.DB.prepare('DELETE FROM recent_work WHERE id = ?').bind(id).run()
  if (row?.image_key) await env.ASSETS.delete(row.image_key)
  return json({ ok: true })
}
