---
id: "CORR-005-ANALISIS"
title: "Analisis Detallado - WebSocket Authentication Failed y Eventos No Emitidos"
type: "Analisis"
status: "In Progress"
priority: "P1"
assignee: "@Orquestador"
labels: ["correccion", "websocket", "analisis", "gamification"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# ANALISIS DETALLADO: CORR-005 - WebSocket Authentication Failed

**Agente:** Orquestador (Tech Lead)
**Tipo de tarea:** Correccion Critica
**Prioridad:** P1
**Fecha analisis:** 2026-01-07
**Estado:** EN ANALISIS

---

## RESUMEN EJECUTIVO

Se identificaron **3 problemas** relacionados con WebSocket que impiden el funcionamiento correcto de actualizaciones en tiempo real para LeaderboardPage:

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | JWT Secret inconsistente entre modulos | CRITICO | Tokens no validos en WebSocket |
| 2 | broadcastLeaderboardUpdate() nunca es llamado | ALTO | Sin actualizaciones en tiempo real |
| 3 | useEffect no reacciona a cambios de token | MEDIO | Reconexion fallida tras refresh |

---

## PROBLEMA 1: JWT Configuration Mismatch (CRITICO)

### Descripcion
El modulo WebSocket usa un secret JWT **diferente** al modulo Auth, causando que tokens validos generados por Auth sean rechazados por WebSocket.

### Archivos Afectados

#### 1.1 websocket.module.ts (PROBLEMA)

**Ubicacion:** `/apps/backend/src/modules/websocket/websocket.module.ts`

```typescript
// LINEA 15-20 - CONFIGURACION ACTUAL (INCORRECTA)
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key',  // <-- HARDCODED FALLBACK
  signOptions: {
    expiresIn: '7d',  // <-- 7 dias (diferente a auth)
  },
}),
```

**Problemas identificados:**
1. Secret fallback hardcodeado: `'your-secret-key'`
2. Si `JWT_SECRET` env var no esta configurada, usa secret diferente al de Auth
3. `expiresIn: '7d'` es inconsistente con Auth (`15m` default)

#### 1.2 auth.module.ts (REFERENCIA CORRECTA)

**Ubicacion:** `/apps/backend/src/modules/auth/auth.module.ts`

```typescript
// LINEA 77-89 - CONFIGURACION DE AUTH (CORRECTA)
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '15m';
    return {
      secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
      signOptions: {
        expiresIn: expiresIn as any,
      },
    };
  },
  inject: [ConfigService],
}),
```

### Analisis de Impacto

| Escenario | Auth Secret | WebSocket Secret | Resultado |
|-----------|-------------|------------------|-----------|
| JWT_SECRET definido | `env.JWT_SECRET` | `env.JWT_SECRET` | OK |
| JWT_SECRET NO definido | `'dev-secret-change-in-production'` | `'your-secret-key'` | **FALLO** |

**Causa raiz:** Fallbacks diferentes causan verificacion fallida.

### Evidencia del Error

```
notifications.gateway.ts:112 - Connection rejected: authentication failed
Client receives: { message: 'Authentication failed' }
```

---

## PROBLEMA 2: broadcastLeaderboardUpdate() Nunca Llamado (ALTO)

### Descripcion
El metodo `broadcastLeaderboardUpdate()` existe en `websocket.service.ts` pero **nunca es invocado** desde ningun servicio de gamificacion.

### Archivos Afectados

#### 2.1 websocket.service.ts (METODO EXISTENTE)

**Ubicacion:** `/apps/backend/src/modules/websocket/websocket.service.ts`

```typescript
// LINEA 169-176 - METODO EXISTE PERO NUNCA SE USA
/**
 * Broadcast leaderboard update to all users
 */
broadcastLeaderboardUpdate(leaderboard: any[]) {
  this.gateway.broadcast(SocketEvent.LEADERBOARD_UPDATED, {
    leaderboard,
  });
  this.logger.debug('Leaderboard update broadcasted to all users');
}
```

#### 2.2 leaderboard.service.ts (NO TIENE INTEGRACION)

**Ubicacion:** `/apps/backend/src/modules/gamification/services/leaderboard.service.ts`

**Analisis completo del archivo (582 lineas):**
- NO importa `WebSocketService`
- NO tiene inyeccion de `WebSocketService` en constructor
- NO llama a `broadcastLeaderboardUpdate()` en ningun metodo

**Metodos que deberian emitir eventos:**
| Metodo | Linea | Debe Emitir |
|--------|-------|-------------|
| `getGlobalLeaderboard()` | 41 | NO (es read-only) |
| `getSchoolLeaderboard()` | 175 | NO (es read-only) |
| `getClassroomLeaderboard()` | 297 | NO (es read-only) |
| `getUserPosition()` | 542 | NO (es read-only) |

**Conclusion:** El leaderboard service es de solo lectura. Los eventos WebSocket deberian emitirse cuando:
1. Un usuario gana XP (otro servicio)
2. Un usuario sube de nivel (otro servicio)
3. Se actualiza el ranking (scheduled job)

### Servicios que SI deberian emitir actualizaciones

Necesitamos verificar donde se modifica `user_stats.total_xp`:

```typescript
// Candidatos para emitir broadcastLeaderboardUpdate():
// 1. xp.service.ts - cuando se otorga XP
// 2. user-stats.service.ts - cuando se actualizan stats
// 3. Scheduled job - cada N segundos broadcast leaderboard
```

---

## PROBLEMA 3: useEffect Dependency Array Incompleto (MEDIO)

### Descripcion
El hook `useLeaderboardWebSocket` no incluye el token en el dependency array, causando que no se reconecte cuando el token cambia.

### Archivo Afectado

#### 3.1 useLeaderboardWebSocket.ts

**Ubicacion:** `/apps/frontend/src/features/gamification/social/hooks/useLeaderboardWebSocket.ts`

```typescript
// LINEA 190-205 - USEEFFECT CON DEPENDENCY INCOMPLETO
useEffect(() => {
  const token = getAuthToken();  // <-- Token obtenido DENTRO del efecto

  if (user?.id && token) {
    connect();
  } else {
    console.log(
      '⚠️ Skipping leaderboard WebSocket connection: User not authenticated or token missing',
    );
  }

  return () => {
    disconnect();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.id]);  // <-- SOLO user?.id, NO incluye token
```

### Analisis del Problema

| Escenario | Resultado |
|-----------|-----------|
| Login inicial | Se conecta correctamente |
| Token expira y se refresca | NO se reconecta (dependency no cambio) |
| Usuario hace logout/login | Se reconecta (user.id cambio) |

### Solucion Propuesta

El token se obtiene de `getAuthToken()` que lee de localStorage. Para que el useEffect reaccione a cambios de token, necesitamos:
1. Suscribirse a cambios en authStore
2. O usar un estado derivado del token

---

## DEPENDENCIAS IDENTIFICADAS

### Archivos que requieren modificacion

| Archivo | Cambio Requerido |
|---------|------------------|
| `websocket.module.ts` | Usar `JwtModule.registerAsync` con ConfigService |
| `leaderboard.service.ts` | Inyectar WebSocketService (opcional) |
| `xp.service.ts` | Emitir evento cuando XP cambia (a verificar) |
| `useLeaderboardWebSocket.ts` | Corregir dependencies del useEffect |

### Dependencias del WebSocket Module

```
websocket.module.ts
├── @nestjs/jwt (JwtModule)
├── notifications.gateway.ts (Provider)
├── websocket.service.ts (Provider, Export)
└── ws-jwt.guard.ts (Provider)
```

### Dependencias del Frontend Hook

```
useLeaderboardWebSocket.ts
├── socket.io-client (io, Socket)
├── authStore (useAuthStore, getAuthToken)
├── api.config (API_CONFIG.wsURL)
└── leaderboardsStore (useLeaderboardsStore)
```

---

## VALIDACION DE TIPOS Y EVENTOS

### Backend: SocketEvent Enum

**Ubicacion:** `/apps/backend/src/modules/websocket/types/websocket.types.ts`

```typescript
export enum SocketEvent {
  // ... otros eventos ...
  LEADERBOARD_UPDATED = 'leaderboard_updated',  // <-- Evento definido
}
```

### Frontend: Event Listeners

```typescript
// useLeaderboardWebSocket.ts LINEA 166-169
socket.on('leaderboard:updated', handleLeaderboardUpdate);  // <-- Formato diferente!
socket.on('leaderboard_updated', handleLeaderboardUpdate);  // <-- Formato correcto
```

**Nota:** El frontend escucha ambos formatos, por lo que esto NO es un problema.

---

## METRICAS DEL ANALISIS

| Metrica | Valor |
|---------|-------|
| Archivos analizados | 8 |
| Problemas identificados | 3 |
| Severidad critica | 1 |
| Severidad alta | 1 |
| Severidad media | 1 |
| Lineas de codigo revisadas | ~1,200 |

---

## PROXIMOS PASOS

1. **FASE 3:** Crear plan de ejecucion detallado
2. **FASE 4:** Validar plan contra User Stories
3. **FASE 5:** Refinar plan con dependencias
4. **FASE 6:** Ejecutar correcciones
5. **FASE 7:** Validar ejecucion (builds, tests)

---

**Analizado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
