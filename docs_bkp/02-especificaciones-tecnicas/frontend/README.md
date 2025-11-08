# Especificaciones Técnicas - Frontend

**Estado:** 📋 Carpeta preparada para contenido futuro
**Fecha creación:** 2025-11-02
**Propósito:** Documentación técnica específica de frontend (Angular)

---

## Contenido Planeado

Esta carpeta está destinada a contener especificaciones técnicas de la implementación de frontend:

### 1. Arquitectura de Frontend
- Estructura de la aplicación Angular
- Organización de módulos y componentes
- Patrones arquitectónicos (feature modules, shared modules, core module)

### 2. State Management
- NgRx store structure
- Actions, Reducers, Selectors
- Effects y middleware
- State normalization

### 3. Componentes y UI
- Componentes compartidos (shared components)
- Componentes de presentación vs contenedores
- Component library documentation
- Angular Material customization

### 4. Routing y Navegación
- Estructura de rutas
- Guards y resolvers
- Lazy loading strategy
- Route params y query params

### 5. Services e Integraciones
- HTTP services (API clients)
- WebSocket services
- Local storage services
- Authentication y authorization services

### 6. Testing Frontend
- Unit testing con Jest
- Integration testing
- E2E testing con Cypress
- Testing utilities y mocks

---

## Contenido Actual en Otras Carpetas

**Nota:** Parte del contenido de frontend ya existe en otras ubicaciones:

- **Arquitectura general:** `/02-especificaciones-tecnicas/arquitectura/FRONTEND-ARCHITECTURE.md`
- **Testing:** `/02-especificaciones-tecnicas/testing-strategy/` (incluye frontend testing)
- **APIs:** `/02-especificaciones-tecnicas/apis/` (describe endpoints que frontend consume)

**Decisión requerida:**
- ❓ ¿Consolidar contenido frontend disperso aquí?
- ❓ ¿O mantener `arquitectura/FRONTEND-ARCHITECTURE.md` como única referencia?

---

## Estructura Sugerida

```
frontend/
├── README.md (este archivo)
├── ARCHITECTURE.md (estructura app, módulos, patrones)
├── STATE-MANAGEMENT.md (NgRx store, actions, reducers)
├── COMPONENTS.md (componentes compartidos, library)
├── ROUTING.md (rutas, guards, lazy loading)
├── SERVICES.md (HTTP, WebSocket, storage)
├── TESTING.md (unit, integration, E2E)
└── PERFORMANCE.md (optimizaciones, lazy loading, chunking)
```

**Alternativa (si se mantiene en arquitectura/):**
- Eliminar esta carpeta
- Usar solo `arquitectura/FRONTEND-ARCHITECTURE.md`

---

## Estado Actual

**Archivos:** 0 (carpeta vacía)
**Contenido relacionado:** Ver `arquitectura/FRONTEND-ARCHITECTURE.md`

**Acción recomendada:** Decidir si consolidar o eliminar carpeta

---

**Última actualización:** 2025-11-02
**Creado por:** VALIDATOR (Ciclo 2, Fase 2.5)
