import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Petal = { x: number; y: number; r: number; vy: number; vx: number; rot: number; vr: number; sway: number; phase: number; color: string; kind: 0 | 1 }

const COLORS = ['#D63A5B', '#E86A86', '#F2A7B8', '#F0B429', '#E8902A', '#FFFFFF']

/** Rose petals and marigold flecks drifting down on a lightweight canvas. Off for reduced motion. */
export function Petals({ count = 26, active = true }: { count?: number; active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const c = canvas.current
    if (!c || reduced || !active) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    // Phones: lower pixel density and fewer petals keep the canvas cheap.
    const small = window.innerWidth < 640
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (initial: boolean): Petal => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -20,
      r: 5 + Math.random() * 6,
      vy: 0.35 + Math.random() * 0.7,
      vx: -0.2 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2,
      vr: -0.02 + Math.random() * 0.04,
      sway: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      kind: Math.random() < 0.75 ? 0 : 1,
    })
    const petals = Array.from({ length: small ? Math.ceil(count * 0.6) : count }, () => spawn(true))

    let raf = 0
    let t = 0
    const frame = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)
      for (const p of petals) {
        p.y += p.vy
        p.x += p.vx + Math.sin(t * 0.012 + p.phase) * p.sway * 0.4
        p.rot += p.vr
        if (p.y > h + 20) Object.assign(p, spawn(false))
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        if (p.kind === 0) {
          // rose petal: teardrop
          ctx.moveTo(0, -p.r)
          ctx.bezierCurveTo(p.r, -p.r * 0.4, p.r * 0.6, p.r, 0, p.r)
          ctx.bezierCurveTo(-p.r * 0.6, p.r, -p.r, -p.r * 0.4, 0, -p.r)
        } else {
          ctx.ellipse(0, 0, p.r * 0.45, p.r * 0.3, 0, 0, Math.PI * 2)
        }
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(frame)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [count, reduced, active])

  if (reduced) return null
  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-30 h-full w-full" aria-hidden />
}
