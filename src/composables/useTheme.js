import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function initTheme() {
    const saved = localStorage.getItem('taskflow-theme')
    if (saved === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    } else {
      isDark.value = false
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('taskflow-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('taskflow-theme', 'light')
    }
  }

  return {
    isDark,
    initTheme,
    toggleTheme
  }
}
