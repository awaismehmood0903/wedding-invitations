import { useState } from 'react'
import { motion } from 'framer-motion'
import { wedding } from '../config/event'
import { music } from '../lib/music'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { patternUrl } from '../lib/patterns'
import { Monogram } from './Monogram'

/** Ornate Mughal doors. Tapping the seal starts the music (needs a user gesture) and swings the doors open. */
export function GateIntro({ guest, onOpen, onGone }: { guest: string; onOpen: () => void; onGone: () => void }) {
  const [opening, setOpening] = useState(false)
  const reduced = useReducedMotion()
  const { groom, bride } = wedding.couple

  const open = () => {
    if (opening) return
    setOpening(true)
    void music.start()
  }

  const door = (side: 'left' | 'right') => (
    <motion.div
      className="relative h-full w-1/2 overflow-hidden bg-[#5E1525]"
      style={{
        transformOrigin: side === 'left' ? 'left center' : 'right center',
        backgroundImage: patternUrl('jharokha', '#E2BF55', 0.22),
        backgroundSize: '72px 90px',
      }}
      initial={false}
      animate={opening ? { rotateY: side === 'left' ? -105 : 105, opacity: reduced ? 0 : 1 } : { rotateY: 0 }}
      transition={{ duration: reduced ? 0.3 : 1.7, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={() => opening && side === 'left' && onGone()}
    >
      {/* carved arch panel */}
      <svg viewBox="0 0 100 300" preserveAspectRatio="none" className="absolute inset-[6%] h-[88%] w-[88%]" aria-hidden>
        <path d="M8 296 V90 Q8 40 50 8 Q92 40 92 90 V296 Z" fill="none" stroke="#E2BF55" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <path d="M18 296 V96 Q18 56 50 26 Q82 56 82 96 V296" fill="none" stroke="#E2BF55" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={`absolute top-[80%] h-20 w-3 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#F3D58A] to-[#9C7A24] ${side === 'left' ? 'right-3' : 'left-3'}`} />
    </motion.div>
  )

  return (
    <div className={`fixed inset-0 z-40 flex [perspective:1400px] ${opening ? 'pointer-events-none' : ''}`}>
      {door('left')}
      {door('right')}

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#FBEFD9]"
        animate={opening ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => opening && setTimeout(onOpen, reduced ? 0 : 500)}
      >
        <p className="font-display text-sm tracking-[0.35em] uppercase opacity-80">You are invited</p>
        <p className="font-script mt-3 text-5xl text-[#F3D58A] sm:text-6xl">
          {groom} <span className="font-display text-3xl">&amp;</span> {bride}
        </p>
        <p className="font-display mt-3 text-lg italic opacity-90">Dear {guest}</p>

        <button
          onClick={open}
          className="seal-pulse mt-10 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-[#C8102E] to-[#7A0B1E] text-[#F3D58A] shadow-[0_10px_40px_rgba(0,0,0,0.45)] ring-4 ring-[#E2BF55]/60"
          aria-label="Open the invitation"
        >
          <Monogram className="w-24" />
        </button>
        <p className="mt-5 text-xs tracking-[0.3em] uppercase opacity-75">Tap the seal to open</p>
      </motion.div>
    </div>
  )
}
