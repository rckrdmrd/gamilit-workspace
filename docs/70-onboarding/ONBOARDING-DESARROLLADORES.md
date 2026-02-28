---
titulo: "Onboarding para Desarrolladores"
tipo: onboarding
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Onboarding para Desarrolladores

> Guia para desarrolladores humanos que se unen al proyecto gamilit

## Requisitos Previos

### Herramientas Instaladas
```bash
## Verificar versiones
node --version    # >= 18.x (recomendado 20.x)
npm --version     # >= 9.x
git --version     # >= 2.30
psql --version    # PostgreSQL >= 15
```

### Accesos Requeridos
- [ ] Cuenta en GitHub (repo: rckrdmrd/gamilit-workspace)
- [ ] Acceso a base de datos de desarrollo
- [ ] Variables de entorno compartidas (.env)

---

## Configuracion Inicial

### 1. Clonar el Repositorio
```bash
## Monorepo - clon simple (NO hay submodules)
git clone git@github.com:rckrdmrd/gamilit-workspace.git
cd gamilit-workspace
```

### 2. Instalar Dependencias
```bash
## Backend (NestJS 11)
cd apps/backend
npm install

## Frontend (React 19 + Vite 6.x)
cd apps/frontend
npm install
```

### 3. Configurar Variables de Entorno
```bash
## Copiar template
cp .env.example .env

## Valores de desarrollo:
## DATABASE_HOST=127.0.0.1
## DATABASE_PORT=5432
## DATABASE_NAME=gamilit_platform
## DATABASE_USER=gamilit_user
## DATABASE_PASSWORD=gamilit_dev_2026
## REDIS_HOST=127.0.0.1
## REDIS_PORT=6379
## REDIS_DB=0
## BACKEND_PORT=3006
## FRONTEND_PORT=3005
```

### 4. Inicializar Base de Datos
```bash
## Crear base de datos
createdb gamilit_platform

## Ejecutar DDL completo (18 schemas, 173 tablas)
bash apps/database/scripts/recreate-database.sh

## Cargar seeds (datos iniciales)
cd apps/database/seeds
## Ejecutar scripts de seeds segun documentacion
```

### 5. Verificar Setup
```bash
## Backend
cd apps/backend
npm run build    # Debe compilar sin errores
npm run lint     # Debe pasar sin errores
npm run test     # 2324 tests (2296 passed + 28 skipped) deben pasar

## Frontend
cd apps/frontend
npm run build      # Debe compilar sin errores
npm run lint       # Debe pasar sin errores
npm run typecheck  # Debe pasar sin errores
```

---

## Estructura del Proyecto

```
gamilit-workspace/
├── CLAUDE.md                 # Instrucciones para agentes IA (leer primero)
├── ecosystem.config.js       # PM2 config (backend:3006, frontend:3005)
├── apps/                     # MONOREPO (todo en mismo repo Git)
│   ├── backend/              # NestJS 11 (23 modulos, 914 endpoints)
│   │   └── src/modules/      # Modulos del backend (@BACKEND)
│   ├── frontend/             # React 19 + Zustand + TailwindCSS
│   │   └── src/              # Codigo frontend (@FRONTEND)
│   ├── database/             # PostgreSQL 15 DDL
│   │   ├── ddl/              # Definiciones de tablas (@DDL)
│   │   └── seeds/            # Datos iniciales (@SEEDS)
│   └── devops/               # Scripts de deployment
├── docs/                     # Documentacion del producto
│   ├── 00-overview/          # Vision, modulos, metricas
│   ├── 10-requirements/      # Requerimientos (epics, user stories)
│   ├── 20-architecture/      # Arquitectura, stack, modelo datos
│   ├── 30-ux-ui/             # Wireframes, mockups, flujos
│   ├── 40-standards/         # Estandares (13+ archivos)
│   ├── 70-onboarding/        # Estas aqui
│   └── 90-adr/               # ADRs del proyecto (39 ADRs)
└── orchestration/            # Sistema SIMCO (gobernanza local)
    ├── directivas/           # ~110 archivos SIMCO
    ├── agents/               # 42 perfiles de agente
    ├── inventarios/          # 8 YAMLs SSOT
    └── work-items/           # Epics/sprints tracking
```

---

## Flujo de Trabajo

### Antes de Empezar una Tarea
1. **Leer CLAUDE.md** - Reglas criticas del proyecto
2. **Verificar catalogo** - Existe funcionalidad similar? (Regla 2: Anti-duplicacion)
3. **Revisar dependencias** - Que archivos se afectan?

### Durante el Desarrollo
1. **Seguir estandares** - [ESTANDAR-CODIGO.md](../40-standards/ESTANDAR-CODIGO.md)
2. **Commits atomicos** - Un cambio logico por commit
3. **Tests** - Escribir tests para codigo nuevo (objetivo 80% coverage)
4. **Flujo DDL-first** - DDL -> Entity -> Endpoints -> Frontend -> Tests

### Antes de Commit
```bash
## Validar todo
cd apps/backend && npm run build && npm run lint && npm run test
cd apps/frontend && npm run build && npm run lint && npm run typecheck
```

### Formato de Commits
```
[GAM-XXX] Descripcion breve

Descripcion mas larga si es necesario.
```

Tipos: `[GAM-FEAT]`, `[GAM-FIX]`, `[GAM-DOC]`, `[GAM-REFACTOR]`, `[GAM-TEST]`, `[GAM-CHORE]`

---

## Modulos del Sistema

### Core Infrastructure (7 modulos)
- **auth** - JWT + Passport + RBAC, multi-tenant (100%)
- **users** - User management, roles academicos (100%)
- **tenants** - Multi-tenancy con RLS (100%)
- **core** - Utilidades compartidas (100%)
- **health** - Health checks (100%)
- **settings** - Configuracion del sistema (100%)
- **notifications** - Email, push, in-app, SMS (90%)

### Educational Content (5 modulos)
- **modules** - 5 modulos educativos (literal a critica) (95%)
- **exercises** - 23 tipos de ejercicio (95%)
- **content** - Gestion de contenido educativo (95%)
- **classrooms** - Gestion de aulas (90%)
- **students** - Perfiles, progreso (90%)

### Gamification (7 modulos)
- **gamification** - XP, rangos maya, achievements, ML coins (95%)
- **leaderboard** - Rankings, competencias (85%)
- **missions** - Quests, misiones diarias/semanales (85%)
- **store** - Tienda virtual con ML Coins (75%)
- **achievements** - Badges, milestones, rangos maya (90%)
- **social** - Interacciones sociales, equipos (50%)

### Support (4 modulos)
- **teachers** - Herramientas docentes (95%)
- **parents** - Portal padres (100%)
- **analytics** - Learning analytics (85%)
- **reports** - Reportes de progreso (75%)

---

## Portales (4)

| Portal | Estado | Paginas |
|--------|--------|---------|
| Estudiante | ~100% | Dashboard, ejercicios, gamificacion, leaderboards |
| Maestro | ~95% | Gestion aulas, asignaciones, reportes (19 paginas) |
| Administrador | ~90% | Contenido, sistema, analytics, usuarios (18 paginas) |
| Padres | 100% | Vinculacion, progreso, notificaciones |

---

## Comandos Frecuentes

### Desarrollo
```bash
## Backend - modo desarrollo (puerto 3006)
cd apps/backend && npm run start:dev

## Frontend - modo desarrollo (puerto 3005)
cd apps/frontend && npm run dev
```

### Base de Datos
```bash
## Recrear base de datos completa desde DDL
bash apps/database/scripts/recreate-database.sh

## Conectar a PostgreSQL
psql -U gamilit_user -d gamilit_platform -h 127.0.0.1
```

### Testing
```bash
## Todos los tests (2324 tests, 2296 passed + 28 skipped)
cd apps/backend && npm run test

## Tests en modo watch
npm run test:watch

## Cobertura
npm run test:cov
```

---

## Ambientes

| Aspecto | Dev (Local) | Prod (74.208.126.102) |
|---------|-------------|----------------------|
| Backend | http://localhost:3006 | https://74.208.126.102 (Nginx:443) |
| Frontend | http://localhost:3005 | https://74.208.126.102 (Nginx:443) |
| DB Host | 127.0.0.1 | localhost |
| SSL | Sin SSL | Nginx + Certbot |
| Deploy | npm run dev | PM2 fork mode |
| Swagger | Habilitado | Deshabilitado |

---

## Recursos de Aprendizaje

### Documentacion del Proyecto
- [CLAUDE.md](../../CLAUDE.md) - Punto de entrada principal
- [Estandares](../40-standards/) - 13+ estandares de codigo
- [ADRs](../90-adr/) - 39 decisiones arquitectonicas
- [Arquitectura](../20-architecture/) - Stack y modelo de datos

### Stack Tecnologico
- [NestJS Docs](https://docs.nestjs.com/) - Backend framework
- [React Docs](https://react.dev/) - Frontend framework
- [TypeORM Docs](https://typeorm.io/) - ORM
- [Tailwind CSS](https://tailwindcss.com/docs) - Estilos
- [Zustand](https://docs.pmnd.rs/zustand/) - State management
- [Socket.IO](https://socket.io/docs/v4/) - Real-time

---

## Checklist de Onboarding

- [ ] Clone el repositorio monorepo
- [ ] Instale dependencias en backend y frontend
- [ ] Configure variables de entorno (.env)
- [ ] Base de datos gamilit_platform funcionando (18 schemas)
- [ ] Build y lint pasan en backend y frontend
- [ ] 2324 tests (2296 passed + 28 skipped) pasan en backend
- [ ] Lei CLAUDE.md completo
- [ ] Lei documentacion de estandares
- [ ] Entiendo el flujo de commits [GAM-XXX]
- [ ] Entiendo la estructura monorepo (apps/backend, apps/frontend, apps/database)
- [ ] Conozco los 4 portales y 23 modulos
