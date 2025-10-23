import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

export const useAuth = () => {
  const user = ref(null)
  const loading = ref(true)

  // Registrar usuario
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  // Iniciar sesión
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  // Cerrar sesión
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    user.value = null
    return { error }
  }

  // Obtener usuario actual
  const getUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
    loading.value = false
    return currentUser
  }

  // Escuchar cambios de autenticación
  const authStateChange = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
    })
  }

  // Métodos opcionales
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    return { data, error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  onMounted(() => {
    getUser()
    authStateChange()
  })

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getUser,
    // opcionales
    signInWithGoogle,
    resetPassword,
  }
}

