# _MAP: artifacts/

**Última actualización:** 2025-11-07
**Estado:** 🟡 En desarrollo (estructura creada, contenido pendiente)
**Versión:** 2.0

---

## 📋 Propósito de esta Carpeta

Esta carpeta contiene **artefactos generados** por builds, análisis, reportes y herramientas de desarrollo. NO contiene código fuente, solo outputs y productos derivados.

**Objetivo:** Centralizar todos los artefactos generados para facilitar acceso, versionado y análisis histórico.

**Audiencia:**
- Tech Leads
- QA Engineers
- DevOps Engineers
- Stakeholders
- Agentes de IA

---

## 📁 Estructura de Contenido

### Subcarpetas Principales

| Carpeta | Propósito | Generado Por | Owner | Estado | _MAP.md |
|---------|-----------|--------------|-------|--------|---------|
| **diagrams/** | Diagramas de arquitectura (mermaid, plantuml) | Agentes + Manual | @tech-lead @architects | ⚪ Vacío | ✅ |
| **changelogs/** | Changelogs generados automáticamente | Scripts + CI/CD | @tech-lead @devops | ⚪ Vacío | ✅ |
| **reports/** | Reportes de validación, coverage, performance | Tests + Scripts | @qa-team @devops | ⚪ Vacío | ✅ |
|   └─ **coverage/** | Reportes de cobertura de tests | Jest/Vitest | @qa-team | ⚪ Vacío | ✅ |
|   └─ **performance/** | Reportes de performance (Lighthouse, k6) | Performance tests | @qa-team | ⚪ Vacío | ✅ |
|   └─ **validation/** | Reportes de validación de integridad | Validation scripts | @qa-team | ⚪ Vacío | ✅ |

---

## 🗂️ Detalle por Subcarpeta

### diagrams/ (0 archivos)

**Descripción:** Diagramas de arquitectura y flujos

**Tipos de diagramas planeados:**
- Diagramas de arquitectura (C4 model)
- Diagramas de flujo (mermaid)
- Diagramas de secuencia (PlantUML)
- ERD (Entity Relationship Diagrams)
- Diagramas de componentes
- Diagramas de deployment

**Formatos soportados:**
- `.mmd` - Mermaid diagrams
- `.puml` - PlantUML diagrams
- `.svg` - SVG exports
- `.png` - PNG exports

**Generación:**
- Manual (draw.io, Excalidraw)
- Automática (mermaid-cli, plantuml)
- Extractada de código (agentes)

**Estado:** ⚪ Estructura creada, sin contenido
**_MAP.md:** ✅ Existe

**Ejemplo de contenido esperado:**
```
diagrams/
├── architecture/
│   ├── c4-context.mmd
│   ├── c4-container.mmd
│   ├── c4-component-backend.mmd
│   └── c4-component-frontend.mmd
├── flows/
│   ├── auth-flow.mmd
│   ├── quiz-submission-flow.mmd
│   └── gamification-flow.mmd
├── database/
│   ├── erd-full.puml
│   ├── erd-auth-management.puml
│   └── erd-gamification-system.puml
└── deployment/
    ├── deployment-dev.mmd
    ├── deployment-staging.mmd
    └── deployment-prod.mmd
```

---

### changelogs/ (0 archivos)

**Descripción:** Changelogs generados automáticamente

**Tipos de changelogs:**
- CHANGELOG.md por versión
- Release notes
- Migration guides
- Breaking changes lists

**Generación:**
- Automática desde commits (conventional commits)
- CI/CD pipeline
- Manual (tech lead review)

**Formato:**
```markdown
# Changelog

## [2.0.0] - 2025-11-07

### Added
- Feature X
- Feature Y

### Changed
- Backend migrado a monorepo
- Frontend refactorizado

### Fixed
- Bug #123: Fix critical issue

### Removed
- Deprecated API v1
```

**Estado:** ⚪ Estructura creada, sin contenido
**_MAP.md:** ✅ Existe

---

### reports/ (3 subcarpetas, 0 archivos)

**Descripción:** Reportes técnicos generados por tests y análisis

**Subcarpetas:**

#### coverage/ (0 archivos)

**Descripción:** Reportes de cobertura de tests

**Generado por:**
- Jest (backend): `npm run test:cov`
- Vitest (frontend): `npm run test:ui`

**Formatos:**
- HTML reports (coverage/index.html)
- JSON (coverage/coverage-summary.json)
- LCOV (coverage/lcov.info)
- Text (coverage/coverage.txt)

**Contenido esperado:**
```
coverage/
├── backend/
│   ├── index.html
│   ├── coverage-summary.json
│   └── lcov.info
└── frontend/
    ├── index.html
    ├── coverage-summary.json
    └── lcov.info
```

**Estado:** ⚪ Sin contenido
**_MAP.md:** ✅ Existe

---

#### performance/ (0 archivos)

**Descripción:** Reportes de performance y benchmarks

**Generado por:**
- Lighthouse (frontend)
- k6 (backend load testing)
- Artillery (API stress testing)
- Custom benchmarks

**Tipos de reportes:**
- Lighthouse reports (HTML + JSON)
- k6 load testing results
- API response time benchmarks
- Database query performance

**Contenido esperado:**
```
performance/
├── lighthouse/
│   ├── 2025-11-07-desktop.html
│   ├── 2025-11-07-mobile.html
│   └── summary.json
├── load-testing/
│   ├── k6-results-2025-11-07.json
│   └── artillery-report.json
└── benchmarks/
    ├── api-response-times.json
    └── db-query-performance.json
```

**Estado:** ⚪ Sin contenido (tests no implementados)
**_MAP.md:** ✅ Existe

---

#### validation/ (0 archivos)

**Descripción:** Reportes de validación de integridad del sistema

**Generado por:**
- `npm run validate:constants` (detect hardcoding)
- `npm run validate:api-contract` (Backend ↔ Frontend sync)
- Custom validation scripts

**Tipos de validaciones:**
- Constants SSOT compliance
- API contract synchronization
- Type synchronization (Backend ↔ Frontend)
- RLS policies completeness
- Database schema integrity

**Contenido esperado:**
```
validation/
├── constants-validation-2025-11-07.md
├── api-contract-validation-2025-11-07.md
├── type-sync-validation-2025-11-07.md
├── rls-policies-validation-2025-11-07.md
└── schema-integrity-validation-2025-11-07.md
```

**Estado:** ⚪ Sin contenido (validaciones manuales en orchestration/)
**_MAP.md:** ✅ Existe

---

## 📊 Métricas Globales

### Estado Actual

| Categoría | Planeado | Actual | % |
|-----------|----------|--------|---|
| **Diagramas** | 20+ | 0 | 0% |
| **Changelogs** | 5+ versiones | 0 | 0% |
| **Coverage Reports** | 2 (backend/frontend) | 0 | 0% |
| **Performance Reports** | 10+ | 0 | 0% |
| **Validation Reports** | 5+ tipos | 0 | 0% |

### Tamaño Estimado

| Categoría | Tamaño Estimado |
|-----------|-----------------|
| **Diagramas** | ~5 MB |
| **Changelogs** | ~500 KB |
| **Coverage Reports** | ~50 MB (HTML) |
| **Performance Reports** | ~20 MB |
| **Validation Reports** | ~2 MB |
| **TOTAL** | **~77 MB** |

---

## 🔗 Interdependencias

### Esta Carpeta Consume De:

- **apps/backend/** - Tests generan coverage
- **apps/frontend/** - Tests generan coverage
- **docs/** - Diagramas documentan arquitectura
- **orchestration/** - Reportes de análisis
- **.git/** - Commits para changelogs

### Esta Carpeta Alimenta A:

- **CI/CD** - Reports integrados en pipeline
- **Stakeholders** - Changelogs y métricas
- **Developers** - Coverage para mejorar tests
- **QA Team** - Performance benchmarks
- **Tech Leads** - Decisiones basadas en datos

### Flujo de Generación:

```
┌──────────────────────────────────────┐
│    Build / Test / Analyze            │
└────────────────┬─────────────────────┘
                 │
         ┌───────┼───────┐
         ▼       ▼       ▼
    ┌────────┬────────┬────────┐
    │Coverage│Perform.│Validat.│
    └────┬───┴───┬────┴───┬────┘
         │       │        │
         └───────┼────────┘
                 │
         ┌───────▼────────┐
         │  artifacts/    │
         │  reports/      │
         └───────┬────────┘
                 │
         ┌───────▼────────┐
         │   CI/CD        │
         │   Dashboard    │
         └────────────────┘
```

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- **P0-001:** Carpeta completamente vacía
  - **Impacto:** No hay artefactos generados
  - **Razón:** Tests, performance tests, y scripts de generación no implementados
  - **Esfuerzo:** 10-15 horas (implementar generación)

### P1 (Alto)

- **P1-001:** Coverage reports no se generan automáticamente
  - **Solución:** Configurar Jest/Vitest para output en artifacts/
  - **Esfuerzo:** 1 hora

- **P1-002:** Sin integración CI/CD
  - **Solución:** GitHub Actions para generar y subir artifacts
  - **Esfuerzo:** 2 horas

### P2 (Medio)

- **P2-001:** Diagramas deben crearse manualmente
  - **Recomendación:** Generar automáticamente desde código (mermaid-cli)
  - **Esfuerzo:** 4 horas

---

## 📐 Estándares Aplicables

### Nomenclatura de Archivos

**Diagramas:**
- `kebab-case-diagram-type.mmd`
- `architecture-c4-context.svg`

**Changelogs:**
- `CHANGELOG.md` (único, versionado internamente)
- `CHANGELOG-v2.0.0.md` (por versión mayor)

**Reports:**
- `coverage-backend-YYYY-MM-DD.html`
- `performance-lighthouse-YYYY-MM-DD.json`
- `validation-constants-YYYY-MM-DD.md`

### Exclusiones de Git

**Añadir a .gitignore:**
```
# Artifacts (grandes o regenerables)
artifacts/reports/coverage/
artifacts/reports/performance/
*.lcov
*.html (reports)

# Keep
!artifacts/diagrams/
!artifacts/changelogs/
```

---

## 🔍 Validación (Go/No-Go)

### Criterios de Aceptación

- [x] Estructura de carpetas creada
- [x] _MAP.md en todas las subcarpetas
- [x] _MAP.md raíz creado (este archivo)
- [ ] Al menos 1 coverage report generado
- [ ] Al menos 1 performance report generado
- [ ] Al menos 1 validation report generado
- [ ] CHANGELOG.md inicial creado
- [ ] Al menos 5 diagramas creados

**Decisión:** 🟡 **Estructura GO, Contenido NO-GO** - Pendiente implementación

---

## 📞 Contacto y Soporte

**Owner principal:** @tech-lead
**Maintainers:**
- Diagramas: @tech-lead @architects
- Changelogs: @tech-lead @devops
- Coverage: @qa-team
- Performance: @qa-team @devops
- Validation: @qa-team

**Reporte de issues:**
- GitHub Issues: [GAMILIT Artifacts]
- Slack: #gamilit-qa

---

## 🎯 Próximos Pasos

### Fase 1 - Urgente (Esta Semana)

1. ✅ _MAP.md creado (este archivo)
2. ⬜ Configurar Jest/Vitest para output en artifacts/reports/coverage/
3. ⬜ Generar primer coverage report
4. ⬜ Crear CHANGELOG.md inicial

### Fase 2 - Alta Prioridad (Próximas 2 Semanas)

5. ⬜ Crear 5 diagramas principales (C4 architecture)
6. ⬜ Configurar Lighthouse para performance reports
7. ⬜ Implementar validation reports automáticos
8. ⬜ Integrar con GitHub Actions

### Fase 3 - Media Prioridad (Próximo Mes)

9. ⬜ k6 load testing + reports
10. ⬜ Automatizar generación de diagramas desde código
11. ⬜ Dashboard de métricas (Grafana)
12. ⬜ Historical tracking de coverage/performance

---

## 🚀 Configuración de Generación

### Coverage Reports

**Backend (Jest):**
```json
// jest.config.js
{
  "coverageDirectory": "../../artifacts/reports/coverage/backend",
  "coverageReporters": ["html", "json", "lcov", "text"]
}
```

**Frontend (Vitest):**
```typescript
// vite.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../artifacts/reports/coverage/frontend',
      reporter: ['html', 'json', 'lcov', 'text']
    }
  }
}
```

### Performance Reports

**Lighthouse:**
```bash
# Script de ejecución
lighthouse http://localhost:5173 \
  --output=html \
  --output-path=artifacts/reports/performance/lighthouse/$(date +%Y-%m-%d).html
```

**k6:**
```bash
# Script de ejecución
k6 run tests/load-test.js \
  --out json=artifacts/reports/performance/k6/$(date +%Y-%m-%d).json
```

### Validation Reports

**Constants validation:**
```bash
npm run validate:constants > artifacts/reports/validation/constants-$(date +%Y-%m-%d).md
```

---

## 📚 Recursos Adicionales

**Herramientas de generación:**
- [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) - Generar diagramas
- [PlantUML](https://plantuml.com/) - UML diagrams
- [Lighthouse](https://github.com/GoogleChrome/lighthouse) - Performance audits
- [k6](https://k6.io/) - Load testing
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) - Changelogs automáticos

**Dashboards:**
- [Codecov](https://codecov.io/) - Coverage tracking
- [Grafana](https://grafana.com/) - Metrics visualization
- [Datadog](https://www.datadoghq.com/) - APM

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 1 (Mapas P0)
**Próxima actualización:** Tras implementar generación de artifacts
**Versión:** 1.0.0
