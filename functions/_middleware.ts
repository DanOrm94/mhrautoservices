export interface Env {
  DB: D1Database
  ASSETS: R2Bucket
  JWT_SECRET: string
  ADMIN_PASSWORD_HASH: string
  ADMIN_EMAIL: string
  GARAGE_NAME: string
  INVOICE_PREFIX: string
  PUBLIC_ASSET_BASE_URL?: string
  RESEND_API_KEY?: string
}

type AuthEnv = Env & { user?: { email: string } }

function base64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}

export async function signSession(payload: { email: string }, secret: string, maxAgeSeconds = 60 * 60 * 12) {
  const body = new TextEncoder().encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds }))
  const header = new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const headerPart = base64Url(header)
  const bodyPart = base64Url(body)
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${headerPart}.${bodyPart}`)))
  return `${headerPart}.${bodyPart}.${base64Url(signature)}`
}

export async function verifySession(token: string, secret: string) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(signature), new TextEncoder().encode(`${header}.${body}`))
  if (!valid) return null
  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as { email: string, exp: number }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers } })
}

export async function requireAdmin(request: Request, env: Env) {
  const auth = request.headers.get('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  return token ? verifySession(token, env.JWT_SECRET) : null
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const response = await next()
  return response
}

export type RequestContext = EventContext<AuthEnv, string, unknown>
