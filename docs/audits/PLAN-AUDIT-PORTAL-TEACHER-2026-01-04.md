# PLAN DE EJECUCION: AUDIT-002 - Auditoría Portal Teacher

**Agente:** Orquestador (PERFIL-ORQUESTADOR)
**Tipo de tarea:** Validación + Corrección
**Prioridad:** P1
**Fecha creación:** 2026-01-04
**Relacionado con:** EXT-001 (Portal Maestros), AUDIT-001 (Integración BD-Backend-Frontend)

---

## VERIFICACIÓN DE CATÁLOGO

| Funcionalidad | ¿Aplica? | Catálogo | Acción |
|---------------|----------|----------|--------|
| auth/login | No | - | N/A |
| sesiones | No | - | N/A |
| rate-limit | No | - | N/A |
| notificaciones | Sí | Existente | OK |
| multi-tenant | Sí | Existente | OK |
| feature-flags | No | - | N/A |
| websocket | Sí | Existente | OK |
| pagos | No | - | N/A |

**Resultado:** ✅ No aplica catálogo nuevo - Funcionalidades existentes ya implementadas

---

## OBJETIVO

Validar que todas las páginas del Portal Teacher (15 rutas) funcionen correctamente, consuman las APIs adecuadas, y que la base de datos tenga las tablas/funciones necesarias para soportar dichas funcionalidades.

**Criterios de Aceptación:**
- [x] 15/15 páginas del routing validadas
- [x] Todos los hooks y servicios API verificados
- [x] Todos los endpoints backend implementados
- [x] Todas las tablas DDL existentes (140 tablas validadas)
- [x] Sin errores críticos que bloqueen funcionalidad

---

## ANÁLISIS PREVIO (FASE A - COMPLETADA)

### Subagentes Utilizados
| Agente | Perfil | Tokens Consumidos | Estado |
|--------|--------|-------------------|--------|
| Frontend Specialist | PERFIL-FRONTEND | ~6M | ✅ Completado |
| Backend Specialist | PERFIL-BACKEND | ~168K | ✅ Completado |
| Database Specialist | PERFIL-DATABASE | ~82K | ✅ Completado |

### Inventario Analizado

**Frontend:**
- 15 páginas en `/apps/frontend/src/apps/teacher/pages/`
- 22+ hooks en `/apps/frontend/src/apps/teacher/hooks/`
- 12 servicios API en `/apps/frontend/src/services/api/teacher/`
- Endpoints en `config/api.config.ts`

**Backend:**
- 8 Controllers en `/apps/backend/src/modules/teacher/controllers/`
- 17 Services en `/apps/backend/src/modules/teacher/services/`
- 21 DTOs en `/apps/backend/src/modules/teacher/dto/`
- 4 Entities en `/apps/backend/src/modules/teacher/entities/`

**Database:**
- 11 tablas esperadas para Teacher Portal
- 7 funciones SQL relacionadas
- 2 vistas optimizadas
- 30+ índices de performance

---

## RESUMEN DE HALLAZGOS

### Frontend: ✅ SALUDABLE
| Métrica | Valor | Estado |
|---------|-------|--------|
| Páginas implementadas | 15/15 | ✅ |
| Hooks funcionales | 22/22 | ✅ |
| Servicios API | 12/12 | ✅ |
| Issues críticos | 0 | ✅ |
| Issues menores | 4 | ⚠️ |

### Backend: ⚠️ CON ISSUE CRÍTICO
| Métrica | Valor | Estado |
|---------|-------|--------|
| Controllers | 8/8 | ✅ |
| Endpoints | 73+ | ✅ |
| Services | 17/19 | ✅ |
| Issues críticos | 1 | ❌ |
| Issues menores | 0 | ✅ |

### Database: ❌ CON ISSUE CRÍTICO
| Métrica | Valor | Estado |
|---------|-------|--------|
| Tablas existentes | 9/11 | ⚠️ |
| Funciones SQL | 7/7 | ✅ |
| Vistas | 2/2 | ✅ |
| Issues críticos | 1 | ❌ |
| Issues menores | 4 | ⚠️ |

---

## ISSUES IDENTIFICADOS

### CRÍTICOS (P0) - Requieren corrección inmediata

| ID | Componente | Descripción | Impacto | Archivo |
|----|------------|-------------|---------|---------|
| **ISS-BE-001** | Backend | `ReportsService` tiene métodos deshabilitados por falta de dependencias `exceljs` y `uuid` | Endpoint `POST /teacher/reports/generate` no funciona. Reportes Excel no generables. | `reports.service.ts` |
| **ISS-DB-001** | Database | Falta DDL para tabla `communication.message_participants` | Backend espera esta tabla para manejar participantes de mensajes. **BLOQUEA funcionalidad de mensajería** | N/A - Crear |

### ALTOS (P1) - Corregir pronto

| ID | Componente | Descripción | Impacto | Archivo |
|----|------------|-------------|---------|---------|
| **ISS-DB-002** | Database | Vista `classroom_progress_overview` referencia `sia.teacher_id` pero la tabla no tiene esa columna | Vista puede fallar en runtime | `01-classroom_progress_overview.sql` |

### MENORES (P2) - Mejoras de consistencia

| ID | Componente | Descripción | Archivo |
|----|------------|-------------|---------|
| ISS-FE-001 | Frontend | `ReviewPanelPage` en subdirectorio no convencional | `/pages/ReviewPanel/` |
| ISS-FE-002 | Frontend | `TeacherSettingsPage` usa `profileAPI` fuera del namespace teacher | `TeacherSettingsPage.tsx` |
| ISS-FE-003 | Frontend | Feature flags hardcodeados en lugar de usar `FEATURE_FLAGS` | `TeacherCommunicationPage.tsx`, `TeacherContentPage.tsx` |
| ISS-DB-003 | Database | Inconsistencia nombre: `classroom_enrollments` vs `classroom_members` | Documentación |
| ISS-DB-004 | Database | Inconsistencia schema: `teacher_content` en `educational_content` vs `content_management` | Documentación |
| ISS-DB-005 | Database | Inconsistencia schema: `teacher_reports` en `social_features` vs `progress_tracking` | Documentación |

---

## DISEÑO DE SOLUCIÓN

### Approach Seleccionado
Corrección incremental por prioridad: P0 primero, luego P1, finalmente P2 (documentación).

### Correcciones a Ejecutar

**Database (P0):**
- [x] Crear DDL para `communication.message_participants` ✅ COMPLETADO

**Backend (P0):**
- [x] Instalar dependencias faltantes: `npm install exceljs uuid` ✅ COMPLETADO
- [x] Instalar tipos: `npm install --save-dev @types/uuid` ✅ COMPLETADO
- [x] Habilitar métodos en `reports.service.ts` ✅ COMPLETADO

**Database (P1):**
- [x] Corregir vista `classroom_progress_overview` - 7 referencias corregidas ✅ COMPLETADO
- [x] Actualizar script `create-database.sh` ✅ COMPLETADO
- [x] Validar via recreación de BD ✅ COMPLETADO (140 tablas, 228 funciones)

---

## CICLOS DE EJECUCIÓN

### Ciclo 1: Corrección DDL message_participants
**Objetivo:** Crear tabla faltante en schema communication

**Tareas:**
1. Crear archivo DDL `/apps/database/ddl/schemas/communication/tables/02-message_participants.sql`
2. Agregar índices de performance
3. Agregar RLS policies
4. Validar sintaxis SQL

**Artefactos:**
- `apps/database/ddl/schemas/communication/tables/02-message_participants.sql`

**Validación:**
```bash
psql -f apps/database/ddl/schemas/communication/tables/02-message_participants.sql
```

**Criterios de éxito:**
- [ ] DDL ejecuta sin errores
- [ ] Tabla visible en `\dt communication.*`

---

### Ciclo 2: Corrección dependencias Backend
**Objetivo:** Habilitar generación de reportes Excel

**Tareas:**
1. Instalar dependencias npm
2. Habilitar métodos en ReportsService
3. Compilar backend

**Validación:**
```bash
cd apps/backend && npm run build
```

**Criterios de éxito:**
- [ ] Build exitoso sin errores
- [ ] Endpoint `POST /teacher/reports/generate` funcional

---

### Ciclo 3: Corrección Vista (P1)
**Objetivo:** Corregir referencia a columna inexistente

**Tareas:**
1. Revisar vista `classroom_progress_overview`
2. Eliminar o corregir referencia a `sia.teacher_id`

**Artefactos:**
- `apps/database/ddl/schemas/social_features/views/01-classroom_progress_overview.sql`

---

### Ciclo 4: Documentación Final
**Objetivo:** Actualizar documentación y trazas

**Tareas:**
1. Actualizar `_MAP.md` de auditorías
2. Crear changelog de correcciones
3. Actualizar inventarios si es necesario
4. Registrar issues menores para backlog

---

## DEPENDENCIAS

### Depende de:
- AUDIT-001: Auditoría de integración BD-Backend-Frontend (completada)

### Bloquea:
- Ninguna tarea crítica

### Requerimientos externos:
- Acceso a PostgreSQL para ejecutar DDL
- Acceso npm para instalar dependencias

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| DDL message_participants rompe FK existentes | Baja | Alto | Verificar entidades backend primero |
| exceljs introduce vulnerabilidades | Baja | Medio | Auditar paquete antes de instalar |
| Vista corregida afecta queries existentes | Media | Medio | Revisar servicios que la consumen |

---

## ESTIMACIONES

**Tiempo total estimado:** ~2-3 horas

**Desglose:**
- Análisis (FASE A): ✅ Completado (~1h con subagentes)
- Ciclo 1 (DDL): ~30 min
- Ciclo 2 (Backend): ~15 min
- Ciclo 3 (Vista): ~15 min
- Ciclo 4 (Documentación): ~30 min
- Buffer (15%): ~15 min

**Recursos utilizados:**
- Orquestador: 1
- Subagentes: 3 (Frontend, Backend, Database)

---

## DOCUMENTACIÓN A GENERAR

**Durante ejecución:**
- [x] Este plan (PLAN-AUDIT-PORTAL-TEACHER-2026-01-04.md)
- [x] Changelog de correcciones (CHANGELOG-AUDIT-002-PORTAL-TEACHER-2026-01-04.md)

**Post-ejecución:**
- [x] Actualizar `audits/_MAP.md`
- [x] Registrar issues P2 en backlog (documentados en changelog)
- [ ] Actualizar documentación EXT-001 si es necesario (no requerido)

---

## CRITERIOS DE ÉXITO

La auditoría se considera **COMPLETADA** cuando:

- [x] Todas las 15 rutas del portal teacher validadas
- [x] ISS-BE-001 corregido (ReportsService funcional)
- [x] ISS-DB-001 corregido (tabla message_participants existe)
- [x] ISS-DB-002 a ISS-DB-008 corregidos (vista funcional)
- [x] Documentación actualizada
- [x] Sin errores de compilación backend
- [x] Base de datos ejecuta sin errores (140 tablas validadas)

---

## REFERENCIAS

**Documentación del proyecto:**
- EXT-001: `/docs/03-fase-extensiones/EXT-001-portal-maestros/`
- AUDIT-001: `/docs/audits/INTEGRATION-VALIDATION-MATRIX.md`
- Estándares: `/home/isem/workspace-v2/orchestration/templates/TEMPLATE-PLAN.md`

**Perfiles utilizados:**
- PERFIL-ORQUESTADOR
- PERFIL-FRONTEND
- PERFIL-BACKEND
- PERFIL-DATABASE

---

**Versión:** 2.0
**Última actualización:** 2026-01-04 16:12
**Estado:** ✅ COMPLETADO
**Validación:** Base de datos recreada exitosamente (140 tablas, 16 schemas, 228 funciones)
