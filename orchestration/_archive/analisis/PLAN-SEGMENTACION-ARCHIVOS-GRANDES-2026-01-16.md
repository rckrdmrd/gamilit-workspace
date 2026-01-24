# PLAN: Segmentación de Archivos Grandes
# ============================================================================

**Fecha:** 2026-01-16
**Prioridad:** P0 - CRÍTICO
**Estimación:** 2-3 horas de implementación

---

## OBJETIVO

Segmentar archivos de documentación mayores a 30KB en archivos más pequeños y manejables, siguiendo el principio de "archivos cortos y específicos para mejor contexto de agentes".

---

## ARCHIVOS A SEGMENTAR

### 1. TRAZA-TAREAS-DATABASE.md (302KB → ~16 archivos de ~20KB)

**Estructura Propuesta:**

```
orchestration/trazas/database/
├── _INDEX.yml                              # Índice con referencias
├── schema-auth-management.md               # ~15KB
├── schema-gamification-system.md           # ~20KB
├── schema-educational-content.md           # ~25KB
├── schema-progress-tracking.md             # ~20KB
├── schema-social-features.md               # ~15KB
├── schema-admin-dashboard.md               # ~15KB
├── schema-notifications.md                 # ~10KB
├── schema-communication.md                 # ~10KB
├── schema-storage.md                       # ~10KB
├── schema-lti-integration.md               # ~10KB
├── schema-system-configuration.md          # ~15KB
├── schema-audit-logging.md                 # ~10KB
├── schema-content-management.md            # ~15KB
├── schema-public.md                        # ~20KB
├── schema-gamilit.md                       # ~10KB
└── TAREAS-ACTIVAS.md                       # Solo tareas en progreso (<2KB)
```

**Criterio de Segmentación:** Por schema de base de datos (16 schemas documentados)

### 2. INVENTORY-FRONTEND-SRC.yml (211KB → ~10 archivos)

**Estructura Propuesta:**

```
orchestration/inventarios/frontend/
├── _INDEX.yml                              # Índice consolidado
├── student-portal.yml                      # ~25KB
├── teacher-portal.yml                      # ~25KB
├── admin-portal.yml                        # ~30KB
├── shared-components.yml                   # ~30KB
├── features-gamification.yml               # ~25KB
├── features-educational.yml                # ~20KB
├── stores-and-hooks.yml                    # ~20KB
├── services-api.yml                        # ~15KB
├── types-and-interfaces.yml                # ~15KB
└── routes-and-layouts.yml                  # ~10KB
```

**Criterio de Segmentación:** Por feature/portal

### 3. TRAZA-TAREAS-FRONTEND.md (180KB → ~5 archivos)

**Estructura Propuesta:**

```
orchestration/trazas/frontend/
├── _INDEX.yml                              # Índice con referencias
├── portal-student.md                       # ~40KB
├── portal-teacher.md                       # ~40KB
├── portal-admin.md                         # ~40KB
├── shared-components.md                    # ~30KB
└── TAREAS-ACTIVAS.md                       # Solo tareas en progreso (<2KB)
```

**Criterio de Segmentación:** Por portal

### 4. TRAZA-ANALISIS-ARQUITECTURA.md (140KB → ~6 archivos)

**Estructura Propuesta:**

```
orchestration/trazas/arquitectura/
├── _INDEX.yml                              # Índice con referencias
├── capa-database.md                        # ~25KB
├── capa-backend.md                         # ~30KB
├── capa-frontend.md                        # ~30KB
├── integraciones.md                        # ~25KB
├── decisiones-arquitecturales.md           # ~20KB
└── ANALISIS-ACTIVO.md                      # Solo análisis en curso (<5KB)
```

**Criterio de Segmentación:** Por capa arquitectónica

---

## FORMATO DE _INDEX.yml

Cada carpeta segmentada tendrá un índice con el siguiente formato:

```yaml
# _INDEX.yml
version: "1.0.0"
updated: "2026-01-16"
description: "Índice de trazas de database segmentadas por schema"

total_archivos: 16
total_lineas_originales: 8003
reduccion_promedio: "~500 líneas por archivo"

archivos:
  - nombre: "schema-auth-management.md"
    schema: "auth_management"
    tablas: 12
    funciones: 6
    triggers: 6
    ultima_actualizacion: "2026-01-16"

  - nombre: "schema-gamification-system.md"
    schema: "gamification_system"
    tablas: 19
    funciones: 20
    triggers: 7
    ultima_actualizacion: "2026-01-16"

  # ... más archivos

referencias_cruzadas:
  - archivo: "schema-auth-management.md"
    relacionado_con:
      - "schema-progress-tracking.md (profiles FK)"
      - "schema-gamification-system.md (user_stats)"

busqueda_rapida:
  tablas:
    profiles: "schema-auth-management.md"
    achievements: "schema-gamification-system.md"
    exercises: "schema-educational-content.md"
  funciones:
    initialize_user_stats: "schema-gamification-system.md"
    calculate_xp: "schema-gamification-system.md"
```

---

## PROCESO DE MIGRACIÓN

### Paso 1: Crear Estructura de Carpetas

```bash
mkdir -p orchestration/trazas/database
mkdir -p orchestration/trazas/frontend
mkdir -p orchestration/trazas/arquitectura
mkdir -p orchestration/inventarios/frontend
```

### Paso 2: Segmentar Archivos

Para cada archivo grande:
1. Leer contenido completo
2. Identificar secciones por criterio (schema, portal, capa)
3. Extraer cada sección a archivo independiente
4. Crear _INDEX.yml con referencias cruzadas
5. Validar que todo el contenido fue migrado

### Paso 3: Crear Archivo de Tareas Activas

Cada carpeta tendrá un archivo pequeño `TAREAS-ACTIVAS.md` que:
- Solo contiene tareas en progreso actual
- Máximo 50 líneas
- Se actualiza frecuentemente
- Referencia archivos detallados para historial

### Paso 4: Archivar Originales

```bash
mkdir -p orchestration/trazas/.archived-originals
mv orchestration/trazas/TRAZA-TAREAS-DATABASE.md orchestration/trazas/.archived-originals/
mv orchestration/trazas/TRAZA-TAREAS-FRONTEND.md orchestration/trazas/.archived-originals/
mv orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md orchestration/trazas/.archived-originals/
mv INVENTORY-FRONTEND-SRC.yml orchestration/inventarios/.archived-originals/
```

### Paso 5: Actualizar Referencias

Archivos que referencian los originales:
- `orchestration/CONTEXT-MAP.yml` → Actualizar aliases
- `orchestration/inventarios/MASTER_INVENTORY.yml` → Actualizar referencias
- `orchestration/_MAP.md` → Actualizar estructura
- `.claude/agents/*.md` → Actualizar rutas

---

## VALIDACIÓN POST-MIGRACIÓN

| Criterio | Método de Validación |
|----------|---------------------|
| Contenido completo | `wc -l` original vs suma de segmentos |
| Referencias válidas | Grep de rutas en todo el proyecto |
| Índices correctos | Verificar que cada _INDEX.yml lista todos los archivos |
| Aliases actualizados | Ejecutar agente NEXUS y verificar carga |

---

## BENEFICIOS ESPERADOS

| Métrica | Antes | Después |
|---------|-------|---------|
| Archivo más grande | 302KB | ~30KB |
| Tiempo carga contexto | Alto | Reducido 80% |
| Actualizaciones atómicas | Difícil | Fácil |
| Búsqueda específica | Lenta | Rápida |
| Mantenibilidad | Baja | Alta |

---

## CRONOGRAMA

| Día | Tarea |
|-----|-------|
| 1 | Crear estructura + Segmentar TRAZA-TAREAS-DATABASE.md |
| 2 | Segmentar INVENTORY-FRONTEND-SRC.yml + TRAZA-TAREAS-FRONTEND.md |
| 3 | Segmentar TRAZA-ANALISIS-ARQUITECTURA.md + Actualizar referencias |
| 4 | Validación + Documentación |

---

*Plan creado por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Fecha: 2026-01-16*
