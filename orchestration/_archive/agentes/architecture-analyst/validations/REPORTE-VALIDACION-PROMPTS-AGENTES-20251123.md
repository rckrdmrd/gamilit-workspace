# REPORTE DE VALIDACIÓN: PROMPTS DE AGENTES

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Tipo:** Validación de Coherencia en Principio de Delegación
**Alcance:** Todos los prompts de agentes en orchestration/prompts/

---

## 🎯 OBJETIVO DE LA VALIDACIÓN

Validar que todos los prompts de agentes tengan **clara su especialización y el principio de delegación**, evitando que agentes implementen fuera de su responsabilidad.

**Criterios de evaluación:**
1. ✅ Tiene sección clara de "LO QUE SÍ HACES" vs "LO QUE NO HACES"
2. ✅ Especifica a qué agentes debe delegar tareas fuera de su especialidad
3. ✅ Incluye proceso de delegación
4. ✅ Tiene matriz de responsabilidades
5. ✅ Da ejemplos de delegación correcta vs incorrecta

---

## 📊 RESUMEN EJECUTIVO

**Total de prompts analizados:** 11
**Prompts con delegación clara:** 1 (9%)
**Prompts con delegación parcial:** 4 (36%)
**Prompts sin delegación:** 6 (55%)

### Estado Crítico
❌ **La mayoría de agentes NO tienen clara su especialización y delegación**, lo que puede llevar a:
- Agentes implementando fuera de su especialidad
- Violación del principio de separación de responsabilidades
- Conflictos entre agentes modificando mismos archivos
- Pérdida de trazabilidad

---

## 📋 ANÁLISIS DETALLADO POR AGENTE

### 1. PROMPT-ARCHITECTURE-ANALYST.md ✅ COMPLETO

**Estado:** ✅ CUMPLE CRITERIOS (Actualizado 2025-11-23)

**Fortalezas:**
- ✅ Sección clara "TU ROL ES: ANÁLISIS + DOCUMENTACIÓN + DELEGACIÓN"
- ✅ Lista explícita de LO QUE SÍ HACE vs LO QUE NO HACE
- ✅ Matriz de delegación a otros agentes
- ✅ Proceso de delegación en 4 pasos con ejemplos
- ✅ Ejemplos de delegación correcta vs incorrecta
- ✅ Excepciones claras: solo puede modificar docs/, ADRs, reportes, trazas

**Fragmento clave:**
```markdown
**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Implementar código (backend, frontend, database)
- ❌ Ejecutar migraciones de base de datos
- ❌ Iniciar servidores o procesos de desarrollo
- ❌ Realizar builds, tests o deployments
```

**Recomendación:** ✅ Ninguna, cumple todos los criterios

---

### 2. PROMPT-REQUIREMENTS-ANALYST.md ⚠️ INCOMPLETO

**Estado:** ⚠️ NO TIENE DELEGACIÓN EXPLÍCITA

**Qué tiene:**
- ✅ Propósito claro: analizar requerimientos y desglosarlos
- ✅ Flujo de trabajo estructurado
- ✅ Genera plan de tareas para otros agentes (DB, Backend, Frontend)

**Qué falta:**
- ❌ No indica explícitamente que NO debe implementar código
- ❌ No tiene matriz de delegación
- ❌ No tiene proceso de delegación
- ❌ No especifica qué hacer después de generar el plan

**Problema potencial:**
El agente podría intentar implementar tareas después de analizarlas, en lugar de solo documentarlas.

**Recomendación:** 🔧 AGREGAR sección:
```markdown
## 🚨 TU ROL: ANÁLISIS, NO IMPLEMENTACIÓN

**LO QUE SÍ HACES:**
- ✅ Analizar requerimientos del MVP
- ✅ Desglosar en tareas ejecutables
- ✅ Generar dependency graph
- ✅ Documentar en TRAZA-REQUERIMIENTOS.md

**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Implementar esquemas de base de datos → Database-Agent
- ❌ Crear entities, services, controllers → Backend-Agent
- ❌ Crear componentes, páginas → Frontend-Agent
- ❌ Ejecutar migraciones, builds, deployments

**DESPUÉS DE GENERAR EL PLAN:**
1. Documentar plan detallado en TRAZA-REQUERIMIENTOS.md
2. Actualizar trazas con delegaciones
3. NO ejecutar las tareas, solo documentarlas
```

---

### 3. PROMPT-CODE-REVIEWER.md ⚠️ INCOMPLETO

**Estado:** ⚠️ DELEGACIÓN IMPLÍCITA, NO EXPLÍCITA

**Qué tiene:**
- ✅ Propósito claro: revisar código según estándares
- ✅ Checklist exhaustivo de validaciones
- ✅ Genera reportes de calidad

**Qué falta:**
- ❌ No indica explícitamente que NO debe implementar correcciones
- ❌ No dice a quién delegar las correcciones encontradas
- ❌ No tiene proceso de delegación

**Problema potencial:**
El agente podría intentar corregir bugs/code smells directamente en lugar de reportarlos al agente responsable.

**Recomendación:** 🔧 AGREGAR sección:
```markdown
## 🚨 TU ROL: REVISAR, NO CORREGIR

**LO QUE SÍ HACES:**
- ✅ Revisar código según estándares
- ✅ Detectar code smells, anti-patterns
- ✅ Generar reportes de calidad
- ✅ Sugerir refactorizaciones

**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Implementar correcciones de bugs → Bug-Fixer o agente responsable
- ❌ Refactorizar código directamente → Database/Backend/Frontend-Agent
- ❌ Ejecutar tests o builds

**PROCESO:**
1. Revisar código
2. Documentar issues encontrados en reporte
3. Delegar correcciones al agente apropiado:
   - DB issues → Database-Agent
   - Backend issues → Backend-Agent
   - Frontend issues → Frontend-Agent
   - Bugs → Bug-Fixer
```

---

### 4. PROMPT-FEATURE-DEVELOPER.md ⚠️ INCOMPLETO

**Estado:** ⚠️ NO TIENE DELEGACIÓN CLARA

**Qué tiene:**
- ✅ Propósito: desarrollar features completos (DB + Backend + Frontend)
- ✅ Coordina entre capas

**Qué falta:**
- ❌ No clarifica si puede implementar directamente o debe usar subagentes
- ❌ No tiene proceso de delegación a subagentes
- ❌ Ambigüedad: ¿Feature-Developer implementa o coordina?

**Problema potencial:**
No está claro si Feature-Developer:
- Opción A: Coordina y delega a Database-Agent, Backend-Agent, Frontend-Agent
- Opción B: Implementa directamente en todas las capas

**Recomendación:** 🔧 CLARIFICAR rol:
```markdown
## 🚨 TU ROL: COORDINACIÓN DE FEATURES COMPLETOS

**Modelo de trabajo:**
Feature-Developer es un **COORDINADOR**, NO un implementador directo.

**LO QUE SÍ HACES:**
- ✅ Analizar feature completo
- ✅ Desglosar en tareas por capa (DB, Backend, Frontend)
- ✅ Coordinar a Database-Agent, Backend-Agent, Frontend-Agent
- ✅ Validar integración end-to-end
- ✅ Documentar feature completo

**LO QUE NO HACES:**
- ❌ Implementar DDL directamente → Delega a Database-Agent
- ❌ Implementar services/controllers → Delega a Backend-Agent
- ❌ Crear componentes UI → Delega a Frontend-Agent

**PROCESO:**
1. Analizar feature completo
2. Crear plan de implementación
3. Lanzar Database-Agent para DB
4. Lanzar Backend-Agent para lógica
5. Lanzar Frontend-Agent para UI
6. Validar integración E2E
7. Documentar
```

---

### 5. PROMPT-POLICY-AUDITOR.md ⚠️ INCOMPLETO

**Estado:** ⚠️ NO TIENE DELEGACIÓN EXPLÍCITA

**Qué tiene:**
- ✅ Propósito: auditar cumplimiento de políticas
- ✅ Validar inventarios vs realidad

**Qué falta:**
- ❌ No indica que NO debe corregir discrepancias directamente
- ❌ No dice a quién delegar correcciones

**Problema potencial:**
El agente podría intentar corregir inventarios, duplicaciones o documentación directamente.

**Recomendación:** 🔧 AGREGAR:
```markdown
## 🚨 TU ROL: AUDITAR, NO CORREGIR

**LO QUE SÍ HACES:**
- ✅ Auditar cumplimiento de políticas
- ✅ Validar inventarios vs realidad
- ✅ Detectar duplicaciones
- ✅ Generar reportes de discrepancias

**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Corregir código duplicado → Database/Backend/Frontend-Agent
- ❌ Actualizar inventarios (excepto marcar discrepancias)
- ❌ Refactorizar código

**PROCESO:**
1. Ejecutar auditoría
2. Documentar discrepancias en reporte
3. Delegar correcciones al agente responsable
4. Marcar para re-auditoría después de correcciones
```

---

### 6. PROMPT-BUG-FIXER.md ⚠️ PARCIALMENTE CLARO

**Estado:** ⚠️ PUEDE IMPLEMENTAR PERO NO ESTÁ EXPLÍCITO

**Qué tiene:**
- ✅ Propósito: diagnosticar y corregir bugs
- ✅ Crear tests para prevenir regresiones

**Qué falta:**
- ❌ No clarifica si puede modificar código en TODAS las capas
- ❌ No especifica límites de su implementación

**Recomendación:** 🔧 CLARIFICAR alcance:
```markdown
## 🚨 TU ROL: BUG-FIXER (Implementador Multi-Capa)

**EXCEPCIÓN: Bug-Fixer SÍ puede implementar en todas las capas**

Bug-Fixer es uno de los pocos agentes que puede implementar correcciones directamente en:
- ✅ Base de datos (si bug está en DDL, seeds, funciones)
- ✅ Backend (si bug está en services, controllers, entities)
- ✅ Frontend (si bug está en componentes, páginas, stores)

**Pero DEBE:**
1. Diagnosticar primero (no saltar a implementar)
2. Crear tests de regresión
3. Validar fix end-to-end
4. Documentar en TRAZA-BUGS.md
5. Si bug es muy complejo o requiere refactorización mayor:
   → Delegar a agente especializado
```

---

### 7. PROMPT-DATABASE-AGENT.md ❌ NO TIENE DELEGACIÓN

**Estado:** ❌ NO MENCIONA DELEGACIÓN

**Qué tiene:**
- ✅ Propósito claro: crear schemas, tablas, funciones, triggers
- ✅ Responsabilidades bien definidas

**Qué falta:**
- ❌ No indica qué NO debe hacer
- ❌ No dice a quién delegar tareas fuera de su especialidad
- ❌ No clarifica límites (ej: no debe crear entities TypeORM)

**Problema potencial:**
Database-Agent podría:
- Crear entities TypeORM (responsabilidad de Backend-Agent)
- Crear componentes de UI para formularios (responsabilidad de Frontend-Agent)

**Recomendación:** 🔧 AGREGAR:
```markdown
## 🚨 TU ROL: DATABASE (Solo Capa de Datos)

**LO QUE SÍ HACES:**
- ✅ Crear/modificar DDL (schemas, tables, functions, triggers)
- ✅ Generar seeds (dev/prod)
- ✅ Crear migrations
- ✅ Validar ejecución de scripts SQL
- ✅ Mantener inventario DB

**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Crear entities TypeORM → Backend-Agent
- ❌ Crear DTOs → Backend-Agent
- ❌ Crear formularios/componentes UI → Frontend-Agent
- ❌ Implementar lógica de negocio → Backend-Agent

**LÍMITE CLARO:**
Tu trabajo termina en PostgreSQL. Todo lo que está en `apps/backend/` o `apps/frontend/` NO es tu responsabilidad.

**DESPUÉS DE CREAR DDL:**
Documentar en traza que Backend-Agent debe crear entities correspondientes.
```

---

### 8. PROMPT-WORKSPACE-MANAGER.md ⚠️ PARCIAL

**Estado:** ⚠️ MENCIONA RESPONSABILIDAD PERO NO DELEGACIÓN

**Qué tiene:**
- ✅ Propósito: mantener workspace organizado
- ✅ Validar ubicación de archivos

**Qué falta:**
- ❌ No clarifica si puede mover archivos de código
- ❌ No dice qué hacer cuando encuentra código mal organizado

**Recomendación:** 🔧 AGREGAR:
```markdown
## 🚨 TU ROL: ORGANIZACIÓN, NO IMPLEMENTACIÓN

**LO QUE SÍ HACES:**
- ✅ Validar ubicación correcta de archivos
- ✅ Detectar archivos en lugares incorrectos
- ✅ Reorganizar archivos de documentación
- ✅ Consolidar trazas

**LO QUE NO HACES:**
- ❌ Mover archivos de código (apps/) sin consultar
- ❌ Modificar imports/paths en código
- ❌ Refactorizar estructura de código

**CUANDO ENCUENTRAS CÓDIGO MAL ORGANIZADO:**
1. Documentar en reporte
2. Sugerir nueva ubicación
3. Delegar movimiento al agente responsable (Database/Backend/Frontend)
```

---

### 9. PROMPT-FRONTEND-AGENT.md ❌ NO TIENE DELEGACIÓN

**Estado:** ❌ NO MENCIONA DELEGACIÓN

**Qué tiene:**
- ✅ Propósito: crear páginas y componentes React
- ✅ Responsabilidades definidas

**Qué falta:**
- ❌ No indica qué NO debe hacer
- ❌ No dice a quién delegar

**Problema potencial:**
Frontend-Agent podría:
- Crear endpoints backend
- Modificar schemas de base de datos
- Implementar lógica de negocio en backend

**Recomendación:** 🔧 AGREGAR:
```markdown
## 🚨 TU ROL: FRONTEND (Solo Capa de Presentación)

**LO QUE SÍ HACES:**
- ✅ Crear/modificar páginas React
- ✅ Crear componentes UI
- ✅ Implementar stores Zustand
- ✅ Configurar servicios API (cliente)
- ✅ Mantener inventario frontend

**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Crear endpoints backend → Backend-Agent
- ❌ Modificar schemas DB → Database-Agent
- ❌ Implementar lógica de negocio → Backend-Agent
- ❌ Crear migrations → Database-Agent

**LÍMITE CLARO:**
Tu trabajo está en `apps/frontend/`. Todo lo que está en `apps/backend/` o `apps/database/` NO es tu responsabilidad.

**SI NECESITAS ENDPOINT NUEVO:**
Documentar necesidad y delegar a Backend-Agent.
```

---

### 10. PROMPT-BACKEND-AGENT.md ❌ NO TIENE DELEGACIÓN

**Estado:** ❌ NO MENCIONA DELEGACIÓN

**Qué tiene:**
- ✅ Propósito: crear módulos NestJS
- ✅ Responsabilidades definidas

**Qué falta:**
- ❌ No indica qué NO debe hacer
- ❌ No dice a quién delegar

**Problema potencial:**
Backend-Agent podría:
- Crear tablas en base de datos
- Crear componentes UI
- Ejecutar migrations

**Recomendación:** 🔧 AGREGAR:
```markdown
## 🚨 TU ROL: BACKEND (Solo Capa de Lógica)

**LO QUE SÍ HACES:**
- ✅ Crear/modificar módulos NestJS
- ✅ Implementar entities, services, controllers, DTOs
- ✅ Configurar TypeORM, validaciones, guards
- ✅ Implementar lógica de negocio
- ✅ Mantener inventario backend

**LO QUE NO HACES (DEBES DELEGAR):**
- ❌ Crear tablas/schemas → Database-Agent
- ❌ Ejecutar migrations → Database-Agent
- ❌ Crear componentes UI → Frontend-Agent
- ❌ Modificar páginas React → Frontend-Agent

**LÍMITE CLARO:**
Tu trabajo está en `apps/backend/`. Todo lo que está en `apps/database/` o `apps/frontend/` NO es tu responsabilidad.

**SI NECESITAS TABLA NUEVA:**
Documentar necesidad y delegar a Database-Agent.
```

---

### 11. PROMPT-SUBAGENTES.md ✅ TIENE ALCANCE CLARO

**Estado:** ✅ DEFINE LÍMITES CLARAMENTE

**Fortalezas:**
- ✅ Define que trabajan bajo supervisión de agente principal
- ✅ Alcance limitado a tarea específica
- ✅ Reportan al agente principal

**Recomendación:** ✅ Ninguna, está adecuado para subagentes

---

## 📊 MATRIZ DE CUMPLIMIENTO

| Agente | Delegación Clara | Responsabilidades | Límites | Proceso Delegación | Score |
|--------|-----------------|-------------------|---------|-------------------|-------|
| Architecture-Analyst | ✅ | ✅ | ✅ | ✅ | 100% |
| Requirements-Analyst | ❌ | ✅ | ❌ | ❌ | 25% |
| Code-Reviewer | ⚠️ | ✅ | ❌ | ❌ | 50% |
| Feature-Developer | ❌ | ⚠️ | ❌ | ❌ | 25% |
| Policy-Auditor | ❌ | ✅ | ❌ | ❌ | 25% |
| Bug-Fixer | ⚠️ | ✅ | ❌ | ❌ | 50% |
| Database-Agent | ❌ | ✅ | ❌ | ❌ | 25% |
| Workspace-Manager | ⚠️ | ✅ | ❌ | ❌ | 50% |
| Frontend-Agent | ❌ | ✅ | ❌ | ❌ | 25% |
| Backend-Agent | ❌ | ✅ | ❌ | ❌ | 25% |
| Subagentes | ✅ | ✅ | ✅ | N/A | 100% |

**Promedio de cumplimiento:** 41%

---

## 🚨 IMPACTO CRÍTICO

### Riesgos Actuales

1. **Invasión de Responsabilidades**
   - Requirements-Analyst podría implementar código después de analizar
   - Code-Reviewer podría corregir bugs directamente
   - Database-Agent podría crear entities TypeORM

2. **Conflictos entre Agentes**
   - Dos agentes modificando mismo archivo
   - Pérdida de trazabilidad
   - Duplicación de esfuerzo

3. **Pérdida de Especialización**
   - Agentes haciendo tareas fuera de su expertise
   - Calidad inconsistente
   - Violación de principios SOLID

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### Prioridad P0 (Crítico - Inmediato)

1. **Actualizar agentes principales de implementación:**
   - [ ] PROMPT-DATABASE-AGENT.md
   - [ ] PROMPT-BACKEND-AGENT.md
   - [ ] PROMPT-FRONTEND-AGENT.md

   **Agregar a cada uno:**
   - Sección "TU ROL: [CAPA] (Solo [Especialidad])"
   - Lista de LO QUE SÍ HACE vs LO QUE NO HACE
   - Límites claros de archivos (apps/database, apps/backend, apps/frontend)
   - Proceso de delegación cuando necesitan algo de otra capa

### Prioridad P1 (Alta - Esta semana)

2. **Actualizar agentes de análisis:**
   - [ ] PROMPT-REQUIREMENTS-ANALYST.md
   - [ ] PROMPT-CODE-REVIEWER.md
   - [ ] PROMPT-POLICY-AUDITOR.md

   **Agregar:**
   - Clarificar que NO implementan, solo analizan/reportan
   - Proceso de delegación al agente apropiado

3. **Clarificar agentes coordinadores:**
   - [ ] PROMPT-FEATURE-DEVELOPER.md
   - [ ] PROMPT-BUG-FIXER.md

   **Definir:**
   - Feature-Developer: Coordinador que usa subagentes
   - Bug-Fixer: Implementador multi-capa (excepción)

### Prioridad P2 (Media - Próximas 2 semanas)

4. **Crear template estándar para prompts**
   - [ ] Crear TEMPLATE-PROMPT-AGENTE.md con secciones obligatorias:
     - Propósito
     - TU ROL: [Especialidad] + Delegación
     - LO QUE SÍ HACES
     - LO QUE NO HACES (DELEGAR A)
     - Límites claros
     - Proceso de delegación
     - Flujos de trabajo

5. **Documentar en POLITICAS-USO-AGENTES.md**
   - [x] Ya actualizada con principio de delegación ✅
   - [ ] Agregar ejemplos de delegación por tipo de agente

---

## ✅ CRITERIOS DE ACEPTACIÓN

Para considerar un prompt como "completo":

1. ✅ Tiene sección "TU ROL: [Especialidad]"
2. ✅ Lista explícita de "LO QUE SÍ HACE"
3. ✅ Lista explícita de "LO QUE NO HACE (DELEGAR A)"
4. ✅ Límites claros de archivos/carpetas donde puede trabajar
5. ✅ Proceso de delegación con ejemplos
6. ✅ Matriz de delegación a otros agentes

---

## 📚 REFERENCIAS

- [POLITICAS-USO-AGENTES.md](../../directivas/POLITICAS-USO-AGENTES.md) - Actualizada con principio de delegación
- [PROMPT-ARCHITECTURE-ANALYST.md](../PROMPT-ARCHITECTURE-ANALYST.md) - Ejemplo completo de prompt con delegación

---

**Estado:** ❌ CRÍTICO - 9 de 11 prompts requieren actualización
**Prioridad:** P0
**Próxima acción:** Actualizar prompts de agentes principales (Database, Backend, Frontend)

---

**Analista:** Architecture-Analyst
**Fecha:** 2025-11-23
**Próxima revisión:** Después de actualizar prompts según plan de acción
