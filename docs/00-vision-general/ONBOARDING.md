# Guía de Onboarding - GAMILIT Platform

**Versión:** 1.0
**Última actualización:** 2025-11-07
**Audiencia:** Nuevos desarrolladores
**Tiempo estimado:** 2-3 horas

---

## 📋 Tabla de Contenidos

1. [Bienvenida](#bienvenida)
2. [Prerrequisitos](#prerrequisitos)
3. [Clonar el Repositorio](#clonar-el-repositorio)
4. [Configurar Base de Datos](#configurar-base-de-datos)
5. [Configurar Backend](#configurar-backend)
6. [Configurar Frontend](#configurar-frontend)
7. [Verificar Instalación](#verificar-instalación)
8. [Siguientes Pasos](#siguientes-pasos)
9. [Troubleshooting](#troubleshooting)
10. [Recursos Útiles](#recursos-útiles)

---

## 🎉 Bienvenida

¡Bienvenido al equipo de GAMILIT Platform! Esta guía te ayudará a configurar tu entorno de desarrollo local en 2-3 horas.

**GAMILIT Platform** es una plataforma educativa gamificada que combina:
- 33 mecánicas educativas de comprensión lectora
- Sistema de gamificación con rangos Maya
- Arquitectura multi-tenant escalable
- Stack moderno: React 19 + NestJS + PostgreSQL

Para entender la visión del producto, lee primero [VISION.md](./VISION.md).

---

## ✅ Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

### Software Requerido

| Software | Versión Mínima | Verificar |
|----------|----------------|-----------|
| **Node.js** | 18.0.0+ | `node --version` |
| **npm** | 9.0.0+ | `npm --version` |
| **PostgreSQL** | 15.0+ | `psql --version` |
| **Git** | 2.0+ | `git --version` |

### Software Recomendado

- **Editor:** VS Code con extensiones:
  - ESLint
  - Prettier - Code formatter
  - TypeScript + JavaScript
  - Tailwind CSS IntelliSense
  - PostgreSQL (Chris Kolkman)

- **Cliente PostgreSQL:** pgAdmin 4 o DBeaver (opcional)
- **Cliente API:** Postman o Insomnia (opcional)
- **Terminal:** iTerm2 (macOS), Windows Terminal (Windows), o terminal nativa

### Instalación de Prerrequisitos

**macOS (usando Homebrew):**
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js (incluye npm)
brew install node

# Instalar PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Verificar instalaciones
node --version  # Debe ser >= 18.0.0
npm --version   # Debe ser >= 9.0.0
psql --version  # Debe ser >= 15.0
```

**Ubuntu/Debian:**
```bash
# Node.js 18+ (usando NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 15+
sudo apt-get install postgresql-15 postgresql-contrib-15

# Verificar instalaciones
node --version
npm --version
psql --version
```

**Windows:**
1. Descargar Node.js 18+ desde https://nodejs.org/
2. Descargar PostgreSQL 15+ desde https://www.postgresql.org/download/windows/
3. Instalar Git desde https://git-scm.com/download/win

---

## 📦 Clonar el Repositorio

### 1. Clonar el monorepo

```bash
# Clonar repositorio (reemplazar con URL real)
git clone https://github.com/YOUR_ORG/gamilit.git
cd gamilit/projects/gamilit

# Verificar estructura
ls -la
# Deberías ver: apps/, docs/, orchestration/, artifacts/, etc.
```

### 2. Explorar la estructura

```bash
# Ver estructura principal
tree -L 2 -d

# Leer documentación clave
cat docs/00-overview/VISION.md
cat README.md
```

---

## 🗄️ Configurar Base de Datos

### 1. Crear base de datos y usuario

```bash
# Iniciar PostgreSQL (si no está corriendo)
# macOS: brew services start postgresql@15
# Ubuntu: sudo systemctl start postgresql
# Windows: Iniciar desde servicios

# Conectar como superusuario
psql postgres

# Crear usuario y base de datos
CREATE USER gamilit_user WITH PASSWORD 'gamilit_dev_2025';
CREATE DATABASE gamilit_platform OWNER gamilit_user;
GRANT ALL PRIVILEGES ON DATABASE gamilit_platform TO gamilit_user;

# Salir
\q
```

### 2. Verificar conexión

```bash
# Conectar a la base de datos
psql -U gamilit_user -d gamilit_platform -h localhost

# Si funciona, verás:
# gamilit_platform=>

# Salir
\q
```

### 3. Ejecutar DDL (Definiciones de esquema)

```bash
# Navegar a carpeta de database
cd apps/database

# Ejecutar esquema base
psql -U gamilit_user -d gamilit_platform -h localhost -f ddl/base-schema.sql

# Ejecutar DDL por schema (orden importante)
psql -U gamilit_user -d gamilit_platform -h localhost -f ddl/schemas/auth_management/schema.sql
psql -U gamilit_user -d gamilit_platform -h localhost -f ddl/schemas/educational_content/schema.sql
psql -U gamilit_user -d gamilit_platform -h localhost -f ddl/schemas/gamification_system/schema.sql
# ... (continuar con otros schemas según necesidad)
```

### 4. Cargar datos de prueba (seeds)

```bash
# Cargar seeds de desarrollo
psql -U gamilit_user -d gamilit_platform -h localhost -f seeds/dev/01-users.sql
psql -U gamilit_user -d gamilit_platform -h localhost -f seeds/dev/02-modules.sql
psql -U gamilit_user -d gamilit_platform -h localhost -f seeds/dev/03-exercises.sql

# Verificar datos
psql -U gamilit_user -d gamilit_platform -h localhost -c "SELECT COUNT(*) FROM auth_management.users;"
# Debería mostrar algunos usuarios de prueba
```

**Nota:** El orden de ejecución de DDL es importante debido a dependencias entre schemas. Ver [apps/database/_MAP.md](../../apps/database/_MAP.md) para detalles.

---

## 🔧 Configurar Backend

### 1. Navegar a carpeta backend

```bash
cd /path/to/gamilit/projects/gamilit/apps/backend
```

### 2. Instalar dependencias

```bash
npm install
# Esto puede tomar 2-3 minutos
```

### 3. Configurar variables de entorno

```bash
# Copiar template de .env
cp .env.example .env

# Editar .env con tu editor favorito
nano .env  # o code .env si usas VS Code
```

**Contenido de `.env`:**

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gamilit_user
DB_PASSWORD=gamilit_dev_2025
DB_DATABASE=gamilit_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
```

**⚠️ IMPORTANTE:** Cambia `JWT_SECRET` por un valor único y seguro. Puedes generarlo con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Verificar configuración

```bash
# Verificar TypeScript
npm run build

# Si hay errores de compilación, revisar tsconfig.json
```

### 5. Iniciar backend en modo desarrollo

```bash
npm run dev
```

**Output esperado:**

```
[Nest] 12345  - 2025-11-07 10:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 2025-11-07 10:00:00     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 2025-11-07 10:00:01     LOG [RoutesResolver] AuthController {/api/v1/auth}:
[Nest] 12345  - 2025-11-07 10:00:01     LOG [RouterExplorer] Mapped {/api/v1/auth/login, POST} route
[Nest] 12345  - 2025-11-07 10:00:02     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 2025-11-07 10:00:02     LOG Application is running on: http://localhost:3000
```

### 6. Verificar endpoints

Abre otra terminal y prueba:

```bash
# Health check
curl http://localhost:3000/api/health
# Debería retornar: {"status":"ok","timestamp":"..."}

# Health check de DB
curl http://localhost:3000/api/health/db
# Debería retornar: {"status":"ok","database":"connected"}
```

**🎉 ¡Backend configurado correctamente!**

---

## 🎨 Configurar Frontend

### 1. Navegar a carpeta frontend

```bash
# Abrir nueva terminal
cd /path/to/gamilit/projects/gamilit/apps/frontend
```

### 2. Instalar dependencias

```bash
npm install
# Esto puede tomar 2-3 minutos
```

### 3. Configurar variables de entorno

```bash
# Copiar template de .env
cp .env.example .env.local

# Editar .env.local
nano .env.local  # o code .env.local
```

**Contenido de `.env.local`:**

```bash
# API Backend
VITE_API_BASE_URL=http://localhost:3000/api/v1

# WebSocket (si aplica)
VITE_WS_URL=ws://localhost:3000

# Environment
VITE_ENV=development

# Feature Flags (opcional)
VITE_ENABLE_SOCIAL_FEATURES=false
VITE_ENABLE_TEACHER_PORTAL=true
VITE_ENABLE_ADMIN_PORTAL=true
```

### 4. Iniciar frontend en modo desarrollo

```bash
npm run dev
```

**Output esperado:**

```
VITE v7.1.10  ready in 1543 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### 5. Abrir aplicación en navegador

```bash
# Abrir navegador automáticamente
open http://localhost:5173  # macOS
xdg-open http://localhost:5173  # Linux
start http://localhost:5173  # Windows
```

O simplemente abre tu navegador y ve a: **http://localhost:5173**

**🎉 ¡Frontend configurado correctamente!**

---

## ✅ Verificar Instalación

### 1. Verificar Backend (Terminal 1)

```bash
# Debe estar corriendo en http://localhost:3000

# Probar endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
curl http://localhost:3000/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gamilit.com","password":"test123"}'
```

### 2. Verificar Frontend (Terminal 2)

```bash
# Debe estar corriendo en http://localhost:5173

# Verificar build (opcional)
npm run build
# No debería haber errores de TypeScript
```

### 3. Verificar Base de Datos (Terminal 3)

```bash
# Conectar a PostgreSQL
psql -U gamilit_user -d gamilit_platform -h localhost

# Listar schemas
\dn

# Debería mostrar:
# - auth_management
# - educational_content
# - gamification_system
# - progress_tracking
# - social_features
# - content_management
# - audit_logging
# - system_configuration
# - public

# Listar tablas del schema auth_management
\dt auth_management.*

# Contar usuarios
SELECT COUNT(*) FROM auth_management.users;

# Salir
\q
```

### 4. Test End-to-End Manual

1. **Abrir frontend:** http://localhost:5173
2. **Intentar login** con usuario de prueba (si existe en seeds)
3. **Ver dashboard** de estudiante
4. **Navegar a módulos educativos**
5. **Verificar que se cargan ejercicios**

Si todo lo anterior funciona: **¡Felicitaciones! Tu entorno está 100% configurado.**

---

## 🚀 Siguientes Pasos

Ahora que tu entorno está configurado, te recomendamos:

### 1. Familiarizarte con el Codebase (Día 1)

**Leer documentación clave:**
- [VISION.md](./VISION.md) - Visión del producto
- [apps/backend/_MAP.md](../../apps/backend/_MAP.md) - Estructura del backend
- [apps/frontend/_MAP.md](../../apps/frontend/_MAP.md) - Estructura del frontend
- [apps/database/_MAP.md](../../apps/database/_MAP.md) - Esquema de base de datos

**Explorar código:**
```bash
# Backend
cd apps/backend/src
tree -L 2  # Ver estructura de módulos

# Frontend
cd apps/frontend/src
tree -L 2  # Ver estructura de features
```

### 2. Ejecutar Tests (Día 1)

```bash
# Backend tests
cd apps/backend
npm test

# Frontend tests
cd apps/frontend
npm test

# Ver coverage
npm run test:cov  # backend
npm run test:coverage  # frontend
```

### 3. Configurar Herramientas de Desarrollo (Día 1-2)

**ESLint y Prettier:**
```bash
# Backend
cd apps/backend
npm run lint  # Ver errores de linting
npm run format  # Formatear código

# Frontend
cd apps/frontend
npm run lint
npm run format
```

**VS Code settings (opcional):**
Crear `.vscode/settings.json` en la raíz:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 4. Leer Estándares de Código (Día 2)

- [docs/standards/CODING-STANDARDS.md](../standards/CODING-STANDARDS.md) - Estándares de código
- [docs/standards/GIT-WORKFLOW.md](../standards/GIT-WORKFLOW.md) - Workflow de Git
- [docs/standards/CODE-REVIEW-GUIDE.md](../standards/CODE-REVIEW-GUIDE.md) - Guía de code review

### 5. Tomar Primera Tarea (Día 2-3)

**Tasks recomendadas para empezar:**
- Corregir un bug P2 (bajo riesgo)
- Escribir tests faltantes
- Mejorar documentación
- Refactorizar código existente

**Buscar issues en GitHub:**
```bash
# Labels recomendados para comenzar
- good-first-issue
- documentation
- tests
- refactoring
```

### 6. Unirte a Canales de Comunicación (Día 1)

- **Slack:** #gamilit-backend, #gamilit-frontend, #gamilit-general
- **GitHub:** Watch repository para notificaciones
- **Reuniones:** Daily standup (9:00 AM), Sprint planning (Lunes)

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Backend no inicia - Error de conexión a DB

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
# macOS
brew services list | grep postgresql

# Ubuntu
sudo systemctl status postgresql

# Si no está corriendo, iniciarlo
brew services start postgresql@15  # macOS
sudo systemctl start postgresql  # Ubuntu
```

#### 2. Frontend no conecta con Backend - CORS Error

**Síntoma:**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solución:**
```bash
# Verificar .env del backend
cat apps/backend/.env | grep CORS_ORIGIN

# Debe ser:
CORS_ORIGIN=http://localhost:5173

# Reiniciar backend después de cambiar
```

#### 3. npm install falla - Permission Error

**Síntoma:**
```
EACCES: permission denied
```

**Solución:**
```bash
# NO uses sudo con npm install

# Arreglar permisos de npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Agregar a PATH en ~/.bashrc o ~/.zshrc
export PATH=~/.npm-global/bin:$PATH

# Recargar shell
source ~/.bashrc  # o source ~/.zshrc
```

#### 4. TypeScript errors - Module not found

**Síntoma:**
```
Cannot find module '@/shared/constants'
```

**Solución:**
```bash
# Verificar que tsconfig.json tenga paths configurados
cat tsconfig.json | grep -A 5 "paths"

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### 5. Base de datos - Tablas no existen

**Síntoma:**
```
ERROR: relation "auth_management.users" does not exist
```

**Solución:**
```bash
# Ejecutar DDL completo
cd apps/database
./scripts/reset-database.sh  # si existe

# O manualmente
psql -U gamilit_user -d gamilit_platform -h localhost -f ddl/base-schema.sql
```

### Obtener Ayuda

Si ninguna solución funciona:

1. **Revisar logs detallados:**
   ```bash
   # Backend
   tail -f apps/backend/logs/error.log

   # Frontend (console del navegador)
   F12 → Console tab
   ```

2. **Buscar en documentación:**
   - [docs/03-desarrollo/](../03-desarrollo/)
   - [GitHub Issues](https://github.com/YOUR_ORG/gamilit/issues)

3. **Preguntar al equipo:**
   - Slack: #gamilit-help
   - Tag a Tech Lead: @tech-lead
   - Email: tech@gamilit.com

---

## 📚 Recursos Útiles

### Documentación del Proyecto

| Documento | Propósito | Link |
|-----------|-----------|------|
| **VISION.md** | Visión del producto | [Ver](./VISION.md) |
| **Arquitectura Backend** | Estructura y módulos | [Ver](../03-desarrollo/backend/ESTRUCTURA-Y-MODULOS.md) |
| **Arquitectura Frontend** | Componentes y features | [Ver](../03-desarrollo/frontend/ESTRUCTURA-Y-FEATURES.md) |
| **Esquema DB** | Base de datos completa | [Ver](../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md) |
| **API Reference** | Documentación de API | [Ver](../02-especificaciones-tecnicas/apis/API-REFERENCE.md) |

### Tecnologías Principales

**Backend:**
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

**Frontend:**
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)

### Herramientas de Desarrollo

- [VS Code Tips & Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
- [Git Cheatsheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [PostgreSQL Cheatsheet](https://www.postgresqltutorial.com/postgresql-cheat-sheet/)

### Videos y Tutoriales

- [NestJS Crash Course](https://www.youtube.com/watch?v=GHTA143_b-s)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## 🎓 Checklist de Onboarding

Usa esta checklist para asegurarte de que completaste todo:

### Día 1
- [ ] Instalados todos los prerrequisitos (Node, PostgreSQL, Git)
- [ ] Clonado el repositorio
- [ ] Leído VISION.md y README.md
- [ ] Base de datos creada y schemas ejecutados
- [ ] Backend corriendo en http://localhost:3000
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Verificados health checks del backend
- [ ] Login manual funcional en frontend

### Día 2
- [ ] Explorada estructura del backend (apps/backend/src/)
- [ ] Explorada estructura del frontend (apps/frontend/src/)
- [ ] Leídos _MAP.md de apps/backend, apps/frontend, apps/database
- [ ] Ejecutados tests del backend (npm test)
- [ ] Ejecutados tests del frontend (npm test)
- [ ] Configurado ESLint y Prettier en editor
- [ ] Leídos CODING-STANDARDS.md y GIT-WORKFLOW.md

### Día 3
- [ ] Unido a canales de Slack (#gamilit-*)
- [ ] Asistido a daily standup
- [ ] Tomada primera tarea (good-first-issue)
- [ ] Creada primera branch de feature
- [ ] Hecho primer commit siguiendo estándares
- [ ] Abierto primer PR (aunque sea draft)

---

**¡Bienvenido al equipo! 🚀**

Si tienes preguntas, no dudes en preguntar en #gamilit-help o contactar a @tech-lead.

---

**Documento preparado por:** Tech Lead
**Última actualización:** 2025-11-07
**Versión:** 1.0
