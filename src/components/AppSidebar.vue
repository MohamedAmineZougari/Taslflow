<template>
  <div class="sidebar">
    <!-- ADMIN SIDEBAR -->
    <template v-if="role === 'admin'">
      <div class="sidebar-section">Administration</div>
      <div :class="['sidebar-item', modelValue === 'admin' ? 'active' : '']" @click="$emit('update:modelValue', 'admin')">
        <i class="fas fa-tachometer-alt"></i> Tableau de bord
      </div>
      <div :class="['sidebar-item', modelValue === 'board' ? 'active' : '']" @click="$emit('update:modelValue', 'board')">
        <i class="fas fa-th-large"></i> Kanban
      </div>

      <div class="sidebar-section">Équipe</div>
      <div v-for="emp in employees" :key="emp.id" class="sidebar-item sidebar-emp"
           @click="$emit('update:modelValue', 'admin')">
        <div class="emp-dot">{{ emp.avatar || emp.name.slice(0,2).toUpperCase() }}</div>
        {{ emp.name }}
      </div>
      <div v-if="!employees.length" style="padding:6px 10px;font-size:0.75rem;color:var(--text3)">
        Aucun employé
      </div>
    </template>

    <!-- EMPLOYEE SIDEBAR -->
    <template v-else>
      <div class="sidebar-section">Navigation</div>
      <div :class="['sidebar-item', modelValue === 'employee' ? 'active' : '']" @click="$emit('update:modelValue', 'employee')">
        <i class="fas fa-briefcase"></i> Mes tâches
        <span class="sidebar-count">{{ myTasksCount }}</span>
      </div>
      <div :class="['sidebar-item', modelValue === 'board' ? 'active' : '']" @click="$emit('update:modelValue', 'board')">
        <i class="fas fa-th-large"></i> Kanban
      </div>
      <div :class="['sidebar-item', modelValue === 'today' ? 'active' : '']" @click="$emit('update:modelValue', 'today')">
        <i class="fas fa-sun"></i> Aujourd'hui
        <span class="sidebar-count">{{ todayCount }}</span>
      </div>
      <div :class="['sidebar-item', modelValue === 'overdue' ? 'active' : '']" @click="$emit('update:modelValue', 'overdue')">
        <i class="fas fa-exclamation-circle"></i> En retard
        <span class="sidebar-count" style="color:#ff6584">{{ overdueCount }}</span>
      </div>
      <div :class="['sidebar-item', modelValue === 'reminders' ? 'active' : '']" @click="$emit('update:modelValue', 'reminders')">
        <i class="fas fa-bell"></i> Rappels
        <span class="sidebar-count">{{ remindersCount }}</span>
      </div>
      <div class="sidebar-section">Projets</div>
      <div v-for="col in columns" :key="col.id" class="sidebar-item" @click="$emit('scrollToCol', col.id)">
        <span :style="{ width:'8px', height:'8px', borderRadius:'50%', background: col.color, display:'inline-block' }"></span>
        {{ col.title }}
        <span class="sidebar-count">{{ col.tasks.length }}</span>
      </div>
    </template>

    <!-- COMMON BOTTOM -->
    <div class="sidebar-section">Paramètres</div>
    <div v-if="role !== 'admin'" class="sidebar-item" @click="$emit('openPremium')">
      <i class="fas fa-crown" :style="{ color: isPremium ? '#ffd700' : '' }"></i>
      {{ isPremium ? 'Premium actif' : 'Passer Premium' }}
    </div>
    <div class="sidebar-item danger" @click="$emit('logout')">
      <i class="fas fa-sign-out-alt"></i> Déconnexion
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  role: String,
  columns: Array,
  employees: Array,
  isPremium: Boolean,
  todayCount: Number,
  overdueCount: Number,
  remindersCount: Number,
  myTasksCount: Number,
})
defineEmits(['update:modelValue', 'scrollToCol', 'openPremium', 'logout'])
</script>

<style scoped>
.sidebar {
  width: 220px; min-width: 220px; background: var(--surface);
  border-right: 1px solid var(--border); padding: 16px 12px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 2px;
  height: calc(100vh - 56px);
}
.sidebar-section { font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--text3); text-transform: uppercase; padding: 12px 8px 6px; }
.sidebar-item { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.84rem; color: var(--text2); transition: var(--transition); }
.sidebar-item:hover { background: var(--surface2); color: var(--text); }
.sidebar-item.active { background: rgba(99, 102, 241, 0.1); color: var(--accent); font-weight: 700; }
.sidebar-item.danger { margin-top: auto; margin-bottom: 20px; }
.sidebar-item.danger:hover { color: var(--accent2); background: rgba(255,101,132,0.08); }
.sidebar-count { margin-left: auto; font-size: 0.72rem; background: var(--surface3); padding: 1px 7px; border-radius: 99px; color: var(--text2); }
.sidebar-emp { }
.emp-dot {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
</style>
