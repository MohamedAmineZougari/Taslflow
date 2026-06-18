<template>
  <div class="admin-dashboard">

    <!-- Header stats -->
    <div class="admin-stats">
      <div class="admin-stat-card">
        <div class="astat-icon" style="background:rgba(124,106,247,0.15);color:var(--accent)">
          <i class="fas fa-users"></i>
        </div>
        <div>
          <div class="astat-value">{{ employeeStats.length }}</div>
          <div class="astat-label">Employés</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="astat-icon" style="background:rgba(247,151,30,0.15);color:var(--accent4)">
          <i class="fas fa-tasks"></i>
        </div>
        <div>
          <div class="astat-value">{{ totalAssignments }}</div>
          <div class="astat-label">Tâches assignées</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="astat-icon" style="background:rgba(67,217,162,0.15);color:var(--accent3)">
          <i class="fas fa-check-circle"></i>
        </div>
        <div>
          <div class="astat-value">{{ totalDone }}</div>
          <div class="astat-label">Terminées</div>
        </div>
      </div>
      <div class="admin-stat-card global-progress-card">
        <div class="astat-icon" style="background:rgba(255,101,132,0.15);color:var(--accent2)">
          <i class="fas fa-chart-line"></i>
        </div>
        <div style="flex:1">
          <div class="astat-value">{{ globalProgress }}%</div>
          <div class="astat-label">Avancement global</div>
          <div class="global-bar">
            <div class="global-bar-fill" :style="{ width: globalProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions bar -->
    <div class="admin-actions-bar">
      <div class="section-title"><i class="fas fa-users"></i> Suivi des employés</div>
      <button class="btn btn-primary" @click="$emit('assignTask')">
        <i class="fas fa-plus"></i> Assigner une tâche
      </button>
    </div>

    <!-- Employee cards -->
    <div class="employees-grid" v-if="employeeStats.length">
      <div v-for="stat in employeeStats" :key="stat.employee.id" class="employee-card">

        <!-- Employee header -->
        <div class="emp-header">
          <div class="emp-avatar">{{ stat.employee.avatar || stat.employee.name.slice(0,2).toUpperCase() }}</div>
          <div class="emp-info">
            <div class="emp-name">{{ stat.employee.name }}</div>
            <div class="emp-email">{{ stat.employee.email }}</div>
          </div>
          <div class="emp-badge" :class="getBadgeClass(stat.avgProgress)">
            {{ getBadgeLabel(stat.avgProgress) }}
          </div>
        </div>

        <!-- Overall progress -->
        <div class="emp-progress-section">
          <div class="emp-progress-header">
            <span class="emp-progress-label">Avancement global</span>
            <span class="emp-progress-pct" :style="{ color: getProgressColor(stat.avgProgress) }">
              {{ stat.avgProgress }}%
            </span>
          </div>
          <div class="emp-progress-bar">
            <div class="emp-progress-fill"
                 :style="{ width: stat.avgProgress + '%', background: getProgressColor(stat.avgProgress) }">
            </div>
          </div>
        </div>

        <!-- Mini stats -->
        <div class="emp-mini-stats">
          <div class="mini-stat">
            <i class="fas fa-clock" style="color:var(--text3)"></i>
            <span>{{ stat.pending }}</span>
            <span class="mini-label">En attente</span>
          </div>
          <div class="mini-stat">
            <i class="fas fa-spinner" style="color:var(--accent4)"></i>
            <span>{{ stat.inProgress }}</span>
            <span class="mini-label">En cours</span>
          </div>
          <div class="mini-stat">
            <i class="fas fa-check-circle" style="color:var(--accent3)"></i>
            <span>{{ stat.done }}</span>
            <span class="mini-label">Terminées</span>
          </div>
          <div class="mini-stat">
            <i class="fas fa-list" style="color:var(--accent)"></i>
            <span>{{ stat.total }}</span>
            <span class="mini-label">Total</span>
          </div>
        </div>

        <!-- Task list -->
        <div class="emp-tasks" v-if="stat.tasks.length">
          <div class="emp-tasks-title">Tâches assignées</div>
          <div v-for="task in stat.tasks" :key="task.id" class="emp-task-row"
               @click="$emit('viewTask', task)">
            <div class="emp-task-left">
              <div :class="['task-status-dot', task.status]"></div>
              <div class="emp-task-name">{{ task.taskTitle }}</div>
            </div>
            <div class="emp-task-right">
              <div class="task-mini-bar">
                <div class="task-mini-fill"
                     :style="{ width: (task.progress||0) + '%', background: getProgressColor(task.progress||0) }">
                </div>
              </div>
              <span class="task-mini-pct" :style="{ color: getProgressColor(task.progress||0) }">
                {{ task.progress || 0 }}%
              </span>
              <div :class="['priority-dot', 'prio-' + task.priority]"></div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else style="padding:16px 0">
          <i class="fas fa-inbox"></i>
          <p>Aucune tâche assignée</p>
        </div>

        <!-- Footer actions -->
        <div class="emp-footer">
          <button class="btn btn-ghost btn-sm" @click="$emit('assignTask', stat.employee)">
            <i class="fas fa-plus"></i> Assigner
          </button>
        </div>
      </div>
    </div>

    <!-- No employees -->
    <div class="empty-state" v-else style="padding:60px">
      <i class="fas fa-user-plus" style="font-size:2.5rem"></i>
      <p style="font-size:1rem">Aucun employé inscrit pour le moment</p>
      <p style="font-size:0.82rem;margin-top:4px">Les employés peuvent créer un compte depuis la page de connexion</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdmin } from '../composables/useAdmin.js'

defineEmits(['assignTask', 'viewTask'])

const { employeeStats, totalAssignments, globalProgress } = useAdmin()

const totalDone = computed(() =>
  employeeStats.value.reduce((s, e) => s + e.done, 0)
)

function getProgressColor(pct) {
  if (pct >= 80) return 'var(--accent3)'
  if (pct >= 50) return 'var(--accent4)'
  if (pct >= 20) return 'var(--accent)'
  return 'var(--accent2)'
}

function getBadgeClass(pct) {
  if (pct >= 80) return 'badge-excellent'
  if (pct >= 50) return 'badge-good'
  if (pct >= 20) return 'badge-progress'
  return 'badge-low'
}

function getBadgeLabel(pct) {
  if (pct >= 80) return 'Excellent'
  if (pct >= 50) return 'Bon'
  if (pct >= 20) return 'En cours'
  return 'Faible'
}
</script>

<style scoped>
.admin-dashboard { padding: 0; }

/* ---- STATS ---- */
.admin-stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.admin-stat-card {
  flex: 1; min-width: 160px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px 20px; display: flex; align-items: center; gap: 16px;
  box-shadow: var(--shadow-sm);
}
.astat-icon { width: 42px; height: 42px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.astat-value { font-family: 'Outfit', sans-serif; font-size: 1.7rem; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
.astat-label { font-size: 0.72rem; color: var(--text3); margin-top: 3px; }
.global-progress-card { flex: 1.5; }
.global-bar { height: 4px; background: var(--surface3); border-radius: 99px; margin-top: 8px; overflow: hidden; width: 100%; }
.global-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent3)); border-radius: 99px; transition: width 0.6s ease; }

/* ---- ACTIONS BAR ---- */
.admin-actions-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.05rem; display: flex; align-items: center; gap: 8px; color: var(--text2); letter-spacing: -0.01em; }
.section-title i { color: var(--accent); }

/* ---- EMPLOYEE GRID ---- */
.employees-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.employee-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; gap: 18px;
  transition: var(--transition); box-shadow: var(--shadow-sm);
}
.employee-card:hover { border-color: var(--accent); box-shadow: var(--shadow-hover); transform: translateY(-4px); }

/* ---- EMP HEADER ---- */
.emp-header { display: flex; align-items: center; gap: 12px; }
.emp-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.9rem; flex-shrink: 0; color: #fff;
}
.emp-info { flex: 1; }
.emp-name { font-weight: 700; font-size: 0.95rem; }
.emp-email { font-size: 0.75rem; color: var(--text3); margin-top: 2px; }
.emp-badge { font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 99px; white-space: nowrap; }
.badge-excellent { background: rgba(67,217,162,0.15); color: var(--accent3); }
.badge-good      { background: rgba(247,151,30,0.15);  color: var(--accent4); }
.badge-progress  { background: rgba(124,106,247,0.15); color: var(--accent); }
.badge-low       { background: rgba(255,101,132,0.15); color: var(--accent2); }

/* ---- PROGRESS ---- */
.emp-progress-section { display: flex; flex-direction: column; gap: 6px; }
.emp-progress-header { display: flex; justify-content: space-between; align-items: center; }
.emp-progress-label { font-size: 0.78rem; color: var(--text2); font-weight: 600; }
.emp-progress-pct { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.01em; }
.emp-progress-bar { height: 10px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.emp-progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }

/* ---- MINI STATS ---- */
.emp-mini-stats { display: flex; gap: 8px; }
.mini-stat {
  flex: 1; background: var(--surface2); border-radius: var(--radius-sm);
  padding: 8px; text-align: center; font-size: 0.82rem; display: flex; flex-direction: column; gap: 3px; align-items: center;
}
.mini-stat span:nth-child(2) { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; letter-spacing: -0.01em; }
.mini-label { font-size: 0.65rem; color: var(--text3); }

/* ---- TASK LIST ---- */
.emp-tasks { display: flex; flex-direction: column; gap: 6px; }
.emp-tasks-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text3); margin-bottom: 2px; }
.emp-task-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; background: var(--surface2); border-radius: var(--radius-sm);
  cursor: pointer; transition: var(--transition); gap: 10px;
}
.emp-task-row:hover { background: var(--surface3); }
.emp-task-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.emp-task-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.task-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.task-status-dot.pending    { background: var(--text3); }
.task-status-dot.in_progress { background: var(--accent4); }
.task-status-dot.done       { background: var(--accent3); }
.emp-task-name { font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.task-mini-bar { width: 60px; height: 5px; background: var(--surface3); border-radius: 99px; overflow: hidden; }
.task-mini-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.task-mini-pct { font-size: 0.72rem; font-weight: 700; min-width: 32px; text-align: right; }
.priority-dot { width: 6px; height: 6px; border-radius: 50%; }
.prio-high   { background: var(--accent2); }
.prio-medium { background: var(--accent4); }
.prio-low    { background: var(--accent3); }

/* ---- FOOTER ---- */
.emp-footer { padding-top: 4px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
</style>
