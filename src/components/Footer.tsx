import { useRef, useState } from 'react'
import { wedding } from '../config/event'
import { useReveal } from '../hooks/useReveal'
import { useThemeZone } from './ThemeBackdrop'
import { Monogram } from './Monogram'
import { MusicToggle } from './MusicToggle'

const digits = (phone: string) => phone.replace(/[^\d+]/g, '')

/** Hashtag, family contacts (call / WhatsApp), share and sound toggle. */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const { groom, bride, hashtag } = wedding.couple
  useThemeZone(ref, 'base')
  useReveal(ref)

  const share = async () => {
    const data = { title: `${groom} & ${bride} — Wedding Invitation`, text: `You're invited to celebrate ${groom} & ${bride}!`, url: window.location.href }
    try {
      if (navigator.share) return await navigator.share(data)
      await navigator.clipboard.writeText(data.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <footer ref={ref} className="relative z-10 px-5 pt-16 pb-14 text-center text-ink">
      <Monogram className="reveal mx-auto w-24 text-primary" />
      <p className="reveal font-display mt-6 text-2xl font-semibold tracking-wide text-primary">{hashtag}</p>
      <p className="reveal mt-2 text-sm opacity-80">Share your moments with our hashtag</p>

      <ul className="reveal mx-auto mt-10 grid max-w-sm gap-3">
        {wedding.contacts.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-card px-4 py-3 text-left">
            <span>
              <span className="font-display block text-lg font-semibold">{c.name}</span>
              <span className="text-sm opacity-75">{c.phone}</span>
            </span>
            <span className="flex gap-2">
              <a href={`tel:${digits(c.phone)}`} className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 text-primary" aria-label={`Call ${c.name}`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8Z" />
                </svg>
              </a>
              <a href={`https://wa.me/${digits(c.phone).replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-full bg-[#1F8F4E] text-white" aria-label={`WhatsApp ${c.name}`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
                </svg>
              </a>
            </span>
          </li>
        ))}
      </ul>

      <div className="reveal mt-10 flex items-center justify-center gap-3">
        <button type="button" onClick={share} className="btn btn-solid">
          {copied ? 'Link copied!' : 'Share invitation'}
        </button>
        <MusicToggle />
      </div>

      <p className="mt-12 text-xs tracking-[0.25em] uppercase opacity-60">
        With love · {groom} &amp; {bride} · {new Date(`${wedding.events[0].date}T00:00:00`).getFullYear()}
      </p>
    </footer>
  )
}
