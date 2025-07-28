import { useCallback, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

// Krushr brand colors for confetti
const KRUSHR_COLORS = [
  '#143197', // Primary blue
  '#EB5857', // Secondary red
  '#1FBB65', // Success green
  '#FFB366', // Warning orange
  '#57C7EB', // Info blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
]

// Storage key for celebration preference
const CELEBRATION_ENABLED_KEY = 'krushr-celebrations-enabled'

// Check if celebrations are enabled
export const isCelebrationEnabled = () => {
  const stored = localStorage.getItem(CELEBRATION_ENABLED_KEY)
  return stored !== 'false' // Default to true
}

// Set celebration preference
export const setCelebrationEnabled = (enabled: boolean) => {
  localStorage.setItem(CELEBRATION_ENABLED_KEY, String(enabled))
}

interface ConfettiOptions {
  duration?: number
  particleCount?: number
  spread?: number
  origin?: { x: number; y: number }
  colors?: string[]
  disableForBulk?: boolean
}

export function useConfetti() {
  const hasShownFirstTimeToast = useRef(false)
  const lastCelebrationTime = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create audio element on mount
  useEffect(() => {
    // Create a simple success sound using Web Audio API
    const createSuccessSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a simple ding sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Set frequency for a pleasant "ding" sound
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      // Quick fade in and out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    // Store the function to create sound on demand
    audioRef.current = {
      play: () => {
        try {
          if (isCelebrationEnabled()) {
            createSuccessSound()
          }
        } catch (error) {
          // Silently fail if audio is not supported
          console.debug('Audio playback failed:', error)
        }
      }
    } as any

    return () => {
      audioRef.current = null
    }
  }, [])

  const triggerConfetti = useCallback((options: ConfettiOptions = {}) => {
    // Check if celebrations are enabled
    if (!isCelebrationEnabled()) {
      return
    }

    // Throttle celebrations to prevent spam (minimum 500ms between celebrations)
    const now = Date.now()
    if (now - lastCelebrationTime.current < 500) {
      return
    }
    lastCelebrationTime.current = now

    // Skip for bulk operations if specified
    if (options.disableForBulk) {
      return
    }

    const {
      duration = 3000,
      particleCount = 100,
      spread = 70,
      origin = { x: 0.5, y: 0.5 },
      colors = KRUSHR_COLORS,
    } = options

    // Play success sound
    audioRef.current?.play()

    // Fire confetti
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    // Main burst
    confetti({
      particleCount,
      spread,
      origin,
      colors,
      startVelocity: 30,
      gravity: 1.2,
      scalar: 1.2,
      drift: 0,
    })

    // Side bursts for more excitement
    frame()

    // Show first-time toast
    if (!hasShownFirstTimeToast.current) {
      hasShownFirstTimeToast.current = true
      setTimeout(() => {
        toast.success('🎉 Task completed!', {
          description: 'You can disable celebrations in settings',
          duration: 5000,
        })
      }, 1000)
    }
  }, [])

  const triggerSubtleConfetti = useCallback((options: ConfettiOptions = {}) => {
    // A more subtle celebration for less important completions
    if (!isCelebrationEnabled()) {
      return
    }

    const {
      origin = { x: 0.5, y: 0.6 },
      colors = KRUSHR_COLORS,
    } = options

    confetti({
      particleCount: 30,
      spread: 40,
      origin,
      colors,
      startVelocity: 20,
      gravity: 1.5,
      scalar: 0.8,
      drift: 0,
    })
  }, [])

  return {
    triggerConfetti,
    triggerSubtleConfetti,
    isCelebrationEnabled,
    setCelebrationEnabled,
  }
}

// Global function to trigger confetti from anywhere
export const celebrateTaskCompletion = (options?: ConfettiOptions) => {
  if (!isCelebrationEnabled()) {
    return
  }

  const {
    duration = 3000,
    particleCount = 100,
    spread = 70,
    origin = { x: 0.5, y: 0.5 },
    colors = KRUSHR_COLORS,
  } = options || {}

  // Play a simple success sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    // Silently fail
  }

  // Fire confetti
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: colors,
    })
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  // Main burst
  confetti({
    particleCount,
    spread,
    origin,
    colors,
    startVelocity: 30,
    gravity: 1.2,
    scalar: 1.2,
    drift: 0,
  })

  // Side bursts
  frame()
}