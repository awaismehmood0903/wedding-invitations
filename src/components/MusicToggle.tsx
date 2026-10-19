import { music } from '../lib/music'
import { useMusic } from '../hooks/useMusic'

/** Sound on/off button. Hidden entirely if the MP3 is missing. */
export function MusicToggle({ className = '' }: { className?: string }) {
  const { available, playing } = useMusic()
  if (!available) return null
  return (
    <button
      type="button"
      onClick={music.toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Mute music' : 'Play music'}
      className={`grid h-11 w-11 place-items-center rounded-full border border-[#B8902F]/50 bg-[#FFFDF8]/85 text-[#7A1F2B] shadow-md backdrop-blur ${className}`}
    >
      {playing ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="eq-bar w-[3px] rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Z" />
          <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="m16 9 5 6m0-6-5 6" />
        </svg>
      )}
    </button>
  )
}
