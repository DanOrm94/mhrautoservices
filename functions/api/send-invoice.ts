import { json, requireAdmin, type Env } from '../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  if (!env.RESEND_API_KEY || !env.ADMIN_EMAIL) return json({ error: 'Email service is not configured' }, { status: 503 })
  const body = await request.json<{ invoice_id?: number; pdf_key?: string; invoice_number?: string; customer_name?: string; total?: number }>().catch(() => ({}))
  if (!body.pdf_key || !body.invoice_number) return json({ error: 'pdf_key and invoice_number are required' }, { status: 400 })
  const pdf = await env.ASSETS.get(body.pdf_key)
  if (!pdf) return json({ error: 'Invoice PDF not found' }, { status: 404 })
  const bytes = new Uint8Array(await pdf.arrayBuffer())
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const attachment = btoa(binary)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${env.GARAGE_NAME || 'MHR Auto Services'} <onboarding@resend.dev>`,
      to: [env.ADMIN_EMAIL],
      subject: `Invoice ${body.invoice_number} · ${body.customer_name || 'Customer'} · ${money(body.total || 0)}`,
      html: `<p>Invoice <strong>${body.invoice_number}</strong> has been generated for your records.</p><p>Total: <strong>${money(body.total || 0)}</strong></p>`,
      attachments: [{ filename: `${body.invoice_number}.pdf`, content: attachment }],
    }),
  })
  if (!response.ok) return json({ error: 'Email provider rejected the request' }, { status: 502 })
  if (body.invoice_id) await env.DB.prepare("UPDATE invoices SET status = 'emailed' WHERE id = ?").bind(body.invoice_id).run()
  return json({ ok: true })
}

function money(value: number) { return `£${Number(value).toFixed(2)}` }
