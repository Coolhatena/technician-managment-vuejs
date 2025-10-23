// Centraliza el acceso a variables de entorno de Vite
// Recuerda: deben empezar con VITE_

export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Sistema de Técnicos',
  FEATURE_EXAMPLE: String(import.meta.env.VITE_FEATURE_EXAMPLE || 'false') === 'true',
}
