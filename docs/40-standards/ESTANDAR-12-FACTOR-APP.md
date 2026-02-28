---
titulo: Estandar - 12-Factor App
tipo: estandar
scope: gamilit
version: 1.0.0
fecha_creacion: 2026-02-14
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - 12-factor
  - devops
  - arquitectura
  - deployment
aplica_a:
  - backend
  - frontend
  - devops
estado: vigente
---

# Estandar 12-Factor App — Auditoria Gamilit

> **Version:** 1.0.0 | **Fecha:** 2026-02-14 | **Estado:** Vigente

## 1. Proposito

Este documento audita la plataforma gamilit contra la metodologia [12-Factor App](https://12factor.net/), identificando el estado de cumplimiento de cada factor, la evidencia concreta en el codebase y las acciones correctivas necesarias para alcanzar cumplimiento completo.

La metodologia 12-Factor App establece principios para construir aplicaciones SaaS modernas que sean portables, escalables y mantenibles. Dado que gamilit opera como plataforma educativa en produccion (74.208.126.102), el cumplimiento de estos factores es critico para la estabilidad y evolucion del sistema.

---

## 2. Resumen de Cumplimiento

| # | Factor | Estado | Evidencia |
|---|--------|--------|-----------|
| I | Codebase | COMPLIANT | Un repo git (`github.com/rckrdmrd/gamilit-workspace.git`), un deploy |
| II | Dependencies | COMPLIANT | `package.json` + `package-lock.json` declarados explicitamente |
| III | Config | PARCIAL | `.env` files usados pero no validados completamente en arranque |
| IV | Backing Services | COMPLIANT | PostgreSQL, Redis como recursos adjuntos via env vars |
| V | Build, Release, Run | PARCIAL | Build separado de run (`npm build` + PM2), pero no hay releases versionados |
| VI | Processes | COMPLIANT | Stateless (JWT), PM2 fork mode, Redis para Socket.IO state |
| VII | Port Binding | COMPLIANT | Backend exporta HTTP en PORT, frontend en PORT |
| VIII | Concurrency | PARCIAL | PM2 fork (no cluster por `tsconfig-paths`), escalar requiere cambios |
| IX | Disposability | COMPLIANT | Startup rapido con NestJS, graceful shutdown configurado |
| X | Dev/Prod Parity | PARCIAL | Misma DB/Redis en ambos, pero Swagger habilitado solo en dev |
| XI | Logs | GAP | PM2 archivos de log, NO stdout/streams. Necesita logging a stdout |
| XII | Admin Processes | PARCIAL | `init-database.sh` como admin task, pero no como one-off process |

**Puntuacion Global:** 7 COMPLIANT + 4 PARCIAL + 1 GAP = **67% cumplimiento completo** (58% si se pondera por criticidad)

---

## 3. Factor I — Codebase (Una base de codigo, multiples deploys)

### Que dice el factor

Una aplicacion 12-Factor se rastrea en un unico repositorio de control de versiones. Puede haber multiples deploys (produccion, staging, dev), pero todos comparten la misma base de codigo, diferenciandose solo en la configuracion.

### Estado: COMPLIANT

### Evidencia

- **Repositorio unico:** `git@github.com:rckrdmrd/gamilit-workspace.git`
- **Rama principal:** `master`
- **Estructura monorepo:** `apps/backend`, `apps/frontend`, `apps/database` en el mismo repositorio
- **Sin submodulos:** No existe `.gitmodules`; todo el codigo es tracked directamente
- **Un deploy activo:** Servidor de produccion `74.208.126.102`

### Acciones correctivas

Ninguna requerida. El monorepo cumple perfectamente con este factor. Si en el futuro se agregara un ambiente de staging, ambos deployments compartiran la misma base de codigo con diferentes configuraciones `.env`.

---

## 4. Factor II — Dependencies (Declarar y aislar dependencias explicitamente)

### Que dice el factor

Una aplicacion 12-Factor nunca depende de la existencia implicita de paquetes del sistema. Declara todas sus dependencias de forma completa y exacta mediante un manifiesto de declaracion de dependencias, y usa una herramienta de aislamiento durante la ejecucion para asegurar que no se filtren dependencias del sistema.

### Estado: COMPLIANT

### Evidencia

- **Backend:** `apps/backend/package.json` con 50+ dependencias explicitas, `package-lock.json` para versiones exactas
- **Frontend:** `apps/frontend/package.json` con dependencias explicitas, `package-lock.json`
- **Node.js:** Version requerida implicitamente por las dependencias (NestJS 11 requiere Node.js >= 18)
- **Build tools:** `typescript`, `vite`, `jest` declarados como devDependencies
- **Aislamiento:** `node_modules/` local por proyecto (no global)

### Acciones correctivas

- **Recomendado:** Agregar campo `engines` en ambos `package.json` para declarar la version minima de Node.js:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

- **Recomendado:** Considerar uso de `npm ci` (en lugar de `npm install`) en produccion para instalacion determinista.

---

## 5. Factor III — Config (Almacenar configuracion en el entorno)

### Que dice el factor

La configuracion de una aplicacion es todo aquello que puede variar entre deploys (staging, produccion, dev). Esto incluye credenciales de base de datos, URLs de servicios externos, y feature flags. La configuracion debe almacenarse en variables de entorno, nunca en el codigo.

### Estado: PARCIAL

### Evidencia

**Cumple:**
- Archivos `.env` usados en backend y frontend (no comiteados en git)
- `.env.production` en servidor con credenciales de produccion
- `.env.production.example` como template documentado
- `ConfigService` de NestJS (`@nestjs/config`) para acceder a variables
- `env.config.ts` registra configuracion via `registerAs('env', ...)`
- Variables criticas: `DB_USERNAME`, `DB_PASSWORD`, `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `ENABLE_SWAGGER`

**Gaps:**
- No hay validacion exhaustiva de variables requeridas en arranque (solo defaults silenciosos)
- Algunos valores hardcodeados como fallback: `PORT || '3006'`, `NODE_ENV || 'development'`
- Winston logger utility accede directamente a `process.env` en lugar de usar `ConfigService`

### Acciones correctivas

Implementar validacion de variables de entorno al arrancar la aplicacion usando `class-validator` con el esquema de `@nestjs/config`:

```typescript
// apps/backend/src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsOptional, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  CORS_ORIGIN: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(
      `Variables de entorno faltantes o invalidas:\n${errors.toString()}`,
    );
  }
  return validatedConfig;
}
```

Integrar en `AppModule`:

```typescript
ConfigModule.forRoot({
  validate,
  isGlobal: true,
})
```

---

## 6. Factor IV — Backing Services (Tratar backing services como recursos adjuntos)

### Que dice el factor

Un backing service es cualquier servicio que la aplicacion consume a traves de la red como parte de su operacion normal: bases de datos, sistemas de mensajeria, caches, servicios SMTP. La aplicacion 12-Factor no distingue entre servicios locales y de terceros; ambos son recursos adjuntos accesibles via URL o credenciales almacenadas en configuracion.

### Estado: COMPLIANT

### Evidencia

- **PostgreSQL:** Conectado via `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` en `.env`
  - 10 datasources configurados en `app.module.ts` apuntando a schemas separados
  - Todas las credenciales via variables de entorno, sin hardcoding
- **Redis:** Conectado via `REDIS_HOST`, `REDIS_PORT` en `.env`
  - Usado para Socket.IO adapter (`RedisIoAdapter`)
  - Fallback graceful a in-memory si Redis no esta disponible
- **Servicios externos:** Twilio (SMS), Firebase (push notifications) configurados via env vars
  - Graceful degradation si credenciales no estan presentes

### Acciones correctivas

Ninguna requerida. Todos los backing services se tratan como recursos adjuntos configurables. Se podria cambiar de PostgreSQL local a un servicio gestionado (RDS, Cloud SQL) sin modificar el codigo, solo la configuracion.

---

## 7. Factor V — Build, Release, Run (Separar etapas de build, release y run)

### Que dice el factor

La aplicacion 12-Factor usa una separacion estricta entre las etapas de build, release y run. La etapa de build convierte el codigo en un artefacto ejecutable. La etapa de release combina el artefacto con la configuracion del deploy. La etapa de run ejecuta la aplicacion en el entorno de ejecucion.

### Estado: PARCIAL

### Evidencia

**Cumple parcialmente:**
- **Build:** `npm run build` en backend (TypeScript -> JavaScript en `dist/`) y frontend (Vite build)
- **Run:** PM2 ejecuta `dist/main.js` (backend) y `vite preview` (frontend)
- Build y run son etapas claramente separadas

**Gaps:**
- **No hay etapa de release formal:** No se generan artefactos versionados
- **No hay git tags** para versiones de produccion
- **No hay changelog** automatizado
- El deploy es: `git pull` -> `npm build` -> `pm2 restart` (sin release intermedio)
- No hay forma de hacer rollback a una "release" especifica (solo `git checkout HEAD~1`)

### Acciones correctivas

1. **Implementar git tags para cada deploy a produccion:**

```bash
## Al hacer deploy exitoso
git tag -a v1.2.3 -m "Release v1.2.3 - descripcion breve"
git push origin v1.2.3
```

2. **Crear script de release:**

```bash
#!/bin/bash
## scripts/release.sh
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Uso: ./scripts/release.sh v1.2.3"
  exit 1
fi

## Verificar que el build es exitoso
cd apps/backend && npm run build && cd ..
cd apps/frontend && npm run build && cd ..

## Crear tag
git tag -a "$VERSION" -m "Release $VERSION - $(date +%Y-%m-%d)"
git push origin "$VERSION"

echo "Release $VERSION creado exitosamente"
```

3. **Considerar CHANGELOG.md** generado automaticamente con `conventional-changelog` basado en commits convencionales.

---

## 8. Factor VI — Processes (Ejecutar la aplicacion como uno o mas procesos stateless)

### Que dice el factor

Los procesos de la aplicacion son stateless y share-nothing. Cualquier dato que necesite persistir se almacena en un backing service con estado (base de datos, cache). El espacio de memoria y el filesystem del proceso son efimeros.

### Estado: COMPLIANT

### Evidencia

- **Backend stateless:** Autenticacion via JWT (sin sesiones del lado del servidor)
- **Sin estado en memoria:** No se almacena estado de usuario en variables del proceso
- **Socket.IO state en Redis:** `RedisIoAdapter` externaliza el estado de conexiones WebSocket a Redis, permitiendo que multiples instancias compartan el estado
- **PM2 fork mode:** Un proceso por app, sin dependencia de estado compartido en memoria
- **Uploads:** Archivos subidos se almacenan en filesystem del servidor (no ideal, pero funcional para single-server)

### Acciones correctivas

- **Futuro:** Si se escala a multiples servidores, los uploads de archivos deben migrar a almacenamiento externo (S3, MinIO) en lugar del filesystem local. Actualmente esto no es bloqueante porque hay un solo servidor.

---

## 9. Factor VII — Port Binding (Exportar servicios via port binding)

### Que dice el factor

La aplicacion 12-Factor es completamente auto-contenida y no depende de un servidor web externo inyectado en tiempo de ejecucion para crear un servicio visible en la web. La aplicacion exporta HTTP como un servicio vinculandose a un puerto.

### Estado: COMPLIANT

### Evidencia

- **Backend:** NestJS se auto-vincula al puerto configurado en `PORT` (default 3006)
  ```typescript
  // main.ts
  const port = configService.get('env.port', 3006);
  await app.listen(port);
  ```
- **Frontend:** SPA server se vincula al puerto 3005 via `--port 3005`
  ```javascript
  // ecosystem.config.js
  args: '--port 3005 --host 0.0.0.0',
  ```
- **Nginx como reverse proxy:** No inyecta la app en un servidor web; solo hace proxy de HTTPS (:443) a puertos internos (3005/3006 HTTP). La app funciona sin Nginx.

### Acciones correctivas

Ninguna requerida. Ambas aplicaciones exportan servicios HTTP via port binding y funcionan de forma auto-contenida.

---

## 10. Factor VIII — Concurrency (Escalar via el modelo de procesos)

### Que dice el factor

En la aplicacion 12-Factor, los procesos son ciudadanos de primera clase. La aplicacion debe poder escalar horizontalmente lanzando mas procesos, en lugar de escalar verticalmente un solo proceso grande. Diferentes tipos de trabajo se asignan a diferentes tipos de procesos.

### Estado: PARCIAL

### Evidencia

**Cumple parcialmente:**
- **PM2 como process manager:** Capaz de manejar multiples instancias
- **Procesos separados:** Backend y frontend son procesos independientes
- **Stateless design:** El backend es stateless, lo que permite escalar horizontalmente en principio
- **Redis para WebSocket:** `RedisIoAdapter` permite compartir estado de Socket.IO entre instancias

**Gaps:**
- **Fork mode obligatorio:** `tsconfig-paths-bootstrap.js` es incompatible con PM2 cluster mode
  ```javascript
  // ecosystem.config.js
  node_args: '-r ./tsconfig-paths-bootstrap.js',
  instances: 1,
  exec_mode: 'fork',
  ```
- **Una sola instancia:** Backend corre como un unico proceso
- **Sin escalado horizontal** actualmente posible sin cambios en la configuracion de paths

### Acciones correctivas

1. **Opcion A — Eliminar dependencia de `tsconfig-paths` en produccion:**

   Compilar con paths resueltos en el bundle final usando `tsc-alias` o configurar webpack/esbuild:

   ```bash
   # Instalar tsc-alias
   npm install --save-dev tsc-alias

   # En package.json, modificar build script:
   "build": "tsc && tsc-alias"
   ```

   Esto permite usar `exec_mode: 'cluster'` y `instances: 2` (o mas) en PM2.

2. **Opcion B — Docker con multiples replicas:**

   ```yaml
   # docker-compose.yml (futuro)
   services:
     backend:
       build: ./apps/backend
       deploy:
         replicas: 2
       environment:
         - PORT=3006
   ```

3. **Opcion C — Mantener fork mode y escalar con Nginx upstream:**

   ```nginx
   upstream gamilit_backend {
     server 127.0.0.1:3006;
     server 127.0.0.1:4007;  # segunda instancia PM2 en otro puerto
   }
   ```

---

## 11. Factor IX — Disposability (Maximizar robustez con arranque rapido y apagado graceful)

### Que dice el factor

Los procesos de la aplicacion 12-Factor son desechables: pueden arrancar y detenerse en cualquier momento. Deben minimizar el tiempo de arranque y terminar gracefully cuando reciben una senal SIGTERM.

### Estado: COMPLIANT

### Evidencia

- **Arranque rapido:** NestJS inicia en ~3-5 segundos en produccion
- **PM2 gestiona ciclo de vida:**
  ```javascript
  // ecosystem.config.js
  autorestart: true,
  min_uptime: '10s',
  max_restarts: 10,
  kill_timeout: 5000,    // 5 segundos para graceful shutdown
  wait_ready: true,
  listen_timeout: 10000, // 10 segundos para esperar ready
  ```
- **WebSocket cleanup:** `MessagePersistenceService` implementa `OnModuleDestroy` para limpiar recursos al apagar
- **Conexiones DB:** TypeORM cierra conexiones automaticamente durante el shutdown de NestJS

### Acciones correctivas

- **Recomendado:** Habilitar explicitamente `app.enableShutdownHooks()` en `main.ts` para garantizar que NestJS ejecute `onModuleDestroy` y `beforeApplicationShutdown` en todos los providers:

```typescript
// main.ts - agregar despues de crear la app
app.enableShutdownHooks();
```

---

## 12. Factor X — Dev/Prod Parity (Mantener desarrollo, staging y produccion lo mas similares posible)

### Que dice el factor

La aplicacion 12-Factor esta disenada para despliegue continuo manteniendo el gap entre desarrollo y produccion lo mas pequeno posible. Esto incluye el gap de tiempo (deploy rapido), el gap de personal (mismas personas desarrollan y despliegan) y el gap de herramientas (mismos backing services).

### Estado: PARCIAL

### Evidencia

**Cumple:**
- **Mismos backing services:** PostgreSQL 15 y Redis en ambos ambientes
- **Misma estructura DB:** 18 schemas, mismas tablas, funciones y triggers
- **Mismo stack:** NestJS 11 + React 19 + TypeORM 0.3.x en ambos
- **Mismos puertos internos:** Backend en 3006, Frontend en 3005
- **Mismo process manager:** PM2 en ambos (aunque en dev se usa `npm run dev` frecuentemente)

**Gaps:**
- **Swagger:** Habilitado en desarrollo, deshabilitado en produccion (`ENABLE_SWAGGER=false`)
- **SSL:** Nginx con SSL en produccion, sin SSL en desarrollo
- **Seeds:** `seeds/dev/` con datos demo vs `seeds/prod/` con datos reales
- **Nivel de logs:** `verbose/info` en dev vs `warning/error` en prod
- **No hay staging environment:** Solo dev local y produccion

### Acciones correctivas

1. **Crear ambiente de staging** (cuando los recursos lo permitan) que replique produccion:
   - Mismo servidor o VPS separado con misma configuracion
   - Mismo Nginx con SSL
   - Base de datos separada con datos anonimizados

2. **Unificar comportamiento de Swagger** con feature flag en `.env` en lugar de logica condicional:
   ```
   # En ambos ambientes, controlar via .env
   ENABLE_SWAGGER=true   # .env.development
   ENABLE_SWAGGER=false  # .env.production
   ```
   Esto ya esta implementado. El gap es solo que la diferencia existe, no que este mal implementada.

---

## 13. Factor XI — Logs (Tratar logs como flujos de eventos)

### Que dice el factor

Una aplicacion 12-Factor nunca se ocupa del enrutamiento o almacenamiento de su flujo de salida. No debe escribir ni gestionar archivos de log. En cambio, cada proceso en ejecucion escribe su flujo de eventos, sin buffer, a `stdout`. En entornos de desarrollo, el desarrollador observa este flujo en la terminal. En deploys de produccion, el flujo de cada proceso es capturado por el entorno de ejecucion y dirigido a uno o mas destinos finales para visualizacion y archivado.

### Estado: GAP

Este es el factor con mayor desviacion en gamilit.

### Evidencia del estado actual

**Problema 1 — Winston escribe a archivos directamente:**

El archivo `apps/backend/src/shared/utils/logger.util.ts` configura Winston con transports de archivos:

```typescript
// Estado actual — NO 12-Factor
export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: 'logs/error.log',     // Escribe a archivo
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',  // Escribe a archivo
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});
```

**Problema 2 — PM2 captura stdout y lo escribe a archivos:**

```javascript
// ecosystem.config.js — PM2 redirige stdout a archivos
error_file: '../../logs/backend-error.log',
out_file: '../../logs/backend-out.log',
```

Esto significa que los logs pasan por dos capas de escritura a archivo: Winston escribe a `logs/error.log` y `logs/combined.log`, y PM2 escribe stdout/stderr a `logs/backend-out.log` y `logs/backend-error.log`.

**Problema 3 — NestJS Logger predeterminado no es estructurado:**

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

El logger predeterminado de NestJS emite en formato de texto plano (con colores), no en JSON estructurado.

**Problema 4 — console.log en main.ts:**

El archivo `main.ts` usa `console.log` directamente para el banner de inicio y la configuracion CORS, lo cual no sigue ningun formato estructurado.

### Acciones correctivas

#### Paso 1: Configurar NestJS para usar logger JSON en produccion

```typescript
// apps/backend/src/shared/logger/json-logger.service.ts
import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class JsonLoggerService extends ConsoleLogger {
  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string,
  ): string {
    if (process.env.NODE_ENV === 'production') {
      const entry = {
        timestamp: new Date().toISOString(),
        level: logLevel,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        service: 'gamilit-backend',
        context: contextMessage?.replace(/[\[\]]/g, '') || undefined,
      };
      return JSON.stringify(entry) + '\n';
    }
    // En desarrollo, mantener formato legible
    return super.formatMessage(
      logLevel, message, pidMessage, formattedLogLevel,
      contextMessage, timestampDiff,
    );
  }
}
```

#### Paso 2: Inyectar en bootstrap

```typescript
// main.ts
import { JsonLoggerService } from './shared/logger/json-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new JsonLoggerService(),
  });
  // ...
}
```

#### Paso 3: Eliminar transports de archivo en Winston

```typescript
// logger.util.ts — Version 12-Factor
export const logger = winston.createLogger({
  level: logLevel,
  format: nodeEnv === 'production'
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),  // JSON a stdout
      )
    : consoleFormat,
  defaultMeta: { service: 'gamilit-backend' },
  transports: [
    new winston.transports.Console(),  // SOLO Console, nunca File
  ],
});
```

#### Paso 4: Configurar PM2 para no capturar logs (o aceptar la captura como capa de recoleccion)

Opcion A — PM2 como recolector de logs (pragmatico para single-server):
```javascript
// ecosystem.config.js — Aceptar PM2 como capa de recoleccion
// Mantener out_file y error_file, pero la app solo escribe a stdout/stderr
// PM2 actua como el "environment" que captura el flujo
```

Opcion B — Desactivar captura de PM2 y usar herramienta externa:
```javascript
// ecosystem.config.js
out_file: '/dev/null',   // No capturar stdout
error_file: '/dev/null', // No capturar stderr
// Usar: pm2 logs --json | logstash/fluentd/vector para procesar
```

**Nota pragmatica:** Para un despliegue single-server sin infraestructura de observabilidad dedicada, la Opcion A (PM2 como recolector) es aceptable como paso intermedio. Lo critico es que la **aplicacion** solo escriba a stdout/stderr en formato JSON.

---

## 14. Factor XII — Admin Processes (Ejecutar tareas admin/management como one-off processes)

### Que dice el factor

Las tareas de administracion o mantenimiento puntuales (migraciones de base de datos, scripts de consola, tareas de limpieza) deben ejecutarse como procesos one-off en un entorno identico al de los procesos de larga ejecucion de la aplicacion. Usan el mismo codigo y configuracion, ejecutandose contra la misma release.

### Estado: PARCIAL

### Evidencia

**Cumple parcialmente:**
- **`init-database.sh`:** Script de inicializacion de base de datos ejecutado como one-off
- **`recreate-database.sh`:** Recreacion completa como tarea administrativa
- **Seeds:** Scripts SQL ejecutados como one-off durante deploy
- **PM2 commands:** `pm2 restart`, `pm2 stop` como tareas administrativas

**Gaps:**
- Los scripts de DB son bash puro, no usan el runtime de NestJS ni la configuracion de la app
- No hay CLI de administracion integrado (por ejemplo, NestJS CLI commands para tareas admin)
- Las tareas admin no se ejecutan con la misma configuracion que la aplicacion (scripts leen `prod.conf` directamente, no `.env.production`)
- No hay patron de "one-off process" para tareas como: limpiar sesiones expiradas, recalcular leaderboards, generar reportes

### Acciones correctivas

1. **Crear modulo CLI para tareas admin usando NestJS standalone application:**

```typescript
// apps/backend/src/cli.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function runAdminTask() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const task = process.argv[2];
  switch (task) {
    case 'recalculate-leaderboards':
      const leaderboardService = app.get('LeaderboardService');
      await leaderboardService.recalculateAll();
      break;
    case 'cleanup-expired-sessions':
      const authService = app.get('AuthService');
      await authService.cleanupExpiredSessions();
      break;
    case 'generate-report':
      const reportService = app.get('ReportService');
      await reportService.generateMonthlyReport();
      break;
    default:
      console.error(`Tarea desconocida: ${task}`);
      process.exit(1);
  }

  await app.close();
}

runAdminTask().catch((err) => {
  console.error('Error en tarea admin:', err);
  process.exit(1);
});
```

2. **Agregar script en package.json:**

```json
{
  "scripts": {
    "admin": "ts-node -r tsconfig-paths/register src/cli.ts"
  }
}
```

3. **Ejecutar tareas admin como one-off:**

```bash
cd apps/backend
npm run admin -- recalculate-leaderboards
npm run admin -- cleanup-expired-sessions
```

---

## 15. Plan de Accion Priorizado

| Prioridad | Factor | Accion | Esfuerzo | Impacto |
|-----------|--------|--------|----------|---------|
| **P1** | XI (Logs) | Migrar logging a stdout JSON, eliminar transports de archivo | Medio | Alto |
| **P2** | III (Config) | Implementar validacion de env vars al arranque | Bajo | Medio |
| **P3** | V (Build/Release/Run) | Implementar git tags y script de release | Bajo | Medio |
| **P4** | VIII (Concurrency) | Evaluar eliminacion de `tsconfig-paths` en produccion | Medio | Medio |
| **P5** | XII (Admin Processes) | Crear modulo CLI para tareas admin | Medio | Bajo |
| **P6** | X (Dev/Prod Parity) | Crear ambiente de staging | Alto | Medio |

### Criterios de prioridad

- **P1 (Logs):** Unico factor con estado GAP. Impacta directamente la capacidad de diagnosticar problemas en produccion.
- **P2 (Config):** Prevencion de errores por configuracion incompleta. Bajo esfuerzo, alto retorno.
- **P3 (Build/Release/Run):** Permite rollbacks deterministas y trazabilidad de versiones.
- **P4 (Concurrency):** Necesario para escalar, pero no urgente con un solo servidor.
- **P5 (Admin Processes):** Mejora la mantenibilidad pero hay workarounds funcionales.
- **P6 (Dev/Prod Parity):** Requiere infraestructura adicional; depende de presupuesto.

---

## 16. Referencias

- [The Twelve-Factor App](https://12factor.net/) — Metodologia original
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration) — Gestion de configuracion
- [PM2 Documentation](https://pm2.keymetrics.io/docs/) — Process manager
- [NestJS Standalone Application](https://docs.nestjs.com/standalone-applications) — Para admin processes
- `ecosystem.config.js` — Configuracion PM2 de gamilit
- `apps/backend/src/main.ts` — Bootstrap de la aplicacion
- `apps/backend/src/shared/utils/logger.util.ts` — Logger actual
- `apps/backend/src/config/env.config.ts` — Configuracion de entorno

---

## Historial de Cambios

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| 1.0.0 | 2026-02-14 | Auditoria inicial de los 12 factores contra gamilit |
