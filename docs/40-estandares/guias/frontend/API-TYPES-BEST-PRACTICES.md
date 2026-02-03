# Best Practices: API Types Alignment

**Fecha:** 2025-11-24
**Mantenido por:** Frontend-Agent
**Proyecto:** GAMILIT

---

## 🎯 PROPÓSITO

Guía de mejores prácticas para mantener las interfaces TypeScript del frontend alineadas con los DTOs del backend.

## 📋 REGLAS DE ORO

### 1. Las Interfaces de API Reflejan EXACTAMENTE el Backend

```typescript
// ✅ CORRECTO - Refleja el DTO del backend
// Backend: SystemMetricsDto usa snake_case
export interface SystemMetrics {
  total_users: number;
  active_users_24h: number;
  avg_response_time_ms: number;
}

// ❌ INCORRECTO - Inventa estructura que no existe
export interface SystemMetrics {
  requests: {
    avgResponseTime: number; // Backend NO envía esto
  };
}
```

### 2. Siempre Agregar JSDoc con Referencia al Backend

```typescript
/**
 * SystemMetrics - Aligned with backend SystemMetricsDto
 * @see apps/backend/src/modules/admin/dto/system/system-metrics.dto.ts
 */
export interface SystemMetrics {
  // ...
}
```

### 3. Usar Capa de Transformación para UI Types

```typescript
// 1. API Layer (adminTypes.ts) - Refleja backend
export interface SystemMetrics {
  avg_response_time_ms: number;
}

// 2. UI Layer (apps/admin/types/) - Adaptado para componentes
export interface DashboardMetrics {
  avgResponseTime: number; // camelCase para UI
}

// 3. Transformation Layer (hooks)
function transformMetrics(api: SystemMetrics): DashboardMetrics {
  return {
    avgResponseTime: api.avg_response_time_ms
  };
}
```

### 4. No Usar ApiResponse<T> en Tipos Genéricos de Axios

```typescript
// ❌ INCORRECTO - El interceptor ya desenvuelve
const response = await apiClient.get<ApiResponse<SystemMetrics>>(url);
return response.data; // Type: ApiResponse<SystemMetrics> ❌

// ✅ CORRECTO - El interceptor desenvuelve automáticamente
const response = await apiClient.get<SystemMetrics>(url);
return response.data; // Type: SystemMetrics ✓
```

## 🏗️ ARQUITECTURA DE TIPOS

### Separación de Responsabilidades

```
┌─────────────────────────────────────────┐
│ Backend DTOs (NestJS)                   │
│ - Snake_case naming                     │
│ - @ApiProperty decorators              │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Response (JSON)
               │
               ▼
┌─────────────────────────────────────────┐
│ API Types (adminTypes.ts)               │
│ - EXACTA copia del backend              │
│ - Mismo naming convention               │
│ - JSDoc con referencia al backend       │
└──────────────┬──────────────────────────┘
               │
               │ Transform Function
               │
               ▼
┌─────────────────────────────────────────┐
│ UI Types (apps/[role]/types/)           │
│ - CamelCase naming                      │
│ - Campos adicionales calculados         │
│ - Optimizado para componentes           │
└──────────────┬──────────────────────────┘
               │
               │ Props
               │
               ▼
┌─────────────────────────────────────────┐
│ Components (React)                      │
└─────────────────────────────────────────┘
```

## ✅ CHECKLIST PARA NUEVAS INTERFACES

Cuando necesites crear una nueva interface de API:

- [ ] **1. Verificar respuesta real del backend**
  - Usar Postman/Thunder Client para hacer request
  - Copiar JSON response real
  - NO asumir estructura

- [ ] **2. Copiar naming convention del backend**
  - Si backend usa `snake_case`, usar `snake_case`
  - Si backend usa `camelCase`, usar `camelCase`
  - NO convertir automáticamente

- [ ] **3. Agregar JSDoc con referencia**
  ```typescript
  /**
   * InterfaceName - Descripción breve
   * @see apps/backend/src/modules/[module]/dto/[dto-file].ts
   */
  ```

- [ ] **4. Verificar campos opcionales**
  - Usar `?` solo si el backend realmente puede omitir el campo
  - Verificar en el DTO del backend

- [ ] **5. Crear transformation function si necesario**
  - Si UI necesita camelCase, crear función de transformación
  - NO modificar la interface API

- [ ] **6. Validar con TypeScript**
  ```bash
  npm run type-check
  ```

## 🚨 ANTI-PATTERNS A EVITAR

### ❌ Anti-Pattern 1: Inventar Estructuras Anidadas

```typescript
// ❌ MAL - Backend no envía esta estructura
export interface SystemMetrics {
  requests: {
    total: number;
    avgResponseTime: number;
  };
}

// ✅ BIEN - Refleja backend plano
export interface SystemMetrics {
  requests_total: number;
  avg_response_time_ms: number;
}
```

### ❌ Anti-Pattern 2: Asumir Naming Convention

```typescript
// Backend DTO (snake_case)
class UserDto {
  full_name: string;
  last_login: string;
}

// ❌ MAL - Asume camelCase
export interface User {
  fullName: string;
  lastLogin: string;
}

// ✅ BIEN - Respeta backend
export interface User {
  full_name: string;
  last_login: string;
}
```

### ❌ Anti-Pattern 3: Modificar Interface API para UI

```typescript
// ❌ MAL - Mezcla API con UI concerns
export interface SystemMetrics {
  total_users: number;
  userGrowthPercent: number; // ❌ Campo calculado en frontend
}

// ✅ BIEN - Separar capas
// API Layer
export interface SystemMetrics {
  total_users: number;
}

// UI Layer
export interface DashboardMetrics {
  totalUsers: number;
  userGrowthPercent: number; // Calculado en transform
}
```

### ❌ Anti-Pattern 4: No Documentar Origen

```typescript
// ❌ MAL - Sin referencia
export interface SystemMetrics {
  total_users: number;
}

// ✅ BIEN - Con referencia clara
/**
 * SystemMetrics - Aligned with backend SystemMetricsDto
 * @see apps/backend/src/modules/admin/dto/system/system-metrics.dto.ts
 */
export interface SystemMetrics {
  total_users: number;
}
```

## 🔄 WORKFLOW RECOMENDADO

### Cuando Backend Agrega Nuevo Endpoint

1. **Backend-Agent crea endpoint**
   - Crea DTO en `apps/backend/src/modules/[module]/dto/`
   - Documenta endpoint en Swagger

2. **Frontend-Agent crea interface**
   - Lee el DTO del backend (no asume)
   - Crea interface en `adminTypes.ts` o equivalente
   - Agrega JSDoc con referencia

3. **Frontend-Agent crea transformation (si necesario)**
   - Si UI necesita formato diferente, crea función transform
   - Crea interface UI separada

4. **Frontend-Agent crea hook/service**
   - Usa la interface API para la llamada
   - Transforma a UI type si necesario

### Cuando Backend Modifica DTO

1. **Verificar cambio en backend**
   - Leer el DTO actualizado
   - Identificar qué cambió

2. **Actualizar interface frontend**
   - Modificar `adminTypes.ts` para reflejar cambio
   - Actualizar transformation si existe

3. **Actualizar componentes afectados**
   - TypeScript mostrará errores en componentes
   - Actualizar según nuevos campos

4. **Validar**
   - `npm run type-check`
   - Probar en desarrollo

## 📚 REFERENCIAS

- **Ejemplo correcto:** `apps/frontend/src/services/api/adminTypes.ts` - Interface `SystemMetrics`
- **Backend DTO:** `apps/backend/src/modules/admin/dto/system/system-metrics.dto.ts`
- **Transformation:** `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts` - función `transformSystemMetrics`

## 🎓 CAPACITACIÓN

### Para Nuevos Desarrolladores

1. Leer este documento completo
2. Revisar ejemplo de `SystemMetrics` (antes y después de la corrección)
3. Practicar creando interface nueva siguiendo checklist
4. Code review con Frontend-Agent antes de merge

### Para Code Reviews

Al revisar PR con nuevas interfaces:

- [ ] ¿Tiene JSDoc con referencia al backend?
- [ ] ¿Naming convention coincide con backend?
- [ ] ¿Se probó con response real del backend?
- [ ] ¿Separación correcta entre API types y UI types?
- [ ] ¿TypeScript compila sin errores?

---

**Mantenido por:** Frontend-Agent
**Última actualización:** 2025-11-24
**Versión:** 1.0
