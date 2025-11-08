<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Estructura y Módulos - Índice Principal -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Estructura y Módulos del Backend GAMILIT

## Información General

**Stack Tecnológico:**
- Node.js + TypeScript
- Express.js 4.18.2
- PostgreSQL con pg 8.11.3
- Socket.IO 4.8.1 para WebSocket
- JWT para autenticación
- node-cron 4.2.1 para tareas programadas

**Versión:** 1.0.0
**Puerto:** 3006 (configurable)
**Arquitectura:** Modular con separación de capas (Controller-Service-Repository)

---

## Índice de Documentación

### 1. [Estructura-Proyecto.md](./Estructura-Proyecto.md)
Documentación de la estructura de directorios y arquitectura del proyecto.

**Contenido:**
- Estructura de Directorios Completa
- Flujo de Inicialización del Servidor
- Patrón de Arquitectura (Clean Architecture)
- Convenciones de Código
- Flujo de Request/Response

**Conceptos Clave:** Arquitectura, Estructura, Convenciones

---

### 2. [Modulos-Core.md](./Modulos-Core.md)
Documentación detallada de los 11 módulos funcionales del backend.

**Contenido:**
- Auth Module
- Gamification Module
- Educational Module
- Teacher Module
- Social Module
- Notifications Module
- Admin Module
- Progress Module
- Health Module
- WebSocket Module
- Shared Module

**Conceptos Clave:** Módulos, Endpoints, Servicios

---

## Arquitectura General

```
backend/
├── src/
│   ├── app.ts                    # Configuración de Express
│   ├── server.ts                 # Punto de entrada del servidor
│   ├── config/                   # Configuración global
│   ├── database/                 # Conexión PostgreSQL
│   ├── middleware/               # 8 middlewares globales
│   ├── modules/                  # 11 módulos funcionales
│   ├── shared/                   # Utilidades compartidas
│   └── websocket/                # Socket.IO
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Los 11 Módulos Funcionales

| Módulo | Endpoints | Autenticación | Roles |
|--------|-----------|---------------|-------|
| Auth | 13 | Mixta | Todos |
| Gamification | 25+ | Requerida | student, teacher, admin |
| Educational | 40+ | Requerida | student, teacher, admin |
| Teacher | 35+ | Requerida | teacher, admin |
| Social | 25+ | Requerida | student, teacher |
| Notifications | 10 | Requerida | Todos |
| Admin | 30+ | Requerida | super_admin |
| Progress | 8 | Requerida | student, teacher, admin |
| Health | 2 | No | - |
| WebSocket | - | Requerida | Todos |
| Shared | - | - | - |
| **TOTAL** | **177+** | - | - |

---

## Patrón de Arquitectura

Cada módulo sigue el patrón Clean Architecture:

```
module/
├── module.types.ts         # Interfaces y tipos
├── module.validation.ts    # Validaciones con Joi/Zod
├── module.routes.ts        # Definición de rutas Express
├── module.controller.ts    # Controladores (request/response)
├── module.service.ts       # Lógica de negocio
├── module.repository.ts    # Acceso a base de datos
└── index.ts               # Exports públicos
```

---

## Flujo de Request

```
Request → Route → Middleware → Controller → Service → Repository → Database
                                    ↓
Response ← Controller ← Service ← Repository
```

---

## Responsabilidades por Capa

1. **Routes:** Define endpoints y aplica middlewares
2. **Controller:** Maneja request/response HTTP, valida entrada
3. **Service:** Implementa lógica de negocio, orquesta operaciones
4. **Repository:** Abstrae acceso a datos, queries SQL
5. **Middleware:** Autenticación, autorización, validación, rate limiting

---

## Flujo de Inicialización

```
1. bootstrap() en server.ts
   - Valida variables de entorno
   - Testa conexión a PostgreSQL
   ↓
2. createApp() en app.ts
   - Configura middlewares globales
   - Registra rutas de módulos
   - Añade error handlers
   ↓
3. initializeSocketServer(httpServer)
   - Crea servidor Socket.IO
   - Aplica auth middleware
   - Inicializa RealtimeService
   ↓
4. Inicia Cron Jobs
   - startMissionsCronJobs()
   - startNotificationsCronJobs()
   ↓
5. httpServer.listen(PORT)
   - Servidor HTTP escuchando
   - WebSocket endpoint disponible
   - API REST disponible
```

---

## Convenciones de Código

**Nomenclatura:**
- Archivos: `kebab-case.ts`
- Clases: `PascalCase`
- Funciones/variables: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Interfaces: `PascalCase` (sin prefijo `I`)

**Respuestas API:**
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Quick Start

### Instalación

```bash
cd backend
npm install
```

### Configuración

```bash
cp .env.example .env
# Editar .env con configuración local
```

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

---

## Variables de Entorno

```env
# Server
NODE_ENV=development
PORT=3006

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=glit_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_ACCESS_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

---

## Navegación

- **Inicio:** [Backend README](../README.md)
- **Estructura Proyecto:** [Estructura-Proyecto.md](./Estructura-Proyecto.md)
- **Módulos Core:** [Modulos-Core.md](./Modulos-Core.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
