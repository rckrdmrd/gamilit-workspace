# 📖 Standards - GAMILIT Platform

**Carpeta:** `docs/standards/`
**Propósito:** Estándares y convenciones obligatorias para el proyecto
**Última actualización:** 2025-11-07

---

## 🎯 ¿Qué encontrarás aquí?

Esta carpeta contiene **estándares obligatorios** que todos los desarrolladores deben seguir para mantener consistencia y calidad en el codebase.

**Audiencia:**
- Todos los desarrolladores (backend, frontend, full-stack)
- Tech Leads
- Code reviewers
- Nuevos miembros del equipo

**Enforcement:**
- **Automático:** ESLint, Prettier, TypeScript compiler, Husky hooks
- **Manual:** Code reviews, PR approvals, CI/CD gates

---

## 📚 Estándares Disponibles

### ✅ Estándares Completados

#### [CODING-STANDARDS.md](./CODING-STANDARDS.md)
**Owner:** @tech-lead
**Última actualización:** 2025-11-07
**Enforcement:** ESLint, Prettier, TypeScript, Code reviews

**Qué contiene:**
- **General Principles:** DRY, KISS, YAGNI
- **TypeScript Standards:**
  - Strict mode enabled
  - No `any` types (usar `unknown` o genéricos)
  - Prefer `const` over `let`, no `var`
  - Explicit return types
- **React Standards:**
  - Functional components + hooks (no class components)
  - Props interface siempre tipada
  - Max 300 líneas por componente
  - Un componente por archivo
  - Custom hooks con prefijo `use`
- **Backend Standards:**
  - Controllers: max 10 endpoints
  - Validación con Zod
  - Lógica de negocio en Services
  - Dependency injection
- **Database Standards:**
  - Prepared statements (NO string interpolation - SQL injection risk)
  - Índices para queries frecuentes
  - RLS policies para security
  - Transactions para operaciones atómicas
- **Naming Conventions:**
  - Variables/Functions: camelCase
  - Classes/Interfaces: PascalCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case
  - Database: snake_case
- **Comments and Documentation:**
  - JSDoc para funciones públicas
  - Inline comments explican "por qué", no "qué"
  - TODO comments con owner
- **Testing Standards:**
  - Coverage mínimo: 70% (current: backend 15%, frontend 13%)
  - Test naming: `should [expected] when [condition]`
  - AAA pattern (Arrange, Act, Assert)
- **Error Handling:**
  - Try-catch para async operations
  - Log errors con context
- **Performance:**
  - Evitar N+1 queries
  - Memoization en React para cálculos costosos
- **Security:**
  - Sanitize user input
  - Secrets en environment variables

**Cuándo leerlo:**
- **Primer día** como nuevo desarrollador
- Antes de escribir código nuevo
- Durante code reviews
- Cuando tengas dudas sobre convenciones

---

#### [GIT-WORKFLOW.md](./GIT-WORKFLOW.md)
**Owner:** @tech-lead
**Última actualización:** 2025-11-07
**Enforcement:** Branch protection, PR templates, Code reviews

**Qué contiene:**
- **Branch Strategy:**
  - `main` - Production (protected)
  - `develop` - Integration (planeado)
  - `feature/*` - Nuevas features
  - `fix/*` - Bug fixes
  - `hotfix/*` - Urgent production fixes
  - `docs/*` - Documentation changes
  - `refactor/*` - Refactoring sin cambios funcionales
- **Branch Naming:**
  - Format: `<type>/<ticket-id>-<description>`
  - Example: `feature/GAMI-123-add-achievements-ui`
  - Rules: lowercase, kebab-case, max 50 chars
- **Conventional Commits:**
  - Format: `<type>(<scope>): <description>`
  - Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
  - Examples:
    - `feat(gamification): add ML Coins transfer`
    - `fix(auth): resolve token expiration`
    - `docs(api): update endpoints reference`
- **Pull Request Process:**
  - Before creating PR: update branch, run tests, run lint, run build
  - Use PR template
  - Assign minimum 1 reviewer (2 recommended)
  - Tech Lead must review hotfixes
- **Code Review Guidelines:**
  - For authors: self-review first, respond to all comments
  - For reviewers: check quality, functionality, tests, security, performance, docs
  - Comment types: nit, question, suggestion, blocking
- **Merge Strategies:**
  - Squash and merge (default) - clean history
  - Merge commit - preserve detailed history
  - Rebase and merge - linear history
- **Resolving Conflicts:**
  - Step-by-step guide
  - How to merge main into feature branch
  - How to resolve conflicts in files
- **Git Commands Cheatsheet:**
  - Daily commands (status, diff, add, commit, push, pull)
  - Branch management (create, switch, list, delete)
  - Undo changes (checkout, reset, revert, amend)
  - Stashing (stash, pop, apply, list)
  - History (log, blame, bisect, cherry-pick)

**Cuándo leerlo:**
- **Primer día** antes de crear tu primer branch
- Antes de crear un PR
- Cuando necesites resolver conflicts
- Durante code reviews

---

#### [_MAP.md](./_MAP.md)
**Audiencia:** Agentes IA, Tech Leads
**Última actualización:** 2025-11-07

**Qué contiene:**
- Mapa de navegación de esta carpeta
- Archivos planeados vs completados
- Próximos pasos y roadmap

---

### ⏳ Estándares Planeados

Los siguientes estándares están planeados pero aún no creados:

#### DOCUMENTATION-STANDARDS.md (Pendiente)
**Owner:** @tech-writer
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-300

**Contenido planeado:**
- **Markdown Files:**
  - Nomenclatura (UPPER-CASE-KEBAB.md vs lower-case-kebab.md)
  - Estructura (header con metadata, TOC, secciones, footer)
  - Límites (max 400 líneas excepto justificado)
- **Code Comments:**
  - JSDoc format para funciones públicas
  - Inline comments guidelines (explain "why" not "what")
  - TODO/FIXME format
- **API Documentation:**
  - OpenAPI/Swagger standards
  - Endpoint documentation format
  - Request/response examples
- **README files:**
  - When to create
  - What to include
  - Template format

---

#### CODE-REVIEW-GUIDE.md (Pendiente)
**Owner:** @tech-lead
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-300

**Contenido planeado:**
- **For Authors:**
  - Self-review checklist
  - How to respond to feedback
  - When to request re-review
- **For Reviewers:**
  - What to look for (quality, security, performance)
  - How to give constructive feedback
  - When to approve vs request changes
  - Review time expectations
- **Common Issues:**
  - Code smells to watch for
  - Security red flags
  - Performance anti-patterns
- **Review Etiquette:**
  - Be kind, be constructive
  - Praise good code
  - Ask questions when unsure
  - Link to standards documents

**Nota:** Parcialmente cubierto en GIT-WORKFLOW.md sección "Code Review Guidelines"

---

#### TESTING-STANDARDS.md (Pendiente)
**Owner:** @qa-team
**Prioridad:** P2 (Media)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-300

**Contenido planeado:**
- **Backend Testing (Jest):**
  - Unit test structure
  - Integration test patterns
  - Mocking strategies (databases, APIs)
  - Test fixtures y factories
  - Coverage requirements
- **Frontend Testing (Vitest):**
  - Component test patterns
  - Hook testing
  - User interaction testing
  - API mocking
  - Snapshot testing guidelines
- **E2E Testing:**
  - Playwright/Cypress setup
  - Test organization
  - Page Object Model
- **Test Naming:**
  - Consistent format
  - Descriptive names
- **AAA Pattern:**
  - Arrange, Act, Assert
  - Examples

**Nota:** Parcialmente cubierto en CODING-STANDARDS.md sección "Testing Standards"

---

#### SECURITY-STANDARDS.md (Pendiente)
**Owner:** @security-team
**Prioridad:** P2 (Media)
**Esfuerzo estimado:** 3-4 horas
**Líneas estimadas:** 300-400

**Contenido planeado:**
- **Authentication & Authorization:**
  - JWT best practices
  - Password hashing (bcrypt)
  - Session management
  - Role-based access control (RBAC)
- **Input Validation:**
  - Sanitization rules
  - Zod validation schemas
  - SQL injection prevention
  - XSS prevention
- **Secrets Management:**
  - Environment variables
  - Never commit secrets
  - Secret rotation
- **Database Security:**
  - RLS (Row Level Security) policies
  - Prepared statements
  - Connection pooling limits
- **API Security:**
  - Rate limiting
  - CORS configuration
  - HTTPS enforcement
- **Dependency Security:**
  - npm audit
  - Dependabot
  - Regular updates

---

#### API-DESIGN-STANDARDS.md (Pendiente)
**Owner:** @backend-team
**Prioridad:** P2 (Media)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 200-300

**Contenido planeado:**
- **REST Principles:**
  - Resource naming (nouns, not verbs)
  - HTTP methods (GET, POST, PUT, DELETE, PATCH)
  - Status codes (200, 201, 400, 401, 404, 500, etc.)
- **URL Structure:**
  - `/api/v1/[resource]`
  - Query parameters for filtering
  - Path parameters for IDs
- **Request/Response Format:**
  - JSON only
  - Standard response envelope
  - Error format
- **Pagination:**
  - Limit and offset
  - Cursor-based for large datasets
- **Versioning:**
  - URL versioning (`/api/v1/`)
  - When to bump version
- **Documentation:**
  - OpenAPI/Swagger required
  - Examples for all endpoints

---

## 🗺️ Navegación Rápida

### Por Tipo de Trabajo

**Escribiendo código:**
→ [CODING-STANDARDS.md](./CODING-STANDARDS.md) - TypeScript, React, Backend, Database standards

**Usando Git:**
→ [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Branches, commits, PRs, reviews

**Documentando:**
→ ⏳ DOCUMENTATION-STANDARDS.md (pendiente)

**Reviewando código:**
→ ⏳ CODE-REVIEW-GUIDE.md (pendiente) - Mientras tanto: [GIT-WORKFLOW.md](./GIT-WORKFLOW.md#code-review-guidelines)

**Escribiendo tests:**
→ ⏳ TESTING-STANDARDS.md (pendiente) - Mientras tanto: [CODING-STANDARDS.md](./CODING-STANDARDS.md#testing-standards)

**Preocupado por security:**
→ ⏳ SECURITY-STANDARDS.md (pendiente) - Mientras tanto: [CODING-STANDARDS.md](./CODING-STANDARDS.md#security)

**Diseñando API:**
→ ⏳ API-DESIGN-STANDARDS.md (pendiente)

---

### Por Rol

**Nuevo Developer:**
1. [CODING-STANDARDS.md](./CODING-STANDARDS.md) - Leer completo (día 1)
2. [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Leer completo (día 1)
3. ⏳ CODE-REVIEW-GUIDE.md (día 2)

**Backend Developer:**
1. [CODING-STANDARDS.md](./CODING-STANDARDS.md) - Backend, Database, Testing sections
2. ⏳ API-DESIGN-STANDARDS.md
3. ⏳ SECURITY-STANDARDS.md

**Frontend Developer:**
1. [CODING-STANDARDS.md](./CODING-STANDARDS.md) - React, TypeScript, Testing sections
2. [GIT-WORKFLOW.md](./GIT-WORKFLOW.md)
3. ⏳ TESTING-STANDARDS.md

**Code Reviewer:**
1. [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Code Review Guidelines section
2. ⏳ CODE-REVIEW-GUIDE.md
3. [CODING-STANDARDS.md](./CODING-STANDARDS.md) - Para referencia

---

## 📋 Checklist: ¿Qué estándar necesito?

**Antes de escribir código:**
- ✅ [CODING-STANDARDS.md](./CODING-STANDARDS.md)

**Antes de crear branch:**
- ✅ [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Branch Strategy, Branch Naming

**Antes de hacer commit:**
- ✅ [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Conventional Commits

**Antes de crear PR:**
- ✅ [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Pull Request Process

**Antes de review:**
- ✅ [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Code Review Guidelines
- ⏳ CODE-REVIEW-GUIDE.md (pendiente)

**Antes de escribir tests:**
- ✅ [CODING-STANDARDS.md](./CODING-STANDARDS.md) - Testing Standards
- ⏳ TESTING-STANDARDS.md (pendiente)

**Antes de diseñar API:**
- ⏳ API-DESIGN-STANDARDS.md (pendiente)

---

## 🚨 Enforcement

### Automático

**ESLint:**
```bash
npm run lint        # Check violations
npm run lint:fix    # Auto-fix
```

**Prettier:**
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

**TypeScript:**
```bash
npm run build       # Compile (fails on type errors)
```

**Husky Pre-commit:**
- Ejecuta lint + format automáticamente antes de cada commit

**CI/CD:**
- GitHub Actions valida lint, tests, build en cada PR
- PR no se puede mergear si CI falla

### Manual

**Code Reviews:**
- Mínimo 1 approval requerido
- Reviewers verifican adherencia a standards
- Comentar violaciones con link a estándar específico

**Example comment:**
```
❌ blocking: This function has 80 lines, exceeds max 50 lines per function.
See: docs/standards/CODING-STANDARDS.md#typescript-standards

Please refactor into smaller functions.
```

---

## 💡 Tips para Seguir Standards

### 1. Configura tu Editor

**VS Code settings (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": ["typescript", "typescriptreact"]
}
```

### 2. Usa Pre-commit Hooks

Ya están configurados con Husky - se ejecutan automáticamente.

### 3. Lee Standards en Onboarding

Primera semana como developer:
- **Día 1:** Lee CODING-STANDARDS.md completo
- **Día 1:** Lee GIT-WORKFLOW.md completo
- **Día 2:** Practica creando branch, commit, PR

### 4. Bookmarks

Guarda en bookmarks:
- `docs/standards/CODING-STANDARDS.md`
- `docs/standards/GIT-WORKFLOW.md`

### 5. Pregunta Cuando Tengas Dudas

**Slack channels:**
- #gamilit-help - Preguntas generales
- #gamilit-standards - Discusión sobre standards

**Tech Lead:**
- DM @tech-lead para aclaraciones

---

## 🔗 Enlaces Relacionados

### Dentro del Proyecto

**Documentación:**
- [docs/00-overview/ONBOARDING.md](../00-overview/ONBOARDING.md) - Setup de entorno
- [docs/QUICK-REFERENCE/](../QUICK-REFERENCE/) - Cheatsheets (API, DB, Git)
- [docs/03-desarrollo/](../03-desarrollo/) - Guías detalladas de desarrollo

**Architecture:**
- [docs/adr/](../adr/) - Architecture Decision Records

### Externos

**Style Guides:**
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

**Git:**
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

**Testing:**
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 📞 Contacto

**Preguntas sobre standards:**
- Slack: #gamilit-standards
- Owner: @tech-lead

**Proponer cambio a standard:**
1. Crear issue en GitHub con label "standards"
2. Discutir en #gamilit-standards
3. Si hay consenso, crear PR con cambios
4. Requiere aprobación de Tech Lead + 2 team members

**Reportar violación de standard:**
- En code review: Comentar con link al standard
- Si es sistemático: Reportar a @tech-lead

---

**Última actualización:** 2025-11-07
**Total Standards:** 2 (Completed: 2, Planned: 5)
**Coverage:** Coding, Git, Documentation (partial), Testing (partial), Security (partial)
