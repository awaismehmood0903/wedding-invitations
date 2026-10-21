import { useEffect, useState, type ReactNode } from 'react'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { wedding } from '../config/event'
import type { CoupleProps } from './Couple'

// Number inputs expected on the Rive state machine (brief your illustrator with these):
//   pose: 0 idle · 1 walk · 2 wave · 3 together
//   day:  0 intro · 1 Nikkah · 2 Barat · 3 Walima   (switches outfits)
const POSE = { idle: 0, walk: 1, wave: 2, together: 3 } as const

export default function RiveCouple({ arrive, settle, day = 0, className = '', fallback }: CoupleProps & { fallback: ReactNode }) {
  const [failed, setFailed] = useState(false)
  const { rive, RiveComponent } = useRive({
    src: wedding.rive.src,
    stateMachines: wedding.rive.stateMachine,
    autoplay: true,
    onLoadError: () => setFailed(true),
  })
  const pose = useStateMachineInput(rive, wedding.rive.stateMachine, 'pose', POSE.idle)
  const dayInput = useStateMachineInput(rive, wedding.rive.stateMachine, 'day', day)

  useEffect(() => {
    if (dayInput) dayInput.value = day
  }, [dayInput, day])

  useEffect(() => {
    if (!pose || !arrive) return
    pose.value = POSE.walk
    const timers = settle.map((p, i) => setTimeout(() => (pose.value = POSE[p]), 2400 + i * 3200))
    return () => timers.forEach(clearTimeout)
  }, [pose, arrive, settle])

  if (failed) return <>{fallback}</>
  return (
    <div className={`mx-auto aspect-square ${className}`} role="img" aria-label="Illustrated bride and groom">
      <RiveComponent />
    </div>
  )
}
