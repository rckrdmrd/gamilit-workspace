# Criterios de Purga y Archivado - Auditoría GAMILIT

**Fecha:** 2026-01-10
**Propósito:** Definir qué documentación se elimina, archiva o mantiene vigente.

---

## 🎯 PRINCIPIOS GENERALES

### Regla de Oro
> "Solo una versión vigente. Todo lo demás es histórico o redundante."

### Categorías de Acción

| Categoría | Acción | Destino |
|-----------|--------|---------|
| **MANTENER** | Conservar sin cambios | Ubicación actual |
| **ACTUALIZAR** | Modificar contenido | Ubicación actual |
| **CONSOLIDAR** | Fusionar con otro archivo | Archivo destino |
| **ARCHIVAR** | Mover a históricos | `docs/archivados/` |
| **ELIMINAR** | Borrar permanentemente | N/A |

---

## 📋 CRITERIOS POR TIPO DE ARCHIVO

### 1. Documentación de Requerimientos (US-*, RF-*)

| Condición | Acción |
|-----------|--------|
| Implementado y vigente | MANTENER |
| Implementado pero desactualizado | ACTUALIZAR |
| Duplicado en otra ubicación | ELIMINAR el duplicado, mantener en ubicación canónica |
| No implementado (backlog) | MANTENER en `04-fase-backlog/` |
| Descartado/cancelado | ARCHIVAR con nota de cancelación |

**Ubicación canónica:** `docs/01-fase-alcance-inicial/EAI-*/historias-usuario/`

### 2. Especificaciones Técnicas (ET-*)

| Condición | Acción |
|-----------|--------|
| Coincide con código actual | MANTENER |
| No coincide con código | ACTUALIZAR para reflejar código |
| Duplicado | CONSOLIDAR en ubicación canónica |
| Obsoleto (feature eliminada) | ARCHIVAR |

**Ubicación canónica:** `docs/01-fase-alcance-inicial/EAI-*/especificaciones/`

### 3. Trazas (TRAZA-*.md)

| Condición | Acción |
|-----------|--------|
| Activa y actualizada (<7 días) | MANTENER |
| Desactualizada (>7 días) | ACTUALIZAR |
| Vacía o solo cabecera | ELIMINAR o completar |
| Duplicada en archivados/ | ELIMINAR de archivados/ |
| Marcada DEPRECATED | ARCHIVAR |

**Ubicación canónica:** `orchestration/trazas/`

### 4. Estados (ESTADO-*.json)

| Condición | Acción |
|-----------|--------|
| Activo y actualizado (<24h) | MANTENER |
| Desactualizado (>24h) | ACTUALIZAR |
| Vacío | COMPLETAR o ELIMINAR |
| Sin agente asociado | ELIMINAR |

**Ubicación canónica:** `orchestration/estados/`

### 5. Inventarios (*.yml)

| Condición | Acción |
|-----------|--------|
| Actualizado vs código actual | MANTENER |
| Desactualizado | ACTUALIZAR |
| Duplicado en otra ubicación | ELIMINAR duplicado |
| Parcial (otra ubicación tiene más info) | CONSOLIDAR |

**Ubicación canónica:** `orchestration/inventarios/`

### 6. Reportes (REPORTE-*.md, ANALISIS-*.md)

| Condición | Acción |
|-----------|--------|
| <30 días y relevante | MANTENER |
| 30-90 días | EVALUAR relevancia, probablemente ARCHIVAR |
| >90 días | ARCHIVAR |
| Duplicado exacto | ELIMINAR duplicado |
| Resumido en otro reporte | ARCHIVAR original |

**Ubicación archivo:** `docs/archivados/historicos-{año}/reportes-analisis/`

### 7. Correcciones (CORR-*.md)

| Condición | Acción |
|-----------|--------|
| Corrección activa (en progreso) | MANTENER en `90-transversal/correcciones/` |
| Corrección completada (<30 días) | MANTENER temporalmente |
| Corrección completada (>30 días) | CONSOLIDAR en histórico resumido |
| Múltiples archivos por corrección | EVALUAR, posiblemente CONSOLIDAR |

**Ubicación canónica:** `docs/90-transversal/correcciones/`
**Ubicación archivo:** `docs/archivados/historicos-{año}/correcciones/`

### 8. Manuales de Usuario

| Condición | Acción |
|-----------|--------|
| Coincide con funcionalidad actual | MANTENER |
| No coincide | ACTUALIZAR |
| Versión anterior | ARCHIVAR |

**Ubicación canónica:** `docs/99-finiquito/`

### 9. _MAP.md y README.md

| Condición | Acción |
|-----------|--------|
| Refleja contenido actual de carpeta | MANTENER |
| No refleja contenido | ACTUALIZAR |
| Carpeta vacía | ELIMINAR carpeta y _MAP.md |
| Muy minimalista | EXPANDIR |

---

## 🚨 DUPLICIDADES ESPECÍFICAS IDENTIFICADAS

### Duplicidades Críticas (Acción Inmediata)

| Archivo | Ubicación 1 | Ubicación 2 | Acción |
|---------|-------------|-------------|--------|
| `US-AE-007-asignar-grupos-maestros.md` | `EXT-002-admin-extendido/historias-usuario/` | `90-transversal/restructuracion-v2/` | ELIMINAR de restructuracion-v2/, MANTENER en EXT-002 |

### Duplicidades de Trazas (Acción Media)

| Archivo | Ubicación Vigente | Ubicación Duplicada | Acción |
|---------|-------------------|---------------------|--------|
| `TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md` | `95-guias-desarrollo/student-portal/traces/` | `archivados/historicos-2025/trazas/` | ELIMINAR de archivados/ |
| `TRACE-P0-CORRECTIONS.md` | `95-guias-desarrollo/student-portal/traces/` | `archivados/historicos-2025/trazas/` | ELIMINAR de archivados/ |

### Duplicidades de Reportes (Acción Media)

| Archivo | Ubicación 1 | Ubicación 2 | Acción |
|---------|-------------|-------------|--------|
| `REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md` | `99-finiquito/` | `archivados/historicos-2025/reportes-analisis/` | ELIMINAR de archivados/ |
| `RESUMEN_CORRECCIONES_FINALES.md` | `99-finiquito/` | `archivados/historicos-2025/reportes-analisis/` | ELIMINAR de archivados/ |

---

## 📁 DIRECTORIOS VACÍOS

| Directorio | Acción | Justificación |
|------------|--------|---------------|
| `docs/planning/bugs/` | POBLAR o ELIMINAR | Si no se usa, eliminar |
| `docs/planning/tasks/` | POBLAR o ELIMINAR | Si no se usa, eliminar |

---

## 📊 POLÍTICA DE HISTÓRICO RESUMIDO

### Qué incluir en el histórico resumido

```markdown
# Histórico de Correcciones - GAMILIT

## Resumen Ejecutivo
- Total correcciones procesadas: X
- Período: [fecha inicio] a [fecha fin]
- Estado actual: Estable

## Correcciones por Categoría

### P0 (Críticas)
| ID | Descripción | Fecha Resolución | Módulos Afectados |
|----|-------------|------------------|-------------------|
| CORR-001 | [resumen] | YYYY-MM-DD | M1, M3 |

### P1 (Altas)
...

### P2 (Medias)
...

## Lecciones Aprendidas
- [lista de aprendizajes clave]

## Referencias Detalladas
- Reportes completos disponibles en: `docs/archivados/historicos-YYYY/`
```

### Qué NO incluir en el histórico resumido
- Análisis detallados paso a paso (mantener en archivados/)
- Logs de ejecución completos (mantener en archivados/)
- Archivos de validación intermedios (eliminar)

---

## ✅ CHECKLIST DE PURGA

### Pre-Purga
- [ ] Backup completo creado
- [ ] Lista de archivos a modificar revisada
- [ ] Dependencias identificadas

### Durante Purga
- [ ] Cada eliminación documentada en log
- [ ] Referencias actualizadas al eliminar
- [ ] _MAP.md actualizados al cambiar contenido

### Post-Purga
- [ ] Referencias cruzadas validadas
- [ ] _MAP.md coherentes con contenido
- [ ] Ningún enlace roto

---

**Versión:** 1.0
**Fecha:** 2026-01-10
**Estado:** PENDIENTE APROBACIÓN
