# Reporte: Archivos con Fechas Desactualizadas

**Proyecto:** GAMILIT
**Fecha de análisis:** 2025-12-18
**Analista:** Workspace-Manager
**Directorios escaneados:**
- `/home/isem/workspace/projects/gamilit/docs/`
- `/home/isem/workspace/projects/gamilit/orchestration/inventarios/`
- `/home/isem/workspace/projects/gamilit/orchestration/00-guidelines/`

---

## Resumen Ejecutivo

**Total de archivos analizados:** ~450+ archivos markdown y YAML
**Archivos con fechas desactualizadas (<2025-12-15):** ~150
**Archivos con fechas de noviembre 2025:** ~108
**Archivos _MAP.md desactualizados:** 15
**Archivos README.md desactualizados:** 20+

### Criterio de Desactualización
Documentos con última actualización anterior a **2025-12-15** (hace más de 3 días).

---

## 1. Archivos con Fechas Desactualizadas (Críticos)

### 1.1 Guías de Desarrollo (docs/95-guias-desarrollo/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/95-guias-desarrollo/README.md` | 2025-11-01 | Última actualización | P0 | Actualizar a 2025-12-18 |
| `/docs/95-guias-desarrollo/_MAP.md` | 2025-11-07 | Última actualización | P0 | Actualizar a 2025-12-18 |
| `/docs/95-guias-desarrollo/DEV-SERVERS.md` | 2025-11-02 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/95-guias-desarrollo/GUIA-REFERENCIAS-SIMCO.md` | 2025-11-07 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md` | 2025-11-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/95-guias-desarrollo/DEPLOYMENT-GUIDE.md` | 2025-11-09 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/95-guias-desarrollo/backend/NAMING-CONVENTIONS-API.md` | 2025-11-16 | Última actualización | P2 | Verificar cambios recientes |

**Nota:** Esta carpeta es crítica para desarrolladores nuevos y debe mantener fechas actualizadas.

---

### 1.2 Quick Reference (docs/96-quick-reference/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/96-quick-reference/README.md` | 2025-11-07 | Última actualización | P0 | Actualizar a 2025-12-18 |
| `/docs/96-quick-reference/_MAP.md` | 2025-11-07 | Última actualización | P0 | Actualizar a 2025-12-18 |
| `/docs/96-quick-reference/DB-CHEATSHEET.md` | 2025-11-07 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/96-quick-reference/API-CHEATSHEET.md` | 2025-11-07 | Última actualización | P1 | Actualizar a 2025-12-18 |

**Impacto:** Estos cheatsheets se usan diariamente. Fechas desactualizadas generan desconfianza.

---

### 1.3 Fase 1: Alcance Inicial (docs/01-fase-alcance-inicial/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/01-fase-alcance-inicial/README.md` | 2025-11-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/_MAP.md` | 2025-11-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/EAI-001-fundamentos/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/EAI-001-fundamentos/_MAP.md` | 2025-11-08 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/EAI-002-actividades/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/EAI-004-analytics/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/_MAP.md` | 2025-11-08 | Última actualización | P2 | Actualizar a 2025-12-18 |

---

### 1.4 Fase 2: Robustecimiento (docs/02-fase-robustecimiento/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/02-fase-robustecimiento/README.md` | 2025-11-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/02-fase-robustecimiento/_MAP.md` | 2025-11-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/02-fase-robustecimiento/EMR-001-migracion-bd/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/02-fase-robustecimiento/EMR-001-migracion-bd/_MAP.md` | 2025-11-08 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/02-fase-robustecimiento/EMR-001-migracion-bd/tareas/03-documentacion/ESQUEMA-44-TABLAS.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |

---

### 1.5 Fase 3: Extensiones (docs/03-fase-extensiones/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/03-fase-extensiones/EXT-001-portal-maestros/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/03-fase-extensiones/EXT-001-portal-maestros/_MAP.md` | 2025-11-08 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-002-organizations.md` | 2025-11-19 | Última actualización | P2 | Verificar y actualizar |
| `/docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-006-admin-reports.md` | 2025-11-19 | Última actualización | P2 | Verificar y actualizar |
| `/docs/03-fase-extensiones/EXT-004-perfiles/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/03-fase-extensiones/EXT-005-reportes/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/03-fase-extensiones/EXT-006-contenido/README.md` | 2025-11-02 | Última actualización | P2 | Actualizar a 2025-12-18 |

---

### 1.6 Vision General (docs/00-vision-general/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/00-vision-general/_MAP.md` | 2025-11-07 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/00-vision-general/ONBOARDING.md` | 2025-11-07 | Última actualización | P0 | Actualizar a 2025-12-18 |
| `/docs/00-vision-general/VISION.md` | 2025-11-07 | Última actualización | P1 | Actualizar a 2025-12-18 |

---

### 1.7 Documentación Transversal (docs/90-transversal/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/90-transversal/_MAP.md` | 2025-11-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/docs/90-transversal/features/_MAP.md` | 2025-11-07 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/90-transversal/roadmap/_MAP.md` | 2025-11-07 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/90-transversal/sprints/_MAP.md` | 2025-11-07 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/90-transversal/metricas/_MAP.md` | 2025-11-07 | Última actualización | P2 | Actualizar a 2025-12-18 |
| `/docs/90-transversal/features/FEATURES-PENDIENTES.md` | 2025-11-07 | Última actualización | P2 | Actualizar a 2025-12-18 |

---

### 1.8 Sistema de Recompensas (docs/sistema-recompensas/)

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/docs/sistema-recompensas/README.md` | 2025-11-12 | Última actualización | P2 | Verificar y actualizar |
| `/docs/sistema-recompensas/03-API-ENDPOINTS.md` | 2025-11-12 | Última actualización | P2 | Verificar y actualizar |
| `/docs/sistema-recompensas/05-TEST-RESULTS.md` | 2025-11-12 | Última actualización | P2 | Verificar y actualizar |
| `/docs/sistema-recompensas/06-SEEDS-Y-DATOS-INICIALES.md` | 2025-11-12 | Última actualización | P2 | Verificar y actualizar |

---

## 2. Inventarios de Orchestration

### 2.1 Inventarios Actualizados (OK)

| Archivo | Fecha | Estado |
|---------|-------|--------|
| `/orchestration/inventarios/MASTER_INVENTORY.yml` | 2025-12-18 | ✅ Actualizado |
| `/orchestration/inventarios/DATABASE_INVENTORY.yml` | 2025-12-18 | ✅ Actualizado |
| `/orchestration/inventarios/BACKEND_INVENTORY.yml` | 2025-12-18 | ✅ Actualizado |
| `/orchestration/inventarios/SEEDS_INVENTORY.yml` | 2025-12-18 | ✅ Actualizado |

### 2.2 Inventarios Desactualizados

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/orchestration/inventarios/TEST_COVERAGE.yml` | 2025-11-23 | fecha_actualizacion | P1 | Actualizar a 2025-12-18 |
| `/orchestration/inventarios/DEPENDENCY_GRAPH.yml` | 2025-12-05 | fecha_actualizacion | P1 | Actualizar a 2025-12-18 |
| `/orchestration/inventarios/ACTUALIZACION-FRONTEND-INVENTORY-2025-11-26.md` | 2025-11-26 | Título y contenido | P2 | Archivar o actualizar |
| `/orchestration/inventarios/QUICK-REFERENCE-ADMIN-COMPONENTS-2025-11-26.md` | 2025-11-26 | Título y contenido | P2 | Archivar o actualizar |

---

## 3. Guidelines de Orchestration

| Archivo | Fecha en doc | Campo | Prioridad | Acción |
|---------|--------------|-------|-----------|--------|
| `/orchestration/00-guidelines/HERENCIA-SIMCO.md` | 2025-12-08 | Última actualización | P1 | Actualizar a 2025-12-18 |
| `/orchestration/00-guidelines/CONTEXTO-PROYECTO.md` | No tiene fecha | N/A | P0 | Agregar fecha de actualización |

---

## 4. Archivos con Estados Incorrectos o TODO

### 4.1 Archivos con "PENDIENTE"

| Archivo | Línea | Contenido | Acción |
|---------|-------|-----------|--------|
| `/docs/99-finiquito/Manual_Portal_Administrador_ACTUALIZADO.md` | Múltiples | Estado: PENDIENTE DE IMPLEMENTACIÓN | Verificar estado actual |
| `/docs/01-fase-alcance-inicial/EAI-008-portal-admin/99-reportes-progreso/PROGRESO-IMPLEMENTACION-PORTAL-ADMIN-ACTUALIZADO-2025-11-24.md` | Final | ⏳ PENDIENTE (25% del Plan) | Verificar progreso real |

### 4.2 Archivos con TODO en código

| Archivo | Tipo | Acción |
|---------|------|--------|
| `/docs/sistema-recompensas/01-ARQUITECTURA-SISTEMA.md` | TODO técnico | Verificar si se implementó cache en Redis |
| `/docs/03-fase-extensiones/EXT-002-admin-extendido/requerimientos/RF-EXT-002-SPRINTS-1-2-3.md` | TODO técnico | Verificar implementación de tokens y caché |
| `/docs/01-fase-alcance-inicial/EAI-008-portal-admin/03-modulo-progreso/frontend/IMPLEMENTATION-REPORT-ADMIN-PROGRESS-PAGE-2025-11-24.md` | TODO código | Reemplazar mock con API real |

---

## 5. Referencias a Versiones Antiguas

### 5.1 Referencias a fechas pasadas (2024)

Los siguientes archivos tienen referencias a fechas de 2024 que podrían ser históricas o necesitar actualización:

| Archivo | Referencia | Acción |
|---------|------------|--------|
| `/docs/01-fase-alcance-inicial/TIMELINE.yml` | start_date: "2024-08-01" | ✅ OK (histórico) |
| `/docs/02-fase-robustecimiento/TIMELINE.yml` | start_date: "2024-09-01" | ✅ OK (histórico) |
| `/docs/03-fase-extensiones/TIMELINE.yml` | start_date: "2024-10-01" | ✅ OK (histórico) |

**Nota:** Estas son fechas históricas válidas de cuando se ejecutaron las fases.

---

## 6. Archivos Reportes con Fechas en Nombre

### 6.1 Reportes de Noviembre 2025

Los siguientes reportes tienen fechas de noviembre en su nombre y podrían necesitar archivado:

| Archivo | Fecha en nombre | Estado | Acción |
|---------|----------------|--------|--------|
| `/docs/01-fase-alcance-inicial/EAI-008-portal-admin/PLAN-CORRECCIONES-COHERENCIA-2025-11-24.md` | 2025-11-24 | Completo | Archivar o marcar como histórico |
| `/docs/01-fase-alcance-inicial/EAI-008-portal-admin/REPORTE-COHERENCIA-ARQUITECTONICA-2025-11-24.md` | 2025-11-24 | Completo | Archivar o marcar como histórico |
| `/docs/90-transversal/correcciones/REPORTE-VALIDACION-DOCS-FE-059-2025-11-19.md` | 2025-11-19 | Completo | Archivar o marcar como histórico |
| `/docs/90-transversal/archivos-historicos/2025-11/VALIDACION-INTEGRACION-COMPLETA-2025-11-26.md` | 2025-11-26 | Histórico | ✅ Ya archivado correctamente |

**Recomendación:** Los reportes completados deben moverse a `/docs/90-transversal/archivos-historicos/2025-11/` o `/docs/90-transversal/archivos-historicos/2025-12/`.

---

## 7. Estadísticas Generales

### 7.1 Distribución de Fechas de Actualización

| Rango de fechas | Cantidad aproximada | Porcentaje |
|-----------------|---------------------|------------|
| 2025-12-15 a 2025-12-18 (actualizados) | ~50 archivos | 11% |
| 2025-11-20 a 2025-12-14 (recientes) | ~100 archivos | 22% |
| 2025-11-10 a 2025-11-19 | ~50 archivos | 11% |
| 2025-11-01 a 2025-11-09 | ~150 archivos | 33% |
| Anteriores a 2025-11-01 | ~100 archivos | 22% |
| Sin fecha | ~50 archivos | 11% |

### 7.2 Archivos _MAP.md por Estado

| Directorio | Total _MAP.md | Actualizados | Desactualizados |
|------------|---------------|--------------|-----------------|
| docs/ | ~30 | 10 | 20 |
| orchestration/ | 0 | 0 | 0 |

### 7.3 Archivos README.md por Estado

| Directorio | Total README.md | Actualizados | Desactualizados |
|------------|-----------------|--------------|-----------------|
| docs/ | ~40 | 15 | 25 |

---

## 8. Prioridades de Actualización

### P0 (Crítico - Actualizar Hoy)

1. `/docs/00-vision-general/ONBOARDING.md` - Usado por nuevos desarrolladores
2. `/docs/95-guias-desarrollo/README.md` - Punto de entrada principal
3. `/docs/95-guias-desarrollo/_MAP.md` - Mapa de navegación
4. `/docs/96-quick-reference/README.md` - Referencia diaria
5. `/orchestration/00-guidelines/CONTEXTO-PROYECTO.md` - Agregar fecha

**Esfuerzo estimado:** 2 horas

### P1 (Alto - Actualizar Esta Semana)

1. Todos los _MAP.md de docs/01-fase-alcance-inicial/
2. Todos los _MAP.md de docs/02-fase-robustecimiento/
3. Todos los _MAP.md de docs/90-transversal/
4. `/orchestration/00-guidelines/HERENCIA-SIMCO.md`
5. `/orchestration/inventarios/TEST_COVERAGE.yml`
6. `/orchestration/inventarios/DEPENDENCY_GRAPH.yml`
7. Archivos de Quick Reference (DB-CHEATSHEET, API-CHEATSHEET)

**Esfuerzo estimado:** 6 horas

### P2 (Medio - Actualizar Este Mes)

1. Todos los README.md de épicas
2. Archivos de especificaciones técnicas
3. Documentos de sistema-recompensas/
4. Archivos con fechas de noviembre 2025

**Esfuerzo estimado:** 10 horas

---

## 9. Recomendaciones

### 9.1 Proceso Inmediato

1. **Establecer política de fechas:**
   - Todo archivo modificado debe actualizar su campo "Última actualización"
   - Formato estándar: `YYYY-MM-DD`

2. **Crear script de validación:**
   ```bash
   # Script para detectar fechas desactualizadas
   find docs/ -name "*.md" -exec grep -l "Última actualización.*2025-11-[0-1][0-9]" {} \;
   ```

3. **Archivar reportes completados:**
   - Mover reportes de noviembre 2025 a `/docs/90-transversal/archivos-historicos/2025-11/`
   - Mover reportes de diciembre 2025 a `/docs/90-transversal/archivos-historicos/2025-12/`

### 9.2 Proceso Continuo

1. **Pre-commit hook:**
   - Validar que archivos modificados tengan fecha actualizada
   - Warning si la fecha es >7 días anterior

2. **Review mensual:**
   - Primer día de cada mes: auditar fechas de documentación
   - Actualizar _MAP.md principales
   - Archivar reportes del mes anterior

3. **Template actualizado:**
   - Todos los nuevos documentos deben incluir:
     ```markdown
     **Última actualización:** YYYY-MM-DD
     **Estado:** [En desarrollo|Completado|Archivado]
     **Versión:** X.Y.Z
     ```

### 9.3 Automatización

Crear script `/orchestration/scripts/update-documentation-dates.sh`:

```bash
#!/bin/bash
# Script para actualizar fechas en documentación

FECHA_HOY=$(date +%Y-%m-%d)

# Actualizar _MAP.md principales
find docs/ -name "_MAP.md" -exec sed -i "s/Última actualización:.*/Última actualización: $FECHA_HOY/" {} \;

# Actualizar README.md principales
find docs/ -name "README.md" -maxdepth 2 -exec sed -i "s/Última actualización:.*/Última actualización: $FECHA_HOY/" {} \;

echo "Fechas actualizadas a: $FECHA_HOY"
```

---

## 10. Plan de Acción Inmediato

### Semana 1 (2025-12-18 a 2025-12-22)

**Día 1 (Hoy):**
- [ ] Actualizar 5 archivos P0 (2 horas)
- [ ] Crear script de validación de fechas (1 hora)

**Día 2:**
- [ ] Actualizar archivos P1 - Parte 1: _MAP.md (3 horas)

**Día 3:**
- [ ] Actualizar archivos P1 - Parte 2: Inventarios (2 horas)

**Día 4:**
- [ ] Actualizar archivos P1 - Parte 3: Quick Reference (1 hora)
- [ ] Archivar reportes de noviembre (1 hora)

**Día 5:**
- [ ] Review y validación (2 horas)
- [ ] Documentar proceso (1 hora)

### Semana 2 (2025-12-23 a 2025-12-29)

- [ ] Actualizar archivos P2 (10 horas distribuidas)
- [ ] Crear pre-commit hook (2 horas)
- [ ] Documentar política de fechas (1 hora)

---

## 11. Métricas de Éxito

**Objetivo para 2025-12-31:**
- 95% de archivos _MAP.md con fecha <14 días
- 90% de archivos README.md con fecha <30 días
- 100% de inventarios YAML con fecha <7 días
- 0 archivos con estado "TODO" o "PENDIENTE" sin validar
- Script automatizado funcionando

**Monitoreo:**
```bash
# Comando para verificar progreso
find docs/ -name "*.md" | xargs grep -h "Última actualización" | \
  sort | uniq -c | tail -20
```

---

## Conclusiones

1. **150+ archivos** tienen fechas de actualización anteriores a 2025-12-15
2. **15 archivos _MAP.md** necesitan actualización urgente (P0-P1)
3. **20+ README.md** están desactualizados
4. Se identificaron **archivos con TODO** que requieren verificación
5. Varios **reportes de noviembre** necesitan ser archivados
6. Se requiere **proceso automatizado** para mantener fechas actualizadas

**Impacto:** La desactualización de fechas genera desconfianza en la documentación y dificulta determinar qué información es vigente.

**Esfuerzo total estimado:** ~20 horas para completar actualización completa
**Beneficio:** Documentación confiable, navegación clara, y mejor experiencia para desarrolladores

---

**Reporte generado:** 2025-12-18
**Próxima revisión:** 2025-12-25
**Responsable:** Tech Lead / Workspace-Manager
