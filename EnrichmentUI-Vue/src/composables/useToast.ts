/**
 * Simple toast notification composable
 * Provides user feedback for actions and errors
 */

import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) =>
    showToast(message, 'success', duration)
  const error = (message: string, duration?: number) =>
    showToast(message, 'error', duration || 5000)
  const info = (message: string, duration?: number) =>
    showToast(message, 'info', duration)
  const warning = (message: string, duration?: number) =>
    showToast(message, 'warning', duration)

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}


