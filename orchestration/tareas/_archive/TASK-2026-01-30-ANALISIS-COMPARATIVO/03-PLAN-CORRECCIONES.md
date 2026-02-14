# PLAN DE CORRECCIONES
## Basado en Analisis Comparativo WSL vs Windows

**Fecha:** 2026-01-30
**Estado:** PROPUESTO
**Principio:** CAPVED para cada subtarea

---

## RESUMEN EJECUTIVO

**Hallazgo Principal:** No hay codigo perdido. Hay divergencia de repositorios y desincronizacion de documentacion.

**Tareas Propuestas:** 8 tareas organizadas en 3 fases
**Esfuerzo Estimado:** 12-16 horas total
**Prioridad Global:** P0/P1

---

## FASE 1: SINCRONIZACION INMEDIATA (P0)
*Tiempo estimado: 2-3 horas*

### TASK-SYNC-001: Actualizar Repositorio WSL
**Prioridad:** P0 - CRITICO
**Dominio:** Infraestructura

**Contexto:**
- WSL tiene version master@e232a08 (~20 enero)
- Windows tiene version main@8eab218b (~30 enero)
- Delta: ~10 dias de desarrollo

**Accion:**
```bash
cd /home/isem/workspace-v2/projects/gamilit
git fetch origin
git stash  # Si hay cambios locales
git checkout main
git pull origin master
git stash pop  # Si aplica
```

**Validacion:**
- [ ] `git log --oneline -1` muestra commit reciente
- [ ] `ls apps/frontend/src/apps/parent` muestra 4 archivos
- [ ] `ls apps/frontend/src/apps/teacher/pages/TeacherResourcesPage.tsx` NO existe

**Documentacion:**
- Actualizar LOCAL-WSL-ENVIRONMENT.yml con fecha sync

---

### TASK-SYNC-002: Establecer SSOT Oficial
**Prioridad:** P0 - CRITICO
**Dominio:** Gobernanza

**Contexto:**
- Multiples fuentes de verdad causan confusion
- Necesario definir fuente autoritativa

**Accion:**
1. Actualizar CLAUDE.md del workspace con regla:
   ```
   ### RC5: SSOT DE INVENTARIOS
   | Tipo | SSOT | Ubicacion |
   |------|------|-----------|
   | Proyecto especifico | PROYECTO LOCAL | projects/{p}/orchestration/inventarios/ |
   ```

2. Documentar en WORKSPACE-INTEGRATION.yml

**Validacion:**
- [ ] CLAUDE.md actualizado
- [ ] Agentes usan fuente correcta

**Documentacion:**
- ADR documentando decision SSOT

---

## FASE 2: SINCRONIZACION DE INVENTARIOS (P1)
*Tiempo estimado: 4-6 horas*

### TASK-INV-001: Actualizar DATABASE_INVENTORY.yml
**Prioridad:** P1 - ALTA
**Dominio:** Base de Datos

**Contexto:**
- Inventario reporta 126 funciones, realidad 232
- Inventario reporta 37 triggers, realidad 109

**Accion:**
1. Ejecutar script de conteo DDL
2. Actualizar DATABASE_INVENTORY.yml con valores reales
3. Actualizar timestamps y checksums

**Metricas a actualizar:**
| Campo | Valor Actual | Valor Real |
|-------|--------------|------------|
| schemas | ? | 16 |
| tables | ? | 147 |
| functions | 126 | 232 |
| triggers | 37 | 109 |
| rls_policies | ? | 282 |

**Validacion:**
- [ ] Conteos coinciden con DDL
- [ ] Build de BD exitoso

---

### TASK-INV-002: Actualizar BACKEND_INVENTORY.yml
**Prioridad:** P1 - ALTA
**Dominio:** Backend

**Contexto:**
- Inventario puede estar desactualizado
- Necesita reflejar 22 modulos, 850+ endpoints

**Accion:**
1. Ejecutar script de conteo backend
2. Actualizar inventario con valores reales
3. Sincronizar con Swagger

**Validacion:**
- [ ] Conteos coinciden con codigo
- [ ] Build backend exitoso

---

### TASK-INV-003: Actualizar FRONTEND_INVENTORY.yml
**Prioridad:** P1 - ALTA
**Dominio:** Frontend

**Contexto:**
- Inventario reporta 309 componentes, realidad 458
- Falta Portal Parent

**Accion:**
1. Ejecutar script de conteo frontend
2. Agregar Portal Parent al inventario
3. Actualizar conteos por portal

**Metricas a actualizar:**
| Campo | Valor Actual | Valor Real |
|-------|--------------|------------|
| components | 309 | 458 |
| hooks | ? | 127 |
| stores | ? | 32 |
| pages | ? | 74 |
| portals | 3 | 4 (+ Parent) |

**Validacion:**
- [ ] Conteos coinciden con codigo
- [ ] Build frontend exitoso

---

### TASK-INV-004: Actualizar MASTER_INVENTORY.yml
**Prioridad:** P1 - ALTA
**Dominio:** Consolidado

**Contexto:**
- Debe reflejar suma de inventarios especificos
- Es la fuente de verdad agregada

**Accion:**
1. Consolidar datos de DATABASE, BACKEND, FRONTEND
2. Actualizar metricas globales
3. Actualizar MVP % basado en datos reales

**Validacion:**
- [ ] Suma de partes = total
- [ ] MVP % calculado correctamente

---

## FASE 3: DOCUMENTACION Y PREVENCION (P2)
*Tiempo estimado: 4-6 horas*

### TASK-DOC-001: Crear ADR para Cambios Arquitectonicos
**Prioridad:** P2 - MEDIA
**Dominio:** Documentacion

**Contexto:**
- TeacherResourcesPage eliminado sin ADR formal
- Refactoring de nombres de paginas no documentado

**Accion:**
1. Crear ADR-XXX: Consolidacion TeacherResourcesPage
2. Crear ADR-XXX: Convencion de Nombres Paginas
3. Agregar al indice de ADRs

**Contenido ADR TeacherResourcesPage:**
- Decision: Eliminar pagina separada
- Razon: Funcionalidad integrada en TeacherContentPage
- Consecuencias: Simplificacion de rutas
- Fecha: 2026-01-25
- Commit: f55d872b

---

### TASK-DOC-002: Documentar Convencion Nombres Teacher
**Prioridad:** P2 - MEDIA
**Dominio:** Documentacion

**Contexto:**
- Paginas renombradas de TeacherXXXPage a TeacherXXX
- No hay documentacion de la convencion

**Accion:**
1. Actualizar guia de desarrollo frontend
2. Documentar convencion de nombres
3. Agregar ejemplos

---

### TASK-AUTO-001: Automatizar Validacion Inventarios
**Prioridad:** P2 - MEDIA
**Dominio:** DevOps

**Contexto:**
- Desincronizacion ocurre porque no hay validacion automatica
- Necesario prevenir futuras divergencias

**Accion:**
1. Crear script `validate-inventories.sh`
2. Integrar en pre-commit hook
3. Agregar a CI/CD pipeline

**Validaciones:**
- Conteo archivos = inventario
- Timestamps recientes
- Checksums validos

---

## DEPENDENCIAS

```
TASK-SYNC-001 (P0)
      │
      ▼
TASK-SYNC-002 (P0)
      │
      ├───────────────────┬───────────────────┐
      ▼                   ▼                   ▼
TASK-INV-001 (P1)    TASK-INV-002 (P1)    TASK-INV-003 (P1)
      │                   │                   │
      └───────────────────┴───────────────────┘
                          │
                          ▼
                    TASK-INV-004 (P1)
                          │
      ┌───────────────────┼───────────────────┐
      ▼                   ▼                   ▼
TASK-DOC-001 (P2)   TASK-DOC-002 (P2)   TASK-AUTO-001 (P2)
```

---

## ORDEN DE EJECUCION SUGERIDO

### Dia 1 (2-3h)
1. TASK-SYNC-001: Actualizar WSL
2. TASK-SYNC-002: Establecer SSOT

### Dia 2 (4-6h)
3. TASK-INV-001: DATABASE_INVENTORY
4. TASK-INV-002: BACKEND_INVENTORY
5. TASK-INV-003: FRONTEND_INVENTORY
6. TASK-INV-004: MASTER_INVENTORY

### Dia 3+ (4-6h)
7. TASK-DOC-001: ADR Cambios
8. TASK-DOC-002: Convencion Nombres
9. TASK-AUTO-001: Automatizacion

---

## VALIDACION FINAL

Al completar todas las tareas:

- [ ] WSL y Windows sincronizados
- [ ] Inventarios reflejan realidad
- [ ] SSOT definido y documentado
- [ ] ADRs creados para cambios arquitectonicos
- [ ] Automatizacion implementada
- [ ] Agentes usan fuentes correctas

---

## NOTAS ADICIONALES

### Errores de Integracion Reportados

El usuario menciono "errores de integracion". Estos deben validarse **despues** de sincronizar WSL, ya que pueden ser:
1. Comparacion con version vieja (ya resuelto)
2. Errores reales en version actual (necesita validacion)

**Recomendacion:** Despues de Fase 1, ejecutar builds completos y reportar errores especificos.

### Validacion de Builds Post-Sync

```bash
# Backend
cd apps/backend && npm run build && npm run lint

# Frontend
cd apps/frontend && npm run build && npm run lint

# Database
./scripts/database/unified-recreate-db.sh gamilit --drop
```

---

*Generado por Claude Code Opus 4.5*
*Sistema SIMCO v4.0*
*Principio CAPVED aplicado a cada tarea*
