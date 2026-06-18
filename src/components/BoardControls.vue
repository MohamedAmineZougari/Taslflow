<template>
  <div class="board-controls">
    <div class="search-box">
      <i class="fas fa-search" style="color:var(--text3)"></i>
      <input :value="search" @input="$emit('update:search', $event.target.value)"
             placeholder="Rechercher une tâche...">
    </div>
    <div :class="['filter-btn', priority === 'high' ? 'active' : '']" @click="togglePriority('high')">
      <i class="fas fa-fire" style="color:var(--accent2)"></i> Urgent
    </div>
    <div :class="['filter-btn', priority === 'medium' ? 'active' : '']" @click="togglePriority('medium')">
      <i class="fas fa-circle" style="color:var(--accent4)"></i> Moyen
    </div>
    <div :class="['filter-btn', priority === 'low' ? 'active' : '']" @click="togglePriority('low')">
      <i class="fas fa-leaf" style="color:var(--accent3)"></i> Faible
    </div>
    <div style="margin-left:auto">
      <button class="btn btn-primary" @click="$emit('newTask')">
        <i class="fas fa-plus"></i> Nouvelle tâche
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ search: String, priority: String })
const emit = defineEmits(['update:search', 'update:priority', 'newTask'])

function togglePriority(p) {
  emit('update:priority', props.priority === p ? '' : p)
}
</script>

<style scoped>
.board-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 7px 12px; flex: 1; min-width: 180px;
}
.search-box input { background: none; border: none; color: var(--text); font-size: 0.85rem; flex: 1; outline: none; width: 100%; }
.filter-btn {
  display: flex; align-items: center; gap: 6px; padding: 7px 12px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); cursor: pointer; font-size: 0.82rem;
  color: var(--text2); transition: var(--transition); white-space: nowrap;
}
.filter-btn:hover, .filter-btn.active {
  border-color: var(--accent); color: var(--text); background: rgba(124,106,247,0.08);
}
</style>
