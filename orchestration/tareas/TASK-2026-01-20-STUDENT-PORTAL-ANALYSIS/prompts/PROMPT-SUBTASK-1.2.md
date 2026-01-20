# PROMPT: SUBTASK-1.2 - Normalizar Estructura de Misiones

**Perfil:** @PERFIL_BACKEND + @PERFIL_FRONTEND
**Gap Relacionado:** GAP-SP-002
**Tipo:** Implementacion

---

## Prompt Enviado

```
**PERFIL:** @PERFIL_BACKEND + @PERFIL_FRONTEND
**SUBTAREA:** SUBTASK-1.2 - Normalizar Estructura de Misiones (GAP-SP-002)
**TAREA PADRE:** TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS

## CONTEXTO

Se identifico un gap critico donde el frontend espera triple wrapping en
respuestas de misiones: `response.data.data.missions`

El problema es que el apiClient ya tiene un interceptor que hace unwrap de
`response.data`, por lo que el acceso correcto deberia ser `response.data`
directamente despues del interceptor.

## ARCHIVOS A ANALIZAR

### Frontend:
- `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts`
- `apps/frontend/src/services/api/missionsAPI.ts`
- `apps/frontend/src/lib/api/apiClient.ts` (interceptor de referencia)

### Backend:
- `apps/backend/src/modules/gamification/controllers/missions.controller.ts`
- `apps/backend/src/common/interceptors/transform-response.interceptor.ts`

## TAREA

1. LEER los archivos del frontend para entender el patron actual de unwrap
2. LEER el apiClient para entender el interceptor existente
3. LEER el backend para verificar la estructura de respuesta
4. IDENTIFICAR donde esta el unwrap redundante
5. CORREGIR el frontend para simplificar el acceso a datos
6. VALIDAR que el cambio no rompa otras funcionalidades
7. COMMIT con mensaje descriptivo

## VALIDACION

- npm run build (frontend) debe pasar
- npm run lint debe pasar
- La pagina de misiones debe cargar correctamente

## REFERENCIAS

- Gap identificado en: orchestration/analisis/ANALISIS-STUDENT-PORTAL-COMPLETO-2026-01-20.md
- Patron de apiClient: apps/frontend/src/lib/api/apiClient.ts
```

---

## Contexto Adicional

### Estructura del apiClient

```typescript
// El interceptor ya hace:
response => response.data
// Por lo que response.data.data es redundante
```

### Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `apiClient.ts` | Interceptor que hace unwrap |
| `useMissions.ts` | Hook que consume API |
| `missionsAPI.ts` | Funciones de API |

---

## Resultado Obtenido

**Commit:** `0ad3cad fix(frontend): Normalize API response unwrap in hooks`

**Cambios:**
- Eliminado unwrap redundante en useMissions.ts
- Simplificado acceso en missionsAPI.ts

---

## Uso en Mejora Continua

Este prompt puede servir como template para:
- Correccion de otros gaps de wrapping (achievements, ranks, etc.)
- Normalizacion de patrones de API en todo el frontend
- Documentacion de patrones de interceptors

**Checklist de Validacion:**
- [ ] Identificar interceptor existente
- [ ] Verificar estructura de respuesta backend
- [ ] Localizar unwrap redundante
- [ ] Aplicar correccion
- [ ] Validar build
- [ ] Commit con mensaje descriptivo
