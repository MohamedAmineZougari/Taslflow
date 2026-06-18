import { ref } from 'vue'

// ── Shared singleton state ──────────────────────────────────────────────────
const isAuthenticated = ref(false)
const currentUser     = ref(null)

// ── API base path (proxied by Vite → XAMPP) ────────────────────────────────
const API = '/api/auth.php'

// ── Restore session from localStorage on page load ─────────────────────────
// This runs once when the module is first imported.
// If the user was logged in before a refresh, restore them silently.
try {
  const saved = localStorage.getItem('tf_session_user')
  if (saved) {
    const user = JSON.parse(saved)
    if (user && user.id) {
      currentUser.value     = user
      isAuthenticated.value = true
    }
  }
} catch {
  localStorage.removeItem('tf_session_user')
}

export function useAuth() {

  // ── login ──────────────────────────────────────────────────────────────
  async function login(email, password) {
    try {
      const res  = await fetch(`${API}?action=login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        currentUser.value     = data.user
        isAuthenticated.value = true
        localStorage.setItem('tf_session_user', JSON.stringify(data.user))
      }
      return data   // { ok, user } or { ok: false, error }
    } catch (err) {
      return { ok: false, error: 'Erreur réseau. Vérifiez que XAMPP est démarré.' }
    }
  }

  // ── signup ─────────────────────────────────────────────────────────────
  async function signup(name, email, password) {
    try {
      const res  = await fetch(`${API}?action=signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (data.ok) {
        currentUser.value     = data.user
        isAuthenticated.value = true
        localStorage.setItem('tf_session_user', JSON.stringify(data.user))
      }
      return data
    } catch (err) {
      return { ok: false, error: 'Erreur réseau. Vérifiez que XAMPP est démarré.' }
    }
  }

  // ── logout ─────────────────────────────────────────────────────────────
  function logout() {
    isAuthenticated.value = false
    currentUser.value     = null
    localStorage.removeItem('tf_session_user')
  }

  // ── getEmployees ───────────────────────────────────────────────────────
  async function getEmployees() {
    try {
      const res = await fetch(`${API}?action=employees`)
      return await res.json()   // array of employee objects
    } catch {
      return []
    }
  }

  // ── getUserById ────────────────────────────────────────────────────────
  async function getUserById(id) {
    try {
      const res = await fetch(`${API}?action=user&id=${id}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    signup,
    logout,
    getEmployees,
    getUserById,
  }
}
