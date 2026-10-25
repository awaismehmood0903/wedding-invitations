// ─────────────────────────────────────────────────────────────────────────────
//  ALL invitation content lives in this file.
//  Change names, dates, venues, colours and contacts here — nothing else needed.
//  Anything marked  TODO  is a placeholder waiting for real details.
// ─────────────────────────────────────────────────────────────────────────────

export type DayTheme = {
  bg: string // section background
  primary: string // headings, buttons
  accent: string // gold / highlight colour
  ink: string // body text (must contrast with bg)
  card: string // details card background
  pattern: 'geometric' | 'jharokha' | 'floral'
}

export type BrideOutfit = { dress: string; top: string; dupatta: string; trim: string }
export type GroomOutfit = {
  coat: string
  trim: string
  pants: string
  turban?: string
  style?: 'sherwani' | 'suit' // suit = western pant coat with shirt & tie
  tie?: string
}

export type EnvelopeStyle = {
  paper: string // envelope paper
  liner: string // inside of the flap
  seal: string // wax colour
  sealInk: string // embossed monogram on the wax
  ink: string // writing on the envelope
}

/** Colours for the single-event opening scene (arch, sky, mosque, curtains, flowers). */
export type SceneStyle = {
  skyTop: string
  skyBottom: string
  glow: string // sun / light behind the dome
  building: string // mosque in the distance
  frame: string // carved arch frame
  frameTrim: string
  curtain: string
  curtainTrim: string
  flower: string // main rose colour
  flower2: string // second rose colour
  leaf: string
}

export type WeddingEvent = {
  id: 'day1' | 'day2' | 'day3'
  slug: 'nikkah' | 'barat' | 'walima' // single-event edition name (see src/config/edition.ts)
  day: number
  title: string
  titleUrdu: string
  tagline: string
  wish: string // shown under the heading, beside the dome
  wishSource?: string
  date: string // YYYY-MM-DD (local Pakistan date)
  startTime: string // HH:mm 24h
  endTime: string // HH:mm 24h
  venue: string
  address: string
  mapUrl: string
  dress: string
  notes?: string
  hostedBy?: string
  theme: DayTheme
  outfit: { bride: BrideOutfit; groom: GroomOutfit }
  envelope: EnvelopeStyle
  scene: SceneStyle
}

export const wedding = {
  couple: {
    groom: 'Hasher',
    groomFull: 'Hasher Mehmood',
    bride: 'Samar',
    brideFull: 'Samar Amanat',
    initials: ['H', 'S'] as const,
    hashtag: '#HasherWedsSamar',
    groomParents: '', // e.g. 'Son of Mr. & Mrs. Mehmood' — TODO (left blank = hidden)
    brideParents: '', // e.g. 'Daughter of Mr. & Mrs. Amanat' — TODO
  },

  // Outfits worn in the opening scene (each event day has its own below).
  introOutfit: {
    bride: { dress: '#A3122A', top: '#8E0F24', dupatta: '#C8102E', trim: '#E2BF55' },
    groom: { coat: '#F1E4C4', trim: '#B8902F', pants: '#F7F1E4' },
  } satisfies { bride: BrideOutfit; groom: GroomOutfit },

  // Times below are Pakistan Standard Time — used for the countdown and calendar files.
  timezoneOffset: '+05:00',
  timezoneLabel: 'PKT',

  bismillah: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  invitationLine:
    'With the blessings of Allah and the love of our families, we joyfully request the pleasure of your company as we celebrate the marriage of',
  defaultGuest: 'Family & Friends',

  // Optional: drop a Rive file in /public/rive and set its path here to replace the SVG couple.
  rive: {
    src: '' as string, // e.g. '/rive/couple.riv'
    stateMachine: 'Couple',
  },

  music: {
    src: '/audio/theme.mp3', // drop your MP3 here (under ~3 MB)
    volume: 0.5,
  },

  // Fallback public URL of each deployment (the VITE_SITE_URL env var on Render overrides it).
  // Used for the WhatsApp preview image and calendar files.
  site: {
    full: 'https://hasher-weds-samar.onrender.com',
    nikkah: 'https://hasher-samar-nikkah.onrender.com',
    barat: 'https://hasher-samar-barat.onrender.com',
    walima: 'https://hasher-samar-walima.onrender.com',
  },

  events: [
    {
      id: 'day1',
      slug: 'nikkah',
      day: 1,
      title: 'Nikkah',
      titleUrdu: 'نکاح',
      tagline: 'Two hearts, one sacred promise',
      wish: 'And among His signs is that He created for you spouses, that you may find tranquillity in them, and He placed between you affection and mercy.',
      wishSource: 'Surah Ar-Rum, 30:21',
      date: '2027-01-15',
      startTime: '17:00', // TODO
      endTime: '20:00', // TODO
      venue: '786 Mian Shafi Farm House',
      address: 'Canal Bank Housing Scheme, Canal Road, Lahore',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=786%20Mian%20Shafi%20Farm%20House%2C%20Canal%20Bank%20Housing%20Scheme%2C%20Canal%20Road%2C%20Lahore', // tip: replace with the venue's own Google Maps share link
      dress: 'Copper, bronze & ivory',
      notes: 'Nikkah ceremony followed by dinner.', // TODO
      theme: {
        bg: '#F6EDE4',
        primary: '#8A4B2A',
        accent: '#9E5D2A',
        ink: '#3A2418',
        card: '#FFF9F3',
        pattern: 'geometric',
      },
      outfit: {
        bride: { dress: '#B5713F', top: '#A2622F', dupatta: '#D9A066', trim: '#E8C27A' },
        groom: { coat: '#C68A57', trim: '#E3C07A', pants: '#F2E6D6' },
      },
      envelope: { paper: '#F3E6DA', liner: '#8A4B2A', seal: '#A0522D', sealInk: '#F3D9B1', ink: '#8A4B2A' },
      scene: {
        skyTop: '#E7C3A0',
        skyBottom: '#FBF0E4',
        glow: '#FFF1DC',
        building: '#EED9C4',
        frame: '#F3E5D8',
        frameTrim: '#B87333',
        curtain: '#8A4B2A',
        curtainTrim: '#E3B778',
        flower: '#F7E7D6',
        flower2: '#E3AE7C',
        leaf: '#9C9468',
      },
    },
    {
      id: 'day2',
      slug: 'barat',
      day: 2,
      title: 'Barat',
      titleUrdu: 'بارات',
      tagline: 'The groom arrives in celebration',
      wish: 'Tonight two families become one. May every step they take together be lit with joy, and may their love grow brighter with every passing year.',
      date: '2027-01-16',
      startTime: '19:00', // TODO
      endTime: '23:00', // TODO
      venue: 'Grand Empire Marquee',
      address: 'Saddar Gol Chakar, Lahore',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Grand%20Empire%20Marquee%2C%20Saddar%20Gol%20Chakar%2C%20Lahore', // tip: replace with the venue's own Google Maps share link
      dress: 'Formal — reds, maroons & gold',
      notes: 'Barat arrival at 7:30 PM sharp.', // TODO
      theme: {
        bg: '#4A0E1B',
        primary: '#F3D58A',
        accent: '#D4AF37',
        ink: '#FBEFD9',
        card: '#5E1525',
        pattern: 'jharokha',
      },
      outfit: {
        bride: { dress: '#B5122B', top: '#9E0F25', dupatta: '#C8102E', trim: '#E2BF55' },
        groom: { coat: '#EBD9AE', trim: '#B8902F', pants: '#F5EEDC', turban: '#EBD9AE' },
      },
      envelope: { paper: '#6E1729', liner: '#D4AF37', seal: '#C9A23A', sealInk: '#5E1525', ink: '#F3D58A' },
      scene: {
        skyTop: '#5A1424',
        skyBottom: '#EDB27A',
        glow: '#FFE0A8',
        building: '#D9A47C',
        frame: '#5E1525',
        frameTrim: '#D4AF37',
        curtain: '#8C1026',
        curtainTrim: '#E2BF55',
        flower: '#C8102E',
        flower2: '#F3D58A',
        leaf: '#8A7A44',
      },
    },
    {
      id: 'day3',
      slug: 'walima',
      day: 3,
      title: 'Walima',
      titleUrdu: 'ولیمہ',
      tagline: 'A feast of gratitude and joy',
      wish: 'May Allah bless you both, shower His blessings upon you, and unite you in goodness. May your home always be filled with barakah, laughter and love.',
      wishSource: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fi khair",
      date: '2027-01-17',
      startTime: '19:30', // TODO
      endTime: '23:00', // TODO
      venue: 'Grace Royal Event Complex',
      address: 'Near Beaconhouse University, Bahria Town, Lahore',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Grace%20Royal%20Event%20Complex%2C%20Bahria%20Town%2C%20Lahore', // tip: replace with the venue's own Google Maps share link
      dress: 'Pastels & elegant evening wear',
      notes: 'Hosted by the family of the groom.', // TODO
      theme: {
        bg: '#F4ECF1',
        primary: '#7A4A6E',
        accent: '#5E8F7E',
        ink: '#3A2A36',
        card: '#FFFAFC',
        pattern: 'floral',
      },
      outfit: {
        bride: { dress: '#E9BCD2', top: '#DFA9C3', dupatta: '#F6DCE8', trim: '#C9A24A' },
        groom: { coat: '#3A3D42', trim: '#5B5F66', pants: '#33363B', style: 'suit', tie: '#B07AA1' },
      },
      envelope: { paper: '#F4E1E8', liner: '#7A4A6E', seal: '#CBB796', sealInk: '#8C7656', ink: '#7A4A6E' },
      scene: {
        skyTop: '#E6C8D6',
        skyBottom: '#FCF2F6',
        glow: '#FFFFFF',
        building: '#F0E0E7',
        frame: '#F8EEF2',
        frameTrim: '#B9977E',
        curtain: '#A86F96',
        curtainTrim: '#E8D3B0',
        flower: '#F7E1EA',
        flower2: '#E8B9CF',
        leaf: '#9FB5A6',
      },
    },
  ] satisfies WeddingEvent[] as WeddingEvent[],

  // Theme used for the intro, greeting, countdown and footer.
  baseTheme: {
    bg: '#FBF5EA',
    primary: '#7A1F2B',
    accent: '#B8902F',
    ink: '#3B2A22',
    card: '#FFFDF8',
    pattern: 'geometric',
  } satisfies DayTheme as DayTheme,

  contacts: [
    { name: 'Mehmood Family', phone: '+92 300 0000000' }, // TODO
    { name: 'Amanat Family', phone: '+92 300 0000000' }, // TODO
  ],

}

export type Wedding = typeof wedding
