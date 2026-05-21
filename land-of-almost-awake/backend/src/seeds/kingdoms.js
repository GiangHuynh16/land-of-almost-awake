import 'dotenv/config'
import { supabase } from '../db/supabase.js'

const KINGDOMS = [
  {
    name: 'Miamas',
    meaning: 'I love',
    order: 1,
    accent_color: '#D4860B',
    lore_quote: 'In Miamas, the most noble profession is to tell stories.',
    unlocked_at: new Date().toISOString(),
  },
  {
    name: 'Miploris',
    meaning: 'I mourn',
    order: 2,
    accent_color: '#C08080',
    lore_quote: 'In Miploris, all the sorrow in the world is kept safe.',
    unlocked_at: null,
  },
  {
    name: 'Mirevas',
    meaning: 'I dream',
    order: 3,
    accent_color: '#2B5BA8',
    lore_quote: 'In Mirevas, dreams are guarded like the most precious treasure.',
    unlocked_at: null,
  },
  {
    name: 'Miaudacas',
    meaning: 'I dare',
    order: 4,
    accent_color: '#C45C1A',
    lore_quote: 'In Miaudacas, courage is the only currency that matters.',
    unlocked_at: null,
  },
  {
    name: 'Mimovas',
    meaning: 'I dance',
    order: 5,
    accent_color: '#5A8A6A',
    lore_quote: 'In Mimovas, music never stops and joy never ends.',
    unlocked_at: null,
  },
  {
    name: 'Mibatolos',
    meaning: 'I fight',
    order: 6,
    accent_color: '#5A2D7A',
    lore_quote: 'In Mibatolos, the bravest warriors were raised.',
    unlocked_at: null,
  },
]

const { error } = await supabase.from('kingdoms').insert(KINGDOMS)
if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log('Kingdoms seeded successfully.')
