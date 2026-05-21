import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAppStore } from '../store/useAppStore.js'

export function useRealtimeSync(workspaceId) {
  const addAchievement = useAppStore((s) => s.addAchievement)
  const updateAchievement = useAppStore((s) => s.updateAchievement)
  const removeAchievement = useAppStore((s) => s.removeAchievement)
  const triggerUnlock = useAppStore((s) => s.triggerUnlock)

  useEffect(() => {
    if (!workspaceId) return

    const tableChannel = supabase
      .channel(`achievements:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => addAchievement(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'achievements',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => updateAchievement(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'achievements',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => removeAchievement(payload.old.id)
      )
      .subscribe()

    const broadcastChannel = supabase
      .channel(`workspace:${workspaceId}`)
      .on('broadcast', { event: 'kingdom_unlocked' }, ({ payload }) => {
        triggerUnlock(payload.kingdom, payload.journeyComplete || false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(tableChannel)
      supabase.removeChannel(broadcastChannel)
    }
  }, [workspaceId, addAchievement, updateAchievement, removeAchievement, triggerUnlock])
}
