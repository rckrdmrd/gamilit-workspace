# Plan de Corrección de Hallazgos Críticos

**Fecha:** 2026-01-10
**Fase:** 3 - Planeación
**Basado en:** Hallazgos Fase 2 (11 módulos analizados)

---

## RESUMEN EJECUTIVO

Total de hallazgos críticos identificados: **11 P0 + 15 P1**

Este plan prioriza correcciones por impacto y esfuerzo.

---

## HALLAZGOS P0 - CRÍTICOS (Acción Inmediata)

### H-001: Gap de Test Coverage Generalizado (-65%)

**Módulos afectados:** TODOS
**Meta:** 80% | **Real:** 26%

**Acciones:**
| Módulo | Servicios sin tests | Prioridad | Esfuerzo |
|--------|-------------------|-----------|----------|
| M04-Analytics | admin-alerts, admin-analytics, admin-monitoring, admin-progress | P0 | 20h |
| M07-Portal Admin | Frontend completo (0 tests) | P0 | 40h |
| M09-Extensiones | Frontend completo (0 tests) | P0 | 40h |

**Plan de mejora:**
1. Sprint 1: Crear tests para servicios críticos de M04 (20h)
2. Sprint 2: Setup testing framework frontend (10h)
3. Sprint 3-4: Tests para M07 y M09 (80h)

---

### H-002: ET-SYS-001 No Existe (M06)

**Ubicación:** `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/especificaciones/`
**Problema:** Referenciada en RF-SYS-001, RF-SYS-002, RF-SYS-003 pero no existe

**Acción:** CREAR especificación técnica

**Contenido requerido:**
1. Descripción del schema system_configuration
2. Documentación de 9 tablas (incluyendo 5 no documentadas)
3. Relationships y constraints
4. RLS policies
5. Triggers

**Esfuerzo:** 6 horas

---

### H-003: Funciones Fantasma SCHEMA-COMMUNICATION (M10)

**Ubicación:** `docs/90-transversal/arquitectura-database/SCHEMA-COMMUNICATION.md`
**Problema:** Funciones documentadas pero NO existen en código
- `get_unread_count()`
- `mark_conversation_read()`

**Acciones:**
1. Verificar si existen en DDL actual
2. Si NO existen: ELIMINAR de documentación
3. Si SÍ existen: Actualizar ubicación

**Esfuerzo:** 2 horas

---

### H-004: API-SOCIAL-MODULE Incompleto (M10)

**Ubicación:** `docs/90-transversal/api/API-SOCIAL-MODULE.md`
**Problemas:**
- Sin documentación de autenticación JWT
- Sin ejemplos JSON
- Declara 106 endpoints, documenta 100

**Acciones:**
1. Agregar sección de autenticación
2. Agregar 30+ ejemplos de request/response
3. Completar 6 endpoints faltantes

**Esfuerzo:** 8 horas

---

### H-005: Discrepancia Inventarios 133 vs 70 tablas (M11)

**Ubicación:**
- `orchestration/inventarios/MASTER_INVENTORY.yml`: 133 tablas
- `orchestration/inventarios/DATABASE_INVENTORY.yml`: 70 tablas

**Acciones:**
1. Auditar DDL real para conteo exacto
2. Reconciliar ambos inventarios
3. Establecer SSOT único

**Esfuerzo:** 4 horas

---

### H-006: Frontend Tests = 0 en M07, M09

**Problema:** Portal Admin y Extensiones sin tests frontend

**Acciones:**
1. Configurar Jest + React Testing Library
2. Crear tests para páginas críticas:
   - AdminDashboardPage
   - AdminUsersPage
   - Componentes de extensiones

**Esfuerzo:** 80 horas (priorizar 20% crítico = 16 horas)

---

## HALLAZGOS P1 - ALTOS

### H-007: Identidad Confusa EAI-005 (M05)

**Problema:** EAI-005 se llama "Administración" pero implementa "Portal de Maestros"

**Acciones:**
1. Agregar nota aclaratoria en README.md
2. Crear tabla de mapeo: Épica → Portal → Código
3. Considerar renombrar a "EAI-005: Portal de Maestros - Alcance Base"

**Esfuerzo:** 2 horas

---

### H-008: Discrepancia SP/Presupuesto (M05)

**Problema:**
- Documentado: 42 SP, $16,800 MXN
- Real: 47 SP, $18,800 MXN

**Acciones:**
1. Verificar con registros de facturación
2. Actualizar _MAP.md con valores correctos
3. Documentar razón de discrepancia

**Esfuerzo:** 1 hora

---

### H-009: US-AE-005/007 Duplicadas (M10/M09)

**Ver:** PLAN-PURGA-DUPLICIDADES.md

---

### H-010: 34+ Reportes Duplicados (M11)

**Problema:** Patrón de múltiples reportes por tarea
- ANALISIS-{tarea}-{fecha}.md
- PLAN-{tarea}-{fecha}.md
- VALIDACION-{tarea}-{fecha}.md

**Acciones:**
1. Identificar reportes idénticos
2. Consolidar en reporte único por tarea
3. Archivar históricos

**Esfuerzo:** 4 horas

---

### H-011: Story Points Faltantes EXT-003-006 (M09)

**Problema:** 40+ US sin SP documentados en extensiones

**Acciones:**
1. Auditar spreadsheet de costos original
2. Extraer SP para cada US
3. Actualizar archivos .md

**Esfuerzo:** 4 horas

---

## CRONOGRAMA DE CORRECCIONES

### Semana 1 (P0 Críticos)

| Día | Hallazgo | Acción | Esfuerzo |
|-----|----------|--------|----------|
| D1 | H-002 | Crear ET-SYS-001 | 6h |
| D2 | H-003 | Eliminar funciones fantasma | 2h |
| D2 | H-005 | Reconciliar inventarios | 4h |
| D3 | H-004 | Completar API-SOCIAL-MODULE | 8h |

### Semana 2 (P1 Altos)

| Día | Hallazgo | Acción | Esfuerzo |
|-----|----------|--------|----------|
| D1 | H-007 | Clarificar identidad EAI-005 | 2h |
| D1 | H-008 | Corregir SP/Presupuesto | 1h |
| D2 | H-010 | Consolidar reportes | 4h |
| D3 | H-011 | Completar SP extensiones | 4h |

### Semana 3-4 (Testing)

| Semana | Hallazgo | Acción | Esfuerzo |
|--------|----------|--------|----------|
| S3 | H-001 | Tests backend M04 | 20h |
| S4 | H-006 | Tests frontend críticos | 16h |

---

## MATRIZ DE TRAZABILIDAD

| ID | Hallazgo | Módulo | Plan | Ciclo | Estado |
|----|----------|--------|------|-------|--------|
| H-001 | Test coverage | TODOS | Este doc | S3-S4 | PENDIENTE |
| H-002 | ET-SYS-001 | M06 | Este doc | S1-D1 | PENDIENTE |
| H-003 | Funciones fantasma | M10 | Este doc | S1-D2 | PENDIENTE |
| H-004 | API incompleto | M10 | Este doc | S1-D3 | PENDIENTE |
| H-005 | Inventarios | M11 | Este doc | S1-D2 | PENDIENTE |
| H-006 | Frontend tests | M07/M09 | Este doc | S4 | PENDIENTE |
| H-007 | Identidad EAI-005 | M05 | Este doc | S2-D1 | PENDIENTE |
| H-008 | SP discrepancia | M05 | Este doc | S2-D1 | PENDIENTE |
| H-009 | Duplicidades | M10/M09 | Purga | S1 | PENDIENTE |
| H-010 | Reportes dup | M11 | Este doc | S2-D2 | PENDIENTE |
| H-011 | SP faltantes | M09 | Este doc | S2-D3 | PENDIENTE |

---

## CHECKLIST DE VALIDACIÓN

### Post-Corrección P0
- [ ] ET-SYS-001 creado y referenciado
- [ ] Funciones fantasma eliminadas de SCHEMA-COMMUNICATION
- [ ] API-SOCIAL-MODULE con auth y ejemplos
- [ ] Inventarios reconciliados (un solo valor de tablas)

### Post-Corrección P1
- [ ] EAI-005 clarificado
- [ ] SP corregidos en M05
- [ ] Reportes consolidados
- [ ] SP completados en EXT-003-006

### Testing
- [ ] Tests backend para servicios críticos M04
- [ ] Tests frontend para páginas críticas M07

---

**Autor:** Architecture Analyst
**Estado:** PENDIENTE EJECUCIÓN
