import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Naffy Scents application render failed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: '32px', background: '#0A0A0A', color: '#E8D9B8', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: '720px', margin: '10vh auto' }}>
            <p style={{ color: '#C97373', letterSpacing: '0.18em', fontSize: '11px', textTransform: 'uppercase' }}>NAFFY SCENTS</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400 }}>The storefront could not finish loading.</h1>
            <p style={{ color: '#D6C9B0', lineHeight: 1.6 }}>A browser-side application error was caught. The technical detail below will help identify the failing component.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: '16px', border: '1px solid #6B2424', background: '#121212', color: '#F0D8D8', fontSize: '13px' }}>{String(this.state.error?.stack || this.state.error?.message || this.state.error)}</pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '12px 20px', background: '#6B2424', color: '#E8D9B8', border: 0, cursor: 'pointer' }}>Reload storefront</button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
)
