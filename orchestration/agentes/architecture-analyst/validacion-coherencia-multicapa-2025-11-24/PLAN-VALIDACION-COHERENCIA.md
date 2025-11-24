# PLAN: Validación de Coherencia Multicapa - Post CORR-001 a CORR-006

**Fecha:** 2025-11-24
**Orquestador:** Architecture-Analyst
**Objetivo:** Validar coherencia completa entre Database, Backend, Frontend y Documentación
**Alcance:** Correcciones P0 (CORR-001 a CORR-006) y alineación general del proyecto

---

## 🎯 OBJETIVO GENERAL

Validar que **NO existan conflictos, incoherencias o desalineaciones** entre:

1. **Database** (DDL/seeds) ↔ Scripts de creación/recreación
2. **Backend** (entities, DTOs, services) ↔ Database (schemas, tablas, columnas)
3. **Frontend** (types, APIs) ↔ Backend (endpoints, DTOs)
4. **Documentación** ↔ Implementación real (Database, Backend, Frontend)
5. **Entre proyectos** (coherencia de nomenclatura, tipos, flujos)

---

## 📋 AGENTES A ORQUESTAR

### 1. Database-Agent (FASE 1 - Independiente)

**Prompt:** `orchestration/prompts/PROMPT-DATABASE-AGENT.md`

**Tarea:**
- Validar que CORR-005 y CORR-006 estén correctamente integrados en scripts de creación/recreación
- Validar que DDL y seeds sean referenciados correctamente en `create-database.sh`
- Validar orden de ejecución respeta dependencias
- Validar sintaxis de SQL
- Validar cumplimiento de política de carga limpia

**Output esperado:** Reporte de validación con checklist de coherencia database

---

### 2. Backend-Agent (FASE 2 - Depende de Database)

**Prompt:** `orchestration/prompts/PROMPT-BACKEND-AGENT.md`

**Tarea:**
- Validar que entities TypeORM coincidan con tablas de BD
- Validar que DTOs coincidan con columnas de BD
- Validar que enums de backend coincidan con enums de BD
- Validar que servicios usen correctamente los FKs (profile.id vs profile.user_id)
- Validar que queries de CORR-001 y CORR-002 sean coherentes con estructura de BD
- Validar que repository injections sean correctas

**Output esperado:** Reporte de alineación backend-database con matriz de coherencia

---

### 3. Frontend-Agent (FASE 2 - Depende de Backend)

**Prompt:** `orchestration/prompts/PROMPT-FRONTEND-AGENT.md`

**Tarea:**
- Validar que types de frontend coincidan con DTOs de backend
- Validar que API endpoints llamados existan en backend
- Validar que transformaciones (snake_case → camelCase) sean consistentes
- Validar que campos usados en portales existan en responses de backend
- Validar que CORR-003 y CORR-004 sean coherentes con estructura de backend

**Output esperado:** Reporte de alineación frontend-backend con matriz de coherencia

---

### 4. Architecture-Analyst (FASE 3 - Depende de todos)

**Prompt:** `orchestration/prompts/PROMPT-ARCHITECTURE-ANALYST.md`

**Tarea:**
- Consolidar reportes de Database-Agent, Backend-Agent, Frontend-Agent
- Validar coherencia entre los 3 proyectos
- Validar que documentación refleje implementación real
- Validar que no haya conflictos de nomenclatura
- Validar que flujos de datos sean coherentes end-to-end
- Identificar gaps o incoherencias

**Output esperado:** Reporte consolidado de coherencia global con recomendaciones

---

## 🔄 FLUJO DE ORQUESTACIÓN

```
FASE 1 (Paralelo - No dependencias):
  ├─> Database-Agent (validación interna)

FASE 2 (Paralelo - Dependen de FASE 1):
  ├─> Backend-Agent (valida vs Database)
  └─> Frontend-Agent (valida vs Backend - puede iniciar después)

FASE 3 (Secuencial - Depende de FASE 2):
  └─> Architecture-Analyst (consolida todo)
```

---

## 📊 CRITERIOS DE VALIDACIÓN

### Database (Database-Agent)

**Checklist:**
- [ ] CORR-005 (vista) está en `ddl/schemas/admin_dashboard/views/01-recent_activity.sql`
- [ ] CORR-006 (seed) está en `seeds/prod/educational_content/05-assignments.sql`
- [ ] Vista es invocada en `create-database.sh` FASE 13
- [ ] Seed es invocado en `create-database.sh` FASE 16
- [ ] Orden de ejecución respeta dependencias (FASE 11 < FASE 13 < FASE 16)
- [ ] NO existen migrations/ o fix-*.sql
- [ ] Sintaxis SQL es correcta
- [ ] DDL tiene comentarios de documentación

**Validaciones adicionales:**
- [ ] Todas las tablas referenciadas en vistas existen
- [ ] Todos los FKs referenciados en DDL existen
- [ ] Todos los schemas son creados antes de sus objetos
- [ ] Seeds no referencian objetos inexistentes

---

### Backend (Backend-Agent)

**Checklist:**
- [ ] Entity `Profile` tiene campo `id` (PK) y `user_id` (FK)
- [ ] Entity `ExerciseSubmission` referencia `profiles.id` en FK
- [ ] Entity `UserStats` existe y es inyectable
- [ ] DTOs coinciden con columnas de tablas
- [ ] Enums de backend coinciden con enums de BD
- [ ] CORR-001: Queries usan `profile.id` (no `profile.user_id`)
- [ ] CORR-002: Service inyecta `UserStats` repository

**Validaciones adicionales:**
- [ ] Todos los @InjectRepository referencian entities existentes
- [ ] Todos los DTOs tienen validadores coherentes con constraints de BD
- [ ] Todas las relaciones TypeORM coinciden con FKs de BD
- [ ] Nombres de columnas en queries coinciden con DDL

---

### Frontend (Frontend-Agent)

**Checklist:**
- [ ] Types de frontend tienen campos que backend retorna
- [ ] Transformación `last_sign_in_at` → `lastLogin` es consistente
- [ ] Endpoints llamados existen en backend
- [ ] CORR-003: `transformUser()` mapea todos los campos necesarios
- [ ] CORR-004: APIs conectadas (`/actions/recent`, `/alerts`, `/analytics/user-activity`)

**Validaciones adicionales:**
- [ ] Todos los campos usados en portales están en types
- [ ] Todas las llamadas a `apiClient.get()` tienen endpoints válidos
- [ ] Transformaciones snake_case → camelCase son completas
- [ ] No hay referencias a campos inexistentes en backend

---

### Coherencia Global (Architecture-Analyst)

**Checklist:**
- [ ] Nomenclatura consistente entre capas (ej: `user_id` en BD, `userId` en FE)
- [ ] Flujo de datos es coherente end-to-end
- [ ] Documentación refleja implementación real
- [ ] No hay contradicciones entre reportes de agentes
- [ ] Correcciones P0 son coherentes entre las 3 capas

**Validaciones adicionales:**
- [ ] ADRs documentan decisiones arquitectónicas correctamente
- [ ] Diagramas de flujo reflejan implementación real
- [ ] TRACEABILITY.yml está actualizado
- [ ] No hay "TODO" o "FIXME" en código crítico

---

## 📄 REPORTES A GENERAR

### 1. Database-Agent

**Archivo:** `orchestration/agentes/database/validacion-coherencia-2025-11-24/REPORTE-VALIDACION-DATABASE.md`

**Secciones:**
- Validación de CORR-005 y CORR-006
- Validación de scripts de creación/recreación
- Validación de orden de ejecución
- Validación de sintaxis SQL
- Validación de política de carga limpia
- Checklist de coherencia interna
- Issues encontrados (si los hay)

---

### 2. Backend-Agent

**Archivo:** `orchestration/agentes/backend/validacion-coherencia-2025-11-24/REPORTE-VALIDACION-BACKEND.md`

**Secciones:**
- Validación de entities vs tablas de BD
- Validación de DTOs vs columnas de BD
- Validación de enums vs enums de BD
- Validación de CORR-001 y CORR-002
- Validación de repository injections
- Matriz de coherencia backend-database
- Issues encontrados (si los hay)

---

### 3. Frontend-Agent

**Archivo:** `orchestration/agentes/frontend/validacion-coherencia-2025-11-24/REPORTE-VALIDACION-FRONTEND.md`

**Secciones:**
- Validación de types vs DTOs de backend
- Validación de API endpoints
- Validación de transformaciones
- Validación de CORR-003 y CORR-004
- Matriz de coherencia frontend-backend
- Issues encontrados (si los hay)

---

### 4. Architecture-Analyst (Consolidado)

**Archivo:** `orchestration/reportes/REPORTE-CONSOLIDADO-COHERENCIA-MULTICAPA-2025-11-24.md`

**Secciones:**
- Resumen ejecutivo
- Consolidación de reportes de agentes
- Matriz de coherencia global (Database ↔ Backend ↔ Frontend)
- Validación de coherencia con documentación
- Issues consolidados
- Recomendaciones
- Conclusión final

---

## 🚀 EJECUCIÓN

### Comando de Orquestación

```bash
# FASE 1: Database-Agent (independiente)
Task(
  subagent_type: "general-purpose",
  description: "Validar coherencia database",
  prompt: "Eres Database-Agent. Valida que CORR-005 y CORR-006..."
)

# FASE 2: Backend-Agent + Frontend-Agent (en paralelo)
Task(
  subagent_type: "general-purpose",
  description: "Validar alineación backend-database",
  prompt: "Eres Backend-Agent. Valida que entities, DTOs..."
)
Task(
  subagent_type: "general-purpose",
  description: "Validar alineación frontend-backend",
  prompt: "Eres Frontend-Agent. Valida que types, APIs..."
)

# FASE 3: Architecture-Analyst (consolida)
# (Ejecutado manualmente después de recibir reportes)
```

---

## 📊 CRITERIOS DE ÉXITO

### Para cada agente:

- ✅ Reporte generado con todas las secciones
- ✅ Checklist completado con PASS/FAIL por item
- ✅ Issues identificados con severidad (P0, P1, P2)
- ✅ Recomendaciones si hay issues

### Para consolidación:

- ✅ Coherencia 100% entre Database ↔ Backend ↔ Frontend
- ✅ 0 issues P0 encontrados
- ✅ Issues P1/P2 documentados con plan de acción
- ✅ Documentación alineada con implementación

---

## 🎯 RESULTADO ESPERADO

**Estado ideal:**
```
✅ Database: 100% coherente (DDL ↔ scripts)
✅ Backend: 100% alineado con Database
✅ Frontend: 100% alineado con Backend
✅ Documentación: 100% actualizada
✅ Entre proyectos: 0 conflictos
```

**Si hay issues:**
```
⚠️ Issues P0: [lista] → Requieren corrección inmediata
⚠️ Issues P1: [lista] → Requieren corrección antes de deployment
⚠️ Issues P2: [lista] → Backlog para siguiente iteración
```

---

**Plan preparado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Estado:** ✅ LISTO PARA EJECUCIÓN
