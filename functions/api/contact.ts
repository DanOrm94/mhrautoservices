import { json, type Env } from '../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RESEND_API_KEY || !env.ADMIN_EMAIL) return json({ error: 'Contact email service is not configured' }, { status: 503 })
  const body = await request.json<{ name?: string; email?: string; message?: string }>().catch(() => ({}))
  if (!body.name || !body.email || !body.message) return json({ error: 'Name, email and message are required' }, { status: 400 })
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${env.GARAGE_NAME || 'MHR Auto Services'} <onboarding@resend.dev>`,
      to: [env.ADMIN_EMAIL],
      reply_to: body.email,
      subject: `Website enquiry from ${body.name}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(body.name)}</p><p><strong>Email:</strong> ${escapeHtml(body.email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>`,
    }),
  })
  if (!response.ok) return json({ error: 'Email provider rejected the request' }, { status: 502 })
  return json({ ok: true })
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[ch] || ch)) }
