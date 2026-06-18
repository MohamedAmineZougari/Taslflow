<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal assign-modal">
      <div class="modal-header">
        <div class="header-icon"><i class="fas fa-user-plus"></i></div>
        <div class="modal-title">Assigner une tâche</div>
        <div class="modal-close" @click="$emit('close')"><i class="fas fa-times"></i></div>
      </div>

      <div class="modal-body">
        <!-- Employee select -->
        <div class="form-group">
          <label class="form-label">Employé *</label>
          <div class="emp-select-grid">
            <div v-for="emp in employees" :key="emp.id"
                 :class="['emp-select-chip', form.assignedTo === emp.id ? 'selected' : '']"
                 @click="form.assignedTo = emp.id">
              <div class="chip-avatar">{{ emp.avatar || emp.name.slice(0,2).toUpperCase() }}</div>
              <div class="chip-name">{{ emp.name }}</div>
              <i v-if="form.assignedTo === emp.id" class="fas fa-check chip-check"></i>
            </div>
          </div>
          <div v-if="employees.length === 0" class="no-emp-hint">
            <i class="fas fa-info-circle"></i> Aucun employé inscrit pour le moment.
          </div>
        </div>

        <!-- Task title -->
        <div class="form-group">
          <label class="form-label">Titre de la tâche *</label>
          <input class="form-input" v-model="form.title" placeholder="Ex: Créer la maquette de la page d'accueil" />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" v-model="form.description" placeholder="Détails, consignes, ressources..."></textarea>
        </div>

        <!-- Priority + Due date -->
        <div class="form-row">
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
            <label class="form-label">Échéance</label>
            <input class="form-input" type="datetime-local" v-model="form.dueDate" />
          </div>
        </div>

        <!-- Checklist -->
        <div class="form-group">
          <label class="form-label">Sous-tâches (checklist)</label>
          <div class="checklist-items" v-if="form.checklist.length">
            <div v-for="(item, idx) in form.checklist" :key="idx" class="check-row">
              <i class="fas fa-grip-vertical drag-handle" style="color:var(--text3);font-size:0.75rem"></i>
              <input class="form-input check-input" v-model="item.text" :placeholder="'Sous-tâche ' + (idx+1)" />
              <button class="btn-icon" @click="form.checklist.splice(idx,1)"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div class="add-check-row">
            <input class="form-input" v-model="newItem" placeholder="Ajouter une sous-tâche..." @keyup.enter="addItem" />
            <button class="btn btn-ghost btn-sm" @click="addItem"><i class="fas fa-plus"></i></button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Annuler</button>
        <button class="btn btn-primary" @click="submit"
                :disabled="!form.title.trim() || !form.assignedTo">
          <i class="fas fa-paper-plane"></i> Assigner
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  employees: Array,
  preselectedEmployee: Object,   // optional
})
const emit = defineEmits(['close', 'assign'])

const newItem = ref('')
const form = reactive({
  assignedTo: null,
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  checklist: [],
})

// Pre-select employee if provided
watch(() => props.preselectedEmployee, (emp) => {
  if (emp) form.assignedTo = emp.id
}, { immediate: true })

function addItem() {
  if (!newItem.value.trim()) return
  form.checklist.push({ text: newItem.value.trim(), done: false })
  newItem.value = ''
}

function submit() {
  if (!form.title.trim() || !form.assignedTo) return
  emit('assign', { ...form, checklist: form.checklist.map(c => ({ ...c })) })
}
</script>

<style scoped>
.assign-modal { max-width: 580px; }
.header-icon {
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  background: rgba(124,106,247,0.15); color: var(--accent);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* Employee select */
.emp-select-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.emp-select-chip {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition);
}
.emp-select-chip:hover { border-color: var(--accent); }
.emp-select-chip.selected { border-color: var(--accent); background: rgba(124,106,247,0.1); }
.chip-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.chip-name { font-size: 0.82rem; font-weight: 500; }
.chip-check { color: var(--accent); font-size: 0.75rem; margin-left: 2px; }
.no-emp-hint { font-size: 0.8rem; color: var(--text3); padding: 8px 0; display: flex; align-items: center; gap: 6px; }

/* Priority */
.priority-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.priority-opt {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 8px; border-radius: var(--radius-sm); cursor: pointer;
  font-size: 0.8rem; font-weight: 500; transition: var(--transition); border: 1px solid transparent;
}
.priority-opt.unselected { background: var(--surface2); color: var(--text2); border-color: var(--border); }
.priority-opt.unselected:hover { border-color: var(--accent); color: var(--text); }
.priority-opt.selected-high   { background: rgba(255,101,132,0.15); color: var(--accent2); border-color: var(--accent2); }
.priority-opt.selected-medium { background: rgba(247,151,30,0.15);  color: var(--accent4); border-color: var(--accent4); }
.priority-opt.selected-low    { background: rgba(67,217,162,0.15);  color: var(--accent3); border-color: var(--accent3); }

/* Checklist */
.checklist-items { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.check-row { display: flex; align-items: center; gap: 8px; }
.check-input { flex: 1; }
.drag-handle { cursor: grab; }
.btn-icon { background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px 6px; border-radius: 4px; }
.btn-icon:hover { color: var(--accent2); background: rgba(255,101,132,0.1); }
.add-check-row { display: flex; gap: 8px; }
.add-check-row input { flex: 1; }
</style>
