
import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/app-store'
import { Notification } from '../../../../shared/types'
import NotificationToast from './NotificationToast'

interface ToastNotification extends Notification {
  toastId: string
  timestamp: number
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const { notifications, markNotificationRead } = useAppStore()

  useEffect(() => {
    const newNotifications = notifications
      .filter(n => !n.is_read)
      .filter(n => !toasts.some(t => t.id === n.id))
      .slice(0, 3) // Limit to 3 toasts at a time

    if (newNotifications.length > 0) {
      const newToasts = newNotifications.map(notification => ({
        ...notification,
        toastId: `toast-${notification.id}-${Date.now()}`,
        timestamp: Date.now()
      }))

      setToasts(prev => [...prev, ...newToasts])
    }
  }, [notifications, toasts])

  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        handleDismissToast(toast.toastId)
      }, 5000)

      return () => clearTimeout(timer)
    })
  }, [toasts])

  const handleDismissToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId))
  }

  const handleToastAction = (notification: ToastNotification) => {
    markNotificationRead(notification.id)
    handleDismissToast(notification.toastId)
    
    // TODO: Navigate to relevant page based on notification type
    console.log('Navigate to:', notification.type, notification.id)
  }

  const handleToastClose = (notification: ToastNotification) => {
    markNotificationRead(notification.id)
    handleDismissToast(notification.toastId)
  }

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.toastId}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 1000 - index
          }}
        >
          <NotificationToast
            notification={toast}
            onClose={() => handleToastClose(toast)}
            onAction={() => handleToastAction(toast)}
          />
        </div>
      ))}
    </div>
  )
}