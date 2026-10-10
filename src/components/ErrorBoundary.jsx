import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo)
  }

  handleReset = () => {
    localStorage.removeItem('cpms_user')
    this.setState({ hasError: false, error: null })
    window.location.href = '/login'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--cream-50, #faf9f6)',
            padding: 24,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 500,
              padding: 32,
              borderRadius: 12,
              background: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '1.4rem',
                fontWeight: 700,
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              Something went wrong loading the page
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred in the application context.'}
            </p>

            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: '#d4af37',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Reset Session & Go to Login
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
