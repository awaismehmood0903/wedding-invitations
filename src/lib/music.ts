import type { Howl } from 'howler'
import { wedding } from '../config/event'

type State = { available: boolean; playing: boolean }
let state: State = { available: true, playing: false }
let howl: Howl | null = null
const listeners = new Set<(s: State) => void>()

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l(state))
}

export const music = {
  get: () => state,
  subscribe(fn: (s: State) => void) {
    listeners.add(fn)
    return () => void listeners.delete(fn)
  },
  /** Must be called from a user gesture (the gate tap) — browsers block autoplay. */
  async start() {
    if (!howl) {
      const { Howl } = await import('howler')
      howl = new Howl({
        src: [wedding.music.src],
        loop: true,
        volume: 0,
        html5: true,
        onloaderror: () => set({ available: false, playing: false }),
        onplayerror: () => set({ playing: false }),
      })
    }
    howl.play()
    howl.fade(0, wedding.music.volume, 2500)
    set({ playing: true })
  },
  toggle() {
    if (!howl) return void music.start()
    if (state.playing) howl.pause()
    else howl.play()
    set({ playing: !state.playing })
  },
}
