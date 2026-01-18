# Plan de Purga de Duplicidades

**Fecha:** 2026-01-10
**Fase:** 3 - Planeación
**Basado en:** Hallazgos Fase 2

---

## RESUMEN

Este plan define las acciones para eliminar duplicidades críticas identificadas en la auditoría.

---

## DUPLICIDADES P0 - CRÍTICAS (Acción Inmediata)

### D-001: US-AE-007-asignar-grupos-maestros.md

**Ubicaciones:**
1. `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-007-asignar-grupos-maestros.md` (SSOT)
2. `docs/90-transversal/restructuracion-v2/US-AE-007-asignar-grupos-maestros.md` (DUPLICADO)

**Acción:** ELIMINAR archivo duplicado en restructuracion-v2/

**Pasos:**
```bash
# 1. Verificar que SSOT tiene contenido correcto
diff docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-007-asignar-grupos-maestros.md \
     docs/90-transversal/restructuracion-v2/US-AE-007-asignar-grupos-maestros.md

# 2. Eliminar duplicado
rm docs/90-transversal/restructuracion-v2/US-AE-007-asignar-grupos-maestros.md

# 3. Actualizar _MAP.md si existe en restructuracion-v2/
```

**Validación:**
- [ ] Archivo duplicado eliminado
- [ ] SSOT preservado intacto
- [ ] Referencias actualizadas

---

### D-002: US-AE-005-parametrizacion-gamificacion.md

**Ubicaciones:**
1. `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-005-parametrizacion-gamificacion.md` (SSOT)
2. `docs/90-transversal/restructuracion-v2/US-AE-005-parametrizacion-gamificacion.md` (DUPLICADO)

**Acción:** ELIMINAR archivo duplicado en restructuracion-v2/

**Pasos:**
```bash
rm docs/90-transversal/restructuracion-v2/US-AE-005-parametrizacion-gamificacion.md
```

**Validación:**
- [ ] Archivo duplicado eliminado
- [ ] SSOT preservado intacto

---

## DUPLICIDADES P1 - ALTAS (Trazas)

### D-003: Trazas duplicadas en archivados/

**Archivos afectados:**
- `TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md`
- `TRACE-P0-CORRECTIONS.md`

**Ubicación vigente:** `docs/95-guias-desarrollo/student-portal/traces/`
**Ubicación duplicada:** `docs/99-archivados/historicos-2025/trazas/`

**Acción:** VERIFICAR y eliminar si son idénticos

**Pasos:**
```bash
# Comparar archivos
diff docs/95-guias-desarrollo/student-portal/traces/TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md \
     docs/99-archivados/historicos-2025/trazas/TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md

# Si son idénticos, eliminar de archivados
rm docs/99-archivados/historicos-2025/trazas/TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md
rm docs/99-archivados/historicos-2025/trazas/TRACE-P0-CORRECTIONS.md
```

---

## DUPLICIDADES P1 - ALTAS (Reportes)

### D-004 y D-005: Reportes duplicados

**Archivos:**
- `REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md`
- `RESUMEN_CORRECCIONES_FINALES.md`

**Ubicación vigente:** `docs/99-finiquito/`
**Ubicación duplicada:** `docs/99-archivados/historicos-2025/reportes-analisis/`

**Acción:** CONSOLIDAR en archivados y eliminar de finiquito (son históricos)

---

## DUPLICIDADES P2 - MEDIAS (Inventarios)

### Inventarios fragmentados

**Problema:** Componentes e inventarios en múltiples ubicaciones

**Ubicaciones actuales:**
1. `docs/90-transversal/inventarios/`
2. `docs/95-guias-desarrollo/student-portal/inventory/`
3. `orchestration/inventarios/`

**SSOT definido:** `orchestration/inventarios/`

**Acción:** CONSOLIDAR todos los inventarios en orchestration/inventarios/

**Pasos:**
1. Revisar cada inventario en docs/90-transversal/inventarios/
2. Comparar con versión en orchestration/inventarios/
3. Actualizar SSOT con información más reciente
4. Eliminar o archivar versiones antiguas

---

## DUPLICIDADES P3 - BAJAS (Por Diseño)

### _MAP.md y README.md

**Estado:** INTENCIONAL - NO REQUIERE ACCIÓN

Estos archivos son duplicados por diseño:
- `_MAP.md`: 127 instancias (índices de carpeta)
- `README.md`: 45 instancias (descripciones de carpeta)

---

## CRONOGRAMA DE EJECUCIÓN

| ID | Duplicidad | Prioridad | Esfuerzo | Ciclo |
|----|-----------|-----------|----------|-------|
| D-001 | US-AE-007 | P0 | 15 min | C01 |
| D-002 | US-AE-005 | P0 | 15 min | C01 |
| D-003 | Trazas | P1 | 30 min | C02 |
| D-004/D-005 | Reportes | P1 | 30 min | C02 |
| Inventarios | Fragmentados | P2 | 2 horas | C03 |

---

## CHECKLIST DE VALIDACIÓN

### Post-Purga
- [ ] Cero archivos US-AE-007 en restructuracion-v2/
- [ ] Cero archivos US-AE-005 en restructuracion-v2/
- [ ] Trazas duplicadas eliminadas de archivados/
- [ ] Reportes consolidados en ubicación única
- [ ] Inventarios unificados en orchestration/

### Integridad
- [ ] Todos los _MAP.md actualizados
- [ ] Todas las referencias cruzadas válidas
- [ ] SSOT claramente identificados

---

**Autor:** Architecture Analyst
**Estado:** PENDIENTE EJECUCIÓN
