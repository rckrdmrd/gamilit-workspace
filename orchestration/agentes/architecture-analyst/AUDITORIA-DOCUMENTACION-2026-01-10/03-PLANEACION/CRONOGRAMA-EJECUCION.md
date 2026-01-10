# Cronograma de Ejecución - Auditoría GAMILIT

**Fecha:** 2026-01-10
**Fase:** 3 - Planeación
**Basado en:** Hallazgos Fase 2

---

## RESUMEN

| Fase | Tareas | Esfuerzo | Estado |
|------|--------|----------|--------|
| Fase 1-2 | Análisis | Completado | ✅ DONE |
| Fase 3 | Planeación | 4h | ✅ EN PROGRESO |
| Fase 4 | Validación Plan | 2h | PENDIENTE |
| Fase 5 | Análisis Dependencias | 4h | PENDIENTE |
| Fase 6 | Refinamiento | 2h | PENDIENTE |
| Fase 7 | Ejecución | 60h | PENDIENTE |
| Fase 8 | Validación Final | 4h | PENDIENTE |

---

## CRONOGRAMA DETALLADO

### SEMANA 1: CORRECCIONES P0

#### Día 1 - Documentación Crítica
| Hora | Tarea | Módulo | Entregable |
|------|-------|--------|------------|
| 0-2h | Crear ET-SYS-001 | M06 | Especificación técnica |
| 2-4h | Purgar duplicidades US-AE-005/007 | M10 | Archivos eliminados |
| 4-6h | Actualizar ESTADO-GENERAL.json | M11 | Estado sincronizado |

#### Día 2 - Correcciones Técnicas
| Hora | Tarea | Módulo | Entregable |
|------|-------|--------|------------|
| 0-2h | Eliminar funciones fantasma | M10 | SCHEMA-COMMUNICATION limpio |
| 2-4h | Reconciliar inventarios (133 vs 70) | M11 | SSOT único |
| 4-6h | Actualizar estados de agentes | M11 | Estados sincronizados |

#### Día 3 - API y Referencias
| Hora | Tarea | Módulo | Entregable |
|------|-------|--------|------------|
| 0-4h | Completar API-SOCIAL-MODULE | M10 | Auth + ejemplos |
| 4-6h | Validar referencias cruzadas | TODOS | Referencias válidas |

#### Día 4-5 - Trazas y Consolidación
| Hora | Tarea | Módulo | Entregable |
|------|-------|--------|------------|
| 0-4h | Sincronizar 10 trazas | M11 | Trazas actualizadas |
| 4-8h | Consolidar reportes duplicados | M11 | Reportes únicos |

---

### SEMANA 2: CORRECCIONES P1

#### Día 1 - Identidad y Presupuestos
| Tarea | Módulo | Esfuerzo |
|-------|--------|----------|
| Clarificar identidad EAI-005 | M05 | 2h |
| Corregir SP/Presupuesto | M05 | 1h |
| Agregar SP a EXT-003-006 | M09 | 4h |

#### Día 2-3 - Homologación de Módulos
| Tarea | Módulos | Esfuerzo |
|-------|---------|----------|
| Actualizar _MAP.md con correcciones | M01-M11 | 4h |
| Verificar TRACEABILITY.yml | M01-M09 | 4h |
| Validar coherencia doc-código | TODOS | 4h |

#### Día 4-5 - Validación Parcial
| Tarea | Entregable | Esfuerzo |
|-------|------------|----------|
| Validar duplicidades eliminadas | Checklist | 2h |
| Validar estados actualizados | Checklist | 2h |
| Generar reporte intermedio | REPORTE-SEMANA-2.md | 2h |

---

### SEMANA 3-4: TESTING (Opcional según prioridades)

#### Semana 3 - Backend Tests
| Día | Tarea | Módulo | Esfuerzo |
|-----|-------|--------|----------|
| D1-D2 | Tests admin-alerts.service | M04 | 8h |
| D3-D4 | Tests admin-analytics.service | M04 | 8h |
| D5 | Tests admin-monitoring.service | M04 | 4h |

#### Semana 4 - Frontend Tests (Críticos)
| Día | Tarea | Módulo | Esfuerzo |
|-----|-------|--------|----------|
| D1 | Setup Jest + RTL | M07/M09 | 4h |
| D2-D3 | Tests AdminDashboardPage | M07 | 6h |
| D4-D5 | Tests AdminUsersPage | M07 | 6h |

---

## DEPENDENCIAS ENTRE TAREAS

```
Día 1: ET-SYS-001 ──┐
                    │
Día 1: Purgar dup ──┼──→ Día 2: Inventarios
                    │
Día 2: Funciones ───┘

Día 3: API-SOCIAL ──→ Día 4: Trazas ──→ Día 5: Reportes

Semana 2: Identidad ──→ Semana 2: Homologación ──→ Validación
```

---

## HITOS Y CHECKPOINTS

| Hito | Fecha Objetivo | Criterio de Éxito |
|------|---------------|-------------------|
| H1 - P0 Críticos | S1-D3 | ET-SYS-001 creado, duplicidades eliminadas |
| H2 - Estados OK | S1-D5 | Todos los estados actualizados |
| H3 - P1 Completos | S2-D3 | SP corregidos, identidad clarificada |
| H4 - Validación | S2-D5 | Checklist de validación verde |
| H5 - Tests Backend | S3-D5 | 4 servicios con cobertura |
| H6 - Tests Frontend | S4-D5 | 2 páginas con tests |

---

## RECURSOS REQUERIDOS

### Por Fase
| Fase | Agentes Paralelos | Tipo |
|------|------------------|------|
| Ejecución S1 | 3-5 | Explore + Edit |
| Ejecución S2 | 2-3 | Edit |
| Testing S3-S4 | 1-2 | Code |

### Herramientas
- Git para backups incrementales
- Grep/Glob para validaciones
- Bash para operaciones masivas

---

## PLAN DE ROLLBACK

### Por Día
Antes de cada día de ejecución:
```bash
git add -A
git commit -m "BACKUP: Pre-ejecución día X"
```

### Por Semana
Al final de cada semana:
```bash
git tag auditoria-semana-X
```

### En caso de fallo
```bash
git checkout HEAD~1  # Revertir último commit
# O
git checkout auditoria-semana-X  # Revertir a checkpoint
```

---

## MÉTRICAS DE SEGUIMIENTO

| Métrica | Valor Inicial | Meta S1 | Meta S2 | Meta Final |
|---------|--------------|---------|---------|------------|
| Duplicidades P0 | 2 | 0 | 0 | 0 |
| Estados desactualizados | 5 | 2 | 0 | 0 |
| Trazas sincronizadas | 1/12 | 6/12 | 12/12 | 12/12 |
| Hallazgos P0 resueltos | 0/6 | 4/6 | 6/6 | 6/6 |
| Hallazgos P1 resueltos | 0/5 | 0/5 | 5/5 | 5/5 |

---

## PRÓXIMOS PASOS INMEDIATOS

1. **Aprobar plan de planeación (Fase 3)**
2. **Ejecutar Fase 4: Validación del plan**
3. **Iniciar Fase 7: Ejecución - Día 1**

---

**Autor:** Architecture Analyst
**Estado:** PENDIENTE APROBACIÓN
**Siguiente:** Fase 4 - Validación de Planeación
