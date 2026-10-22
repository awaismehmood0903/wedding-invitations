import { useEffect, useState } from 'react'

export type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

function diff(target: Date): Remaining {
  const ms = Math.max(0, target.getTime() - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: ms === 0,
  }
}

export function useCountdown(target: Date | null): Remaining | null {
  const [left, setLeft] = useState(() => (target ? diff(target) : null))
  useEffect(() => {
    if (!target) return setLeft(null)
    setLeft(diff(target))
    const id = setInterval(() => setLeft(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  return left
}
