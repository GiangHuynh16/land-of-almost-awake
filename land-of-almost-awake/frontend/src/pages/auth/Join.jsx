import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAppStore } from '../../store/useAppStore.js'

export default function Join() {
  const [form, setForm] = useState({ display_name: '', email: '', password: '', invite_code: '' })
  const [error, setError] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.join(form)
      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-shell">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 28, color: 'rgba(200, 156, 90, 0.75)', marginBottom: 12, lineHeight: 1 }}>☽</div>
        <div className="serif" style={{ fontSize: 28, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
          Join the journey
        </div>
        <div className="mono" style={{ marginTop: 8, fontSize: 9, letterSpacing: '0.38em', color: 'rgba(200, 156, 90, 0.65)' }}>
          ENTER YOUR COMPANION'S CODE
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
        <input
          className="auth-input"
          placeholder="your name"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          required
        />
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
        <input
          className="auth-input"
          placeholder="invite code"
          value={form.invite_code}
          onChange={(e) => setForm({ ...form, invite_code: e.target.value.toUpperCase() })}
          style={{ letterSpacing: '0.28em', textTransform: 'uppercase' }}
          required
        />
        {error && (
          <p className="mono" style={{ fontSize: 10, color: 'rgba(228, 137, 200, 0.85)', letterSpacing: '0.18em', textAlign: 'center', margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" className="auth-btn" style={{ marginTop: 4 }}>
          Join workspace
        </button>
      </form>

      <p className="mono" style={{ marginTop: 22, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(200, 156, 90, 0.55)', textAlign: 'center' }}>
        No code?{' '}
        <Link to="/auth/signup" className="auth-nav-link">Create a new world</Link>
      </p>
    </div>
  )
}
