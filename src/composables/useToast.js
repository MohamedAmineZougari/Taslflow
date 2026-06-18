import { ref } from 'vue'

const toasts = ref([])

const ICONS = {
  success: 'fas fa-check-circle',
  error:   'fas fa-times-circle',
  info:    'fas fa-info-circle',
  warning: 'fas fa-exclamation-triangle',
}

export function useToast() {
  function addToast(type, title, msg = '', duration = 3500) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, title, msg, icon: ICONS[type] })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, addToast, removeToast }
}
