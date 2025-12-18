# GUIA DE MIGRACION - Configuracion de API (Variables Granulares)

**Fecha:** 2025-11-24
**Afecta a:** Todos los desarrolladores del proyecto GAMILIT Frontend

---

## QUE CAMBIO

El sistema de configuracion de API ahora usa variables granulares en lugar de URLs completas.

### ANTES (Ya no funciona)
```env
VITE_API_URL=http://localhost:3006/api
VITE_WS_URL=ws://localhost:3006
```

### AHORA (Requerido)
```env
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1
VITE_WS_HOST=localhost:3006
VITE_WS_PROTOCOL=ws
```

---

## COMO ACTUALIZAR TU ENTORNO LOCAL

### Paso 1: Actualizar tu archivo .env

```bash
cd apps/frontend
```

Edita tu archivo `.env` y reemplaza las variables legacy con las granulares:

```env
# ELIMINAR ESTAS LINEAS (legacy):
# VITE_API_URL=http://localhost:3006/api
# VITE_WS_URL=ws://localhost:3006

# AGREGAR ESTAS LINEAS (granulares):
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1
VITE_WS_HOST=localhost:3006
VITE_WS_PROTOCOL=ws
```

### Paso 2: Validar tu configuracion

```bash
npm run validate-env
```

Deberias ver:
```
✅ VITE_API_HOST: localhost:3006
✅ VITE_API_PROTOCOL: http
✅ Environment validation PASSED
```

### Paso 3: Reiniciar tu servidor de desarrollo

```bash
npm run dev
```

---

## TU CODIGO NO NECESITA CAMBIOS

El codigo existente que usa `env.apiUrl` y `env.wsUrl` sigue funcionando:

```typescript
import { env } from '@/config/env';

// ✅ Esto sigue funcionando igual
const response = await fetch(`${env.apiUrl}/users`);
const socket = io(env.wsUrl);
```

Las URLs ahora se construyen automaticamente desde las variables granulares.

---

## NUEVAS CAPACIDADES DISPONIBLES

Si necesitas acceso granular a los componentes de configuracion:

```typescript
import { env } from '@/config/env';

// Acceso granular a protocolo, host, version
const protocol = env.api.protocol;  // 'http'
const host = env.api.host;          // 'localhost:3006'
const version = env.api.version;    // 'v1'

// Construir URLs personalizadas
const customUrl = `${env.api.protocol}://${env.api.host}/custom-endpoint`;

// WebSocket granular
const wsProtocol = env.ws.protocol; // 'ws'
const wsHost = env.ws.host;         // 'localhost:3006'
```

---

## CONFIGURACION PARA DIFERENTES ENTORNOS

### Development (.env)
```env
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1
VITE_WS_HOST=localhost:3006
VITE_WS_PROTOCOL=ws
```

### Production (.env.production)
```env
VITE_API_HOST=74.208.126.102:3006  # o dominio cuando este disponible
VITE_API_PROTOCOL=http             # cambiar a https cuando SSL este configurado
VITE_API_VERSION=v1
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=ws                # cambiar a wss cuando SSL este configurado
```

### Testing (.env.test)
```env
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1
VITE_WS_HOST=localhost:3006
VITE_WS_PROTOCOL=ws
VITE_MOCK_API=false
```

---

## VALORES POR DEFECTO

Si no defines una variable, se usan estos defaults:

```typescript
VITE_API_HOST     -> 'localhost:3006'
VITE_API_PROTOCOL -> 'http'
VITE_API_VERSION  -> 'v1'
VITE_WS_PROTOCOL  -> 'ws'
VITE_WS_HOST      -> mismo que VITE_API_HOST
```

Esto significa que en development puedes omitir estas variables y funcionara con localhost:3006.

---

## VALIDACIONES DE PRODUCCION

El script de validacion ahora verifica:

1. Variables requeridas presentes
2. Host no apunta a localhost en produccion
3. Protocolo es HTTPS en produccion (warning si no)
4. WebSocket usa WSS en produccion (warning si no)
5. Flags de debug deshabilitados en produccion

---

## TROUBLESHOOTING

### Error: "Missing required variable: VITE_API_HOST"

**Solucion:** Agrega `VITE_API_HOST=localhost:3006` a tu archivo `.env`

### Error: "Missing required variable: VITE_API_PROTOCOL"

**Solucion:** Agrega `VITE_API_PROTOCOL=http` a tu archivo `.env`

### Las URLs construidas son incorrectas

**Verificar:**
```bash
npm run validate-env
```

Revisa que todas las variables esten correctamente definidas.

### Mi build falla con errores de configuracion

**Solucion:**
1. Verifica que tu `.env` o `.env.production` tenga las variables granulares
2. Ejecuta `npm run validate-env` para verificar configuracion
3. Si persiste, copia `.env.example` como base

---

## REFERENCIA RAPIDA

### Variables Requeridas (Minimo)

```env
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
```

### Variables Opcionales (con defaults)

```env
VITE_API_VERSION=v1          # default: 'v1'
VITE_WS_HOST=localhost:3006  # default: mismo que API_HOST
VITE_WS_PROTOCOL=ws          # default: 'ws'
VITE_API_TIMEOUT=30000       # default: 30000
```

---

## ARCHIVOS DE REFERENCIA

- **Ejemplo completo:** `apps/frontend/.env.example`
- **Documentacion detallada:** `IMPLEMENTATION-REPORT-API-CONFIG-HOMOLOGATION-2025-11-24.md`
- **Resumen ejecutivo:** `RESUMEN-HOMOLOGACION-API-CONFIG-2025-11-24.md`
- **Codigo fuente:** `apps/frontend/src/config/env.ts`

---

## PREGUNTAS FRECUENTES

### Q: Tengo que cambiar mi codigo?
**A:** No. El codigo existente sigue funcionando sin cambios.

### Q: Que pasa con VITE_API_URL y VITE_WS_URL?
**A:** Ya no se usan. Se construyen automaticamente desde variables granulares.

### Q: Por que este cambio?
**A:** Para unificar configuracion, eliminar duplicacion, y facilitar cambios (ej: cambiar solo protocolo sin tocar host).

### Q: Que pasa si no actualizo mi .env?
**A:** El build fallara con error "Missing required variable".

### Q: Funciona con mi setup de Docker/CI/CD?
**A:** Si, solo actualiza las variables de entorno inyectadas.

---

## SOPORTE

Si tienes problemas con la migracion:

1. Revisa esta guia
2. Consulta `IMPLEMENTATION-REPORT-API-CONFIG-HOMOLOGATION-2025-11-24.md`
3. Verifica tu configuracion con `npm run validate-env`
4. Compara tu `.env` con `.env.example`

---

**Version:** 1.0
**Ultima actualizacion:** 2025-11-24
