# Instrucciones Deploy Produccion — BLQ-01 a BLQ-04

**Fecha:** 2026-02-26
**Servidor:** 74.208.126.102 (usuario: isem)
**Prerequisito:** `git pull origin master` completado en `/home/isem/gamilit-workspace`
**Ejecutor:** Agente deploy con acceso SSH

---

## Resumen de Bloqueantes

| ID | Descripcion | Archivo afectado | Criticidad |
|----|-------------|------------------|------------|
| BLQ-01 | 3 placeholders `CHANGE_ME_IN_PRODUCTION` sin reemplazar | `apps/backend/.env.production` | CRITICA — el backend no arranca |
| BLQ-02 | `JWT_REFRESH_SECRET` ausente en `.env.production` | `apps/backend/.env.production` | CRITICA — el backend no arranca |
| BLQ-03 | Verificar existencia de frontend `.env.production` | `apps/frontend/.env.production` | MEDIA — necesario tras git pull |
| BLQ-04 | Password admin en BD es el valor de desarrollo | Base de datos PostgreSQL | ALTA — seguridad |

> **Por que son bloqueantes BLQ-01 y BLQ-02:** `main.ts` (lineas 159-183) contiene una validacion de seguridad que ejecuta `process.exit(1)` si `JWT_SECRET`, `JWT_REFRESH_SECRET` o `DB_PASSWORD` no superan los controles. El backend simplemente no arranca.

---

## BLQ-01: Reemplazar los 3 CHANGE_ME_IN_PRODUCTION en .env.production

### Ubicacion del archivo

```
/home/isem/gamilit-workspace/apps/backend/.env.production
```

### Placeholders encontrados (texto exacto)

| Linea | Variable | Valor actual |
|-------|----------|--------------|
| 20 | `DB_PASSWORD` | `CHANGE_ME_IN_PRODUCTION` |
| 25 | `JWT_SECRET` | `CHANGE_ME_IN_PRODUCTION` |
| 43 | `SESSION_SECRET` | `CHANGE_ME_IN_PRODUCTION` |

### Procedimiento

**Paso 1: Generar los valores secretos**

Ejecutar en el servidor (cada comando produce un valor distinto):

```bash
# Generar JWT_SECRET (guardar este valor)
openssl rand -base64 48

# Generar SESSION_SECRET (guardar este valor, diferente al anterior)
openssl rand -base64 48
```

> IMPORTANTE: Guardar los valores generados en un gestor de secretos o en un lugar seguro antes de editar el archivo. Una vez guardados, usar esos valores exactos en los pasos siguientes.

**Paso 2: Obtener la password real de PostgreSQL**

La variable `DB_PASSWORD` debe coincidir con la password del usuario `gamilit_user` en PostgreSQL. Para verificarla:

```bash
# Comprobar que gamilit_user existe y puede autenticarse
psql -h localhost -U gamilit_user -d gamilit_platform -c "SELECT current_user;"
```

Si se desconoce la password actual del usuario `gamilit_user`, se puede cambiar desde el superusuario de PostgreSQL:

```bash
sudo -u postgres psql -c "ALTER USER gamilit_user WITH PASSWORD 'nueva_password_segura_aqui';"
```

Y luego usar esa misma `nueva_password_segura_aqui` como valor de `DB_PASSWORD`.

**Paso 3: Editar el archivo**

```bash
nano /home/isem/gamilit-workspace/apps/backend/.env.production
```

Reemplazar cada linea con los valores reales:

```env
# Linea 20 — reemplazar con la password real de PostgreSQL
DB_PASSWORD=<password_real_de_gamilit_user>

# Linea 25 — reemplazar con el valor generado por openssl (primero)
JWT_SECRET=<valor_openssl_1>

# Linea 43 — reemplazar con el valor generado por openssl (segundo)
SESSION_SECRET=<valor_openssl_2>
```

> IMPORTANTE: `JWT_SECRET` debe tener al menos 32 caracteres y NO puede contener las cadenas `not-for-production`, `change-in-production` o `your-secret` (main.ts linea 166 rechaza estas cadenas explicitamente).

**Paso 4: Verificacion**

```bash
grep "CHANGE_ME" /home/isem/gamilit-workspace/apps/backend/.env.production
```

Resultado esperado: sin output (0 coincidencias). Si hay output, hay placeholders sin reemplazar.

---

## BLQ-02: Agregar JWT_REFRESH_SECRET

### Por que esta ausente

El archivo `.env.production` (lineas 24-27) define `JWT_SECRET` y los campos de expiracion, pero **omite completamente la variable `JWT_REFRESH_SECRET`**. Esta variable es obligatoria en produccion.

### Validacion en main.ts (lineas 159-183)

El codigo exacto que bloquea el arranque:

```typescript
// main.ts lineas 159-183
if (nodeEnv === 'production') {
  const jwtSecret = configService.get<string>('JWT_SECRET') || '';
  const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET') || '';
  const dbPassword = configService.get<string>('database.password') || configService.get<string>('DB_PASSWORD') || '';

  const errors: string[] = [];

  if (jwtRefreshSecret.length < 32 || jwtRefreshSecret.includes('not-for-production') || jwtRefreshSecret.includes('change-in-production') || jwtRefreshSecret.includes('your-secret')) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters and not a placeholder');
  }
  if (jwtSecret === jwtRefreshSecret) {
    errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }

  if (errors.length > 0) {
    Logger.error('SECURITY VALIDATION FAILED - Cannot start in production:', 'Bootstrap');
    errors.forEach(err => Logger.error(`  - ${err}`, 'Bootstrap'));
    process.exit(1);
  }
}
```

**Reglas que impone la validacion (main.ts):**
- `JWT_REFRESH_SECRET` debe tener minimo 32 caracteres (linea 169)
- No puede contener `not-for-production`, `change-in-production` ni `your-secret` (linea 169)
- Debe ser diferente a `JWT_SECRET` (linea 172)

**Fallback inseguro si la variable no existe:** Cuando `configService.get<string>('JWT_REFRESH_SECRET')` retorna `undefined`, el codigo lo convierte a string vacia `''` (por el operador `|| ''`). Una cadena vacia tiene length 0, lo que dispara el error de validacion y `process.exit(1)`. No hay fallback que permita arrancar.

### Procedimiento

**Paso 1: Generar el valor**

```bash
# Generar JWT_REFRESH_SECRET (valor diferente al JWT_SECRET ya generado en BLQ-01)
openssl rand -base64 48
```

**Paso 2: Agregar la variable al archivo**

```bash
nano /home/isem/gamilit-workspace/apps/backend/.env.production
```

Agregar la siguiente linea debajo de `JWT_SECRET` (despues de la linea 25):

```env
# ==================== JWT ====================
JWT_SECRET=<valor_generado_en_BLQ-01>
JWT_REFRESH_SECRET=<nuevo_valor_generado_ahora>    # <-- AGREGAR ESTA LINEA
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> IMPORTANTE: El valor de `JWT_REFRESH_SECRET` debe ser diferente al de `JWT_SECRET`. Ambos deben tener al menos 48 caracteres cuando se generan con `openssl rand -base64 48`.

**Paso 3: Verificacion**

```bash
grep "JWT_REFRESH_SECRET" /home/isem/gamilit-workspace/apps/backend/.env.production
```

Resultado esperado: una linea con el valor configurado (no vacia, no `CHANGE_ME`).

---

## BLQ-03: Verificar frontend .env.production

### Ubicacion del archivo

```
/home/isem/gamilit-workspace/apps/frontend/.env.production
```

### Procedimiento

**Paso 1: Verificar que el archivo existe tras el git pull**

```bash
ls -la /home/isem/gamilit-workspace/apps/frontend/.env.production
```

**Paso 2: Verificar contenido esperado**

El archivo debe contener exactamente lo siguiente (sin secretos — es configuracion publica del frontend):

```env
# ============================================================================
# GAMILIT Frontend - Production Environment
# ============================================================================
# Server: 74.208.126.102
# Architecture: Browser -> Nginx (443) -> Frontend (3005) + Backend (3006)
# Nginx handles SSL termination and proxies /api/ to backend
# ============================================================================

# ==================== APPLICATION ====================
VITE_APP_NAME=GAMILIT Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_ENV=production

# ==================== API CONFIGURATION ====================
# Use proxy mode: Nginx proxies /api/ to backend:3006
# This means frontend uses relative URLs (/api/v1/...) which Nginx routes correctly
# No need to hardcode backend host/port — Nginx handles it transparently
VITE_API_HOST=proxy
VITE_API_PROTOCOL=https
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# ==================== WEBSOCKET ====================
# WebSocket connects through Nginx (wss://host/socket.io/)
# Nginx proxies /socket.io/ to backend:3006
VITE_WS_HOST=
VITE_WS_PROTOCOL=wss

# ==================== FEATURE FLAGS ====================
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_MOCK_API=false
VITE_USE_MOCK_DATA=false
VITE_ENABLE_WEBSOCKET=true

# ==================== PRODUCTION ====================
VITE_LOG_LEVEL=error
```

> NOTA: Este archivo no contiene secretos. `VITE_API_HOST=proxy` es intencional — el frontend usa URLs relativas (`/api/v1/...`) y Nginx se encarga del routing al backend en el puerto 3006.

**Paso 3: Verificacion de variables criticas**

```bash
grep "VITE_APP_ENV\|VITE_API_HOST\|VITE_ENABLE_DEBUG\|VITE_MOCK_API" /home/isem/gamilit-workspace/apps/frontend/.env.production
```

Resultado esperado:
```
VITE_APP_ENV=production
VITE_API_HOST=proxy
VITE_ENABLE_DEBUG=false
VITE_MOCK_API=false
```

---

## BLQ-04: Cambiar password del admin en la base de datos

### Contexto

El usuario administrador `admin@gamilit.com` puede tener la password de desarrollo en la base de datos de produccion. Debe cambiarse por una password segura antes de activar el sistema.

### Tabla objetivo

```
Schema: auth_management
Tabla:  users
Campo:  password_hash (bcrypt, costo 10)
```

### Procedimiento

**Paso 1: Conectarse a PostgreSQL**

```bash
psql -h localhost -U gamilit_user -d gamilit_platform
```

**Paso 2: Verificar que el usuario admin existe**

```sql
SELECT id, email, role, created_at
FROM auth_management.users
WHERE email = 'admin@gamilit.com';
```

Resultado esperado: 1 fila con el usuario administrador.

**Paso 3: Generar el hash bcrypt de la nueva password**

Opcion A — desde la sesion psql (requiere extension pgcrypto):

```sql
-- Verificar que pgcrypto esta disponible
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Generar el hash (reemplazar 'nueva_password_admin_segura' con la password real)
SELECT crypt('nueva_password_admin_segura', gen_salt('bf', 10));
```

Copiar el valor del hash resultante (formato: `$2a$10$...`).

Opcion B — desde la linea de comandos con Node.js (si pgcrypto no esta disponible):

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('nueva_password_admin_segura', 10).then(h => console.log(h));"
```

**Paso 4: Actualizar la password en la base de datos**

```sql
-- Reemplazar el hash con el valor obtenido en el Paso 3
UPDATE auth_management.users
SET password_hash = '$2a$10$<hash_completo_generado_aqui>',
    updated_at = NOW()
WHERE email = 'admin@gamilit.com';
```

Resultado esperado: `UPDATE 1`

**Paso 5: Verificar el cambio**

```sql
SELECT email, updated_at
FROM auth_management.users
WHERE email = 'admin@gamilit.com';
```

El campo `updated_at` debe mostrar la fecha y hora actuales.

**Paso 6: Salir de psql**

```sql
\q
```

> IMPORTANTE: Guardar la nueva password del administrador en el gestor de secretos del proyecto. Esta es la unica cuenta con acceso total al Portal Administrador.

---

## Post-BLQ: Validacion y Arranque

Una vez completados los 4 bloqueantes, ejecutar en orden:

### 1. Rebuild del backend (obligatorio si el .env.production fue modificado)

```bash
cd /home/isem/gamilit-workspace/apps/backend
npm run build
```

### 2. Restart con PM2

```bash
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
```

### 3. Verificar que el backend arranco sin errores de seguridad

```bash
pm2 logs gamilit-backend --lines 50
```

Buscar en los logs:
- AUSENCIA de: `SECURITY VALIDATION FAILED`
- AUSENCIA de: `JWT_SECRET must be`, `JWT_REFRESH_SECRET must be`, `DB_PASSWORD is required`
- PRESENCIA de: `GAMILIT Backend API Server` y `Server running at: http://localhost:3006`

### 4. Health check del backend

```bash
curl -f http://localhost:3006/api/v1/health
```

Resultado esperado: HTTP 200 con payload JSON indicando status `ok`.

### 5. Verificar frontend activo

```bash
curl -f http://localhost:3005
```

Resultado esperado: HTTP 200 con el HTML del SPA de React.

### 6. Estado de PM2

```bash
pm2 status
```

Resultado esperado: ambos procesos (`gamilit-backend` y `gamilit-frontend`) en estado `online`.

---

## Referencia: PM2 Ecosystem Config

El archivo `ecosystem.config.js` en la raiz del proyecto define:

| Proceso | Script | Puerto | Modo | CWD |
|---------|--------|--------|------|-----|
| `gamilit-backend` | `dist/main.js` | 3006 | fork | `apps/backend` |
| `gamilit-frontend` | `serve.cjs` | 3005 | fork | `apps/frontend` |

El backend usa `node_args: '-r ./tsconfig-paths-bootstrap.js'` para resolver path aliases de TypeScript en produccion.

Los logs se guardan en:
- `/home/isem/gamilit-workspace/logs/backend-error.log`
- `/home/isem/gamilit-workspace/logs/backend-out.log`
- `/home/isem/gamilit-workspace/logs/frontend-error.log`
- `/home/isem/gamilit-workspace/logs/frontend-out.log`

---

*Documento generado para uso del agente deploy. No ejecutar comandos de servidor desde entorno de desarrollo local.*
