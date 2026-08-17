import { json, signSession, type Env } from '../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ email?: string; password?: string }>().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) return json({ error: 'Email and password are required' }, { status: 400 })
  if (email !== env.ADMIN_EMAIL.toLowerCase()) return json({ error: 'Invalid credentials' }, { status: 401 })

  // Password verification is intentionally delegated to a secret containing a salted SHA-256 verifier.
  // Expected value format: sha256:<hex digest of password + salt>, with salt stored after the prefix.
  // For production, generate a strong verifier offline and keep it only in Cloudflare secret storage.
  const [salt, expected] = env.ADMIN_PASSWORD_HASH.split('$')
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`))
  const actual = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('')
  if (!expected || actual !== expected) return json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await signSession({ email }, env.JWT_SECRET)
  return json({ token, user: { email } })
}
