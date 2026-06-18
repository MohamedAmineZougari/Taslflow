<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div :style="{ width:'10px', height:'10px', borderRadius:'50%', background: col?.color || 'var(--accent)', flexShrink:0 }"></div>
        <div class="modal-title">{{ task ? 'Modifier la tâche' : 'Nouvelle tâche' }}</div>
        <div class="modal-close" @click="$emit('close')"><i class="fas fa-times"></i></div>
      </div>

      <div class="tabs">
        <div :class="['tab', activeTab === 'details' ? 'active' : '']" @click="activeTab = 'details'">Détails</div>
        <div :class="['tab', activeTab === 'checklist' ? 'active' : '']" @click="activeTab = 'checklist'">
          Checklist
          <span v-if="form.checklist.length">
            ({{ form.checklist.filter(c => c.done).length }}/{{ form.checklist.length }})
          </span>
        </div>
        <div :class="['tab', activeTab === 'reminders' ? 'active' : '']" @click="activeTab = 'reminders'">
          Rappels <span v-if="form.reminders.length">({{ form.reminders.length }})</span>
        </div>
        <div :class="['tab', activeTab === 'activity' ? 'active' : '']" @click="activeTab = 'activity'" v-if="task">
          Activité
        </div>
      </div>

      <div class="modal-body">

        <!-- DETAILS -->
        <template v-if="activeTab === 'details'">
          <div class="form-group">
            <label class="form-label">Titre *</label>
            <input class="form-input" v-model="form.title" placeholder="Titre de la tâche..." @keyup.enter="save">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" v-model="form.desc" placeholder="Description optionnelle..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Colonne</label>
              <select class="form-select" v-model="form.colId">
                <option v-for="c in columns" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Assigné à</label>
              <input class="form-input" v-model="form.assignee" placeholder="Nom ou initiales...">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Échéance</label>
              <input class="form-input" type="datetime-local" v-model="form.dueDate">
            </div>
            <div class="form-group">
              <label class="form-label">Estimation (h)</label>
              <input class="form-input" type="number" v-model="form.estimate" placeholder="0" min="0" step="0.5">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Priorité</label>
            <div class="priority-grid">
              <div :class="['priority-opt', form.priority === 'high' ? 'selected-high' : 'unselected']"
                   @click="form.priority = 'high'"><i class="fas fa-fire"></i> Urgent</div>
              <div :class="['priority-opt', form.priority === 'medium' ? 'selected-medium' : 'unselected']"
                   @click="form.priority = 'medium'"><i class="fas fa-circle"></i> Moyen</div>
              <div :class="['priority-opt', form.priority === 'low' ? 'selected-low' : 'unselected']"
                   @click="form.priority = 'low'"><i class="fas fa-leaf"></i> Faible</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Étiquettes</label>
            <div class="labels-grid">
              <div v-for="lbl in availableLabels" :key="lbl.name"
                   :class="['label-chip', form.labels.includes(lbl.name) ? 'selected' : '']"
                   :style="{ background: lbl.color+'30', color: lbl.color, borderColor: form.labels.includes(lbl.name) ? lbl.color : 'transparent' }"
                   @click="toggleLabel(lbl.name)">
                {{ lbl.name }}
              </div>
            </div>
          </div>
          <div class="form-group" v-if="isPremium">
            <label class="form-label"><i class="fas fa-crown" style="color:var(--gold)"></i> Tag personnalisé</label>
            <input class="form-input" v-model="form.customTag" placeholder="Votre tag...">
          </div>
        </template>

        <!-- CHECKLIST -->
        <template v-if="activeTab === 'checklist'">
          <div class="checklist" v-if="form.checklist.length">
            <div v-for="(item, idx) in form.checklist" :key="idx" class="checklist-item">
              <input type="checkbox" v-model="item.done">
              <span :class="item.done ? 'done' : ''">{{ item.text }}</span>
              <span class="del-check" @click="form.checklist.splice(idx,1)"><i class="fas fa-trash"></i></span>
            </div>
          </div>
          <div class="empty-state" v-else style="padding:20px">
            <i class="fas fa-check-square" style="font-size:1.5rem"></i>
            <p>Ajoutez des sous-tâches ci-dessous</p>
          </div>
          <div class="checklist-add">
            <input class="form-input" v-model="newCheckItem" placeholder="Nouvelle sous-tâche..." @keyup.enter="addCheckItem">
            <button class="btn btn-primary btn-sm" @click="addCheckItem"><i class="fas fa-plus"></i></button>
          </div>
          <div v-if="form.checklist.length" style="margin-top:8px">
            <div class="task-checklist-bar" style="height:6px">
              <div class="task-checklist-fill" :style="{ width: checklistPct + '%' }"></div>
            </div>
            <div style="font-size:0.78rem;color:var(--text2);margin-top:4px">
              {{ form.checklist.filter(c=>c.done).length }} / {{ form.checklist.length }} terminées
            </div>
          </div>
        </template>

        <!-- REMINDERS -->
        <template v-if="activeTab === 'reminders'">
          <div class="reminder-list" v-if="form.reminders.length">
            <div v-for="(rem, idx) in form.reminders" :key="idx" class="reminder-item">
              <i class="fas fa-bell"></i>
              <span>{{ formatDateTime(rem.datetime) }} — {{ rem.note || 'Rappel' }}</span>
              <span class="reminder-del" @click="form.reminders.splice(idx,1)"><i class="fas fa-trash"></i></span>
            </div>
          </div>
          <div class="empty-state" v-else style="padding:20px">
            <i class="fas fa-bell-slash" style="font-size:1.5rem"></i>
            <p>Aucun rappel pour cette tâche</p>
          </div>
          <div class="form-group">
            <label class="form-label">Ajouter un rappel</label>
            <input class="form-input" type="datetime-local" v-model="newReminderDate" style="margin-bottom:8px">
            <input class="form-input" v-model="newReminderNote" placeholder="Note (optionnel)..." style="margin-bottom:8px">
            <button class="btn btn-primary btn-sm" @click="addReminder" :disabled="!newReminderDate">
              <i class="fas fa-bell"></i> Ajouter le rappel
            </button>
          </div>
          <div v-if="!isPremium" class="premium-hint" @click="$emit('openPremium')">
            <i class="fas fa-crown" style="color:var(--gold)"></i>
            <span>Premium: rappels récurrents & SMS</span>
          </div>
          <div v-if="isPremium" class="form-group">
            <label class="form-label"><i class="fas fa-crown" style="color:var(--gold)"></i> Rappel récurrent</label>
            <select class="form-select" v-model="form.recurrence">
              <option value="">Aucun</option>
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>
        </template>

        <!-- ACTIVITY -->
        <template v-if="activeTab === 'activity' && task">
          <div class="activity-log">
            <div v-for="act in (task.activity || [])" :key="act.id" class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-text" v-html="act.text"></div>
              <div class="activity-time">{{ act.time }}</div>
            </div>
            <div class="empty-state" v-if="!(task.activity || []).length" style="padding:20px">
              <i class="fas fa-history" style="font-size:1.5rem"></i>
              <p>Aucune activité enregistrée</p>
            </div>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Annuler</button>
        <button v-if="task" class="btn btn-danger btn-sm" @click="$emit('delete')">
          <i class="fas fa-trash"></i>
        </button>
        <button class="btn btn-primary" @click="save" :disabled="!form.title.trim()">
          <i class="fas fa-save"></i> {{ task ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useTasks } from '../composables/useTasks.js'

const props = defineProps({
  task: Object,       // null = new task
  col: Object,
  columns: Array,
  isPremium: Boolean,
})
const emit = defineEmits(['close', 'save', 'delete', 'openPremium'])

const { availableLabels, formatDateTime } = useTasks()

const activeTab = ref('details')
const newCheckItem = ref('')
const newReminderDate = ref('')
const newReminderNote = ref('')

const form = reactive({
  title: '', desc: '', colId: null, assignee: '',
  dueDate: '', estimate: '', priority: 'medium',
  labels: [], checklist: [], reminders: [], recurrence: '', customTag: '',
})

// Populate form when task/col change
watch(() => props.task, () => {
  activeTab.value = 'details'
  newCheckItem.value = ''
  newReminderDate.value = ''
  newReminderNote.value = ''
  if (props.task) {
    Object.assign(form, {
      title:      props.task.title,
      desc:       props.task.description,
      colId:      props.col?.id,
      assignee:   props.task.assignee,
      dueDate:    props.task.due_date || '',
      estimate:   props.task.estimate || '',
      priority:   props.task.priority,
      labels:     [...props.task.labels],
      checklist:  props.task.checklist.map(c => ({ ...c })),
      reminders:  props.task.reminders.map(r => ({ ...r })),
      recurrence: props.task.recurrence || '',
      customTag:  props.task.customTag || '',
    })
  } else {
    Object.assign(form, {
      title: '', desc: '', colId: props.col?.id || props.columns?.[0]?.id,
      assignee: '', dueDate: '', estimate: '', priority: 'medium',
      labels: [], checklist: [], reminders: [], recurrence: '', customTag: '',
    })
  }
}, { immediate: true })

const checklistPct = computed(() => {
  if (!form.checklist.length) return 0
  return Math.round(form.checklist.filter(c => c.done).length / form.checklist.length * 100)
})

function toggleLabel(name) {
  const idx = form.labels.indexOf(name)
  if (idx >= 0) form.labels.splice(idx, 1)
  else form.labels.push(name)
}

function addCheckItem() {
  if (!newCheckItem.value.trim()) return
  form.checklist.push({ text: newCheckItem.value.trim(), done: false })
  newCheckItem.value = ''
}

function addReminder() {
  if (!newReminderDate.value) return
  form.reminders.push({ datetime: newReminderDate.value, note: newReminderNote.value })
  newReminderDate.value = ''
  newReminderNote.value = ''
}

function save() {
  if (!form.title.trim()) return
  emit('save', { ...form, labels: [...form.labels], checklist: form.checklist.map(c=>({...c})), reminders: form.reminders.map(r=>({...r})) })
}
</script>

<style scoped>
.priority-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.priority-opt {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px; border-radius: var(--radius-sm); cursor: pointer;
  font-size: 0.82rem; font-weight: 500; transition: var(--transition); border: 1px solid transparent;
}
.priority-opt.unselected { background: var(--surface2); color: var(--text2); border-color: var(--border); }
.priority-opt.unselected:hover { border-color: var(--accent); color: var(--text); }
.priority-opt.selected-high   { background: rgba(255,101,132,0.15); color: var(--accent2); border-color: var(--accent2); }
.priority-opt.selected-medium { background: rgba(247,151,30,0.15);  color: var(--accent4); border-color: var(--accent4); }
.priority-opt.selected-low    { background: rgba(67,217,162,0.15);  color: var(--accent3); border-color: var(--accent3); }

.labels-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.label-chip {
  padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600;
  cursor: pointer; border: 1px solid transparent; transition: var(--transition);
}
.label-chip.selected { box-shadow: 0 0 0 1px currentColor; }

.checklist { display: flex; flex-direction: column; gap: 6px; }
.checklist-item { display: flex; align-items: center; gap: 8px; font-size: 0.84rem; padding: 6px 8px; border-radius: var(--radius-sm); }
.checklist-item:hover { background: var(--surface2); }
.checklist-item input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }
.checklist-item .done { text-decoration: line-through; color: var(--text3); }
.del-check { margin-left: auto; color: var(--text3); cursor: pointer; font-size: 0.75rem; opacity: 0; }
.checklist-item:hover .del-check { opacity: 1; }
.del-check:hover { color: var(--accent2); }
.checklist-add { display: flex; gap: 8px; }
.checklist-add input { flex: 1; }

.premium-hint {
  background: rgba(247,151,30,0.08); border: 1px solid rgba(247,151,30,0.2);
  border-radius: var(--radius-sm); padding: 12px; text-align: center;
  cursor: pointer; font-size: 0.82rem; color: var(--text2);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
</style>
