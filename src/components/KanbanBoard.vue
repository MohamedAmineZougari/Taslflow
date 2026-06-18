<template>
  <div class="board">
    <div v-for="col in columns" :key="col.id"
         :id="'col-' + col.id"
         :class="['column', draggingOverCol === col.id ? 'drag-over' : '']"
         @dragover.prevent="draggingOverCol = col.id"
         @drop="onDrop(col)">

      <div class="column-header">
        <div class="column-dot" :style="{ background: col.color }"></div>
        <div class="column-title">{{ col.title }}</div>
        <div class="column-count">{{ filteredTasks(col).length }}</div>
        <div class="column-menu-btn" @click="$emit('deleteColumn', col)" title="Supprimer">
          <i class="fas fa-times"></i>
        </div>
      </div>

      <div class="column-body">
        <div v-for="task in filteredTasks(col)" :key="task.id"
             :class="['task-card', 'priority-' + task.priority]"
             draggable="true"
             @dragstart="onDragStart(task, col)"
             @click="$emit('openTask', { task, col })">

          <div class="task-labels" v-if="task.labels.length">
            <span v-for="lbl in task.labels" :key="lbl" class="task-label"
                  :style="{ background: getLabelColor(lbl) + '30', color: getLabelColor(lbl) }">
              {{ lbl }}
            </span>
          </div>
          <div class="task-title">{{ task.title }}</div>
          <div class="task-desc" v-if="task.description">
            {{ task.description.slice(0, 80) }}{{ task.description.length > 80 ? '..' : '' }}
          </div>
          <div class="task-meta">
            <div :class="['task-meta-item', isOverdue(task) ? 'overdue' : isDueSoon(task) ? 'due-soon' : '']"
                 v-if="task.due_date">
              <i class="fas fa-calendar-alt"></i> {{ formatDate(task.due_date) }}
            </div>
            <div class="task-meta-item" v-if="task.checklist.length">
              <i class="fas fa-check-square"></i>
              {{ task.checklist.filter(c => c.done).length }}/{{ task.checklist.length }}
            </div>
            <div class="task-reminder-badge" v-if="task.reminders.length">
              <i class="fas fa-bell"></i> {{ task.reminders.length }}
            </div>
            <div class="task-assignee" v-if="task.assignee">{{ task.assignee.slice(0, 2).toUpperCase() }}</div>
          </div>
          <div class="task-checklist-bar" v-if="task.checklist.length">
            <div class="task-checklist-fill" :style="{ width: checklistProgress(task) + '%' }"></div>
          </div>
        </div>

        <div class="empty-state" v-if="filteredTasks(col).length === 0">
          <i class="fas fa-inbox"></i><p>Aucune tâche</p>
        </div>
        <div class="add-task-btn" @click="$emit('addTask', col)">
          <i class="fas fa-plus"></i> Ajouter une tâche
        </div>
      </div>
    </div>

    <div class="add-col-btn" @click="$emit('addColumn')">
      <i class="fas fa-plus"></i> Ajouter une colonne
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTasks } from '../composables/useTasks.js'

const props = defineProps({
  columns: Array,
  search: String,
  priority: String,
})
const emit = defineEmits(['openTask', 'addTask', 'addColumn', 'deleteColumn', 'moved'])

const { getLabelColor, isOverdue, isDueSoon, formatDate, checklistProgress } = useTasks()

const draggingTask = ref(null)
const draggingFromCol = ref(null)
const draggingOverCol = ref(null)

function filteredTasks(col) {
  return col.tasks.filter(t => {
    if (props.search && !t.title.toLowerCase().includes(props.search.toLowerCase())) return false
    if (props.priority && t.priority !== props.priority) return false
    return true
  })
}

function onDragStart(task, col) {
  draggingTask.value = task
  draggingFromCol.value = col
}

function onDrop(col) {
  if (draggingTask.value && draggingFromCol.value?.id !== col.id) {
    emit('moved', { task: draggingTask.value, from: draggingFromCol.value, to: col })
  }
  draggingTask.value = null
  draggingFromCol.value = null
  draggingOverCol.value = null
}
</script>

<style scoped>
.board {
  display: flex; gap: 14px; overflow-x: auto; padding-bottom: 16px;
  min-height: 400px; align-items: flex-start;
}
.column {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius); min-width: 280px; width: 280px;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 240px); transition: var(--transition); flex-shrink: 0;
}
.column.drag-over { border-color: var(--accent); background: rgba(124,106,247,0.05); }
.column-header {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 14px 10px; border-bottom: 1px solid var(--border);
}
.column-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.column-title { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; flex: 1; letter-spacing: -0.01em; }
.column-count { font-size: 0.72rem; background: var(--surface2); padding: 2px 8px; border-radius: 99px; color: var(--text2); }
.column-menu-btn { cursor: pointer; color: var(--text3); font-size: 0.8rem; padding: 4px; transition: var(--transition); border-radius: 4px; }
.column-menu-btn:hover { color: var(--accent2); background: rgba(255,101,132,0.1); }
.column-body { overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; flex: 1; }

.task-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 16px; cursor: pointer;
  transition: var(--transition); border-left: 4px solid transparent;
  box-shadow: var(--shadow-sm);
}
.task-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: var(--shadow-hover); }
.task-card.priority-high   { border-left-color: var(--accent2); }
.task-card.priority-medium { border-left-color: var(--accent4); }
.task-card.priority-low    { border-left-color: var(--accent3); }
.task-title { font-size: 0.9rem; font-weight: 600; line-height: 1.4; margin-bottom: 6px; color: var(--text); }
.task-desc { font-size: 0.76rem; color: var(--text2); margin-bottom: 8px; line-height: 1.45; }
.task-labels { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.task-label { font-size: 0.68rem; padding: 2px 7px; border-radius: 99px; font-weight: 600; }
.task-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.task-assignee {
  width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
  font-size: 0.62rem; font-weight: 700; display: flex; align-items: center;
  justify-content: center; margin-left: auto;
}
.add-task-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 10px;
  border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem;
  color: var(--text3); transition: var(--transition);
  border: 1px dashed transparent; margin-top: 2px;
}
.add-task-btn:hover { color: var(--accent); border-color: rgba(124,106,247,0.3); background: rgba(124,106,247,0.05); }
.add-col-btn {
  display: flex; align-items: center; gap: 8px; padding: 14px 18px;
  background: var(--surface); border: 1px dashed var(--border);
  border-radius: var(--radius); cursor: pointer; font-size: 0.85rem;
  color: var(--text2); transition: var(--transition);
  min-width: 200px; flex-shrink: 0; align-self: flex-start;
}
.add-col-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(124,106,247,0.05); }
</style>
