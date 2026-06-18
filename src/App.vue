<template>
  <div>
    <ToastContainer />

    <!-- NOTIFICATION PERMISSION BANNER -->
    <div v-if="isAuthenticated && !bannerDismissed && notifPermission === 'default'" class="notif-banner">
      <i class="fas fa-bell"></i>
      <span>Activez les notifications pour recevoir vos rappels de tâches en temps réel.</span>
      <button class="btn btn-primary btn-sm" @click="requestNotifPermission">Activer</button>
      <button class="btn btn-ghost btn-sm" @click="dismissBanner"><i class="fas fa-times"></i></button>
    </div>
    <div v-if="isAuthenticated && !bannerDismissed && notifPermission === 'denied'" class="notif-banner notif-banner--denied">
      <i class="fas fa-bell-slash"></i>
      <span>Notifications bloquées. Autorisez-les dans les paramètres de votre navigateur pour recevoir les rappels.</span>
      <button class="btn btn-ghost btn-sm" @click="dismissBanner"><i class="fas fa-times"></i></button>
    </div>

    <!-- AUTH -->
    <AuthView v-if="!isAuthenticated" @auth="handleAuth" />

    <!-- APP -->
    <template v-else>
      <AppHeader
        v-model="currentView"
        :isPremium="isPremium"
        :role="currentUser.role"
        @openPremium="showPremiumModal = true"
        @update:modelValue="onViewChange"
      />

      <div class="layout">
        <AppSidebar
          v-model="activePage"
          :role="currentUser.role"
          :columns="columns"
          :employees="employees"
          :isPremium="isPremium"
          :todayCount="todayTasks.length"
          :overdueCount="overdueTasks.length"
          :remindersCount="allReminders.length"
          :myTasksCount="myTasksCount"
          @scrollToCol="scrollToCol"
          @openPremium="showPremiumModal = true"
          @logout="logout"
        />

        <div class="main">
          <!-- ===================== ADMIN PAGES ===================== -->
          <template v-if="currentUser.role === 'admin'">

            <!-- Admin dashboard -->
            <AdminDashboard
              v-if="activePage === 'admin'"
              @assignTask="openAssignModal"
              @viewTask="openTaskDetail"
            />

            <!-- Admin kanban -->
            <template v-if="activePage === 'board'">
              <StatsBar :total="totalTasks" :completed="completedTasks"
                        :overdue="overdueTasks.length" :today="todayTasks.length"
                        :reminders="allReminders.length" />
              <div class="page-title">Tableau Kanban</div>
              <div class="page-sub">Glissez-déposez vos tâches entre les colonnes</div>
              <BoardControls v-model:search="searchQuery" v-model:priority="filterPriority"
                             @newTask="openAddTask(null)" />
              <KanbanBoard :columns="columns" :search="searchQuery" :priority="filterPriority"
                           @openTask="({task,col}) => openTaskDetail2(task, col)"
                           @addTask="col => openAddTask(col)"
                           @addColumn="handleAddColumn"
                           @deleteColumn="handleDeleteColumn"
                           @moved="handleMoved" />
            </template>
          </template>

          <!-- ===================== EMPLOYEE PAGES ===================== -->
          <template v-else>

            <!-- My assigned tasks -->
            <EmployeeView
              v-if="activePage === 'employee'"
              @openTask="openTaskDetail"
            />

            <!-- Employee kanban -->
            <template v-if="activePage === 'board' && currentView === 'board'">
              <StatsBar :total="totalTasks" :completed="completedTasks"
                        :overdue="overdueTasks.length" :today="todayTasks.length"
                        :reminders="allReminders.length" />
              <div class="page-title">Tableau Kanban</div>
              <div class="page-sub">Vos tâches personnelles</div>
              <BoardControls v-model:search="searchQuery" v-model:priority="filterPriority"
                             @newTask="openAddTask(null)" />
              <KanbanBoard :columns="columns" :search="searchQuery" :priority="filterPriority"
                           @openTask="({task,col}) => openTaskDetail2(task, col)"
                           @addTask="col => openAddTask(col)"
                           @addColumn="handleAddColumn"
                           @deleteColumn="handleDeleteColumn"
                           @moved="handleMoved" />
            </template>

            <ListView v-if="currentView === 'list'" :tasks="allFilteredTasks"
                      @openTask="({task,col}) => openTaskDetail2(task, col)" />

            <CalendarView v-if="currentView === 'calendar'" :isPremium="isPremium" :columns="columns"
                          @openPremium="showPremiumModal = true" @activatePremium="activatePremium"
                          @openTask="({task,col}) => openTaskDetail2(task, col)" />

            <ListView v-if="activePage === 'today'" :tasks="todayTasks"
                      @openTask="({task,col}) => openTaskDetail2(task, col)" />

            <ListView v-if="activePage === 'overdue'" :tasks="overdueTasks"
                      @openTask="({task,col}) => openTaskDetail2(task, col)" />

            <div v-if="activePage === 'reminders'">
              <div class="reminder-list">
                <div v-for="rem in allReminders" :key="rem.id" class="reminder-item">
                  <i class="fas fa-bell"></i>
                  <div style="flex:1">
                    <div style="font-weight:600;font-size:0.85rem">{{ rem.taskTitle }}</div>
                    <div style="color:var(--text2);font-size:0.78rem">{{ formatDateTime(rem.datetime) }}</div>
                  </div>
                  <button class="btn btn-ghost btn-sm"
                          @click="openTaskDetail2(rem.task, getColForTask(rem.task))">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              <div class="empty-state" v-if="allReminders.length === 0">
                <i class="fas fa-bell-slash"></i><p>Aucun rappel programmé</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ASSIGN TASK MODAL (admin) -->
      <AssignTaskModal
        v-if="showAssignModal"
        :employees="employees"
        :preselectedEmployee="preselectedEmployee"
        @close="showAssignModal = false"
        @assign="handleAssign"
      />

      <!-- TASK DETAIL MODAL (assigned tasks) -->
      <TaskDetailModal
        v-if="showTaskDetailModal && selectedAssignment"
        :task="selectedAssignment"
        @close="showTaskDetailModal = false"
        @delete="handleDeleteAssignment"
      />

      <!-- KANBAN TASK MODAL -->
      <TaskModal
        v-if="showTaskModal"
        :task="editingTask"
        :col="modalCol"
        :columns="columns"
        :isPremium="isPremium"
        @close="showTaskModal = false"
        @save="handleSaveTask"
        @delete="handleDeleteTask"
        @openPremium="showPremiumModal = true"
      />

      <!-- PREMIUM MODAL -->
      <PremiumModal
        v-if="showPremiumModal"
        :isPremium="isPremium"
        @close="showPremiumModal = false"
        @activate="activatePremium"
        @deactivate="deactivatePremium"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import ToastContainer   from './components/ToastContainer.vue'
import AuthView         from './components/AuthView.vue'
import AppHeader        from './components/AppHeader.vue'
import AppSidebar       from './components/AppSidebar.vue'
import StatsBar         from './components/StatsBar.vue'
import BoardControls    from './components/BoardControls.vue'
import KanbanBoard      from './components/KanbanBoard.vue'
import ListView         from './components/ListView.vue'
import CalendarView     from './components/CalendarView.vue'
import TaskModal        from './components/TaskModal.vue'
import PremiumModal     from './components/PremiumModal.vue'
import AdminDashboard   from './components/AdminDashboard.vue'
import AssignTaskModal  from './components/AssignTaskModal.vue'
import TaskDetailModal  from './components/TaskDetailModal.vue'
import EmployeeView     from './components/EmployeeView.vue'

import { useToast }         from './composables/useToast.js'
import { useTasks }         from './composables/useTasks.js'
import { useAuth }          from './composables/useAuth.js'
import { useAdmin }         from './composables/useAdmin.js'
import { useTheme }         from './composables/useTheme.js'
import { useNotifications } from './composables/useNotifications.js'

const { addToast } = useToast()
const { initTheme } = useTheme()
const { notifPermission, requestNotifPermission, start: startNotifications } = useNotifications()

const {
  columns, totalTasks, completedTasks, overdueTasks, todayTasks, allReminders,
  getColForTask, formatDateTime,
  addColumn, deleteColumn, createTask, updateTask, deleteTask, moveTask,
  saveData, loadData,
} = useTasks()

const { isAuthenticated, currentUser, login, signup, logout: authLogout, getEmployees } = useAuth()
const { assignTask, deleteAssignment, assignments, fetchAssignments, refreshEmployeeStats } = useAdmin()

// Employees list — populated after login / session restore
const employees = ref([])

initTheme()

// Banner dismiss
const bannerDismissed = ref(false)
function dismissBanner() { bannerDismissed.value = true }

// ── Restore full app state on page load if session exists ────────────────
onMounted(async () => {
  if (isAuthenticated.value && currentUser.value) {
    // Session was restored from localStorage — re-fetch everything from DB
    const user = currentUser.value
    const data = await loadData(user.id)
    if (data) isPremium.value = data.isPremium || false
    activePage.value = user.role === 'admin' ? 'admin' : 'employee'
    employees.value  = await getEmployees()
    await fetchAssignments()
    await refreshEmployeeStats()
  }
  // Start the reminder notification ticker
  startNotifications()
})

/* ---- AUTH ---- */
async function handleAuth({ mode, name, email, password }) {
  if (mode === 'signup') {
    const res = await signup(name, email, password)
    if (!res.ok) { addToast('error', 'Erreur', res.error); return }
    activePage.value = 'employee'
    addToast('success', 'Bienvenue !', `Compte créé pour ${name}`)
    await fetchAssignments()
  } else {
    const res = await login(email, password)
    if (!res.ok) { addToast('error', 'Erreur', res.error); return }
    const data = await loadData(res.user.id)
    if (data) isPremium.value = data.isPremium || false
    activePage.value = res.user.role === 'admin' ? 'admin' : 'employee'
    addToast('success', 'Connecté !', `Bonjour ${res.user.name}`)
    // Load employees list and assignments from DB
    employees.value = await getEmployees()
    await fetchAssignments()
    await refreshEmployeeStats()
  }
}

async function logout() {
  if (currentUser.value) await saveData(currentUser.value.id)
  authLogout()
  employees.value = []
  addToast('info', 'Déconnecté', '')
}

/* ---- STATE ---- */
const isPremium         = ref(false)
const activePage        = ref('board')
const currentView       = ref('board')
const searchQuery       = ref('')
const filterPriority    = ref('')
const showTaskModal     = ref(false)
const showPremiumModal  = ref(false)
const showAssignModal   = ref(false)
const showTaskDetailModal = ref(false)
const editingTask       = ref(null)
const modalCol          = ref(null)
const preselectedEmployee = ref(null)
const selectedAssignment  = ref(null)

const myTasksCount = computed(() =>
  assignments.value.filter(a => a.assignedTo === currentUser.value?.id).length
)

const allFilteredTasks = computed(() => {
  const all = []
  columns.value.forEach(c => c.tasks.forEach(t => {
    if (searchQuery.value && !t.title.toLowerCase().includes(searchQuery.value.toLowerCase())) return
    if (filterPriority.value && t.priority !== filterPriority.value) return
    all.push(t)
  }))
  return all
})

/* ---- VIEW CHANGE ---- */
function onViewChange(view) {
  if (view === 'calendar' && !isPremium.value) { showPremiumModal.value = true; currentView.value = 'board'; return }
  currentView.value = view
  if (view !== 'calendar' && view !== 'list') activePage.value = 'board'
}

/* ---- SCROLL ---- */
function scrollToCol(colId) {
  activePage.value = 'board'; currentView.value = 'board'
  setTimeout(() => {
    const el = document.getElementById('col-' + colId)
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center' })
  }, 100)
}

/* ---- KANBAN MODAL ---- */
function openAddTask(col) { editingTask.value = null; modalCol.value = col; showTaskModal.value = true }
function openTaskDetail2(task, col) { editingTask.value = task; modalCol.value = col; showTaskModal.value = true }

async function handleSaveTask(form) {
  if (editingTask.value) { updateTask(editingTask.value, form); addToast('success', 'Tâche mise à jour', form.title) }
  else { createTask(form); addToast('success', 'Tâche créée', form.title) }
  showTaskModal.value = false; editingTask.value = null
  await saveData(currentUser.value?.id)
}
async function handleDeleteTask() {
  if (!editingTask.value) return
  deleteTask(editingTask.value); addToast('info', 'Tâche supprimée', '')
  showTaskModal.value = false; editingTask.value = null
  await saveData(currentUser.value?.id)
}

/* ---- COLUMN ---- */
async function handleAddColumn() {
  const t = addColumn(); if (t) { addToast('success', 'Colonne créée', t); await saveData(currentUser.value?.id) }
}
async function handleDeleteColumn(col) {
  if (deleteColumn(col)) { addToast('info', 'Colonne supprimée', ''); await saveData(currentUser.value?.id) }
}
async function handleMoved({ task, from, to }) {
  moveTask(task, from, to); addToast('success', 'Tâche déplacée', `vers "${to.title}"`); await saveData(currentUser.value?.id)
}

/* ---- ASSIGN (admin) ---- */
function openAssignModal(employee) {
  preselectedEmployee.value = employee || null
  showAssignModal.value = true
}
async function handleAssign(form) {
  await assignTask(form)
  showAssignModal.value = false
  const emp = employees.value.find(e => e.id === form.assignedTo)
  addToast('success', 'Tâche assignée !', `À ${emp?.name || ''}`)
}

/* ---- VIEW ASSIGNED TASK ---- */
function openTaskDetail(task) {
  selectedAssignment.value = task
  showTaskDetailModal.value = true
}
async function handleDeleteAssignment(id) {
  await deleteAssignment(id)
  showTaskDetailModal.value = false
  addToast('info', 'Tâche supprimée', '')
}

/* ---- PREMIUM ---- */
async function activatePremium() { isPremium.value = true; showPremiumModal.value = false; addToast('success', '🎉 Premium activé !', ''); await saveData(currentUser.value?.id) }
async function deactivatePremium() { isPremium.value = false; showPremiumModal.value = false; addToast('info', 'Mode Free activé', ''); await saveData(currentUser.value?.id) }
</script>

<style scoped>
.layout { display: flex; height: calc(100vh - 56px); overflow: hidden; }
.main { flex: 1; overflow-y: auto; padding: 20px 24px; }
.page-title { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; margin-bottom: 2px; letter-spacing: -0.02em; }
.page-sub { font-size: 0.82rem; color: var(--text2); margin-bottom: 16px; }

/* ── Notification permission banner ── */
.notif-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 20px;
  background: linear-gradient(90deg, rgba(247,151,30,0.15), rgba(247,151,30,0.08));
  border-bottom: 1px solid rgba(247,151,30,0.35);
  font-size: 0.84rem; color: var(--text);
  animation: bannerIn 0.4s ease;
}
.notif-banner--denied {
  background: linear-gradient(90deg, rgba(255,101,132,0.12), rgba(255,101,132,0.06));
  border-bottom-color: rgba(255,101,132,0.3);
}
.notif-banner i:first-child {
  color: var(--accent4);
  font-size: 1rem;
  animation: bellPulse 1.5s ease-in-out infinite;
}
.notif-banner--denied i:first-child { color: var(--accent2); animation: none; }
.notif-banner span { flex: 1; }
@keyframes bannerIn {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bellPulse {
  0%, 100% { transform: rotate(0deg);   }
  20%       { transform: rotate(-15deg); }
  40%       { transform: rotate(15deg);  }
  60%       { transform: rotate(-10deg); }
  80%       { transform: rotate(10deg);  }
}
</style>

