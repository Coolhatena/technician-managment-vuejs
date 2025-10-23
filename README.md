# Sistema de Técnicos (Frontend)

Frontend en Vue 3 + Vite para la gestión de reparaciones (técnicos) con autenticación mediante Supabase.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Configuración de Vite

Consulta la referencia de configuración: https://vite.dev/config/

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Variables de entorno (.env)

Este proyecto usa Vite. Para exponer variables de entorno al cliente deben comenzar con `VITE_`.

- Crea tu archivo de entorno copiando el ejemplo:
  - `cp .env.example .env`
- Edita `.env` y define tus variables (ej.: `VITE_API_BASE_URL`).
- En el código, accede con `import.meta.env.VITE_NOMBRE` o usando el helper `src/config/env.js`:

```js
// src/algunaRuta.js
import { env } from '@/config/env'

fetch(`${env.API_BASE_URL}/posts`)
```

## Supabase (Auth)

1) Instalar la librería

```sh
npm install @supabase/supabase-js
```

2) Configurar variables de entorno en `.env` (o copiar de `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3) Cliente de Supabase: `src/supabase.js`.

4) Composable de autenticación: `src/composables/useAuth.js` con métodos `signUp`, `signIn`, `signOut`, `getUser`, y escucha de estado.

5) Pantallas:
   - Login: `src/components/Login.vue`
   - Registro: `src/components/Signup.vue` (opcional)

6) Router: rutas `/login`, `/dashboard`, `/jobs`, `/jobs/new`, `/jobs/:id` y `/track/:token` con guard que valida sesión.

Notas:
- El guard también mantiene compatibilidad con el store de Pinia existente para roles.
- La ruta `/signup` referenciada en el login no está implementada; puedes crear una vista/registro si lo deseas.
- No coloques secretos en variables `VITE_*` (expuestas al cliente).

Archivos soportados por Vite según el modo:
- `.env` (común), `.env.development`, `.env.production`
- Variantes locales (ignoradas por git): `.env.local`, `.env.development.local`, etc.

Opcional (en `vite.config.js`): si necesitas leer variables en la configuración de Vite (lado Node), usa `loadEnv`.

```js
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // env.VITE_API_BASE_URL disponible aquí
  return {
    // ...config
  }
})
```
 
## Reparaciones: Vue + Supabase

- Variables de entorno en `.env` o `.env.local`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- Migraciones con Supabase CLI (opcional):
  - Instala CLI: https://supabase.com/docs/guides/cli
  - Coloca el archivo `supabase/migrations/2025-10-setup-repair.sql` en tu carpeta de migraciones.
  - Ejecuta migraciones:

```
supabase db push
# o
supabase db reset --linked
```

- Si usarás adjuntos, crea el bucket público:

```
-- en SQL (desde el dashboard o CLI):
select storage.create_bucket('job-attachments', true);
```

- Ejecuta el frontend:

```
npm i
npm run dev
```

### Rutas principales
  - `/jobs` lista de reparaciones
  - `/jobs/new` alta de reparación
  - `/jobs/:id` detalle + logs
  - `/track/:token` seguimiento público (sin login)

### Pruebas mínimas
  - Crear reparación, agregar logs, cambiar estado a `repaired`.
  - Copiar link público y abrir en modo privado, ver logs y estado.
  - Verificar que el usuario A no ve reparaciones del usuario B.
