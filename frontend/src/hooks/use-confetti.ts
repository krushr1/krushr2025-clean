import { useCallback, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

// Krushr brand colors for confetti
const KRUSHR_COLORS = [
  '#143197', // primary blue
  '#EB5857', // secondary red
  '#1FBB65', // success green
  '#FFB366', // warning orange
  '#57C7EB', // info blue
  '#8b5cf6', // purple
  '#ec4899', // pink
]

interface UseConfettiOptions {
  onComplete?: () => void
  disabled?: boolean
}

export function useConfetti(options: UseConfettiOptions = {}) {
  const { onComplete, disabled = false } = options
  const hasShownFirstTimeToast = useRef(false)
  const lastTriggerTime = useRef(0)
  
  // Check if celebrations are enabled
  const getCelebrationEnabled = useCallback(() => {
    const stored = localStorage.getItem('celebrationsEnabled')
    return stored === null ? true : stored === 'true'
  }, [])
  
  const setCelebrationEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem('celebrationsEnabled', String(enabled))
  }, [])
  
  const triggerConfetti = useCallback((options: {
    origin?: { x: number; y: number }
    particleCount?: number
    spread?: number
  } = {}) => {
    if (disabled || !getCelebrationEnabled()) return
    
    // Throttle confetti to prevent spam (1 second minimum between triggers)
    const now = Date.now()
    if (now - lastTriggerTime.current < 1000) return
    lastTriggerTime.current = now
    
    // Show first-time toast
    if (!hasShownFirstTimeToast.current) {
      hasShownFirstTimeToast.current = true
      toast.success('Task completed!', {
        description: 'You can disable celebrations in settings',
        duration: 5000,
        action: {
          label: 'Disable',
          onClick: () => {
            setCelebrationEnabled(false)
            toast.success('Celebrations disabled')
          },
        },
      })
    }
    
    const {
      origin = { x: 0.5, y: 0.5 },
      particleCount = 100,
      spread = 70,
    } = options
    
    // Trigger confetti with Krushr colors
    confetti({
      particleCount,
      spread,
      origin,
      colors: KRUSHR_COLORS,
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['square', 'circle'],
      scalar: 1,
    })
    
    // Trigger a second burst for more impact
    setTimeout(() => {
      confetti({
        particleCount: particleCount / 2,
        spread: spread * 1.2,
        origin,
        colors: KRUSHR_COLORS,
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 20,
        shapes: ['square', 'circle'],
        scalar: 0.8,
      })
    }, 200)
    
    onComplete?.()
  }, [disabled, getCelebrationEnabled, setCelebrationEnabled, onComplete])
  
  const triggerTaskComplete = useCallback(() => {
    triggerConfetti({
      origin: { x: 0.5, y: 0.6 },
      particleCount: 80,
      spread: 60,
    })
  }, [triggerConfetti])
  
  const triggerMilestone = useCallback(() => {
    // Bigger celebration for milestones
    triggerConfetti({
      origin: { x: 0.5, y: 0.5 },
      particleCount: 150,
      spread: 100,
    })
  }, [triggerConfetti])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      confetti.reset()
    }
  }, [])
  
  return {
    triggerConfetti,
    triggerTaskComplete,
    triggerMilestone,
    isEnabled: getCelebrationEnabled(),
    setEnabled: setCelebrationEnabled,
  }
}

// Optional success sound hook
export function useSuccessSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
    // Create audio element with a simple success sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N+RQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LNeSsFJHfH')
    audioRef.current.volume = 0.3
  }, [])
  
  const playSuccess = useCallback(() => {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false'
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Ignore errors - browser might block autoplay
      })
    }
  }, [])
  
  return { playSuccess }
}