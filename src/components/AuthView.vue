<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-logo">TaskFlow</div>
      <p class="auth-tagline">Gérez vos tâches avec fluidité</p>

      <div class="auth-tabs">
        <div :class="['auth-tab', mode === 'login' ? 'active' : '']" @click="mode = 'login'">Connexion</div>
        <div :class="['auth-tab', mode === 'signup' ? 'active' : '']" @click="mode = 'signup'">Inscription</div>
      </div>

      <form @submit.prevent="submit" class="auth-form">
        <div class="form-group" v-if="mode === 'signup'">
          <label class="form-label">Nom complet</label>
          <input type="text" class="form-input" v-model="form.name" placeholder="Votre nom" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" v-model="form.email" placeholder="vous@exemple.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-input" v-model="form.password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary auth-submit-btn">
          {{ mode === 'login' ? 'Se connecter' : 'Créer un compte employé' }}
        </button>
      </form>

      <div class="admin-hint" @click="fillAdmin">
        <i class="fas fa-shield-alt"></i>
        <span>Connexion admin : <strong>admin@taskflow.com</strong> / <strong>admin123</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
const emit = defineEmits(['auth'])
const mode = ref('login')
const form = reactive({ name: '', email: '', password: '' })
function submit() { emit('auth', { mode: mode.value, ...form }) }
function fillAdmin() { mode.value = 'login'; form.email = 'admin@taskflow.com'; form.password = 'admin123' }
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 30% 20%, rgba(124,106,247,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(67,217,162,0.07) 0%, transparent 50%), var(--bg);
}
.auth-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 1.5); padding: 40px;
  width: 100%; max-width: 420px; box-shadow: var(--shadow);
}
.auth-logo {
  font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; text-align: center; margin-bottom: 8px;
}
.auth-tagline { text-align: center; color: var(--text2); font-size: 0.9rem; margin-bottom: 24px; }
.auth-tabs { display: flex; background: var(--surface2); border-radius: var(--radius-sm); padding: 4px; margin-bottom: 24px; }
.auth-tab { flex: 1; text-align: center; padding: 8px; border-radius: calc(var(--radius-sm) - 2px); cursor: pointer; font-size: 0.85rem; color: var(--text2); transition: var(--transition); }
.auth-tab.active { background: var(--surface3); color: var(--text); font-weight: 600; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-submit-btn { width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; font-weight: 600; margin-top: 4px; }
.admin-hint {
  display: flex; align-items: center; gap: 8px; margin-top: 20px;
  background: rgba(124,106,247,0.08); border: 1px solid rgba(124,106,247,0.2);
  border-radius: var(--radius-sm); padding: 10px 14px;
  font-size: 0.78rem; color: var(--text2); cursor: pointer; transition: var(--transition);
}
.admin-hint:hover { border-color: var(--accent); color: var(--text); }
.admin-hint i { color: var(--accent); font-size: 0.9rem; flex-shrink: 0; }
</style>
