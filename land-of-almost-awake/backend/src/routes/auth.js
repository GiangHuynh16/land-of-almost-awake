import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../db/supabase.js'

export const authRouter = Router()

// POST /auth/signup
authRouter.post('/signup', async (req, res) => {
  const { display_name, email, password, achievement_threshold = 10 } = req.body
  if (!display_name || !email || !password) {
    return res.status(400).json({ error: 'display_name, email, password required' })
  }
  const threshold = Math.max(1, Math.min(50, parseInt(achievement_threshold) || 10))
  const invite_code = uuidv4().slice(0, 8).toUpperCase()
  const password_hash = await bcrypt.hash(password, 10)

  const { data: workspace, error: wsErr } = await supabase
    .from('workspaces')
    .insert({ invite_code, achievement_threshold: threshold })
    .select()
    .single()
  if (wsErr) return res.status(500).json({ error: wsErr.message })

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ workspace_id: workspace.id, display_name, email, password_hash })
    .select('id, display_name, email, workspace_id')
    .single()
  if (userErr) return res.status(500).json({ error: userErr.message })

  const token = jwt.sign(
    { userId: user.id, workspaceId: workspace.id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
  res.json({ token, user, invite_code })
})

// POST /auth/join
authRouter.post('/join', async (req, res) => {
  const { display_name, email, password, invite_code } = req.body
  if (!display_name || !email || !password || !invite_code) {
    return res.status(400).json({ error: 'display_name, email, password, invite_code required' })
  }

  const { data: workspace, error: wsErr } = await supabase
    .from('workspaces')
    .select('*')
    .eq('invite_code', invite_code.toUpperCase())
    .single()
  if (wsErr || !workspace) return res.status(404).json({ error: 'Invite code not found' })
  if (workspace.invite_used) return res.status(400).json({ error: 'Invite code already used' })

  // Atomistic claim: set invite_used = true only if it is still false
  const { data: claimed, error: claimErr } = await supabase
    .from('workspaces')
    .update({ invite_used: true })
    .eq('id', workspace.id)
    .eq('invite_used', false)
    .select('id')

  if (claimErr || !claimed || claimed.length === 0) {
    return res.status(400).json({ error: 'Invite code already used' })
  }

  const password_hash = await bcrypt.hash(password, 10)
  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ workspace_id: workspace.id, display_name, email, password_hash })
    .select('id, display_name, email, workspace_id')
    .single()
  if (userErr) return res.status(500).json({ error: userErr.message })

  const token = jwt.sign(
    { userId: user.id, workspaceId: workspace.id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
  res.json({ token, user })
})

// POST /auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email, password required' })

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { userId: user.id, workspaceId: user.workspace_id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
  const { password_hash, ...safeUser } = user

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('invite_code')
    .eq('id', user.workspace_id)
    .single()

  res.json({ token, user: { ...safeUser, invite_code: workspace?.invite_code ?? null } })
})
