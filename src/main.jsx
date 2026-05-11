import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Tambahkan baris ini untuk registrasi service worker
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Aplikasi diperbarui. Refresh sekarang?')) {
      updateSW(true)
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)