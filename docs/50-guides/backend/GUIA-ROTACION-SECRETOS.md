---
titulo: Guía de Rotación de Secretos
tipo: guia
dominio: backend
ultima_actualizacion: 2026-02-27
---

# Guia de Rotacion de Secretos
titulo: Guia de Rotacion de Secretos
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [seguridad, secretos, jwt, rotacion]
aplica_a: [backend, devops]
estado: vigente
---

**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** Backend (NestJS 11) + DevOps (PM2, servidor 74.208.126.102)

---

## 1. Inventario de Secretos de gamilit

Todos los secretos del sistema se gestionan mediante variables de entorno en archivos `.env`. A continuacion se listan todos los secretos activos y su politica de rotacion.

### 1.1 Tabla de Secretos

| Secreto | Archivo | Variable | Rotacion | Complejidad Minima |
|---------|---------|----------|----------|--------------------|
| JWT Secret | .env | `JWT_SECRET` | 180 dias | 64 caracteres alfanumericos + simbolos |
| JWT Refresh Secret | .env | `JWT_REFRESH_SECRET` | 180 dias | 64 caracteres alfanumericos + simbolos |
| DB Password (gamilit_user) | .env | `DB_PASSWORD` | 90 dias | 16+ caracteres, mayusculas, minusculas, numeros, simbolos |
| DB Username | .env | `DB_USERNAME` / `DB_USER` | Bajo demanda | N/A |
| Redis Password | .env | `REDIS_PASSWORD` | 90 dias | 16+ caracteres |
| CORS Origins | .env | `CORS_ORIGIN` | Bajo demanda | N/A (no es secreto, pero es sensible) |
| JWT Issuer | .env | `JWT_ISSUER` | No rota | Valor fijo: `gamilit-api` |
| JWT Audience | .env | `JWT_AUDIENCE` | No rota | Valor fijo: `gamilit-app` |

### 1.2 Calendario de Rotacion

| Frecuencia | Secretos | Proxima Rotacion |
|------------|----------|------------------|
| Cada 90 dias | DB_PASSWORD, REDIS_PASSWORD | Calcular desde ultimo cambio |
| Cada 180 dias | JWT_SECRET, JWT_REFRESH_SECRET | Calcular desde ultimo cambio |
| Bajo demanda | CORS_ORIGIN, credenciales de terceros | Cuando cambie infraestructura |

### 1.3 Ubicacion de Archivos .env

| Ambiente | Ubicacion | Gestion |
|----------|-----------|---------|
| Desarrollo (WSL) | `apps/backend/.env` | Local, no en git |
| Produccion | `/home/isem/gamilit-workspace/apps/backend/.env` (servidor 74.208.126.102) | Manual via SSH |

---

## 2. Rotacion de JWT Secret (Patron Multi-Key)

La rotacion de JWT requiere un periodo de transicion donde ambas claves (antigua y nueva) son validas, para no invalidar tokens ya emitidos.

### 2.1 Contexto de gamilit

Configuracion actual en `apps/backend/src/config/jwt.config.ts`:

```typescript
// Access token: expira en 24h (configurable via JWT_EXPIRES_IN)
secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
signOptions: {
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: process.env.JWT_ISSUER || 'gamilit-api',
  audience: process.env.JWT_AUDIENCE || 'gamilit-app',
},

// Refresh token: expira en 7d (configurable via JWT_REFRESH_EXPIRES_IN)
secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
```

### 2.2 Procedimiento de Rotacion

```
PASO 1: PREPARACION (Dia D)
  |
  +-- Generar nueva clave JWT:
  |     openssl rand -base64 64
  |
  +-- Backup del .env actual:
  |     cp .env .env.backup.$(date +%Y%m%d)
  |
  v
PASO 2: MODO TRANSICION (Dia D, hora de bajo trafico)
  |
  +-- Implementar verificacion multi-key (ver seccion 2.3)
  |
  +-- Configurar variables:
  |     JWT_SECRET=<nueva_clave>
  |     JWT_SECRET_PREVIOUS=<clave_anterior>
  |     JWT_REFRESH_SECRET=<nueva_clave_refresh>
  |     JWT_REFRESH_SECRET_PREVIOUS=<clave_refresh_anterior>
  |
  +-- pm2 restart ecosystem.config.js
  |
  v
PASO 3: PERIODO DE GRACIA (7 dias)
  |
  +-- Nuevos tokens se firman con clave nueva
  +-- Tokens existentes se verifican con ambas claves
  +-- Monitorear logs por errores de autenticacion
  |
  v
PASO 4: LIMPIEZA (Dia D+7, despues de que expiren refresh tokens)
  |
  +-- Remover JWT_SECRET_PREVIOUS y JWT_REFRESH_SECRET_PREVIOUS
  +-- pm2 restart ecosystem.config.js
  +-- Verificar que no hay errores 401 inesperados
```

### 2.3 Implementacion Multi-Key en NestJS

Para soportar la transicion, se puede usar una estrategia JWT personalizada que intenta verificar con multiples claves:

```typescript
// Concepto: JwtStrategy con fallback a clave anterior
// apps/backend/src/modules/auth/strategies/jwt.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly previousSecret: string | undefined;

  constructor(private configService: ConfigService) {
    const currentSecret = configService.get<string>('jwt.secret');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        // Intentar con clave actual primero
        try {
          jwt.verify(rawJwtToken, currentSecret);
          done(null, currentSecret);
        } catch {
          // Si falla, intentar con clave anterior (periodo de transicion)
          const prevSecret = configService.get<string>('JWT_SECRET_PREVIOUS');
          if (prevSecret) {
            try {
              jwt.verify(rawJwtToken, prevSecret);
              done(null, prevSecret);
            } catch {
              done(new UnauthorizedException('Token invalido'));
            }
          } else {
            done(new UnauthorizedException('Token invalido'));
          }
        }
      },
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
```

### 2.4 Generacion de Claves Seguras

```bash
# JWT Secret (64 bytes, base64)
openssl rand -base64 64

# Alternativa con caracteres alfanumericos
openssl rand -hex 32

# Ejemplo de salida segura:
# k7Bx9qP2mNvR4wJ8sF6hL3tY5uA0cD1eG9iK2oM7nQ4xZ8bV6wU3jH5fT1yR0p
```

---

## 3. Rotacion de Password de Base de Datos

### 3.1 Contexto de gamilit

Configuracion actual en `apps/backend/src/config/database.config.ts`:

```typescript
host: process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PORT || '5432', 10),
username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
password: process.env.DB_PASSWORD || 'postgres',
database: process.env.DB_DATABASE || 'gamilit_platform',
```

Servidor de produccion: 74.208.126.102, puerto 5432, base de datos `gamilit_platform`.

### 3.2 Metodo A: ALTER ROLE (Recomendado, Minimo Downtime)

```bash
# 1. Conectar al servidor de produccion
ssh isem@74.208.126.102

# 2. Generar nuevo password
NEW_PASS=$(openssl rand -base64 24)
echo "Nuevo password: $NEW_PASS"

# 3. Backup del .env actual
cp /home/isem/gamilit-workspace/apps/backend/.env \
   /home/isem/gamilit-workspace/apps/backend/.env.backup.$(date +%Y%m%d)

# 4. Cambiar password en PostgreSQL
sudo -u postgres psql -c "ALTER ROLE gamilit_user PASSWORD '$NEW_PASS';"

# 5. Actualizar .env con nuevo password
# Editar manualmente o con sed:
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_PASS/" \
    /home/isem/gamilit-workspace/apps/backend/.env

# 6. Restart de la aplicacion
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js

# 7. Verificar conexion
pm2 logs gamilit-backend --lines 20
# Buscar: "TypeORM connected" o ausencia de errores de conexion

# 8. Verificar endpoint de health
curl -s https://74.208.126.102/api/v1/health | jq .
```

### 3.3 Metodo B: Usuario Temporal (Zero Downtime)

Para entornos donde no se puede tolerar ningun downtime:

```bash
# 1. Crear usuario temporal con mismos permisos
sudo -u postgres psql <<SQL
CREATE ROLE gamilit_user_temp WITH LOGIN PASSWORD 'temp_password_here';
-- Copiar permisos de gamilit_user
GRANT gamilit_user TO gamilit_user_temp;
SQL

# 2. Actualizar .env para usar usuario temporal
# DB_USERNAME=gamilit_user_temp
# DB_PASSWORD=temp_password_here

# 3. Restart aplicacion (ahora usa usuario temporal)
pm2 restart ecosystem.config.js

# 4. Cambiar password del usuario original
sudo -u postgres psql -c "ALTER ROLE gamilit_user PASSWORD 'new_secure_password';"

# 5. Actualizar .env con usuario original y nuevo password
# DB_USERNAME=gamilit_user
# DB_PASSWORD=new_secure_password

# 6. Restart aplicacion (ahora usa usuario original con nuevo password)
pm2 restart ecosystem.config.js

# 7. Eliminar usuario temporal
sudo -u postgres psql -c "DROP ROLE gamilit_user_temp;"
```

### 3.4 Consideraciones con 10 Datasources

gamilit usa 10 datasources en `app.module.ts`, todas conectando al mismo servidor PostgreSQL con el mismo usuario. Al rotar el password:

- **Todas las conexiones** se ven afectadas simultaneamente
- El pool de conexiones (max: 2 por datasource = 20 conexiones totales) se reconecta automaticamente tras el restart de PM2
- Verificar que las 10 datasources reconectan correctamente revisando los logs

---

## 4. Rotacion de Redis Password

### 4.1 Contexto de gamilit

Configuracion actual en `apps/backend/src/config/redis.config.ts`:

```typescript
url: process.env.REDIS_URL || 'redis://localhost:6379',
db: parseInt(process.env.REDIS_SOCKET_DB || '0', 10),
password: process.env.REDIS_PASSWORD || undefined,
```

Redis se usa para:
- **Socket.IO adapter** (RedisIoAdapter) para escalabilidad horizontal de WebSockets
- **Persistencia de mensajes** pendientes (prefijo: `gamilit:pending:`, TTL: 86400s)
- **Coordenacion de sockets** (prefijo: `gamilit:socket:`)

### 4.2 Procedimiento de Rotacion

```bash
# 1. Conectar al servidor de produccion
ssh isem@74.208.126.102

# 2. Generar nuevo password
NEW_REDIS_PASS=$(openssl rand -base64 24)
echo "Nuevo password Redis: $NEW_REDIS_PASS"

# 3. Backup del .env actual
cp /home/isem/gamilit-workspace/apps/backend/.env \
   /home/isem/gamilit-workspace/apps/backend/.env.backup.redis.$(date +%Y%m%d)

# 4. Cambiar password en Redis (sin restart de Redis)
redis-cli CONFIG SET requirepass "$NEW_REDIS_PASS"

# 5. Verificar que el nuevo password funciona
redis-cli -a "$NEW_REDIS_PASS" PING
# Respuesta esperada: PONG

# 6. Persistir el cambio en redis.conf (para que sobreviva un restart de Redis)
redis-cli -a "$NEW_REDIS_PASS" CONFIG REWRITE

# 7. Actualizar .env con nuevo password
sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$NEW_REDIS_PASS/" \
    /home/isem/gamilit-workspace/apps/backend/.env

# Tambien actualizar REDIS_URL si incluye password:
# REDIS_URL=redis://:NEW_REDIS_PASS@localhost:6379

# 8. Restart de la aplicacion
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js

# 9. Verificar conexion Socket.IO con Redis
pm2 logs gamilit-backend --lines 20
# Buscar: "Socket.IO using Redis adapter for horizontal scaling"
# Si falla: "Socket.IO using in-memory adapter (no horizontal scaling)"

# 10. Verificar que mensajes pendientes no se perdieron
redis-cli -a "$NEW_REDIS_PASS" KEYS "gamilit:pending:*"
```

### 4.3 Impacto en WebSockets

Al rotar el password de Redis:

- Las conexiones WebSocket activas se **desconectan momentaneamente** durante el restart de PM2
- Los clientes Socket.IO reconectan automaticamente (reconexion built-in)
- Los mensajes pendientes almacenados en Redis se **preservan** (el cambio de password no afecta los datos)
- Si Redis no reconecta, el sistema **cae gracefully** a adaptador in-memory (sin escalabilidad horizontal)

---

## 5. Patron .env Seguro

### 5.1 Reglas Fundamentales

1. **NUNCA** incluir archivos `.env` con valores reales en git
2. `.env` ya esta en `.gitignore` del proyecto (verificar periodicamente)
3. Mantener `.env.example` con nombres de variables pero SIN valores sensibles
4. Hacer backup de `.env` antes de cualquier cambio de secretos

### 5.2 Template .env.example para Backend

```bash
# apps/backend/.env.example
# Copiar a .env y rellenar valores reales
# NUNCA commitear .env con valores reales

# === Servidor ===
NODE_ENV=development
PORT=3006

# === Base de Datos (PostgreSQL 15) ===
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gamilit_user
DB_PASSWORD=           # OBLIGATORIO: minimo 16 caracteres
DB_DATABASE=gamilit_platform
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_SSL=false

# === JWT ===
JWT_SECRET=            # OBLIGATORIO: minimo 64 caracteres (openssl rand -base64 64)
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=    # OBLIGATORIO: minimo 64 caracteres, diferente a JWT_SECRET
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=gamilit-api
JWT_AUDIENCE=gamilit-app

# === Redis ===
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=        # Opcional en dev, OBLIGATORIO en produccion
REDIS_SOCKET_DB=0
REDIS_SOCKET_PREFIX=gamilit:socket:
REDIS_MESSAGE_PREFIX=gamilit:pending:
REDIS_MESSAGE_TTL=86400

# === CORS ===
CORS_ORIGIN=http://localhost:3005,http://localhost:3006

# === Swagger ===
ENABLE_SWAGGER=true    # false en produccion
```

### 5.3 Valores Minimos de Seguridad

| Variable | Minimo Desarrollo | Minimo Produccion |
|----------|------------------|-------------------|
| `JWT_SECRET` | 32 caracteres | 64 caracteres, generado con openssl |
| `JWT_REFRESH_SECRET` | 32 caracteres | 64 caracteres, diferente a JWT_SECRET |
| `DB_PASSWORD` | 8 caracteres | 16 caracteres, con simbolos |
| `REDIS_PASSWORD` | Sin password (opcional) | 16 caracteres |
| `CORS_ORIGIN` | `*` aceptable | Solo dominios especificos, NUNCA `*` |
| `ENABLE_SWAGGER` | `true` | `false` (SIEMPRE) |

### 5.4 Verificacion de .env en Produccion

```bash
# Conectar a produccion
ssh isem@74.208.126.102

# Verificar que .env existe
ls -la /home/isem/gamilit-workspace/apps/backend/.env

# Verificar longitud de JWT_SECRET (sin revelar el valor)
grep JWT_SECRET /home/isem/gamilit-workspace/apps/backend/.env | awk -F= '{print length($2), "caracteres"}'

# Verificar que no hay valores por defecto peligrosos
grep -E "your-secret|change-in-production|postgres$" \
    /home/isem/gamilit-workspace/apps/backend/.env
# Si hay output, HAY VALORES INSEGUROS que deben cambiarse inmediatamente
```

---

## 6. Automatizacion de Rotacion

### 6.1 Script de Rotacion Completa

```bash
#!/bin/bash
# scripts/rotate-secrets.sh
# Rotacion de secretos para gamilit
# Ejecutar en servidor de produccion (74.208.126.102)

set -euo pipefail

ENV_FILE="/home/isem/gamilit-workspace/apps/backend/.env"
BACKUP_DIR="/home/isem/gamilit-workspace/backups/env"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== Rotacion de Secretos gamilit ==="
echo "Fecha: $DATE"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Backup obligatorio
cp "$ENV_FILE" "$BACKUP_DIR/.env.backup.$DATE"
echo "[OK] Backup creado: $BACKUP_DIR/.env.backup.$DATE"

# Menu de rotacion
echo ""
echo "Seleccionar secreto a rotar:"
echo "  1) JWT_SECRET + JWT_REFRESH_SECRET"
echo "  2) DB_PASSWORD"
echo "  3) REDIS_PASSWORD"
echo "  4) Todos"
echo ""
read -p "Opcion: " OPCION

case $OPCION in
    1)
        NEW_JWT=$(openssl rand -base64 64 | tr -d '\n')
        NEW_JWT_REFRESH=$(openssl rand -base64 64 | tr -d '\n')
        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$NEW_JWT/" "$ENV_FILE"
        sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$NEW_JWT_REFRESH/" "$ENV_FILE"
        echo "[OK] JWT secrets rotados"
        echo "[AVISO] Todos los tokens activos se invalidaran tras restart"
        ;;
    2)
        NEW_DB_PASS=$(openssl rand -base64 24 | tr -d '\n')
        sudo -u postgres psql -c "ALTER ROLE gamilit_user PASSWORD '$NEW_DB_PASS';"
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_DB_PASS/" "$ENV_FILE"
        echo "[OK] DB password rotado"
        ;;
    3)
        NEW_REDIS_PASS=$(openssl rand -base64 24 | tr -d '\n')
        CURRENT_REDIS_PASS=$(grep ^REDIS_PASSWORD "$ENV_FILE" | cut -d= -f2)
        redis-cli -a "$CURRENT_REDIS_PASS" CONFIG SET requirepass "$NEW_REDIS_PASS"
        redis-cli -a "$NEW_REDIS_PASS" CONFIG REWRITE
        sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$NEW_REDIS_PASS/" "$ENV_FILE"
        echo "[OK] Redis password rotado"
        ;;
    4)
        echo "Rotando todos los secretos..."
        # Implementar llamadas a opciones 1, 2, 3 en secuencia
        echo "[AVISO] Ejecutar opciones 1, 2, 3 manualmente en secuencia"
        ;;
esac

echo ""
echo "Restart necesario:"
echo "  cd /home/isem/gamilit-workspace && pm2 restart ecosystem.config.js"
echo ""
echo "Verificacion post-restart:"
echo "  pm2 logs gamilit-backend --lines 30"
echo "  curl -s https://74.208.126.102/api/v1/health"
```

### 6.2 Notificacion Pre-Expiracion

Para no olvidar la rotacion, registrar las fechas de ultimo cambio y configurar recordatorios:

```bash
# Archivo de tracking de rotaciones
# /home/isem/gamilit-workspace/backups/env/rotation-log.txt

# Formato: FECHA | SECRETO | PROXIMA_ROTACION
# 2026-02-14 | JWT_SECRET | 2026-08-13 (180 dias)
# 2026-02-14 | JWT_REFRESH_SECRET | 2026-08-13 (180 dias)
# 2026-02-14 | DB_PASSWORD | 2026-05-15 (90 dias)
# 2026-02-14 | REDIS_PASSWORD | 2026-05-15 (90 dias)
```

Script de verificacion de expiracion:

```bash
#!/bin/bash
# scripts/check-secret-expiry.sh
# Verificar si hay secretos proximos a expirar

ROTATION_LOG="/home/isem/gamilit-workspace/backups/env/rotation-log.txt"
WARN_DAYS=14
TODAY=$(date +%s)

echo "=== Verificacion de Expiracion de Secretos ==="

while IFS='|' read -r FECHA SECRETO PROXIMA; do
    PROXIMA_TRIMMED=$(echo "$PROXIMA" | xargs | cut -d' ' -f1)
    PROXIMA_EPOCH=$(date -d "$PROXIMA_TRIMMED" +%s 2>/dev/null)

    if [ -z "$PROXIMA_EPOCH" ]; then
        continue
    fi

    DIAS_RESTANTES=$(( (PROXIMA_EPOCH - TODAY) / 86400 ))

    if [ "$DIAS_RESTANTES" -le 0 ]; then
        echo "  EXPIRADO: $SECRETO (vencio hace $((-DIAS_RESTANTES)) dias)"
    elif [ "$DIAS_RESTANTES" -le "$WARN_DAYS" ]; then
        echo "  ALERTA: $SECRETO expira en $DIAS_RESTANTES dias ($PROXIMA_TRIMMED)"
    else
        echo "  OK: $SECRETO - $DIAS_RESTANTES dias restantes"
    fi
done < "$ROTATION_LOG"
```

### 6.3 Integracion con Checklist de Deploy

Antes de cada deploy a produccion, agregar al checklist:

```markdown
- [ ] Verificar que ningun secreto esta expirado o proximo a expirar
- [ ] Si hay rotacion pendiente, ejecutarla ANTES del deploy
- [ ] Verificar backup reciente de .env en /home/isem/gamilit-workspace/backups/env/
```

---

## 7. Procedimiento de Emergencia

Si un secreto es comprometido (ej: .env expuesto, log con secreto visible):

### 7.1 Respuesta Inmediata (< 1 hora)

```
1. ROTAR el secreto comprometido INMEDIATAMENTE (seccion correspondiente)
2. RESTART la aplicacion:
     pm2 restart ecosystem.config.js
3. VERIFICAR que la aplicacion funciona:
     curl -s https://74.208.126.102/api/v1/health
4. INVALIDAR sesiones activas (si JWT fue comprometido):
     -- Cambiar JWT_SECRET invalida TODOS los tokens
     -- Los usuarios deberan re-autenticarse
5. REVISAR logs por accesos sospechosos:
     pm2 logs gamilit-backend --lines 1000 | grep -i "unauthorized\|forbidden\|error"
6. DOCUMENTAR el incidente en orchestration/trazas/
```

### 7.2 Post-Incidente

- Analizar como se comprometio el secreto
- Actualizar procedimientos para prevenir recurrencia
- Verificar que el secreto comprometido no esta en ningun log, backup publico o commit de git

---

## Referencias

- **Configuracion JWT:** `apps/backend/src/config/jwt.config.ts`
- **Configuracion DB:** `apps/backend/src/config/database.config.ts`
- **Configuracion Redis:** `apps/backend/src/config/redis.config.ts`
- **Configuracion App:** `apps/backend/src/config/app.config.ts`
- **Main.ts:** `apps/backend/src/main.ts` (helmet, CORS, ValidationPipe)
- **PM2 Config:** `ecosystem.config.js`
- **POLITICA-SUPPLY-CHAIN:** `orchestration/directivas/politicas/POLITICA-SUPPLY-CHAIN.md`
- **CHECKLIST-SECURITY-SUPPLY-CHAIN:** `orchestration/_definitions/checklists/CHECKLIST-SECURITY-SUPPLY-CHAIN.md`

---

*Sistema SIMCO v4.0.0*
*Fecha: 2026-02-14*
