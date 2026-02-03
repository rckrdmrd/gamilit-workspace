# PLAN DE EJECUCION - TASK-2026-01-31

**Fecha:** 2026-01-31
**Sistema:** SIMCO v4.3.0 + NEXUS v4.0
**Metodologia:** CAPVED en todos los niveles

---

## ESTRUCTURA DE EJECUCION

```
NIVEL 0: Tarea Principal
└── NIVEL 1: Fases (6)
    └── NIVEL 2: Subtareas (23)
        └── NIVEL 3: Acciones atomicas (52)
```

---

## FASE 1: SINCRONIZACION Y NORMALIZACION (Prioridad: P0)

**Duracion estimada:** 30 minutos
**Dependencias:** Ninguna
**Bloqueante para:** Todas las demas fases

### 1.1 Normalizar Line Endings Git

**CAPVED:**
- **C**ontexto: 191 archivos con CRLF→LF pendientes
- **A**nalisis: Solo normalizacion, sin cambios de contenido
- **P**lanificacion: Commit unico
- **V**alidacion: git status clean
- **E**jecucion: Ver acciones
- **D**ocumentacion: Commit message descriptivo

**Acciones:**
```bash
# 1.1.1 Verificar estado actual
wsl -d Ubuntu-24.04 -u developer -- bash -c "cd /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit && git status --short | wc -l"

# 1.1.2 Hacer commit de normalizacion
wsl -d Ubuntu-24.04 -u developer -- bash -c "cd /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit && git add -A && git commit -m '[GAMILIT] chore: Normalize line endings CRLF to LF'"

# 1.1.3 Push a remoto
wsl -d Ubuntu-24.04 -u developer -- bash -c "cd /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit && git push origin main"

# 1.1.4 Verificar estado limpio
wsl -d Ubuntu-24.04 -u developer -- bash -c "cd /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit && git status"
```

**Criterio de exito:** `git status` retorna "nothing to commit, working tree clean"

---

## FASE 2: CREAR DEFINICIONES FALTANTES (Prioridad: P0)

**Duracion estimada:** 2 horas
**Dependencias:** Fase 1
**Bloqueante para:** Documentacion

### 2.1 Crear ET-SYS-001 (Configuracion del Sistema)

**CAPVED:**
- **C**ontexto: Referenciada en M06-CONFIG-SISTEMA pero no existe
- **A**nalisis: Revisar EAI-006 para entender alcance
- **P**lanificacion: Crear especificacion tecnica completa
- **V**alidacion: Validar contra requerimientos existentes
- **E**jecucion: Escribir documento
- **D**ocumentacion: Registrar en TRACEABILITY

**Acciones:**
```
2.1.1 Leer docs/01-fase-alcance-inicial/EAI-006-config-sistema/
2.1.2 Identificar campos y funcionalidades del sistema de configuracion
2.1.3 Crear docs/01-fase-alcance-inicial/EAI-006-config-sistema/especificaciones/ET-SYS-001.md
2.1.4 Validar coherencia con backend (apps/backend/src/modules/system-config/)
2.1.5 Actualizar TRACEABILITY-MASTER.yml
```

**Criterio de exito:** ET-SYS-001.md existe y tiene >50 lineas de especificacion

### 2.2 Crear Indice RLS-POLICIES-MASTER.md

**CAPVED:**
- **C**ontexto: 70+ RLS policies en DDL sin indice maestro
- **A**nalisis: Auditar apps/database/ddl/schemas/*/rls/
- **P**lanificacion: Crear indice con todas las policies
- **E**jecucion: Generar documento
- **D**ocumentacion: Agregar a inventarios

**Acciones:**
```
2.2.1 Listar todos los archivos de RLS: find apps/database/ddl -name "*rls*"
2.2.2 Extraer nombres de policies de cada archivo
2.2.3 Crear docs/90-transversal/arquitectura-database/RLS-POLICIES-MASTER.md
2.2.4 Actualizar DATABASE_INVENTORY.yml con referencia
```

**Criterio de exito:** RLS-POLICIES-MASTER.md lista todas las 70+ policies

### 2.3 Agregar Story Points a EPICs EXT-003 a EXT-006

**CAPVED:**
- **C**ontexto: 11 EPICs sin Story Points asignados
- **A**nalisis: Revisar scope de cada EPIC
- **P**lanificacion: Estimar basado en complejidad
- **E**jecucion: Actualizar archivos
- **D**ocumentacion: Registrar estimaciones

**Acciones:**
```
2.3.1 Leer docs/03-fase-extensiones/EXT-003-notificaciones/
2.3.2 Leer docs/03-fase-extensiones/EXT-004-perfiles/
2.3.3 Leer docs/03-fase-extensiones/EXT-005-reportes/
2.3.4 Leer docs/03-fase-extensiones/EXT-006-contenido/
2.3.5 Agregar story_points: XX a cada EPIC.yml
2.3.6 Actualizar totales en ROADMAP.yml
```

**Criterio de exito:** Todas las EPICs tienen story_points definido

---

## FASE 3: PURGA DE DOCUMENTACION (Prioridad: P1)

**Duracion estimada:** 1 hora
**Dependencias:** Fase 1
**Ejecutable en paralelo con:** Fase 2

### 3.1 Purgar _archive/ Completo

**CAPVED:**
- **C**ontexto: 38 carpetas archivadas el 2026-01-24, sin referencias activas
- **A**nalisis: Verificar que no hay referencias
- **P**lanificacion: Eliminar completamente
- **V**alidacion: grep -r "_archive" devuelve 0
- **E**jecucion: rm -rf
- **D**ocumentacion: Registrar en changelog

**Acciones:**
```bash
# 3.1.1 Verificar no hay referencias
grep -r "_archive" orchestration/ docs/ --include="*.md" --include="*.yml" | grep -v "_archive/" | wc -l

# 3.1.2 Crear backup (opcional)
# tar -czf _archive-backup-2026-01-31.tar.gz orchestration/_archive/

# 3.1.3 Eliminar
rm -rf orchestration/_archive/

# 3.1.4 Verificar eliminacion
ls orchestration/ | grep archive
```

**Criterio de exito:** Carpeta _archive/ no existe

### 3.2 Purgar docs/99-finiquito/archivados/

**CAPVED:**
- **C**ontexto: 45 archivos duplicados de finiquito
- **A**nalisis: Todos tienen version actualizada en finiquito/
- **P**lanificacion: Eliminar subcarpeta completa
- **E**jecucion: rm -rf
- **D**ocumentacion: Actualizar _MAP.md

**Acciones:**
```bash
# 3.2.1 Eliminar
rm -rf docs/99-finiquito/archivados/

# 3.2.2 Actualizar _MAP.md
# Remover referencia a archivados/ si existe
```

**Criterio de exito:** Carpeta archivados/ no existe

### 3.3 Consolidar Auditorias 2026-01-04

**CAPVED:**
- **C**ontexto: 6 archivos de misma auditoria dispersos
- **A**nalisis: Todos describen la misma auditoria de portal admin
- **P**lanificacion: Crear documento consolidado
- **E**jecucion: Merge manual + eliminar originales
- **D**ocumentacion: Actualizar _INDEX

**Acciones:**
```
3.3.1 Leer docs/98-audits/PLAN-AUDIT-PORTAL-ADMIN-2026-01-04.md
3.3.2 Leer docs/98-audits/REPORTE-COMPLETITUD-PORTAL-ADMIN-2026-01-04.md
3.3.3 Crear docs/98-audits/AUDITORIA-CONSOLIDADA-ADMIN-2026-01-04.md
3.3.4 Eliminar archivos originales
3.3.5 Actualizar _INDEX.yml
```

**Criterio de exito:** 1 archivo consolidado en lugar de 6

---

## FASE 4: VALIDACION STUDENT PORTAL (Prioridad: P1)

**Duracion estimada:** 1 hora
**Dependencias:** Fase 1
**Ejecutable en paralelo con:** Fases 2, 3

### 4.1 Verificar Builds

**CAPVED:**
- **C**ontexto: Confirmar que builds pasan
- **A**nalisis: Ejecutar npm run build en frontend y backend
- **P**lanificacion: Builds secuenciales
- **E**jecucion: npm commands
- **D**ocumentacion: Registrar resultado

**Acciones:**
```bash
# 4.1.1 Build Frontend
cd C:/Empresas/ISEM/workspace-v2/projects/gamilit/apps/frontend
npm run build

# 4.1.2 Build Backend
cd C:/Empresas/ISEM/workspace-v2/projects/gamilit/apps/backend
npm run build

# 4.1.3 Lint check
npm run lint
```

**Criterio de exito:** Ambos builds PASS sin errores

### 4.2 Verificar Rutas Student Portal

**CAPVED:**
- **C**ontexto: 18 rutas protegidas configuradas
- **A**nalisis: Verificar que todas las rutas estan definidas en router
- **P**lanificacion: Auditar App.tsx y router config
- **E**jecucion: Grep de rutas
- **D**ocumentacion: Actualizar FRONTEND_INVENTORY

**Acciones:**
```
4.2.1 Leer apps/frontend/src/App.tsx
4.2.2 Verificar rutas: /dashboard, /progress, /achievements, etc.
4.2.3 Confirmar lazy loading configurado
4.2.4 Verificar ProtectedRoute wrapper
```

**Criterio de exito:** 18 rutas confirmadas en router

### 4.3 Verificar Endpoints Backend Usados

**CAPVED:**
- **C**ontexto: Student Portal consume endpoints de backend
- **A**nalisis: Verificar que endpoints existen en backend
- **P**lanificacion: Comparar frontend API calls vs backend routes
- **E**jecucion: Cross-reference
- **D**ocumentacion: Actualizar coherencia matrix

**Acciones:**
```
4.3.1 Extraer endpoints de apps/frontend/src/services/api/
4.3.2 Verificar existencia en apps/backend/src/modules/
4.3.3 Documentar gaps si existen
```

**Criterio de exito:** 100% de endpoints frontend tienen backend correspondiente

---

## FASE 5: VALIDACION NUEVO DESARROLLO (Prioridad: P1)

**Duracion estimada:** 1 hora
**Dependencias:** Fase 4
**Ejecutable despues de:** Builds exitosos

### 5.1 Verificar Teacher Portal Renaming (ADR-029)

**CAPVED:**
- **C**ontexto: 6 paginas renombradas, TeacherResourcesPage consolidada
- **A**nalisis: Verificar que rutas funcionan
- **P**lanificacion: Revisar imports y lazy loading
- **E**jecucion: Code review
- **D**ocumentacion: Confirmar ADR-029 implementado

**Acciones:**
```
5.1.1 Verificar apps/frontend/src/apps/teacher/pages/ estructura
5.1.2 Confirmar TeacherResourcesPage no existe (consolidada)
5.1.3 Verificar lazy loading de paginas renombradas
5.1.4 Confirmar rutas en router
```

**Criterio de exito:** ADR-029 completamente implementado

### 5.2 Verificar WebSocket Unificacion

**CAPVED:**
- **C**ontexto: FIX-BE-016 unifica WebSocket handlers
- **A**nalisis: Verificar que no hay multiples handlers
- **P**lanificacion: Revisar websocket.gateway.ts
- **E**jecucion: Code review
- **D**ocumentacion: Confirmar fix aplicado

**Acciones:**
```
5.2.1 Leer apps/backend/src/websocket/websocket.gateway.ts
5.2.2 Verificar handleUpgrade no se llama multiples veces
5.2.3 Confirmar Socket.IO adapter configurado correctamente
```

**Criterio de exito:** Solo 1 handler de WebSocket activo

### 5.3 Verificar APIs Nuevas

**CAPVED:**
- **C**ontexto: progressAPI, contentAPI, ltiAPI creadas
- **A**nalisis: Verificar que endpoints funcionan
- **P**lanificacion: Revisar archivos de API
- **E**jecucion: Validar estructura
- **D**ocumentacion: Actualizar API coverage

**Acciones:**
```
5.3.1 Leer apps/frontend/src/services/api/progressAPI.ts
5.3.2 Leer apps/frontend/src/services/api/contentAPI.ts
5.3.3 Leer apps/frontend/src/services/api/ltiAPI.ts
5.3.4 Verificar 20+17+16 = 53 endpoints definidos
```

**Criterio de exito:** 53 endpoints nuevos confirmados

---

## FASE 6: ACTUALIZACION DE TRAZAS E INVENTARIOS (Prioridad: P2)

**Duracion estimada:** 30 minutos
**Dependencias:** Fases 2, 3, 4, 5
**Ultima fase**

### 6.1 Actualizar Trazas Desactualizadas

**CAPVED:**
- **C**ontexto: 5 trazas desactualizadas identificadas
- **A**nalisis: Comparar con estado actual
- **P**lanificacion: Actualizar cada traza
- **E**jecucion: Edicion de archivos
- **D**ocumentacion: Commit con cambios

**Acciones:**
```
6.1.1 Actualizar orchestration/trazas/TRAZA-TAREAS-BACKEND.md
6.1.2 Actualizar orchestration/trazas/TRAZA-TAREAS-FRONTEND.md
6.1.3 Actualizar orchestration/trazas/TRAZA-REQUERIMIENTOS.md
6.1.4 Actualizar orchestration/trazas/TRAZA-BUGS.md
```

**Criterio de exito:** Todas las trazas con fecha 2026-01-31

### 6.2 Actualizar _INDEX.yml de Tareas

**CAPVED:**
- **C**ontexto: Nueva tarea TASK-2026-01-31 creada
- **A**nalisis: Agregar a indice
- **P**lanificacion: Editar _INDEX.yml
- **E**jecucion: YAML update
- **D**ocumentacion: Incrementar contador

**Acciones:**
```
6.2.1 Agregar entrada en orchestration/tareas/_INDEX.yml
6.2.2 Incrementar total_tareas de 44 a 45
6.2.3 Agregar carpeta 2026-01-31 a estructura
```

**Criterio de exito:** _INDEX.yml incluye TASK-2026-01-31

### 6.3 Commit Final

**CAPVED:**
- **C**ontexto: Todos los cambios de la sesion
- **A**nalisis: Verificar cambios con git diff
- **P**lanificacion: Commit atomico
- **E**jecucion: git add, commit, push
- **D**ocumentacion: Mensaje descriptivo

**Acciones:**
```bash
# 6.3.1 Verificar cambios
git status

# 6.3.2 Agregar cambios
git add .

# 6.3.3 Commit
git commit -m "[GAMILIT] docs: Complete analysis and planning task TASK-2026-01-31

- Add TASK-2026-01-31-ANALISIS-PLANIFICACION documentation
- Create HALLAZGOS-CONSOLIDADOS.md with audit results
- Create PLAN-EJECUCION.md with 6 phases, 23 subtasks
- Identify 5 missing definitions to create
- Document purge plan for obsolete documentation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 6.3.4 Push
git push origin main
```

**Criterio de exito:** Push exitoso, working tree clean

---

## RESUMEN DE EJECUCION

| Fase | Subtareas | Acciones | Tiempo | Prioridad | Dependencias |
|------|-----------|----------|--------|-----------|--------------|
| 1. Sincronizacion Git | 1 | 4 | 30m | P0 | Ninguna |
| 2. Definiciones Faltantes | 3 | 16 | 2h | P0 | Fase 1 |
| 3. Purga Documentacion | 3 | 10 | 1h | P1 | Fase 1 |
| 4. Validacion Student | 3 | 10 | 1h | P1 | Fase 1 |
| 5. Validacion Nuevo Dev | 3 | 8 | 1h | P1 | Fase 4 |
| 6. Trazas e Inventarios | 3 | 4 | 30m | P2 | Fases 2-5 |
| **TOTAL** | **16** | **52** | **6h** | - | - |

---

## DIAGRAMA DE DEPENDENCIAS

```
        ┌─────────────────────────────────────────┐
        │     FASE 1: SINCRONIZACION GIT          │
        │         (P0 - 30 min)                   │
        └─────────────────┬───────────────────────┘
                          │
        ┌─────────────────┼───────────────────────┐
        │                 │                       │
        ▼                 ▼                       ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│    FASE 2     │ │    FASE 3     │ │    FASE 4     │
│ Definiciones  │ │    Purga      │ │  Student      │
│  (P0 - 2h)    │ │  (P1 - 1h)    │ │  (P1 - 1h)    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        │                 │                 ▼
        │                 │         ┌───────────────┐
        │                 │         │    FASE 5     │
        │                 │         │  Nuevo Dev    │
        │                 │         │  (P1 - 1h)    │
        │                 │         └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                ┌───────────────────┐
                │      FASE 6       │
                │ Trazas/Inventarios│
                │   (P2 - 30min)    │
                └───────────────────┘
```

---

## EJECUCION PARALELA RECOMENDADA

### Bloque 1 (Secuencial - Obligatorio)
- Fase 1: Sincronizacion Git

### Bloque 2 (Paralelo - 3 agentes)
- Agente 1: Fase 2 (Definiciones)
- Agente 2: Fase 3 (Purga)
- Agente 3: Fase 4 (Student Portal)

### Bloque 3 (Secuencial)
- Fase 5: Validacion Nuevo Desarrollo (requiere Fase 4)

### Bloque 4 (Secuencial - Final)
- Fase 6: Actualizacion Trazas e Inventarios

---

*Sistema SIMCO v4.3.0 - GAMILIT*
*Ciclo CAPVED aplicado en todos los niveles*
