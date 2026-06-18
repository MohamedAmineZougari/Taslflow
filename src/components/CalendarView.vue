<template>
  <div>
    <!-- Premium lock -->
    <div v-if="!isPremium" class="cal-lock" @click="$emit('openPremium')">
      <i class="fas fa-crown" style="font-size:3rem;color:var(--gold);display:block;margin-bottom:12px"></i>
      <div class="cal-lock-title">Vue Calendrier — Premium</div>
      <div class="cal-lock-sub">Visualisez vos tâches dans un calendrier mensuel</div>
      <button class="btn" style="background:var(--premium);color:#000;font-weight:700;margin-top:16px"
              @click.stop="$emit('activatePremium')">
        Activer Premium
      </button>
    </div>

    <!-- Calendar -->
    <div v-else>
      <div class="cal-nav">
        <button class="btn btn-ghost btn-sm" @click="prevMonth"><i class="fas fa-chevron-left"></i></button>
        <div class="cal-month-name">{{ monthName }}</div>
        <button class="btn btn-ghost btn-sm" @click="nextMonth"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="cal-weekdays">
        <div v-for="d in ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']" :key="d">{{ d }}</div>
      </div>
      <div class="calendar-grid">
        <div v-for="cell in cells" :key="cell.date"
             :class="['calendar-cell', cell.isToday ? 'today' : '']">
          <div class="calendar-day-num">{{ cell.day }}</div>
          <div v-for="task in cell.tasks" :key="task.id"
               class="cal-task-chip"
               :style="{ background: getPriorityColor(task.priority)+'30', color: getPriorityColor(task.priority) }"
               @click="$emit('openTask', { task, col: getColForTask(task) })">
            {{ task.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTasks } from '../composables/useTasks.js'

const props = defineProps({ isPremium: Boolean, columns: Array })
defineEmits(['openPremium', 'activatePremium', 'openTask'])

const { getPriorityColor, getColForTask } = useTasks()

const year  = ref(new Date().getFullYear())
const month = ref(new Date().getMonth())

const monthName = computed(() =>
  new Date(year.value, month.value, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

function prevMonth() { if (month.value === 0) { month.value = 11; year.value-- } else month.value-- }
function nextMonth() { if (month.value === 11) { month.value = 0; year.value++ } else month.value++ }

const cells = computed(() => {
  const y = year.value, m = month.value
  const first = new Date(y, m, 1)
  let startDay = first.getDay()
  startDay = startDay === 0 ? 6 : startDay - 1
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const today = new Date(); today.setHours(0,0,0,0)
  const result = []
  for (let i = 0; i < startDay; i++) result.push({ day: '', date: `e-${i}`, tasks: [], isToday: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d)
    const dateStr = date.toDateString()
    const tasks = []
    props.columns.forEach(c => c.tasks.forEach(t => {
      if (t.due_date && new Date(t.due_date).toDateString() === dateStr) tasks.push(t)
    }))
    result.push({ day: d, date: `${y}-${m}-${d}`, tasks, isToday: date.getTime() === today.getTime() })
  }
  return result
})
</script>

<style scoped>
.cal-lock {
  background: var(--surface); border-radius: var(--radius); padding: 60px;
  text-align: center; border: 2px dashed var(--border); cursor: pointer;
}
.cal-lock-title { font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 1.2rem; margin-bottom: 8px; }
.cal-lock-sub { color: var(--text2); font-size: 0.88rem; }
.cal-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.cal-month-name { font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 1.1rem; }
.cal-weekdays {
  display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-bottom: 6px;
}
.cal-weekdays div { text-align: center; font-size: 0.72rem; font-weight: 700; color: var(--text3); padding: 4px; }
.calendar-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }
.calendar-cell {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); min-height: 90px; padding: 6px; overflow: hidden;
}
.calendar-cell.today { border-color: var(--accent); background: rgba(124,106,247,0.06); }
.calendar-day-num { font-weight: 700; font-size: 0.82rem; margin-bottom: 4px; color: var(--text2); }
.calendar-cell.today .calendar-day-num { color: var(--accent); }
.cal-task-chip {
  font-size: 0.65rem; border-radius: 4px; padding: 2px 5px; margin-bottom: 2px;
  cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;
}
</style>
