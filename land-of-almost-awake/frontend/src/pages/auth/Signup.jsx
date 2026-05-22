import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAppStore } from '../../store/useAppStore.js'

export default function Signup() {
  const [form, setForm] = useState({ display_name: '', email: '', password: '', achievement_threshold: 10 })
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.signup(form)
      setAuth(data.token, data.user)
      setInviteCode(data.invite_code)
    } catch (err) {
      setError(err.message)
    }
  }

  if (inviteCode) {
    return (
      <div className="auth-shell" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: 'rgba(200, 156, 90, 0.75)', marginBottom: 12 }}>☽</div>
        <div className="serif" style={{ fontSize: 26, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.2 }}>
          Your journey begins
        </div>
        <div className="mono" style={{ marginTop: 10, fontSize: 9, letterSpacing: '0.34em', color: 'rgba(200, 156, 90, 0.6)' }}>
          SHARE THIS CODE WITH YOUR COMPANION
        </div>
        <div style={{
          marginTop: 28,
          padding: '18px 36px',
          background: 'rgba(7, 9, 30, 0.7)',
          border: '1px solid rgba(200, 156, 90, 0.5)',
          borderRadius: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 32,
          letterSpacing: '0.3em',
          color: 'var(--brass-light)',
        }}>
          {inviteCode}
        </div>
        <button
          onClick={() => navigate('/')}
          className="auth-btn"
          style={{ marginTop: 28, maxWidth: 260 }}
        >
          Enter the world
        </button>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 28, color: 'rgba(200, 156, 90, 0.75)', marginBottom: 12, lineHeight: 1 }}>☽</div>
        <div className="serif" style={{ fontSize: 28, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1 }}>
          Begin your journey
        </div>
        <div className="mono" style={{ marginTop: 8, fontSize: 9, letterSpacing: '0.38em', color: 'rgba(200, 156, 90, 0.65)' }}>
          THE LAND OF ALMOST AWAKE
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.28em', color: 'rgba(200, 156, 90, 0.55)', paddingLeft: 16 }}>
            ACHIEVEMENTS TO UNLOCK EACH KINGDOM (1–50)
          </div>
          <input
            className="auth-input"
            type="number"
            min="1"
            max="50"
            value={form.achievement_threshold}
            onChange={(e) => setForm({ ...form, achievement_threshold: parseInt(e.target.value) || 10 })}
          />
        </div>
        {error && (
          <p className="mono" style={{ fontSize: 10, color: 'rgba(228, 137, 200, 0.85)', letterSpacing: '0.18em', textAlign: 'center', margin: 0 }}>
            {error}
          </p>
        )}
        <button type="submit" className="auth-btn" style={{ marginTop: 4 }}>
          Create workspace
        </button>
      </form>

      <p className="mono" style={{ marginTop: 22, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(200, 156, 90, 0.55)', textAlign: 'center' }}>
        Have an invite code?{' '}
        <Link to="/auth/join" style={{ color: 'rgba(200, 156, 90, 0.9)', textDecoration: 'none' }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
          Join here
        </Link>
      </p>
    </div>
  )
}
