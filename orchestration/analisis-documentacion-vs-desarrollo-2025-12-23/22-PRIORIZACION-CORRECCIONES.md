# PRIORIZACION CONSOLIDADA DE CORRECCIONES

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-12-23
**Fase:** 3 - Planeacion de Implementaciones
**Basado en:** 20-PLAN-CORRECCIONES-DOCUMENTACION.md, 21-PLAN-CORRECCIONES-CODIGO.md

---

## RESUMEN EJECUTIVO

| Categoria | Correcciones | Esfuerzo Total | Semanas |
|-----------|--------------|----------------|---------|
| Documentacion | 21 | 42.5h | 2 |
| Codigo | 9 | 20h | 1.5 |
| **TOTAL** | **30** | **62.5h** | **3.5** |

---

## 1. CRONOGRAMA DE EJECUCION

### SEMANA 1: Correcciones Criticas (P0)

#### Dia 1-2: Documentacion Base
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-001 | Actualizar FEATURES-IMPLEMENTADAS.md | 2h | Docs |
| C-DOC-002 | Actualizar docs/README.md | 30min | Docs |
| C-DOC-005 | Documentar 9 tablas nuevas DB | 2h | Docs |

#### Dia 2-3: Documentacion API
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-003 | Documentar modulo Teacher | 4h | Docs |
| C-DOC-006 | Actualizar API.md estructura | 1h | Docs |

#### Dia 4-5: Frontend Docs + Codigo
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-004 | Documentar Portal Student | 4h | Docs |
| C-CODE-004 | Resolver duplicados Teacher | 2h | Dev |
| C-DOC-007 | Doc duplicacion Teacher | 30min | Docs |

#### Total Semana 1: 16h

---

### SEMANA 2: Correcciones Altas (P1)

#### Dia 1-2: Backend y Database
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-009 | Completar docs Admin Module | 3h | Docs |
| C-DOC-012 | Actualizar inventario triggers | 2h | Docs |
| C-CODE-002 | Reubicar paginas Admin | 2h | Dev |

#### Dia 3: Inventarios
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-010 | Actualizar MASTER_INVENTORY.yml | 1h | Docs |
| C-DOC-015 | Actualizar BACKEND_INVENTORY.yml | 30min | Docs |
| C-DOC-011 | Documentar schema Communication | 1h | Docs |

#### Dia 4: Mecanicas
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-013 | Documentar mecanicas M1-M2 extra | 2h | Docs |
| C-DOC-014 | Clarificar mecanicas M5 | 30min | Docs |

#### Dia 5: Codigo Cleanup
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-CODE-003 | Unificar rutas profile | 2h | Dev |
| C-CODE-005 | Limpiar rutas gamification | 2h | Dev |

#### Total Semana 2: 16h

---

### SEMANA 3: Correcciones Medias (P2)

#### Dia 1-2: Documentacion Extendida
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-016 | Documentar modulo Social | 3h | Docs |
| C-DOC-017 | Documentar mecanicas M1-M5 | 6h | Docs |

#### Dia 3-4: Componentes y DB
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-018 | Documentar componentes Frontend | 4h | Docs |
| C-DOC-019 | Actualizar FRONTEND_INVENTORY.yml | 1h | Docs |
| C-DOC-020 | Documentar views nuevas DB | 2h | Docs |

#### Dia 5: Codigo y Cleanup
| ID | Tarea | Esfuerzo | Responsable |
|----|-------|----------|-------------|
| C-DOC-021 | Unificar rutas duplicadas Auth | 2h | Docs |
| C-CODE-009 | Eliminar codigo muerto Teacher | 2h | Dev |

#### Total Semana 3: 20h

---

### BACKLOG: Decisiones Pendientes

| ID | Tarea | Esfuerzo | Requiere Decision |
|----|-------|----------|-------------------|
| C-CODE-001 | Auth stubs | 2-12h | Implementar vs Documentar |
| C-CODE-006 | Mecanicas M5 | 8h | Scope confirmation |
| C-CODE-007 | Indices DB | 2h | Performance analysis |
| C-CODE-008 | RLS policies | 2h | Security review |

---

## 2. GRAFO DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────┐
│                         SEMANA 1                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  C-DOC-001 ──┬──> C-DOC-002                                     │
│  (FEATURES)  │                                                   │
│              └──> C-DOC-010 (S2)                                │
│                                                                  │
│  C-DOC-003 ────> C-DOC-006                                      │
│  (Teacher)       (API.md)                                        │
│                                                                  │
│  C-DOC-005 ────> C-DOC-011 (S2)                                 │
│  (DB Tables)     (Communication)                                 │
│                                                                  │
│  C-CODE-004 ───> C-DOC-007                                      │
│  (Duplicates)    (Doc update)                                    │
│                                                                  │
│  C-DOC-004                                                       │
│  (Student) [Standalone]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         SEMANA 2                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  C-DOC-009 [Standalone]                                         │
│  (Admin Module)                                                  │
│                                                                  │
│  C-DOC-012 ────> C-DOC-010                                      │
│  (Triggers)      (MASTER_INVENTORY)                              │
│                                                                  │
│  C-CODE-002 ────> Router update                                 │
│  (Admin pages)                                                   │
│                                                                  │
│  C-CODE-003 ────> Frontend API update                           │
│  (Profile routes)                                                │
│                                                                  │
│  C-CODE-005 ────> Frontend API update                           │
│  (Gamification)                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. MATRIZ DE RIESGOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Breaking changes en API | Media | Alto | Versionado, deprecation warnings |
| Imports rotos Frontend | Alta | Medio | Tests antes de merge |
| Documentacion inconsistente | Media | Bajo | Review cruzado |
| Regresion en auth | Baja | Alto | Tests E2E auth flow |
| Performance DB | Baja | Medio | Monitoreo post-deploy |

---

## 4. METRICAS DE EXITO

### Fase 3 (Planeacion):
- [ ] 100% correcciones identificadas
- [ ] 100% dependencias mapeadas
- [ ] Cronograma aprobado

### Fase 4 (Validacion):
- [ ] 0 dependencias faltantes
- [ ] 0 conflictos de prioridad
- [ ] Riesgos mitigados

### Fase 5 (Ejecucion):
- [ ] 100% P0 completado en Semana 1
- [ ] 100% P1 completado en Semana 2
- [ ] 80%+ P2 completado en Semana 3
- [ ] 0 regresiones en tests

---

## 5. CRITERIOS DE ACEPTACION

### Documentacion:
```yaml
Cada documento debe:
  - Tener fecha de ultima actualizacion
  - Valores numericos verificados contra codigo
  - Links internos funcionando
  - Sin duplicacion de informacion
  - Formato consistente con templates
```

### Codigo:
```yaml
Cada cambio debe:
  - Pasar todos los tests existentes
  - Tener tests nuevos si aplica
  - Seguir convenciones del proyecto
  - No introducir breaking changes sin deprecation
  - Estar documentado si es API publica
```

---

## 6. ROLES Y RESPONSABILIDADES

| Rol | Responsabilidades | Asignacion |
|-----|-------------------|------------|
| **Docs Lead** | Correcciones C-DOC-* | TBD |
| **Dev Lead** | Correcciones C-CODE-* | TBD |
| **Reviewer** | Validar cambios pre-merge | TBD |
| **QA** | Verificar no regresiones | TBD |

---

## 7. COMUNICACION

### Daily Standup:
- Progreso de correcciones
- Blockers identificados
- Ajustes de prioridad

### Weekly Review:
- Metricas de avance
- Riesgos materializados
- Ajuste de cronograma

---

## 8. SIGUIENTE PASO

**FASE 4:** Validacion de planeacion
- Verificar dependencias completas
- Analizar impactos cruzados
- Crear checklist pre-implementacion

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
