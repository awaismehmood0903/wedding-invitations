import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monogram } from './Monogram'

/** Monogram stroke-draw shown while fonts load; calls onDone once both the animation and fonts are ready. */
export function Loader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    let alive = true
    const minTime = new Promise((r) => setTimeout(r, 2600))
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])
    Promise.all([minTime, fonts]).then(() => alive && onDone())
    return () => {
      alive = false
    }
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#FBF5EA] text-[#7A1F2B]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      role="status"
      aria-label="Loading invitation"
    >
      <Monogram draw className="w-40 sm:w-48" />
    </motion.div>
  )
}
