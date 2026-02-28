---
titulo: Estandar Frontend Profesional
tipo: estandar-proyecto
version: 2.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-28
status: activo
applies_to:
  - all_frontend_projects
  - react_applications
  - typescript_projects
tags:
  - frontend
  - react
  - typescript
  - patterns
  - performance
  - testing
  - accessibility
---

# Estandar Frontend Profesional

Este documento establece los patrones, practicas y estandares obligatorios para el desarrollo frontend en todos los proyectos del workspace.

> **Nota:** Este es el documento hub. El contenido esta dividido en secciones especializadas en [`estandar-frontend/`](./estandar-frontend/_INDEX.md).

---

## Secciones

| Seccion | Descripcion | Archivo |
|---------|-------------|---------|
| 1. Component Patterns | Compound Components, Render Props, Custom Hooks, Container/Presentational | [01-COMPONENT-PATTERNS.md](./estandar-frontend/01-COMPONENT-PATTERNS.md) |
| 2. State Management Patterns | useState, Context, Zustand | [02-STATE-PERFORMANCE.md](./estandar-frontend/02-STATE-PERFORMANCE.md) |
| 3. Performance Optimization | Memoization, Code Splitting, Virtual Lists | [02-STATE-PERFORMANCE.md](./estandar-frontend/02-STATE-PERFORMANCE.md) |
| 4. Testing Patterns | Unit tests, Component tests, MSW, Query hierarchy | [03-TESTING.md](./estandar-frontend/03-TESTING.md) |
| 5. Accessibility (A11Y) | Semantic HTML, ARIA, Focus Management, Keyboard Nav | [04-ACCESSIBILITY.md](./estandar-frontend/04-ACCESSIBILITY.md) |
| 6. Estructura de Proyecto | Estructura de directorios, nomenclatura, exports | [05-ESTRUCTURA-CHECKLIST.md](./estandar-frontend/05-ESTRUCTURA-CHECKLIST.md) |
| 7. Checklist de Validacion | Pre-commit, componentes, a11y, performance, testing, seguridad | [05-ESTRUCTURA-CHECKLIST.md](./estandar-frontend/05-ESTRUCTURA-CHECKLIST.md) |
| Referencias y Ver tambien | Links externos y estandares complementarios | [05-ESTRUCTURA-CHECKLIST.md](./estandar-frontend/05-ESTRUCTURA-CHECKLIST.md) |

---

## Estandares Complementarios

- [ESTANDAR-FRONTEND-API.md](./ESTANDAR-FRONTEND-API.md) — Ubicacion canonica de APIs, React Query, error handling
- [ESTANDAR-FRONTEND-COMPONENT.md](./ESTANDAR-FRONTEND-COMPONENT.md) — Export patterns, props typing, file naming
- [ESTANDAR-FRONTEND-IMPORTS.md](./ESTANDAR-FRONTEND-IMPORTS.md) — Import order, path aliases, barrels, icon imports
- [ESTANDAR-FRONTEND-TYPES.md](./ESTANDAR-FRONTEND-TYPES.md) — Jerarquia de tipos, anti-duplicados, any policy
- [ESTANDAR-FRONTEND-UX-PATTERNS.md](./ESTANDAR-FRONTEND-UX-PATTERNS.md) — Error/Loading/Empty states, toasts, forms

## Ver tambien

- [PRINCIPIO-SEPARATION-OF-CONCERNS](../../orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md) — Principio de separacion de responsabilidades aplicado a frontend
- [estandar-frontend/_INDEX.md](./estandar-frontend/_INDEX.md) — Indice de secciones
