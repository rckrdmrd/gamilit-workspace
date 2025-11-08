# GAMILIT Backend

Backend para la plataforma educativa gamificada GAMILIT.

## Stack Técnico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript 5+ (strict mode)
- **Database:** PostgreSQL 15+
- **Testing:** Jest
- **Linting:** ESLint + Prettier

## Estructura

```
src/
├── shared/         # Código compartido (utils, decorators, types)
├── middleware/     # Middleware de Express
├── config/         # Configuraciones
├── database/       # Conexión DB, migrations, seeds
├── modules/        # Módulos de negocio
└── main.ts         # Entry point
```

## Scripts

```bash
npm run dev         # Desarrollo con hot reload
npm run build       # Build producción
npm run start       # Iniciar producción
npm test            # Ejecutar tests
npm run test:cov    # Tests con coverage
npm run lint        # Linter
npm run format      # Formatear código
```

## Path Aliases

- `@shared/*` → `src/shared/*`
- `@middleware/*` → `src/middleware/*`
- `@config/*` → `src/config/*`
- `@database/*` → `src/database/*`
- `@modules/*` → `src/modules/*`

## Coverage Objetivo

≥70% en branches, functions, lines, statements
