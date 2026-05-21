import { Router } from 'express'
import { supabase } from '../db/supabase.js'
import { requireAuth } from '../middleware/auth.js'

export const achievementsRouter = Router()

async function broadcastKingdomUnlocked(workspaceId, payload) {
  const url = `${process.env.SUPABASE_URL}/realtime/v1/api/broadcast`
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ topic: `workspace:${workspaceId}`, event: 'kingdom_unlocked', payload }],
    }),
  })
}

// GET /achievements?kingdom_id=
achievementsRouter.get('/', requireAuth, async (req, res) => {
  const { workspaceId } = req.user
  const { kingdom_id } = req.query

  let query = supabase
    .from('achievements')
    .select('*, creator:created_by(id,display_name), completer:completed_by(id,display_name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (kingdom_id) query = query.eq('kingdom_id', kingdom_id)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /achievements
achievementsRouter.post('/', requireAuth, async (req, res) => {
  const { workspaceId, userId } = req.user
  const { kingdom_id, title, note } = req.body
  if (!kingdom_id || !title?.trim()) {
    return res.status(400).json({ error: 'kingdom_id and title required' })
  }

  const { data, error } = await supabase
    .from('achievements')
    .insert({ workspace_id: workspaceId, kingdom_id, title: title.trim(), note: note || null, created_by: userId })
    .select('*, creator:created_by(id,display_name)')
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PATCH /achievements/:id/complete
achievementsRouter.patch('/:id/complete', requireAuth, async (req, res) => {
  const { workspaceId, userId } = req.user
  const { id } = req.params

  const { data, error } = await supabase.rpc('complete_achievement', {
    p_id: id,
    p_user_id: userId,
    p_workspace_id: workspaceId,
  })

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) {
    const { data: existing } = await supabase
      .from('achievements')
      .select('*, completer:completed_by(id,display_name)')
      .eq('id', id)
      .single()
    return res.status(409).json({ error: 'Already completed', achievement: existing })
  }

  const achievement = data[0]

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('achievement_threshold')
    .eq('id', workspaceId)
    .single()

  const { count } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('kingdom_id', achievement.kingdom_id)
    .not('completed_at', 'is', null)

  const threshold = workspace?.achievement_threshold ?? 10
  let newKingdomUnlocked = false
  let journeyComplete = false
  let unlockedKingdom = null

  if (count >= threshold) {
    const { data: currentKingdom } = await supabase
      .from('kingdoms')
      .select('order')
      .eq('id', achievement.kingdom_id)
      .single()

    const { data: nextKingdom } = await supabase
      .from('kingdoms')
      .select('*')
      .eq('order', currentKingdom.order + 1)
      .is('unlocked_at', null)
      .single()

    if (nextKingdom) {
      const now = new Date().toISOString()
      await supabase.from('kingdoms').update({ unlocked_at: now }).eq('id', nextKingdom.id)
      newKingdomUnlocked = true
      unlockedKingdom = { ...nextKingdom, unlocked_at: now }

      await broadcastKingdomUnlocked(workspaceId, { kingdom: unlockedKingdom })
    } else {
      const { data: higherKingdom } = await supabase
        .from('kingdoms')
        .select('id')
        .gt('order', currentKingdom.order)
        .limit(1)
        .single()

      if (!higherKingdom) {
        journeyComplete = true
        await broadcastKingdomUnlocked(workspaceId, { kingdom: null, journeyComplete: true })
      }
    }
  }

  res.json({ achievement, newKingdomUnlocked, journeyComplete, kingdom: unlockedKingdom })
})

// DELETE /achievements/:id
achievementsRouter.delete('/:id', requireAuth, async (req, res) => {
  const { userId, workspaceId } = req.user
  const { id } = req.params

  const { data: existing } = await supabase
    .from('achievements')
    .select('created_by, completed_at')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (!existing) return res.status(404).json({ error: 'Not found' })
  if (existing.created_by !== userId) return res.status(403).json({ error: 'Not your achievement' })
  if (existing.completed_at) return res.status(400).json({ error: 'Cannot delete completed achievement' })

  const { error } = await supabase.from('achievements').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})
