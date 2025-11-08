# GAMILIT Frontend

Frontend para la plataforma educativa gamificada GAMILIT.

## Stack Técnico

- **Framework:** React 18+
- **Build Tool:** Vite 5+
- **Language:** TypeScript 5+ (strict mode)
- **Styling:** Tailwind CSS 3+
- **Router:** React Router v6
- **State:** Zustand
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Animations:** Framer Motion
- **Testing:** Vitest + React Testing Library
- **Storybook:** 7+

## Arquitectura

Feature-Sliced Design (FSD)

```
src/
├── shared/         # Código compartido (components, hooks, utils)
├── services/       # API clients, WebSocket
├── app/            # Providers, layouts, routing
├── features/       # Features de negocio
└── pages/          # Páginas/Vistas
```

## Scripts

```bash
npm run dev         # Desarrollo
npm run build       # Build producción
npm run preview     # Preview build
npm test            # Tests
npm run test:ui     # Tests con UI
npm run lint        # Linter
npm run format      # Formatear
npm run storybook   # Storybook dev
```

## Path Aliases

- `@/*` → `src/*`
- `@shared/*` → `src/shared/*`
- `@components/*` → `src/shared/components/*`
- `@hooks/*` → `src/shared/hooks/*`
- `@utils/*` → `src/shared/utils/*`
- `@types/*` → `src/shared/types/*`
- `@services/*` → `src/services/*`
- `@app/*` → `src/app/*`
- `@features/*` → `src/features/*`
- `@pages/*` → `src/pages/*`

## Guía de Estilo

- Mobile-first responsive design
- Dark mode support
- Accesibilidad WCAG 2.1 AA
- Coverage objetivo: ≥70%
