import 'dotenv/config'
import { supabase } from '../src/db/supabase.js'

async function main() {
  const id = process.argv[2]
  if (!id) {
    console.error('Usage: node getWorkspaceInvite.js <workspace_id>')
    process.exit(2)
  }

  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching workspace:', error.message || error)
      process.exit(1)
    }

    console.log(JSON.stringify(data, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

main()
