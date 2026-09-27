import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAppStore } from '../../store/useAppStore.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.login(form)
      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-shell">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 28, color: 'rgba(200, 156, 90, 0.75)', marginBottom: 12, lineHeight: 1 }}>☽</div>
        <div className="serif" style={{ fontSize: 28, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
          Return to the world
        </div>
        <div className="mono" style={{ marginTop: 8, fontSize: 9, letterSpacing: '0.38em', color: 'rgba(200, 156, 90, 0.65)' }}>
          THE LAND OF ALMOST AWAKE
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
        <input
          className="auth-input"
          type="email"
          placeholder="your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && (
          <p className="mono" style={{ fontSize: 10, color: 'rgba(228, 137, 200, 0.85)', letterSpacing: '0.18em', textAlign: 'center', margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" className="auth-btn" style={{ marginTop: 4 }}>
          Enter
        </button>
      </form>

      <p className="mono" style={{ marginTop: 22, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(200, 156, 90, 0.55)', textAlign: 'center' }}>
        New here?{' '}
        <Link to="/auth/signup" className="auth-nav-link">Begin your journey</Link>
      </p>
    </div>
  )
}
