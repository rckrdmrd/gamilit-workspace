# PROMPT: SUBTASK-2.2 - Documentar Estandar de Nomenclatura

**Perfil:** @PERFIL_DOCUMENTATION
**Gap Relacionado:** GAP-SP-004
**Tipo:** Documentacion

---

## Prompt Enviado

```
**PERFIL:** @PERFIL_DOCUMENTATION
**SUBTAREA:** SUBTASK-2.2 - Documentar Estandar de Nomenclatura (GAP-SP-004)
**TAREA PADRE:** TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS

## CONTEXTO

Se identifico inconsistencia en nomenclatura entre backend y frontend:
- Backend usa snake_case: current_balance, avatar_url, created_at
- Frontend espera camelCase: currentBalance, avatarUrl, createdAt

Actualmente hay transformers dispersos en el frontend que hacen esta conversion,
pero no hay un estandar documentado.

## TAREA

1. EXPLORAR el codebase para identificar todos los transformers existentes
2. LISTAR todos los campos que requieren transformacion
3. CREAR documento de estandar en docs/40-estandares/ESTANDAR-NOMENCLATURA-API.md
4. ACTUALIZAR docs/40-estandares/_MAP.md para incluir el nuevo documento

## ESTRUCTURA DEL DOCUMENTO

El documento debe incluir:

### 1. Introduccion
- Proposito del estandar
- Alcance (que endpoints aplica)

### 2. Convencion General
- Backend: snake_case para JSON responses
- Frontend: camelCase para objetos TypeScript
- Transformacion: En la capa de API del frontend

### 3. Tabla de Mapeo
| Campo Backend | Campo Frontend | Tipo | Modulo |
|---------------|----------------|------|--------|
| current_balance | currentBalance | number | Wallet |
| avatar_url | avatarUrl | string | User |

### 4. Implementacion de Transformers
- Patron recomendado
- Ejemplo de codigo
- Ubicacion de transformers existentes

### 5. Guia para Nuevos Endpoints
- Checklist al crear endpoint
- Ejemplo de transformer

## ARCHIVOS A EXPLORAR

- apps/frontend/src/lib/api/*.ts (transformers existentes)
- apps/frontend/src/features/*/api/*.ts
- apps/backend/src/modules/*/dto/*.dto.ts (campos backend)

## VALIDACION

- El documento debe seguir formato Markdown
- Todas las rutas referenciadas deben existir
- El _MAP.md debe estar actualizado

## COMMIT

[SUBTASK-2.2] docs: Add API nomenclature standard (GAP-SP-004)
```

---

## Contexto Adicional

### Transformers Conocidos

| Ubicacion | Funcion |
|-----------|---------|
| `gamification.api.ts` | transformUserStats, transformAchievement |
| `educationalAPI.ts` | transformProgress, transformLesson |
| `apiClient.ts` | Interceptor general |

### Modulos Afectados

- Gamification (wallet, achievements, ranks)
- Educational (progress, lessons, exercises)
- Users (profile, preferences)

---

## Resultado Obtenido

**Entregable:** `docs/40-estandares/ESTANDAR-NOMENCLATURA-API.md`

**Metricas:**
- 113 campos documentados
- 15 transformers identificados
- Guia de implementacion incluida

---

## Uso en Mejora Continua

Este prompt puede servir como template para:
- Documentacion de otros estandares (logging, errores, validacion)
- Creacion de guias de desarrollo
- Normalizacion de patrones en el codebase

**Estructura Recomendada para Estandares:**
1. Introduccion y proposito
2. Convencion general
3. Tabla de referencia
4. Ejemplos de implementacion
5. Guia para nuevos casos
6. Referencias
