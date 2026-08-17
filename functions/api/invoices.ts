import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { json, requireAdmin, type Env } from '../_middleware'

type InvoiceBody = {
  invoice_number?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_address?: string
  vehicle?: string
  vehicle_reg?: string
  mileage?: string | number
  job_description?: string
  labour?: number
  parts?: number
  vat_rate?: number
  image_keys?: string[]
}

function money(value: number) { return `£${value.toFixed(2)}` }
function dateUk() { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` }

async function buildPdf(env: Env, invoiceNumber: string, body: Required<Pick<InvoiceBody, 'customer_name' | 'vehicle' | 'job_description'>> & InvoiceBody, total: number, vatAmount: number, subtotal: number, logoBytes?: Uint8Array) {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const page = doc.addPage([595.28, 841.89])
  const W = page.getWidth(); const H = page.getHeight()
  const black = rgb(0.16, 0.16, 0.16); const grey = rgb(0.38, 0.38, 0.38); const line = rgb(0.72, 0.72, 0.72); const white = rgb(1, 1, 1)
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: white })
  if (logoBytes?.length) {
    try {
      const logo = await doc.embedJpg(logoBytes)
      const scale = Math.min(125 / logo.width, 105 / logo.height)
      const logoW = logo.width * scale; const logoH = logo.height * scale
      page.drawImage(logo, { x: (W - logoW) / 2, y: 735, width: logoW, height: logoH })
    } catch { page.drawText(env.GARAGE_NAME || 'MHR Auto Services', { x: 42, y: 755, size: 20, font: bold, color: black }) }
  } else page.drawText(env.GARAGE_NAME || 'MHR Auto Services', { x: 42, y: 755, size: 20, font: bold, color: black })
  page.drawText('INVOICE', { x: 490, y: 690, size: 22, font: bold, color: grey })
  let customerY = 655
  page.drawText(body.customer_name, { x: 24, y: customerY, size: 10, font: regular, color: black }); customerY -= 14
  if (body.customer_address) for (const addressLine of String(body.customer_address).split(/\r?\n/).slice(0, 3)) { page.drawText(addressLine, { x: 24, y: customerY, size: 10, font: regular, color: black }); customerY -= 14 }
  const metaX = 350, metaY = 610, metaW = 220, labelW = 105, rowH = 25
  const metaRows = [['DATE', dateUk()], ['VEHICLE REG', body.vehicle_reg || '—'], ['VEHICLE', body.vehicle || '—'], ['MILEAGE', body.mileage !== undefined && body.mileage !== '' ? String(body.mileage) : '—'], ['INV NO', invoiceNumber]]
  metaRows.forEach(([label, value], i) => {
    const y = metaY - i * rowH
    page.drawRectangle({ x: metaX, y: y - rowH + 1, width: metaW, height: rowH, borderColor: line, borderWidth: 0.7 })
    page.drawLine({ start: { x: metaX + labelW, y: y - rowH + 1 }, end: { x: metaX + labelW, y }, thickness: 0.7, color: line })
    page.drawText(label, { x: metaX + 8, y: y - 17, size: 8, font: bold, color: black })
    const size = value.length > 25 ? 7 : 8; const valueWidth = regular.widthOfTextAtSize(value, size)
    page.drawText(value, { x: metaX + metaW - 8 - valueWidth, y: y - 17, size, font: regular, color: black })
  })
  const boxX = 24, boxW = W - 48, jobTop = 500, jobH = 72
  page.drawRectangle({ x: boxX, y: jobTop - jobH, width: boxW, height: jobH, borderColor: line, borderWidth: 0.8 })
  page.drawText('JOB DESCRIPTION', { x: boxX + 8, y: jobTop - 16, size: 8, font: bold, color: black })
  page.drawLine({ start: { x: boxX, y: jobTop - 25 }, end: { x: boxX + boxW, y: jobTop - 25 }, thickness: 0.7, color: line })
  let descY = jobTop - 40; let descLine = ''
  for (const word of body.job_description.split(/\s+/)) {
    const next = descLine ? `${descLine} ${word}` : word
    if (regular.widthOfTextAtSize(next, 9) > boxW - 16) { if (descLine) page.drawText(descLine, { x: boxX + 8, y: descY, size: 9, font: regular, color: black }); descY -= 13; descLine = word } else descLine = next
  }
  if (descLine) page.drawText(descLine, { x: boxX + 8, y: descY, size: 9, font: regular, color: black })
  const tableX = 24, tableW = W - 48, amountW = 95, tableTop = 395, headerH = 31, rowH2 = 42
  page.drawRectangle({ x: tableX, y: tableTop - headerH, width: tableW, height: headerH, borderColor: line, borderWidth: 0.8 })
  page.drawText('INVOICE', { x: tableX + tableW / 2 - 26, y: tableTop - 21, size: 9, font: bold, color: black })
  page.drawRectangle({ x: tableX, y: tableTop - headerH - rowH2, width: tableW, height: rowH2, borderColor: line, borderWidth: 0.8 })
  page.drawLine({ start: { x: tableX + tableW - amountW, y: tableTop - headerH - rowH2 }, end: { x: tableX + tableW - amountW, y: tableTop }, thickness: 0.8, color: line })
  page.drawText('ITEM', { x: tableX + 8, y: tableTop - headerH - 20, size: 8, font: bold, color: black })
  page.drawText('AMOUNT (£)', { x: tableX + tableW - amountW + 8, y: tableTop - headerH - 20, size: 8, font: bold, color: black })
  page.drawText((body.job_description || 'Workshop services').slice(0, 150), { x: tableX + 8, y: tableTop - headerH - 28, size: body.job_description.length > 90 ? 8 : 9, font: regular, color: black })
  const amountText = money(subtotal); page.drawText(amountText, { x: tableX + tableW - 8 - regular.widthOfTextAtSize(amountText, 9), y: tableTop - headerH - 28, size: 9, font: regular, color: black })
  let totalsY = tableTop - headerH - rowH2 - 26
  if (vatAmount > 0) { const vatText = money(vatAmount); page.drawText(`VAT (${Number(body.vat_rate) || 0}%)`, { x: tableX + tableW - amountW - 105, y: totalsY, size: 8, font: regular, color: grey }); page.drawText(vatText, { x: tableX + tableW - 8 - regular.widthOfTextAtSize(vatText, 8), y: totalsY, size: 8, font: regular, color: grey }); totalsY -= 18 }
  const totalText = money(total)
  page.drawText('TOTAL DUE', { x: tableX + tableW - amountW - 30, y: totalsY, size: 9, font: bold, color: black })
  page.drawText(totalText, { x: tableX + tableW - 8 - bold.widthOfTextAtSize(totalText, 9), y: totalsY, size: 9, font: bold, color: black })
  const paymentY = 190
  page.drawText('PAYMENT', { x: 24, y: paymentY, size: 9, font: bold, color: black })
  page.drawText('Any queries with this invoice, please contact me on 07535412429 or MHRautoservices@hotmail.com', { x: 24, y: paymentY - 28, size: 8.5, font: regular, color: black })
  page.drawText('Please make payment to:', { x: 24, y: paymentY - 53, size: 8.5, font: regular, color: black })
  page.drawText('MHR Auto Services', { x: 205, y: paymentY - 53, size: 8.5, font: regular, color: black })
  page.drawText('Account No: 32915844', { x: 335, y: paymentY - 53, size: 8.5, font: regular, color: black })
  page.drawText('Sort Code: 15-10-00', { x: 470, y: paymentY - 53, size: 8.5, font: regular, color: black })
  const thanks = 'Thank you for your business!'; page.drawText(thanks, { x: (W - bold.widthOfTextAtSize(thanks, 9)) / 2, y: 55, size: 9, font: bold, color: black })
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
  const labour = Number(body.labour) || 0, parts = Number(body.parts) || 0, vatRate = Number(body.vat_rate) || 0
  const suppliedInvoiceNumber = String(body.invoice_number || '').trim()
  const seq = await env.DB.prepare('SELECT COUNT(*) AS count FROM invoices').first<{count:number}>()
  const generatedInvoiceNumber = `${env.INVOICE_PREFIX || 'MHR'}-${new Date().getFullYear()}-${String((seq?.count || 0) + 1).padStart(4,'0')}`
  const invoiceNumber = suppliedInvoiceNumber || generatedInvoiceNumber
  const subtotal = labour + parts, vatAmount = subtotal * vatRate / 100, total = subtotal + vatAmount
  let logoBytes: Uint8Array | undefined
  try { const logoResponse = await fetch('https://raw.githubusercontent.com/DanOrm94/mhrautoservices/main/logo.jpg'); if (logoResponse.ok) logoBytes = new Uint8Array(await logoResponse.arrayBuffer()) } catch { /* logo is optional */ }
  const pdf = await buildPdf(env, invoiceNumber, { ...body, customer_name: body.customer_name, vehicle: body.vehicle, job_description: body.job_description }, total, vatAmount, subtotal, logoBytes)
  const pdfKey = `invoices/${invoiceNumber}.pdf`
  await env.MEDIA.put(pdfKey, pdf, { httpMetadata: { contentType: 'application/pdf' } })
  const inserted = await env.DB.prepare(`INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, vehicle, job_description, labour, parts, vat_rate, subtotal, vat_amount, total, pdf_key, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')`).bind(invoiceNumber, body.customer_name, body.customer_email || '', body.customer_phone || '', body.vehicle, body.job_description, labour, parts, vatRate, subtotal, vatAmount, total, pdfKey).run()
  const invoiceId = Number(inserted.meta.last_row_id)
  for (const key of body.image_keys || []) await env.DB.prepare('INSERT INTO invoice_images (invoice_id, image_key) VALUES (?, ?)').bind(invoiceId, key).run()
  return json({ id: invoiceId, invoiceNumber, pdfKey, total, previewUrl: `/api/invoice-pdf?key=${encodeURIComponent(pdfKey)}` }, { status: 201 })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await requireAdmin(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return json({ error: 'Invoice id is required' }, { status: 400 })
  const invoice = await env.DB.prepare('SELECT id, pdf_key FROM invoices WHERE id = ?').bind(id).first<{id:number; pdf_key:string | null}>()
  if (!invoice) return json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.pdf_key) await env.MEDIA.delete(invoice.pdf_key)
  await env.DB.prepare('DELETE FROM invoice_images WHERE invoice_id = ?').bind(id).run()
  await env.DB.prepare('DELETE FROM invoices WHERE id = ?').bind(id).run()
  return json({ ok: true })
}
