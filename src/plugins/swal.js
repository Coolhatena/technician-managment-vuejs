import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const swal = Swal.mixin({
  buttonsStyling: true,
  showConfirmButton: true,
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  // Usa colores aproximados al tema del proyecto
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'ts-swal-popup',
  },
})

export default {
  install(app) {
    app.config.globalProperties.$swal = swal
  },
}

export { swal }

