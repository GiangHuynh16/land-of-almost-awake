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
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h1 className="text-2xl font-bold">Join the journey</h1>
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
        <input
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500 uppercase tracking-widest"
          placeholder="Invite code"
          value={form.invite_code}
          onChange={(e) => setForm({ ...form, invite_code: e.target.value.toUpperCase() })}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-amber-700 hover:bg-amber-600 rounded py-2 transition-colors">
          Join workspace
        </button>
      </form>
      <p className="text-stone-400 text-sm">
        No code? <Link to="/auth/signup" className="text-amber-400 hover:underline">Create a new world</Link>
      </p>
    </div>
  )
}
