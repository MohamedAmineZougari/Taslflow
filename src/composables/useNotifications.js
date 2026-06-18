import { ref, watch } from 'vue'
import { useTasks }  from './useTasks.js'
import { useToast }  from './useToast.js'

// ── IDs of reminders that already fired (persisted across hot-reloads) ──────
const firedSet = new Set(
  JSON.parse(localStorage.getItem('tf_fired_reminders') || '[]')
)

function persistFired() {
  localStorage.setItem('tf_fired_reminders', JSON.stringify([...firedSet]))
}

// ── Public state ─────────────────────────────────────────────────────────────
export const notifPermission = ref(Notification.permission)  // 'default'|'granted'|'denied'

// ── Request permission ────────────────────────────────────────────────────────
export async function requestNotifPermission() {
  if (!('Notification' in window)) return
  const result = await Notification.requestPermission()
  notifPermission.value = result
  return result
}

// ── Fire a single browser notification ───────────────────────────────────────
function fireNotification(title, body) {
  // Always show an in-app toast (visible even when tab is focused)
  const { addToast } = useToast()
  addToast('warning', `🔔 ${title}`, body, 8000)

  // Show OS-level notification only when permission is granted
  if (Notification.permission === 'granted') {
    const n = new Notification(`🔔 TaskFlow — ${title}`, {
      body,
      icon:    '/favicon.ico',
      badge:   '/favicon.ico',
      tag:     title,          // replaces an existing notif with the same tag
      renotify: true,
      silent:  false,
    })
    // Auto-close after 8 seconds
    setTimeout(() => n.close(), 8000)
  }
}

// ── Check all reminders and fire any that are due ────────────────────────────
function checkReminders(allReminders) {
  const now = Date.now()

  for (const rem of allReminders) {
    // rem.id = `${taskId}-${datetime}`
    if (firedSet.has(rem.id)) continue

    const due = new Date(rem.datetime).getTime()
    if (isNaN(due)) continue

    // Fire if time has passed (within a 2-minute window so we don't miss one)
    if (now >= due && now - due < 2 * 60 * 1000) {
      firedSet.add(rem.id)
      persistFired()
      fireNotification(
        rem.taskTitle,
        rem.datetime
          ? `Rappel prévu pour ${new Date(rem.datetime).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
          : 'Votre rappel est arrivé !'
      )
    }
  }
}

// ── Start the notification engine (call once in App.vue) ─────────────────────
let _started = false

export function useNotifications() {
  const { allReminders } = useTasks()

  function start() {
    if (_started) return
    _started = true

    // Check immediately on mount
    checkReminders(allReminders.value)

    // Then check every 30 seconds
    setInterval(() => {
      checkReminders(allReminders.value)
    }, 30_000)

    // Also re-check whenever reminders list changes
    watch(allReminders, (list) => checkReminders(list), { deep: true })
  }

  return {
    notifPermission,
    requestNotifPermission,
    start,
  }
}
