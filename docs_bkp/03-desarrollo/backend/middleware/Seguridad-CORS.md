# Seguridad CORS y Headers

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Índice

1. [Helmet.js - Security Headers](#helmetjs---security-headers)
2. [CORS Configuration](#cors-configuration)
3. [Content Security Policy](#content-security-policy-csp)
4. [Headers de Seguridad](#headers-de-seguridad)

---

## Helmet.js - Security Headers

Helmet.js configura headers HTTP de seguridad automáticamente.

### Configuración

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Headers Aplicados

| Header | Valor | Propósito |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Protección XSS |
| `Strict-Transport-Security` | `max-age=31536000` | Fuerza HTTPS |
| `X-DNS-Prefetch-Control` | `off` | Controla DNS prefetch |

---

## CORS Configuration

### Configuración Básica

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Tenant-ID'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400, // 24 horas
};

app.use(cors(corsOptions));
```

### Orígenes Permitidos

**Desarrollo:**
```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
```

**Producción:**
```
https://gamilit.com
https://app.gamilit.com
https://admin.gamilit.com
```

### CORS Dinámico

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    // Permitir requests sin origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
```

---

## Content Security Policy (CSP)

### Directivas de CSP

```typescript
const cspDirectives = {
  defaultSrc: ["'self'"],

  scriptSrc: [
    "'self'",
    // Permitir scripts inline en desarrollo
    process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : "",
  ].filter(Boolean),

  styleSrc: [
    "'self'",
    "'unsafe-inline'",  // Necesario para algunos frameworks CSS
    "https://fonts.googleapis.com",
  ],

  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
  ],

  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "https://avatars.githubusercontent.com",
    "https://storage.googleapis.com",
  ],

  connectSrc: [
    "'self'",
    "https://api.gamilit.com",
    "wss://api.gamilit.com",  // WebSocket
  ],

  frameSrc: ["'none'"],

  objectSrc: ["'none'"],

  upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
};
```

---

## Headers de Seguridad

### X-Content-Type-Options

**Previene:** MIME sniffing attacks

```
X-Content-Type-Options: nosniff
```

El navegador no intentará adivinar el tipo de contenido, debe confiar en el header `Content-Type`.

---

### X-Frame-Options

**Previene:** Clickjacking attacks

```
X-Frame-Options: DENY
```

Opciones:
- `DENY` - Nunca puede ser embebido en iframe
- `SAMEORIGIN` - Solo puede ser embebido en mismo origen
- `ALLOW-FROM uri` - Permitir origen específico

---

### Strict-Transport-Security (HSTS)

**Previene:** Man-in-the-middle, protocol downgrade

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Fuerza al navegador a usar HTTPS por 1 año.

---

### X-XSS-Protection

**Previene:** Cross-site scripting (XSS)

```
X-XSS-Protection: 1; mode=block
```

Habilita protección XSS del navegador y bloquea la página si se detecta.

---

### Referrer-Policy

**Controla:** Información de referrer enviada

```
Referrer-Policy: strict-origin-when-cross-origin
```

Opciones:
- `no-referrer` - Nunca enviar
- `same-origin` - Solo mismo origen
- `strict-origin-when-cross-origin` - URL completa mismo origen, solo origin cross-origin

---

### Permissions-Policy

**Controla:** Características del navegador

```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

Deshabilita acceso a geolocalización, micrófono y cámara.

---

## Configuración Completa

### app.ts

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// 1. Helmet (primero)
app.use(helmet({
  contentSecurityPolicy: {
    directives: cspDirectives,
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
}));

// 2. CORS (segundo)
app.use(cors(corsOptions));

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'GAMILIT');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ... resto de middlewares
```

---

## HTTPS en Producción

### Forzar HTTPS

```typescript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Configuración Nginx

```nginx
server {
  listen 443 ssl http2;
  server_name api.gamilit.com;

  ssl_certificate /etc/letsencrypt/live/api.gamilit.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.gamilit.com/privkey.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  location / {
    proxy_pass http://localhost:3006;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## Buenas Prácticas

### 1. Configurar CORS Restrictivo

```typescript
// ✓ BIEN - Lista blanca específica
origin: ['https://gamilit.com', 'https://app.gamilit.com']

// ✗ MAL - Permitir todo
origin: '*'
```

### 2. Usar HTTPS en Producción

```typescript
if (process.env.NODE_ENV === 'production') {
  // Forzar HTTPS
  // Configurar HSTS
  // Usar cookies seguras
}
```

### 3. Ocultar Información del Servidor

```typescript
// Ocultar Express
app.disable('x-powered-by');

// O personalizar
res.setHeader('X-Powered-By', 'GAMILIT');
```

---

## Documentos Relacionados

- [README de Middleware](./README.md) - Índice de middlewares
- [Rate Limiting](./Seguridad-Rate-Limiting.md) - Limitación de tasa

---

**Última revisión:** 2025-11-01
