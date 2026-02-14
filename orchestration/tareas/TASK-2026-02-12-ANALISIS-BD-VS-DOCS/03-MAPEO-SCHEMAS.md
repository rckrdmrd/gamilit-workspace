# Mapeo de Schemas: Fisico (DDL) vs Conceptual (Documentacion)

**Version:** 1.0.0
**Fecha:** 2026-02-12

---

## Tabla de Mapeo Completa

| # | Schema Fisico (DDL) | Tablas | Schema(s) Conceptual (Docs) | Tipo Mapeo |
|---|---------------------|--------|---------------------------|------------|
| 1 | `auth` | 1 | auth (parcial) | SPLIT |
| 2 | `auth_management` | 17 | auth + tenants + parents | MERGE (3->1) |
| 3 | `educational_content` | 21 | education (parcial) | SPLIT |
| 4 | `gamification_system` | 21 | gamification + store + missions + leaderboard | MERGE (4->1) |
| 5 | `progress_tracking` | 21 | education (parcial) | SPLIT |
| 6 | `social_features` | 30 | social + classrooms + reports (parcial) | MERGE (3->1) |
| 7 | `notifications` | 7 | notifications | ~1:1 |
| 8 | `content_management` | 10 | content | ~1:1 |
| 9 | `system_configuration` | 9 | settings | ~1:1 |
| 10 | `audit_logging` | 7 | audit | ~1:1 |
| 11 | `admin_dashboard` | 4+7v | analytics (parcial) + reports (parcial) | SPLIT |
| 12 | `data_warehouse` | 16+3v | analytics (parcial) | SPLIT |
| 13 | `communication` | 4 | *SIN DOCUMENTAR* | MISSING |
| 14 | `lti_integration` | 3 | integrations (placeholder en docs, activo en DDL) | MISMATCH |
| 15 | `gamilit` | 0+37f | *SIN DOCUMENTAR* | MISSING |
| 16 | `optimization` | 0 | *SIN DOCUMENTAR* | MISSING |
| 17 | `public` | 0 | N/A (legacy, vacio) | N/A |
| 18 | `storage` | 0 | N/A (placeholder, vacio) | N/A |

## Patrones de Discrepancia

### MERGE: Multiple conceptuales en 1 fisico
- `auth_management` absorbe: auth(users), tenants, parents -> **3 schemas conceptuales en 1 fisico**
- `gamification_system` absorbe: gamification, store, missions, leaderboard -> **4 schemas conceptuales en 1 fisico**
- `social_features` absorbe: social, classrooms, reports(parcial) -> **3 schemas conceptuales en 1 fisico**

### SPLIT: 1 conceptual dividido en N fisicos
- `education` (conceptual) -> educational_content + progress_tracking (2 fisicos)
- `analytics` (conceptual) -> admin_dashboard + data_warehouse (2 fisicos)

### MISSING: Schemas fisicos sin documentacion
- `communication` (4 tablas) - Sistema de mensajeria
- `gamilit` (37 funciones) - Funciones utilitarias compartidas
- `optimization` - Indexes de rendimiento

### MISMATCH: Placeholder vs Activo
- `lti_integration` tiene 3 tablas activas pero docs dicen "placeholder/reservado"

## Impacto en Documentacion

La documentacion actual con 16 schemas conceptuales describe el sistema a nivel de **dominio de negocio**, pero no corresponde 1:1 con la implementacion fisica de 18 schemas DDL. Esto causa confusion al buscar tablas especificas o verificar coherencia.

**Recomendacion:** Agregar tabla de mapeo explicita en `schema-reference/_INDEX.md` y actualizar cada archivo de referencia para indicar el schema fisico DDL real.
