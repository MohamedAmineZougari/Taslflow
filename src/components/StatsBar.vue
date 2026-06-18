<template>
  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-value" style="color:var(--accent)">{{ total }}</div>
      <div class="stat-label">Total tâches</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:var(--accent3)">{{ completed }}</div>
      <div class="stat-label">Terminées</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:var(--accent2)">{{ overdue }}</div>
      <div class="stat-label">En retard</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:var(--accent4)">{{ today }}</div>
      <div class="stat-label">Aujourd'hui</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:var(--text2)">{{ reminders }}</div>
      <div class="stat-label">Rappels actifs</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: Number, completed: Number, overdue: Number,
  today: Number, reminders: Number,
})
</script>

<style scoped>
.stats-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-card {
  flex: 1; min-width: 100px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 14px 16px; text-align: center;
}
.stat-value { font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; }
.stat-label { font-size: 0.72rem; color: var(--text3); margin-top: 2px; }
</style>
