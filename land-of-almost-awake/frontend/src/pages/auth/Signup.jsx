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
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <h1 className="text-2xl font-bold">Your journey begins</h1>
        <p className="text-amber-200">Share this code with your companion:</p>
        <div className="text-4xl font-mono tracking-widest bg-amber-900/40 px-8 py-4 rounded-lg border border-amber-700">
          {inviteCode}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors"
        >
          Enter the world
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h1 className="text-2xl font-bold">Begin your journey</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Your name"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          required
        />
        <input
          type="email"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm text-stone-400">Achievements to unlock each kingdom (1–50)</label>
          <input
            type="number"
            min="1"
            max="50"
            className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100"
            value={form.achievement_threshold}
            onChange={(e) => setForm({ ...form, achievement_threshold: parseInt(e.target.value) || 10 })}
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-amber-700 hover:bg-amber-600 rounded py-2 transition-colors">
          Create workspace
        </button>
      </form>
      <p className="text-stone-400 text-sm">
        Have an invite code? <Link to="/auth/join" className="text-amber-400 hover:underline">Join here</Link>
      </p>
    </div>
  )
}
