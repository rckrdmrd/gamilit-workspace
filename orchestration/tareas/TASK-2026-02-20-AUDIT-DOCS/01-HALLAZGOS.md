# 01-HALLAZGOS — Auditoria y Actualizacion Integral de Documentacion

**Fecha:** 2026-02-20
**SSOT:** MASTER_INVENTORY.yml v12.1.0
**Alcance:** docs/ (2,009 archivos), CLAUDE.md

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| Archivos editados (metricas) | ~50 |
| Ediciones individuales de metricas | ~150+ |
| READMEs nuevos creados | 5 |
| Metricas distintas corregidas | 15 |
| Archivos _archived_ omitidos | 3 (intencionalmente) |

---

## 1. Metricas Actualizadas (Antes/Despues)

| Metrica | Valor Anterior | Valor SSOT | Archivos Afectados |
|---------|---------------|------------|---------------------|
| Backend Modules | 22 | **23** | 20+ archivos |
| Entities | 152/153/154 | **155 files (156 classes)** | 15+ archivos |
| Services | 170/171/172 | **173** | 10+ archivos |
| Controllers | 107 | **108** | 8+ archivos |
| Endpoints | 899/901/904 | **905** | 20+ archivos |
| Frontend Components | 475/507 | **590** | 15+ archivos |
| Hooks | 102/106 | **127** | 8+ archivos |
| Pages | 68 | **70** | 8+ archivos |
| Zustand Stores | 14 | **13** | 6+ archivos |
| API Service Files | 52/53 | **67** | 8+ archivos |
| API Calls | 570/662 | **~575** | 3+ archivos |
| Routes | 72 | **73** | 5+ archivos |
| RLS Policies DDL | 207/227 | **231** | 10+ archivos |
| RLS Policies Runtime | 404 | **471** | 10+ archivos |
| Foreign Keys | 298 | **299** | 5+ archivos |
| ENUMs | 40 | **42** | 5+ archivos |
| Type Files | 47 | **49** | 1 archivo (CLAUDE.md) |

---

## 2. READMEs Creados

| Archivo | Descripcion |
|---------|-------------|
| docs/50-guides/README.md | Indice de guias (6 subdirectorios + 2 archivos raiz) |
| docs/60-portals/README.md | Indice de 4 portales con completitud |
| docs/70-onboarding/README.md | Indice de 3 guias de onboarding por rol |
| docs/80-references/README.md | Indice de knowledge-base y transversal |
| docs/99-delivery/README.md | Indice de entregas con historico |

Todos siguen formato estandar con tabla de contenido y fecha de actualizacion.

---

## 3. Archivos Grandes Identificados (Candidatos a Split Futuro)

| Archivo | Lineas | Prioridad |
|---------|--------|-----------|
| docs/10-requirements/epics/.../API-CONTRACTS.md | 3,012 | Media |
| docs/99-delivery/.../Manual_Portal_Administrador_ACTUALIZADO.md | 2,666 | Baja |
| docs/10-requirements/epics/.../ET-GAM-003-rangos-maya.md | 2,442 | Baja |
| docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md | 2,226 | Media |
| docs/40-standards/ESTANDAR-SEGURIDAD.md | 1,863 | Baja |
| docs/60-portals/student/PORTAL-STUDENT-GUIDE.md | 1,827 | Baja |
| docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md | 1,204 | Baja |
| docs/50-guides/testing/GUIA-E2E-PLAYWRIGHT.md | 1,167 | Baja |
| docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md | 1,199 | Baja |
| docs/50-guides/deployment/DEPLOYMENT-MASTER.md | 1,065 | Baja |
| docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md | 1,034 | Baja |

**Nota:** El plan original mencionaba REACT-QUERY-MIGRATION-GUIDE.md como 20,716 lineas. En realidad es 648 lineas (ubicado en docs/50-guides/, no en frontend/).

---

## 4. Archivos Archived Omitidos

Los siguientes archivos en `_archived/` NO fueron editados intencionalmente:

- `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md`
- `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/EPIC-GAM-BACKEND/EPIC.md`

Estos reflejan versiones anteriores y conservan sus metricas historicas.

---

## 5. Hallazgos Adicionales

### 5.1 Patron de _INDEX.md vs README.md
- El proyecto usa `_INDEX.md` como patron principal (no README.md)
- Los 5 READMEs nuevos complementan (no reemplazan) los `_INDEX.md` existentes
- `docs/80-references/transversal/` ya tenia README.md propio

### 5.2 Metricas en GUIA-ARCHITECTURE-TESTING.md
- Usa "22 modulos" refiriendose a directorios fisicos (correcto)
- Incluye nota aclaratoria: "El proyecto tiene 23 modulos conceptuales en total"
- No modificado para no perder la distincion fisica/conceptual

### 5.3 Reporte Historico Preservado
- `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` NO fue editado
- Es un snapshot de punto en el tiempo (2026-01-20)
- Sus metricas (142 tablas, etc.) son correctas para esa fecha

---

## 6. Fuera de Scope (Sprint Futuro)

1. **Split de archivos grandes** — 11 archivos >1000 lineas identificados
2. **Estandarizacion de frontmatter YAML** — ~70% de archivos no lo tienen
3. **Correccion de heading hierarchy** — Docs que empiezan en H2
4. **Normalizacion de list markers** — Unificar `*` vs `-`
5. **SOP de actualizacion de metricas** — Crear directiva SIMCO para sync post-sprint
