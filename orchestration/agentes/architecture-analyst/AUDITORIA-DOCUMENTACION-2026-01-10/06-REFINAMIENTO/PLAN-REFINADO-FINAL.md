# Plan Refinado Final - Fase 6

**Fecha:** 2026-01-10
**Fase:** 6 - Refinamiento del Plan
**Basado en:** Analisis de Dependencias Fase 5

---

## RESUMEN EJECUTIVO

Este documento consolida el plan final de ejecucion incorporando:
- Dependencias entre archivos (Fase 5)
- Cascadas de cambios identificadas
- Orden optimizado de ejecucion
- Estrategia de rollback por ciclo

---

## AJUSTES AL PLAN ORIGINAL

### Cambios Incorporados

| Aspecto | Plan Original | Plan Refinado | Razon |
|---------|---------------|---------------|-------|
| Orden Inventarios | Paralelo | Secuencial | Cascada 1: DATABASE -> MASTER |
| Duplicidades | Individual | Por lote | Mismo directorio |
| ESTADO-GENERAL | Dia 1 | Dia 4-5 | Depende de cambios previos |
| API-SOCIAL | Con auth | Auth + ejemplos | Mas completo |

### Dependencias Incorporadas

1. **Cascada 1 (Inventarios)**
   - Auditar DDL -> DATABASE_INVENTORY -> MASTER_INVENTORY -> ESTADO-GENERAL

2. **Cascada 2 (Duplicidades)**
   - Verificar SSOT -> Eliminar duplicado -> Actualizar _MAP.md

---

## CRONOGRAMA REFINADO

### SEMANA 1: CORRECCIONES P0

#### Dia 1 - Documentacion Critica y Duplicidades
| Hora | Tarea | Archivo | Dependencia |
|------|-------|---------|-------------|
| 0-2h | Crear ET-SYS-001 | M06/especificaciones/ | Ninguna |
| 2-3h | Verificar SSOT US-AE-005 | EXT-002/... | Ninguna |
| 3-4h | Eliminar US-AE-005 dup | restructuracion-v2/ | SSOT verificado |
| 4-5h | Verificar SSOT US-AE-007 | EXT-002/... | Ninguna |
| 5-6h | Eliminar US-AE-007 dup | restructuracion-v2/ | SSOT verificado |

**Backup requerido:**
```bash
git add -A
git commit -m "BACKUP: Pre-ejecucion Dia 1 - ET-SYS-001 y duplicidades"
```

#### Dia 2 - Funciones Fantasma e Inventarios
| Hora | Tarea | Archivo | Dependencia |
|------|-------|---------|-------------|
| 0-1h | Verificar DDL funciones | DDL/ | Ninguna |
| 1-2h | Eliminar funciones fantasma | SCHEMA-COMMUNICATION.md | DDL verificado |
| 2-4h | Auditar DDL real (conteo tablas) | DDL/ | Ninguna |
| 4-5h | Actualizar DATABASE_INVENTORY | orchestration/inventarios/ | DDL auditado |
| 5-6h | Sincronizar MASTER_INVENTORY | orchestration/inventarios/ | DATABASE actualizado |

**Backup requerido:**
```bash
git add -A
git commit -m "BACKUP: Pre-ejecucion Dia 2 - Inventarios y funciones"
```

#### Dia 3 - API Social Module
| Hora | Tarea | Archivo | Dependencia |
|------|-------|---------|-------------|
| 0-2h | Documentar autenticacion JWT | API-SOCIAL-MODULE.md | Ninguna |
| 2-6h | Agregar 30+ ejemplos JSON | API-SOCIAL-MODULE.md | Auth documentado |
| 6-8h | Completar 6 endpoints faltantes | API-SOCIAL-MODULE.md | Ejemplos creados |

**Backup requerido:**
```bash
git add -A
git commit -m "BACKUP: Pre-ejecucion Dia 3 - API Social"
```

#### Dia 4-5 - Estados y Trazas
| Hora | Tarea | Archivo | Dependencia |
|------|-------|---------|-------------|
| 0-2h | Regenerar ESTADO-GENERAL.json | orchestration/estados/ | Inventarios OK |
| 2-4h | Actualizar ESTADO-FRONTEND.json | orchestration/estados/ | ESTADO-GENERAL OK |
| 4-6h | Sincronizar 5 trazas principales | orchestration/trazas/ | Estados OK |
| 6-8h | Deprecar trazas vacias | orchestration/trazas/ | Trazas sincronizadas |

**Backup requerido:**
```bash
git add -A
git commit -m "BACKUP: Pre-ejecucion Dia 4-5 - Estados y trazas"
git tag auditoria-semana-1
```

---

### SEMANA 2: CORRECCIONES P1

#### Dia 1 - Identidad y Presupuestos
| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| Clarificar identidad EAI-005 | README.md + _MAP.md | 2h |
| Corregir SP/Presupuesto M05 | _MAP.md | 1h |
| Validar cambios M05 | Checklist | 1h |

#### Dia 2-3 - Homologacion
| Tarea | Archivos | Esfuerzo |
|-------|----------|----------|
| Actualizar _MAP.md con correcciones | 11 archivos | 4h |
| Verificar TRACEABILITY.yml | 9 archivos | 4h |
| Validar coherencia doc-codigo | TODOS | 4h |

#### Dia 4-5 - Consolidacion y Validacion
| Tarea | Entregable | Esfuerzo |
|-------|------------|----------|
| Consolidar reportes duplicados | Reportes unicos | 4h |
| Completar SP en EXT-003-006 | 4 archivos | 4h |
| Generar reporte intermedio | REPORTE-SEMANA-2.md | 2h |

**Backup requerido:**
```bash
git add -A
git commit -m "BACKUP: Fin Semana 2 - P1 completados"
git tag auditoria-semana-2
```

---

### SEMANA 3-4: TESTING (Opcional)

Sujeto a prioridades del proyecto.

#### Semana 3 - Backend Tests
| Servicio | Modulo | Esfuerzo |
|----------|--------|----------|
| admin-alerts.service | M04 | 8h |
| admin-analytics.service | M04 | 8h |
| admin-monitoring.service | M04 | 4h |

#### Semana 4 - Frontend Tests
| Componente | Modulo | Esfuerzo |
|------------|--------|----------|
| Setup Jest + RTL | M07/M09 | 4h |
| AdminDashboardPage | M07 | 6h |
| AdminUsersPage | M07 | 6h |

---

## ESTRATEGIA DE ROLLBACK

### Por Dia

Antes de cada dia de ejecucion:
```bash
git add -A
git commit -m "BACKUP: Pre-ejecucion dia X"
```

### Por Semana

Al final de cada semana:
```bash
git tag auditoria-semana-X
```

### En Caso de Fallo

```bash
# Revertir ultimo commit
git checkout HEAD~1

# O revertir a checkpoint de semana
git checkout auditoria-semana-X
```

### Puntos de No Retorno

| Accion | Reversible | Mitigacion |
|--------|------------|------------|
| Eliminar duplicados | Si | SSOT preservado |
| Modificar inventarios | Si | Backup previo |
| Actualizar estados | Si | Backup previo |
| Eliminar funciones fantasma | Si | DDL no afectado |

---

## CHECKLIST PRE-EJECUCION

### Verificaciones Globales
- [x] Plan validado (Fase 4)
- [x] Dependencias mapeadas (Fase 5)
- [x] SSOT identificados
- [x] Cascadas documentadas
- [x] Rollback definido

### Por Ciclo
- [ ] Backup creado
- [ ] SSOT verificado antes de eliminar duplicados
- [ ] Referencias validadas post-cambio

---

## METRICAS DE SEGUIMIENTO

| Metrica | Valor Inicial | Meta S1 | Meta S2 | Meta Final |
|---------|--------------|---------|---------|------------|
| Duplicidades P0 | 2 | 0 | 0 | 0 |
| Estados desactualizados | 5 | 2 | 0 | 0 |
| Trazas sincronizadas | 1/12 | 6/12 | 10/12 | 10/12 |
| Hallazgos P0 resueltos | 0/9 | 7/9 | 9/9 | 9/9 |
| Hallazgos P1 resueltos | 0/7 | 0/7 | 7/7 | 7/7 |
| Inventarios sincronizados | 0/2 | 2/2 | 2/2 | 2/2 |

---

## APROBACION DEL PLAN REFINADO

### Checklist Final

- [x] Dependencias incorporadas al cronograma
- [x] Cascadas de cambios respetadas
- [x] Backups definidos por dia
- [x] Rollback documentado
- [x] Metricas de seguimiento establecidas

### Estado

**PLAN REFINADO - LISTO PARA EJECUCION**

---

## PROXIMOS PASOS

1. **Iniciar Fase 7:** Ejecucion del Plan
   - Comenzar con Semana 1, Dia 1
   - Crear backup inicial
   - Ejecutar tareas segun cronograma

2. **Durante Ejecucion:**
   - Documentar cada cambio en LOG-EJECUCION.md
   - Validar cada ciclo antes de continuar
   - Crear checkpoints de backup

3. **Post-Ejecucion:**
   - Fase 8: Validacion Final
   - Generar reporte de auditoria completo
   - Crear historico resumido

---

**Autor:** Architecture Analyst
**Estado:** FASE 6 COMPLETADA - PLAN APROBADO
**Siguiente:** Fase 7 - Ejecucion
