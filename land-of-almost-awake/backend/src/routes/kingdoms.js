import { Router } from 'express'
import { supabase } from '../db/supabase.js'
import { requireAuth } from '../middleware/auth.js'

export const kingdomsRouter = Router()

// GET /kingdoms — returns all 6 kingdoms with progress for current workspace
kingdomsRouter.get('/', requireAuth, async (req, res) => {
  const { workspaceId } = req.user

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('achievement_threshold')
    .eq('id', workspaceId)
    .single()

  const { data: kingdoms } = await supabase
    .from('kingdoms')
    .select('*')
    .order('order')

  const { data: completedRows } = await supabase
    .from('achievements')
    .select('kingdom_id')
    .eq('workspace_id', workspaceId)
    .not('completed_at', 'is', null)

  const countByKingdom = {}
  for (const row of completedRows || []) {
    countByKingdom[row.kingdom_id] = (countByKingdom[row.kingdom_id] || 0) + 1
  }

  const threshold = workspace?.achievement_threshold || 10

  const result = (kingdoms || []).map((k) => {
    const completed = countByKingdom[k.id] || 0
    const isUnlocked = !!k.unlocked_at
    const isDone = completed >= threshold

    let status
    if (!isUnlocked) {
      status = 'locked'
    } else if (isDone) {
      status = 'completed'
    } else {
      status = 'active'
    }
    return { ...k, completed_count: completed, threshold, status }
  })

  res.json(result)
})

// GET /kingdoms/partner — returns all kingdoms with partner's progress
kingdomsRouter.get('/partner', requireAuth, async (req, res) => {
  const { workspaceId, userId } = req.user

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('achievement_threshold')
    .eq('id', workspaceId)
    .single()

  const { data: kingdoms } = await supabase
    .from('kingdoms')
    .select('*')
    .order('order')

  // Find partner user in the same workspace
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('workspace_id', workspaceId)

  const partnerUser = users?.find((u) => u.id !== userId)

  const { data: completedRows } = await supabase
    .from('achievements')
    .select('kingdom_id, created_by')
    .eq('workspace_id', workspaceId)
    .not('completed_at', 'is', null)

  // Count only achievements created by the partner
  const countByKingdom = {}
  for (const row of completedRows || []) {
    if (partnerUser && row.created_by === partnerUser.id) {
      countByKingdom[row.kingdom_id] = (countByKingdom[row.kingdom_id] || 0) + 1
    }
  }

  const threshold = workspace?.achievement_threshold || 10

  const result = (kingdoms || []).map((k) => {
    const completed = countByKingdom[k.id] || 0
    const isUnlocked = !!k.unlocked_at
    const isDone = completed >= threshold

    let status
    if (!isUnlocked) {
      status = 'locked'
    } else if (isDone) {
      status = 'completed'
    } else {
      status = 'active'
    }
    return { ...k, completed_count: completed, threshold, status }
  })

  res.json(result)
})
