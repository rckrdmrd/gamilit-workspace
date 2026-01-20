# CONTEXTO DE SUBAGENTES
# Prompts y Perfiles Utilizados en TASK-2026-01-20-ANALISIS-PORTALES-INTEGRAL

**Propósito:** Documentar los prompts exactos enviados a subagentes para análisis, validación y reutilización en tareas similares.

---

## 1. ESTRUCTURA DE PROMPT ESTÁNDAR

Todos los prompts siguieron esta estructura:

```markdown
## TAREA: [Título descriptivo]

### PERFIL
Actúa como [perfil(es) requerido(s)]

### CONTEXTO
[Descripción del problema o necesidad]

### REFERENCIAS A CONSULTAR
[Lista de archivos específicos a leer]

### INSTRUCCIONES
[Pasos numerados a seguir]

### VALIDACIÓN
[Comandos o verificaciones requeridas]

### ENTREGABLE
[Descripción del output esperado]
```

---

## 2. PROMPTS DE TAREAS DE CÓDIGO

### 2.1 GAP-SP-001: Alinear Ruta de Rango

```markdown
## TAREA: Alinear Ruta de Rango (SUBTASK-1.1, GAP-SP-001)

### PERFIL
Actúa como @PERFIL_BACKEND + @PERFIL_FRONTEND

### CONTEXTO DEL GAP
**GAP-SP-001: Ruta de Rango Inconsistente**
- **Severidad:** CRÍTICO
- **Problema:** Frontend espera `/users/{userId}/rank` pero backend tiene `/ranks/current`
- **Impacto:** DashboardComplete, GamificationPage, ProfilePage

### ANÁLISIS PREVIO (de SUBTASKS.yml)
capved:
  contexto:
    - "Gap entre frontend /users/{userId}/rank y backend /ranks/current"
    - "Impacto en DashboardComplete, GamificationPage, ProfilePage"

  analisis:
    componentes_afectados:
      - "apps/frontend/src/lib/api/gamification.api.ts"
      - "apps/frontend/src/apps/student/pages/DashboardComplete.tsx"
      - "apps/frontend/src/apps/student/pages/ProfilePage.tsx"
      - "apps/backend/src/modules/gamification/controllers/ranks.controller.ts"
    impacto: ALTO

  planeacion:
    opcion_a:
      descripcion: "Agregar endpoint /gamification/users/{userId}/rank en backend"
      pros: ["Frontend no cambia", "Consistente con otros endpoints"]
      contras: ["Nuevo endpoint a mantener"]
    opcion_b:
      descripcion: "Modificar frontend para usar /ranks/current"
      pros: ["No requiere cambio en backend"]
      contras: ["Cambio en múltiples archivos frontend"]

### DECISIÓN RECOMENDADA
**Opción A**: Agregar endpoint en backend (más limpio, frontend no cambia)

### ARCHIVOS A ANALIZAR/MODIFICAR

**Backend:**
- `apps/backend/src/modules/gamification/controllers/ranks.controller.ts`
- `apps/backend/src/modules/gamification/services/ranks.service.ts`

**Frontend:**
- `apps/frontend/src/lib/api/gamification.api.ts`
- `apps/frontend/src/apps/student/pages/DashboardComplete.tsx`
- `apps/frontend/src/apps/student/pages/ProfilePage.tsx`

### INSTRUCCIONES DETALLADAS

1. **Analizar backend actual:**
   - Leer `ranks.controller.ts` para entender endpoints existentes
   - Verificar si ya existe `/ranks/current` y qué retorna
   - Leer `ranks.service.ts` para entender lógica

2. **Analizar frontend:**
   - Leer `gamification.api.ts` para ver cómo llama al endpoint
   - Identificar la ruta exacta que espera

3. **Implementar solución (Opción A):**
   - Agregar nuevo endpoint `GET /gamification/users/:userId/rank`
   - Reusar el servicio existente
   - Agregar decoradores apropiados

4. **Validación:**
   - Ejecutar `npm run build` en backend
   - Ejecutar `npm run lint` en backend

### VALIDACIÓN OBLIGATORIA
cd apps/backend && npm run build
cd apps/backend && npm run lint

### ENTREGABLE
- Código modificado
- Confirmación de build exitoso
- Descripción de cambios realizados
```

**Resultado:** El agente descubrió que el endpoint ya existía pero `api.config.ts` apuntaba a ruta incorrecta. Fix aplicado en línea 555.

---

### 2.2 GAP-SP-002: Normalizar Estructura de Misiones

```markdown
## TAREA: Normalizar Estructura de Misiones (SUBTASK-1.2, GAP-SP-002)

### PERFIL
Actúa como @PERFIL_BACKEND + @PERFIL_FRONTEND

### CONTEXTO DEL GAP
**GAP-SP-002: Estructura de Misiones Triple-wrapped**
- **Severidad:** CRÍTICO
- **Problema:** Frontend espera `response.data.data.missions` (triple wrapping)
- **Impacto:** MissionsPage, DashboardComplete

### ANÁLISIS PREVIO
capved:
  contexto:
    - "Frontend espera triple wrapping: response.data.data.missions"
    - "Backend probablemente retorna { data: { missions } } o { missions }"

  analisis:
    componentes_afectados:
      - "apps/frontend/src/features/gamification/api/missionsAPI.ts"
      - "apps/frontend/src/apps/student/pages/MissionsPage.tsx"
      - "apps/frontend/src/apps/student/pages/DashboardComplete.tsx"
      - "apps/backend/src/modules/gamification/controllers/missions.controller.ts"

  planeacion:
    accion: "Normalizar respuesta backend a { missions: [...] }"
    cambios_requeridos:
      backend: "Remover wrapper { data: } si existe"
      frontend: "Simplificar parsing a response.data.missions"

### ARCHIVOS A ANALIZAR/MODIFICAR

**Backend:**
- `apps/backend/src/modules/gamification/controllers/missions.controller.ts`
- `apps/backend/src/modules/gamification/services/missions.service.ts`

**Frontend:**
- `apps/frontend/src/features/gamification/api/missionsAPI.ts`
- `apps/frontend/src/apps/student/pages/MissionsPage.tsx`
- `apps/frontend/src/apps/student/pages/DashboardComplete.tsx`

### INSTRUCCIONES DETALLADAS

1. **Analizar backend actual:**
   - Leer `missions.controller.ts` para ver qué retorna cada endpoint
   - Buscar wrappers tipo `{ data: result }`
   - Verificar si hay interceptor global

2. **Analizar frontend actual:**
   - Leer `missionsAPI.ts` para ver cómo parsea
   - Entender la expectativa del frontend

3. **Determinar la mejor solución:**
   - **Opción A:** Modificar backend
   - **Opción B:** Modificar frontend
   - **Opción C:** Normalizar ambos

4. **Implementar solución**

5. **Validación:**
   - Build backend y frontend
   - Lint ambos

### ESTRUCTURA OBJETIVO
// Backend debe retornar:
{
  missions: Mission[]
}

// Frontend debe parsear:
const missions = response.data.missions;

### VALIDACIÓN OBLIGATORIA
cd apps/backend && npm run build && npm run lint
cd apps/frontend && npm run build && npm run lint

### ENTREGABLE
- Código modificado
- Confirmación de builds exitosos
- Descripción de cambios
- Explicación estructura antes/después
```

**Resultado:** El agente descubrió que `apiClient` interceptor ya hace unwrap. Corrigió 3 hooks que tenían doble unwrap.

---

### 2.3 GAP-SP-003: Remover Wrapping Achievements

```markdown
## TAREA: Remover Wrapping en Achievements (SUBTASK-2.1, GAP-SP-003)

### PERFIL
Actúa como @PERFIL_BACKEND + @PERFIL_FRONTEND

### CONTEXTO DEL GAP
**GAP-SP-003: Achievements con Wrapping Innecesario**
- **Severidad:** ALTO
- **Problema:** Backend retorna `{ data: result }` con wrapper innecesario
- **Impacto:** Frontend tiene mappers defensivos

### CONTEXTO IMPORTANTE (de SUBTASK-1.2)
Se descubrió que:
1. El `TransformResponseInterceptor` envuelve automáticamente en `{ success: true, data: ... }`
2. El interceptor del `apiClient.ts` (líneas 99-108) hace **unwrap automático**
3. Por lo tanto, `response.data` contiene directamente los datos

### ARCHIVOS A ANALIZAR/MODIFICAR

**Backend:**
- `apps/backend/src/modules/gamification/controllers/achievements.controller.ts`

**Frontend:**
- `apps/frontend/src/lib/api/gamification.api.ts`
- `apps/frontend/src/features/gamification/api/achievementsAPI.ts`

### INSTRUCCIONES DETALLADAS

1. **Analizar backend:**
   - Verificar si hay wrapper manual adicional

2. **Analizar frontend:**
   - Buscar funciones de achievements
   - Identificar mappers defensivos
   - Simplificar parsing

3. **Verificar hooks:**
   - Que usen `response.data` directamente

4. **Implementar correcciones**

### PATRÓN CORRECTO
// Frontend debe hacer:
const response = await apiClient.get<Achievement[]>('/achievements');
return response.data; // Ya es Achievement[] después del unwrap

// NO hacer:
return response.data.data; // Incorrecto

### VALIDACIÓN OBLIGATORIA
cd apps/backend && npm run build && npm run lint
cd apps/frontend && npm run build && npm run lint

### ENTREGABLE
- Código corregido
- Confirmación de builds exitosos
```

**Resultado:** Corregidas 6 funciones en `achievementsAPI.ts` con doble unwrap.

---

## 3. PROMPTS DE DOCUMENTACIÓN

### 3.1 Estándar de Nomenclatura API

```markdown
## TAREA: Documentar Estándar de Nomenclatura API (SUBTASK-2.2, GAP-SP-004)

### PERFIL
Actúa como @PERFIL_DOCUMENTATION

### CONTEXTO
El Student Portal tiene inconsistencia de nomenclatura:
- Backend usa snake_case: current_balance, avatar_url
- Frontend espera camelCase: currentBalance, avatarUrl
- Transformers dispersos en toda la API

### REFERENCIAS A CONSULTAR
1. `apps/frontend/src/lib/api/gamification.api.ts` - Ver transformers existentes
2. `apps/backend/src/modules/gamification/dto/` - Ver DTOs con snake_case
3. Ejemplo de estándar: `docs/40-estandares/ESTANDAR-NOMENCLATURA.md`

### INSTRUCCIONES
1. Analizar transformers existentes en el frontend
2. Documentar la convención: Backend=snake_case, Frontend=camelCase
3. Crear guía de implementación para nuevos endpoints
4. Incluir checklist de validación

### ENTREGABLE
Archivo: `docs/40-estandares/ESTANDAR-NOMENCLATURA-API.md`

### ESTRUCTURA
# Estándar de Nomenclatura API

## Convención
- Backend (Python/NestJS): snake_case
- Frontend (TypeScript): camelCase

## Transformación
[Ejemplos de transformers]

## Checklist
[Lista de verificación]
```

---

### 3.2 Plan de Testing

```markdown
## TAREA: Crear Plan de Testing Prioritario (SUBTASK-2.3, GAP-SP-006)

### PERFIL
Actúa como @PERFIL_TESTING

### CONTEXTO
- Coverage actual: 13%
- Coverage meta: 40%
- Gap: -27%
- 8 archivos testeados de 371 componentes

### REFERENCIAS A CONSULTAR
1. `orchestration/inventarios/FRONTEND_INVENTORY.yml`
2. `orchestration/tareas/TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS/SUBTASKS.yml`
3. Tests existentes: `apps/frontend/src/**/*.test.ts`
4. Hooks críticos: useDashboardData, useExerciseAutoSave, gamification.api.ts

### INSTRUCCIONES
1. Buscar tests existentes
2. Identificar componentes/hooks más críticos sin tests
3. Priorizar por impacto
4. Crear plan detallado con estimaciones

### ENTREGABLE
Archivo: `orchestration/testing/TESTING-PLAN-STUDENT-PORTAL.md`

### ESTRUCTURA
# Plan de Testing - Student Portal

## 1. Estado Actual
### Tests Existentes
[tabla]

## 2. Priorización
### P0 - Crítico (Sprint 1)
### P1 - Alto (Sprint 2)

## 3. Estrategia

## 4. Roadmap
```

---

### 3.3 Especificaciones de Mecánicas

```markdown
## TAREA: Documentar Especificaciones de Mecánicas (SUBTASK-3.2, GAP-SP-008)

### PERFIL
Actúa como @PERFIL_REQUIREMENTS + @PERFIL_DOCUMENTATION

### CONTEXTO
33 mecánicas de ejercicios requieren documentación:
- M1-M3 básicas: 23
- M4 creativas: 5
- M5 multimedia: 3

### REFERENCIAS A CONSULTAR
1. `apps/backend/src/modules/educational-content/entities/exercise.entity.ts`
2. `apps/frontend/src/features/exercises/components/`
3. Documentación existente en `docs/90-transversal/`

### INSTRUCCIONES
1. Analizar entidad Exercise y campo content JSONB
2. Para cada mecánica documentar:
   - Nombre y descripción
   - Tipo de contenido (content JSONB)
   - Formato de respuesta esperada
   - Criterios de evaluación
   - Recompensas (XP, ML Coins)

### ENTREGABLES
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md`
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M4.md`
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M5.md`
```

---

## 4. PROMPTS DE VALIDACIÓN SIMCO

### 4.1 Validar Estructura de Carpetas

```markdown
## TAREA: Validar Estructura de Carpetas de Tareas según SIMCO

### PERFIL
Actúa como @PERFIL_DOCUMENTATION + @PERFIL_ORQUESTADOR

### CONTEXTO
Tareas completadas 2026-01-20:
- TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS
- TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS
- TASK-2026-01-20-TEACHER-PORTAL-ANALYSIS

### DIRECTIVAS A VERIFICAR
Según CLAUDE.md, Regla 7:
1. Carpeta: `orchestration/tareas/TASK-{YYYY-MM-DD}-{NNN}/`
2. METADATA.yml completo
3. Documentar fases C, E, D mínimo
4. Actualizar `_INDEX.yml`

### VERIFICACIONES
1. Carpetas existen
2. METADATA.yml completo
3. _INDEX.yml actualizado

### ENTREGABLE
Reporte con:
- Estado de cada carpeta
- Items faltantes
- Recomendaciones
```

---

### 4.2 Validar Inventarios

```markdown
## TAREA: Validar Inventarios Actualizados según SIMCO

### PERFIL
Actúa como @PERFIL_DOCUMENTATION

### CONTEXTO
Cambios de código 2026-01-20:
- GAP-SP-001: api.config.ts
- GAP-SP-002: 3 hooks
- GAP-SP-003: achievementsAPI.ts

### DIRECTIVAS A VERIFICAR
Según CLAUDE.md, Regla 8:
- FRONTEND_INVENTORY.yml actualizado
- MASTER_INVENTORY.yml con totales

### VERIFICACIONES
1. FRONTEND_INVENTORY.yml con archivos modificados
2. Conteo correcto
3. Changelog actualizado

### ENTREGABLE
Reporte con:
- Estado de inventarios
- Discrepancias
- Archivos faltantes
```

---

## 5. PROMPTS DE CORRECCIÓN

### 5.1 Corregir _INDEX.yml

```markdown
## TAREA: Corregir _INDEX.yml con Tareas Faltantes

### PERFIL
Actúa como @PERFIL_DOCUMENTATION

### PROBLEMA
_INDEX.yml desactualizado:
- STUDENT-PORTAL: NO registrada
- TEACHER-PORTAL: NO registrada

### ARCHIVO
`orchestration/tareas/_INDEX.yml`

### INSTRUCCIONES
1. Leer _INDEX.yml actual
2. Agregar tareas faltantes
3. Actualizar estadísticas
4. Agregar a historial_por_fecha
5. Agregar a por_proyecto

### VALIDACIÓN
- YAML válido
- Todas las tareas registradas
```

---

## 6. MÉTRICAS DE EFECTIVIDAD

### 6.1 Tasa de Éxito por Tipo de Prompt

| Tipo | Intentos | Éxitos | Tasa |
|------|----------|--------|------|
| Código (GAP fix) | 3 | 3 | 100% |
| Documentación | 8 | 8 | 100% |
| Validación | 4 | 4 | 100% |
| Corrección | 4 | 4 | 100% |

### 6.2 Hallazgos Inesperados

| Prompt | Hallazgo | Impacto |
|--------|----------|---------|
| GAP-SP-001 | Endpoint ya existía, problema era en config | Cambió la solución |
| GAP-SP-002 | apiClient ya hace unwrap | Simplificó fix |
| US-AE-012-018 | Ya existían documentadas | Evitó duplicación |

### 6.3 Patrones de Éxito

1. **Referencias explícitas:** Proporcionar rutas exactas de archivos mejora precisión
2. **Contexto previo:** Incluir análisis de SUBTASKS.yml ayuda a la decisión
3. **Opciones predefinidas:** Ofrecer opciones A/B/C acelera implementación
4. **Validación obligatoria:** Incluir comandos de build/lint previene errores

---

**Generado:** 2026-01-20
**Propósito:** Análisis y mejora de prompts para tareas futuras
