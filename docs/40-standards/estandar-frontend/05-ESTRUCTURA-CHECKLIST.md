---
title: "Estandar Frontend Profesional - Estructura de Proyecto, Checklist y Referencias"
status: activo
last_updated: "2026-02-28"
parent: "ESTANDAR-FRONTEND-PROFESIONAL.md"
sections: "6-7 + refs"
---

# Estructura de Proyecto, Checklist de Validacion y Referencias

> Secciones 6-7 y Referencias de [Estandar Frontend Profesional](../ESTANDAR-FRONTEND-PROFESIONAL.md)

---

## 6. Estructura de Proyecto

```
src/
├── components/              # Componentes reutilizables globales
│   ├── ui/                  # Componentes base (Button, Input, Modal)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── layout/              # Componentes de layout (Header, Footer, Sidebar)
│
├── features/                # Modulos organizados por feature
│   ├── auth/
│   │   ├── components/      # Componentes especificos de auth
│   │   ├── hooks/           # Hooks especificos de auth
│   │   ├── services/        # API calls de auth
│   │   ├── types/           # Types de auth
│   │   └── index.ts         # Public API del feature
│   ├── users/
│   └── products/
│
├── hooks/                   # Custom hooks globales
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── index.ts
│
├── lib/                     # Utilidades y helpers
│   ├── utils.ts             # Funciones de utilidad
│   ├── formatters.ts        # Formateadores (fechas, numeros, etc.)
│   ├── validators.ts        # Funciones de validacion
│   └── constants.ts         # Constantes de la aplicacion
│
├── services/                # API calls y servicios externos
│   ├── api.ts               # Configuracion base de API (axios/fetch)
│   ├── userService.ts
│   └── productService.ts
│
├── stores/                  # Estado global (Zustand)
│   ├── cartStore.ts
│   └── notificationStore.ts
│
├── contexts/                # React Contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── types/                   # TypeScript types globales
│   ├── api.ts               # Types de respuestas API
│   ├── entities.ts          # Types de entidades
│   └── index.ts
│
├── styles/                  # Estilos globales
│   ├── globals.css
│   └── variables.css
│
├── pages/                   # Paginas (si no usa file-based routing)
│   ├── Home.tsx
│   └── Dashboard.tsx
│
├── App.tsx                  # Componente raiz
├── main.tsx                 # Entry point
└── vite-env.d.ts            # Types de Vite
```

### 6.1 Convenciones de Nomenclatura

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `UserCard.tsx` |
| Hooks | camelCase con prefijo `use` | `useAuth.ts` |
| Servicios | camelCase con sufijo `Service` | `userService.ts` |
| Stores | camelCase con sufijo `Store` | `cartStore.ts` |
| Types | PascalCase | `User.ts` |
| Utilidades | camelCase | `formatDate.ts` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Tests | mismo nombre + `.test.ts(x)` | `UserCard.test.tsx` |

### 6.2 Exports e Imports

```tsx
// features/users/index.ts - Public API del feature
export { UserList } from './components/UserList';
export { UserCard } from './components/UserCard';
export { useUsers } from './hooks/useUsers';
export type { User, UserRole } from './types';

// Importar desde la public API, no desde archivos internos
import { UserList, useUsers, User } from '@/features/users';
```

---

## 7. Checklist de Validacion

### Pre-commit

- [ ] Codigo compila sin errores (`npm run build`)
- [ ] Linting pasa (`npm run lint`)
- [ ] Type checking pasa (`npm run typecheck`)
- [ ] Tests pasan (`npm run test`)
- [ ] No hay console.log en codigo de produccion
- [ ] No hay TODO sin ticket asociado

### Componentes

- [ ] Props tienen tipos TypeScript definidos
- [ ] Componente tiene nombre descriptivo
- [ ] Props destructuradas en la firma de la funcion
- [ ] Valores por defecto para props opcionales
- [ ] Keys unicas en listas
- [ ] Event handlers nombrados como `handle{Evento}`
- [ ] No hay logica de negocio en componentes presentacionales

### Accesibilidad

- [ ] Elementos interactivos son focusables
- [ ] Imagenes tienen alt text
- [ ] Forms tienen labels asociados
- [ ] Colores tienen suficiente contraste (4.5:1 minimo)
- [ ] Navegacion funciona con teclado
- [ ] ARIA labels donde HTML semantico no es suficiente
- [ ] Focus visible en elementos interactivos

### Performance

- [ ] Componentes grandes estan code-split
- [ ] Listas largas (>100 items) usan virtualizacion
- [ ] Memoizacion solo donde esta justificada
- [ ] Imagenes optimizadas y con lazy loading
- [ ] No hay re-renders innecesarios (verificar con React DevTools)

### Testing

- [ ] Cobertura minima 80% en logica critica
- [ ] Tests usan queries semanticas (getByRole preferido)
- [ ] Tests verifican comportamiento, no implementacion
- [ ] Mocking minimo necesario
- [ ] Tests son independientes entre si

### Seguridad

- [ ] No hay secrets en codigo frontend
- [ ] Inputs sanitizados antes de mostrar
- [ ] URLs externas usan `rel="noopener noreferrer"`
- [ ] No usar `dangerouslySetInnerHTML` sin sanitizar

---

## Referencias

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [React Window](https://react-window.vercel.app/)
- [MSW Documentation](https://mswjs.io/docs/)

## Ver tambien

- [PRINCIPIO-SEPARATION-OF-CONCERNS](../../../orchestration/directivas/principios/PRINCIPIO-SEPARATION-OF-CONCERNS.md) - Principio de separacion de responsabilidades aplicado a frontend

### Estandares frontend especificos (complementarios)

Los siguientes estandares definen reglas detalladas para aspectos concretos del desarrollo frontend. Aplican como complemento a este documento:

- [ESTANDAR-FRONTEND-API.md](../ESTANDAR-FRONTEND-API.md) -- Ubicacion canonica de APIs, React Query como estandar, error handling
- [ESTANDAR-FRONTEND-COMPONENT.md](../ESTANDAR-FRONTEND-COMPONENT.md) -- Export patterns, props typing, React imports, file naming
- [ESTANDAR-FRONTEND-IMPORTS.md](../ESTANDAR-FRONTEND-IMPORTS.md) -- Import order (5 grupos), path aliases, barrels, icon imports
- [ESTANDAR-FRONTEND-TYPES.md](../ESTANDAR-FRONTEND-TYPES.md) -- Jerarquia de tipos, anti-duplicados, inline types, any policy
- [ESTANDAR-FRONTEND-UX-PATTERNS.md](../ESTANDAR-FRONTEND-UX-PATTERNS.md) -- Error/Loading/Empty states, toasts, forms, confirmation dialogs
- [ESTANDAR-FRONTEND-CARD-TRUNCATION.md](../ESTANDAR-FRONTEND-CARD-TRUNCATION.md) -- Truncación de texto en cards: line-clamp + title tooltip
