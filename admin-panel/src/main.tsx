import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App.tsx'
import '@styles/index.css'

// Modern theme configuration with better colors
const theme = {
  token: {
    colorPrimary: '#6366f1', // Modern indigo
    colorSuccess: '#10b981', // Modern green
    colorWarning: '#f59e0b', // Modern amber
    colorError: '#ef4444',   // Modern red
    colorInfo: '#06b6d4',    // Modern cyan
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Layout: {
      siderBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', // Modern gradient
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'rgba(255, 255, 255, 0.05)',
      darkItemSelectedBg: 'rgba(99, 102, 241, 0.15)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      darkItemColor: '#cbd5e1',
      darkItemSelectedColor: '#6366f1',
      darkItemHoverColor: '#ffffff',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
) 