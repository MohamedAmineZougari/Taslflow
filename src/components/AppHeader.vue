<template>
  <div class="header">
    <div class="logo">
      TaskFlow <span>v2.0</span>
      <div :class="['role-badge', role === 'admin' ? 'role-admin' : 'role-emp']">
        <i :class="role === 'admin' ? 'fas fa-shield-alt' : 'fas fa-user'"></i>
        {{ role === 'admin' ? 'Admin' : 'Employé' }}
      </div>
    </div>
    <div class="header-actions">
      <div class="view-toggle" v-if="role !== 'admin'">
        <div :class="['view-btn', modelValue === 'board' ? 'active' : '']" @click="$emit('update:modelValue', 'board')" data-tip="Kanban"><i class="fas fa-columns"></i></div>
        <div :class="['view-btn', modelValue === 'list' ? 'active' : '']"  @click="$emit('update:modelValue', 'list')"  data-tip="Liste"><i class="fas fa-list"></i></div>
        <div :class="['view-btn', modelValue === 'calendar' ? 'active' : '']" @click="$emit('update:modelValue', 'calendar')" data-tip="Calendrier"><i class="fas fa-calendar"></i></div>
      </div>
      
      <div class="theme-toggle" @click="toggleTheme" title="Changer de thème">
        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </div>

      <div v-if="isPremium && role !== 'admin'" class="premium-badge" @click="$emit('openPremium')">
        <i class="fas fa-crown"></i> PREMIUM
      </div>
      <div v-else-if="role !== 'admin'" class="free-badge" @click="$emit('openPremium')">
        <i class="fas fa-lock"></i> Passer Premium
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme.js'

defineProps({ modelValue: String, isPremium: Boolean, role: String })
defineEmits(['update:modelValue', 'openPremium'])

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 56px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  transition: var(--transition);
}
.logo {
  font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  display: flex; align-items: center; gap: 10px;
}
.logo span { font-size: 0.65rem; opacity: 0.6; -webkit-text-fill-color: var(--text3); }
.role-badge {
  display: flex; align-items: center; gap: 5px; padding: 3px 9px;
  border-radius: 99px; font-size: 0.7rem; font-weight: 700;
  -webkit-text-fill-color: initial;
}
.role-admin { background: rgba(124,106,247,0.15); color: var(--accent); border: 1px solid rgba(124,106,247,0.3); }
.role-emp   { background: rgba(67,217,162,0.12); color: var(--accent3); border: 1px solid rgba(67,217,162,0.25); }
.header-actions { display: flex; align-items: center; gap: 12px; }
.view-toggle { display: flex; background: var(--surface2); border-radius: var(--radius-sm); padding: 3px; gap: 2px; }
.view-btn { padding: 6px 10px; border-radius: calc(var(--radius-sm) - 2px); cursor: pointer; color: var(--text3); transition: var(--transition); font-size: 0.85rem; position: relative; }
.view-btn.active { background: var(--surface3); color: var(--accent); }
.view-btn[data-tip]:hover::after { content: attr(data-tip); position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%); background: var(--surface3); color: var(--text); font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; white-space: nowrap; pointer-events: none; }
.premium-badge, .free-badge { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; cursor: pointer; }
.premium-badge { background: linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,154,0,0.2)); color: var(--gold); border: 1px solid rgba(255,215,0,0.3); }
.free-badge { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); }
.free-badge:hover { border-color: var(--accent); color: var(--accent); }
.theme-toggle { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: var(--surface2); color: var(--text2); cursor: pointer; transition: var(--transition); }
.theme-toggle:hover { color: var(--accent); background: var(--surface3); }
</style>
