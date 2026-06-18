<template>
  <div class="employee-view">

    <!-- Personal progress -->
    <div class="emp-hero">
      <div class="emp-hero-left">
        <div class="emp-hero-avatar">{{ currentUser.avatar || currentUser.name.slice(0,2).toUpperCase() }}</div>
        <div>
          <div class="emp-hero-name">Bonjour, {{ currentUser.name }} 👋</div>
          <div class="emp-hero-sub">{{ myTasks.length }} tâche(s) assignée(s)</div>
        </div>
      </div>
      <div class="emp-hero-progress">
        <div class="hero-progress-label">Mon avancement global</div>
        <div class="hero-progress-row">
          <div class="hero-progress-bar">
            <div class="hero-progress-fill" :style="{ width: myProgress + '%' }"></div>
          </div>
          <span class="hero-progress-pct">{{ myProgress }}%</span>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="emp-stats-row">
      <div class="emp-stat-chip" style="border-color:rgba(90,90,112,0.3)">
        <i class="fas fa-clock" style="color:var(--text3)"></i>
        <span class="chip-count">{{ pending }}</span>
        <span class="chip-label">En attente</span>
      </div>
      <div class="emp-stat-chip" style="border-color:rgba(247,151,30,0.3)">
        <i class="fas fa-spinner" style="color:var(--accent4)"></i>
        <span class="chip-count" style="color:var(--accent4)">{{ inProgress }}</span>
        <span class="chip-label">En cours</span>
      </div>
      <div class="emp-stat-chip" style="border-color:rgba(67,217,162,0.3)">
        <i class="fas fa-check-circle" style="color:var(--accent3)"></i>
        <span class="chip-count" style="color:var(--accent3)">{{ done }}</span>
        <span class="chip-label">Terminées</span>
      </div>
    </div>

    <!-- Task list -->
    <div class="my-tasks-title">Mes tâches assignées</div>

    <div class="my-tasks-list" v-if="myTasks.length">
      <div v-for="task in myTasks" :key="task.id"
           :class="['my-task-card', 'prio-border-' + task.priority]"
           @click="$emit('openTask', task)">
        <div class="my-task-top">
          <div class="my-task-title">{{ task.taskTitle }}</div>
          <div :class="['task-status-badge', task.status]">
            <i :class="statusIcon(task.status)"></i>
            {{ statusLabel(task.status) }}
          </div>
        </div>
        <div class="my-task-desc" v-if="task.taskDesc">{{ task.taskDesc.slice(0,120) }}{{ task.taskDesc.length > 120 ? '...' : '' }}</div>
        <div class="my-task-meta">
          <div class="meta-item" v-if="task.dueDate">
            <i class="fas fa-calendar-alt"></i> {{ formatDate(task.dueDate) }}
          </div>
          <div class="meta-item" v-if="task.checklist?.length">
            <i class="fas fa-check-square"></i>
            {{ task.checklist.filter(c=>c.done).length }}/{{ task.checklist.length }}
          </div>
          <div :class="['meta-prio', 'prio-' + task.priority]">
            <i :class="prioIcon(task.priority)"></i>
            {{ prioLabel(task.priority) }}
          </div>
        </div>
        <div class="my-task-progress">
          <div class="my-task-progress-bar">
            <div class="my-task-progress-fill"
                 :style="{ width: (task.progress||0) + '%', background: progressColor(task.progress||0) }">
            </div>
          </div>
          <span class="my-task-pct" :style="{ color: progressColor(task.progress||0) }">
            {{ task.progress || 0 }}%
          </span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else style="padding:60px">
      <i class="fas fa-inbox" style="font-size:2.5rem"></i>
      <p style="font-size:1rem">Aucune tâche assignée pour le moment</p>
      <p style="font-size:0.82rem;margin-top:4px;color:var(--text3)">L'administrateur vous assignera des tâches bientôt</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdmin } from '../composables/useAdmin.js'
import { useAuth }  from '../composables/useAuth.js'

defineEmits(['openTask'])

const { currentUser } = useAuth()
const { assignments } = useAdmin()

const myTasks = computed(() =>
  assignments.value.filter(a => a.assignedTo === currentUser.value?.id)
)

const myProgress = computed(() => {
  if (!myTasks.value.length) return 0
  return Math.round(myTasks.value.reduce((s, t) => s + (t.progress || 0), 0) / myTasks.value.length)
})

const pending    = computed(() => myTasks.value.filter(t => t.status === 'pending').length)
const inProgress = computed(() => myTasks.value.filter(t => t.status === 'in_progress').length)
const done       = computed(() => myTasks.value.filter(t => t.status === 'done').length)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function progressColor(p) {
  if (p >= 80) return 'var(--accent3)'
  if (p >= 50) return 'var(--accent4)'
  if (p >= 20) return 'var(--accent)'
  return 'var(--accent2)'
}

function statusLabel(s) { return { pending: 'En attente', in_progress: 'En cours', done: 'Terminé' }[s] || '' }
function statusIcon(s)  { return { pending: 'fas fa-clock', in_progress: 'fas fa-spinner', done: 'fas fa-check-circle' }[s] || 'fas fa-clock' }
function prioLabel(p)   { return { high: 'Urgent', medium: 'Moyen', low: 'Faible' }[p] || '' }
function prioIcon(p)    { return { high: 'fas fa-fire', medium: 'fas fa-circle', low: 'fas fa-leaf' }[p] || 'fas fa-circle' }
</script>

<style scoped>
/* HERO */
.emp-hero {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px 24px; margin-bottom: 16px; gap: 20px; flex-wrap: wrap;
}
.emp-hero-left { display: flex; align-items: center; gap: 14px; }
.emp-hero-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.1rem; color: #fff; flex-shrink: 0;
}
.emp-hero-name { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 800; }
.emp-hero-sub { font-size: 0.8rem; color: var(--text3); margin-top: 3px; }
.emp-hero-progress { display: flex; flex-direction: column; gap: 8px; min-width: 220px; }
.hero-progress-label { font-size: 0.78rem; font-weight: 600; color: var(--text2); }
.hero-progress-row { display: flex; align-items: center; gap: 10px; }
.hero-progress-bar { flex: 1; height: 10px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.hero-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent3)); border-radius: 99px; transition: width 0.6s ease; }
.hero-progress-pct { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 800; color: var(--accent); min-width: 42px; text-align: right; }

/* STATS ROW */
.emp-stats-row { display: flex; gap: 10px; margin-bottom: 20px; }
.emp-stat-chip {
  flex: 1; display: flex; align-items: center; gap: 8px; padding: 12px 14px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.chip-count { font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 800; }
.chip-label { font-size: 0.72rem; color: var(--text3); }

/* MY TASKS */
.my-tasks-title { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: var(--text2); }
.my-tasks-list { display: flex; flex-direction: column; gap: 10px; }
.my-task-card {
  background: var(--surface); border: 1px solid var(--border); border-left: 3px solid transparent;
  border-radius: var(--radius-sm); padding: 16px; cursor: pointer; transition: var(--transition);
  display: flex; flex-direction: column; gap: 10px;
}
.my-task-card:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.prio-border-high   { border-left-color: var(--accent2); }
.prio-border-medium { border-left-color: var(--accent4); }
.prio-border-low    { border-left-color: var(--accent3); }
.my-task-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.my-task-title { font-weight: 600; font-size: 0.95rem; flex: 1; }
.task-status-badge { display: flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
.task-status-badge.pending    { background: rgba(90,90,112,0.15); color: var(--text3); }
.task-status-badge.in_progress { background: rgba(247,151,30,0.15); color: var(--accent4); }
.task-status-badge.done       { background: rgba(67,217,162,0.15); color: var(--accent3); }
.my-task-desc { font-size: 0.8rem; color: var(--text2); line-height: 1.5; }
.my-task-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: var(--text3); }
.meta-prio { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 700; margin-left: auto; }
.prio-high   { color: var(--accent2); }
.prio-medium { color: var(--accent4); }
.prio-low    { color: var(--accent3); }
.my-task-progress { display: flex; align-items: center; gap: 10px; }
.my-task-progress-bar { flex: 1; height: 6px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.my-task-progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.my-task-pct { font-size: 0.78rem; font-weight: 700; min-width: 36px; text-align: right; }
</style>
