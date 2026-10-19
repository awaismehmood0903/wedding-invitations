import { wedding, type WeddingEvent } from './event'

/**
 * Which invitation this build is:
 *   full   → all three days (doors intro)
 *   nikkah / barat / walima → that event only (envelope intro)
 *
 * Set at build time with VITE_EDITION (see .env.nikkah etc. and render.yaml).
 * In dev you can also preview any edition with ?edition=barat.
 */
export type Edition = 'full' | WeddingEvent['slug']

const EDITIONS: Edition[] = ['full', 'nikkah', 'barat', 'walima']

function resolveEdition(): Edition {
  let value = (import.meta.env.VITE_EDITION as string | undefined) || 'full'
  if (import.meta.env.DEV) value = new URLSearchParams(window.location.search).get('edition') ?? value
  return EDITIONS.includes(value as Edition) ? (value as Edition) : 'full'
}

export const edition: Edition = resolveEdition()

/** The single event this edition is about, or null for the full invitation. */
export const editionEvent: WeddingEvent | null = wedding.events.find((e) => e.slug === edition) ?? null

/** Public URL of this deployment. */
export const siteUrl: string = (import.meta.env.VITE_SITE_URL as string | undefined) || wedding.site[edition]
