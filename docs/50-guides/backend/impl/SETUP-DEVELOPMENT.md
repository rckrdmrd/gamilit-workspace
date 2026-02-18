# Setup de Desarrollo Backend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/

---

## Requisitos Previos

- Node.js v18+ (recomendado v20 LTS)
- npm v9+ o pnpm
- PostgreSQL 15+
- Git

---

## Instalación Inicial

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd gamilit
```

### 2. Instalar Dependencias

```bash
# Desde la raíz del monorepo
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar template
cp apps/backend/.env.example apps/backend/.env

# Editar con tus valores
nano apps/backend/.env
```

### Variables Requeridas

```env
# Database
DB_HOST_MODE=auto
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gamilit_user
DB_PASSWORD=your_password
DB_DATABASE=gamilit_dev

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Application
PORT=3000
NODE_ENV=development

# Optional: Redis (para rate limiting en producción)
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional: Mail (para emails en desarrollo usar Mailtrap)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=your-mailtrap-user
MAIL_PASS=your-mailtrap-pass
```

---

## Configurar Base de Datos

### 1. Crear Base de Datos

```bash
cd apps/database

# Ejecutar script de creación
./create-database.sh

# O recrear desde cero (elimina datos existentes)
./drop-and-recreate-database.sh
```

### 2. Verificar Conexión

```bash
# Probar conexión
psql -h localhost -U gamilit_user -d gamilit_dev -c "SELECT 1"
```

---

## Ejecutar Backend

### Modo Desarrollo (con hot-reload)

```bash
# Opcion recomendada desde apps/backend
cd apps/backend
npm run dev
```

### Resolucion de host de base de datos (Windows + WSL2)

- `npm run dev` ejecuta `predev` automaticamente.
- `predev` mantiene `DB_HOST` en `apps/backend/.env.dev` con estrategia `DB_HOST_MODE`.
- Valores soportados:
  - `auto` (default): usa IP WSL2 si es alcanzable; fallback a `localhost`.
  - `localhost`: fuerza localhost.
  - `wsl-ip`: exige IP WSL2 valida y falla rapido si no la encuentra.
- Si usas mas de una distro WSL, define `WSL_DISTRO=<nombre>` en `.env.dev`.

### Modo Debug

```bash
npm run start:debug
```

### Modo Producción

```bash
npm run build:backend
npm run start:prod
```

---

## Verificar Instalación

### Health Check

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-28T10:00:00Z",
  "database": "connected"
}
```

### Swagger UI

Abrir en navegador: `http://localhost:3000/api/docs`

---

## Estructura del Proyecto

```
apps/backend/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── modules/             # Feature modules
│   │   ├── auth/
│   │   ├── gamification/
│   │   ├── educational/
│   │   └── ...
│   ├── shared/              # Shared code
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   └── utils/
│   └── config/              # Configuration
├── test/                    # E2E tests
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run start:debug` | Desarrollo con debugger |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Ejecutar build de producción |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Tests con coverage |
| `npm run test:e2e` | Tests end-to-end |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear con Prettier |

---

## Debugging

### VS Code

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Backend",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "localRoot": "${workspaceFolder}/apps/backend",
      "remoteRoot": "${workspaceFolder}/apps/backend"
    }
  ]
}
```

Luego:
1. Ejecutar `npm run start:debug`
2. En VS Code: Run → Start Debugging

### Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Filtrar por nivel
grep ERROR logs/app.log
```

---

## Troubleshooting

### Error: Cannot connect to database

```bash
# 1) Ejecutar predev manual para diagnostico
cd apps/backend
npm run predev

# 2) Verificar host efectivo aplicado en .env.dev
rg "^DB_HOST|^DB_HOST_MODE|^WSL_DISTRO" .env.dev

# 3) Verificar PostgreSQL desde WSL
wsl -d Ubuntu-24.04 -- pg_isready -h localhost -p 5432
```

### Error: Port 3000 already in use

```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### Error: Module not found

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: TypeORM entity metadata not found

- Verificar que la entidad está importada en el módulo correspondiente
- Verificar path en `typeorm.config.ts` → `entities`

---

## Desarrollo con Docker (Opcional)

### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: gamilit_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: gamilit_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Ejecutar

```bash
docker-compose up -d
```

---

## IDE Recomendado

### VS Code Extensions

- ESLint
- Prettier
- NestJS Snippets
- PostgreSQL (para queries)
- Thunder Client (para testing API)

### Settings Recomendadas

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Ver También

- [ESTRUCTURA-MODULOS.md](./ESTRUCTURA-MODULOS.md) - Estructura de módulos
- [DATABASE-INTEGRATION.md](./DATABASE-INTEGRATION.md) - Integración con BD
- [../../testing/TESTING-GUIDE.md](../../testing/TESTING-GUIDE.md) - Guía de testing
- [../../deployment/DEV-SERVERS.md](../../deployment/DEV-SERVERS.md) - Servidores de desarrollo
