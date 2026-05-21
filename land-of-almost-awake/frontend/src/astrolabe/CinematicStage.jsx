import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Astrolabe from './world/Astrolabe.jsx'
import { KINGDOMS } from './data.js'
import {
  anchorInCamera,
  resetCamera,
  runDiveZoom,
  zoomScaleForOrb,
} from './cameraZoom.js'

const KingdomDetail = lazy(() => import('./kingdom/KingdomDetail.jsx'))

const FADE_OUT_MS = 400
const FADE_IN_MS = 400

// world → diving → kingdom (giữ zoom, không reset) → leave-out → reset → leave-in → world
export default function CinematicStage() {
  const location = useLocation()
  const navigate = useNavigate()

  const initialKingdomId = parseKingdomFromPath(location.pathname)
  const [view, setView] = useState(initialKingdomId ? 'kingdom' : 'world')
  const [selectedId, setSelectedId] = useState(initialKingdomId)

  const originRef = useRef(null)
  const cameraRef = useRef(null)
  const zoomAnimRef = useRef(null)
  const diveFinishedRef = useRef(false)
  const selectedIdRef = useRef(selectedId)
  const viewRef = useRef(view)

  useEffect(() => {
    viewRef.current = view
  }, [view])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const cinematic = view === 'diving' || view === 'kingdom'
  const focusKingdom = view === 'diving' ? selectedId : null

  const stopZoom = useCallback(() => {
    zoomAnimRef.current?.cancel?.()
    zoomAnimRef.current = null
  }, [])

  const goToWorld = useCallback(() => {
    originRef.current = null
    setSelectedId(null)
    setView('world')
    navigate('/', { replace: true })
  }, [navigate])

  const startLeave = useCallback(() => {
    if (viewRef.current !== 'kingdom') return
    setView('leave-out')
  }, [])

  useEffect(() => {
    if (view !== 'leave-out') return
    const t = setTimeout(() => {
      resetCamera(cameraRef.current)
      stopZoom()
      setView('leave-in')
    }, FADE_OUT_MS)
    return () => clearTimeout(t)
  }, [view, stopZoom])

  useEffect(() => {
    if (view !== 'leave-in') return
    const t = setTimeout(goToWorld, FADE_IN_MS)
    return () => clearTimeout(t)
  }, [view, goToWorld])

  const handleSelect = useCallback((id, screenPos) => {
    if (view !== 'world') return
    stopZoom()
    diveFinishedRef.current = false
    originRef.current = screenPos
    setSelectedId(id)
    setView('diving')
  }, [view, stopZoom])

  const handleBack = useCallback(() => {
    startLeave()
  }, [startLeave])

  useEffect(() => {
    if (view !== 'diving') return

    const camera = cameraRef.current
    if (!camera) return

    diveFinishedRef.current = false
    const anchor = anchorInCamera(camera, originRef.current)
    const maxScale = zoomScaleForOrb(anchor.size)

    zoomAnimRef.current = runDiveZoom(camera, anchor, maxScale, {
      onComplete: () => {
        diveFinishedRef.current = true
        zoomAnimRef.current = null
        setView('kingdom')
        if (selectedIdRef.current) {
          navigate(`/kingdom/${selectedIdRef.current}`, { replace: true })
        }
      },
    })

    return () => {
      if (!diveFinishedRef.current) stopZoom()
    }
  }, [view, navigate, stopZoom])

  useEffect(() => {
    const k = parseKingdomFromPath(location.pathname)
    const t = setTimeout(() => {
      if (!k && viewRef.current === 'kingdom') {
        startLeave()
      } else if (k && viewRef.current === 'world') {
        originRef.current = null
        resetCamera(cameraRef.current)
        setSelectedId(k)
        setView('kingdom')
      }
    }, 0)
    return () => clearTimeout(t)
  }, [location.pathname, startLeave])

  const fadeOut = `opacity ${FADE_OUT_MS}ms ease`
  const fadeIn = `opacity ${FADE_IN_MS}ms ease`

  const showWorld = view === 'world' || view === 'diving' || view === 'kingdom' || view === 'leave-out' || view === 'leave-in'
  const worldOpacity = (view === 'kingdom' || view === 'leave-out') ? 0 : 1
  const worldTransition = view === 'leave-in' ? fadeIn : 'none'

  const showKingdom = (view === 'kingdom' || view === 'leave-out') && selectedId
  const kingdomOpacity = view === 'kingdom' ? 1 : 0

  return (
    <div className="stage" style={{
      background: 'radial-gradient(ellipse at 50% 50%, #0a0f30 0%, #060815 60%, #030414 100%)',
    }}>
      {showWorld && (
        <div className="camera-viewport">
          <div
            ref={cameraRef}
            className="camera-rig"
            style={{
              pointerEvents: view === 'world' ? 'auto' : 'none',
              zIndex: view === 'diving' || view === 'leave-in' ? 30 : 1,
              opacity: worldOpacity,
              transition: worldTransition,
            }}
          >
            <Astrolabe
              onSelectKingdom={handleSelect}
              dimExcept={focusKingdom}
              cinematic={cinematic}
            />
          </div>
        </div>
      )}

      {showKingdom && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          opacity: kingdomOpacity,
          transition: fadeOut,
          pointerEvents: view === 'kingdom' ? 'auto' : 'none',
        }}>
          <Suspense fallback={null}>
            <KingdomDetail kingdomId={selectedId} onBack={handleBack} />
          </Suspense>
        </div>
      )}
    </div>
  )
}

function parseKingdomFromPath(pathname) {
  const m = pathname.match(/^\/kingdom\/([^/]+)\/?$/)
  if (!m) return null
  const id = m[1]
  return KINGDOMS.some(k => k.id === id) ? id : null
}
