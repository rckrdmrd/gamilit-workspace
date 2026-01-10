# PLAN MAESTRO: PURGA Y REORGANIZACIÓN DE DOCUMENTACIÓN GAMILIT

**Fecha de Creación:** 2026-01-07
**Versión:** 2.0 (REFINADO POST-VALIDACIÓN)
**Estado:** VALIDADO - LISTO PARA EJECUCIÓN
**Autor:** Claude Code - Arquitecto de Documentación

> **NOTA v2.0:** Plan refinado después de validación completa de archivos y dependencias.
> Cambios principales: ISSUES-CRITICOS.md ya archivado, archivos a "mover" ya están en destino.

---

## RESUMEN EJECUTIVO

Este plan detalla la purga y reorganización de la documentación del proyecto Gamilit basado en un análisis exhaustivo de:
- **690 archivos** en `/docs/` (16 MB)
- **750 archivos** en `/orchestration/`
- **127 _MAP.md** de navegación
- **159 archivos** en carpetas históricas

### Objetivos
1. Eliminar documentación deprecada y obsoleta
2. Reorganizar archivos vigentes mal ubicados
3. Actualizar mapas de navegación (_MAP.md)
4. Consolidar reportes históricos
5. Corregir referencias rotas

### Métricas Objetivo
| Métrica | Antes | Después |
|---------|-------|---------|
| Archivos obsoletos | ~25 | 0 |
| Referencias rotas | 99+ | 0 |
| _MAP.md desactualizados | 3 | 0 |
| Cobertura documentación | 44-80% | 95%+ |

---

## FASE 1: ACCIONES CRÍTICAS (P0) - Ejecutar Primero

### 1.1 ~~Investigar archivo ISSUES-CRITICOS.md faltante~~ ✅ RESUELTO

**Estado:** VALIDADO - El archivo fue **archivado correctamente** según plan de 2026-01-06.

**Hallazgos de Validación:**
- Ubicación actual: `docs/archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-DEPRECATED.md`
- SSOT actual: `docs/90-transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md`
- El `_MAP.md` de `correcciones/` ya está actualizado correctamente
- **PENDIENTE:** Actualizar referencias en `docs/90-transversal/_MAP.md` y `README.md`

**Acciones Requeridas:**
1. ✅ No es necesario restaurar (ya archivado)
2. ✅ No es necesario crear nuevo archivo (SSOT existe)
3. ⏳ Actualizar referencias obsoletas en:
   - `/docs/90-transversal/_MAP.md` (línea 30)
   - `/docs/90-transversal/README.md`

**Responsable:** Automático
**Prioridad:** P1 (bajada de P0 - ya resuelto parcialmente)

---

### 1.2 ~~Mover archivos vigentes fuera de /archivados/~~ ✅ CAMBIO DE PLAN

**Estado:** VALIDADO - Los archivos **YA EXISTEN en destino** (fueron copiados previamente el 2026-01-04).

**Hallazgos de Validación:**
| Archivo | Origen | Destino | Estado |
|---------|--------|---------|--------|
| student/README.md | archivados/frontend-original/ | 95-guias-desarrollo/frontend/student/ | ✅ Ya existe en destino |
| MECANICAS-EDUCATIVAS.md | archivados/frontend-original/ | 95-guias-desarrollo/frontend/ | ✅ Ya existe en destino |

**Cambio de Acción:** En lugar de MOVER, **ELIMINAR duplicados** de origen.

#### Acción 1.2.1: Eliminar duplicado student/README.md
```bash
# Verificar que destino existe (ya confirmado)
ls -la /home/isem/workspace-v1/projects/gamilit/docs/95-guias-desarrollo/frontend/student/README.md

# Eliminar duplicado en archivados
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/student/README.md
rmdir /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/student/
```

#### Acción 1.2.2: Eliminar duplicado MECANICAS-EDUCATIVAS.md
```bash
# Verificar que destino existe (ya confirmado)
ls -la /home/isem/workspace-v1/projects/gamilit/docs/95-guias-desarrollo/frontend/MECANICAS-EDUCATIVAS.md

# Eliminar duplicado en archivados
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/MECANICAS-EDUCATIVAS.md
```

**Archivos a eliminar adicionales (agregados a lista total):** +2 archivos

---

## FASE 2: LIMPIEZA DE ARCHIVOS OBSOLETOS (P1)

### 2.1 Eliminar archivos en /docs/archivados/

#### 2.1.1 Eliminar correcciones obsoletas
```bash
# Archivos claramente marcados como DEPRECATED
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-DEPRECATED.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-27.md

# Eliminar carpeta vacía después
rmdir /home/isem/workspace-v1/projects/gamilit/docs/archivados/historicos-2025/correcciones-obsoletas/
```

#### 2.1.2 Eliminar especificaciones frontend obsoletas
```bash
# Especificaciones pre-refactoring que ya no existen en código
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/admin/pages/AdminUsersPage-Specification.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/admin/pages/AdminGamificationPage-Specification.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/admin/pages/AdminAlertsPage-Specification.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/admin/hooks/ADMIN-CLASSROOMS-HOOK.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/admin/hooks/ADMIN-GAMIFICATION-CONFIG-HOOK.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/teacher/components/TEACHER-RESPONSE-MANAGEMENT.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/teacher/components/TEACHER-MONITORING-COMPONENTS.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/teacher/types/TEACHER-TYPES-REFERENCE.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/teacher/constants/TEACHER-CONSTANTS-REFERENCE.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/especificaciones/AdminReportsPage-UI-Specification.md

# Limpiar carpetas vacías
find /home/isem/workspace-v1/projects/gamilit/docs/archivados/frontend-original/ -type d -empty -delete
```

#### 2.1.3 Eliminar convenciones supersedidas
```bash
# Standards deprecados (versiones actuales en 95-guias-desarrollo/)
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/98-standards-deprecated/NAMING-CONVENTIONS-COMPLETE.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/98-standards-deprecated/GIT-CONVENTIONS.md
rm /home/isem/workspace-v1/projects/gamilit/docs/archivados/98-standards-deprecated/NAMING-CONVENTIONS-API.md
```

**Total archivos a eliminar (Fase 2):** 16 archivos
**Total archivos a eliminar (Fase 1.2 duplicados):** +2 archivos
**TOTAL GENERAL:** 18 archivos
**Espacio estimado liberado:** ~215 KB

---

### 2.2 Archivos a CONSERVAR (NO eliminar)

Los siguientes archivos en `/archivados/` deben **CONSERVARSE** por su valor de auditoría:

| Carpeta | Archivo | Razón |
|---------|---------|-------|
| historicos-2025/correcciones/ | CORRECCIONES-ADMIN-PORTAL-2025-12-26.md | Auditoría reciente |
| historicos-2025/correcciones/ | CORRECCIONES-AUDITORIA-DATABASE-2025-12-26.md | Auditoría BD |
| historicos-2025/reportes-analisis/ | Todos los 11 archivos | Serie de validación completa |
| historicos-2025/trazas/ | TRACE-GAP-002.md, TRACE-GAP-008.md | Referencias activas en ADR-027 |
| database-original/ | README.md, TABLAS-NUEVAS-2025-12.md | Meta-documentación |
| settings-historicos/ | Todos los 3 archivos | Auditoría reciente |
| raíz archivados/ | Todos los 4 archivos PLAN-*.md | Planes de trabajo vigentes |

---

## FASE 3: ACTUALIZACIÓN DE MAPAS (_MAP.md)

### 3.1 Actualizar /docs/_MAP.md

**Cambios requeridos:**

1. **Agregar carpetas faltantes:**
```markdown
+-- 99-troubleshooting/  # Guías de resolución de problemas
+-- audits/              # Reportes de auditoría
+-- planning/            # Planificación y tracking
```

2. **Actualizar métricas:**
```markdown
- ADRs: 20 → 21
- Cheatsheets: 6 → 8
```

3. **Actualizar fecha:**
```markdown
Última actualización: 2026-01-07
```

---

### 3.2 Actualizar /docs/90-transversal/_MAP.md

**Cambios requeridos:**

1. **Actualizar fecha de documento** (de 2025-12-18 a 2026-01-07)

2. **Resolver referencia a ISSUES-CRITICOS.md:**
   - Si archivo existe: Mantener referencia
   - Si no existe: Eliminar de tabla o marcar como PENDIENTE

3. **Agregar carpetas no documentadas:**
```markdown
| analisis/ | Análisis técnicos en curso |
| ssot/ | Single Source of Truth |
| migraciones/ | Documentación de migraciones |
| metricas/ | Métricas del proyecto |
| sistema-recompensas/ | Sistema de recompensas |
| templates/ | Templates de documentación |
```

---

### 3.3 Actualizar /orchestration/_MAP.md

**Cambios requeridos:**

1. **Agregar sección de carpetas de análisis especializadas:**
```markdown
### Análisis Especializados (2025-12)

| Carpeta | Propósito | Estado |
|---------|-----------|--------|
| analisis-admin-portal-2025-12-23/ | Análisis portal admin | Completado |
| analisis-backend-2025-12-18/ | Análisis backend | Completado |
| analisis-database-2025-12-26/ | Análisis BD | Completado |
| analisis-documentacion-vs-desarrollo-2025-12-23/ | Comparación doc vs código | Completado |
| analisis-errores-prod-2025-12-18/ | Análisis errores producción | PENDIENTE EJECUCIÓN |
| analisis-frontend-validacion/ | Validación frontend | Completado |
| analisis-homologacion-database-2025-12-18/ | Homologación BD | PENDIENTE (11 scripts) |
| analisis-modulos-3-4-5/ | Análisis M3-M4-M5 | Completado |
| analisis-produccion-2025-12-18/ | Requerimientos producción | LISTO PARA DEPLOY |
| analisis-teacher-portal-2025-12-18/ | Análisis portal teacher | Completado |
```

---

## FASE 4: CONSOLIDACIÓN DE REPORTES HISTÓRICOS

### 4.1 Consolidar reportes/historicos/2025-11/

**Acción:** Crear índice consolidado

```bash
# Crear índice
cat > /home/isem/workspace-v1/projects/gamilit/orchestration/reportes/historicos/INDEX-2025-11.md << 'EOF'
# Índice de Reportes Históricos - Noviembre 2025

**Período:** 2025-11-08 a 2025-11-29
**Total archivos:** 76
**Tamaño:** 1.5 MB

## Contenido por Categoría

### Validación de Portales
- INFORME-ALCANCE-Y-VALIDACION-PORTALES-2025-11-24.md
- [lista completa...]

### Análisis de Coherencia
- REPORTE-CONSOLIDADO-COHERENCIA-3-CAPAS-2025-11-24.md
- [lista completa...]

### Correcciones P0
- [lista...]

## Estado
Todos los reportes de esta carpeta son **HISTÓRICOS** de la fase de homologación
de noviembre 2025. Se conservan para auditoría y referencia.

---
*Generado: 2026-01-07*
EOF
```

**No eliminar archivos**, solo agregar índice para navegación.

---

### 4.2 Crear resumen de deudas técnicas de migración

**Acción:** Extraer insights de `reportes/historicos-migracion/`

```bash
# Crear documento consolidado
cat > /home/isem/workspace-v1/projects/gamilit/orchestration/reportes/DEUDAS-TECNICAS-MIGRACION-2025-11.md << 'EOF'
# Deudas Técnicas Identificadas en Migración (Nov 2025)

**Fuente:** /orchestration/reportes/historicos-migracion/
**Fecha original:** 2025-11-02 a 2025-11-04

## Resumen Ejecutivo

Coherencia detectada: **82%** (mejorado desde 69%)

## Gaps Críticos Identificados (P0)

| Área | Completitud | Estado Actual |
|------|-------------|---------------|
| Dependencias | 18% | PENDIENTE VERIFICACIÓN |
| Estructura directorios | 14.5% | PENDIENTE VERIFICACIÓN |
| Componentes React | 2.7% | PENDIENTE VERIFICACIÓN |
| Hooks & Context | 18% | PENDIENTE VERIFICACIÓN |
| Servicios API | 4% | PENDIENTE VERIFICACIÓN |

## Próximos Pasos
1. Verificar estado actual de cada gap
2. Actualizar métricas
3. Priorizar correcciones pendientes

---
*Generado: 2026-01-07*
EOF
```

---

### 4.3 Crear índice para ciclos-database

```bash
cat > /home/isem/workspace-v1/projects/gamilit/orchestration/reportes/ciclos-database/INDEX-CICLOS.md << 'EOF'
# Índice de Ciclos de Implementación de Base de Datos

**Período:** Noviembre 2025
**Estado:** COMPLETADO - BD en Producción

## Ciclos Documentados

| Ciclo | Prioridad | Contenido | Estado |
|-------|-----------|-----------|--------|
| CICLO-04 | P0 | 43/44 objetos críticos | ✅ Completado |
| CICLO-05 | P1 | Objetos media prioridad | ✅ Completado |
| CICLO-06 | P2 | Objetos baja prioridad | ✅ Completado |
| CICLO-07 | P3 | Objetos mínima prioridad | ✅ Completado |
| CICLO-08 | - | Validación final | ✅ Completado |
| CICLO-09 | - | Correcciones post-validación | ✅ Completado |

## Uso
Estos ciclos documentan la implementación completa de schemas y objetos de BD.
Referencia para auditoría y rollback si es necesario.

---
*Generado: 2026-01-07*
EOF
```

---

## FASE 5: VALIDACIÓN Y VERIFICACIÓN

### 5.1 Checklist de Validación Pre-Ejecución

- [ ] Backup de archivos a eliminar (opcional pero recomendado)
- [ ] Verificar que ningún archivo a eliminar tiene referencias activas
- [ ] Confirmar estado de ISSUES-CRITICOS.md
- [ ] Revisar rutas de destino para archivos a mover

### 5.2 Checklist de Validación Post-Ejecución

- [ ] Todos los archivos eliminados ya no existen
- [ ] Archivos movidos están en ubicación correcta
- [ ] _MAP.md actualizados con fecha 2026-01-07
- [ ] Sin errores de referencias rotas en documentación
- [ ] Índices consolidados creados correctamente

---

## MATRIZ DE DEPENDENCIAS

### Archivos que dependen de otros

| Archivo | Depende de | Acción si se elimina dependencia |
|---------|------------|----------------------------------|
| /95-guias-desarrollo/student-portal/README.md | TRACE-GAP-002.md, TRACE-GAP-008.md | Actualizar referencias a nueva ubicación |
| /97-adr/ADR-027-missions-triggers-mapping.md | TRACE-GAP-002 | Referencia histórica, mantener |

### Referencias cruzadas entre _MAP.md

| Mapa | Referencias a | Estado |
|------|---------------|--------|
| docs/_MAP.md | orchestration/_MAP.md | Implícita |
| orchestration/_MAP.md | docs/_MAP.md | Explícita |
| 90-transversal/_MAP.md | docs/_MAP.md | Implícita |

---

## RESUMEN DE ACCIONES POR PRIORIDAD (ACTUALIZADO v2.0)

### P0 - CRÍTICO (Hacer primero)
1. [x] ~~Resolver estado de ISSUES-CRITICOS.md~~ ✅ Ya resuelto (archivado correctamente)
2. [x] ~~Mover 2 archivos vigentes de /archivados/ a docs activos~~ ✅ Ya en destino

### P1 - IMPORTANTE (Hacer esta semana)
1. [ ] Eliminar 18 archivos obsoletos/duplicados de /docs/archivados/
2. [ ] Actualizar referencias ISSUES-CRITICOS en `/docs/90-transversal/_MAP.md`
3. [ ] Actualizar 3 _MAP.md principales con fechas y carpetas faltantes
4. [ ] Documentar 10 carpetas de análisis en orchestration/_MAP.md

### P2 - MEJORA (Hacer próxima semana)
1. [ ] Crear índices para reportes históricos
2. [ ] Crear documento de deudas técnicas consolidado
3. [ ] Crear índice de ciclos-database
4. [ ] Limpiar carpetas vacías resultantes

---

## NOTAS IMPORTANTES

### Archivos que NO se deben eliminar

Las siguientes carpetas en `/orchestration/` contienen trabajo **COMPLETADO PERO CON ACCIONES PENDIENTES**:

1. **analisis-errores-prod-2025-12-18/** - Errores en producción SIN CORREGIR
2. **analisis-homologacion-database-2025-12-18/** - 11 scripts pendientes de migrar
3. **analisis-produccion-2025-12-18/** - Requerimientos de producción LISTO PARA DEPLOY

Estas carpetas NO son obsoletas y NO deben eliminarse.

### Política de Retención

- **Reportes históricos:** Conservar mínimo 12 meses
- **Análisis completados:** Mover a `/reportes/` después de ejecutar acciones pendientes
- **Archivos de auditoría:** Conservar indefinidamente

---

## APROBACIÓN

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Autor | Claude Code | 2026-01-07 | ✅ |
| Revisor | Pendiente | | |
| Aprobador | Pendiente | | |

---

*Documento generado automáticamente basado en análisis de Fase 1 y 2*
*Requiere revisión humana antes de ejecución*
