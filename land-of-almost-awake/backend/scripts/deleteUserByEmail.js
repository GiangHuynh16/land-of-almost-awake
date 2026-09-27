import 'dotenv/config'
import { supabase } from '../src/db/supabase.js'

async function main () {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node deleteUserByEmail.js user@example.com')
    process.exit(2)
  }

  try {
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchErr || !user) {
      console.log('No user found with that email.')
      process.exit(0)
    }

    const workspaceId = user.workspace_id

    const { error: delErr } = await supabase
      .from('users')
      .delete()
      .eq('email', email)

    if (delErr) {
      console.error('Failed to delete user:', delErr.message || delErr)
      process.exit(1)
    }

    console.log('Deleted user:', email)

    // If workspace exists and has no other users, delete it
    if (workspaceId) {
      const { data: others, error: othersErr } = await supabase
        .from('users')
        .select('id')
        .eq('workspace_id', workspaceId)

      if (!othersErr && (!others || others.length === 0)) {
        const { error: wsDelErr } = await supabase
          .from('workspaces')
          .delete()
          .eq('id', workspaceId)

        if (wsDelErr) {
          console.warn('Failed to delete workspace:', wsDelErr.message || wsDelErr)
        } else {
          console.log('Deleted workspace:', workspaceId)
        }
      } else if (othersErr) {
        console.warn('Could not verify other workspace users:', othersErr.message || othersErr)
      }
    }

    process.exit(0)
  } catch (err) {
    console.error('Error during deletion:', err)
    process.exit(1)
  }
}

main()
