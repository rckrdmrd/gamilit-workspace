# CHECKLIST DE VALIDACIÓN - HOTFIX RUTAS API

## ANTES DE PROBAR EN NAVEGADOR

### Verificación de Código
- [x] Todos los endpoints `/api/v1/gamification` corregidos a `/v1/gamification`
- [x] No quedan instancias de `apiClient.get(/api/` en el código
- [x] Archivos modificados verificados con git diff
- [x] Documentación de cambios generada

### Archivos Modificados
- [x] `apps/frontend/src/shared/hooks/useUserGamification.ts`
- [x] `apps/frontend/src/features/gamification/economy/store/economyStore.ts`
- [x] `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`

## PRUEBAS EN NAVEGADOR

### 1. Preparación
- [ ] Backend corriendo en `http://localhost:3006`
- [ ] Frontend corriendo en desarrollo
- [ ] Usuario autenticado en la aplicación
- [ ] DevTools abierto (Network tab)

### 2. Verificación de URLs (Network Tab)

#### Endpoints a Verificar:
- [ ] GET `/api/v1/gamification/users/:userId/stats`
  - **Esperado**: 200 OK
  - **URL debe ser**: `http://localhost:3006/api/v1/gamification/users/.../stats`
  - **NO debe ser**: `http://localhost:3006/api/api/v1/...`

- [ ] GET `/api/v1/gamification/users/:userId/achievements`
  - **Esperado**: 200 OK
  - **URL debe ser**: `http://localhost:3006/api/v1/gamification/users/.../achievements`
  - **NO debe ser**: `http://localhost:3006/api/api/v1/...`

- [ ] GET `/api/v1/gamification/users/:userId/rank-progress`
  - **Esperado**: 200 OK
  - **URL debe ser**: `http://localhost:3006/api/v1/gamification/users/.../rank-progress`
  - **NO debe ser**: `http://localhost:3006/api/api/v1/...`

- [ ] PATCH `/api/v1/gamification/users/:userId/stats` (al ganar XP/ML Coins)
  - **Esperado**: 200 OK
  - **URL debe ser**: `http://localhost:3006/api/v1/gamification/users/.../stats`
  - **NO debe ser**: `http://localhost:3006/api/api/v1/...`

### 3. Verificación Funcional

#### Header de Gamificación
- [ ] Se muestra nivel del usuario
- [ ] Se muestran ML Coins actuales
- [ ] Se muestra rango Maya actual
- [ ] Se muestran logros desbloqueados

#### Sistema de Economía
- [ ] Balance de ML Coins carga correctamente
- [ ] Historial de transacciones se muestra
- [ ] Se pueden ganar ML Coins (testing)
- [ ] Se pueden gastar ML Coins (testing)

#### Sistema de Rangos
- [ ] Progreso de nivel se muestra
- [ ] XP actual se muestra correctamente
- [ ] Barra de progreso funciona
- [ ] Información de siguiente rango disponible

### 4. Verificación de Errores

#### Console (DevTools)
- [ ] No hay errores 404 en console
- [ ] No hay errores de "Failed to fetch gamification data"
- [ ] No hay warnings sobre rutas incorrectas

#### Network Tab
- [ ] Todas las llamadas a gamificación retornan 200 OK
- [ ] No hay llamadas con `/api/api/` duplicado
- [ ] Request headers incluyen Authorization token

### 5. Casos Edge

#### Usuario sin datos de gamificación
- [ ] Se muestran valores por defecto (Nivel 1, 0 XP, 0 ML)
- [ ] No se muestran errores en UI
- [ ] Fallback data se carga correctamente

#### Usuario desautenticado
- [ ] Se muestra error apropiado
- [ ] No se rompe la UI
- [ ] Redirect a login si es necesario

## RESULTADOS ESPERADOS

### URLs Correctas (Ejemplos)
```
✓ http://localhost:3006/api/v1/gamification/users/be9932ff-f0af-46e6-891a-adca5bcbfdbc/stats
✓ http://localhost:3006/api/v1/gamification/users/be9932ff-f0af-46e6-891a-adca5bcbfdbc/achievements
✓ http://localhost:3006/api/v1/gamification/users/be9932ff-f0af-46e6-891a-adca5bcbfdbc/rank-progress
```

### Respuestas de API Esperadas

#### GET /stats
```json
{
  "user_id": "be9932ff-f0af-46e6-891a-adca5bcbfdbc",
  "level": 5,
  "current_xp": 450,
  "total_xp": 1250,
  "xp_to_next_level": 500,
  "ml_coins": 350,
  "current_rank": "Ajaw",
  "current_streak": 3
}
```

#### GET /achievements
```json
[
  {
    "achievement_id": "first_case",
    "unlocked_at": "2025-11-20T10:00:00Z"
  },
  {
    "achievement_id": "streak_7",
    "unlocked_at": "2025-11-22T15:30:00Z"
  }
]
```

## PROBLEMAS COMUNES

### Si aún ves 404:
1. Verifica que backend esté corriendo
2. Revisa que el endpoint existe en backend
3. Confirma que el userId es válido
4. Verifica authentication token en headers

### Si ves otros errores:
1. Revisa console para stack trace completo
2. Verifica que el formato de response coincide con frontend
3. Confirma que el backend tiene los datos del usuario
4. Revisa permisos y autenticación

## DESPUÉS DE VALIDACIÓN

### Si todo funciona:
- [ ] Crear commit con cambios
- [ ] Actualizar issue/ticket correspondiente
- [ ] Notificar al equipo sobre el fix
- [ ] Implementar recomendaciones de prevención

### Si hay problemas:
- [ ] Documentar errores encontrados
- [ ] Crear ticket para issues pendientes
- [ ] Escalar si es necesario
- [ ] Revisar configuración de backend

---

**Última actualización**: 2025-11-23
**Responsable**: Frontend-Agent
**Estado**: Listo para validación
