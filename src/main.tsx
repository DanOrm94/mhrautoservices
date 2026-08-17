import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

const nativeOpen = window.open.bind(window)
const nativeFetch = window.fetch.bind(window)

let lastCreatedInvoice: { id: number; invoiceNumber: string; pdfKey: string; total: number } | null = null

function invoiceEmailEnabled() {
  return document.querySelector<HTMLInputElement>('[data-invoice-email-option]')?.checked === true
}

function setInvoiceEmailStatus(message: string, error = false) {
  const status = document.querySelector<HTMLElement>('[data-invoice-email-status]')
  if (!status) return
  status.textContent = message
  status.style.color = error ? '#ff7a45' : '#8fd19e'
}

function installInvoiceEmailOption() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
  const button = buttons.find(item => item.textContent?.includes('Create & preview PDF'))
  const form = button?.closest('form')
  if (!form || form.querySelector('[data-invoice-email-option]')) return

  const option = document.createElement('label')
  option.style.cssText = 'display:flex;align-items:center;gap:10px;margin:4px 0 16px;padding:12px 14px;border:1px solid #2b2f35;background:#0a0c0f;color:#c7cbd1;font-size:12px;line-height:1.4;cursor:pointer;text-transform:none;letter-spacing:normal'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.setAttribute('data-invoice-email-option', '')
  checkbox.style.cssText = 'width:16px;height:16px;accent-color:#ff5a1f;flex:0 0 auto'

  const text = document.createElement('span')
  text.textContent = 'Email a copy of this PDF to my admin email'

  option.append(checkbox, text)
  form.insertBefore(option, button)

  const status = document.createElement('div')
  status.setAttribute('data-invoice-email-status', '')
  status.style.cssText = 'min-height:18px;margin:-4px 0 14px;font-size:12px'
  form.insertBefore(status, button)
}

const observer = new MutationObserver(installInvoiceEmailOption)
observer.observe(document.body, { childList: true, subtree: true })
window.setTimeout(installInvoiceEmailOption, 0)

window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await nativeFetch(input, init)
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString()
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()

  if (method === 'POST' && url.includes('/api/invoices') && response.ok) {
    const clone = response.clone()
    void clone.json().then(data => {
      if (data?.id && data?.invoiceNumber && data?.pdfKey) {
        lastCreatedInvoice = {
          id: Number(data.id),
          invoiceNumber: String(data.invoiceNumber),
          pdfKey: String(data.pdfKey),
          total: Number(data.total) || 0,
        }
      }
    }).catch(() => undefined)
  }

  return response
}) as typeof window.fetch

window.open = ((url?: string | URL, target?: string, features?: string) => {
  const value = typeof url === 'string' ? url : url?.toString() || ''
  if (!value.includes('/api/invoice-pdf')) return nativeOpen(url, target, features)

  const popup = nativeOpen('about:blank', target, features)
  const token = sessionStorage.getItem('mhr_admin_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined

  void fetch(value, { headers })
    .then(async response => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error || `Could not load invoice (${response.status})`)
      }
      return response.blob()
    })
    .then(blob => {
      if (!popup) return
      const blobUrl = URL.createObjectURL(blob)
      popup.location.href = blobUrl
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    })
    .catch(error => {
      if (!popup) return
      popup.document.body.innerHTML = `<p style="font-family:sans-serif;padding:24px">${error instanceof Error ? error.message : 'Could not load invoice PDF.'}</p>`
    })

  if (invoiceEmailEnabled() && lastCreatedInvoice && token) {
    const invoice = lastCreatedInvoice
    setInvoiceEmailStatus('Sending PDF to your admin email…')
    void nativeFetch('/api/send-invoice', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(invoice),
    })
      .then(async response => {
        const data = await response.json().catch(() => ({})) as { error?: string }
        if (!response.ok) throw new Error(data.error || 'Could not email invoice')
        setInvoiceEmailStatus('PDF emailed to your admin email.')
      })
      .catch(error => setInvoiceEmailStatus(error instanceof Error ? error.message : 'Could not email invoice', true))
  }

  return popup
}) as typeof window.open

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
