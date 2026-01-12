import { useState } from 'react'
import { forgotPassword, resetPassword } from './services/auth.api'

type Page = 'home' | 'forgot' | 'reset' | 'account'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const btnStyle = { padding: '12px 24px', backgroundColor: '#e94560', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'block', width: '200px' }
  const btnSecondary = { ...btnStyle, backgroundColor: '#0f3460' }
  const inputStyle = { padding: '10px', width: '300px', display: 'block', marginBottom: '10px', borderRadius: '4px', border: '1px solid #333' }

  async function handleForgotPassword() {
    setLoading(true)
    setMessage('')
    try {
      const result = await forgotPassword(email)
      setMessage('✓ ' + (result.message || 'Reset link sent! Check Docker logs for the link.'))
    } catch (err: any) {
      setMessage('✗ ' + (err.message || 'Failed to send reset link'))
    }
    setLoading(false)
  }

  async function handleResetPassword() {
    setLoading(true)
    setMessage('')
    try {
      const result = await resetPassword(token, newPassword)
      setMessage('✓ ' + (result.message || 'Password reset successfully!'))
    } catch (err: any) {
      setMessage('✗ ' + (err.message || 'Failed to reset password'))
    }
    setLoading(false)
  }

  if (page === 'forgot') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', padding: '40px' }}>
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a reset link.</p>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <button onClick={handleForgotPassword} disabled={loading} style={btnStyle}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
        {message && <p style={{ marginTop: '10px', color: message.startsWith('✓') ? '#4ade80' : '#f87171' }}>{message}</p>}
        <p style={{ marginTop: '20px' }}><button onClick={() => { setPage('home'); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer' }}>← Back</button></p>
      </div>
    )
  }

  if (page === 'reset') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', padding: '40px' }}>
        <h1>Reset Password</h1>
        <p>Enter the token from your email and your new password.</p>
        <input type="text" placeholder="Token from email link" value={token} onChange={e => setToken(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleResetPassword} disabled={loading} style={btnStyle}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        {message && <p style={{ marginTop: '10px', color: message.startsWith('✓') ? '#4ade80' : '#f87171' }}>{message}</p>}
        <p style={{ marginTop: '20px' }}><button onClick={() => { setPage('home'); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer' }}>← Back</button></p>
      </div>
    )
  }

  if (page === 'account') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', padding: '40px' }}>
        <h1>Account</h1>
        <p>Login first to see your account info.</p>
        <button onClick={() => { setPage('home'); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer' }}>← Back</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', color: 'white' }}>
      <div style={{ backgroundColor: '#16213e', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
        <h1>StreamFlix</h1>
        <p style={{ color: '#888', marginBottom: '20px' }}>Test the auth pages:</p>
        <button onClick={() => setPage('forgot')} style={btnStyle}>Forgot Password</button>
        <button onClick={() => setPage('reset')} style={btnSecondary}>Reset Password</button>
        <button onClick={() => setPage('account')} style={btnSecondary}>Account</button>
      </div>
    </div>
  )
}
