import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import supabase from '@/lib/supabaseClient' // convención: usar cliente centralizado

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/components/Signup.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Rutas eliminadas: posts y admin (no relevantes al sistema de técnicos)
  // Rutas de gestión de reparaciones
  { path: '/jobs', name: 'JobsList', component: () => import('@/views/jobs/JobsList.vue'), meta: { requiresAuth: true } },
  { path: '/jobs/new', name: 'JobNew', component: () => import('@/views/jobs/JobForm.vue'), meta: { requiresAuth: true } },
  { path: '/jobs/:id', name: 'JobDetail', component: () => import('@/views/jobs/JobDetail.vue'), meta: { requiresAuth: true } },
  { path: '/track/:token', name: 'TrackPublic', component: () => import('@/views/public/TrackPublic.vue'), meta: { requiresAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard con Supabase + compatibilidad Pinia
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Compatibilidad con store existente
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  // Consultar usuario de Supabase
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = Boolean(user) || authStore.isAuthenticated

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresRole = to.meta.requiresRole

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'Signup') && isAuthenticated) {
    // Si ya está autenticado y va a login, redirigir
    next({ name: 'Dashboard' })
  } else if (requiresRole && !requiresRole.includes(authStore.userRole)) {
    // Usuario no tiene el rol necesario (solo aplica para flujo previo con Pinia)
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
