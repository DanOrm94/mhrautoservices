import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

const nativeOpen = window.open.bind(window)

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

  return popup
}) as typeof window.open

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
