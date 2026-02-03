# Tipos API Generados Automáticamente

**Fecha:** 2025-11-24
**GAP:** GAP-008
**Estado:** Implementado

---

## 📋 Resumen

Este sistema genera automáticamente tipos TypeScript desde la especificación OpenAPI/Swagger del backend, asegurando sincronización perfecta entre frontend y backend.

### Beneficios

✅ **Type Safety:** Tipos 100% sincronizados con backend
✅ **IntelliSense:** Autocompletado completo en VS Code
✅ **Detección Temprana:** Errores detectados en compile-time
✅ **Mantenimiento:** Sin actualización manual de tipos
✅ **Documentación:** Tipos autodocumentados desde backend

---

## 🚀 Inicio Rápido

### 1. Iniciar Backend

El backend debe estar corriendo para generar tipos:

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev
# Servidor en http://localhost:3006
```

### 2. Generar Tipos

```bash
# Terminal 2: Frontend
cd apps/frontend
npm run generate:api-types
```

**Salida:**
```
🚀 Generando tipos TypeScript desde OpenAPI...

📁 Creando directorio: src/generated
📥 Descargando especificación OpenAPI desde: http://localhost:3006/api/docs-json
✅ Especificación OpenAPI descargada: src/generated/openapi-spec.json
   Versión: 1.0.0
   Paths: 127

🔨 Generando tipos TypeScript...
✅ Tipos generados exitosamente: src/generated/api-types.ts
📄 Archivo de index creado: src/generated/index.ts
📄 .gitignore creado: src/generated/.gitignore

✨ ¡Generación de tipos completada exitosamente!
```

### 3. Usar en Código

```typescript
// Importar tipos generados
import type { components, paths } from '@/generated/api-types';

// Usar schemas
type UserStats = components['schemas']['UserStatsDto'];
type Achievement = components['schemas']['AchievementDto'];

// Usar rutas
type GetUserStatsResponse = paths['/v1/gamification/users/{userId}/stats']['get']['responses']['200']['content']['application/json'];
```

---

## 📖 Uso Detallado

### Schemas (DTOs)

Los schemas del backend se mapean a `components['schemas']`:

```typescript
import type { components } from '@/generated/api-types';

// Backend DTO
// @ApiProperty()
// class UserStatsDto {
//   userId: string;
//   level: number;
//   totalXp: number;
// }

// Frontend - Tipo generado
type UserStats = components['schemas']['UserStatsDto'];

// Uso
const stats: UserStats = {
  userId: 'user-123',
  level: 5,
  totalXp: 1500,
  // TypeScript autocompleta todas las propiedades
};
```

### Paths (Endpoints)

Los endpoints se mapean a `paths[ruta][método]`:

```typescript
import type { paths } from '@/generated/api-types';

// Backend endpoint
// @Get('/v1/gamification/users/:userId/stats')
// getUserStats(@Param('userId') userId: string): Promise<UserStatsDto>

// Frontend - Tipo del endpoint
type GetUserStatsEndpoint = paths['/v1/gamification/users/{userId}/stats']['get'];

// Tipo de respuesta
type GetUserStatsResponse = GetUserStatsEndpoint['responses']['200']['content']['application/json'];

// Tipo de parámetros
type GetUserStatsParams = GetUserStatsEndpoint['parameters']['path'];
// { userId: string }
```

### Responses

```typescript
import type { paths } from '@/generated/api-types';

type LoginEndpoint = paths['/v1/auth/login']['post'];

// Success response (200)
type LoginSuccess = LoginEndpoint['responses']['200']['content']['application/json'];

// Error responses
type LoginUnauthorized = LoginEndpoint['responses']['401']['content']['application/json'];
type LoginBadRequest = LoginEndpoint['responses']['400']['content']['application/json'];
```

### Request Bodies

```typescript
import type { paths } from '@/generated/api-types';

type LoginEndpoint = paths['/v1/auth/login']['post'];

// Request body type
type LoginRequest = LoginEndpoint['requestBody']['content']['application/json'];

// Uso en función
async function login(credentials: LoginRequest): Promise<void> {
  await apiClient.post('/v1/auth/login', credentials);
}
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Migrar API Module Existente

**ANTES (tipos manuales):**

```typescript
// apps/frontend/src/lib/api/gamification.api.ts
import apiClient from '@/services/api/apiClient';

// ❌ Tipos definidos manualmente - pueden desincronizarse
interface UserStats {
  user_id: string;  // ⚠️ Backend usa camelCase: userId
  level: number;
  total_xp: number; // ⚠️ Backend usa camelCase: totalXp
  ml_coins: number; // ⚠️ Backend usa camelCase: mlCoins
}

export const gamificationApi = {
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get(`/v1/gamification/users/${userId}/stats`);
    return data;
  },
};
```

**DESPUÉS (tipos generados):**

```typescript
// apps/frontend/src/lib/api/gamification.api.ts
import apiClient from '@/services/api/apiClient';
import type { components } from '@/generated/api-types';

// ✅ Tipo generado desde backend - siempre sincronizado
type UserStats = components['schemas']['UserStatsDto'];

export const gamificationApi = {
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(
      `/v1/gamification/users/${userId}/stats`
    );
    return data;  // TypeScript valida estructura automáticamente
  },
};
```

### Ejemplo 2: Hook con Tipos Generados

```typescript
// apps/frontend/src/hooks/useUserStats.ts
import { useState, useEffect } from 'react';
import { gamificationApi } from '@/lib/api/gamification.api';
import type { components } from '@/generated/api-types';

type UserStats = components['schemas']['UserStatsDto'];

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await gamificationApi.getUserStats(userId);
        setStats(data);  // ✅ TypeScript valida que data es UserStats
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
}
```

### Ejemplo 3: Form con Validación de Tipos

```typescript
// apps/frontend/src/components/LoginForm.tsx
import { useState } from 'react';
import type { components } from '@/generated/api-types';

// Tipo del request body desde backend
type LoginRequest = components['schemas']['LoginDto'];
type LoginResponse = components['schemas']['AuthResponseDto'];

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ TypeScript valida que credentials tiene estructura correcta
    const response = await authApi.login(credentials);
    // ✅ TypeScript valida que response es AuthResponseDto
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

---

## 🔄 Workflow de Desarrollo

### Cuando Backend Cambia

1. **Backend Developer agrega nuevo endpoint:**
   ```typescript
   // apps/backend/src/modules/gamification/controllers/rewards.controller.ts
   @Get('/v1/gamification/rewards/daily')
   @ApiResponse({ type: DailyRewardDto })
   getDailyReward() {
     // ...
   }
   ```

2. **Backend Developer actualiza Swagger:**
   ```bash
   # Backend se reinicia automáticamente (nodemon)
   # Swagger se actualiza en http://localhost:3006/api/docs
   ```

3. **Frontend Developer regenera tipos:**
   ```bash
   cd apps/frontend
   npm run generate:api-types
   ```

4. **Nuevo tipo disponible inmediatamente:**
   ```typescript
   import type { components } from '@/generated/api-types';

   type DailyReward = components['schemas']['DailyRewardDto'];
   // ✅ Autocomplete muestra todas las propiedades
   ```

### Regeneración Automática (Opcional)

Para regenerar tipos automáticamente cuando backend cambie:

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend con watch
cd apps/frontend
npm run generate:api-types:watch
# Se regeneran tipos cada vez que backend cambia
```

---

## 🛠️ Troubleshooting

### Error: Backend no está corriendo

```
❌ Error: Network error: connect ECONNREFUSED 127.0.0.1:3006

Asegúrate de que el backend esté corriendo en http://localhost:3006
Puedes iniciar el backend con: npm run dev (en apps/backend)
```

**Solución:**
```bash
cd apps/backend
npm run dev
# Esperar a que inicie
cd ../frontend
npm run generate:api-types
```

### Error: openapi-typescript no está instalado

```
❌ Error: openapi-typescript no está instalado

Instala con: npm install --save-dev openapi-typescript
```

**Solución:**
```bash
cd apps/frontend
npm install --save-dev openapi-typescript
```

### Tipos no se actualizan

Si regeneraste tipos pero VS Code no los muestra:

1. **Reload VS Code Window:**
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

2. **Verificar archivo generado:**
   ```bash
   ls -la apps/frontend/src/generated/api-types.ts
   # Verificar fecha de modificación
   ```

3. **Regenerar manualmente:**
   ```bash
   rm -rf apps/frontend/src/generated
   npm run generate:api-types
   ```

---

## 📁 Estructura de Archivos

```
apps/frontend/
├── scripts/
│   └── generate-api-types.js          # Script de generación
├── src/
│   └── generated/                      # ⚠️ No editar manualmente
│       ├── .gitignore                  # Excluye archivos temporales
│       ├── api-types.ts                # Tipos generados (commitear)
│       └── index.ts                    # Re-export
├── docs/
│   └── GENERATED-API-TYPES.md          # Esta documentación
└── package.json
    └── "generate:api-types": "..."     # Script npm
```

### ¿Commitear Tipos Generados?

**✅ SÍ, commitear `api-types.ts`:**

**Razones:**
1. Build funciona sin backend corriendo
2. CI/CD no necesita backend para compilar frontend
3. Diffs muestran cambios en tipos
4. Rollback incluye tipos correctos

**❌ NO commitear `openapi-spec.json`:**
- Archivo temporal
- Se regenera cada vez
- Ya excluido en `.gitignore`

---

## 🔗 Integración con CI/CD

### GitHub Actions

```yaml
# .github/workflows/frontend-ci.yml

name: Frontend CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Backend para generar tipos
      - name: Start Backend
        run: |
          cd apps/backend
          npm ci
          npm run build
          npm run start:prod &
          sleep 10

      # Frontend
      - name: Install Frontend Dependencies
        run: |
          cd apps/frontend
          npm ci

      - name: Generate API Types
        run: |
          cd apps/frontend
          npm run generate:api-types

      - name: Type Check
        run: |
          cd apps/frontend
          npm run type-check

      - name: Build
        run: |
          cd apps/frontend
          npm run build
```

---

## 📚 Referencias

- [openapi-typescript Documentation](https://github.com/drwpow/openapi-typescript)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [GAP-008 Analysis](../../docs/90-transversal/INDEX-GAPS-APIS-2025-11-24.md#gap-008)
- [ADR-015: API Routes Centralization](../../docs/97-adr/ADR-015-centralized-api-routes-configuration.md)

---

## ✅ Checklist de Migración

Para migrar módulo API existente a tipos generados:

- [ ] Backend tiene Swagger configurado en el endpoint
- [ ] Instalar `openapi-typescript`: `npm install --save-dev openapi-typescript`
- [ ] Generar tipos: `npm run generate:api-types`
- [ ] Importar tipos: `import type { components } from '@/generated/api-types'`
- [ ] Reemplazar tipos manuales con tipos generados
- [ ] Verificar TypeScript compile sin errores
- [ ] Actualizar tests si necesario
- [ ] Commitear `api-types.ts`

---

**Versión:** 1.0.0
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**GAP:** GAP-008
