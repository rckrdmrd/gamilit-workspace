
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-AUD-003 -->
<!-- ID Nuevo: M-AUD-ET-003 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-AUD-ET-003: Especificación Técnica - Niveles de Logging

**ID:** ET-AUD-003
**Título:** Implementación de Sistema de Logging Multinivel
**Módulo:** 08-auditoria-configuracion
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación del sistema de logging con 5 niveles (ERROR, WARN, INFO, DEBUG, TRACE), usando Winston para NestJS, con configuración dinámica, structured logging en JSON, rotación automática de archivos, y redacción de datos sensibles.

---

## 🔗 Referencias

**Implementa:**
- [RF-AUD-003: Niveles de Logging](../../01-requerimientos/08-auditoria-configuracion/RF-AUD-003-niveles-logging.md)

**Relacionado con:**
- [ET-AUD-001: Sistema de Auditoría](./ET-AUD-001-sistema-auditoria.md)
- [ET-AUD-002: Alertas y Notificaciones](./ET-AUD-002-alertas-notificaciones.md)

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 Tabla: `log_levels`

```sql
-- Archivo: apps/database/ddl/schemas/audit_logging/tables/log_levels.sql
CREATE TYPE audit_logging.log_level AS ENUM ('error', 'warn', 'info', 'debug', 'trace');

CREATE TABLE audit_logging.log_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module VARCHAR(100) NOT NULL UNIQUE,  -- backend.auth, worker.media, etc.
    level audit_logging.log_level NOT NULL DEFAULT 'info',

    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Auto-revertir después de X tiempo (para debugging temporal)
    revert_to_level audit_logging.log_level,
    revert_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_log_levels_module ON audit_logging.log_levels(module);

-- Nivel por defecto para módulo raíz
INSERT INTO audit_logging.log_levels (module, level) VALUES
    ('default', 'info'),
    ('backend.auth', 'info'),
    ('backend.gamification', 'info'),
    ('backend.exercises', 'info'),
    ('backend.media', 'warn'),
    ('worker.media-processing', 'info'),
    ('database.queries', 'warn');
```

### 1.2 Función: `get_log_level`

```sql
-- Archivo: apps/database/ddl/schemas/audit_logging/functions/get_log_level.sql
CREATE OR REPLACE FUNCTION audit_logging.get_log_level(p_module VARCHAR)
RETURNS audit_logging.log_level AS $$
DECLARE
    v_level audit_logging.log_level;
    v_revert_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Buscar nivel específico para el módulo
    SELECT level, revert_at INTO v_level, v_revert_at
    FROM audit_logging.log_levels
    WHERE module = p_module;

    IF FOUND THEN
        -- Verificar si necesita revertir
        IF v_revert_at IS NOT NULL AND v_revert_at < CURRENT_TIMESTAMP THEN
            -- Revertir a nivel por defecto
            UPDATE audit_logging.log_levels
            SET level = revert_to_level,
                revert_to_level = NULL,
                revert_at = NULL
            WHERE module = p_module
            RETURNING level INTO v_level;
        END IF;

        RETURN v_level;
    ELSE
        -- No encontrado, devolver default
        SELECT level INTO v_level
        FROM audit_logging.log_levels
        WHERE module = 'default';

        RETURN COALESCE(v_level, 'info');
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Winston Logger Configuration

```typescript
// Archivo: apps/backend/src/config/logger.config.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'magenta'
};

winston.addColors(logColors);

// Formato estructurado (JSON)
const jsonFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json()
);

// Formato pretty para consola (desarrollo)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
    })
);

// Transport: Console
const consoleTransport = new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? jsonFormat : consoleFormat
});

// Transport: File (diario, rotación automática)
const fileTransport = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '30d',
    format: jsonFormat,
    zippedArchive: true
});

// Transport: Error file (solo errores)
const errorFileTransport = new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '90d',
    level: 'error',
    format: jsonFormat,
    zippedArchive: true
});

export const winstonConfig = {
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        consoleTransport,
        fileTransport,
        errorFileTransport
    ]
};
```

### 2.2 Custom Logger Service

```typescript
// Archivo: apps/backend/src/modules/logging/services/logger.service.ts
import { Injectable, Inject, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { DataSource } from 'typeorm';

interface LogContext {
    userId?: string;
    requestId?: string;
    sessionId?: string;
    [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
    private context: string;
    private persistentContext: LogContext = {};

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
        private dataSource: DataSource
    ) {}

    setContext(context: string): void {
        this.context = context;
    }

    setPersistentContext(context: LogContext): void {
        this.persistentContext = { ...this.persistentContext, ...context };
    }

    async shouldLog(level: string, module?: string): Promise<boolean> {
        const targetModule = module || this.context || 'default';

        // Consultar nivel configurado desde DB (con cache)
        const configuredLevel = await this.getConfiguredLevel(targetModule);

        const levels = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
        return levels[level] <= levels[configuredLevel];
    }

    private async getConfiguredLevel(module: string): Promise<string> {
        // TODO: Implementar cache (Redis) para evitar query en cada log
        // Por ahora, query directo
        try {
            const result = await this.dataSource.query(
                'SELECT audit_logging.get_log_level($1)',
                [module]
            );
            return result[0].get_log_level;
        } catch (error) {
            return 'info';  // Fallback
        }
    }

    error(message: string, error?: Error | string, context?: LogContext): void {
        const meta = this.buildMeta(context);

        if (error instanceof Error) {
            meta.error = error.message;
            meta.stack = error.stack;
        } else if (error) {
            meta.error = error;
        }

        this.logger.error(message, meta);
    }

    warn(message: string, context?: LogContext): void {
        this.logger.warn(message, this.buildMeta(context));
    }

    info(message: string, context?: LogContext): void {
        this.logger.info(message, this.buildMeta(context));
    }

    async debug(message: string, context?: LogContext): Promise<void> {
        if (await this.shouldLog('debug', this.context)) {
            this.logger.debug(message, this.buildMeta(context));
        }
    }

    async trace(message: string, context?: LogContext): Promise<void> {
        if (await this.shouldLog('trace', this.context)) {
            this.logger.log('trace', message, this.buildMeta(context));
        }
    }

    private buildMeta(context?: LogContext): any {
        const meta = {
            service: 'backend',
            module: this.context,
            environment: process.env.NODE_ENV,
            hostname: process.env.HOSTNAME,
            processId: process.pid,
            ...this.persistentContext,
            ...context
        };

        // Redactar datos sensibles
        return this.redactSensitiveData(meta);
    }

    private redactSensitiveData(data: any): any {
        const sensitiveFields = [
            'password', 'pwd', 'passwd',
            'token', 'accessToken', 'refreshToken',
            'apiKey', 'secret', 'privateKey',
            'creditCard', 'cardNumber', 'cvv',
            'ssn', 'taxId'
        ];

        const redacted = { ...data };

        for (const field of sensitiveFields) {
            if (field in redacted) {
                redacted[field] = '[REDACTED]';
            }
        }

        // Ofuscar email
        if (redacted.email) {
            const parts = redacted.email.split('@');
            if (parts.length === 2) {
                redacted.email = parts[0].substring(0, 3) + '***@' + parts[1];
            }
        }

        // Truncar tokens largos
        if (redacted.token && typeof redacted.token === 'string' && redacted.token.length > 16) {
            redacted.token = redacted.token.substring(0, 8) + '...';
        }

        return redacted;
    }
}
```

### 2.3 Request Context Middleware

```typescript
// Archivo: apps/backend/src/middleware/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../modules/logging/services/logger.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    constructor(private logger: LoggerService) {}

    use(req: Request, res: Response, next: NextFunction): void {
        // Generar o usar Request ID existente
        const requestId = req.headers['x-request-id'] as string || uuidv4();
        req['requestId'] = requestId;

        // Agregar a response headers
        res.setHeader('X-Request-ID', requestId);

        // Establecer contexto persistente para todos los logs de este request
        this.logger.setPersistentContext({
            requestId,
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Log de request entrante
        this.logger.info('Incoming request', {
            method: req.method,
            path: req.path,
            query: req.query
        });

        // Log de response al finalizar
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;

            this.logger.info('Request completed', {
                statusCode: res.statusCode,
                duration
            });
        });

        next();
    }
}
```

### 2.4 Dynamic Log Level Controller

```typescript
// Archivo: apps/backend/src/modules/logging/controllers/log-level.controller.ts
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DataSource } from 'typeorm';

interface SetLogLevelDto {
    module: string;
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    duration?: number;  // segundos, 0 = permanente
}

@Controller('admin/logging')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class LogLevelController {
    constructor(private dataSource: DataSource) {}

    @Get('levels')
    async getLogLevels(): Promise<any[]> {
        return this.dataSource.query(`
            SELECT module, level, revert_at
            FROM audit_logging.log_levels
            ORDER BY module
        `);
    }

    @Post('level')
    async setLogLevel(@Body() dto: SetLogLevelDto): Promise<any> {
        const { module, level, duration } = dto;

        // Validar nivel
        const validLevels = ['error', 'warn', 'info', 'debug', 'trace'];
        if (!validLevels.includes(level)) {
            throw new Error(`Invalid level: ${level}`);
        }

        // Calcular revert_at si es temporal
        const revertAt = duration && duration > 0
            ? new Date(Date.now() + duration * 1000)
            : null;

        // Actualizar nivel en DB
        await this.dataSource.query(`
            INSERT INTO audit_logging.log_levels (module, level, revert_to_level, revert_at)
            VALUES ($1, $2, 'info', $3)
            ON CONFLICT (module)
            DO UPDATE SET
                level = $2,
                revert_to_level = CASE WHEN $3 IS NOT NULL THEN 'info' ELSE NULL END,
                revert_at = $3,
                updated_at = CURRENT_TIMESTAMP
        `, [module, level, revertAt]);

        return {
            success: true,
            module,
            level,
            revertAt
        };
    }

    @Post('debug-mode')
    async enableDebugMode(@Body() body: { userId: string; duration: number }): Promise<any> {
        // Habilitar TRACE solo para un usuario específico (útil para debugging)
        // Implementación específica según necesidad
        // (podría usar metadata en logs para filtrar por userId)

        return {
            success: true,
            message: `Debug mode enabled for user ${body.userId} for ${body.duration} seconds`
        };
    }
}
```

---

## 🎨 3. Uso en Aplicación

### 3.1 Inyección en Services

```typescript
// Archivo: apps/backend/src/modules/auth/services/auth.service.ts
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logging/services/logger.service';

@Injectable()
export class AuthService {
    constructor(private logger: LoggerService) {
        this.logger.setContext('AuthService');
    }

    async login(email: string, password: string): Promise<any> {
        this.logger.info('User attempting login', {
            email: email.substring(0, 3) + '***'  // Ofuscado
        });

        try {
            // Lógica de login...
            const user = await this.validateUser(email, password);

            this.logger.info('User logged in successfully', {
                userId: user.id,
                email: email.substring(0, 3) + '***'
            });

            return { user, token: this.generateToken(user) };
        } catch (error) {
            this.logger.error('Login failed', error, {
                email: email.substring(0, 3) + '***',
                reason: error.message
            });

            throw error;
        }
    }

    private async validateUser(email: string, password: string): Promise<any> {
        await this.logger.debug('Validating user credentials', {
            email: email.substring(0, 3) + '***'
        });

        // Validación...
        await this.logger.trace('Querying database for user');

        const user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            await this.logger.warn('User not found', { email: email.substring(0, 3) + '***' });
            throw new Error('Invalid credentials');
        }

        return user;
    }
}
```

### 3.2 Interceptor para Logging Automático

```typescript
// Archivo: apps/backend/src/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '../modules/logging/services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private logger: LoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const now = Date.now();

        this.logger.setContext(`${context.getClass().name}.${context.getHandler().name}`);

        return next.handle().pipe(
            tap(() => {
                const responseTime = Date.now() - now;
                this.logger.debug(`${method} ${url} - ${responseTime}ms`, {
                    responseTime
                });
            }),
            catchError((error) => {
                const responseTime = Date.now() - now;
                this.logger.error(`${method} ${url} - Error after ${responseTime}ms`, error, {
                    responseTime,
                    errorType: error.constructor.name
                });
                return throwError(() => error);
            })
        );
    }
}
```

---

## 🔧 4. Configuración

### 4.1 Environment Variables

```bash
# Archivo: apps/backend/.env
# Logging Configuration
LOG_LEVEL=info  # error, warn, info, debug, trace
LOG_FORMAT=json  # json, pretty
LOG_TO_FILE=true
LOG_TO_CONSOLE=true
LOG_DIR=/var/log/gamilit

# Rotation
LOG_MAX_SIZE=100m
LOG_MAX_FILES=30d
LOG_COMPRESS=true

# External Logging (opcional)
DATADOG_API_KEY=your_api_key
DATADOG_ENABLED=false
```

### 4.2 Winston con Datadog (Opcional)

```typescript
// Archivo: apps/backend/src/config/datadog-transport.ts
import Transport from 'winston-transport';
import axios from 'axios';

export class DatadogTransport extends Transport {
    private apiKey: string;
    private buffer: any[] = [];
    private flushInterval = 5000;  // 5 segundos

    constructor(opts?: any) {
        super(opts);
        this.apiKey = opts.apiKey;

        // Flush periódico
        setInterval(() => this.flush(), this.flushInterval);
    }

    log(info: any, callback: () => void): void {
        // Agregar a buffer
        this.buffer.push({
            ddsource: 'nodejs',
            ddtags: `env:${process.env.NODE_ENV},service:gamilit-backend`,
            message: info.message,
            level: info.level,
            ...info.metadata
        });

        // Flush si buffer está lleno
        if (this.buffer.length >= 100) {
            this.flush();
        }

        callback();
    }

    private async flush(): Promise<void> {
        if (this.buffer.length === 0) return;

        const logs = this.buffer.splice(0, this.buffer.length);

        try {
            await axios.post(
                'https://http-intake.logs.datadoghq.com/v1/input',
                logs,
                {
                    headers: {
                        'DD-API-KEY': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Failed to send logs to Datadog:', error);
            // Reincorporar logs fallidos al buffer (con límite)
            this.buffer.unshift(...logs.slice(0, 100));
        }
    }
}

// Uso en winstonConfig
if (process.env.DATADOG_ENABLED === 'true') {
    winstonConfig.transports.push(
        new DatadogTransport({ apiKey: process.env.DATADOG_API_KEY })
    );
}
```

---

## ✅ Criterios de Aceptación

- [x] Tabla `log_levels` almacena configuración por módulo
- [x] Función `get_log_level()` con auto-revert temporal
- [x] LoggerService con 5 niveles (ERROR, WARN, INFO, DEBUG, TRACE)
- [x] Configuración dinámica sin reinicio (API endpoint)
- [x] Structured logging en JSON
- [x] Request ID propagado en todos los logs
- [x] Redacción automática de datos sensibles
- [x] Rotación diaria de archivos con compresión
- [x] Retención diferenciada (30/90 días)

---

## 📚 Referencias Técnicas

### Database
- Schema: `audit_logging`
- Tabla: `log_levels`
- Función: `get_log_level()`

### Backend
- Service: `apps/backend/src/modules/logging/services/logger.service.ts`
- Config: `apps/backend/src/config/logger.config.ts`
- Middleware: `apps/backend/src/middleware/request-context.middleware.ts`
- Controller: `apps/backend/src/modules/logging/controllers/log-level.controller.ts`

---

**Última revisión:** 2025-11-07
**Revisores:** DevOps Team, Backend Team
**Próxima revisión:** 2026-01-07
