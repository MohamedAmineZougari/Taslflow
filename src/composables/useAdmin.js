import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'

// ── API base path (proxied by Vite → XAMPP) ────────────────────────────────
const API = '/api/assignments.php'

// ── Module-level singletons shared across ALL components ───────────────────
// Both must be outside useAdmin() so every call to useAdmin() reads
// the same reactive data — not a fresh empty copy.
const assignments       = ref([])
const _employeeStats    = ref([])   // ← was incorrectly inside useAdmin()

export function useAdmin() {
  const { currentUser, getEmployees, getUserById } = useAuth()

  /* ── load all assignments from DB ── */
  async function fetchAssignments() {
    try {
      const res = await fetch(API)
      assignments.value = await res.json()
    } catch (err) {
      console.error('[TaskFlow] fetchAssignments failed:', err)
    }
  }

  /* ── (re)compute per-employee stats from the shared data ── */
  async function refreshEmployeeStats() {
    const employees = await getEmployees()
    _employeeStats.value = employees.map(emp => {
      const empTasks   = assignments.value.filter(a => a.assignedTo === emp.id)
      const total      = empTasks.length
      const done       = empTasks.filter(a => a.status === 'done').length
      const inProgress = empTasks.filter(a => a.status === 'in_progress').length
      const avgProgress = total === 0
        ? 0
        : Math.round(empTasks.reduce((s, a) => s + (a.progress || 0), 0) / total)
      return {
        employee: emp,
        total,
        done,
        inProgress,
        pending: total - done - inProgress,
        avgProgress,
        tasks: empTasks,
      }
    })
  }

  /* ── computed views of the shared state ── */
  const employeeStats    = computed(() => _employeeStats.value)
  const totalAssignments = computed(() => assignments.value.length)
  const globalProgress   = computed(() => {
    if (!assignments.value.length) return 0
    return Math.round(
      assignments.value.reduce((s, a) => s + (a.progress || 0), 0) / assignments.value.length
    )
  })

  /* ── assign a new task ── */
  async function assignTask({ title, description, priority, dueDate, assignedTo, checklist, labels }) {
    try {
      const res     = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title,
          description: description || '',
          priority:    priority    || 'medium',
          dueDate:     dueDate     || '',
          labels:      labels      || [],
          assignedTo,
          assignedBy:  currentUser.value?.id,
          checklist:   checklist   || [],
        }),
      })
      const created = await res.json()
      assignments.value.push(created)
      await refreshEmployeeStats()
      return created
    } catch (err) {
      console.error('[TaskFlow] assignTask failed:', err)
      return null
    }
  }

  /* ── update assignment (admin edit) ── */
  async function updateAssignment(id, fields) {
    try {
      const res     = await fetch(`${API}?id=${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(fields),
      })
      const updated = await res.json()
      const idx     = assignments.value.findIndex(a => a.id === id)
      if (idx !== -1) assignments.value[idx] = updated
      await refreshEmployeeStats()
    } catch (err) {
      console.error('[TaskFlow] updateAssignment failed:', err)
    }
  }

  /* ── delete assignment ── */
  async function deleteAssignment(id) {
    try {
      await fetch(`${API}?id=${id}`, { method: 'DELETE' })
      assignments.value = assignments.value.filter(a => a.id !== id)
      await refreshEmployeeStats()
    } catch (err) {
      console.error('[TaskFlow] deleteAssignment failed:', err)
    }
  }

  /* ── employee updates their own task ── */
  async function updateProgress(id, { checklist, status, comment }) {
    const task = assignments.value.find(a => a.id === id)
    if (!task) return

    const fields = {}

    if (checklist !== undefined) {
      fields.checklist = checklist
      const total = checklist.length
      const done  = checklist.filter(c => c.done).length
      fields.progress = total === 0 ? 0 : Math.round((done / total) * 100)
      if      (fields.progress === 100) fields.status = 'done'
      else if (fields.progress > 0)     fields.status = 'in_progress'
      else                              fields.status = 'pending'
    }

    if (status !== undefined) {
      fields.status = status
      if      (status === 'done')    fields.progress = 100
      else if (status === 'pending') fields.progress = 0
    }

    if (comment) {
      fields.newComment = {
        userId:   currentUser.value?.id,
        userName: currentUser.value?.name,
        text:     comment,
        time:     new Date().toLocaleString('fr-FR'),
      }
    }

    await updateAssignment(id, fields)
  }

  /* ── get tasks for a specific employee (reactive computed from cache) ── */
  function getMyTasks(userId) {
    return computed(() => assignments.value.filter(a => a.assignedTo === userId))
  }

  /* ── helpers ── */
  function getAssignmentById(id) {
    return assignments.value.find(a => a.id === id)
  }

  return {
    assignments,
    employeeStats,
    totalAssignments,
    globalProgress,
    fetchAssignments,
    refreshEmployeeStats,
    assignTask,
    updateAssignment,
    deleteAssignment,
    updateProgress,
    getMyTasks,
    getAssignmentById,
    getUserById,
    getEmployees,
  }
}
