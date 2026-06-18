<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal task-detail-modal">
      <div class="modal-header">
        <div :class="['status-pill', task.status]">
          <i :class="statusIcon"></i> {{ statusLabel }}
        </div>
        <div class="modal-title">{{ task.taskTitle }}</div>
        <div class="modal-close" @click="$emit('close')"><i class="fas fa-times"></i></div>
      </div>

      <div class="modal-body">
        <!-- Assignment info -->
        <div class="assign-info-bar">
          <div class="info-chip">
            <i class="fas fa-user" style="color:var(--accent)"></i>
            <span>{{ assigneeName }}</span>
          </div>
          <div class="info-chip" v-if="task.dueDate">
            <i class="fas fa-calendar-alt" style="color:var(--accent4)"></i>
            <span>{{ formatDate(task.dueDate) }}</span>
          </div>
          <div :class="['info-chip', 'prio-chip-' + task.priority]">
            <i :class="priorityIcon"></i>
            <span>{{ priorityLabel }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="detail-desc" v-if="task.taskDesc">{{ task.taskDesc }}</div>

        <!-- Progress bar (big) -->
        <div class="big-progress-block">
          <div class="big-progress-header">
            <span class="big-progress-label">Avancement de la tâche</span>
            <span class="big-progress-pct" :style="{ color: progressColor }">{{ task.progress || 0 }}%</span>
          </div>
          <div class="big-progress-bar">
            <div class="big-progress-fill"
                 :style="{ width: (task.progress||0) + '%', background: progressColor }">
            </div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="checklist-section" v-if="task.checklist && task.checklist.length">
          <div class="cl-title">
            <i class="fas fa-check-square" style="color:var(--accent)"></i>
            Checklist — {{ doneItems }}/{{ task.checklist.length }}
          </div>
          <div class="checklist">
            <div v-for="(item, idx) in localChecklist" :key="idx" class="checklist-item"
                 :class="{ 'employee-mode': isEmployee }">
              <input type="checkbox" v-model="item.done"
                     :disabled="!isEmployee"
                     @change="isEmployee && saveProgress()" />
              <span :class="item.done ? 'done' : ''">{{ item.text }}</span>
            </div>
          </div>
        </div>

        <!-- Status update (employee only) -->
        <div class="status-update-section" v-if="isEmployee">
          <div class="cl-title"><i class="fas fa-sync-alt" style="color:var(--accent4)"></i> Mettre à jour le statut</div>
          <div class="status-btns">
            <button :class="['status-btn', localStatus === 'pending' ? 'active-pending' : '']"
                    @click="setStatus('pending')">
              <i class="fas fa-clock"></i> En attente
            </button>
            <button :class="['status-btn', localStatus === 'in_progress' ? 'active-progress' : '']"
                    @click="setStatus('in_progress')">
              <i class="fas fa-spinner"></i> En cours
            </button>
            <button :class="['status-btn', localStatus === 'done' ? 'active-done' : '']"
                    @click="setStatus('done')">
              <i class="fas fa-check-circle"></i> Terminé
            </button>
          </div>
        </div>

        <!-- Comment (employee) -->
        <div class="comment-section" v-if="isEmployee">
          <div class="cl-title"><i class="fas fa-comment" style="color:var(--accent3)"></i> Ajouter un commentaire</div>
          <div class="comment-input-row">
            <input class="form-input" v-model="newComment" placeholder="Votre message pour l'admin..." @keyup.enter="sendComment" />
            <button class="btn btn-primary btn-sm" @click="sendComment" :disabled="!newComment.trim()">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        <!-- Comments log -->
        <div class="comments-log" v-if="task.comments && task.comments.length">
          <div class="cl-title"><i class="fas fa-comments" style="color:var(--text3)"></i> Commentaires</div>
          <div v-for="(c, idx) in task.comments" :key="idx" class="comment-item">
            <div class="comment-avatar">{{ c.userName?.slice(0,2).toUpperCase() || 'U' }}</div>
            <div class="comment-body">
              <div class="comment-meta"><strong>{{ c.userName }}</strong> <span>{{ c.time }}</span></div>
              <div class="comment-text">{{ c.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button v-if="isAdmin" class="btn btn-danger btn-sm" @click="$emit('delete', task.id)">
          <i class="fas fa-trash"></i> Supprimer
        </button>
        <button class="btn btn-ghost" @click="$emit('close')">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAdmin } from '../composables/useAdmin.js'
import { useAuth }  from '../composables/useAuth.js'

const props = defineProps({ task: Object })
const emit = defineEmits(['close', 'delete'])

const { updateProgress, getUserById } = useAdmin()
const { currentUser } = useAuth()

const isAdmin    = computed(() => currentUser.value?.role === 'admin')
const isEmployee = computed(() => currentUser.value?.role === 'employee')

const assigneeName = computed(() => getUserById(props.task.assignedTo)?.name || '—')

const localChecklist = ref([])
const localStatus    = ref('')
const newComment     = ref('')

watch(() => props.task, (t) => {
  localChecklist.value = (t.checklist || []).map(c => ({ ...c }))
  localStatus.value    = t.status
}, { immediate: true, deep: true })

const doneItems = computed(() => localChecklist.value.filter(c => c.done).length)

const progressColor = computed(() => {
  const p = props.task.progress || 0
  if (p >= 80) return 'var(--accent3)'
  if (p >= 50) return 'var(--accent4)'
  if (p >= 20) return 'var(--accent)'
  return 'var(--accent2)'
})

const statusLabel = computed(() => ({ pending: 'En attente', in_progress: 'En cours', done: 'Terminé' }[props.task.status] || ''))
const statusIcon  = computed(() => ({ pending: 'fas fa-clock', in_progress: 'fas fa-spinner fa-spin', done: 'fas fa-check-circle' }[props.task.status] || 'fas fa-clock'))

const priorityLabel = computed(() => ({ high: 'Urgent', medium: 'Moyen', low: 'Faible' }[props.task.priority] || ''))
const priorityIcon  = computed(() => ({ high: 'fas fa-fire', medium: 'fas fa-circle', low: 'fas fa-leaf' }[props.task.priority] || 'fas fa-circle'))

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function saveProgress() {
  updateProgress(props.task.id, { checklist: localChecklist.value.map(c => ({ ...c })) })
}

function setStatus(s) {
  localStatus.value = s
  updateProgress(props.task.id, { status: s })
}

function sendComment() {
  if (!newComment.value.trim()) return
  updateProgress(props.task.id, { comment: newComment.value.trim() })
  newComment.value = ''
}
</script>

<style scoped>
.task-detail-modal { max-width: 560px; }

.status-pill {
  display: flex; align-items: center; gap: 6px; padding: 4px 10px;
  border-radius: 99px; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
.status-pill.pending    { background: rgba(90,90,112,0.2); color: var(--text3); }
.status-pill.in_progress { background: rgba(247,151,30,0.15); color: var(--accent4); }
.status-pill.done       { background: rgba(67,217,162,0.15); color: var(--accent3); }

.assign-info-bar { display: flex; flex-wrap: wrap; gap: 8px; }
.info-chip {
  display: flex; align-items: center; gap: 6px; padding: 5px 10px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 99px; font-size: 0.78rem; color: var(--text2);
}
.prio-chip-high   { background: rgba(255,101,132,0.1); border-color: rgba(255,101,132,0.3); color: var(--accent2); }
.prio-chip-medium { background: rgba(247,151,30,0.1);  border-color: rgba(247,151,30,0.3);  color: var(--accent4); }
.prio-chip-low    { background: rgba(67,217,162,0.1);  border-color: rgba(67,217,162,0.3);  color: var(--accent3); }

.detail-desc { font-size: 0.85rem; color: var(--text2); line-height: 1.6; padding: 12px; background: var(--surface2); border-radius: var(--radius-sm); }

.big-progress-block { display: flex; flex-direction: column; gap: 8px; }
.big-progress-header { display: flex; justify-content: space-between; align-items: center; }
.big-progress-label { font-size: 0.82rem; font-weight: 600; color: var(--text2); }
.big-progress-pct { font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 800; }
.big-progress-bar { height: 14px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.big-progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }

.cl-title { font-size: 0.78rem; font-weight: 700; color: var(--text2); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 7px; }

.checklist-section, .status-update-section, .comment-section, .comments-log { display: flex; flex-direction: column; }
.checklist { display: flex; flex-direction: column; gap: 6px; }
.checklist-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 0.84rem; }
.checklist-item.employee-mode:hover { background: var(--surface2); }
.checklist-item input { accent-color: var(--accent); width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }
.checklist-item input:disabled { cursor: default; opacity: 0.6; }
.checklist-item .done { text-decoration: line-through; color: var(--text3); }

.status-btns { display: flex; gap: 8px; }
.status-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--border);
  font-size: 0.8rem; font-weight: 500; background: var(--surface2); color: var(--text2); transition: var(--transition);
  font-family: 'DM Sans', sans-serif;
}
.status-btn:hover { border-color: var(--accent); color: var(--text); }
.status-btn.active-pending  { background: rgba(90,90,112,0.2); color: var(--text); border-color: var(--text3); }
.status-btn.active-progress { background: rgba(247,151,30,0.15); color: var(--accent4); border-color: var(--accent4); }
.status-btn.active-done     { background: rgba(67,217,162,0.15); color: var(--accent3); border-color: var(--accent3); }

.comment-input-row { display: flex; gap: 8px; }
.comment-input-row input { flex: 1; }

.comments-log { display: flex; flex-direction: column; gap: 10px; }
.comment-item { display: flex; gap: 10px; align-items: flex-start; }
.comment-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 800; color: #fff;
}
.comment-body { flex: 1; }
.comment-meta { font-size: 0.75rem; color: var(--text3); margin-bottom: 3px; display: flex; gap: 8px; }
.comment-meta strong { color: var(--text2); }
.comment-text { font-size: 0.83rem; line-height: 1.5; }
</style>
