# CHECKLIST: Security & Supply Chain Pre-Deploy

**Version:** 1.0.0
**Alias:** @DEF_CHK_SECURITY_SUPPLY
**Fecha:** 2026-02-14
**Sistema:** SIMCO v4.0.0
**Uso:** Ejecutar antes de cada deploy a produccion (74.208.126.102)

---

## PROPOSITO

Verificar la postura de seguridad del proyecto gamilit antes de desplegar a produccion.
Cubre: dependencias npm, secretos, headers de seguridad, autenticacion, base de datos y validacion de entrada.

Complementa a:
- `POLITICA-SUPPLY-CHAIN.md` — Politica completa de supply chain
- `GUIA-ROTACION-SECRETOS.md` — Procedimientos de rotacion de secretos
- `CHECKLIST-SSOT-SYNC.md` — Coherencia entre capas

---

## SECUENCIA OBLIGATORIA

```
ANTES DE DEPLOY A PRODUCCION (74.208.126.102)
         |
         v
+-----------------------------+
| 1. SUPPLY CHAIN             |  <- BLOQUEANTE
| (npm audit + licencias)     |
+-------------+---------------+
         |
         v
+-----------------------------+
| 2. SECRETOS                 |  <- BLOQUEANTE
| (sin hardcodear, .env ok)   |
+-------------+---------------+
         |
         v
+-----------------------------+
| 3. HEADERS DE SEGURIDAD     |  <- BLOQUEANTE
| (helmet, CORS, Swagger)     |
+-------------+---------------+
         |
         v
+-----------------------------+
| 4. AUTENTICACION            |  <- BLOQUEANTE
| (JWT, bcrypt, rate limit)   |
+-------------+---------------+
         |
         v
+-----------------------------+
| 5. BASE DE DATOS            |  <- BLOQUEANTE
| (RLS, SSL, usuario correcto)|
+-------------+---------------+
         |
         v
+-----------------------------+
| 6. VALIDACION DE ENTRADA    |  <- BLOQUEANTE
| (ValidationPipe, DTOs)      |
+-----------------------------+
```

---

## CHECKLIST

### 1. Supply Chain (BLOQUEANTE)

```markdown
[ ] `npm audit` ejecutado en apps/backend sin vulnerabilidades criticas
    Comando: cd apps/backend && npm audit --audit-level=critical
[ ] `npm audit` ejecutado en apps/backend sin vulnerabilidades altas
    Comando: cd apps/backend && npm audit --audit-level=high
[ ] `npm audit` ejecutado en apps/frontend sin vulnerabilidades criticas
    Comando: cd apps/frontend && npm audit --audit-level=critical
[ ] `npm audit` ejecutado en apps/frontend sin vulnerabilidades altas
    Comando: cd apps/frontend && npm audit --audit-level=high
[ ] package-lock.json de backend actualizado y commiteado
    Comando: git diff --name-only -- apps/backend/package-lock.json
[ ] package-lock.json de frontend actualizado y commiteado
    Comando: git diff --name-only -- apps/frontend/package-lock.json
[ ] No hay dependencias con licencias prohibidas (GPL, AGPL, SSPL)
    Comando: cd apps/backend && npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0;SSPL"
    Comando: cd apps/frontend && npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0;SSPL"
[ ] Dependencias desactualizadas revisadas
    Comando: cd apps/backend && npm outdated
    Comando: cd apps/frontend && npm outdated
```

### 2. Secretos (BLOQUEANTE)

```markdown
[ ] No hay secrets hardcodeados en codigo fuente TypeScript
    Comando: grep -rn "password\|secret\|apikey\|api_key" --include="*.ts" apps/backend/src/ apps/frontend/src/ | grep -v node_modules | grep -v ".spec.ts" | grep -v "__mocks__" | grep -v ".env" | grep -v "process.env" | grep -v "PasswordDto\|PasswordInput\|PasswordField\|password:" | grep -v "//\|*/"
    NOTA: Revisar cada resultado manualmente, algunos son nombres de campos (no valores)
[ ] .env.production existe en servidor (74.208.126.102)
    Comando (en servidor): ls -la /home/isem/gamilit-workspace/apps/backend/.env
[ ] JWT_SECRET tiene minimo 64 caracteres
    Comando (en servidor): grep ^JWT_SECRET= /home/isem/gamilit-workspace/apps/backend/.env | awk -F= '{print length($2)}'
    Esperado: >= 64
[ ] JWT_REFRESH_SECRET tiene minimo 64 caracteres y es DIFERENTE a JWT_SECRET
    Comando (en servidor): grep ^JWT_REFRESH_SECRET= /home/isem/gamilit-workspace/apps/backend/.env | awk -F= '{print length($2)}'
    Esperado: >= 64
[ ] DB_PASSWORD tiene minimo 16 caracteres
    Comando (en servidor): grep ^DB_PASSWORD= /home/isem/gamilit-workspace/apps/backend/.env | awk -F= '{print length($2)}'
    Esperado: >= 16
[ ] No hay valores por defecto peligrosos en .env de produccion
    Comando (en servidor): grep -E "your-secret|change-in-production|^DB_PASSWORD=postgres$" /home/isem/gamilit-workspace/apps/backend/.env
    Esperado: Sin resultados
[ ] CORS_ORIGIN no incluye `*` (wildcard) en produccion
    Comando (en servidor): grep ^CORS_ORIGIN= /home/isem/gamilit-workspace/apps/backend/.env
    Esperado: Solo dominios especificos, NUNCA *
[ ] Ningun secreto proximo a expirar (ver calendario de rotacion)
    Referencia: docs/50-guides/backend/GUIA-ROTACION-SECRETOS.md seccion 6.2
```

### 3. Headers de Seguridad (BLOQUEANTE)

```markdown
[ ] Helmet configurado en main.ts
    Verificar: apps/backend/src/main.ts contiene app.use(helmet())
    Estado actual: CONFIGURADO (linea 66 de main.ts)
[ ] X-Powered-By deshabilitado
    Helmet lo deshabilita automaticamente por defecto
    Verificar: curl -I https://74.208.126.102/api/v1/health | grep -i "x-powered-by"
    Esperado: Header NO presente
[ ] CORS restrictivo (solo origenes conocidos)
    Verificar: apps/backend/src/main.ts configura CORS con lista explicita
    Estado actual: CONFIGURADO con lista de origenes via CORS_ORIGIN
    Produccion debe incluir SOLO: https://74.208.126.102, y dominios del frontend
[ ] Swagger deshabilitado en produccion
    Verificar (en servidor): grep ^ENABLE_SWAGGER= /home/isem/gamilit-workspace/apps/backend/.env
    Esperado: ENABLE_SWAGGER=false
    NOTA: Actualmente Swagger se genera siempre en main.ts; considerar
    condicionar con if (process.env.ENABLE_SWAGGER !== 'false')
[ ] Compression habilitado
    Verificar: apps/backend/src/main.ts contiene app.use(compression())
    Estado actual: CONFIGURADO (linea 69 de main.ts)
```

### 4. Autenticacion (BLOQUEANTE)

```markdown
[ ] Rate limiting activo en endpoints de login
    Verificar: ThrottlerGuard configurado en auth module
    Estado actual: NO CONFIGURADO (pendiente de implementar @nestjs/throttler)
    ACCION REQUERIDA: Instalar @nestjs/throttler y configurar ThrottlerModule
    Referencia sugerida:
      ThrottlerModule.forRoot({ ttl: 60000, limit: 5 })  // 5 intentos por minuto
      @UseGuards(ThrottlerGuard) en /auth/login
[ ] JWT access token con expiracion corta (< 24h)
    Verificar: apps/backend/src/config/jwt.config.ts
    Estado actual: 24h (configurable via JWT_EXPIRES_IN)
    Recomendacion: Reducir a 1h o menos en produccion
[ ] Refresh token configurado con expiracion razonable
    Verificar: apps/backend/src/config/jwt.config.ts
    Estado actual: 7d (configurable via JWT_REFRESH_EXPIRES_IN)
[ ] Passwords hasheados con bcrypt (cost >= 10)
    Verificar: apps/backend/src/modules/auth/services/auth.service.ts
    Estado actual: bcrypt.hash(password, 10) — cost factor 10
    Recomendacion: Considerar incrementar a 12 en produccion para mayor seguridad
[ ] No se almacenan passwords en texto plano en ningun lugar
    Verificar: Campo de BD es encrypted_password (hash, no plaintext)
[ ] Issuer y audience configurados en JWT
    Estado actual: issuer='gamilit-api', audience='gamilit-app'
```

### 5. Base de Datos (BLOQUEANTE)

```markdown
[ ] RLS (Row Level Security) habilitado en tablas con datos de usuario
    Estado actual: 418 politicas RLS configuradas en DDL
    Verificar: apps/database/ddl/07-enable-rls.sql, 07b, 07c, 07d
    NOTA CONOCIDA: auth.uid() y gamilit.is_super_admin() no existen aun,
    lo que bloquea ~60 politicas RLS y ~6 admin policies respectivamente
[ ] Conexion via SSL habilitada en produccion
    Verificar (en servidor): grep ^DB_SSL= /home/isem/gamilit-workspace/apps/backend/.env
    Esperado: DB_SSL=true
    Estado config: database.config.ts soporta ssl: { rejectUnauthorized: false }
[ ] Aplicacion conecta como gamilit_user (NO como postgres)
    Verificar (en servidor): grep ^DB_USERNAME= /home/isem/gamilit-workspace/apps/backend/.env
    Esperado: DB_USERNAME=gamilit_user
    NUNCA usar postgres como usuario de la aplicacion
[ ] Backup reciente disponible en servidor
    Verificar: ls -la /home/isem/backups/gamilit_platform_*.sql
    Recomendacion: Backup < 24h antes de deploy
[ ] synchronize deshabilitado en produccion
    Verificar (en servidor): grep ^DB_SYNCHRONIZE= /home/isem/gamilit-workspace/apps/backend/.env
    Esperado: DB_SYNCHRONIZE=false
    CRITICO: synchronize=true en produccion puede BORRAR datos
[ ] Pool de conexiones configurado adecuadamente
    Estado actual: max=2 por datasource (10 datasources = 20 conexiones totales)
    Verificar que no excede max_connections de PostgreSQL
```

### 6. Validacion de Entrada (BLOQUEANTE)

```markdown
[ ] ValidationPipe global con whitelist: true
    Verificar: apps/backend/src/main.ts
    Estado actual: CONFIGURADO (lineas 73-81)
    whitelist: true — elimina propiedades no declaradas en el DTO
[ ] forbidNonWhitelisted: true configurado
    Estado actual: CONFIGURADO
    Rechaza requests con propiedades extra (retorna 400 Bad Request)
[ ] transform: true configurado
    Estado actual: CONFIGURADO
    Transforma payloads a instancias DTO con tipos correctos
[ ] DTOs con decorators class-validator en todos los endpoints publicos
    Verificar: 399 DTOs definidos en el backend
    Comando: find apps/backend/src -name "*.dto.ts" | wc -l
[ ] AllExceptionsFilter configurado globalmente
    Estado actual: CONFIGURADO (linea 84 de main.ts)
    Captura todas las excepciones con informacion de error estructurada
[ ] No se exponen stack traces al cliente en produccion
    Verificar que AllExceptionsFilter oculta detalles internos en modo produccion
```

---

## GAPS CONOCIDOS Y ACCIONES PENDIENTES

| # | Gap | Severidad | Accion Requerida |
|---|-----|-----------|------------------|
| G1 | ThrottlerGuard no implementado | ALTA | Instalar @nestjs/throttler, configurar en AuthModule |
| G2 | Swagger siempre habilitado en main.ts | MEDIA | Condicionar con variable ENABLE_SWAGGER |
| G3 | bcrypt cost factor = 10 | BAJA | Considerar incrementar a 12 |
| G4 | JWT access token expira en 24h | MEDIA | Considerar reducir a 1h en produccion |
| G5 | auth.uid() no existe en BD | ALTA | Implementar funcion o adaptar politicas RLS |
| G6 | gamilit.is_super_admin() no existe | MEDIA | Implementar funcion para politicas admin |
| G7 | DB SSL no verificado en produccion | MEDIA | Confirmar DB_SSL=true en .env de produccion |

---

## DECISION

```yaml
SI_PASA_TODO:
  accion: "Proceder con deploy a produccion"
  post_deploy:
    - "Verificar health: curl -s https://74.208.126.102/api/v1/health"
    - "Verificar logs: pm2 logs gamilit-backend --lines 50"
    - "Verificar WebSocket: pm2 logs | grep 'Socket.IO'"

SI_FALLA_SUPPLY_CHAIN:
  accion: "BLOQUEAR deploy"
  proceso:
    1: "Ejecutar npm audit fix"
    2: "Si no hay fix disponible, evaluar override o reemplazo"
    3: "Re-ejecutar npm audit"
    4: "Si persiste critica/alta, documentar justificacion y aprobar excepcion"

SI_FALLA_SECRETOS:
  accion: "BLOQUEAR deploy"
  proceso:
    1: "Corregir valores inseguros en .env de produccion"
    2: "Rotar secretos comprometidos (ver GUIA-ROTACION-SECRETOS.md)"
    3: "Verificar que no hay secrets en git history"

SI_FALLA_SEGURIDAD:
  accion: "BLOQUEAR deploy si es critico, DOCUMENTAR si es gap conocido"
  proceso:
    1: "Evaluar si el gap es explotable en produccion"
    2: "Si es explotable: corregir antes de deploy"
    3: "Si no es explotable: documentar en GAPS CONOCIDOS con plan de remediacion"
```

---

## SCRIPT DE VERIFICACION RAPIDA

Ejecutar desde la raiz del proyecto para automatizar las verificaciones posibles localmente:

```bash
#!/bin/bash
# Verificacion rapida de seguridad pre-deploy
echo "=== CHECKLIST SECURITY PRE-DEPLOY ==="
echo ""

FAIL=0

# 1. Supply Chain
echo "[1/6] Supply Chain..."
cd apps/backend && npm audit --audit-level=high > /dev/null 2>&1
[ $? -ne 0 ] && echo "  FALLO: Backend tiene vulnerabilidades altas+" && FAIL=1 || echo "  OK"
cd ../frontend && npm audit --audit-level=high > /dev/null 2>&1
[ $? -ne 0 ] && echo "  FALLO: Frontend tiene vulnerabilidades altas+" && FAIL=1 || echo "  OK"
cd ../..

# 2. Lock files en git
echo "[2/6] Lock files..."
git ls-files apps/backend/package-lock.json > /dev/null 2>&1
[ $? -ne 0 ] && echo "  FALLO: Backend lock file no esta en git" && FAIL=1 || echo "  OK"
git ls-files apps/frontend/package-lock.json > /dev/null 2>&1
[ $? -ne 0 ] && echo "  FALLO: Frontend lock file no esta en git" && FAIL=1 || echo "  OK"

# 3. Helmet y ValidationPipe en main.ts
echo "[3/6] Seguridad en main.ts..."
grep -q "helmet()" apps/backend/src/main.ts
[ $? -ne 0 ] && echo "  FALLO: Helmet no configurado" && FAIL=1 || echo "  OK: Helmet"
grep -q "whitelist: true" apps/backend/src/main.ts
[ $? -ne 0 ] && echo "  FALLO: ValidationPipe whitelist no configurado" && FAIL=1 || echo "  OK: ValidationPipe"
grep -q "forbidNonWhitelisted: true" apps/backend/src/main.ts
[ $? -ne 0 ] && echo "  FALLO: forbidNonWhitelisted no configurado" && FAIL=1 || echo "  OK: forbidNonWhitelisted"

# 4. Build verification
echo "[4/6] Build backend..."
cd apps/backend && npm run build > /dev/null 2>&1
[ $? -ne 0 ] && echo "  FALLO: Backend build fallo" && FAIL=1 || echo "  OK"
cd ../..

echo "[5/6] Build frontend..."
cd apps/frontend && npm run build > /dev/null 2>&1
[ $? -ne 0 ] && echo "  FALLO: Frontend build fallo" && FAIL=1 || echo "  OK"
cd ../..

# 6. No secrets en codigo (heuristico)
echo "[6/6] Secrets hardcodeados..."
FOUND=$(grep -rn "password.*=.*['\"]" --include="*.ts" apps/backend/src/ apps/frontend/src/ 2>/dev/null | grep -v node_modules | grep -v ".spec.ts" | grep -v __mocks__ | grep -v process.env | grep -v "PasswordDto\|PasswordInput\|password:" | grep -cv "//\|/\*")
[ "$FOUND" -gt 0 ] && echo "  ALERTA: $FOUND posibles secrets hardcodeados (revisar manualmente)" || echo "  OK"

echo ""
if [ $FAIL -eq 0 ]; then
    echo "=== RESULTADO: APROBADO ==="
else
    echo "=== RESULTADO: FALLO - Corregir antes de deploy ==="
    exit 1
fi
```

---

## REFERENCIAS

- **Politica:** [POLITICA-SUPPLY-CHAIN](../../directivas/politicas/POLITICA-SUPPLY-CHAIN.md)
- **Guia Rotacion:** [GUIA-ROTACION-SECRETOS](../../../docs/50-guides/backend/GUIA-ROTACION-SECRETOS.md)
- **main.ts:** `apps/backend/src/main.ts` (helmet, CORS, ValidationPipe, Swagger)
- **jwt.config.ts:** `apps/backend/src/config/jwt.config.ts`
- **database.config.ts:** `apps/backend/src/config/database.config.ts`
- **redis.config.ts:** `apps/backend/src/config/redis.config.ts`
- **auth.service.ts:** `apps/backend/src/modules/auth/services/auth.service.ts` (bcrypt)
- **DDL RLS:** `apps/database/ddl/07-enable-rls.sql`, `07b`, `07c`, `07d`
- **ecosystem.config.js:** PM2 configuration (fork mode, backend:3006, frontend:3005)
