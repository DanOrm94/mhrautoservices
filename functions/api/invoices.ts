import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { json, requireAdmin, type Env } from '../_middleware'

type InvoiceBody = {
  customer_name?: string; customer_email?: string; customer_phone?: string; vehicle?: string; job_description?: string
  labour?: number; parts?: number; vat_rate?: number; image_keys?: string[]
}

function money(value: number) { return `£${value.toFixed(2)}` }

async function buildPdf(env: Env, invoiceNumber: string, body: Required<Pick<InvoiceBody,'customer_name'|'vehicle'|'job_description'>> & InvoiceBody, total: number, vatAmount: number, subtotal: number, logoBytes?: Uint8Array) {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const page = doc.addPage([595.28, 841.89])
  const width = page.getWidth()
  const orange = rgb(1, 0.35, 0.12)
  const dark = rgb(0.045, 0.05, 0.065)
  page.drawRectangle({ x: 0, y: 0, width, height: page.getHeight(), color: dark })
  page.drawRectangle({ x: 0, y: 760, width, height: 82, color: orange })

  if (logoBytes?.length) {
    try {
      const logo = await doc.embedJpg(logoBytes)
      const maxWidth = 105
      const maxHeight = 58
      const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height)
      const logoWidth = logo.width * scale
      const logoHeight = logo.height * scale
      page.drawImage(logo, {
        x: 42,
        y: 772,
        width: logoWidth,
        height: logoHeight,
      })
    } catch {
      page.drawText(env.GARAGE_NAME || 'MHR Auto Services', { x: 42, y: 792, size: 22, font: bold, color: rgb(1,1,1) })
    }
  } else {
    page.drawText(env.GARAGE_NAME || 'MHR Auto Services', { x: 42, y: 792, size: 22, font: bold, color: rgb(1,1,1) })
  }

  page.drawText('INVOICE', { x: 430, y: 794, size: 18, font: bold, color: rgb(0.1,0.05,0.03) })
  page.drawText(invoiceNumber, { x: 430, y: 774, size: 10, font: regular, color: rgb(0.1,0.05,0.03) })
  let y = 720
  page.drawText('BILL TO', { x: 42, y, size: 8, font: bold, color: orange })
  y -= 22
  page.drawText(body.customer_name, { x: 42, y, size: 13, font: bold, color: rgb(1,1,1) })
  y -= 17
  page.drawText(body.vehicle, { x: 42, y, size: 10, font: regular, color: rgb(.72,.74,.78) })
  if (body.customer_email) { y -= 14; page.drawText(body.customer_email, { x: 42, y, size: 9, font: regular, color: rgb(.62,.64,.68) }) }
  if (body.customer_phone) { y -= 13; page.drawText(body.customer_phone, { x: 42, y, size: 9, font: regular, color: rgb(.62,.64,.68) }) }
  y = 650
  page.drawLine({ start: {x:42,y}, end:{x:553,y}, thickness:1, color:rgb(.18,.2,.23) })
  y -= 28
  page.drawText('JOB DESCRIPTION', { x: 42, y, size: 8, font: bold, color: orange })
  y -= 19
  const words = body.job_description.split(/\s+/); let line='';
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (regular.widthOfTextAtSize(next,9) > 500) { page.drawText(line,{x:42,y,size:9,font:regular,color:rgb(.75,.77,.8)}); y-=14; line=word } else line=next }
  if (line) { page.drawText(line,{x:42,y,size:9,font:regular,color:rgb(.75,.77,.8)}); y-=14 }
  y -= 25
  const rows = [['Labour', money(Number(body.labour)||0)], ['Parts', money(Number(body.parts)||0)]]
  for (const [label,value] of rows) { page.drawText(label,{x:42,y,size:10,font:regular,color:rgb(.86,.87,.89)}); page.drawText(value,{x:470,y,size:10,font:regular,color:rgb(.86,.87,.89)}); y-=24 }
  page.drawLine({ start:{x:42,y:y+8},end:{x:553,y:y+8},thickness:1,color:rgb(.18,.2,.23)}); y-=12
  page.drawText('Subtotal',{x:42,y,size:9,font:bold,color:rgb(.65,.67,.7)}); page.drawText(money(subtotal),{x:470,y,size:9,font:bold,color:rgb(.65,.67,.7)}); y-=21
  page.drawText(`VAT (${Number(body.vat_rate)||0}%)`,{x:42,y,size:9,font:regular,color:rgb(.65,.67,.7)}); page.drawText(money(vatAmount),{x:470,y,size:9,font:regular,color:rgb(.65,.67,.7)}); y-=30
  page.drawText('TOTAL',{x:42,y,size:13,font:bold,color:rgb(1,1,1)}); page.drawText(money(total),{x:460,y,size:13,font:bold,color:orange})
  page.drawText('Thank you for trusting MHR Auto Services.',{x:42,y:58,size:9,font:regular,color:rgb(.45,.47,.5)})
  return doc.save()
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const { results } = await env.DB.prepare('SELECT id, invoice_number, customer_name, vehicle, total, status, pdf_key, created_at FROM invoices ORDER BY created_at DESC').all()
  return json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const body: InvoiceBody = await request.json<InvoiceBody>().catch(() => ({} as InvoiceBody))
  if (!body.customer_name || !body.vehicle || !body.job_description) return json({ error: 'Customer, vehicle and job description are required' }, { status: 400 })
  const labour = Number(body.labour)||0, parts = Number(body.parts)||0, vatRate = Number(body.vat_rate)||0
  const subtotal = labour + parts, vatAmount = subtotal * vatRate / 100, total = subtotal + vatAmount
  const seq = await env.DB.prepare('SELECT COUNT(*) AS count FROM invoices').first<{count:number}>()
  const invoiceNumber = `${env.INVOICE_PREFIX || 'MHR'}-${new Date().getFullYear()}-${String((seq?.count || 0) + 1).padStart(4,'0')}`

  let logoBytes: Uint8Array | undefined
  try {
    const logoResponse = await fetch(new URL('/logo.jpg', request.url).toString())
    if (logoResponse.ok) logoBytes = new Uint8Array(await logoResponse.arrayBuffer())
  } catch {
    // Logo is optional; continue generating the invoice without it if unavailable.
  }

  const pdf = await buildPdf(env, invoiceNumber, { ...body, customer_name: body.customer_name, vehicle: body.vehicle, job_description: body.job_description }, total, vatAmount, subtotal, logoBytes)
  const pdfKey = `invoices/${invoiceNumber}.pdf`
  await env.MEDIA.put(pdfKey, pdf, { httpMetadata: { contentType: 'application/pdf' } })
  const inserted = await env.DB.prepare(`INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, vehicle, job_description, labour, parts, vat_rate, subtotal, vat_amount, total, pdf_key, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')`).bind(invoiceNumber, body.customer_name, body.customer_email || '', body.customer_phone || '', body.vehicle, body.job_description, labour, parts, vatRate, subtotal, vatAmount, total, pdfKey).run()
  const invoiceId = Number(inserted.meta.last_row_id)
  for (const key of body.image_keys || []) await env.DB.prepare('INSERT INTO invoice_images (invoice_id, image_key) VALUES (?, ?)').bind(invoiceId, key).run()
  return json({ id: invoiceId, invoiceNumber, pdfKey, total, previewUrl: `/api/invoice-pdf?key=${encodeURIComponent(pdfKey)}` }, { status: 201 })
}
