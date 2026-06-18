<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal premium-modal">
      <div class="premium-header">
        <div class="premium-crown">👑</div>
        <div class="premium-title">TaskFlow Premium</div>
        <div class="premium-sub">Débloquez toutes les fonctionnalités avancées</div>
      </div>

      <div class="premium-features">
        <div v-for="f in features" :key="f.name" class="feature-item">
          <div class="feature-icon">{{ f.icon }}</div>
          <div>
            <div class="feature-name">{{ f.name }}</div>
            <div class="feature-desc">{{ f.desc }}</div>
          </div>
          <div class="feature-lock">
            <i :class="isPremium ? 'fas fa-check-circle' : 'fas fa-lock'"
               :style="{ color: isPremium ? 'var(--accent3)' : '' }"></i>
          </div>
        </div>
      </div>

      <div class="premium-price">
        <div v-if="!isPremium">
          <div class="price-amount">9,99€ <span style="-webkit-text-fill-color:var(--text2);font-size:1rem">/mois</span></div>
          <div class="price-period">ou 79,99€/an — économisez 33%</div>
          <button class="btn activate-btn" @click="$emit('activate')">
            <i class="fas fa-crown"></i> Activer Premium maintenant
          </button>
        </div>
        <div v-else class="already-premium">
          <i class="fas fa-check-circle"></i> Premium actif — Merci !<br>
          <button class="btn btn-ghost btn-sm" style="margin-top:12px" @click="$emit('deactivate')">
            Revenir au plan gratuit
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ isPremium: Boolean })
defineEmits(['close', 'activate', 'deactivate'])

const features = [
  { icon: '📅', name: 'Vue Calendrier',     desc: 'Visualisez vos tâches sur un calendrier mensuel' },
  { icon: '🔔', name: 'Rappels récurrents', desc: 'Rappels quotidiens, hebdomadaires, mensuels' },
  { icon: '🏷️', name: 'Tags personnalisés', desc: 'Créez vos propres catégories et étiquettes' },
  { icon: '📊', name: 'Rapports & Analytics',desc: 'Suivi de productivité et statistiques avancées' },
  { icon: '♾️', name: 'Colonnes illimitées', desc: 'Créez autant de colonnes que vous voulez' },
]
</script>

<style scoped>
.premium-modal { max-width: 460px; }
.premium-header { text-align: center; padding: 24px 20px 12px; }
.premium-crown { font-size: 2.5rem; margin-bottom: 8px; }
.premium-title { font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 800; }
.premium-sub { font-size: 0.82rem; color: var(--text2); margin-top: 4px; }

.premium-features { padding: 0 20px; display: flex; flex-direction: column; gap: 2px; }
.feature-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-sm); }
.feature-item:hover { background: var(--surface2); }
.feature-icon { font-size: 1.2rem; width: 32px; text-align: center; flex-shrink: 0; }
.feature-name { font-size: 0.86rem; font-weight: 600; }
.feature-desc { font-size: 0.76rem; color: var(--text2); }
.feature-lock { margin-left: auto; color: var(--text3); font-size: 0.85rem; }

.premium-price { padding: 16px 20px 4px; text-align: center; }
.price-amount {
  font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800;
  background: var(--premium); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; background-clip: text;
}
.price-period { font-size: 0.8rem; color: var(--text2); margin-top: 2px; }
.activate-btn {
  background: var(--premium); color: #000; font-weight: 700;
  margin-top: 16px; width: 100%; justify-content: center; font-size: 1rem;
}
.already-premium { color: var(--accent3); font-weight: 700; font-size: 1rem; }
</style>
