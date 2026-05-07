import { ref } from 'vue'

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<ToastOptions[]>([])

export const useToast = () => {
  const showToast = ({ message, type = 'info', duration = 2000 }: ToastOptions) => {
    toasts.value.push({ message, type, duration })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t !== toasts.value.find(_ => _ === toasts.value[0]))
    }, duration)
  }

  return {
    toasts,
    showToast,
  }
}
