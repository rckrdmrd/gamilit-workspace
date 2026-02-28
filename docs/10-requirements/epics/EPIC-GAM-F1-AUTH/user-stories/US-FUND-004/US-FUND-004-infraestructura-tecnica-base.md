---
id: "US-FUND-004"
title: "Infraestructura tecnica base"
type: "User Story"
status: "Done"
priority: "Critica"
assignee: "@Backend-Agent, @Frontend-Agent, @DevOps-Agent"
epic: "EAI-001"
story_points: 12
budget: "$4,400 MXN"
sprint: "Sprint-1"
labels: ["infrastructure", "nestjs", "react", "docker", "setup"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-08"
---

# US-FUND-004: Infraestructura técnica base

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 1
**Story Points:** 12 SP
**Presupuesto:** $4,400 MXN
**Prioridad:** Crítica (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como **equipo de desarrollo**, necesitamos **configurar la infraestructura técnica base del proyecto** para **poder desarrollar el MVP de manera eficiente y escalable**.

**Contexto del Alcance Inicial:**
Esta historia establece los fundamentos técnicos del proyecto: setup de NestJS para el backend, React con Vite para el frontend, PostgreSQL con TypeORM, y la estructura de carpetas que se usará durante todo el desarrollo. Es la base sobre la cual se construyen todas las demás historias.

---

## Criterios de Aceptación

### Backend
- [ ] **CA-01:** Proyecto NestJS inicializado con estructura modular
- [ ] **CA-02:** TypeORM configurado con PostgreSQL
- [ ] **CA-03:** Variables de entorno configuradas (.env)
- [ ] **CA-04:** Migraciones de base de datos funcionales
- [ ] **CA-05:** Validación global con class-validator
- [ ] **CA-06:** Swagger configurado para documentación de API
- [ ] **CA-07:** CORS configurado para desarrollo

### Frontend
- [ ] **CA-08:** Proyecto React + Vite inicializado
- [ ] **CA-09:** TypeScript configurado estrictamente
- [ ] **CA-10:** Routing con React Router configurado
- [ ] **CA-11:** Zustand para state management instalado
- [ ] **CA-12:** Axios configurado con interceptors
- [ ] **CA-13:** TailwindCSS configurado para estilos

### DevOps
- [ ] **CA-14:** Docker Compose para desarrollo local
- [ ] **CA-15:** Scripts npm para tareas comunes
- [ ] **CA-16:** ESLint y Prettier configurados
- [ ] **CA-17:** Git hooks con Husky (pre-commit)

### Base de Datos
- [ ] **CA-18:** PostgreSQL 15+ corriendo en Docker
- [ ] **CA-19:** Esquema inicial creado
- [ ] **CA-20:** Seeds básicos cargados

---

## Especificaciones Técnicas

### Backend (NestJS)

**Estructura de Carpetas:**
```
backend/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Root module
│   ├── config/                 # Configuraciones
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── modules/                # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── modules/
│   │   ├── activities/
│   │   └── gamification/
│   └── database/
│       ├── entities/
│       ├── migrations/
│       └── seeds/
├── test/                       # E2E tests
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

**package.json (Backend):**
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/swagger": "^7.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "bcrypt": "^5.1.1"
  },
  "scripts": {
    "start:dev": "nest start --watch",
    "build": "nest build",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "seed": "ts-node src/database/seeds/run-seeds.ts"
  }
}
```

**TypeORM Configuration:**
```typescript
// src/config/database.config.ts
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'gamilit',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false, // NEVER true in production
  logging: process.env.NODE_ENV === 'development',
}
```

### Frontend (React + Vite)

**Estructura de Carpetas:**
```
frontend/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component
│   ├── components/             # Shared components
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Layout components
│   │   └── common/             # Reusable components
│   ├── pages/                  # Page components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── modules/
│   │   └── profile/
│   ├── hooks/                  # Custom hooks
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── dashboard.store.ts
│   │   └── activities.store.ts
│   ├── services/               # API services
│   │   ├── api.ts              # Axios instance
│   │   ├── auth.service.ts
│   │   └── modules.service.ts
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   ├── styles/                 # Global styles
│   └── routes/                 # Route definitions
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**package.json (Frontend):**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.14.0",
    "zustand": "^5.0.0",
    "axios": "^1.4.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5",
    "typescript": "^5.0.2",
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src/"
  }
}
```

**Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true,
      }
    }
  }
})
```

### Docker Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: gamilit-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gamilit
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gamilit-backend
    ports:
      - "3006:3006"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_DATABASE: gamilit
      JWT_SECRET: development-secret-key
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: gamilit-frontend
    ports:
      - "3005:3005"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Variables de Entorno

**.env.example (Backend):**
```env
## Application
NODE_ENV=development
PORT=3006
APP_URL=http://localhost:3006

## Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=gamilit

## JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

## Email (para US-FUND-001)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**.env.example (Frontend):**
```env
VITE_API_URL=http://localhost:3006/api
VITE_APP_NAME=GAMILIT
```

---

## Dependencias

**Antes:**
- Ninguna (primera historia técnica)

**Después:**
- TODAS las demás historias dependen de esta infraestructura

---

## Definición de Hecho (DoD)

- [x] Todos los proyectos (backend, frontend) se levantan correctamente
- [x] Docker Compose funciona sin errores
- [x] Base de datos conecta exitosamente
- [x] Migraciones corren sin problemas
- [x] Hot reload funciona en desarrollo
- [x] ESLint pasa sin errores
- [x] Prettier configurado
- [x] README con instrucciones de setup
- [x] .env.example creados
- [x] Scripts de npm documentados

---

## Notas del Alcance Inicial

- ✅ Setup básico para desarrollo local
- ✅ Sin CI/CD (agregado en fases futuras)
- ✅ Sin ambiente de staging/production
- ✅ Docker solo para desarrollo
- ✅ Sin monitoreo (Sentry, New Relic, etc.)
- ✅ Sin tests automatizados en CI
- ⚠️ **Extensión futura:** EXT-008-DevOps (CI/CD, staging, production)
- ⚠️ **Extensión futura:** EXT-009-Monitoring (logging, alertas, métricas)

---

## Tareas de Implementación

### Backend (Estimado: 24h, Real: 26h)

**Total Backend:** 26h (~6.5 SP)

- [x] **Tarea B.1:** Setup inicial de NestJS - Estimado: 6h, Real: 6.5h
  - [x] Subtarea B.1.1: Inicializar proyecto NestJS con CLI - 0.5h
  - [x] Subtarea B.1.2: Crear estructura modular de carpetas - 1h
  - [x] Subtarea B.1.3: Configurar tsconfig.json y nest-cli.json - 0.5h
  - [x] Subtarea B.1.4: Instalar dependencias base (@nestjs/*, typeorm, pg) - 1h
  - [x] Subtarea B.1.5: Configurar AppModule con imports - 1.5h
  - [x] Subtarea B.1.6: Crear módulos iniciales (auth, users, etc.) - 2h

- [x] **Tarea B.2:** Configuración de TypeORM y PostgreSQL - Estimado: 6h, Real: 7h
  - [x] Subtarea B.2.1: Configurar TypeORM con PostgreSQL - 2h
  - [x] Subtarea B.2.2: Crear database.config.ts con variables de entorno - 1h
  - [x] Subtarea B.2.3: Setup de migraciones (scripts npm) - 2h
  - [x] Subtarea B.2.4: Crear primera migración de esquema - 1h
  - [x] Subtarea B.2.5: Scripts de seeds básicos - 1h

- [x] **Tarea B.3:** Configuraciones globales - Estimado: 5h, Real: 5h
  - [x] Subtarea B.3.1: ValidationPipe global con class-validator - 1.5h
  - [x] Subtarea B.3.2: Configurar Swagger con DocumentBuilder - 2h
  - [x] Subtarea B.3.3: Configurar CORS para desarrollo - 0.5h
  - [x] Subtarea B.3.4: Global prefix /api/v1 - 0.5h
  - [x] Subtarea B.3.5: Health check endpoint - 0.5h

- [x] **Tarea B.4:** Variables de entorno y seguridad - Estimado: 3h, Real: 3h
  - [x] Subtarea B.4.1: Crear .env.example con todas las variables - 1h
  - [x] Subtarea B.4.2: ConfigModule de NestJS - 1h
  - [x] Subtarea B.4.3: Validación de variables de entorno - 1h

- [x] **Tarea B.5:** ESLint, Prettier, Husky - Estimado: 4h, Real: 4.5h
  - [x] Subtarea B.5.1: Configurar ESLint con reglas NestJS - 1.5h
  - [x] Subtarea B.5.2: Configurar Prettier - 0.5h
  - [x] Subtarea B.5.3: Instalar y configurar Husky - 1h
  - [x] Subtarea B.5.4: Pre-commit hook con lint-staged - 1h
  - [x] Subtarea B.5.5: Scripts npm para lint y format - 0.5h

### Frontend (Estimado: 12h, Real: 12h)

**Total Frontend:** 12h (~3 SP)

- [x] **Tarea F.1:** Setup de React + Vite - Estimado: 4h, Real: 4h
  - [x] Subtarea F.1.1: Inicializar proyecto con Vite - 0.5h
  - [x] Subtarea F.1.2: Configurar TypeScript estricto - 1h
  - [x] Subtarea F.1.3: Crear estructura de carpetas - 1h
  - [x] Subtarea F.1.4: Instalar dependencias (react-router, zustand, axios) - 1h
  - [x] Subtarea F.1.5: Configurar vite.config.ts con proxy - 0.5h

- [x] **Tarea F.2:** Configuración de TailwindCSS - Estimado: 3h, Real: 3h
  - [x] Subtarea F.2.1: Instalar TailwindCSS - 0.5h
  - [x] Subtarea F.2.2: Configurar tailwind.config.js con tema Maya - 1.5h
  - [x] Subtarea F.2.3: Setup de postcss y autoprefixer - 0.5h
  - [x] Subtarea F.2.4: Crear archivo de estilos globales - 0.5h

- [x] **Tarea F.3:** Axios y servicios base - Estimado: 3h, Real: 3h
  - [x] Subtarea F.3.1: Crear instancia de Axios con baseURL - 1h
  - [x] Subtarea F.3.2: Configurar interceptors básicos - 1.5h
  - [x] Subtarea F.3.3: Crear estructura de services/ - 0.5h

- [x] **Tarea F.4:** ESLint y Prettier frontend - Estimado: 2h, Real: 2h
  - [x] Subtarea F.4.1: Configurar ESLint para React - 1h
  - [x] Subtarea F.4.2: Configurar Prettier - 0.5h
  - [x] Subtarea F.4.3: Scripts npm para lint y format - 0.5h

### DevOps (Estimado: 8h, Real: 8h)

**Total DevOps:** 8h (~2 SP)

- [x] **Tarea D.1:** Docker Compose - Estimado: 5h, Real: 5h
  - [x] Subtarea D.1.1: Crear docker-compose.yml con servicios - 2h
  - [x] Subtarea D.1.2: Dockerfile para backend - 1h
  - [x] Subtarea D.1.3: Dockerfile para frontend - 1h
  - [x] Subtarea D.1.4: Configurar volúmenes y networks - 1h

- [x] **Tarea D.2:** Scripts npm - Estimado: 2h, Real: 2h
  - [x] Subtarea D.2.1: Scripts para desarrollo (start:dev, watch) - 0.5h
  - [x] Subtarea D.2.2: Scripts para build y producción - 0.5h
  - [x] Subtarea D.2.3: Scripts para migraciones y seeds - 0.5h
  - [x] Subtarea D.2.4: Scripts para testing - 0.5h

- [x] **Tarea D.3:** Documentación README - Estimado: 1h, Real: 1h
  - [x] Subtarea D.3.1: README con instrucciones de setup - 0.5h
  - [x] Subtarea D.3.2: Documentar estructura de carpetas - 0.5h

### Testing (Estimado: 4h, Real: 2h)

**Total Testing:** 2h (~0.5 SP)

- [x] **Tarea T.1:** Tests de infraestructura - Estimado: 4h, Real: 2h
  - [x] Subtarea T.1.1: Validar que npm install funciona - 0.5h
  - [x] Subtarea T.1.2: Validar que npm run build funciona - 0.5h
  - [x] Subtarea T.1.3: Validar Docker Compose up - 0.5h
  - [x] Subtarea T.1.4: Smoke tests de conectividad - 0.5h

---

## Resumen de Horas

| Categoría | Estimado | Real | Variación |
|-----------|----------|------|-----------|
| Backend | 24h | 26h | +8.3% |
| Frontend | 12h | 12h | 0% |
| DevOps | 8h | 8h | 0% |
| Testing | 4h | 2h | -50% |
| **TOTAL** | **48h** | **48h** | **0%** |

**Validación:** 12 SP × 4h/SP = 48 horas estimadas ✅

---

## Cronograma Real

**Sprint:** Sprint 1-2 (05-16 Agosto 2024)
**Fecha Inicio Real:** 05 Agosto 2024
**Fecha Fin Real:** 08 Agosto 2024
**Estado:** ✅ Completada
**Notas:** La infraestructura base se completó con éxito. La configuración de TypeORM tomó más tiempo del esperado debido a problemas de compatibilidad de versiones. Docker Compose funcionó perfectamente desde el primer intento. Esta base sólida permitió desarrollar las demás historias con mayor velocidad.

---

## Testing

### Tests de Infraestructura
```bash
## Backend
npm install          # Should complete successfully
npm run build        # Should compile without errors
npm run migration:run # Should run migrations

## Frontend
npm install          # Should complete successfully
npm run build        # Should build production bundle
npm run lint         # Should pass linting

## Docker
docker-compose up -d # Should start all services
curl http://localhost:3006/health # Should return 200
curl http://localhost:3005 # Should serve frontend
```

---

## Estimación

**Desglose de Esfuerzo (12 SP = ~4 días):**
- Backend setup + NestJS: 1 día
- Frontend setup + Vite: 0.75 días
- TypeORM + PostgreSQL: 0.75 días
- Docker configuration: 0.5 días
- ESLint/Prettier/Husky: 0.5 días
- Documentation: 0.25 días
- Testing setup: 0.25 días

**Riesgos:**
- Problemas de compatibilidad entre versiones
- Configuración de Docker puede requerir troubleshooting
- Primera vez configurando toda la stack

---

## Recursos de Referencia

**Documentación:**
- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- React Router: https://reactrouter.com
- Zustand: https://github.com/pmndrs/zustand
- Vite: https://vitejs.dev

**Arquitectura:**
- Clean Architecture principles
- Domain-Driven Design (light)
- Modular monolith approach

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Tech Lead + Equipo Completo
