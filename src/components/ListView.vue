<template>
  <div class="list-view">
    <div v-for="task in tasks" :key="task.id"
         :class="['list-task', 'priority-' + task.priority]"
         @click="$emit('openTask', { task, col: getColForTask(task) })">
      <i class="fas fa-circle" :style="{ color: getPriorityColor(task.priority), fontSize: '0.6rem' }"></i>
      <div class="list-task-title">{{ task.title }}</div>
      <div class="list-task-col">{{ getColForTask(task)?.title }}</div>
      <div class="task-meta-item" v-if="task.due_date"
           :class="isOverdue(task) ? 'overdue' : isDueSoon(task) ? 'due-soon' : ''">
        <i class="fas fa-calendar"></i> {{ formatDate(task.due_date) }}
      </div>
      <div class="task-reminder-badge" v-if="task.reminders.length">
        <i class="fas fa-bell"></i> {{ task.reminders.length }}
      </div>
    </div>
    <div class="empty-state" v-if="tasks.length === 0">
      <i class="fas fa-tasks"></i><p>Aucune tâche trouvée</p>
    </div>
  </div>
</template>

<script setup>
import { useTasks } from '../composables/useTasks.js'

defineProps({ tasks: Array })
defineEmits(['openTask'])

const { getPriorityColor, getColForTask, isOverdue, isDueSoon, formatDate } = useTasks()
</script>

<style scoped>
.list-view { display: flex; flex-direction: column; gap: 6px; }
.list-task {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition);
  border-left: 3px solid transparent;
}
.list-task:hover { border-color: var(--accent); }
.list-task.priority-high   { border-left-color: var(--accent2); }
.list-task.priority-medium { border-left-color: var(--accent4); }
.list-task.priority-low    { border-left-color: var(--accent3); }
.list-task-title { flex: 1; font-size: 0.88rem; font-weight: 500; }
.list-task-col { font-size: 0.75rem; color: var(--text3); padding: 2px 8px; background: var(--surface2); border-radius: 99px; }
</style>
