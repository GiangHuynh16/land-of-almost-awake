export const KINGDOMS = [
  {
    id: 'miamas', serif: 'Miamas', verb: 'i love · i imagine', scale: 1.30,
    color: '#f6cdbf', deep: '#b0644f',
    proverb: 'Miamas is the largest of the kingdoms because love takes up the most room.',
    sealed: 4, total: 7,
  },
  {
    id: 'mibatalos', serif: 'Mibatalos', verb: 'i fight', scale: 0.88,
    color: '#e89060', deep: '#8a3b15',
    proverb: 'Even the smallest warriors are honored at the gates of Mibatalos.',
    sealed: 3, total: 6,
  },
  {
    id: 'miploris', serif: 'Miploris', verb: 'i grieve', scale: 0.66,
    color: '#b8a8e4', deep: '#534186',
    proverb: 'In Miploris, sorrow is folded into envelopes so no one carries it alone.',
    sealed: 2, total: 4,
  },
  {
    id: 'mimovas', serif: 'Mimovas', verb: 'i dance', scale: 0.92,
    color: '#9ed4b5', deep: '#3f6e54',
    proverb: 'Mimovas keeps the songs even the singer has forgotten.',
    sealed: 3, total: 5,
  },
  {
    id: 'miaudacas', serif: 'Miaudacas', verb: 'i dare', scale: 0.86,
    color: '#ecc36a', deep: '#8c6320',
    proverb: 'Anything done for the first time is a coronation in Miaudacas.',
    sealed: 2, total: 4,
  },
  {
    id: 'miveritas', serif: 'Miveritas', verb: 'truth between two', scale: 0.95, dual: true,
    color: '#7adfe2', deep: '#2a6e72', colorAlt: '#e489c8', deepAlt: '#7e3567',
    proverb: 'Two seals. One promise. The only kingdom that needs both of you.',
    sealed: 3, sealedOther: 2, total: 5,
  },
]

export const DEEDS_BY_KINGDOM = {
  miamas: [
    { id: 'mi-1', title: "finish Granny's last fairytale to the end", note: 'the one about the snow-angel and the cloud-beast.', who: 'Elsa', when: 'MON · 7:14 PM', sealed: true, glyph: 'feather' },
    { id: 'mi-2', title: 'draw the Princess of Miamas on the door', note: 'so the apartment knows who lives here.', who: 'Elsa', when: 'TUE · 9:02 PM', sealed: true, glyph: 'crown' },
    { id: 'mi-3', title: 'give the new cloud-beast a name', note: 'Granny would have known one already.', who: 'Elsa', when: 'TUE · 10:30 PM', sealed: true, glyph: 'moth' },
    { id: 'mi-4', title: "tell Wolfheart a story he hasn't heard", who: 'Elsa', when: 'WED · 6:48 AM', sealed: false },
    { id: 'mi-5', title: "leave Granny's window open for the moths", note: 'she always said moths carry messages.', who: 'Elsa', when: 'WED · 9:00 PM', sealed: false },
    { id: 'mi-6', title: 'read the new chapter to the wurse', who: 'Granny', when: 'THU · 3:10 PM', sealed: false },
    { id: 'mi-7', title: 'ask Mum which kingdom she rode to as a girl', who: 'Elsa', when: 'THU · 9:00 PM', sealed: false },
  ],
  mibatalos: [
    { id: 'mb-1', title: "deliver Granny's apology letter to Wolfheart", note: 'knock once. wait. do not run.', who: 'Elsa', when: 'MON · 6:30 AM', sealed: true, glyph: 'arrow' },
    { id: 'mb-2', title: 'stand up to Britt-Marie about the dog', note: 'kindly. the way a knight of Miamas would.', who: 'Elsa', when: 'TUE · 4:50 PM', sealed: true, glyph: 'crown' },
    { id: 'mb-3', title: 'two hours of deep work before the wurse wakes', who: 'Granny', when: 'WED · 9:00 AM', sealed: true, glyph: 'tree' },
    { id: 'mb-4', title: 'say no to a thing that costs too much sleep', who: 'Elsa', when: 'WED · 9:50 PM', sealed: false },
    { id: 'mb-5', title: 'the cold morning run before the school bus', who: 'Granny', when: 'THU · 7:00 AM', sealed: false },
    { id: 'mb-6', title: 'finish the form for school the Monster signed', who: 'Elsa', when: 'THU · 8:14 AM', sealed: false },
  ],
  miploris: [
    { id: 'mp-1', title: "say Granny's name aloud, three times", note: 'the way she taught Elsa to do for the ones who are gone.', who: 'Granny', when: 'SUN · 9:00 PM', sealed: true, glyph: 'candle' },
    { id: 'mp-2', title: "fold yesterday into Granny's envelope", note: "so we don't have to carry it alone.", who: 'Elsa', when: 'MON · 8:14 PM', sealed: true, glyph: 'moth' },
    { id: 'mp-3', title: "write the letter Granny didn't finish to Mum", who: 'Elsa', when: 'TUE · 7:30 PM', sealed: false },
    { id: 'mp-4', title: 'ten quiet minutes with the missing', who: 'Granny', when: 'WED · 10:00 PM', sealed: false },
  ],
  mimovas: [
    { id: 'mv-1', title: 'kitchen-waltz with Granny before the kettle', note: 'she will not let the song end.', who: 'Granny', when: 'MON · 7:02 AM', sealed: true, glyph: 'bell' },
    { id: 'mv-2', title: 'learn the second verse the wurse knows', who: 'Elsa', when: 'TUE · 4:00 PM', sealed: true, glyph: 'wave' },
    { id: 'mv-3', title: 'find a song that sounds like the courtyard rain', who: 'Elsa', when: 'WED · 6:00 PM', sealed: true, glyph: 'spiral' },
    { id: 'mv-4', title: 'five-minute slow record before bed with Granny', who: 'Granny', when: 'WED · 9:00 PM', sealed: false },
    { id: 'mv-5', title: 'teach the wurse the one step he almost has', who: 'Elsa', when: 'THU · 5:30 PM', sealed: false },
  ],
  miaudacas: [
    { id: 'ma-1', title: 'first ride on a cloud-beast, alone, no Granny', note: 'the cinnamon-snail beast. she said it would be kind.', who: 'Elsa', when: 'MON · 11:00 AM', sealed: true, glyph: 'star' },
    { id: 'ma-2', title: 'the cold-water minute Granny taught', note: "count slowly. it isn't punishment.", who: 'Granny', when: 'TUE · 7:00 AM', sealed: true, glyph: 'wave' },
    { id: 'ma-3', title: 'speak first to the Monster across the landing', who: 'Elsa', when: 'WED · 8:30 PM', sealed: false },
    { id: 'ma-4', title: "wear the knight's yellow coat outside the house", who: 'Granny', when: 'THU · 2:00 PM', sealed: false },
  ],
}

export const MIVERITAS_DEEDS = [
  {
    id: 'vt-1',
    title: 'ride to Miamas together on Sunday at six',
    note: "we keep each other in the saddle until we've both spoken.",
    sealedBy: { elsa: { glyph: 'moth', at: 'SUN' }, granny: { glyph: 'spiral', at: 'SUN' } },
  },
  {
    id: 'vt-2',
    title: 'save the bus-fare to the hospital, for the visit',
    note: 'the one Granny made us promise we would still take.',
    sealedBy: { elsa: { glyph: 'star', at: 'MON' } },
  },
  {
    id: 'vt-3',
    title: 'no big-decision night without a walk through the courtyard first',
    note: "the long way past Wolfheart's door. it counts.",
    sealedBy: {},
  },
  {
    id: 'vt-4',
    title: 'read the last paragraph aloud to each other before sleep',
    sealedBy: { granny: { glyph: 'candle', at: 'TUE' } },
  },
  {
    id: 'vt-5',
    title: 'one weekend a month with nothing on the calendar',
    note: 'for the kingdoms that need us at home.',
    sealedBy: {},
  },
]

export const RECENT_SEALS = [
  { who: 'Elsa', kingdom: 'miamas', title: 'named the new cloud-beast', when: 'TUE' },
  { who: 'Granny', kingdom: 'mimovas', title: 'kitchen-waltz before the kettle', when: 'MON' },
  { who: 'Granny', kingdom: 'miploris', title: 'said her name aloud, three times', when: 'SUN' },
  { who: 'Elsa', kingdom: 'miaudacas', title: 'first ride on a cloud-beast', when: 'MON' },
  { who: 'Elsa', kingdom: 'mibatalos', title: "delivered Granny's apology letter", when: 'MON' },
]

export const KINGDOM_STAMPS = {
  miamas: ['moth', 'feather', 'spiral', 'star', 'crown', 'bell', 'tree', 'candle'],
  mibatalos: ['arrow', 'crown', 'wave', 'tree', 'bell', 'star', 'spiral', 'acorn'],
  miploris: ['candle', 'moth', 'feather', 'acorn', 'bell', 'wave', 'spiral', 'tree'],
  mimovas: ['wave', 'bell', 'spiral', 'feather', 'moth', 'tree', 'star', 'bee'],
  miaudacas: ['star', 'arrow', 'crown', 'wave', 'tree', 'spiral', 'moth', 'feather'],
  miveritas: ['moth', 'spiral', 'star', 'feather', 'bell', 'candle', 'wave', 'crown', 'tree', 'arrow', 'acorn', 'bee'],
}

export function stampsFor(kingdomId) {
  return KINGDOM_STAMPS[kingdomId] || ['acorn', 'moth', 'star', 'crown', 'feather', 'bell', 'candle', 'spiral']
}

export function placeholderFor(id) {
  const map = {
    miamas: 'what story enters Miamas tonight?',
    mibatalos: 'what battle does this knight ride to?',
    miploris: 'what do you fold into Miploris?',
    mimovas: 'what song would Mimovas remember?',
    miaudacas: 'what first-time will you dare?',
    miveritas: 'what promise do you two ride out with?',
  }
  return map[id] || 'what deed enters this kingdom?'
}
