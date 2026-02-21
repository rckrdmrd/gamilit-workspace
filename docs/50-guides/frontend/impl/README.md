# Guías de Desarrollo Frontend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28

---

## Índice de Guías

| Guía | Descripción |
|------|-------------|
| [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md) | Estructura de las 9 features |
| [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) | Componentes y utilidades compartidas |
| [COMPONENTES-UI.md](./COMPONENTES-UI.md) | Librería de componentes UI |
| [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) | Zustand y React Query |
| [API-INTEGRATION.md](./API-INTEGRATION.md) | Conexión con backend (resumen) |
| [API-ARCHITECTURE.md](./API-ARCHITECTURE.md) | Arquitectura completa de API clients |
| [SETUP-DEVELOPMENT.md](./SETUP-DEVELOPMENT.md) | Configuración de entorno |
| [TESTING-GUIDE.md](./TESTING-GUIDE.md) | Tests con Vitest y Testing Library |

---

## Quick Start

1. Configurar entorno: [SETUP-DEVELOPMENT.md](./SETUP-DEVELOPMENT.md)
2. Entender estructura: [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md)
3. Usar componentes: [COMPONENTES-UI.md](./COMPONENTES-UI.md)
4. Gestionar estado: [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md)
5. Escribir tests: [TESTING-GUIDE.md](./TESTING-GUIDE.md)

---

## Estandares Frontend Aplicables

Estos estandares en `docs/40-standards/` definen las reglas obligatorias para todo desarrollo frontend:

| Estandar | Aplica a |
|----------|----------|
| [STANDARD-API.md](../../../40-standards/STANDARD-API.md) | Ubicacion de APIs, React Query, error handling |
| [STANDARD-COMPONENT.md](../../../40-standards/STANDARD-COMPONENT.md) | Export patterns, props typing, React imports |
| [STANDARD-IMPORTS.md](../../../40-standards/STANDARD-IMPORTS.md) | Import order, path aliases (@shared/, @/), barrels |
| [STANDARD-TYPES.md](../../../40-standards/STANDARD-TYPES.md) | Jerarquia de tipos, anti-duplicados, any policy |
| [STANDARD-UX-PATTERNS.md](../../../40-standards/STANDARD-UX-PATTERNS.md) | Error/Loading/Empty states, toasts, forms |
| [ESTANDAR-FRONTEND-PROFESIONAL.md](../../../40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md) | Compound components, HOC, performance, testing |

---

## Stack Tecnologico

- **Runtime:** Node.js 20+
- **Framework:** React 19 + Vite 6.x
- **Estado del servidor:** TanStack Query (React Query)
- **Estado del cliente:** Zustand
- **Estilos:** Tailwind CSS
- **Testing:** Vitest + React Testing Library
