<template>
  <div class="toast-container">
    <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
      <div class="toast-icon"><i :class="toast.icon"></i></div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div class="toast-msg" v-if="toast.msg">{{ toast.msg }}</div>
      </div>
      <div class="toast-close" @click="removeToast(toast.id)">
        <i class="fas fa-times"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed; top: 20px; right: 20px; z-index: 9999;
  display: flex; flex-direction: column; gap: 10px;
}
.toast {
  display: flex; align-items: center; gap: 12px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 12px 16px;
  min-width: 260px; max-width: 340px;
  box-shadow: var(--shadow); animation: slideIn 0.3s ease;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
.toast.success { border-left: 3px solid var(--accent3); }
.toast.error   { border-left: 3px solid var(--accent2); }
.toast.info    { border-left: 3px solid var(--accent);  }
.toast.warning { border-left: 3px solid var(--accent4); }
.toast-icon { font-size: 1.1rem; }
.toast.success .toast-icon { color: var(--accent3); }
.toast.error   .toast-icon { color: var(--accent2); }
.toast.info    .toast-icon { color: var(--accent);  }
.toast.warning .toast-icon { color: var(--accent4); }
.toast-content { flex: 1; }
.toast-title { font-weight: 600; font-size: 0.85rem; }
.toast-msg { font-size: 0.78rem; color: var(--text2); margin-top: 2px; }
.toast-close { cursor: pointer; color: var(--text3); font-size: 0.8rem; padding: 2px 4px; }
.toast-close:hover { color: var(--text); }
</style>
