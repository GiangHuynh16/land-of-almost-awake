import { useState } from 'react'
import { api } from '../lib/api.js'

export function AddAchievementModal({ kingdomId, onClose, onAdded }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const achievement = await api.createAchievement({
        kingdom_id: kingdomId,
        title: title.trim(),
        note: note.trim() || undefined,
      })
      onAdded(achievement)
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-amber-100">New achievement</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
            placeholder="What did you do together?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {showNote ? (
            <textarea
              className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500 resize-none h-20"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-stone-400 text-sm text-left hover:text-amber-300 transition-colors"
            >
              + add note
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 rounded py-2 transition-colors"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </form>
      </div>
    </div>
  )
}
