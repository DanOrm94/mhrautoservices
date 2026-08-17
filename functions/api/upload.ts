import { json, requireAdmin, type Env } from '../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return json({ error: 'file is required' }, { status: 400 })
  if (!file.type.startsWith('image/')) return json({ error: 'Only image uploads are allowed' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return json({ error: 'Maximum file size is 10MB' }, { status: 400 })
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase()
  const key = `uploads/${crypto.randomUUID()}-${safeName}`
  await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  const base = env.PUBLIC_ASSET_BASE_URL?.replace(/\/$/, '')
  return json({ key, url: base ? `${base}/${key}` : `/api/assets?key=${encodeURIComponent(key)}` }, { status: 201 })
}
