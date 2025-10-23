<template>
  <div id="app" :class="containerClasses">
    <AppHeader v-if="authStore.isAuthenticated" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()

const containerClasses = computed(() => [
  themeStore.modeClass,
  themeStore.roleClass
])

watch(
  () => authStore.userRole,
  (role) => {
    themeStore.setRole(role)
  },
  { immediate: true }
)

watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (!isAuthenticated && route.meta.requiresAuth) {
      await router
        .replace({
          name: 'Login',
          query: { redirect: route.fullPath }
        })
        .catch(() => {})
    }
  }
)

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style>
:root {
  --transition-base: 0.3s ease;
}

body {
  margin: 0;
  background: var(--app-background, #f4f6fb);
  color: var(--text-color, #1f2933);
  transition: background var(--transition-base), color var(--transition-base);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-background);
  color: var(--text-color);
  transition: background var(--transition-base), color var(--transition-base);
}

main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  transition: color var(--transition-base);
}

.theme-light {
  --app-background: #f4f6fb;
  --text-color: #1f2933;
  --muted-text: #6b7280;
  --card-background: #ffffff;
  --card-border: #e2e8f0;
  --input-background: #ffffff;
  --input-border: #cbd5f5;
  --input-text: #1f2933;
  --input-placeholder: #94a3b8;
  --accent-color: #6366f1;
  --accent-color-strong: #4f46e5;
  --accent-contrast: #ffffff;
  --accent-soft: rgba(99, 102, 241, 0.12);
  --divider-color: rgba(148, 163, 184, 0.4);
  --header-background: rgba(255, 255, 255, 0.85);
  --header-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
  --auth-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.theme-dark {
  --app-background: #0f172a;
  --text-color: #e2e8f0;
  --muted-text: #94a3b8;
  --card-background: #1e293b;
  --card-border: #334155;
  --input-background: #0f172a;
  --input-border: #475569;
  --input-text: #e2e8f0;
  --input-placeholder: #64748b;
  --accent-color: #818cf8;
  --accent-color-strong: #6366f1;
  --accent-contrast: #0f172a;
  --accent-soft: rgba(129, 140, 248, 0.2);
  --divider-color: rgba(71, 85, 105, 0.6);
  --header-background: rgba(15, 23, 42, 0.8);
  --header-shadow: 0 12px 32px rgba(8, 15, 35, 0.35);
  --auth-background: radial-gradient(circle at top, #1f2937 0%, #0f172a 55%, #0b1120 100%);
}

.role-default {
  --role-accent: var(--accent-color);
  --role-accent-strong: var(--accent-color-strong);
  --accent-shadow: rgba(99, 102, 241, 0.35);
}

.role-admin {
  --role-accent: #f97316;
  --role-accent-strong: #ea580c;
  --accent-shadow: rgba(249, 115, 22, 0.38);
}

.role-user {
  --role-accent: #10b981;
  --role-accent-strong: #059669;
  --accent-shadow: rgba(16, 185, 129, 0.32);
}

.role-moderator {
  --role-accent: #38bdf8;
  --role-accent-strong: #0ea5e9;
  --accent-shadow: rgba(14, 165, 233, 0.32);
}

.role-admin.theme-dark {
  --role-accent: #fb923c;
  --role-accent-strong: #f97316;
  --accent-shadow: rgba(251, 146, 60, 0.5);
}

.role-user.theme-dark {
  --role-accent: #34d399;
  --role-accent-strong: #10b981;
  --accent-shadow: rgba(52, 211, 153, 0.45);
}

.role-moderator.theme-dark {
  --role-accent: #67e8f9;
  --role-accent-strong: #38bdf8;
  --accent-shadow: rgba(103, 232, 249, 0.45);
}

@media (max-width: 768px) {
  main {
    padding: 16px;
  }
}
</style>
