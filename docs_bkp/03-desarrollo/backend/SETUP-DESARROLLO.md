# Setup de Desarrollo - Backend

**Código que mapea:** `apps/backend/`
**Última actualización:** 2025-11-07
**Tiempo estimado:** 30-45 minutos

---

## 📋 Pre-requisitos

- Node.js 20+
- npm o pnpm
- PostgreSQL 16+ (local o Docker)
- Git

---

## 🚀 Instalación

### 1. Clonar repositorio

```bash
cd /path/to/workspace
# (Ya clonado)
```

### 2. Instalar dependencias

```bash
cd apps/backend
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### 4. Setup de database

```bash
# Ejecutar DDL
cd ../database
psql -U postgres -f ddl/base-schema.sql

# Ejecutar migrations
# (comandos aquí)

# Seeds de desarrollo
psql -U postgres gamilit_dev -f seeds/dev/seed-data.sql
```

### 5. Iniciar servidor de desarrollo

```bash
cd ../backend
npm run dev
```

**Servidor corriendo en:** http://localhost:3000

---

## 🧪 Verificación

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Response esperado:
# {"status":"ok"}
```

---

## 📚 Comandos Útiles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build producción
npm run start        # Iniciar producción
npm test             # Tests
npm run lint         # Linter
```

---

## 🔧 Troubleshooting

### Error de conexión a database

```
Error: ECONNREFUSED
```

**Solución:** Verificar que PostgreSQL esté corriendo

```bash
# Linux/Mac
pg_ctl status

# Iniciar si está detenido
pg_ctl start
```

### Puerto 3000 en uso

**Solución:** Cambiar puerto en `.env`

```env
PORT=3001
```

---

**Última actualización:** 2025-11-07
