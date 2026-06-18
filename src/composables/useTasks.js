import { ref, computed } from 'vue'

const AVAILABLE_LABELS = [
  { name: 'Design',    color: '#7c6af7' },
  { name: 'Dev',       color: '#43d9a2' },
  { name: 'Marketing', color: '#f7971e' },
  { name: 'Docs',      color: '#4fc3f7' },
  { name: 'Bug',       color: '#ff6584' },
  { name: 'Feature',   color: '#a78bfa' },
]

function makeDefaultColumns() {
  return [
    {
      id: 1, title: 'À faire', color: '#7c6af7',
      tasks: [
        {
          id: 101,
          title: 'Préparer la réunion client',
          description: 'Préparer les slides et le compte-rendu',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          labels: ['Design'],
          checklist: [{ text: 'Slides', done: false }, { text: 'Notes', done: false }],
          reminders: [], assignee: 'ML', estimate: 2, recurrence: '', customTag: '',
          activity: [{ id: 1, text: 'Tâche créée', time: 'Il y a 2h' }],
        },
      ],
    },
    {
      id: 2, title: 'En cours', color: '#f7971e',
      tasks: [
        {
          id: 102,
          title: "Développer la page d'accueil",
          description: 'Intégrer la maquette Figma',
          priority: 'medium',
          due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
          labels: ['Dev'],
          checklist: [
            { text: 'HTML', done: true },
            { text: 'CSS',  done: false },
            { text: 'JS',   done: false },
          ],
          reminders: [], assignee: 'JD', estimate: 5, recurrence: '', customTag: '',
          activity: [],
        },
      ],
    },
    {
      id: 3, title: 'Terminé', color: '#43d9a2',
      tasks: [
        {
          id: 103,
          title: 'Mise à jour de la documentation',
          description: '', priority: 'low', due_date: '',
          labels: ['Docs'], checklist: [], reminders: [],
          assignee: '', estimate: 1, recurrence: '', customTag: '',
          activity: [],
        },
      ],
    },
  ]
}

const columns = ref(makeDefaultColumns())

// ── API base path (proxied by Vite → XAMPP) ────────────────────────────────
const API = '/api/tasks.php'

export function useTasks() {

  /* ---- helpers ---- */
  function getLabelColor(name) {
    return AVAILABLE_LABELS.find(l => l.name === name)?.color || '#888'
  }

  function getPriorityColor(p) {
    return { high: '#ff6584', medium: '#f7971e', low: '#43d9a2' }[p] || '#888'
  }

  function getColForTask(task) {
    return columns.value.find(c => c.tasks.some(t => t.id === task.id))
  }

  function checklistProgress(task) {
    if (!task.checklist.length) return 0
    return Math.round(task.checklist.filter(c => c.done).length / task.checklist.length * 100)
  }

  function isOverdue(task) {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date()
  }

  function isDueSoon(task) {
    if (!task.due_date) return false
    const diff = new Date(task.due_date) - new Date()
    return diff > 0 && diff < 86400000 * 2
  }

  function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  function formatDateTime(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  /* ---- computed ---- */
  const totalTasks = computed(() => columns.value.reduce((s, c) => s + c.tasks.length, 0))

  const completedTasks = computed(() => {
    const done = columns.value.find(
      c => c.title.toLowerCase().includes('termin') || c.title.toLowerCase().includes('done')
    )
    return done ? done.tasks.length : 0
  })

  const overdueTasks = computed(() => {
    const all = []
    columns.value.forEach(c => c.tasks.forEach(t => { if (isOverdue(t)) all.push(t) }))
    return all
  })

  const todayTasks = computed(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const all = []
    columns.value.forEach(c => c.tasks.forEach(t => {
      if (t.due_date) {
        const d = new Date(t.due_date)
        if (d >= today && d < tomorrow) all.push(t)
      }
    }))
    return all
  })

  const allReminders = computed(() => {
    const all = []
    columns.value.forEach(c => c.tasks.forEach(t => {
      t.reminders.forEach(r => all.push({
        id: `${t.id}-${r.datetime}`, taskTitle: t.title,
        datetime: r.datetime, task: t,
      }))
    }))
    return all.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  })

  /* ---- columns CRUD ---- */
  function addColumn() {
    const colors = ['#7c6af7', '#ff6584', '#43d9a2', '#f7971e', '#4fc3f7', '#a78bfa']
    const title = prompt('Nom de la nouvelle colonne:')
    if (!title?.trim()) return null
    const col = {
      id: Date.now(), title: title.trim(),
      color: colors[columns.value.length % colors.length], tasks: [],
    }
    columns.value.push(col)
    return col.title
  }

  function deleteColumn(col) {
    if (!confirm(`Supprimer "${col.title}" et ses ${col.tasks.length} tâche(s) ?`)) return false
    columns.value = columns.value.filter(c => c.id !== col.id)
    return true
  }

  /* ---- task CRUD ---- */
  function createTask(form) {
    const targetCol = columns.value.find(c => c.id === form.colId) || columns.value[0]
    const task = {
      id: Date.now(), title: form.title, description: form.desc,
      assignee: form.assignee, due_date: form.dueDate, estimate: form.estimate,
      priority: form.priority, labels: [...form.labels],
      checklist: form.checklist.map(c => ({ ...c })),
      reminders: form.reminders.map(r => ({ ...r })),
      recurrence: form.recurrence, customTag: form.customTag,
      activity: [{ id: Date.now(), text: 'Tâche créée', time: "À l'instant" }],
    }
    targetCol.tasks.push(task)
    return task
  }

  function updateTask(task, form) {
    task.title       = form.title
    task.description = form.desc
    task.assignee    = form.assignee
    task.due_date    = form.dueDate
    task.estimate    = form.estimate
    task.priority    = form.priority
    task.labels      = [...form.labels]
    task.checklist   = form.checklist.map(c => ({ ...c }))
    task.reminders   = form.reminders.map(r => ({ ...r }))
    task.recurrence  = form.recurrence
    task.customTag   = form.customTag
    if (!task.activity) task.activity = []
    task.activity.unshift({ id: Date.now(), text: 'Tâche modifiée', time: "À l'instant" })

    const currentCol = getColForTask(task)
    if (currentCol && currentCol.id !== form.colId) {
      currentCol.tasks = currentCol.tasks.filter(t => t.id !== task.id)
      const targetCol = columns.value.find(c => c.id === form.colId)
      if (targetCol) targetCol.tasks.push(task)
    }
  }

  function deleteTask(task) {
    const col = getColForTask(task)
    if (col) col.tasks = col.tasks.filter(t => t.id !== task.id)
  }

  function moveTask(task, fromCol, toCol) {
    if (fromCol.id === toCol.id) return false
    fromCol.tasks = fromCol.tasks.filter(t => t.id !== task.id)
    toCol.tasks.push(task)
    return true
  }

  /* ---- persistence (now via PHP API) ---- */

  /**
   * Save the current board to MySQL via tasks.php
   * @param {number} userId
   */
  async function saveData(userId) {
    try {
      await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          data: { columns: columns.value, isPremium: false },
        }),
      })
    } catch (err) {
      console.error('[TaskFlow] saveData failed:', err)
    }
  }

  /**
   * Load the board from MySQL for a given user.
   * Falls back to default columns if no data found.
   * @param {number} userId
   * @returns {object|null} the loaded data object, or null
   */
  async function loadData(userId) {
    try {
      const res  = await fetch(`${API}?userId=${userId}`)
      const data = await res.json()
      if (data && data.columns) {
        columns.value = data.columns
        return data
      }
    } catch (err) {
      console.error('[TaskFlow] loadData failed:', err)
    }
    // No saved data — use defaults
    columns.value = makeDefaultColumns()
    return null
  }

  return {
    columns,
    availableLabels: AVAILABLE_LABELS,
    getLabelColor, getPriorityColor, getColForTask, checklistProgress,
    isOverdue, isDueSoon, formatDate, formatDateTime,
    totalTasks, completedTasks, overdueTasks, todayTasks, allReminders,
    addColumn, deleteColumn, createTask, updateTask, deleteTask, moveTask,
    saveData, loadData,
  }
}
