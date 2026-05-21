import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { api } from '../lib/api.js'
import { AddAchievementModal } from '../components/AddAchievementModal.jsx'
import { KINGDOM_COLORS } from '../lib/constants.js'

export default function KingdomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const kingdoms = useAppStore((s) => s.kingdoms)
  const achievements = useAppStore((s) => s.achievements)
  const activeKingdomId = useAppStore((s) => s.activeKingdomId)
  const loadAchievements = useAppStore((s) => s.loadAchievements)
  const addAchievement = useAppStore((s) => s.addAchievement)
  const updateAchievement = useAppStore((s) => s.updateAchievement)
  const removeAchievement = useAppStore((s) => s.removeAchievement)
  const triggerUnlock = useAppStore((s) => s.triggerUnlock)
  const user = useAppStore((s) => s.user)

  const [showModal, setShowModal] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)
  const [longPressId, setLongPressId] = useState(null)

  const mountedRef = useRef(true)
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const kingdom = kingdoms.find((k) => k.id === id)
  const isActive = kingdom?.status === 'active'
  const colors = kingdom ? KINGDOM_COLORS[kingdom.name] : null
  const threshold = kingdom?.threshold || 10
  const completedCount = kingdom?.completed_count || 0

  useEffect(() => {
    if (id !== activeKingdomId) {
      loadAchievements(id)
    }
  }, [id, activeKingdomId, loadAchievements])

  async function handleComplete(achievement) {
    if (completing) return
    setCompleting(achievement.id)
    try {
      const result = await api.completeAchievement(achievement.id)
      updateAchievement(result.achievement)
      if (result.journeyComplete) {
        triggerUnlock(null, true)
      } else if (result.newKingdomUnlocked && result.kingdom) {
        triggerUnlock(result.kingdom, false)
      }
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

  if (!kingdom) return null

  const dots = Array.from({ length: threshold }, (_, i) => i < completedCount)

  return (
    <div className="h-full flex flex-col max-w-xl mx-auto px-4 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-stone-400 hover:text-amber-300 transition-colors text-xl"
        >
          ←
        </button>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors?.accent || '#f0e8d0' }}
          >
            {kingdom.name}
          </h1>
          <p className="text-stone-400 text-sm italic">{kingdom.meaning}</p>
          {kingdom.status === 'completed' && (
            <span
              className="text-xs uppercase tracking-widest px-2 py-0.5 rounded border mt-1 inline-block"
              style={{ color: colors?.glow, borderColor: colors?.accent, opacity: 0.8 }}
            >
              ✦ Completed
            </span>
          )}
        </div>
      </div>

      {/* Achievements list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {achievements.length === 0 && (
          <p className="text-stone-500 text-sm text-center mt-8">
            {isActive ? 'No achievements yet. Add your first one!' : 'No achievements recorded.'}
          </p>
        )}
        {achievements.map((a) => {
          const isCompleted = !!a.completed_at
          const isOwn = a.created_by === user?.id
          const isExpanded = expandedNote === a.id

          return (
            <div
              key={a.id}
              className={`rounded-lg p-3 border transition-all select-none ${
                isCompleted
                  ? 'bg-stone-800/60 border-stone-700'
                  : 'bg-stone-900 border-stone-700'
              }`}
              onPointerDown={() => {
                if (!isOwn || isCompleted || !isActive) return
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
                  {isActive && !isCompleted && (
                    <button
                      onClick={() => handleComplete(a)}
                      disabled={completing === a.id}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-stone-500 hover:border-amber-400 flex-shrink-0 transition-colors disabled:opacity-40"
                    />
                  )}
                  {isCompleted && (
                    <span className="mt-0.5 flex-shrink-0" style={{ color: colors?.glow || '#F5C04A' }}>✦</span>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${isCompleted ? 'text-stone-400 line-through' : 'text-amber-100'}`}>
                      {a.title}
                    </p>
                    {a.note && (
                      <button
                        onClick={() => setExpandedNote(isExpanded ? null : a.id)}
                        className="text-xs text-stone-500 hover:text-stone-300 mt-0.5"
                      >
                        {isExpanded ? 'hide note ▲' : 'note ▼'}
                      </button>
                    )}
                    {isExpanded && a.note && (
                      <p className="text-xs text-stone-400 mt-1 italic">{a.note}</p>
                    )}
                    <p className="text-xs text-stone-600 mt-1">
                      by {a.creator?.display_name}
                      {isCompleted && a.completer && ` · done by ${a.completer.display_name}`}
                    </p>
                  </div>
                </div>

                {isOwn && !isCompleted && isActive && longPressId === a.id && (
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

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center flex-wrap py-2">
        {dots.map((filled, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: filled ? colors?.accent : '#2a2018',
              border: `1px solid ${filled ? colors?.accent : '#3a2a10'}`,
            }}
          />
        ))}
      </div>

      {/* FAB */}
      {isActive && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-colors"
          style={{ backgroundColor: colors?.accent, color: '#1a1208' }}
        >
          +
        </button>
      )}

      {showModal && (
        <AddAchievementModal
          kingdomId={id}
          onClose={() => setShowModal(false)}
          onAdded={addAchievement}
        />
      )}
    </div>
  )
}
