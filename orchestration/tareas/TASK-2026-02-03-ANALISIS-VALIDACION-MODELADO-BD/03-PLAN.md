# Fase P: PLAN

**Task ID:** TASK-2026-02-03-ANALISIS-VALIDACION-MODELADO-BD
**Fecha:** 2026-02-03
**Agente:** PERFIL-DBA-SENIOR
**Fase:** Plan (P) del ciclo CAPVED

---

## 1. Resumen del Plan

### 1.1 Objetivo
Corregir los 23 gaps identificados en el analisis, elevar el score de coherencia DDL-Backend de 91.5% a 97%+ y garantizar cobertura RLS del 99%.

### 1.2 Alcance
- **Incluye:** Correccion de DDL, alineacion de entities, mejora RLS, documentacion
- **Excluye:** Cambios de logica de negocio, nuevas funcionalidades, refactors mayores

### 1.3 Entregables
1. DDL corregidos y validados
2. Entities alineados con DDL
3. RLS policies completas
4. Inventarios actualizados
5. Informe final de validacion

---

## 2. Organizacion en Sprints

### 2.1 Vista General
| Sprint | Nombre | Tareas | Prioridad | Esfuerzo |
|--------|--------|--------|-----------|----------|
| 1 | Criticos RLS | 5 | P1 | 8h |
| 2 | Fundamentos AUTH/EDU | 6 | P2 | 12h |
| 3 | Social y Gamification | 5 | P2 | 10h |
| 4 | Documentacion | 3 | P2 | 6h |
| 5 | Mejoras System | 2 | P2 | 8h |
| 6 | Backlog P3 | 5 | P3 | 14h |
| **TOTAL** | - | **23** + 3 doc | - | **58h** |

---

## 3. Sprint 1: Criticos RLS (P1)

### 3.1 Tareas
| # | Gap ID | Descripcion | Archivo | Tiempo |
|---|--------|-------------|---------|--------|
| 1.1 | GAP-AUTH-003 | Completar RLS `audit_log` | 01_auth/03_rls.sql | 1.5h |
| 1.2 | GAP-EDU-003 | Crear FK `lesson_resources` | 02_educational/01_tables.sql | 1.5h |
| 1.3 | GAP-GAM-002 | Crear RLS `achievements` | 03_gamification/03_rls.sql | 2h |
| 1.4 | GAP-SOC-001 | Completar RLS `messages` | 05_social/03_rls.sql | 2h |
| 1.5 | - | Validacion integral RLS | scripts/validate-rls.sh | 1h |

### 3.2 Criterio de Exito
- [ ] Todas las tablas criticas con RLS funcional
- [ ] Tests de seguridad pasando

---

## 4. Sprint 2: Fundamentos AUTH/EDU (P2)

### 4.1 Tareas
| # | Gap ID | Descripcion | Archivo | Tiempo |
|---|--------|-------------|---------|--------|
| 2.1 | GAP-AUTH-001 | Sincronizar `last_sign_in_at` | User.entity.ts | 1.5h |
| 2.2 | GAP-AUTH-002 | Crear indice `sessions.user_id` | 01_auth/02_indexes.sql | 1h |
| 2.3 | GAP-EDU-001 | Agregar cascade `course_modules` | CourseModule.entity.ts | 2h |
| 2.4 | GAP-EDU-004 | Crear indice compuesto | 02_educational/02_indexes.sql | 1h |
| 2.5 | GAP-EDU-005 | Crear trigger auditoria | 02_educational/04_triggers.sql | 3h |
| 2.6 | - | Alinear entities AUTH | Entities auth/*.ts | 3.5h |

### 4.2 Criterio de Exito
- [ ] Build backend exitoso
- [ ] Entities 100% alineados con DDL

---

## 5. Sprint 3: Social y Gamification (P2)

### 5.1 Tareas
| # | Gap ID | Descripcion | Archivo | Tiempo |
|---|--------|-------------|---------|--------|
| 3.1 | GAP-GAM-001 | Corregir tipo `points` a BIGINT | DDL + Entity | 2h |
| 3.2 | GAP-GAM-003 | Crear indice `leaderboard` | 03_gamification/02_indexes.sql | 1h |
| 3.3 | GAP-SOC-002 | Refactorizar FK circular | DDL + Entities | 4h |
| 3.4 | GAP-PRO-001 | Revisar `completed_at` nullable | Progress.entity.ts | 1.5h |
| 3.5 | GAP-PRO-002 | Crear indice parcial | 04_progress/02_indexes.sql | 1.5h |

### 5.2 Criterio de Exito
- [ ] Sin errores de tipos
- [ ] Indices optimizados funcionando

---

## 6. Sprint 4: Documentacion (P2)

### 6.1 Tareas
| # | Gap ID | Descripcion | Archivo | Tiempo |
|---|--------|-------------|---------|--------|
| 4.1 | GAP-EDU-006 | Agregar COMMENT ON tablas | DDL educational | 2h |
| 4.2 | - | Actualizar DATABASE_INVENTORY | inventarios/ | 2h |
| 4.3 | - | Actualizar MASTER_INVENTORY | inventarios/ | 2h |

### 6.2 Criterio de Exito
- [ ] Inventarios sincronizados
- [ ] Tablas documentadas

---

## 7. Sprint 5: Mejoras System (P2)

### 7.1 Tareas
| # | Gap ID | Descripcion | Archivo | Tiempo |
|---|--------|-------------|---------|--------|
| 5.1 | GAP-ADM-001 | Implementar particionamiento logs | 07_system/01_tables.sql | 5h |
| 5.2 | GAP-SYS-001 | Definir politica retencion | docs + DDL | 3h |

### 7.2 Criterio de Exito
- [ ] Logs particionados por mes
- [ ] Politica documentada

---

## 8. Sprint 6: Backlog P3

### 8.1 Tareas
| # | Gap ID | Descripcion | Archivo | Tiempo |
|---|--------|-------------|---------|--------|
| 6.1 | GAP-AUTH-004 | Corregir tipo `metadata` | Entity | 2h |
| 6.2 | GAP-AUTH-005 | Agregar constraint `roles` | DDL | 1.5h |
| 6.3 | GAP-EDU-002 | Agregar default `order` | DDL | 1h |
| 6.4 | GAP-GAM-004 | Agregar constraint check | DDL | 1.5h |
| 6.5 | GAP-SOC-003 | Crear enum `status` | DDL + Entity | 3h |
| 6.6 | GAP-PRO-003 | Evaluar trigger calculo | Analisis | 2h |

### 8.2 Criterio de Exito
- [ ] Gaps P3 cerrados o documentados como backlog futuro

---

## 9. Diagrama de Dependencias

```
Sprint 1 (RLS Criticos)
    |
    v
Sprint 2 (AUTH/EDU) -----> Sprint 3 (Social/Gamification)
    |                           |
    v                           v
Sprint 4 (Documentacion) <------+
    |
    v
Sprint 5 (System) -----> Sprint 6 (Backlog P3)
    |
    v
[VALIDACION FINAL]
```

---

## 10. Cronograma Estimado

| Sprint | Inicio | Fin | Duracion Paralela |
|--------|--------|-----|-------------------|
| Sprint 1 | T+0h | T+8h | 8h |
| Sprint 2 | T+8h | T+20h | 12h |
| Sprint 3 | T+8h | T+18h | 10h (paralelo con S2) |
| Sprint 4 | T+20h | T+26h | 6h |
| Sprint 5 | T+26h | T+34h | 8h |
| Sprint 6 | T+34h | T+48h | 14h |
| **Validacion** | T+48h | T+52h | 4h |
| **TOTAL** | - | - | **52h (58h trabajo)** |

---

## 11. Estrategia de Validacion

### 11.1 Por Sprint
```bash
# Despues de cada sprint
wsl -d Ubuntu-24.04 -- bash unified-recreate-db.sh gamilit --drop
npm run build
npm run lint
npm run test
```

### 11.2 Validacion Final
- [ ] Recreacion BD exitosa
- [ ] Build sin errores
- [ ] Score >= 97%
- [ ] RLS >= 99%

---

## 12. Aprobacion del Plan

### 12.1 Checklist Pre-Ejecucion
- [x] Todas las subtareas identificadas
- [x] Dependencias mapeadas
- [x] Validaciones definidas
- [x] Rollback planificado (git revert)
- [x] Recursos disponibles

### 12.2 Decision
- [x] Plan aprobado - Proceder a Validacion (V)
- [ ] Plan requiere ajustes
- [ ] Plan rechazado

---

## 13. Siguiente Fase

- [x] Contexto (C) - COMPLETADA
- [x] Analisis (A) - COMPLETADA
- [x] Plan (P) - COMPLETADA
- [ ] Validacion (V) - SIGUIENTE

---

*Fase P completada: 2026-02-03 12:00*
*Agente: PERFIL-DBA-SENIOR*
