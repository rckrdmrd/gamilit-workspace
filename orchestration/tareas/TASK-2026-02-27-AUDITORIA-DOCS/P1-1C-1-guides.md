# Auditoria docs/50-guides/ — Informe P1-1C-1

**Seccion:** docs/50-guides/
**Fecha:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (claude-sonnet-4-6)
**Modo:** ANALYSIS — read-only, sin modificaciones
**Total archivos:** 161 (incluyendo .yml, .sh)
**Total .md:** 155

---

## 1. ARBOL DE DIRECTORIOS COMPLETO CON CONTEOS

```
docs/50-guides/                          [5 archivos raiz .md + 1 .yml ignorado]
├── _INDEX.md                            [52 ln]
├── README.md                            [25 ln]
├── GUIA-REFERENCIAS-SIMCO.md           [325 ln]
├── GUIA-RESPONSIVE-TESTING.md          [167 ln]
├── REACT-QUERY-MIGRATION-GUIDE.md      [682 ln]  *** >500
│
├── backend/                             [0 _INDEX, 0 _MAP — MISSING BOTH]
│   ├── DOMAIN-ERROR-MIGRATION.md       [300 ln]
│   ├── GUIA-CREAR-BASE-DATOS.md        [419 ln]
│   ├── GUIA-DEPENDENCY-RULES.md        [530 ln]  *** >500
│   ├── GUIA-DESIGN-PATTERNS-NESTJS.md  [1206 ln] *** >500 FLAGGED
│   ├── GUIA-EXPAND-CONTRACT-MIGRATIONS.md [870 ln] *** >500
│   ├── GUIA-OPENTELEMETRY-NESTJS.md    [750 ln]  *** >500
│   ├── GUIA-ROTACION-SECRETOS.md       [612 ln]  *** >500
│   ├── GUIA-RUNBOOK-POSTGRESQL.md      [1034 ln] *** >500 FLAGGED
│   └── impl/                            [_INDEX PRESENT, _MAP PRESENT]
│       ├── _INDEX.md                    [32 ln]
│       ├── _MAP.md                      [117 ln]
│       ├── README.md                    [39 ln]
│       ├── ADMIN-DTOS.md               [297 ln]
│       ├── API-STANDARDS.md            [733 ln]  *** >500
│       ├── DATABASE-INTEGRATION.md     [367 ln]
│       ├── DTO-CONVENTIONS.md          [437 ln]
│       ├── ENTITIES-DOCUMENTACION.md   [110 ln]
│       ├── ERROR-HANDLING.md           [463 ln]
│       ├── ESTRUCTURA-MODULOS.md       [270 ln]
│       ├── ESTRUCTURA-SHARED.md        [361 ln]
│       ├── GUIA-PREVENCION-ERRORES-TIPOS.md [226 ln]
│       ├── SERVICES-DUPLICADOS.md      [102 ln]
│       ├── SETUP-DEVELOPMENT.md        [351 ln]
│       ├── TESTING-GUIDE.md            [455 ln]
│       ├── dto/                         [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── GAMIFICATION-DTOS.md    [399 ln]
│       └── _archived/                   [_INDEX PRESENT, 0 _MAP]
│           ├── _INDEX.md               [9 ln]   *** STUB <10 lines
│           ├── README.md               [21 ln]
│           ├── API-CONVENTIONS.md      [394 ln]
│           └── NAMING-CONVENTIONS-API.md [337 ln]
│
├── deployment/                          [_INDEX PRESENT, _MAP PRESENT]
│   ├── _INDEX.md                        [25 ln]
│   ├── _MAP.md                          [24 ln]
│   ├── DEPLOYMENT-MASTER.md            [1074 ln] *** >500 FLAGGED, DEPRECATED
│   ├── DEV-SERVERS.md                  [247 ln]
│   ├── GUIA-ACTUALIZACION-PRODUCCION.md [631 ln] *** >500, DEPRECATED
│   ├── GUIA-CORS-PRODUCCION.md         [157 ln]
│   ├── GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md [1206 ln] *** >500 FLAGGED, DEPRECATED
│   ├── GUIA-DOCKER-MULTISTAGE.md       [739 ln]  *** >500
│   ├── GUIA-GITHUB-ACTIONS-CICD.md     [690 ln]  *** >500
│   ├── GUIA-PIPELINE-MIGRACIONES.md    [453 ln]
│   ├── GUIA-SSL-AUTOFIRMADO.md         [248 ln]
│   ├── GUIA-SSL-NGINX-PRODUCCION.md    [283 ln]
│   ├── GUIA-VALIDACION-PRODUCCION.md   [666 ln]  *** >500
│   └── _archived/                       [0 _INDEX, 0 _MAP — MISSING BOTH]
│       ├── README.md                   [36 ln]
│       ├── DEPLOYMENT.md               [863 ln]  *** >500
│       ├── DEPLOYMENT-GUIDE.md         [488 ln]
│       ├── DIRECTIVA-DEPLOYMENT.md     [208 ln]
│       ├── GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md [483 ln]
│       ├── GUIA-DEPLOYMENT-RAPIDO.md   [227 ln]
│       ├── GUIA-SSL-CERTBOT-DEPLOYMENT.md [356 ln]
│       ├── INSTRUCCIONES-DEPLOYMENT.md [214 ln]
│       └── REFERENCIA-DEPLOYMENT-PRODUCCION.md [58 ln]
│
├── documentation-master/                [0 _INDEX, 0 _MAP — MISSING BOTH]
│   └── GAMILIT-DOCUMENTATION-MASTER/   [0 _INDEX, 0 _MAP — MISSING BOTH]
│       ├── GAMILIT-DOCUMENTATION-MASTER.md [289 ln]
│       ├── ANALISIS-HALLAZGOS-DETALLADO.md [555 ln] *** >500
│       ├── fase-0-inventarios/          [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── REPORTE-VALIDACION-INVENTARIOS.md [171 ln]
│       ├── fase-1-catalogo/             [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   ├── PAGES-CATALOG-GAMILIT.yml [508 ln]
│       │   └── PAGES-INDEX.md          [189 ln]
│       ├── fase-2-student-components/   [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── STUDENT-PAGE-COMPONENTS-MAP.yml [567 ln]
│       ├── fase-3-student-data-flow/    [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── STUDENT-DATA-FLOW-MAP.yml [517 ln]
│       ├── fase-4-teacher-portal/       [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── TEACHER-DATA-FLOW-MAP.yml [329 ln]
│       ├── fase-5-admin-portal/         [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── ADMIN-DATA-FLOW-MAP.yml [391 ln]
│       ├── fase-6-coherencia/           [0 _INDEX, 0 _MAP — MISSING BOTH]
│       │   └── COHERENCE-MATRIX-GAMILIT.yml [491 ln]
│       └── fase-7-consolidacion/        [0 _INDEX, 0 _MAP — MISSING BOTH]
│           └── EXECUTIVE-SUMMARY.md    [104 ln]
│
├── frontend/                            [0 _INDEX, 0 _MAP — MISSING BOTH]
│   ├── GUIA-DETECTIVE-THEME.md         [981 ln]  *** >500 FLAGGED
│   ├── GUIA-WCAG-ACCESSIBILITY.md      [504 ln]  *** >500
│   └── impl/                            [0 _INDEX, _MAP PRESENT]
│       ├── _MAP.md                      [46 ln]
│       ├── README.md                   [55 ln]
│       ├── API-ARCHITECTURE.md         [771 ln]  *** >500
│       ├── API-INTEGRATION.md          [461 ln]
│       ├── API-SERVICES.md             [549 ln]  *** >500
│       ├── API-TYPES-BEST-PRACTICES.md [308 ln]
│       ├── COMPONENT-PATTERNS.md       [582 ln]  *** >500
│       ├── COMPONENTES-INVENTARIO.md   [269 ln]
│       ├── COMPONENTES-UI.md           [520 ln]  *** >500
│       ├── ESTRUCTURA-FEATURES.md      [401 ln]
│       ├── ESTRUCTURA-SHARED.md        [548 ln]  *** >500
│       ├── GENERATED-API-TYPES.md      [502 ln]  *** >500
│       ├── HOOK-PATTERNS.md            [681 ln]  *** >500
│       ├── MECANICAS-EDUCATIVAS.md     [278 ln]
│       ├── MIGRATION-EXAMPLE-GENERATED-TYPES.md [523 ln] *** >500
│       ├── SETUP-DEVELOPMENT.md        [350 ln]
│       ├── STATE-MANAGEMENT.md         [465 ln]
│       ├── TESTING-GUIDE.md            [508 ln]  *** >500
│       ├── TYPES-CONSOLIDATION-ANALYSIS.md [215 ln]
│       ├── TYPES-CONSOLIDATION-PLAN.md [310 ln]
│       ├── TYPES-CONSOLIDATION-VALIDATION.md [267 ln]
│       ├── TYPES-CONVENTIONS.md        [402 ln]
│       ├── admin/                       [0 _INDEX, _MAP PRESENT]
│       │   ├── _MAP.md                 [22 ln]
│       │   ├── ADMIN-COMPONENTS-CATALOG.md [383 ln]
│       │   ├── components/              [0 _INDEX, _MAP PRESENT]
│       │   │   ├── _MAP.md             [16 ln]
│       │   │   └── ALERT-COMPONENTS-ARCHITECTURE.md [438 ln]
│       │   ├── hooks/                   [0 _INDEX, _MAP PRESENT]
│       │   │   ├── _MAP.md             [17 ln]
│       │   │   ├── ADMIN-CLASSROOMS-HOOK.md [165 ln]
│       │   │   └── ADMIN-GAMIFICATION-CONFIG-HOOK.md [345 ln]
│       │   └── pages/                   [0 _INDEX, _MAP PRESENT]
│       │       ├── _MAP.md             [18 ln]
│       │       ├── AdminAlertsPage-Specification.md      [199 ln] *** NAMING
│       │       ├── AdminGamificationPage-Specification.md [202 ln] *** NAMING
│       │       └── AdminUsersPage-Specification.md       [212 ln] *** NAMING
│       ├── especificaciones/            [0 _INDEX, _MAP PRESENT]
│       │   ├── _MAP.md                 [16 ln]
│       │   └── AdminReportsPage-UI-Specification.md [480 ln] *** NAMING
│       ├── guides/                      [0 _INDEX, _MAP PRESENT]
│       │   ├── _MAP.md                 [16 ln]
│       │   └── Frontend-Alert-System-Guide.md [362 ln] *** NAMING
│       ├── student/                     [0 _INDEX, _MAP PRESENT]
│       │   ├── _MAP.md                 [16 ln]
│       │   └── README.md               [271 ln]
│       ├── teacher/                     [0 _INDEX, _MAP PRESENT]
│       │   ├── _MAP.md                 [16 ln]
│       │   ├── components/              [0 _INDEX, _MAP PRESENT]
│       │   │   ├── _MAP.md             [17 ln]
│       │   │   ├── TEACHER-MONITORING-COMPONENTS.md [368 ln]
│       │   │   └── TEACHER-RESPONSE-MANAGEMENT.md [346 ln]
│       │   ├── constants/               [0 _INDEX, _MAP PRESENT]
│       │   │   ├── _MAP.md             [16 ln]
│       │   │   └── TEACHER-CONSTANTS-REFERENCE.md [322 ln]
│       │   ├── pages/                   [0 _INDEX, _MAP PRESENT]
│       │   │   ├── _MAP.md             [16 ln]
│       │   │   └── TEACHER-PAGES-SPECIFICATIONS.md [418 ln]
│       │   └── types/                   [0 _INDEX, _MAP PRESENT]
│       │       ├── _MAP.md             [16 ln]
│       │       └── TEACHER-TYPES-REFERENCE.md [409 ln]
│       └── types/                       [0 _INDEX, 0 _MAP — MISSING BOTH]
│           └── GAMIFICATION-TYPES.md   [252 ln]
│
├── integration/                         [0 _INDEX, 0 _MAP — MISSING BOTH]
│   ├── DEPENDENCIAS-STUDENT-TEACHER.md [352 ln]
│   ├── GUIA-TYPEORM-CROSS-DATASOURCE.md [255 ln]
│   ├── INTEGRACION-STUDENT-TEACHER.md  [739 ln]  *** >500
│   └── websocket/                       [0 _INDEX, _MAP PRESENT (as stub)]
│       └── _MAP.md                      [44 ln]
│
├── testing/                             [0 _INDEX, 0 _MAP — MISSING BOTH]
│   ├── GUIA-ARCHITECTURE-TESTING.md    [469 ln]
│   ├── GUIA-COVERAGE-TESTING.md        [478 ln]
│   ├── GUIA-E2E-PLAYWRIGHT.md          [1168 ln] *** >500 FLAGGED
│   ├── MANUAL-TESTING-BACKEND.md       [287 ln]
│   ├── TESTING-GUIDE.md                [744 ln]  *** >500
│   └── impl/                            [0 _INDEX, _MAP PRESENT]
│       ├── _MAP.md                      [16 ln]
│       └── MANUAL-TESTING-GUIDE-US-AE-007.sh [319 ln] *** .sh in docs
│
└── troubleshooting/                     [0 _INDEX, 0 _MAP — MISSING BOTH]
    ├── BUILD_ERRORS.md                  [40 ln]  *** NAMING (underscore, not kebab)
    └── errores-comunes/                 [0 _INDEX, _MAP PRESENT]
        ├── _MAP.md                      [21 ln]  *** lowercase dir name
        ├── README.md                   [163 ln]
        ├── backend/                     [0 _INDEX, _MAP PRESENT]
        │   ├── _MAP.md                 [59 ln]
        │   ├── ERR-BE-001-endpoints-prefijo-duplicado.md [85 ln]
        │   ├── ERR-BE-002-queries-n-plus-1.md [81 ln]
        │   ├── ERR-BE-003-validacion-dtos-faltante.md [117 ln]
        │   ├── ERR-BE-004-datasource-entity-path.md [134 ln]
        │   ├── ERR-BE-005-modulo-huerfano.md [155 ln]
        │   ├── ERR-BE-006-circular-dependency.md [170 ln]
        │   ├── ERR-BE-007-guard-decorator-order.md [154 ln]
        │   └── ERR-BE-008-barrel-export-roto.md [135 ln]
        ├── database/                    [0 _INDEX, _MAP PRESENT]
        │   ├── _MAP.md                 [21 ln]
        │   ├── ERR-DB-001-uuid-format.md [93 ln]
        │   ├── ERR-DB-002-timezone-now.md [73 ln]
        │   ├── ERR-DB-003-seeds-conflictos-uuid.md [82 ln]
        │   ├── ERR-DB-004-rls-policy-conflicto.md [126 ln]
        │   ├── ERR-DB-005-trigger-recursion.md [157 ln]
        │   └── ERR-DB-006-fk-cross-schema.md [143 ln]
        ├── frontend/                    [0 _INDEX, _MAP PRESENT]
        │   ├── _MAP.md                 [21 ln]
        │   ├── ERR-FE-001-api-endpoints-hardcoded.md [85 ln]
        │   ├── ERR-FE-002-loading-states.md [91 ln]
        │   ├── ERR-FE-003-barrel-import-roto.md [119 ln]
        │   ├── ERR-FE-004-utilidad-duplicada.md [120 ln]
        │   ├── ERR-FE-005-api-service-duplicado.md [157 ln]
        │   └── ERR-FE-006-react-query-cache-key.md [161 ln]
        └── integracion/                 [0 _INDEX, _MAP PRESENT]
            ├── _MAP.md                 [20 ln]
            ├── ERR-INT-001-db-backend-desalineado.md [115 ln]
            ├── ERR-INT-002-dtos-desalineados.md [98 ln]
            ├── ERR-INT-003-modulo-sin-datasource.md [164 ln]
            ├── ERR-INT-004-cross-datasource-relation.md [149 ln]
            └── ERR-INT-005-api-dual-provider.md [177 ln]
```

**Totales por directorio (archivos .md + .yml + .sh):**

| Directorio | .md | .yml/.sh | Total |
|------------|-----|----------|-------|
| 50-guides/ (raiz) | 5 | 0 | 5 |
| backend/ | 8 | 0 | 8 |
| backend/impl/ | 13 | 0 | 13 |
| backend/impl/_archived/ | 4 | 0 | 4 |
| backend/impl/dto/ | 1 | 0 | 1 |
| deployment/ | 13 | 0 | 13 |
| deployment/_archived/ | 9 | 0 | 9 |
| documentation-master/GAMILIT-DOCUMENTATION-MASTER/ | 3 | 0 | 3 |
| ...fase-0-inventarios/ | 1 | 0 | 1 |
| ...fase-1-catalogo/ | 1 | 1 | 2 |
| ...fase-2-student-components/ | 0 | 1 | 1 |
| ...fase-3-student-data-flow/ | 0 | 1 | 1 |
| ...fase-4-teacher-portal/ | 0 | 1 | 1 |
| ...fase-5-admin-portal/ | 0 | 1 | 1 |
| ...fase-6-coherencia/ | 0 | 1 | 1 |
| ...fase-7-consolidacion/ | 1 | 0 | 1 |
| frontend/ | 2 | 0 | 2 |
| frontend/impl/ | 21 | 0 | 21 |
| frontend/impl/admin/ | 1 | 0 | 1 |
| frontend/impl/admin/components/ | 2 | 0 | 2 |
| frontend/impl/admin/hooks/ | 3 | 0 | 3 |
| frontend/impl/admin/pages/ | 4 | 0 | 4 |
| frontend/impl/especificaciones/ | 2 | 0 | 2 |
| frontend/impl/guides/ | 2 | 0 | 2 |
| frontend/impl/student/ | 2 | 0 | 2 |
| frontend/impl/teacher/ | 1 | 0 | 1 |
| frontend/impl/teacher/components/ | 3 | 0 | 3 |
| frontend/impl/teacher/constants/ | 2 | 0 | 2 |
| frontend/impl/teacher/pages/ | 2 | 0 | 2 |
| frontend/impl/teacher/types/ | 2 | 0 | 2 |
| frontend/impl/types/ | 1 | 0 | 1 |
| integration/ | 3 | 0 | 3 |
| integration/websocket/ | 1 | 0 | 1 |
| testing/ | 5 | 0 | 5 |
| testing/impl/ | 1 | 1 | 2 |
| troubleshooting/ | 1 | 0 | 1 |
| troubleshooting/errores-comunes/ | 2 | 0 | 2 |
| troubleshooting/errores-comunes/backend/ | 9 | 0 | 9 |
| troubleshooting/errores-comunes/database/ | 7 | 0 | 7 |
| troubleshooting/errores-comunes/frontend/ | 7 | 0 | 7 |
| troubleshooting/errores-comunes/integracion/ | 6 | 0 | 6 |
| **TOTAL** | **155** | **6** | **161** |

---

## 2. CHECK _INDEX.md — PRESENCIA POR DIRECTORIO

**Total directorios: 41**
**Con _INDEX.md: 4 (10%)**
**Sin _INDEX.md: 37 (90%)**

| Directorio | _INDEX.md | _MAP.md | Estado |
|------------|-----------|---------|--------|
| docs/50-guides/ | PRESENTE | AUSENTE | Parcial |
| backend/ | **AUSENTE** | **AUSENTE** | CRITICO |
| backend/impl/ | PRESENTE | PRESENTE | OK |
| backend/impl/_archived/ | PRESENTE (9 ln = stub) | AUSENTE | Parcial/Stub |
| backend/impl/dto/ | **AUSENTE** | **AUSENTE** | CRITICO |
| deployment/ | PRESENTE | PRESENTE | OK |
| deployment/_archived/ | **AUSENTE** | **AUSENTE** | CRITICO |
| documentation-master/ | **AUSENTE** | **AUSENTE** | CRITICO |
| documentation-master/GAMILIT-DOCUMENTATION-MASTER/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-0-inventarios/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-1-catalogo/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-2-student-components/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-3-student-data-flow/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-4-teacher-portal/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-5-admin-portal/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-6-coherencia/ | **AUSENTE** | **AUSENTE** | CRITICO |
| .../fase-7-consolidacion/ | **AUSENTE** | **AUSENTE** | CRITICO |
| frontend/ | **AUSENTE** | **AUSENTE** | CRITICO |
| frontend/impl/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/admin/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/admin/components/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/admin/hooks/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/admin/pages/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/especificaciones/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/guides/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/student/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/teacher/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/teacher/components/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/teacher/constants/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/teacher/pages/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/teacher/types/ | **AUSENTE** | PRESENTE | Parcial |
| frontend/impl/types/ | **AUSENTE** | **AUSENTE** | CRITICO |
| integration/ | **AUSENTE** | **AUSENTE** | CRITICO |
| integration/websocket/ | **AUSENTE** | PRESENTE | Parcial |
| testing/ | **AUSENTE** | **AUSENTE** | CRITICO |
| testing/impl/ | **AUSENTE** | PRESENTE | Parcial |
| troubleshooting/ | **AUSENTE** | **AUSENTE** | CRITICO |
| troubleshooting/errores-comunes/ | **AUSENTE** | PRESENTE | Parcial |
| troubleshooting/errores-comunes/backend/ | **AUSENTE** | PRESENTE | Parcial |
| troubleshooting/errores-comunes/database/ | **AUSENTE** | PRESENTE | Parcial |
| troubleshooting/errores-comunes/frontend/ | **AUSENTE** | PRESENTE | Parcial |
| troubleshooting/errores-comunes/integracion/ | **AUSENTE** | PRESENTE | Parcial |

**Resumen _INDEX.md:**
- 4 presentes: docs/50-guides/, backend/impl/, backend/impl/_archived/, deployment/
- 37 ausentes (de 41 dirs totales)

**Resumen _MAP.md:**
- 22 presentes: deployment/, backend/impl/, y todos los subdirs de frontend/impl/ (excl. types/), todos los de troubleshooting/errores-comunes/, integration/websocket/, testing/impl/
- 19 ausentes: docs/50-guides/ raiz, backend/, backend/impl/_archived/, backend/impl/dto/, toda la rama documentation-master/ (10 dirs), frontend/, frontend/impl/types/, integration/, testing/, troubleshooting/

**Patron detectado:** La convenccion usada en este proyecto para navegacion es **_MAP.md** (22 presentes), NO _INDEX.md (solo 4 presentes). Los subdirectorios de frontend/impl/ usan _MAP.md exclusivamente, sin _INDEX.md. El _INDEX.md se usa como "tabla de contenidos del padre" en deployment/ y backend/impl/, mientras _MAP.md es el estandar de facto en el resto.

---

## 3. FRONTMATTER — PRESENCIA Y CONTEOS

**Metodologia:** Se verifica `---` en linea 1 como marcador de frontmatter YAML valido.

**Archivos con frontmatter (--- en linea 1): 14 de 155 .md**
**Porcentaje: 9%** (ligeramente superior al ~7% reportado)

| Archivo | Frontmatter valido |
|---------|-------------------|
| backend/GUIA-DESIGN-PATTERNS-NESTJS.md | SI |
| backend/GUIA-DEPENDENCY-RULES.md | SI |
| backend/GUIA-OPENTELEMETRY-NESTJS.md | SI |
| deployment/GUIA-GITHUB-ACTIONS-CICD.md | SI |
| deployment/GUIA-DOCKER-MULTISTAGE.md | SI |
| deployment/GUIA-PIPELINE-MIGRACIONES.md | SI |
| frontend/GUIA-DETECTIVE-THEME.md | SI |
| frontend/GUIA-WCAG-ACCESSIBILITY.md | SI |
| testing/GUIA-E2E-PLAYWRIGHT.md | SI |
| testing/GUIA-ARCHITECTURE-TESTING.md | SI |
| frontend/impl/MECANICAS-EDUCATIVAS.md | Parcial (linea 1 es "#") |
| frontend/impl/API-SERVICES.md | Parcial (linea 1 es "#") |

**Observacion:** Algunos archivos tienen frontmatter pero mal posicionado — el `---` aparece despues del titulo h1 (lineas 3-10), no en linea 1. Ejemplos: GUIA-RUNBOOK-POSTGRESQL.md, GUIA-EXPAND-CONTRACT-MIGRATIONS.md, GUIA-ROTACION-SECRETOS.md, testing/GUIA-ARCHITECTURE-TESTING.md. Esto hace que NO sean frontmatter YAML valido para parsers estandar, aunque sigue siendo legible para humanos.

**Conclusión frontmatter real (linea 1 = `---`):** ~9-10 archivos (~6-7%) tienen frontmatter correctamente posicionado.

**Archivos con metadata informal (no frontmatter pero con version/fecha en header):** ~141 (91%) usan este patron alternativo:
```markdown
# Titulo del Documento
**Version:** 1.0.0
**Fecha:** 2026-02-14
```

---

## 4. NOMENCLATURA — VIOLACIONES

**Convención esperada:** UPPERCASE-KEBAB-CASE para archivos .md

### 4.1 Archivos con nomenclatura incorrecta (camelCase/PascalCase mezclado)

| Archivo | Problema |
|---------|---------|
| frontend/impl/admin/pages/AdminAlertsPage-Specification.md | CamelCase en nombre |
| frontend/impl/admin/pages/AdminGamificationPage-Specification.md | CamelCase en nombre |
| frontend/impl/admin/pages/AdminUsersPage-Specification.md | CamelCase en nombre |
| frontend/impl/especificaciones/AdminReportsPage-UI-Specification.md | CamelCase en nombre |
| frontend/impl/guides/Frontend-Alert-System-Guide.md | CamelCase en nombre |

### 4.2 Archivos con nomenclatura atipica

| Archivo | Problema |
|---------|---------|
| troubleshooting/BUILD_ERRORS.md | Underscore en vez de guion (BUILD-ERRORS.md esperado) |
| testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh | Extension .sh en directorio de docs |

### 4.3 Nombres de directorio (lowercase — sin estandar uniforme)

Todos los directorios usan lowercase-kebab-case, que es consistente pero diferente del UPPERCASE esperado por el estandar del proyecto. Esto parece ser una decision deliberada (implementada uniformemente) mas que una violacion.

**Violaciones de nombre en archivos: 7 total (5%)**

---

## 5. ARCHIVOS >500 LINEAS

| Archivo | Lineas | Severidad |
|---------|--------|-----------|
| backend/GUIA-DESIGN-PATTERNS-NESTJS.md | 1206 | ALTA — candidato a split |
| backend/GUIA-RUNBOOK-POSTGRESQL.md | 1034 | ALTA — candidato a split |
| backend/impl/API-STANDARDS.md | 733 | MEDIA |
| backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md | 870 | ALTA |
| backend/GUIA-OPENTELEMETRY-NESTJS.md | 750 | MEDIA |
| backend/GUIA-ROTACION-SECRETOS.md | 612 | MEDIA |
| backend/GUIA-DEPENDENCY-RULES.md | 530 | MEDIA |
| deployment/DEPLOYMENT-MASTER.md | 1074 | ALTA (+ DEPRECATED) |
| deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md | 1206 | ALTA (+ DEPRECATED) |
| deployment/GUIA-ACTUALIZACION-PRODUCCION.md | 631 | MEDIA (+ DEPRECATED) |
| deployment/GUIA-VALIDACION-PRODUCCION.md | 666 | MEDIA |
| deployment/GUIA-DOCKER-MULTISTAGE.md | 739 | MEDIA |
| deployment/GUIA-GITHUB-ACTIONS-CICD.md | 690 | MEDIA |
| deployment/_archived/DEPLOYMENT.md | 863 | ALTA (archivado) |
| frontend/GUIA-DETECTIVE-THEME.md | 981 | ALTA |
| frontend/GUIA-WCAG-ACCESSIBILITY.md | 504 | MEDIA |
| frontend/impl/API-ARCHITECTURE.md | 771 | ALTA |
| frontend/impl/API-SERVICES.md | 549 | MEDIA |
| frontend/impl/COMPONENT-PATTERNS.md | 582 | MEDIA |
| frontend/impl/COMPONENTES-UI.md | 520 | MEDIA |
| frontend/impl/ESTRUCTURA-SHARED.md | 548 | MEDIA |
| frontend/impl/GENERATED-API-TYPES.md | 502 | MEDIA |
| frontend/impl/HOOK-PATTERNS.md | 681 | ALTA |
| frontend/impl/MIGRATION-EXAMPLE-GENERATED-TYPES.md | 523 | MEDIA |
| frontend/impl/TESTING-GUIDE.md | 508 | MEDIA |
| REACT-QUERY-MIGRATION-GUIDE.md | 682 | ALTA — misplaced en raiz |
| documentation-master/.../ANALISIS-HALLAZGOS-DETALLADO.md | 555 | MEDIA |
| integration/INTEGRACION-STUDENT-TEACHER.md | 739 | ALTA |
| testing/GUIA-E2E-PLAYWRIGHT.md | 1168 | ALTA |
| testing/TESTING-GUIDE.md | 744 | MEDIA |

**Total >500 lineas: 30 de 155 archivos (19.4%)**
**Total >1000 lineas (critico): 5 archivos**

---

## 6. STUBS (<10 LINEAS)

| Archivo | Lineas | Contenido |
|---------|--------|-----------|
| backend/impl/_archived/_INDEX.md | 9 | Solo tabla de 3 filas, sin descripcion |

**Nota:** El limite de _MAP.md minimos (~16 ln) es aceptable ya que son mapas de navegacion, no guias. Los _MAP.md de 16-22 lineas en frontend/impl/ subdirs son consistentes y funcionalmente adecuados (cada uno tiene exactamente 1 archivo que listar).

**Stubs confirmados: 1**

---

## 7. ANALISIS 1FN — CADA ARCHIVO = UN TEMA

### 7.1 Archivos con UN tema (CORRECTO — 1FN cumplida)

La gran mayoria de archivos cumplen 1FN. Ejemplos de buena practica:
- Toda la familia ERR-BE-XXX, ERR-DB-XXX, ERR-FE-XXX, ERR-INT-XXX: 1 error por archivo
- GUIA-ROTACION-SECRETOS.md: solo rotacion de secretos
- GUIA-CORS-PRODUCCION.md: solo CORS
- GUIA-SSL-AUTOFIRMADO.md: solo SSL autofirmado
- GUIA-SSL-NGINX-PRODUCCION.md: solo SSL en Nginx (similar al anterior, posible 2FN)
- TEACHER-TYPES-REFERENCE.md, TEACHER-CONSTANTS-REFERENCE.md: un dominio por archivo

### 7.2 Violaciones 2FN — Multiples temas independientes en un archivo

| Archivo | Violacion | Severidad |
|---------|-----------|-----------|
| REACT-QUERY-MIGRATION-GUIDE.md | Mezcla patron de migracion + referencia de API + ejemplos de uso + configuracion. Es en realidad 3 guias distintas. | MEDIA |
| backend/GUIA-DESIGN-PATTERNS-NESTJS.md | GoF patterns + NestJS DI patterns + TypeORM patterns + Frontend patterns — 4 contextos distintos | ALTA |
| backend/GUIA-RUNBOOK-POSTGRESQL.md | Operaciones rutinarias + Troubleshooting + Backup/restore + Monitoring + Performance — 5 dominios | ALTA |
| backend/impl/API-STANDARDS.md | Nomenclatura + URLs + Request/Response + Auth + Rate limiting + Swagger + Error codes — 7 secciones independientes | MEDIA (aceptable como estandar consolidado) |
| frontend/impl/API-ARCHITECTURE.md | Arquitectura Axios + Modulos API + Hooks + Convenciones + Testing de API — 5 temas | MEDIA |
| deployment/GUIA-VALIDACION-PRODUCCION.md | Validacion rapida post-deploy + Validacion completa de BD + Errores comunes + Scripts diagnostico — 4 temas | MEDIA |
| testing/TESTING-GUIDE.md | Backend testing (Jest) + Frontend testing (Vitest) + E2E (descripcion) — 3 tecnologias diferentes | ALTA |
| integration/INTEGRACION-STUDENT-TEACHER.md | Flujo de datos + Endpoints requeridos + Triggers BD + Estructura de datos — 4 capas distintas | MEDIA |
| frontend/impl/TIPOS-CONSOLIDATION-* (3 archivos) | Analisis, Plan y Validacion son 3 fases de una misma tarea. La 1FN se cumple por archivo pero el conjunto deberia unificarse o estar en un directorio con _INDEX | BAJA |

### 7.3 Cuasi-duplicados (contenido solapado)

| Par / Grupo | Solapamiento |
|-------------|-------------|
| deployment/GUIA-SSL-AUTOFIRMADO.md + deployment/GUIA-SSL-NGINX-PRODUCCION.md | Ambos tratan SSL para produccion — temas muy proximos |
| frontend/impl/API-ARCHITECTURE.md + frontend/impl/API-INTEGRATION.md + frontend/impl/API-SERVICES.md | Tres archivos sobre el mismo dominio (API frontend). Possible que 1FN se cumpla pero la separacion no es clara |
| testing/TESTING-GUIDE.md + backend/impl/TESTING-GUIDE.md + frontend/impl/TESTING-GUIDE.md | Tres archivos con el mismo nombre en distintos niveles — el de raiz testing/ es general pero solapa con los otros dos |
| INTEGRACION-STUDENT-TEACHER.md + DEPENDENCIAS-STUDENT-TEACHER.md | El autor declara que son complementarios, pero ambos cubren las dependencias entre portales desde angulos distintos |

---

## 8. ANALISIS documentation-master/ — UBICACION CORRECTA?

### 8.1 Contenido

El directorio `docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/` contiene:
- **GAMILIT-DOCUMENTATION-MASTER.md**: Informe maestro del analisis de documentacion en 7 fases (CAPVED), generado 2026-01-22
- **ANALISIS-HALLAZGOS-DETALLADO.md**: Hallazgos detallados del mismo analisis
- **7 subdirectorios de fases** (fase-0 a fase-7): artefactos de un ejercicio de analisis puntual:
  - fase-0: validacion de inventarios (1 .md)
  - fase-1: catalogo de paginas (1 .yml + 1 .md)
  - fase-2 a fase-5: mapas de datos por portal (solo .yml)
  - fase-6: matriz de coherencia (.yml)
  - fase-7: resumen ejecutivo (1 .md)

### 8.2 Diagnostico de ubicacion

**Veredicto: UBICACION INCORRECTA**

Este contenido NO es una "guia de implementacion". Es un **informe de auditoria de documentacion** generado en un punto especifico del tiempo (2026-01-22). Corresponde a una de estas ubicaciones:

- **Opcion A (correcta):** `orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/` — es una tarea de auditoria completada
- **Opcion B (aceptable):** `docs/99-delivery/` — es un entregable puntual de analisis
- **Opcion C (aceptable alternativa):** `orchestration/referencias/` — si se mantiene como referencia

**Problemas adicionales de este directorio:**
1. Doble anidamiento innecesario: `documentation-master/GAMILIT-DOCUMENTATION-MASTER/` — el nombre del dir padre y el del hijo son redundantes
2. 10 subdirectorios sin ningun _INDEX.md ni _MAP.md
3. Las fases fase-2 a fase-6 solo contienen archivos .yml (artefactos de datos, no documentos navegables)
4. El contenido de STUDENT-PAGE-COMPONENTS-MAP.yml (567 ln), PAGES-CATALOG-GAMILIT.yml (508 ln) son inventarios que deberian estar en `orchestration/inventarios/`
5. El ANALISIS-HALLAZGOS-DETALLADO.md (555 ln) viola la regla de 500 ln

---

## 9. RESUMEN EJECUTIVO DE HALLAZGOS

### 9.1 Conteos globales

| Metrica | Valor |
|---------|-------|
| Total archivos | 161 |
| Total .md | 155 |
| Total otros (.yml, .sh) | 6 |
| Directorios | 41 |
| Con _INDEX.md | 4 (10%) |
| Con _MAP.md | 22 (54%) |
| Sin ningun indice de navegacion | 19 dirs (46%) |
| Con frontmatter YAML valido (linea 1 = ---) | ~10 (6-7%) |
| Archivos >500 lineas | 30 (19.4%) |
| Archivos >1000 lineas (critico) | 5 (3.2%) |
| Stubs (<10 lineas) | 1 |
| Violaciones de nomenclatura (archivos) | 7 (4.5%) |
| Violaciones 2FN confirmadas | 8 archivos |
| Archivos DEPRECATED activos | 3 (deployment/) |

### 9.2 Hallazgos criticos ordenados por impacto

**CRITICO-1 — _INDEX.md ausente en 37/41 directorios (90%)**
La convenccion del proyecto requiere _INDEX.md en cada directorio. Solo 4 lo tienen. Los 37 restantes carecen de punto de entrada de navegacion oficial. Nota: en la practica, el proyecto usa _MAP.md como navegacion (22 presentes), pero el estandar de docs requiere ambos con roles distintos.

**CRITICO-2 — documentation-master/ mal ubicado**
El contenido es un informe de auditoria puntual, no una guia de implementacion. Debe moverse a `orchestration/tareas/` o `docs/99-delivery/`. Los 10 subdirectorios sin ningun indice agravan el problema.

**CRITICO-3 — 5 archivos >1000 lineas**
GUIA-DESIGN-PATTERNS-NESTJS.md (1206), GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md (1206, ademas DEPRECATED), DEPLOYMENT-MASTER.md (1074, ademas DEPRECATED), GUIA-RUNBOOK-POSTGRESQL.md (1034), GUIA-E2E-PLAYWRIGHT.md (1168). Todos candidatos a split.

**CRITICO-4 — REACT-QUERY-MIGRATION-GUIDE.md en raiz de 50-guides/**
Un archivo de 682 lineas que deberia estar en `frontend/` o `frontend/impl/`. La raiz de 50-guides/ deberia contener solo el _INDEX.md, README.md y archivos de gobernanza general.

**ALTO-1 — 30 archivos >500 lineas (19.4%)**
Incluyendo varios archivos DEPRECATED en deployment/ que deberan eliminarse o reducirse significativamente.

**ALTO-2 — 3 archivos deployment/ marcados DEPRECATED pero aun activos**
DEPLOYMENT-MASTER.md, GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md y GUIA-ACTUALIZACION-PRODUCCION.md tienen banner DEPRECATED pero siguen en el directorio activo (no en _archived/). Deberian moverse a _archived/.

**ALTO-3 — Violaciones 2FN en 8 archivos**
Especialmente GUIA-DESIGN-PATTERNS-NESTJS.md (4 dominios mezclados), GUIA-RUNBOOK-POSTGRESQL.md (5 dominios), testing/TESTING-GUIDE.md (3 stacks de testing).

**MEDIO-1 — testing/impl/ contiene un .sh (script de shell)**
`MANUAL-TESTING-GUIDE-US-AE-007.sh` en un directorio de documentacion. Deberia estar en `apps/backend/test/scripts/` o similar.

**MEDIO-2 — 7 archivos con nombre incorrecto**
5 con CamelCase (admin/pages/, especificaciones/, guides/) y BUILD_ERRORS.md con underscore.

**MEDIO-3 — frontend/ y testing/ sin ningun indice ni mapa**
Los dos directorios de segundo nivel con mas contenido (frontend/ 2 archivos directos, testing/ 5 archivos) no tienen _INDEX.md ni _MAP.md.

**BAJO-1 — Frontmatter solo en ~6-7% de archivos**
El estandar SIMCO requiere frontmatter. Solo los archivos creados en 2026-02-14 en adelante lo tienen consistentemente.

**BAJO-2 — Stub unico: backend/impl/_archived/_INDEX.md (9 lineas)**
Funciona como stub minimo pero esta por debajo del umbral de 10 lineas.

**BAJO-3 — Directorio integration/websocket/ solo tiene _MAP.md (stub de 44 lineas)**
La documentacion de WebSocket fue eliminada (nota en el _MAP.md lo explica) pero el directorio permanece vacio de contenido real.

---

## 10. COHERENCIA ENTRE _INDEX.md Y _MAP.md

En este proyecto se uso una estrategia mixta:

| Patron | Uso |
|--------|-----|
| _INDEX.md (tabla de contenidos con descripcion) | Solo en: 50-guides/, backend/impl/, backend/impl/_archived/, deployment/ |
| _MAP.md (mapa de navegacion con estado) | Usado en: deployment/, backend/impl/, y todos los subdirs de frontend/impl/, testing/impl/, integration/websocket/, troubleshooting/errores-comunes/ y sus subdirs |
| Ninguno | backend/, backend/impl/dto/, todas las ramas de documentation-master/, frontend/, frontend/impl/types/, integration/, testing/, troubleshooting/ |

**El problema es la inconsistencia:** algunos dirs tienen _INDEX, otros _MAP, otros ambos (deployment/, backend/impl/), otros ninguno. No hay un estandar aplicado uniformemente.

---

## 11. ANALISIS ADICIONAL — ARCHIVOS MISPLACED O CATEGORIAS INCORRECTAS

| Archivo | Ubicacion actual | Ubicacion sugerida |
|---------|-----------------|-------------------|
| REACT-QUERY-MIGRATION-GUIDE.md | 50-guides/ (raiz) | 50-guides/frontend/impl/ o 50-guides/frontend/ |
| GUIA-RESPONSIVE-TESTING.md | 50-guides/ (raiz) | 50-guides/testing/ |
| GUIA-REFERENCIAS-SIMCO.md | 50-guides/ (raiz) | orchestration/ o mantener como referencia cruzada |
| testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh | docs/50-guides/testing/impl/ | apps/backend/test/scripts/ o apps/backend/test/ |
| documentation-master/ (rama entera) | docs/50-guides/ | orchestration/tareas/ o docs/99-delivery/ |
| backend/GUIA-CREAR-BASE-DATOS.md | backend/ | Marcado como "Legacy (no canonico)" — deberia ir a _archived/ |

---

## 12. EVALUACION GENERAL

**Health Score estimado: 52/100**

| Criterio | Peso | Score | Justificacion |
|----------|------|-------|---------------|
| _INDEX.md cobertura | 20 | 4/20 | Solo 4/41 dirs (10%) |
| _MAP.md / navegacion | 15 | 8/15 | 22/41 (54%), pero inconsistente |
| 1FN (un tema por archivo) | 20 | 15/20 | ~8 violaciones sobre 155 archivos |
| Frontmatter | 10 | 1/10 | ~6-7% cumplimiento |
| Nomenclatura | 10 | 8/10 | 7 violaciones (5%), relativamente bajo |
| Tamano de archivos | 10 | 5/10 | 30 archivos (19%) >500 ln |
| Ubicacion de contenido | 10 | 6/10 | documentation-master misplaced, 3 archivos DEPRECATED activos |
| Stubs | 5 | 4/5 | Solo 1 stub real |

**Fortalezas:**
- La familia troubleshooting/errores-comunes/ es ejemplar: 1 error por archivo, nombre estandar ERR-{DOMINIO}-{NUM}-desc, _MAP.md en cada subdir
- Los archivos de backend/ creados en 2026-02-14 tienen frontmatter YAML valido y consistente
- La estructura general de subdirectorios es logica y navegable
- deployment/ tiene ambos _INDEX.md y _MAP.md (unica rama completamente indexada)

**Debilidades principales:**
- Ausencia de _INDEX.md en 37/41 directorios
- documentation-master/ conceptualmente misplaced (no es una guia)
- 5 archivos >1000 lineas requieren split inmediato
- 3 archivos DEPRECATED no movidos a _archived/
- Frontmatter a nivel del 6-7% (objetivo deberia ser 100%)

---

*Auditoria completada: 2026-02-27*
*Modo: ANALYSIS (read-only)*
*Archivos leidos: 161 (completo)*
