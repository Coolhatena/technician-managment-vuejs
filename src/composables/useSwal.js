import { getCurrentInstance } from 'vue'

export function useSwal() {
  const inst = getCurrentInstance()
  const swal = inst?.appContext?.config?.globalProperties?.$swal
  if (!swal) {
    // Aviso suave en consola para entornos donde aún no se instaló la dep
    console.warn('[useSwal] SweetAlert2 no está disponible. Asegúrate de instalar y registrar el plugin.')
  }
  return { swal }
}

