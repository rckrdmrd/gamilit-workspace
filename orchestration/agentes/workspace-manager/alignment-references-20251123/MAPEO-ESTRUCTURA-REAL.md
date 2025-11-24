# MAPEO - Estructura Real vs Referencias Incorrectas

**Fecha:** 2025-11-23
**Agente:** Workspace-Manager
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

---

## 🎯 PROPÓSITO

Este documento mapea la **estructura REAL del proyecto GAMILIT** vs las **referencias incorrectas** que coloqué en la primera corrección, para ahora corregirlas adecuadamente.

---

## 📊 ESTRUCTURA REAL DEL PROYECTO

### Raíz del Proyecto

```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/
├── apps/                        # Código fuente
│   ├── backend/                 # NestJS API
│   ├── frontend/                # React SPA
│   ├── database/                # PostgreSQL DDL
│   └── devops/                  # Scripts
├── docs/                        # Documentación (por FASES)
│   ├── 00-vision-general/       # Visión, onboarding, diseño
│   ├── 01-fase-alcance-inicial/ # Fase 1: EAI-001 a EAI-006
│   ├── 02-fase-robustecimiento/ # Fase 2: EMR-001
│   ├── 03-fase-extensiones/     # Fase 3: EXT-001 a EXT-010
│   ├── 04-fase-backlog/         # Fase 4: Backlog
│   ├── 90-transversal/          # Docs transversales
│   ├── 95-guias-desarrollo/     # Guías de desarrollo
│   ├── 96-quick-reference/      # Referencias rápidas
│   ├── 97-adr/                  # Architecture Decision Records
│   ├── 98-standards/            # Estándares
│   ├── adr/                     # ADRs (ubicación alternativa)
│   ├── database/                # Docs de BD
│   ├── sistema-recompensas/     # Implementación v2.3.0
│   └── README.md                # Índice principal
├── orchestration/               # Sistema de agentes IA
│   ├── directivas/
│   ├── prompts/
│   ├── trazas/
│   ├── inventarios/
│   ├── agentes/
│   ├── reportes/
│   └── scripts/
├── reference/                   # Código de referencia (versionado)
├── README.md                    # README principal
├── CHANGELOG.md                 # Historial de cambios
├── CONTRIBUTING.md              # Guía de contribución
└── _MAP.md                      # Mapa del workspace
```

---

## 🔴 REFERENCIAS INCORRECTAS vs ✅ REFERENCIAS CORRECTAS

### En PROMPT-REQUIREMENTS-ANALYST.md

| Referencia INCORRECTA que puse | Referencia CORRECTA |
|--------------------------------|---------------------|
| `docs/` (genérico) | `docs/` ✅ (correcto pero incompleto) |
| `docs/00-overview/` ❌ | `docs/00-vision-general/` |
| `docs/modulos/` ❌ NO EXISTE | `docs/01-fase-alcance-inicial/` y `docs/03-fase-extensiones/` |
| `docs/adr/` | `docs/97-adr/` o `docs/adr/` ✅ (ambas existen) |
| `docs/api/` ❌ NO EXISTE | `docs/90-transversal/` |
| `orchestration/trazas/TRAZA-REQUERIMIENTOS.md` | ✅ CORRECTO |

### Estructura de docs/modulos/ ASUMIDA vs REAL

**LO QUE ASUMÍ (INCORRECTO):**
```
docs/modulos/
├── 01-autenticacion.md
├── 02-gamificacion.md
├── 03-ejercicios.md
└── ...
```

**ESTRUCTURA REAL:**
```
docs/01-fase-alcance-inicial/
├── EAI-001-fundamentos/
├── EAI-002-actividades/
├── EAI-003-gamificacion/
├── EAI-004-analytics/
├── EAI-005-admin-base/
└── EAI-006-configuracion-sistema/

docs/03-fase-extensiones/
├── EXT-001-portal-maestros/
├── EXT-002-admin-extendido/
├── EXT-003-notificaciones/
├── EXT-004-perfiles/
├── EXT-005-reportes/
├── EXT-006-contenido/
├── EXT-007-lti-integration/
├── EXT-008-white-label/
├── EXT-009-peer-challenges/
└── EXT-010-parent-notifications/
```

**Cada épica tiene estructura:**
```
EAI-XXX-nombre/
├── requerimientos/
├── especificaciones/
├── implementacion/
├── pruebas/
├── historias-usuario/
└── README.md
```

---

## 📚 DOCUMENTOS MAESTROS REALES

### Documentación Principal

| Ubicación | Descripción | Contenido |
|-----------|-------------|-----------|
| `docs/README.md` | Índice maestro de documentación | Mapa de navegación por fases, presupuesto, SP |
| `docs/00-vision-general/VISION.md` | Visión del producto | Qué es GAMILIT, objetivos, modelo educativo |
| `docs/00-vision-general/ONBOARDING.md` | Onboarding desarrolladores | Setup, arquitectura, primeros pasos |
| `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` | Diseño de mecánicas | Diseño detallado del sistema de gamificación |
| `README.md` (raíz) | README principal | Descripción general, tecnologías, estructura |
| `_MAP.md` (raíz) | Mapa del workspace | Estructura de carpetas, propósitos |
| `CONTRIBUTING.md` | Guía de contribución | Cómo contribuir al proyecto |

### Documentación por Fase

| Fase | README | Contenido |
|------|--------|-----------|
| **Fase 1** | `docs/01-fase-alcance-inicial/README.md` | EAI-001 a EAI-006 (fundamentos) |
| **Fase 2** | `docs/02-fase-robustecimiento/README.md` | EMR-001 (migración BD) |
| **Fase 3** | `docs/03-fase-extensiones/README.md` | EXT-001 a EXT-010 (extensiones) |
| **Fase 4** | `docs/04-fase-backlog/README.md` | Backlog futuro |

### Trazabilidad

| Ubicación | Descripción |
|-----------|-------------|
| `orchestration/trazas/TRAZA-REQUERIMIENTOS.md` | Trazabilidad de requerimientos ✅ |
| `orchestration/inventarios/MASTER_INVENTORY.yml` | Inventario maestro ✅ |
| `orchestration/inventarios/DEPENDENCY_GRAPH.yml` | Grafo de dependencias ✅ |

---

## 🔢 MÓDULOS REALES (Épicas)

### Fase 1: Alcance Inicial (EAI) - 6 épicas ✅ 100%

```yaml
EAI-001: Fundamentos
  - Auth (multi-tenant)
  - Infraestructura base
  - RLS y seguridad

EAI-002: Actividades
  - 6 mecánicas de ejercicios
  - Sistema de auto-corrección
  - Tipos de ejercicio

EAI-003: Gamificación
  - Sistema XP y ML Coins
  - Rangos Maya (K'in → K'uhul Ajaw)
  - Recompensas automáticas

EAI-004: Analytics
  - Métricas básicas
  - Dashboards estudiante/profesor
  - Tracking de progreso

EAI-005: Admin Base
  - Panel de administración
  - Gestión de instituciones
  - CRUD básico

EAI-006: Configuración Sistema
  - Configuraciones globales
  - Feature flags
  - Parametrización
```

### Fase 3: Extensiones (EXT) - 10 épicas (6 completas, 4 parciales)

```yaml
# Completas ✅
EXT-001: Portal Maestros (100%)
EXT-002: Admin Extendido (100%)
EXT-003: Notificaciones (100%)
EXT-004: Perfiles Avanzados (100%)
EXT-005: Reportería (100%)
EXT-006: CMS Contenido (100%)

# Parciales 🟡
EXT-007: LTI Integration (40%)
EXT-008: White Label (30%)
EXT-009: Peer Challenges (50%)
EXT-010: Parent Notifications (35%)
```

---

## 🛠️ CORRECCIONES NECESARIAS

### 1. PROMPT-REQUIREMENTS-ANALYST.md

**Sección: DOCUMENTO MAESTRO (líneas 149-170)**

Cambiar:
```markdown
**Fuentes principales:**
- `docs/` - Documentación general del proyecto
- `README.md` - Descripción general y arquitectura
- `orchestration/trazas/TRAZA-REQUERIMIENTOS.md` - Trazabilidad de requerimientos

**Estructura de documentación GAMILIT:**
- docs/00-overview/: Visión general del sistema
- docs/modulos/: Módulos funcionales del MVP
- docs/adr/: Decisiones arquitectónicas (ADR)
- docs/api/: Especificaciones de API

**Módulos Core de GAMILIT (Prioridad P0):**
1. Autenticación y Multi-tenancy (Instituciones)
2. Gestión Académica (Cursos, Estudiantes, Profesores)
3. Sistema de Gamificación (Puntos, Niveles, Badges, Challenges)
4. Gestión de Ejercicios (Tipos, Variantes, Auto-corrección)
5. Tracking de Progreso (Estadísticas, Logros, Métricas)
6. Sistema de Guildas (Membresía, Competencias, Rankings)
7. Sistema de Recompensas (Inventario, Canje)
8. Notificaciones y Alertas
```

Por:
```markdown
**Fuentes principales:**
- `docs/README.md` - Índice maestro de documentación por fases
- `docs/00-vision-general/VISION.md` - Visión del producto
- `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` - Diseño de mecánicas
- `README.md` - README principal del proyecto
- `orchestration/trazas/TRAZA-REQUERIMIENTOS.md` - Trazabilidad de requerimientos

**Estructura de documentación GAMILIT (organizada por FASES):**
- docs/00-vision-general/: Visión, onboarding, diseño de mecánicas
- docs/01-fase-alcance-inicial/: Fase 1 - Fundamentos (EAI-001 a EAI-006)
- docs/02-fase-robustecimiento/: Fase 2 - Migración BD (EMR-001)
- docs/03-fase-extensiones/: Fase 3 - Extensiones (EXT-001 a EXT-010)
- docs/90-transversal/: Documentación transversal (features, inventarios, sprints)
- docs/97-adr/: Architecture Decision Records

**Épicas Fase 1 - Alcance Inicial (EAI) - Fundamentos:**
1. EAI-001: Fundamentos (Auth multi-tenant, infraestructura, RLS)
2. EAI-002: Actividades (6 mecánicas de ejercicios, auto-corrección)
3. EAI-003: Gamificación (XP, ML Coins, Rangos Maya)
4. EAI-004: Analytics (métricas básicas, dashboards)
5. EAI-005: Admin Base (panel administración, instituciones)
6. EAI-006: Configuración Sistema (configs globales, feature flags)

**Épicas Fase 3 - Extensiones (EXT) - Enterprise Features:**
1. EXT-001: Portal Maestros (dashboard completo) ✅
2. EXT-002: Admin Extendido (tools avanzadas) ✅
3. EXT-003: Notificaciones (multi-canal) ✅
4. EXT-004: Perfiles Avanzados ✅
5. EXT-005: Reportería (PDF/Excel) ✅
6. EXT-006: CMS de Contenido ✅
7. EXT-007: LTI Integration 🟡
8. EXT-008: White Label 🟡
9. EXT-009: Peer Challenges 🟡
10. EXT-010: Parent Notifications 🟡
```

**Sección: FLUJO DE TRABAJO (líneas 176-196)**

Cambiar:
```
1. Leer documentación correspondiente en docs/modulos/
```

Por:
```
1. Leer documentación de la épica correspondiente en:
   - docs/01-fase-alcance-inicial/EAI-XXX/ (fundamentos)
   - docs/03-fase-extensiones/EXT-XXX/ (extensiones)
```

**Ejemplos (líneas 189-196):**

Cambiar:
```markdown
## Análisis: REQ-003 - Sistema de Gamificación y Engagement

### Referencia MVP
**Sección:** 3) Sistema de gamificación (puntos, niveles, badges, challenges)
**Prioridad:** P0
**Estimación MVP:** 1 semana
```

Por:
```markdown
## Análisis: EAI-003 - Sistema de Gamificación

### Referencia
**Ubicación:** docs/01-fase-alcance-inicial/EAI-003-gamificacion/
**Fase:** Fase 1 - Alcance Inicial
**Estado:** ✅ 100% Completado
**Story Points:** 48 SP
**Documentos clave:**
- docs/01-fase-alcance-inicial/EAI-003-gamificacion/README.md
- docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/
- docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md
```

### 2. DIRECTIVA-DISENO-BASE-DATOS.md

**Los schemas están bien, pero agregar nota:**

```markdown
**Nota:** Los schemas implementados están documentados en:
- docs/02-fase-robustecimiento/EMR-001-migracion-bd/ (migración 1→14 schemas)
- docs/90-transversal/inventarios-database/
```

### 3. DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md

**El ejemplo [DB-012] está bien, pero agregar referencia:**

```markdown
**Basado en:** EAI-003-gamificacion (Fase 1)
**Documentación:** docs/01-fase-alcance-inicial/EAI-003-gamificacion/
```

---

## 📋 PLAN DE CORRECCIÓN

### Prioridad P0 - Inmediata

1. **PROMPT-REQUIREMENTS-ANALYST.md** 🔥
   - Actualizar sección DOCUMENTO MAESTRO (líneas 149-170)
   - Actualizar ejemplos de flujo de trabajo
   - Actualizar referencias en ejemplos

2. **Actualizar _MAP.md** (opcional)
   - Informar que la estructura de docs/ es por fases, no por tipo

### Prioridad P1 - Corto Plazo

3. **Agregar notas aclaratorias** en directivas
   - DIRECTIVA-DISENO-BASE-DATOS.md: referencia a docs migración BD
   - DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md: referencia a épicas

---

## ✅ VALIDACIÓN

### Comandos de Validación

```bash
# Verificar estructura de docs/
ls -la docs/

# Ver épicas Fase 1
ls -la docs/01-fase-alcance-inicial/

# Ver épicas Fase 3
ls -la docs/03-fase-extensiones/

# Verificar documentos maestros
ls -la docs/00-vision-general/

# Ver trazas
ls -la orchestration/trazas/
```

---

**Generado por:** Workspace-Manager
**Fecha:** 2025-11-23
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
