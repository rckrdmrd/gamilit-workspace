# ANALISIS COMPARATIVO: Workspaces v1-bckp vs v1 vs v2

**Fecha:** 2026-01-16
**Proyecto:** GAMILIT - Sistema de Gamificacion Educativa
**Analizado por:** Orquestador SIMCO
**Fuentes:**
- `/home/isem/workspace-v1-bckp/projects/gamilit/` (Backup 2025-11-29)
- `/home/isem/workspace-v1/projects/gamilit/` (Version anterior)
- `/home/isem/workspace-v2/projects/gamilit/` (Version actual)

---

## RESUMEN EJECUTIVO

| Metrica | v1-bckp (2025-11-29) | v1 (2026-01-07) | v2 (2026-01-13) | Tendencia |
|---------|---------------------|-----------------|-----------------|-----------|
| **MASTER_INVENTORY version** | 2.0.0 | 4.0.1 | 4.1.0 | Evolucion normal |
| **Estado General** | OPERATIVO | OPERATIVO | OPERATIVO | Estable |

---

## COMPARATIVO POR CAPA

### BASE DE DATOS

| Metrica | v1-bckp | v1 | v2 | Delta v1-bckp→v2 |
|---------|---------|----|----|------------------|
| DDL Files | 368 | 397 | 397 | +29 |
| Seed Files | 84 | 100 | 169 | +85 |
| Schemas | 18 | 16 | 16 | -2 |
| Tables | 117 | 133 | 137 | +20 |
| Functions (BD) | 200 | 151 | 110 active | -90 activas |
| Triggers | 87 | 112 | 35 active | -52 activas |
| RLS Policies | **243** | **185** | **32** | **-211 CRITICO** |
| Foreign Keys | 208 | 208 | 208 | 0 |
| Enums | 37 | 42 | 42 | +5 |

#### Hallazgos Criticos en Base de Datos

1. **RLS Policies REDUCIDAS DRASTICAMENTE**: 243 → 32 (-211 policies)
   - Esto representa una **reduccion del 87%** en politicas de seguridad
   - Afecta directamente la seguridad multi-tenant del sistema
   - **REQUIERE INVESTIGACION INMEDIATA**

2. **Funciones Activas Reducidas**: 200 → 110 (-90 funciones)
   - 41 funciones movidas a `_deprecated/`
   - Revisar si hay funcionalidad perdida

3. **Triggers Activos Reducidos**: 87 → 35 (-52 triggers)
   - 77 triggers movidos a `_deprecated/`
   - Logica de negocio automatizada puede estar afectada

4. **Schemas Consolidados**: 18 → 16 (-2)
   - Posible consolidacion legitima de schemas

#### Funcionalidades de BD Preservadas en v1-bckp

```yaml
Funcionalidades Completas en v1-bckp (2025-11-29):
  - Sistema de tienda virtual (shop_categories, shop_items, user_purchases)
  - M4-M5 Implementation (media_attachments, manual_reviews)
  - Sistema de alertas de intervencion estudiantil
  - Validadores de ejercicios completos (32 funciones)
  - Sistema de comunicacion maestro-estudiante
  - 243 RLS policies cubriendo todos los schemas
  - Clean Load Policy 100% compliant
```

---

### BACKEND

| Metrica | v1-bckp | v1 | v2 | Delta v1-bckp→v2 |
|---------|---------|----|----|------------------|
| Modules | 13 | 16 | 17 | +4 |
| Entities | 92 | 107 | 108 | +16 |
| DTOs | 327 | 337 | 337 | +10 |
| Services | 88 | 103 | 105 | +17 |
| Controllers | 71 | 75 | 75 | +4 |
| Endpoints | **417** | **300+** | **612** | +195 |
| Coherencia BD | 97% | 97% | 97% | Estable |

#### Hallazgos en Backend

1. **Endpoints Fluctuaron**: 417 → 300+ → 612
   - v1 registra "300+" (estimado) vs 417 exacto en v1-bckp
   - v2 reporta 612 endpoints (incremento significativo)
   - **Posible cambio en metodologia de conteo**

2. **Modulos Agregados**: 13 → 17 (+4)
   - Nuevos: health, websocket, certificates, otros
   - Indica expansion de funcionalidad

3. **Entities Agregadas**: 92 → 108 (+16)
   - Incluyen: Certificate (EPIC 10.2), otras de v1
   - Expansion de modelo de dominio

#### Funcionalidades Backend Preservadas en v1-bckp

```yaml
Modulos Completos en v1-bckp:
  - auth (12 entities, 5 services, 2 controllers)
  - admin (6 entities, 15 services, 17 controllers)
  - educational (5 entities, 4 services, 4 controllers)
  - gamification (16 entities, 8 services, 9 controllers)
  - progress (13 entities, 7 services, 5 controllers)
  - social (10 entities, 9 services, 9 controllers)
  - teacher (1 entity, 5 services, 2 controllers)
  - content (5 entities, 5 services, 5 controllers)
  - notifications (1 entity, 1 service, 1 controller)
```

---

### FRONTEND

| Metrica | v1-bckp | v1 | v2 | Delta v1-bckp→v2 |
|---------|---------|----|----|------------------|
| Files | 845 | 900+ | 900+ | +55+ |
| Components | 483 | 497 | 327 | **-156** |
| Hooks | 89 | 103 | 103 | +14 |
| Pages | 31 | 64 | 74 | +43 |
| Stores | 11 | 11 | 12 | +1 |
| API Services | 15 | 15 | 52 | +37 |
| Mechanics | 33 | 30 | 33 | 0 |
| LOC | ~98000 | ~100000 | ~100000 | +2000 |
| Test Coverage | 13% | 13% | 13% | **CRITICO** |

#### Hallazgos en Frontend

1. **Discrepancia en Componentes**: 483 → 327 (-156)
   - v2 reporta menos componentes que v1-bckp
   - **Posible diferencia en metodologia de conteo**
   - O componentes movidos/consolidados

2. **Pages Incrementadas**: 31 → 74 (+43)
   - Significativo incremento de paginas
   - Incluye: Student (24), Teacher (13), Admin (27)

3. **API Services Incrementados**: 15 → 52 (+37)
   - Expansion significativa de servicios API
   - Mejor modularizacion de comunicacion con backend

4. **Test Coverage Estatico**: 13% (sin cambios)
   - **CRITICO**: No ha mejorado la cobertura de tests
   - Objetivo: 40%, Gap: -27%

---

## FUNCIONALIDADES PERDIDAS EN MIGRACION

### Confirmadas como Perdidas/Degradadas

| Funcionalidad | v1-bckp | v2 | Impacto |
|---------------|---------|----|---------|
| RLS Policies | 243 | 32 | **SEGURIDAD CRITICA** |
| Funciones BD activas | 200 | 110 | Logica de negocio |
| Triggers activos | 87 | 35 | Automatizacion BD |

### Requieren Verificacion

| Funcionalidad | v1-bckp | v2 | Verificar |
|---------------|---------|----|---------|
| Componentes Frontend | 483 | 327 | Metodologia de conteo |
| Endpoints exactos | 417 | 612 | Cambio de conteo |
| Mecanicas ejercicios | 33 | 33 | Equivalencia funcional |

---

## FUNCIONALIDADES GANADAS EN v2

### Nuevas en v2 vs v1-bckp

| Funcionalidad | Descripcion | Ubicacion |
|---------------|-------------|-----------|
| Sistema Certificados | EPIC 10.2 - Certificados digitales | progress_tracking.certificates |
| Sync Teacher Classrooms | Auto-registro de teachers en classrooms | social_features triggers |
| Tags de Contenido | Catalogo de tags Marie Curie | content_management.tags |
| Mas Seeds | 169 vs 84 archivos seed | seeds/ |
| Mas Pages | 74 vs 31 paginas frontend | apps/*/pages/ |
| Mas API Services | 52 vs 15 servicios | frontend/api/ |

---

## RUTAS A ARCHIVOS CLAVE POR VERSION

### v1-bckp (Backup Funcional)

```
/home/isem/workspace-v1-bckp/projects/gamilit/
├── apps/
│   ├── backend/           # NestJS Backend
│   └── frontend/          # React Frontend
├── database/              # DDL y Seeds (ubicacion diferente a v1/v2)
│   ├── ddl/
│   └── seeds/
├── docs/                  # Documentacion
└── orchestration/         # Inventarios y trazas
    └── inventarios/
        ├── MASTER_INVENTORY.yml (v2.0.0)
        ├── DATABASE_INVENTORY.yml (v3.1.0)
        ├── BACKEND_INVENTORY.yml (v2.6.0)
        └── FRONTEND_INVENTORY.yml (v3.1)
```

### v1 (Version Intermedia)

```
/home/isem/workspace-v1/projects/gamilit/
├── apps/
│   ├── backend/
│   ├── frontend/
│   ├── database/          # Database movido a apps/
│   └── devops/
├── docs/
└── orchestration/
    └── inventarios/
        ├── MASTER_INVENTORY.yml (v4.0.1)
        ├── DATABASE_INVENTORY.yml (v4.3.0)
        ├── BACKEND_INVENTORY.yml (v3.1.0)
        └── FRONTEND_INVENTORY.yml (v4.0)
```

### v2 (Version Actual)

```
/home/isem/workspace-v2/projects/gamilit/
├── apps/
│   ├── backend/
│   └── frontend/
├── docs/
└── orchestration/
    └── inventarios/
        ├── MASTER_INVENTORY.yml (v4.1.0)
        ├── DATABASE_INVENTORY.yml
        ├── BACKEND_INVENTORY.yml
        └── FRONTEND_INVENTORY.yml
```

---

## PLAN DE REMEDIACION SUGERIDO

### Prioridad 1 - CRITICA (Inmediato)

1. **Investigar Reduccion de RLS Policies**
   - Comparar DDL de RLS entre v1-bckp y v2
   - Identificar politicas faltantes
   - Evaluar impacto en seguridad multi-tenant
   - **Ruta referencia**: `/home/isem/workspace-v1-bckp/projects/gamilit/database/ddl/schemas/*/rls-policies/`

2. **Auditar Funciones Deprecated**
   - Revisar 90 funciones movidas a _deprecated
   - Confirmar que funcionalidad esta cubierta
   - Documentar razones de deprecacion

3. **Auditar Triggers Deprecated**
   - Revisar 52 triggers movidos a _deprecated
   - Confirmar que automatizacion BD esta cubierta

### Prioridad 2 - ALTA (Esta Semana)

4. **Reconciliar Conteo de Componentes Frontend**
   - Ejecutar conteo real en v2
   - Comparar con v1-bckp
   - Identificar componentes faltantes si hay

5. **Validar Equivalencia de Mecanicas**
   - Confirmar que 33 mecanicas funcionan igual
   - Comparar implementaciones M4-M5

### Prioridad 3 - MEDIA (Proximo Sprint)

6. **Mejorar Test Coverage**
   - Actual: 13%, Objetivo: 40%
   - Priorizar tests de seguridad y auth

7. **Documentar Cambios de Arquitectura**
   - Explicar por que RLS se redujo
   - Documentar deprecaciones

---

## REFERENCIAS

### Inventarios Comparados

| Version | Archivo | Ruta |
|---------|---------|------|
| v1-bckp | MASTER_INVENTORY.yml | `/home/isem/workspace-v1-bckp/projects/gamilit/orchestration/inventarios/` |
| v1-bckp | DATABASE_INVENTORY.yml | `/home/isem/workspace-v1-bckp/projects/gamilit/orchestration/inventarios/` |
| v1-bckp | BACKEND_INVENTORY.yml | `/home/isem/workspace-v1-bckp/projects/gamilit/orchestration/inventarios/` |
| v1-bckp | FRONTEND_INVENTORY.yml | `/home/isem/workspace-v1-bckp/projects/gamilit/orchestration/inventarios/` |
| v1 | MASTER_INVENTORY.yml | `/home/isem/workspace-v1/projects/gamilit/orchestration/inventarios/` |
| v1 | DATABASE_INVENTORY.yml | `/home/isem/workspace-v1/projects/gamilit/orchestration/inventarios/` |
| v2 | MASTER_INVENTORY.yml | `/home/isem/workspace-v2/projects/gamilit/orchestration/inventarios/` |
| v2 | TRACEABILITY_MATRIX.yml | `/home/isem/workspace-v2/projects/gamilit/orchestration/inventarios/` |

### Archivos de Backup Adicionales

- Backup comprimido: `/home/isem/workspace-v1/projects/gamilit-backup-20260110-180429.tar.gz`
- Backups internos: `/home/isem/workspace-v1/projects/gamilit/backups/`

---

**Generado:** 2026-01-16 | **Version:** 1.0.0 | **Metodo:** SIMCO Analisis Comparativo
