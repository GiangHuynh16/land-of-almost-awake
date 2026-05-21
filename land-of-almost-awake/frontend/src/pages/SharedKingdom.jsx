import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { api } from '../lib/api.js'
import { AddAchievementModal } from '../components/AddAchievementModal.jsx'
import { KINGDOM_COLORS } from '../lib/constants.js'

export default function SharedKingdom() {
  const navigate = useNavigate()
  const sharedKingdom = useAppStore((s) => s.sharedKingdom)
  const achievements = useAppStore((s) => s.achievements)
  const activeKingdomId = useAppStore((s) => s.activeKingdomId)
  const activeScope = useAppStore((s) => s.activeScope)
  const loadAchievements = useAppStore((s) => s.loadAchievements)
  const addAchievement = useAppStore((s) => s.addAchievement)
  const updateAchievement = useAppStore((s) => s.updateAchievement)
  const removeAchievement = useAppStore((s) => s.removeAchievement)

  const [showModal, setShowModal] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)
  const [longPressId, setLongPressId] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (sharedKingdom && (activeKingdomId !== sharedKingdom.id || activeScope !== 'shared')) {
      loadAchievements(sharedKingdom.id, 'shared')
    }
  }, [sharedKingdom?.id, activeKingdomId, activeScope, loadAchievements])

  const colors = sharedKingdom ? KINGDOM_COLORS[sharedKingdom.name] : null

  async function handleComplete(achievement) {
    if (completing) return
    setCompleting(achievement.id)
    try {
      const result = await api.completeAchievement(achievement.id)
      updateAchievement(result.achievement)
    } catch (err) {
      if (err.message !== 'Already completed') console.error(err)
    } finally {
      setCompleting(null)
    }
  }

  async function handleDelete(achievement) {
    try {
      await api.deleteAchievement(achievement.id)
      removeAchievement(achievement.id)
    } catch (err) {
      console.error(err)
    }
  }

  if (!sharedKingdom) return null

  return (
    <div className="h-full flex flex-col max-w-xl mx-auto px-4 py-6 gap-4" style={{ color: '#F7F1FF' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-xl transition-colors"
          style={{ color: '#8A9BB8' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors?.accent, fontFamily: 'Georgia, serif' }}>
            {sharedKingdom.name}
          </h1>
          <p className="text-sm italic" style={{ color: '#8A9BB8' }}>{sharedKingdom.meaning}</p>
          <span
            className="text-xs uppercase tracking-widest px-2 py-0.5 rounded border mt-1 inline-block"
            style={{ color: colors?.glow, borderColor: colors?.accent, opacity: 0.8 }}
          >
            ∞ Shared
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {achievements.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: '#8A9BB8' }}>
            No shared achievements yet. Add your first one!
          </p>
        )}
        {achievements.map((a) => {
          const isCompleted = !!a.completed_at
          const isExpanded = expandedNote === a.id

          return (
            <div
              key={a.id}
              className="rounded-lg p-3 border transition-all select-none"
              style={{
                backgroundColor: isCompleted ? 'rgba(22,32,64,0.6)' : '#162040',
                borderColor: '#243060',
              }}
              onPointerDown={(e) => {
                if (isCompleted) return
                if (e.target.tagName === 'BUTTON') return
                const timer = setTimeout(() => {
                  if (mountedRef.current) setLongPressId(a.id)
                }, 600)
                const cancel = () => { clearTimeout(timer); window.removeEventListener('pointerup', cancel) }
                window.addEventListener('pointerup', cancel, { once: true })
              }}
              onPointerUp={() => setTimeout(() => setLongPressId(null), 2000)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {!isCompleted && (
                    <button
                      onClick={() => handleComplete(a)}
                      disabled={completing === a.id}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors disabled:opacity-40"
                      style={{ borderColor: '#8A9BB8' }}
                    />
                  )}
                  {isCompleted && (
                    <span className="mt-0.5 flex-shrink-0" style={{ color: colors?.glow }}>✦</span>
                  )}
                  <div className="flex-1">
                    <p className="text-sm" style={{
                      color: isCompleted ? '#8A9BB8' : '#F7F1FF',
                      textDecoration: isCompleted ? 'line-through' : 'none'
                    }}>
                      {a.title}
                    </p>
                    {a.note && (
                      <button
                        onClick={() => setExpandedNote(isExpanded ? null : a.id)}
                        className="text-xs mt-0.5"
                        style={{ color: '#8A9BB8' }}
                      >
                        {isExpanded ? 'hide note ▲' : 'note ▼'}
                      </button>
                    )}
                    {isExpanded && a.note && (
                      <p className="text-xs mt-1 italic" style={{ color: '#8A9BB8' }}>{a.note}</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: '#3a4a6a' }}>
                      by {a.creator?.display_name}
                      {isCompleted && a.completer && ` · done by ${a.completer.display_name}`}
                    </p>
                  </div>
                </div>
                {!isCompleted && longPressId === a.id && (
                  <button
                    onClick={() => { handleDelete(a); setLongPressId(null) }}
                    className="text-red-400 text-xs border border-red-800 rounded px-2 py-0.5 flex-shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg"
        style={{ backgroundColor: colors?.accent, color: '#0D1B3E' }}
      >
        +
      </button>

      {showModal && (
        <AddAchievementModal
          kingdomId={sharedKingdom.id}
          isShared={true}
          onClose={() => setShowModal(false)}
          onAdded={addAchievement}
        />
      )}
    </div>
  )
}
