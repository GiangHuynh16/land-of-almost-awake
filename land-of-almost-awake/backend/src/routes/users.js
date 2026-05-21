import { Router } from 'express'
import { supabase } from '../db/supabase.js'
import { requireAuth } from '../middleware/auth.js'

export const usersRouter = Router()

// GET /users/partner
usersRouter.get('/partner', requireAuth, async (req, res) => {
  const { workspaceId, userId } = req.user

  const { data: users } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('workspace_id', workspaceId)

  const partner = users?.find((u) => u.id !== userId) || null
  res.json({ partner })
})
