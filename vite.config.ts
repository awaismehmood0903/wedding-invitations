import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { format } from 'date-fns'
import { wedding } from './src/config/event.ts'

type EditionName = keyof typeof wedding.site

/** Fills index.html's title / WhatsApp preview tags for the edition being built. */
function editionMeta(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const edition = (env.VITE_EDITION || 'full') as EditionName
  const event = wedding.events.find((e) => e.slug === edition)
  const site = (env.VITE_SITE_URL || wedding.site[edition] || wedding.site.full).replace(/\/$/, '')
  const { groom, bride, groomFull, brideFull } = wedding.couple

  const meta = event
    ? {
        title: `${event.title} · ${groom} & ${bride}`,
        ogTitle: `${groom} & ${bride} · ${event.title}`,
        description: `You're invited to the ${event.title} of ${groomFull} & ${brideFull} · ${format(new Date(`${event.date}T00:00:00`), 'EEEE, d MMMM yyyy')} · ${event.venue}, Lahore.`,
        image: `${site}/og-${edition}.jpg`,
        theme: event.theme.bg,
      }
    : {
        title: `${groom} & ${bride} · Wedding Invitation`,
        ogTitle: `${groom} & ${bride} · You're Invited`,
        description: `Nikkah · Barat · Walima: join us for three days of celebration with ${groomFull} & ${brideFull}.`,
        image: `${site}/og-image.jpg`,
        theme: wedding.baseTheme.bg,
      }

  const values: Record<string, string> = {
    TITLE: meta.title,
    OG_TITLE: meta.ogTitle,
    DESCRIPTION: meta.description,
    OG_IMAGE: meta.image,
    SITE_URL: `${site}/`,
    THEME_COLOR: meta.theme,
  }
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

  return {
    name: 'edition-meta',
    // Runs before Vite's own %ENV% substitution so it doesn't warn about these keys.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(/%(\w+)%/g, (m, key: string) => (key in values ? escape(values[key]) : m)),
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), editionMeta(mode)],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion'
          if (id.includes('node_modules/framer-motion')) return 'framer'
        },
      },
    },
  },
}))
