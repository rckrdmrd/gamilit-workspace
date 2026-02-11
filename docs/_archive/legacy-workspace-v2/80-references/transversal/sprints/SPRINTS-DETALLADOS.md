# SPRINTS DETALLADOS - GAMILITPLATFORM
## Plan de Ejecucion Agil Reestructurado (16 Sprints en 3 Fases)

**Version:** 3.1 - Sincronizado con Roadmap
**Fecha:** 02 de Noviembre, 2025
**Ultima actualizacion:** 2026-01-04
**Metodologia:** Scrum/Agile
**Duracion total:** 3 meses (16 sprints de 5 dias)

**Documentos Relacionados:**
- [ROADMAP-GENERAL.md](../roadmap/ROADMAP-GENERAL.md) - Vision estrategica del proyecto
- [04-fase-backlog/](../../04-fase-backlog/) - Funcionalidad fuera del MVP

---

## NOTA IMPORTANTE: REESTRUCTURACIÓN DE ÉPICAS

Este documento ha sido adaptado de la estructura de épicas original (EP001-EP011) a la nueva estructura reorganizada:

### Mapeo de Épicas Antiguas → Nuevas

| Épica Antigua | Épica Nueva | Fase |
|---------------|-------------|------|
| EP001-EP002 (foundation/auth) | EAI-001 (Infraestructura y Auth) | Mes 1 |
| EP003 (educational básicas) | EAI-002 (Mecánicas Básicas) | Mes 1 |
| EP004 (gamification básica) | EAI-003 (Gamificación Core) | Mes 1 |
| EP009-EP010 (teacher/admin básico) | EAI-005 (Portales Básicos) | Mes 1 |
| EP011 (deployment parcial) | EMR-001 (Migración BD) | Mes 2 |
| EP003 (educational avanzadas) | EXT-006 (Mecánicas Avanzadas) | Mes 3 |
| EP005 (user profiles avanzado) | EXT-004 (Perfiles Avanzados) | Mes 3 |
| EP008 (notifications) | EXT-003 (Sistema de Notificaciones) | Mes 3 |
| EP009-EP010 (portales completos) | EXT-001/EXT-002 (Portales Completos) | Mes 3 |

---

## ESTRUCTURA DE CADA SPRINT

### Ceremonies (Eventos Scrum)
- **Sprint Planning:** Lunes 9:00 AM (2 horas)
- **Daily Standup:** Diario 9:30 AM (15 minutos)
- **Sprint Review:** Viernes 3:00 PM (1 hora)
- **Sprint Retrospective:** Viernes 4:00 PM (1 hora)

### Roles del Equipo
- **Product Owner:** [Asignar] - Prioridades y acceptance criteria
- **Scrum Master:** [Asignar] - Facilitar ceremonias, remover blockers
- **Dev Team:** 2 desarrolladores full-time
- **QA Engineer:** 1 tester (40% dedicación)

---

## ═══════════════════════════════════════
## FASE 1: ALCANCE INICIAL (MES 1)
## Sprints 1-4 | Presupuesto: $110,000 MXN
## ═══════════════════════════════════════

### OBJETIVO FASE 1
Implementar el alcance inicial del proyecto: infraestructura base, autenticación, mecánicas educativas básicas, gamificación core y portales básicos de profesor/admin.

**Épicas incluidas:**
- **EAI-001:** Infraestructura y Autenticación
- **EAI-002:** Mecánicas Educativas Básicas
- **EAI-003:** Gamificación Core
- **EAI-004:** Analytics Básico
- **EAI-005:** Portales Básicos (Teacher/Admin)

---

## ✅ SPRINT 1: INFRAESTRUCTURA Y SEGURIDAD CRÍTICA
**Duración:** 5 días (semana 1)
**Objetivo:** Resolver bloqueadores P0 y establecer infraestructura segura
**Velocity:** 37 story points
**Estado:** ✅ COMPLETADO

### Épicas: EAI-001 (Infraestructura y Autenticación)

### Backlog Sprint 1

#### EPIC 1.1: Tablas Social Features (EAI-001)
**Prioridad:** P0 | **Story Points:** 1
**Estado:** ✅ Completado

**User Story:**
```
Como sistema backend,
Necesito las tablas social_features en la base de datos
Para que los endpoints de amigos, equipos y guilds funcionen correctamente
```

**Acceptance Criteria:**
- [x] Tabla `friendships` creada con todas las constraints
- [x] Tabla `team_members` creada con relaciones correctas
- [x] Tabla `team_challenges` creada con validaciones
- [x] Índices de performance creados
- [x] Permisos para `glit_user` otorgados
- [x] Triggers de `updated_at` funcionando

**Estimación:** 1 hora
**Costo:** $150

---

#### EPIC 1.2: SQL Injection - RLS Middleware (EAI-001)
**Prioridad:** P0 | **Story Points:** 3 | **CVSS:** 8.2
**Estado:** ✅ Completado

**User Story:**
```
Como administrador de seguridad,
Necesito que las queries SQL usen parametrización
Para prevenir ataques de SQL injection que comprometan la base de datos
```

**Acceptance Criteria:**
- [x] Todas las queries usan parametrización ($1, $2)
- [x] Tests de SQL injection pasan
- [x] No hay string interpolation en queries
- [x] Code review de seguridad aprobado
- [x] Scan de seguridad automático pasa

**Estimación:** 4 horas
**Costo:** $600

---

#### EPIC 1.3: IDOR Prevention - Ownership Middleware (EAI-001)
**Prioridad:** P0 | **Story Points:** 13 | **CVSS:** 7.8
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero que solo yo (y mis profesores autorizados) puedan ver mi progreso
Para proteger mi privacidad y evitar que otros usuarios vean mis datos
```

**Acceptance Criteria:**
- [x] Middleware de ownership implementado
- [x] 15 endpoints protegidos con ownership checks
- [x] Tests de IDOR pasan (20+ casos)
- [x] Logs de intentos no autorizados funcionando
- [x] No regresiones en funcionalidad existente

**Estimación:** 14 horas
**Costo:** $2,100

**Endpoints protegidos:** 15 endpoints críticos de progress, gamification, educational, teacher y admin.

---

#### EPIC 1.4: Maya Ranks Case Consistency (EAI-003)
**Prioridad:** P0 | **Story Points:** 5
**Estado:** ✅ Completado

**User Story:**
```
Como sistema de gamificación,
Necesito que los rangos Maya sean consistentes (UPPERCASE)
Para que los multiplicadores y comparaciones funcionen correctamente
```

**Acceptance Criteria:**
- [x] Backend retorna ranks en UPPERCASE
- [x] Frontend recibe y procesa correctamente
- [x] Multiplicadores se aplican correctamente
- [x] UI muestra ranks con formato correcto
- [x] Tests pasan (backend + frontend)

**Estimación:** 5 horas
**Costo:** $750

---

#### EPIC 1.5: JWT Token Hashing (EAI-001)
**Prioridad:** P0 | **Story Points:** 8 | **CVSS:** 8.1
**Estado:** ✅ Completado

**User Story:**
```
Como administrador de seguridad,
Necesito que los tokens JWT se almacenen hasheados
Para que un compromiso de la base de datos no exponga todas las sesiones activas
```

**Acceptance Criteria:**
- [x] Tokens hasheados con SHA-256 antes de almacenar
- [x] Validación usa hash comparison
- [x] Migration ejecutada sin errores
- [x] Usuarios pueden re-autenticarse correctamente
- [x] Tests de sesiones pasan

**Estimación:** 9 horas
**Costo:** $1,350

**Nota:** Invalidó todas las sesiones activas. Usuarios notificados 24h antes.

---

### Sprint 1 - Resumen

**Esfuerzo total:**
- Development: 33 horas
- QA/Testing: 8 horas
- Meetings: 6 horas
- **Total:** 47 horas

**Costos:**
- Development: $4,950
- QA: $800
- **Total Sprint 1:** $5,750

**Velocity:** 30 story points
**Estado:** ✅ COMPLETADO

---

## ✅ SPRINT 2: AUTENTICACIÓN HARDENING
**Duración:** 5 días (semana 2)
**Objetivo:** Fortalecer autenticación y seguridad del sistema
**Velocity:** 21 story points
**Estado:** ✅ COMPLETADO

### Épicas: EAI-001 (Infraestructura y Autenticación)

### Backlog Sprint 2

#### ~~EPIC 2.1: Email Verification System~~ ❌ REMOVIDO

**Estado:** ❌ Descartado según ADR-001 (28/Oct/2025)

**Decisión:** Email verification fue removida del sistema. Control institucional implementado vía Admin/Teacher Portal (bloqueo/activación de usuarios).

**Ver:** [ADR-001: Email Verification Removal](../../02-especificaciones-tecnicas/adr/ADR-001-email-verification-removal.md)

**Alternativa implementada:**
- CAPTCHA + Rate limiting (P1-002, 8h)
- Control Admin/Teacher para bloqueo/activación usuarios
- Password policy enforcement (P1-003, 7h)

**Esfuerzo ahorrado:** 28 horas ($4,200)

---

#### EPIC 2.2: Rate Limiting System (EAI-001)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**User Story:**
```
Como administrador de sistema,
Necesito rate limiting en todos los endpoints
Para prevenir abuse, DDoS y proteger la infraestructura
```

**Acceptance Criteria:**
- [x] Rate limiter implementado con Redis
- [x] Configuración por endpoint (registro, login, API)
- [x] Headers informativos (X-RateLimit-*)
- [x] Logs de rate limit violations
- [x] Whitelist para IPs internas

**Estimación:** 9 horas
**Costo:** $1,350

---

#### EPIC 2.3: Password Policy Enhancement (EAI-001)
**Prioridad:** P1 | **Story Points:** 5
**Estado:** ✅ Completado

**User Story:**
```
Como usuario,
Necesito crear contraseñas seguras
Para proteger mi cuenta de accesos no autorizados
```

**Acceptance Criteria:**
- [x] Mínimo 8 caracteres
- [x] Al menos 1 mayúscula, 1 minúscula, 1 número
- [x] Validación en frontend y backend
- [x] Mensajes de error claros
- [x] Password strength indicator en UI

**Estimación:** 7 horas
**Costo:** $1,050

---

#### EPIC 2.4: httpOnly Cookies for Tokens (EAI-001)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**User Story:**
```
Como usuario,
Necesito que mis tokens estén seguros en httpOnly cookies
Para prevenir ataques XSS que roben mi sesión
```

**Acceptance Criteria:**
- [x] JWT en httpOnly cookies (no localStorage)
- [x] Secure flag en producción (HTTPS only)
- [x] SameSite=Strict para CSRF protection
- [x] Refresh token mechanism
- [x] Logout limpia cookies correctamente

**Estimación:** 14 horas
**Costo:** $2,100

---

### Sprint 2 - Resumen

**Esfuerzo total:**
- Development: 30 horas (58h - 28h email verification removida)
- QA/Testing: 6 horas
- Meetings: 6 horas
- **Total:** 42 horas

**Costos:**
- Development: $4,500 ($8,700 - $4,200 email verification removida)
- QA: $600
- **Total Sprint 2:** $5,100 (vs $9,900 original)

**Ahorro:** $4,800 por remoción de email verification según ADR-001

**Velocity:** 21 story points (vs 42 SP original)
**Estado:** ✅ COMPLETADO

---

## ✅ SPRINT 3: MECÁNICAS EDUCATIVAS BÁSICAS
**Duración:** 5 días (semana 3)
**Objetivo:** Implementar las primeras mecánicas educativas del Módulo 1 y 4
**Velocity:** 35 story points
**Estado:** ✅ COMPLETADO

### Épicas: EAI-002 (Mecánicas Educativas Básicas)

### Backlog Sprint 3

#### EPIC 3.1: Módulo 1 - Comprensión Literal (5 mecánicas) (EAI-002)
**Prioridad:** P1 | **Story Points:** 25
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero realizar ejercicios de comprensión literal sobre Marie Curie
Para aprender los hechos básicos de su vida de manera interactiva
```

**Mecánicas implementadas:**
1. **Crucigrama Científico** (5h) ✅
2. **Línea de Tiempo Visual** (5h) ✅
3. **Sopa de Letras** (4h) ✅
4. **Mapa Conceptual** (6h) ✅
5. **Emparejamiento** (4h) ✅

**Acceptance Criteria:**
- [x] 5 mecánicas funcionales
- [x] Validación automática de respuestas
- [x] Scoring consistente
- [x] Gamification integration (XP, coins)
- [x] Progress tracking

**Estimación:** 24 horas
**Costo:** $3,600

---

#### EPIC 3.2: Módulo 4 - Lectura Digital (2 mecánicas iniciales) (EAI-002)
**Prioridad:** P1 | **Story Points:** 10
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero interactuar con contenido digital educativo
Para desarrollar habilidades de lectura digital
```

**Mecánicas implementadas:**
1. **Verificador de Fake News** (6h) ✅
2. **Quiz Estilo TikTok** (6h) ✅

**Acceptance Criteria:**
- [x] 2 mecánicas funcionales
- [x] UI moderna y atractiva
- [x] Validación automática
- [x] Integration con gamification

**Estimación:** 12 horas
**Costo:** $1,800

---

### Sprint 3 - Resumen

**Esfuerzo total:**
- Development: 36 horas
- QA/Testing: 10 horas
- Meetings: 6 horas
- **Total:** 52 horas

**Costos:**
- Development: $5,400
- QA: $1,000
- **Total Sprint 3:** $6,400

**Velocity:** 35 story points
**Estado:** ✅ COMPLETADO

---

## ✅ SPRINT 4: GAMIFICACIÓN CORE
**Duración:** 5 días (semana 4)
**Objetivo:** Implementar sistema de gamificación básico (Maya Ranks, XP, ML Coins)
**Velocity:** 38 story points
**Estado:** ✅ COMPLETADO

### Épicas: EAI-003 (Gamificación Core)

### Backlog Sprint 4

#### EPIC 4.1: Maya Ranking System (EAI-003)
**Prioridad:** P1 | **Story Points:** 13
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero subir de rango Maya según mi progreso
Para sentir motivación y recompensa por mi esfuerzo
```

**Features:**
- [x] 11 rangos Maya implementados
- [x] Cálculo automático de rank
- [x] Promociones automáticas
- [x] Multiplicadores de XP por rank
- [x] UI de rank badge

**Rangos:**
1. ESCLAVO - 1.0x
2. PLEBEYO - 1.1x
3. ARTESANO - 1.2x
4. COMERCIANTE - 1.3x
5. Halach Uinic - 1.4x
6. ESCRIBA - 1.5x
7. SACERDOTE - 1.6x
8. Ajaw - 1.8x
9. Ah K'in - 2.0x
10. Nacom - 2.5x
11. K'uk'ulkan - 3.0x

**Estimación:** 15 horas
**Costo:** $2,250

---

#### EPIC 4.2: ML Coins Economy (EAI-003)
**Prioridad:** P1 | **Story Points:** 13
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero ganar ML Coins por completar ejercicios
Para comprar power-ups y personalizaciones
```

**Features:**
- [x] Sistema de ML Coins
- [x] Earning por ejercicios
- [x] Multiplicadores por rank
- [x] Bonos por racha
- [x] Transactions log
- [x] Anti-fraud measures

**Estimación:** 15 horas
**Costo:** $2,250

---

#### EPIC 4.3: XP System (EAI-003)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero ganar XP por completar ejercicios
Para ver mi progreso y avanzar de rango
```

**Features:**
- [x] Sistema de XP
- [x] Cálculo por ejercicio
- [x] Multiplicadores (dificultad + rank)
- [x] Bonos por perfección
- [x] XP total acumulado
- [x] Ranking por XP

**Estimación:** 10 horas
**Costo:** $1,500

---

#### EPIC 4.4: Streaks System (EAI-003)
**Prioridad:** P2 | **Story Points:** 5
**Estado:** ✅ Completado

**User Story:**
```
Como estudiante,
Quiero mantener rachas de días consecutivos
Para obtener bonos adicionales
```

**Features:**
- [x] Tracking de racha diaria
- [x] Bonus por racha activa
- [x] Reset de racha (si falta 1 día)
- [x] UI de streak counter
- [x] Notificaciones de racha en riesgo

**Estimación:** 8 horas
**Costo:** $1,200

---

### Sprint 4 - Resumen

**Esfuerzo total:**
- Development: 48 horas
- QA/Testing: 12 horas
- Meetings: 6 horas
- **Total:** 66 horas

**Costos:**
- Development: $7,200
- QA: $1,200
- **Total Sprint 4:** $8,400

**Velocity:** 39 story points
**Estado:** ✅ COMPLETADO

---

## FASE 1 - RESUMEN CONSOLIDADO

### Totales Fase 1 (Sprints 1-4)

| Sprint | Story Points | Dev Hours | Costo | Estado |
|--------|--------------|-----------|-------|--------|
| Sprint 1 | 30 | 33h | $5,750 | ✅ |
| Sprint 2 | 42 | 58h | $9,900 | ✅ |
| Sprint 3 | 35 | 36h | $6,400 | ✅ |
| Sprint 4 | 39 | 48h | $8,400 | ✅ |
| **TOTAL FASE 1** | **146** | **175h** | **$30,450** | ✅ |

**Épicas completadas:**
- ✅ EAI-001: Infraestructura y Autenticación
- ✅ EAI-002: Mecánicas Educativas Básicas (parcial: 7/14 mecánicas)
- ✅ EAI-003: Gamificación Core

**Presupuesto Fase 1:** $110,000 MXN asignado | $30,450 ejecutado (27.7%)

---

## ═══════════════════════════════════════
## FASE 2: MIGRACIÓN DE BASE DE DATOS (MES 2)
## Sprints 5-8 | Presupuesto: $50,000 MXN
## ═══════════════════════════════════════

### OBJETIVO FASE 2
Realizar migración completa de la base de datos, optimizar performance, implementar cache y completar testing de integración.

**Épicas incluidas:**
- **EMR-001:** Migración y Optimización de BD

---

## ✅ SPRINT 5: PERFORMANCE - BACKEND OPTIMIZATION
**Duración:** 5 días (semana 5)
**Objetivo:** Optimizar backend para 5,000 usuarios concurrentes
**Velocity:** 37 story points
**Estado:** ✅ COMPLETADO

### Épicas: EMR-001 (Migración y Optimización de BD)

### Backlog Sprint 5

#### EPIC 5.1: Redis Cache Layer (EMR-001)
**Prioridad:** P1 | **Story Points:** 21
**Estado:** ✅ Completado

**User Story:**
```
Como usuario,
Necesito que las páginas carguen rápidamente
Para tener una experiencia fluida sin esperas
```

**Features:**
- [x] Redis instalado y configurado
- [x] CacheService implementado
- [x] Leaderboards cacheados (TTL 30s)
- [x] User stats cacheados (TTL 5min)
- [x] Invalidación automática en cambios
- [x] Monitoring de cache hit rate

**Estimación:** 27 horas
**Costo:** $4,050

**Mejora:** Load time de leaderboards de 10s → 0.8s (92% mejora)

---

#### EPIC 5.2: Database Query Optimization (EMR-001)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**User Story:**
```
Como sistema,
Necesito que las queries de base de datos sean rápidas
Para responder en <200ms y soportar más usuarios
```

**Features:**
- [x] Índices creados en columnas frecuentes (+30 índices)
- [x] N+1 queries eliminadas
- [x] EXPLAIN ANALYZE ejecutado en queries lentas
- [x] Query time <100ms (p95)

**Estimación:** 12 horas
**Costo:** $1,800

---

#### EPIC 5.3: Connection Pool Optimization (EMR-001)
**Prioridad:** P1 | **Story Points:** 5
**Estado:** ✅ Completado

**User Story:**
```
Como sistema backend,
Necesito un connection pool optimizado
Para manejar 5,000+ conexiones concurrentes sin errores
```

**Features:**
- [x] Pool size ajustado (min: 20, max: 100)
- [x] Connection timeout configurado
- [x] Idle connection cleanup
- [x] Pool monitoring activo

**Estimación:** 7 horas
**Costo:** $1,050

---

#### EPIC 5.4: API Response Compression (EMR-001)
**Prioridad:** P1 | **Story Points:** 3
**Estado:** ✅ Completado

**User Story:**
```
Como usuario con conexión lenta,
Necesito que los datos se transfieran comprimidos
Para ahorrar bandwidth y mejorar velocidad
```

**Features:**
- [x] Compression middleware implementado
- [x] Gzip para responses >1KB
- [x] Content-Encoding headers correctos
- [x] Reducción >60% en tamaño

**Estimación:** 2.5 horas
**Costo:** $375

---

### Sprint 5 - Resumen

**Esfuerzo total:**
- Development: 48.5 horas
- QA/Testing: 12 horas
- Load Testing: 7 horas
- Meetings: 6 horas
- **Total:** 73.5 horas

**Costos:**
- Development: $7,275
- QA: $1,200
- Infrastructure (Redis): $500/mes
- **Total Sprint 5:** $8,975

**Velocity:** 37 story points
**Estado:** ✅ COMPLETADO

---

## ✅ SPRINT 6: PERFORMANCE - FRONTEND OPTIMIZATION
**Duración:** 5 días (semana 6)
**Objetivo:** Bundle <300KB, load time <2s
**Velocity:** 34 story points
**Estado:** ✅ COMPLETADO

### Épicas: EMR-001 (Migración y Optimización de BD)

### Backlog Sprint 6

#### EPIC 6.1: Code Splitting & Lazy Loading (EMR-001)
**Prioridad:** P1 | **Story Points:** 13
**Estado:** ✅ Completado

**User Story:**
```
Como usuario,
Necesito que la página inicial cargue rápidamente
Para comenzar a usar la app sin esperar
```

**Features:**
- [x] Code splitting por ruta
- [x] Lazy loading de componentes pesados
- [x] Bundle inicial <150KB (antes 855KB)
- [x] Time to Interactive <3s

**Estimación:** 13 horas
**Costo:** $1,950

---

#### EPIC 6.2: Bundle Size Reduction (EMR-001)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**Features:**
- [x] Tree shaking configurado
- [x] Dependencias optimizadas
- [x] Bundle analyzer ejecutado
- [x] Reducción 40% en tamaño total

**Estimación:** 8 horas
**Costo:** $1,200

---

#### EPIC 6.3: React Optimization (Memoization) (EMR-001)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**Features:**
- [x] React.memo en componentes pesados
- [x] useMemo para cálculos costosos
- [x] useCallback para funciones
- [x] Re-renders reducidos 60%

**Estimación:** 10 horas
**Costo:** $1,500

---

#### EPIC 6.4: Image & Asset Optimization (EMR-001)
**Prioridad:** P1 | **Story Points:** 5
**Estado:** ✅ Completado

**Features:**
- [x] Imágenes en WebP format
- [x] Lazy loading de imágenes
- [x] CDN configurado (CloudFlare)
- [x] Reducción 70% en peso de assets

**Estimación:** 7 horas
**Costo:** $1,050

---

### Sprint 6 - Resumen

**Esfuerzo total:**
- Development: 38 horas
- QA/Testing: 8 horas
- Performance Testing: 6 horas
- Meetings: 6 horas
- **Total:** 58 horas

**Costos:**
- Development: $5,700
- QA: $800
- CDN (CloudFlare): $20/mes
- **Total Sprint 6:** $6,520

**Velocity:** 34 story points
**Estado:** ✅ COMPLETADO

---

## ✅ SPRINT 7: SECURITY HARDENING
**Duración:** 5 días (semana 7)
**Objetivo:** Completar hardening y pasar auditoría externa
**Velocity:** 39 story points
**Estado:** ✅ COMPLETADO

### Épicas: EMR-001 (Migración y Optimización de BD)

### Backlog Sprint 7

#### EPIC 7.1: Audit Logging System (EMR-001)
**Prioridad:** P1 | **Story Points:** 13
**Estado:** ✅ Completado

**User Story:**
```
Como administrador de cumplimiento,
Necesito logs de auditoría de todas las acciones sensibles
Para compliance, investigación de incidentes y trazabilidad
```

**Features:**
- [x] Logs de autenticación (login, logout, password change)
- [x] Logs de acceso a datos sensibles
- [x] Logs de cambios administrativos
- [x] Formato estructurado (JSON)
- [x] Retención 90 días mínimo
- [x] Dashboard de auditoría para admins

**Estimación:** 20 horas
**Costo:** $3,000

---

#### EPIC 7.2: CORS & Security Headers (EMR-001)
**Prioridad:** P1 | **Story Points:** 5
**Estado:** ✅ Completado

**Features:**
- [x] CORS configurado (solo dominios permitidos)
- [x] CSP (Content Security Policy) configurado
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy configurado

**Estimación:** 5 horas
**Costo:** $750

---

#### EPIC 7.3: JWT Secret Rotation (EMR-001)
**Prioridad:** P1 | **Story Points:** 8
**Estado:** ✅ Completado

**Features:**
- [x] Support para múltiples JWT secrets
- [x] Rotación automática cada 90 días
- [x] Proceso de migración sin downtime
- [x] Documentación de procedimiento

**Estimación:** 8 horas
**Costo:** $1,200

---

#### EPIC 7.4: External Security Audit (EMR-001)
**Prioridad:** P1 | **Story Points:** 13
**Estado:** ✅ Completado

**Features:**
- [x] Penetration test ejecutado
- [x] OWASP Top 10 validado
- [x] Reporte de auditoría recibido
- [x] Vulnerabilidades P0/P1 corregidas
- [x] Certificado de seguridad emitido

**Estimación:** 21 horas
**Costo:** $3,150 + $2,000 (auditor externo)

---

### Sprint 7 - Resumen

**Esfuerzo total:**
- Development: 54 horas
- QA/Testing: 10 horas
- Security Audit: 21 horas
- Meetings: 6 horas
- **Total:** 91 horas

**Costos:**
- Development: $8,100
- QA: $1,000
- External Audit: $2,000
- **Total Sprint 7:** $11,100

**Velocity:** 39 story points
**Estado:** ✅ COMPLETADO

---

## ✅ SPRINT 8: TESTING E INTEGRACIÓN
**Duración:** 5 días (semana 8)
**Objetivo:** Testing completo de integración y preparación para extensiones
**Velocity:** 30 story points
**Estado:** ✅ COMPLETADO

### Épicas: EMR-001 (Migración y Optimización de BD)

### Backlog Sprint 8

#### EPIC 8.1: Integration Tests (EMR-001)
**Prioridad:** P1 | **Story Points:** 15
**Estado:** ✅ Completado

**Features:**
- [x] 50+ integration tests escritos
- [x] Tests de autenticación
- [x] Tests de gamification
- [x] Tests de educational content
- [x] CI/CD integration

**Estimación:** 25 horas
**Costo:** $3,750

---

#### EPIC 8.2: E2E Tests (EMR-001)
**Prioridad:** P1 | **Story Points:** 10
**Estado:** ✅ Completado

**Features:**
- [x] 20+ E2E tests (Cypress)
- [x] Happy paths completos
- [x] Error scenarios
- [x] Performance benchmarks

**Estimación:** 18 horas
**Costo:** $2,700

---

#### EPIC 8.3: Load Tests (EMR-001)
**Prioridad:** P1 | **Story Points:** 5
**Estado:** ✅ Completado

**Features:**
- [x] Load test para 5,000 usuarios concurrentes
- [x] Stress test ejecutado
- [x] Performance metrics recolectadas
- [x] Bottlenecks identificados y resueltos

**Estimación:** 12 horas
**Costo:** $1,800

---

### Sprint 8 - Resumen

**Esfuerzo total:**
- Development: 55 horas
- QA/Testing: 20 horas
- Meetings: 6 horas
- **Total:** 81 horas

**Costos:**
- Development: $8,250
- QA: $2,000
- **Total Sprint 8:** $10,250

**Velocity:** 30 story points
**Estado:** ✅ COMPLETADO

---

## FASE 2 - RESUMEN CONSOLIDADO

### Totales Fase 2 (Sprints 5-8)

| Sprint | Story Points | Dev Hours | Costo | Estado |
|--------|--------------|-----------|-------|--------|
| Sprint 5 | 37 | 48.5h | $8,975 | ✅ |
| Sprint 6 | 34 | 38h | $6,520 | ✅ |
| Sprint 7 | 39 | 54h | $11,100 | ✅ |
| Sprint 8 | 30 | 55h | $10,250 | ✅ |
| **TOTAL FASE 2** | **140** | **195.5h** | **$36,845** | ✅ |

**Épicas completadas:**
- ✅ EMR-001: Migración y Optimización de BD

**Presupuesto Fase 2:** $50,000 MXN asignado | $36,845 ejecutado (73.7%)

**Mejoras logradas:**
- Load time: 5.5s → <2s (64% mejora)
- Bundle size: 855KB → 290KB (66% reducción)
- API response: 450ms → <100ms (78% mejora)
- Usuarios concurrentes: 500 → 5,000+ (900% incremento)

---

## ═══════════════════════════════════════
## FASE 3: EXTENSIONES (MES 3)
## Sprints 9-16 | Presupuesto: $155,000 MXN
## ═══════════════════════════════════════

### OBJETIVO FASE 3
Implementar todas las extensiones: mecánicas avanzadas, gamificación completa, sistema de notificaciones, perfiles avanzados, portales completos de profesor/admin, reporting y analytics.

**Épicas incluidas:**
- **EXT-001:** Portal del Profesor Completo
- **EXT-002:** Portal de Admin Completo
- **EXT-003:** Sistema de Notificaciones
- **EXT-004:** Perfiles de Usuario Avanzados
- **EXT-005:** Reporting y Analytics
- **EXT-006:** Mecánicas Educativas Avanzadas

---

## 📋 SPRINT 9: GAMIFICATION COMPLETION
**Duración:** 5 días (semana 9)
**Objetivo:** Sistema de logros y leaderboards funcional 100%
**Velocity:** 42 story points
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-006 (Mecánicas Educativas Avanzadas - gamification)

### Backlog Sprint 9

#### EPIC 9.1: Achievements Auto-Detection (EXT-006)
**Prioridad:** P2 | **Story Points:** 21
**Estado:** 📋 Planificado

**User Story:**
```
Como estudiante,
Quiero que mis logros se desbloqueen automáticamente
Para sentir motivación y progreso continuo
```

**Acceptance Criteria:**
- [ ] 20+ logros detectando automáticamente
- [ ] AchievementDetector service implementado
- [ ] Notificaciones de logros en tiempo real
- [ ] UI de showcase de logros
- [ ] Persistencia en base de datos

**Estimación:** 25 horas
**Costo:** $3,750

---

#### EPIC 9.2: Real-time Leaderboards (EXT-006)
**Prioridad:** P2 | **Story Points:** 13
**Estado:** 📋 Planificado

**User Story:**
```
Como estudiante competitivo,
Quiero ver mi ranking actualizado en tiempo real
Para compararme con mis compañeros y motivarme
```

**Acceptance Criteria:**
- [ ] Leaderboards globales (XP, ML Coins)
- [ ] Leaderboards por classroom
- [ ] Actualización <3 segundos
- [ ] Cache con Redis
- [ ] Top 100 + posición del usuario

**Estimación:** 17 horas
**Costo:** $2,550

---

#### EPIC 9.3: Missions Integration (EXT-006)
**Prioridad:** P2 | **Story Points:** 8
**Estado:** 📋 Planificado

**User Story:**
```
Como estudiante,
Quiero recibir misiones diarias/semanales
Para tener objetivos claros y recompensas
```

**Acceptance Criteria:**
- [ ] Misiones diarias generadas automáticamente
- [ ] Misiones semanales desafiantes
- [ ] Progreso de misiones trackeable
- [ ] Recompensas automáticas al completar
- [ ] UI de misiones activas

**Estimación:** 16 horas
**Costo:** $2,400

---

### Sprint 9 - Resumen

**Esfuerzo estimado:**
- Development: 58 horas
- QA/Testing: 12 horas
- Meetings: 6 horas
- **Total:** 76 horas

**Costos estimados:**
- Development: $8,700
- QA: $1,200
- **Total Sprint 9:** $9,900

**Velocity:** 42 story points
**Estado:** 📋 PLANIFICADO

---

## 📋 SPRINT 10: EDUCATIONAL VALIDATION
**Duración:** 5 días (semana 10)
**Objetivo:** Validadores completos y certificados digitales
**Velocity:** 42 story points
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-006 (Mecánicas Educativas Avanzadas)

### Backlog Sprint 10

#### EPIC 10.1: Educational Content Validators (EXT-006)
**Prioridad:** P2 | **Story Points:** 21
**Estado:** 📋 Planificado

**User Story:**
```
Como profesor,
Necesito que las respuestas de los estudiantes se validen correctamente
Para asegurar la calidad del aprendizaje
```

**Acceptance Criteria:**
- [ ] Validadores para 27 mecánicas educativas
- [ ] Scoring consistente
- [ ] Feedback automático
- [ ] Anti-cheating measures
- [ ] Reports de progreso

**Estimación:** 40 horas
**Costo:** $6,000

---

#### EPIC 10.2: Digital Certificates System (EXT-006)
**Prioridad:** P2 | **Story Points:** 13
**Estado:** 📋 Planificado

**User Story:**
```
Como estudiante,
Quiero recibir certificados digitales al completar módulos
Para tener evidencia de mi aprendizaje y compartirla
```

**Acceptance Criteria:**
- [ ] Generador de PDF profesional
- [ ] Certificados con datos del estudiante
- [ ] QR code de verificación
- [ ] Diseño atractivo
- [ ] Share en redes sociales

**Estimación:** 15 horas
**Costo:** $2,250

---

#### EPIC 10.3: Module Progress Tracking (EXT-006)
**Prioridad:** P2 | **Story Points:** 8
**Estado:** 📋 Planificado

**User Story:**
```
Como estudiante,
Quiero ver mi progreso en cada módulo
Para saber qué me falta completar
```

**Acceptance Criteria:**
- [ ] Progress bars por módulo
- [ ] Porcentaje de completitud
- [ ] Tiempo estimado restante
- [ ] Próximas tareas sugeridas
- [ ] Dashboard de progreso

**Estimación:** 10 horas
**Costo:** $1,500

---

### Sprint 10 - Resumen

**Esfuerzo estimado:**
- Development: 65 horas
- QA/Testing: 15 horas
- Meetings: 6 horas
- **Total:** 86 horas

**Costos estimados:**
- Development: $9,750
- QA: $1,500
- **Total Sprint 10:** $11,250

**Velocity:** 42 story points
**Estado:** 📋 PLANIFICADO

---

## 📋 SPRINT 11-12: PEER CHALLENGES & NOTIFICACIONES BÁSICAS
**Duración:** 10 días (semanas 11-12)
**Objetivo:** Implementar peer challenges (feature P2 estratégica) y notificaciones básicas
**Velocity:** 30 story points (cada sprint)
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-009 (Peer Challenges) ⭐ NUEVA P2, EXT-003 (Notificaciones - parcial)

---

### ⭐ **EXT-009: Peer Challenges** (NUEVA - Promovida de P3)

**User Story principal:**
```
Como estudiante,
Quiero desafiar a un compañero a un duelo de comprensión lectora
Para competir y hacer el aprendizaje más divertido
```

**Historias incluidas:**
- [ ] [US-PEER-001](../03-extensiones/EXT-009-peer-challenges/historias/US-PEER-001-challenge-creation.md): Challenge Creation and Matching (10h)
- [ ] [US-PEER-002](../03-extensiones/EXT-009-peer-challenges/historias/US-PEER-002-challenge-execution.md): 1v1 Challenge Execution (8h)
- [ ] [US-PEER-003](../03-extensiones/EXT-009-peer-challenges/historias/US-PEER-003-scoring-wagering.md): Scoring and ML Coins Wagering (7h)

**Estimación total:** 25 horas
**Costo total:** $3,750
**ROI:** 560% | **ARR incremental:** Engagement +40%, Retention +25%

**Ver épica completa:** [EXT-009 README](../03-extensiones/EXT-009-peer-challenges/README.md)

---

### **EXT-003: Sistema de Notificaciones** (Parcial - Básico)

**Features (Sprint 11-12):**
- [ ] Notificaciones in-app básicas
- [ ] Centro de notificaciones
- [ ] Notificaciones de logros
- [ ] WebSocket infrastructure

**Estimación Sprint 11-12:** 20 horas
**Costo Sprint 11-12:** $3,000

**Nota:** Notificaciones avanzadas (email, push) se completan en Sprint 13-14

---

## 📋 SPRINT 13-14: PORTALES COMPLETOS
**Duración:** 10 días (semanas 13-14)
**Objetivo:** Completar portales de profesor y admin
**Velocity:** 40 story points (cada sprint)
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-001 (Portal del Profesor), EXT-002 (Portal de Admin)

#### Portal del Profesor (EXT-001)
**Features:**
- [ ] Analytics dashboard completo
- [ ] Reportes PDF automatizados
- [ ] Bulk operations
- [ ] Content creation tools
- [ ] Parent notifications
- [ ] Calificación asistida por IA
- [ ] Classroom management avanzado

**Estimación:** 50 horas
**Costo:** $7,500

#### Portal de Admin (EXT-002)
**Features:**
- [ ] Dashboard de métricas globales
- [ ] User management avanzado
- [ ] Tenant management
- [ ] Content moderation
- [ ] System configuration
- [ ] Backup & recovery management
- [ ] Security monitoring

**Estimación:** 45 horas
**Costo:** $6,750

---

## 📋 SPRINT 15-16: REPORTING Y ANALYTICS
**Duración:** 10 días (semanas 15-16)
**Objetivo:** Implementar reporting completo y analytics avanzado
**Velocity:** 38 story points (cada sprint)
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-005 (Reporting y Analytics)

**User Story principal:**
```
Como administrador/profesor,
Quiero acceder a reportes y analytics detallados
Para tomar decisiones informadas sobre el proceso educativo
```

**Features:**
- [ ] Reportes de progreso estudiantil
- [ ] Analytics de engagement
- [ ] Predicción de churn
- [ ] Reportes de rendimiento por classroom
- [ ] Exportación de reportes (PDF, CSV, Excel)
- [ ] Dashboards interactivos
- [ ] Comparativas entre períodos
- [ ] ROI por estudiante

**Estimación total:** 60 horas
**Costo total:** $9,000

---

## 📋 SPRINT 17-18: LTI INTEGRATION & PARENT NOTIFICATIONS
**Duración:** 10 días (semanas 17-18)
**Objetivo:** Integración LMS vía LTI 1.3 y notificaciones parentales (features P2 estratégicas)
**Velocity:** 35 story points (cada sprint)
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-007 (LTI Integration) ⭐ NUEVA P2, EXT-010 (Parent Notifications) ⭐ NUEVA P2

---

### ⭐ **EXT-007: LTI Integration** (NUEVA - Promovida de P3)

**User Story principal:**
```
Como estudiante que usa Canvas/Moodle en mi universidad,
Quiero hacer clic en "GAMILIT Platform" dentro de mi curso
Para acceder automáticamente sin tener que crear otra cuenta
```

**Historias incluidas:**
- [ ] [US-LTI-001](../03-extensiones/EXT-007-lti-integration/historias/US-LTI-001-oidc-login.md): OIDC Login Flow (12h)
- [ ] [US-LTI-002](../03-extensiones/EXT-007-lti-integration/historias/US-LTI-002-grade-passback.md): Grade Passback AGS (10h)
- [ ] [US-LTI-003](../03-extensiones/EXT-007-lti-integration/historias/US-LTI-003-deep-linking.md): Deep Linking (10h)
- [ ] [US-LTI-004](../03-extensiones/EXT-007-lti-integration/historias/US-LTI-004-platform-config.md): Platform Configuration UI (8h)

**Estimación total:** 40 horas
**Costo total:** $6,000
**ROI:** 850% | **ARR incremental:** +$30,000/año | **B2B adoption:** +60%

**Ver épica completa:** [EXT-007 README](../03-extensiones/EXT-007-lti-integration/README.md)

---

### ⭐ **EXT-010: Parent Notifications** (NUEVA - Promovida de P3)

**User Story principal:**
```
Como padre de familia,
Quiero recibir un email semanal con el progreso de mi hijo
Para estar informado sin tener que preguntarle constantemente
```

**Historias incluidas:**
- [ ] [US-PARENT-001](../03-extensiones/EXT-010-parent-notifications/historias/US-PARENT-001-weekly-report.md): Weekly Progress Report Email (6h)
- [ ] [US-PARENT-002](../03-extensiones/EXT-010-parent-notifications/historias/US-PARENT-002-low-performance-alert.md): Low Performance Alert (5h)
- [ ] [US-PARENT-003](../03-extensiones/EXT-010-parent-notifications/historias/US-PARENT-003-achievement-notification.md): Achievement Notification (4h)

**Estimación total:** 15 horas
**Costo total:** $2,250
**ROI:** 380% | **ARR incremental:** NPS +15 puntos, Parental engagement +50%

**Ver épica completa:** [EXT-010 README](../03-extensiones/EXT-010-parent-notifications/README.md)

---

## 📋 SPRINT 25-26: WHITE-LABEL TIER 1
**Duración:** 10 días (semanas 25-26)
**Objetivo:** Sistema de personalización de marca básico (feature P2 estratégica)
**Velocity:** 20 story points
**Estado:** 📋 PLANIFICADO

### Épicas: EXT-008 (White-label System Tier 1) ⭐ NUEVA P2

---

### ⭐ **EXT-008: White-label System Tier 1** (NUEVA - Promovida de P3)

**User Story principal:**
```
Como administrador de tenant enterprise,
Quiero personalizar el logo, colores y nombre de la plataforma
Para que refleje la identidad de mi institución
```

**Historias incluidas:**
- [ ] [US-WL-001](../03-extensiones/EXT-008-white-label/historias/US-WL-001-branding-config.md): Tenant Branding Configuration (8h)
- [ ] [US-WL-002](../03-extensiones/EXT-008-white-label/historias/US-WL-002-logo-colors.md): Logo and Colors Upload (6h)
- [ ] [US-WL-003](../03-extensiones/EXT-008-white-label/historias/US-WL-003-platform-name.md): Platform Name Customization (6h)

**Estimación total:** 20 horas
**Costo total:** $3,000
**ROI:** 400% | **ARR incremental:** +$12,000/año | **Enterprise pricing:** 3-5x

**Ver épica completa:** [EXT-008 README](../03-extensiones/EXT-008-white-label/README.md)

---

## FASE 3 - RESUMEN CONSOLIDADO

### Totales Fase 3 (Sprints 9-16)

| Sprints | Story Points | Dev Hours | Costo Estimado | Estado |
|---------|--------------|-----------|----------------|--------|
| Sprint 9 | 42 | 58h | $9,900 | 📋 |
| Sprint 10 | 42 | 65h | $11,250 | 📋 |
| Sprint 11-12 | 70 | 45h | $6,750 | 📋 |
| Sprint 13-14 | 80 | 95h | $14,250 | 📋 |
| Sprint 15-16 | 76 | 60h | $9,000 | 📋 |
| **TOTAL FASE 3** | **310** | **323h** | **$51,150** | 📋 |

**Épicas planificadas:**
- 📋 EXT-001: Portal del Profesor Completo
- 📋 EXT-002: Portal de Admin Completo
- 📋 EXT-003: Sistema de Notificaciones
- 📋 EXT-004: Perfiles de Usuario Avanzados (integrado)
- 📋 EXT-005: Reporting y Analytics
- 📋 EXT-006: Mecánicas Educativas Avanzadas

**Presupuesto Fase 3:** $155,000 MXN asignado | $51,150 estimado (33%)

---

## RESUMEN GENERAL DEL PROYECTO

### Totales Consolidados (16 Sprints, 3 Meses)

| Fase | Sprints | Story Points | Dev Hours | Costo | Estado |
|------|---------|--------------|-----------|-------|--------|
| **Fase 1: Alcance Inicial** | 1-4 | 146 | 175h | $30,450 | ✅ |
| **Fase 2: Migración BD** | 5-8 | 140 | 195.5h | $36,845 | ✅ |
| **Fase 3: Extensiones** | 9-16 | 310 | 323h | $51,150 | 📋 |
| **TOTAL PROYECTO** | **16** | **596** | **693.5h** | **$118,445** | **En Progreso** |

### Presupuesto Total

| Concepto | Presupuesto Asignado | Ejecutado/Estimado | % Utilizado |
|----------|---------------------|-------------------|-------------|
| Fase 1 | $110,000 MXN | $30,450 | 27.7% |
| Fase 2 | $50,000 MXN | $36,845 | 73.7% |
| Fase 3 | $155,000 MXN | $51,150 | 33.0% |
| **TOTAL** | **$315,000 MXN** | **$118,445** | **37.6%** |

### Velocity Promedio

- **Fase 1 (completada):** 36.5 story points/sprint
- **Fase 2 (completada):** 35 story points/sprint
- **Fase 3 (planificada):** 38.75 story points/sprint
- **Promedio general:** 37.25 story points/sprint

### Épicas Completadas vs Planificadas

**Completadas (Mes 1-2):**
- ✅ EAI-001: Infraestructura y Autenticación
- ✅ EAI-002: Mecánicas Educativas Básicas (7/14 mecánicas)
- ✅ EAI-003: Gamificación Core
- ✅ EAI-004: Analytics Básico (integrado)
- ✅ EAI-005: Portales Básicos (parcial)
- ✅ EMR-001: Migración y Optimización de BD

**Planificadas (Mes 3):**
- 📋 EXT-001: Portal del Profesor Completo
- 📋 EXT-002: Portal de Admin Completo
- 📋 EXT-003: Sistema de Notificaciones
- 📋 EXT-004: Perfiles de Usuario Avanzados
- 📋 EXT-005: Reporting y Analytics
- 📋 EXT-006: Mecánicas Educativas Avanzadas

**Futuras (Post Mes 3):**
- 📋 EXT-007: Gamificación Avanzada
- 📋 EXT-008: Integración con LMS

---

## CAMBIOS EN ESTA VERSIÓN 3.0

**Fecha de reestructuración:** 02 de Noviembre, 2025

### Cambios Realizados:

1. **Reorganización de épicas:**
   - Épicas antiguas (EP001-EP011) → Nuevas épicas (EAI-001 a EAI-005, EMR-001, EXT-001 a EXT-006)
   - Mejor trazabilidad entre alcance inicial y extensiones

2. **Estructura en 3 fases:**
   - **Fase 1 (Mes 1):** Alcance Inicial - 4 sprints - $110,000 MXN
   - **Fase 2 (Mes 2):** Migración BD - 4 sprints - $50,000 MXN
   - **Fase 3 (Mes 3):** Extensiones - 8 sprints - $155,000 MXN

3. **Marcado de estados:**
   - ✅ Sprints 1-8: Completados
   - 📋 Sprints 9-16: Planificados

4. **Presupuesto actualizado:**
   - Totales por fase claramente definidos
   - Tracking de presupuesto ejecutado vs asignado

5. **Mejora en trazabilidad:**
   - Referencias explícitas a épicas nuevas en cada sprint
   - Tabla de mapeo de épicas antiguas → nuevas

---

## ANEXO: DEFINICIONES

### Story Points
- **1-2 puntos:** Tarea simple (<4h)
- **3-5 puntos:** Tarea estándar (4-8h)
- **8-13 puntos:** Tarea compleja (8-16h)
- **21+ puntos:** Epic (requiere descomposición)

### Prioridades
- **P0:** Bloqueador crítico (debe resolverse antes de continuar)
- **P1:** Alta prioridad (afecta producción)
- **P2:** Media prioridad (mejoras importantes)
- **P3:** Baja prioridad (backlog)

### Estados
- **✅ Completado:** Sprint ejecutado y cerrado
- **📋 Planificado:** Sprint definido pero no iniciado
- **⏳ En progreso:** Sprint actualmente en ejecución

### Definition of Done
- [ ] Código completado y commited
- [ ] Tests unitarios escritos y pasando
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Deployed a staging
- [ ] QA validation aprobada
- [ ] Product Owner acceptance

---

**Preparado por:** Scrum Master / Project Manager
**Contacto:** [Asignar]
**Última actualización:** 02 de Noviembre, 2025
**Versión:** 3.0 - SPRINTS REESTRUCTURADOS POR FASES
