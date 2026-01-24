---
id: "CORR-004-ANALISIS"
title: "Analisis Detallado - Problemas API LeaderboardPage y AchievementsPage"
type: "Analisis"
status: "Done"
priority: "P0"
assignee: "@Orquestador"
related_task: "CORR-004"
affected_modules: ["frontend", "backend", "gamification", "websocket"]
labels: ["correccion", "api", "bug-critico", "leaderboard", "achievements"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# ANALISIS DETALLADO: CORR-004 - Problemas API LeaderboardPage y AchievementsPage

**Agente:** Orquestador (Tech Lead)
**Tipo de tarea:** Correccion | Bug Critico
**Prioridad:** P0 (Critico)
**Fecha analisis:** 2026-01-07
**Relacionado con:** Portal Student, Gamificacion, WebSocket, API Integration

---

## RESUMEN EJECUTIVO

Se identificaron **3 problemas criticos** que impiden el funcionamiento correcto de LeaderboardPage y AchievementsPage:

| # | Severidad | Componente | Descripcion |
|---|-----------|------------|-------------|
| 1 | **CRITICO** | API Backend | 6 endpoints de leaderboard NO EXISTEN en backend |
| 2 | **CRITICO** | WebSocket | Autenticacion falla - Backend no emite eventos |
| 3 | **ALTA** | AchievementsPage | Mapeo de tipos incompatible (snake_case vs camelCase) |

---

## CONTEXTO

### Antecedentes
CORR-002 (2026-01-07) agrego el `useEffect` para iniciar la carga de datos en LeaderboardPage. Sin embargo, esto solo expuso que los endpoints que el frontend intenta llamar NO EXISTEN en el backend.

### Errores Reportados en Consola

```
GET http://localhost:3006/api/v1/gamification/leaderboards/user-rank 404 (Not Found)
WebSocket connection: Authentication failed
```

---

## PROBLEMA 1: ENDPOINTS FALTANTES EN BACKEND (CRITICO)

### Descripcion del Bug

El frontend define endpoints en `api.config.ts` que NO estan implementados en el backend.

### Analisis Tecnico

**Frontend - Endpoints Definidos:**
**Archivo:** `/apps/frontend/src/config/api.config.ts` (lineas 589-599)

```typescript
leaderboards: {
  byTypeAndPeriod: (type: string, period: string) =>
    `/gamification/leaderboards/${type}/${period}`,
  userRank: '/gamification/leaderboards/user-rank',           // NO EXISTE
  xp: '/gamification/leaderboards/xp',                        // NO EXISTE
  coins: '/gamification/leaderboards/coins',                  // NO EXISTE
  streaks: '/gamification/leaderboards/streaks',              // NO EXISTE
  globalView: '/gamification/leaderboards/global',            // NO EXISTE
  myRank: (type: string) => `/gamification/leaderboards/${type}/my-rank`, // NO EXISTE
  classroom: (classroomId: string) => `/gamification/leaderboard/classrooms/${classroomId}`,
}
```

**Backend - Endpoints Implementados:**
**Archivo:** `/apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts`

```typescript
GET /gamification/leaderboard/global           // linea 73
GET /gamification/leaderboard/schools/:schoolId    // linea 175
GET /gamification/leaderboard/classrooms/:classroomId  // linea 297
GET /gamification/leaderboard/friends/:userId      // linea 414
```

### Discrepancia Critica

| Frontend Llama | Backend Tiene | Status |
|----------------|---------------|--------|
| `/leaderboards/user-rank` | - | NO EXISTE |
| `/leaderboards/xp` | - | NO EXISTE |
| `/leaderboards/coins` | - | NO EXISTE |
| `/leaderboards/streaks` | - | NO EXISTE |
| `/leaderboards/global` | `/leaderboard/global` | RUTA DIFERENTE |
| `/leaderboards/{type}/my-rank` | - | NO EXISTE |
| `/leaderboard/classrooms/{id}` | `/leaderboard/classrooms/{id}` | OK |

### Flujo de Error

```
LeaderboardPage.tsx
    |
    v
useLeaderboards hook (store)
    |
    v
leaderboardsStore.ts:82 - setLeaderboardType()
    |
    v
socialAPI.ts:473 - getUserLeaderboardRank()
    |
    v
apiClient.get(API_ENDPOINTS.leaderboards.userRank)
    |
    v
GET /api/v1/gamification/leaderboards/user-rank --> 404 NOT FOUND
```

### Codigo Fuente del Error

**socialAPI.ts (lineas 451-482):**
```typescript
export const getUserLeaderboardRank = async (
  type: LeaderboardType,
  period: TimePeriod = 'all-time',
): Promise<LeaderboardEntry> => {
  try {
    // Linea 473-476: ESTE ES EL ERROR
    const { data } = await apiClient.get<ApiResponse<LeaderboardEntry>>(
      API_ENDPOINTS.leaderboards.userRank,  // '/gamification/leaderboards/user-rank'
      { params: { type, period } },
    );
    return data.data;
  } catch (error) {
    throw handleAPIError(error);  // 404 propagado
  }
};
```

**leaderboardsStore.ts (lineas 78-87):**
```typescript
// Try to get user's rank (skip for classroom as it's already included)
let userRank: number | undefined = undefined;
if (type !== 'classroom') {
  try {
    const userEntry = await getUserLeaderboardRank(type, selectedPeriod);
    userRank = userEntry.rank;
  } catch (err) {
    console.warn('Could not fetch user rank:', err);  // Error capturado pero logeado
  }
}
```

### Impacto

- El leaderboard principal carga (getLeaderboard funciona)
- El ranking del usuario actual NO se muestra (userRank = undefined)
- Funciones de Sprint 2 (XP, Coins, Streaks) no funcionan
- Mensaje de error en consola confunde a desarrolladores

---

## PROBLEMA 2: WEBSOCKET AUTHENTICATION FAILED (CRITICO)

### Descripcion del Bug

La conexion WebSocket falla con "Authentication failed" y el backend no emite eventos de actualizacion.

### Analisis Tecnico

**Frontend - Hook WebSocket:**
**Archivo:** `/apps/frontend/src/features/gamification/social/hooks/useLeaderboardWebSocket.ts`

```typescript
// Linea 121-132: Conexion a Socket.IO
const socket = io(WEBSOCKET_URL, {
  path: '/socket.io/',
  auth: {
    token: token,  // JWT token enviado
  },
});
```

**Backend - Manejo de Conexion:**
**Archivo:** `/apps/backend/src/modules/websocket/notifications.gateway.ts`

```typescript
// Linea 66-68: Extraccion del token
const token = client.handshake.auth?.token || client.handshake.query?.token;

// Linea 78: Verificacion JWT - PUNTO DE FALLO
const payload = await this.jwtService.verifyAsync(token);

// Linea 111-115: Si falla, emite error
client.emit('error', { message: 'Authentication failed' });
client.disconnect();
```

### Posibles Causas

| Causa | Probabilidad | Descripcion |
|-------|--------------|-------------|
| Token expirado | ALTA | JWT vencio, refresh no funciona |
| JWT_SECRET mismatch | MEDIA | Clave diferente entre servicios |
| Claims faltantes | MEDIA | JWT no tiene `sub`, `email`, `role` |
| Usuario no autenticado | MEDIA | No hay token en localStorage |
| CORS bloqueado | BAJA | Origen no permitido |

### Feature Incompleta

El backend tiene la infraestructura pero NO emite eventos de actualizacion:

```typescript
// notifications.gateway.ts - Eventos definidos pero no implementados
socket.on('leaderboard:updated', handleLeaderboardUpdate);  // Frontend escucha
// Backend NO tiene: this.server.emit('leaderboard:updated', data);  // Falta
```

### Impacto

- Actualizaciones en tiempo real NO funcionan
- Leaderboard no se refresca automaticamente
- Experiencia de usuario degradada

---

## PROBLEMA 3: ACHIEVEMENTSPAGE MAPEO DE TIPOS (ALTA)

### Descripcion del Bug

El backend retorna datos en `snake_case`, el frontend espera `camelCase`. Campos criticos no se mapean.

### Analisis Tecnico

**Frontend - Tipo Esperado:**
**Archivo:** `/apps/frontend/src/shared/types/achievement.types.ts` (lineas 150-160)

```typescript
export interface UserAchievement {
  id: string;
  userId: string;           // CAMEL_CASE
  achievementId: string;    // CAMEL_CASE
  earnedAt?: string;        // CAMEL_CASE - Fecha cuando se gano
  claimedAt?: string;       // CAMEL_CASE - Fecha cuando se reclamo
  status: AchievementStatus;
  achievement: Achievement;
}
```

**Backend - Tipo Retornado:**
**Archivo:** `/apps/backend/src/modules/gamification/dto/user-achievements/user-achievement-response.dto.ts`

```typescript
export class UserAchievementResponseDto {
  @Expose() id!: string;
  @Expose() user_id!: string;              // SNAKE_CASE
  @Expose() achievement_id!: string;       // SNAKE_CASE
  @Expose() completed_at!: Date | null;    // NO ES earnedAt
  @Expose() rewards_claimed!: boolean;     // NO ES claimedAt
  // NO RETORNA: achievement, status, earnedAt, claimedAt
}
```

### Campos Criticos Sin Mapear

| Campo Frontend | Campo Backend | Problema |
|----------------|---------------|----------|
| `userId` | `user_id` | Conversion snake_case requerida |
| `achievementId` | `achievement_id` | Conversion snake_case requerida |
| `earnedAt` | `completed_at` | Nombre diferente |
| `claimedAt` | NO EXISTE | Falta en respuesta |
| `status` | NO EXISTE | Debe calcularse |
| `achievement` | NO EXISTE | Requiere join o llamada separada |

### Codigo Afectado en Frontend

**AchievementsPage.tsx (lineas 233-236):**
```typescript
// Esto siempre retorna vacio porque earnedAt es undefined
const recentlyEarned = userAchievements
  .filter((ua) => ua.earnedAt)  // earnedAt = undefined siempre
  .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
  .slice(0, 3);
```

### Precedente de Solucion

El modulo Missions tiene un transformer funcional:

**Archivo:** `/apps/frontend/src/features/gamification/missions/utils/missionTransformer.ts`

```typescript
const claimedAt = apiMission.claimed_at ? new Date(apiMission.claimed_at) : undefined;
return { ...apiMission, claimedAt };  // Mapeo correcto
```

### Impacto

- Seccion "Recientemente Ganados" siempre vacia
- Fechas no se muestran en cards
- Ordenamiento por fecha no funciona

---

## ANALISIS DE DEPENDENCIAS

### Archivos que se Modificaran

#### Backend (Opcion A: Crear endpoints faltantes)

| Archivo | Tipo de Cambio | Lineas Estimadas |
|---------|----------------|------------------|
| `leaderboard.controller.ts` | Agregar endpoints | +80 |
| `leaderboard.service.ts` | Exponer getUserPosition | +20 |

#### Frontend (Opcion B: Adaptar a endpoints existentes)

| Archivo | Tipo de Cambio | Lineas Estimadas |
|---------|----------------|------------------|
| `api.config.ts` | Corregir rutas | ~10 |
| `socialAPI.ts` | Usar endpoints existentes | ~50 |
| `achievementTransformer.ts` | Crear transformer | +60 (nuevo) |
| `gamification.api.ts` | Usar transformer | ~20 |

### Archivos Dependientes (NO modificar directamente)

| Archivo | Razon |
|---------|-------|
| `leaderboardsStore.ts` | Funciona, solo consume API |
| `useLeaderboards.ts` | Funciona, solo expone store |
| `LeaderboardPage.tsx` | CORR-002 ya aplicada |
| `notifications.gateway.ts` | WebSocket OK, falta emitir eventos |

---

## OPCIONES DE SOLUCION

### Opcion A: Implementar Endpoints Faltantes en Backend (Recomendada)

**Pros:**
- Frontend no necesita cambios significativos
- API contract se cumple
- Mejor separacion de responsabilidades

**Contras:**
- Mas trabajo en backend
- Requiere testing de nuevos endpoints

**Cambios:**
1. Crear endpoint `GET /leaderboards/user-rank`
2. Exponer metodo `getUserPosition()` ya existente
3. Agregar endpoints de Sprint 2 (opcional)

### Opcion B: Adaptar Frontend a Endpoints Existentes

**Pros:**
- Menos cambios totales
- Usa endpoints ya probados

**Contras:**
- Rompe contrato API definido
- Puede afectar otros consumidores

**Cambios:**
1. Cambiar rutas en api.config.ts
2. Usar `/leaderboard/global` en lugar de `/leaderboards/global`
3. Calcular userRank desde datos del leaderboard

### Opcion C: Solucion Hibrida (Recomendada Final)

**Frontend:**
1. Crear achievementTransformer.ts para mapeo
2. Manejar error 404 de user-rank gracefully

**Backend:**
1. Crear endpoint minimal `GET /leaderboards/user-rank`
2. Documentar endpoints de Sprint 2 como "futuro"

---

## VALIDACION CRUZADA CON HISTORIAS DE USUARIO

### US-GAM-007 - Leaderboard simple

| CA | Requisito | Estado Actual | Despues de Fix |
|----|-----------|---------------|----------------|
| CA-01 | Top 10 por XP | PARCIAL (carga sin rank) | SI |
| CA-02 | Actualizacion tiempo real | NO (WS falla) | PARCIAL |
| CA-03 | Posicion, nombre, XP, rango | PARCIAL (sin posicion) | SI |
| CA-04 | Resalta usuario actual | NO (sin rank) | SI |
| CA-05 | Posicion si no en top 10 | NO | SI |
| CA-06 | Accesible desde navbar | SI | SI |
| CA-07 | Responsive design | SI | SI |

**Cumplimiento actual:** 3/7 (43%)
**Cumplimiento esperado:** 6/7 (86%) - WebSocket parcial

### US-GAM-003 - Logros y achievements

| CA | Requisito | Estado Actual | Despues de Fix |
|----|-----------|---------------|----------------|
| CA-01 | Ver logros disponibles | SI | SI |
| CA-02 | Ver progreso | PARCIAL | SI |
| CA-03 | Notificacion al desbloquear | NO (WS) | PARCIAL |
| CA-04 | Reclamar recompensas | SI | SI |
| CA-05 | Ver logros recientes | NO (mapeo) | SI |

**Cumplimiento actual:** 2.5/5 (50%)
**Cumplimiento esperado:** 4.5/5 (90%)

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Regresion en leaderboard | Baja | Alto | Tests unitarios |
| API no compatible | Media | Alto | Versionar endpoints |
| WebSocket sigue fallando | Media | Medio | Fallback a polling |
| Transformer incompleto | Baja | Medio | Copiar patron Missions |

---

## ESTIMACIONES

**Opcion C (Hibrida):**

| Fase | Tiempo | Complejidad |
|------|--------|-------------|
| Backend: user-rank endpoint | 30 min | Baja |
| Frontend: achievementTransformer | 20 min | Baja |
| Frontend: manejo error graceful | 15 min | Baja |
| Testing | 30 min | Media |
| Documentacion | 15 min | Baja |

**Total:** ~2 horas

---

## CONCLUSIONES

### Problema Principal
El frontend fue desarrollado asumiendo endpoints de "Sprint 2" que nunca se implementaron en backend. Esto causa 404 en `user-rank` y funcionalidades rotas.

### Problema Secundario
AchievementsPage tiene mapeo de tipos incompatible. Se requiere un transformer similar al de Missions.

### Problema Terciario
WebSocket autentica pero el backend no emite eventos de leaderboard (feature incompleta).

---

## APROBACION

- [x] Analisis completo
- [x] Causa raiz identificada (3 problemas)
- [x] Solucion propuesta (Opcion C Hibrida)
- [x] Dependencias analizadas
- [x] Riesgos evaluados
- [x] **APROBADO PARA PLANEACION**

---

**Analizado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
