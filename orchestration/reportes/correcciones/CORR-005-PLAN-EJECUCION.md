---
id: "CORR-005-PLAN"
title: "Plan de Ejecucion - WebSocket Authentication y Eventos"
type: "Plan"
status: "Ejecutado"
priority: "P1"
assignee: "@Orquestador"
related_analysis: "CORR-005-ANALISIS-DETALLADO-WEBSOCKET.md"
labels: ["correccion", "websocket", "plan", "gamification"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# PLAN DE EJECUCION: CORR-005 - WebSocket Authentication y Eventos

**Agente:** Orquestador (Tech Lead)
**Tipo de tarea:** Correccion Critica
**Prioridad:** P1
**Fecha planeacion:** 2026-01-07
**Estado:** EJECUTADO

---

## RESUMEN DEL PLAN

Se ejecutaran **2 correcciones criticas** y **1 mejora de prioridad media** para resolver los problemas de WebSocket identificados en el analisis:

| # | Correccion | Severidad | Fase |
|---|------------|-----------|------|
| C1 | JWT Configuration Fix | CRITICO | 6.1 |
| C2 | useEffect Dependency Fix | MEDIO | 6.2 |
| M1 | Broadcast Integration | FUTURO | Fuera de alcance |

**Nota:** La integracion de `broadcastLeaderboardUpdate()` requiere cambios arquitectonicos mayores (import WebSocketModule en GamificationModule, posibles dependencias circulares). Se documenta como pendiente para Sprint futuro.

---

## FASE 6.1: JWT Configuration Fix (CRITICO)

### Objetivo
Unificar la configuracion JWT entre WebSocket Module y Auth Module para que tokens generados por Auth sean validos en WebSocket.

### Archivo a Modificar

**Archivo:** `/apps/backend/src/modules/websocket/websocket.module.ts`

### Cambio Requerido

**ANTES (lineas 13-21):**
```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
```

**DESPUES:**
```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
```

### Justificacion

| Aspecto | Antes | Despues |
|---------|-------|---------|
| Secret Source | Hardcoded fallback | ConfigService (igual que Auth) |
| Fallback Secret | `'your-secret-key'` | `'dev-secret-change-in-production'` |
| Config Method | `register()` | `registerAsync()` |
| Expiration | Hardcoded `'7d'` | From env or `'7d'` default |

### Validacion

- [ ] Backend compila sin errores (`npx tsc --noEmit`)
- [ ] WebSocket acepta tokens generados por Auth
- [ ] Fallback consistente con Auth module

---

## FASE 6.2: useEffect Dependency Fix (MEDIO)

### Objetivo
Corregir el hook `useLeaderboardWebSocket` para que reaccione a cambios de token (despues de refresh).

### Archivo a Modificar

**Archivo:** `/apps/frontend/src/features/gamification/social/hooks/useLeaderboardWebSocket.ts`

### Cambio Requerido

**ANTES (lineas 190-205):**
```typescript
useEffect(() => {
  const token = getAuthToken();

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
}, [user?.id]);
```

**DESPUES:**
```typescript
// Suscribirse a cambios del token desde authStore
const accessToken = useAuthStore((state) => state.accessToken);

useEffect(() => {
  if (user?.id && accessToken) {
    connect();
  } else {
    console.log(
      '⚠️ Skipping leaderboard WebSocket connection: User not authenticated or token missing',
    );
  }

  return () => {
    disconnect();
  };
}, [user?.id, accessToken, connect, disconnect]);
```

### Justificacion

| Aspecto | Antes | Despues |
|---------|-------|---------|
| Token Source | `getAuthToken()` interno | `useAuthStore` selector |
| Reactivity | Solo `user?.id` | `user?.id` + `accessToken` |
| Reconnect on Refresh | NO | SI |
| ESLint Override | SI | NO necesario |

### Dependencias Adicionales

Verificar que `authStore` expone `accessToken`:

```typescript
// En authStore.ts
interface AuthState {
  accessToken: string | null;
  // ...
}
```

### Validacion

- [ ] Frontend compila sin errores (`npm run build`)
- [ ] WebSocket reconecta despues de token refresh
- [ ] No hay loops infinitos de reconexion

---

## FASE 6.3: Validacion Integral

### Checklist de Build

```bash
# Backend
cd apps/backend
npx tsc --noEmit

# Frontend
cd apps/frontend
npm run build
```

### Pruebas Manuales

1. **Login y Conexion WebSocket**
   - [ ] Login normal conecta WebSocket
   - [ ] Logs muestran "✅ Leaderboard WebSocket authenticated"

2. **Token Refresh**
   - [ ] Dejar token expirar (o simular)
   - [ ] Verificar reconexion automatica

3. **Error Handling**
   - [ ] Sin JWT_SECRET env: WebSocket usa fallback correcto
   - [ ] Token invalido: Error claro sin crash

---

## FUERA DE ALCANCE (FUTURO)

### M1: Broadcast Leaderboard Integration

**Razon de exclusion:** Requiere cambios arquitectonicos mayores.

**Cambios necesarios:**
1. Importar WebSocketModule en GamificationModule
2. Inyectar WebSocketService en UserStatsService
3. Llamar `broadcastLeaderboardUpdate()` en `addXp()`
4. Posible throttling para evitar broadcasts excesivos

**Recomendacion:** Crear historia de usuario separada para Sprint futuro.

**Historia sugerida:**
```yaml
id: US-GAM-XXX
title: Real-time Leaderboard Updates
acceptance_criteria:
  - Cuando un usuario gana XP, el leaderboard se actualiza en tiempo real
  - Los usuarios conectados ven cambios de posicion sin refresh
  - Broadcasts estan throttleados a maximo 1 por segundo
```

---

## ARCHIVOS A MODIFICAR

| Archivo | Tipo | Lineas Estimadas |
|---------|------|------------------|
| websocket.module.ts | Modificacion | ~15 |
| useLeaderboardWebSocket.ts | Modificacion | ~10 |

**Total estimado:** ~25 lineas

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| ConfigService no disponible | Baja | Alto | Verificar ConfigModule importado |
| authStore no expone accessToken | Media | Medio | Verificar interface antes de editar |
| Loop de reconexion | Baja | Alto | Incluir connect/disconnect en deps |

---

## CRITERIOS DE EXITO

- [ ] Backend compila sin errores de TypeScript
- [ ] Frontend compila sin errores de TypeScript
- [ ] WebSocket conecta exitosamente con token de Auth
- [ ] WebSocket reconecta despues de token refresh
- [ ] No hay errores en console relacionados a WebSocket auth

---

**Planificado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** LISTO PARA EJECUCION
