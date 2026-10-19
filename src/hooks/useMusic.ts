import { useSyncExternalStore } from 'react'
import { music } from '../lib/music'

export const useMusic = () => useSyncExternalStore(music.subscribe, music.get)
