# VISION-ALCANCE: GAMILIT

**Sistema:** SIMCO v4.0.0 | **Tipo:** Vision y Alcance
**Proyecto:** gamilit
**Version:** 1.0.0
**Creado:** 2026-02-07
**Estado:** Publicado

---

## 1. Vision

GAMILIT (Gamificacion Maya para la Lectoescritura en Tecnologia) es una **plataforma educativa gamificada** que transforma la experiencia de comprension lectora para estudiantes K-12 mediante la integracion de mecanicas de videojuegos inspiradas en la cultura maya.

### Posicionamiento en el Ecosistema

```
STANDALONE_HEREDERO (Nivel 2A)
  |
  v
gamilit (23 modulos, 173 tablas, 912 endpoints)
  |
  v
shared/catalog/ (exporta patrones generalizables)
```

### Proposito

La baja comprension lectora y la falta de motivacion en actividades de lectura tradicionales son problemas criticos en la educacion K-12. GAMILIT resuelve esto proporcionando:

- **Gamificacion completa** con economia virtual, rangos maya, XP, logros y misiones
- **23 tipos de ejercicios interactivos** distribuidos en 5 modulos progresivos
- **4 portales diferenciados** para estudiante, maestro, administrador y padres
- **Analytics educativos** con metricas de progreso en tiempo real
- **Integracion cultural maya** como vehiculo tematico motivacional

### Principios Rectores

1. **Gamification First** - Toda interaccion academica genera recompensas y progreso
2. **Progressive Learning** - Comprension literal a critica en 5 modulos secuenciales
3. **Multi-Stakeholder** - 4 portales con experiencias diferenciadas por rol
4. **Data-Driven** - Analytics y metricas para decision-making educativo
5. **Culture-Infused** - Cultura maya como hilo conductor tematico
6. **Real-Time Experience** - WebSockets para interacciones en vivo
7. **Inclusive by Design** - Accesibilidad y soporte multi-idioma

---

## 2. Alcance

### 2.1 Modulos Totales: 23

GAMILIT organiza sus 23 modulos en 4 categorias funcionales:

#### 2.1.1 Core Infrastructure (7)

| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 1 | auth | JWT + Passport + RBAC, 4 roles academicos, multi-tenant | 100% |
| 2 | users | Gestion de usuarios multi-rol con perfiles diferenciados | 100% |
| 3 | tenants | Multi-tenancy con RLS, cada escuela = 1 tenant | 100% |
| 4 | core | Utilidades compartidas, base entities, interceptors, pipes | 100% |
| 5 | health | Health checks (PostgreSQL, Redis, memoria, disco) | 100% |
| 6 | settings | Configuracion global y por tenant, feature flags | 100% |
| 7 | notifications | Email, push, in-app (Socket.IO), SMS, cola de procesamiento | 90% |

#### 2.1.2 Educational Content (5)

| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 8 | modules | 5 modulos educativos progresivos (literal a produccion) | 95% |
| 9 | exercises | 23 tipos de ejercicios interactivos con motor modular | 95% |
| 10 | content | Gestion de lecturas, materiales, versionado, multimedia | 95% |
| 11 | classrooms | Gestion de aulas, asignacion de estudiantes y maestros | 90% |
| 12 | students | Perfiles academicos, tracking de progreso, estadisticas | 90% |

#### 2.1.3 Gamification System (6)

| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 13 | gamification | Motor central: XP, niveles, rangos maya, event bus | 95% |
| 14 | leaderboard | Rankings por aula/escuela/global, temporadas | 85% |
| 15 | missions | Misiones diarias/semanales, quests tematicas | 85% |
| 16 | store | Tienda virtual con ML Coins, items cosmeticos y power-ups | 75% |
| 17 | achievements | Badges, milestones, logros secretos, showcase | 90% |
| 18 | social | Equipos, retos grupales, feed social (parcial) | 60% |

#### 2.1.4 Support & Operations (4)

| # | Modulo | Descripcion | Estado |
|---|--------|-------------|--------|
| 19 | teachers | Dashboard docente, asignacion de ejercicios, revision manual | 95% |
| 20 | parents | Portal padres: vinculacion, progreso, notificaciones, reportes | 100% |
| 21 | analytics | Learning analytics, engagement metrics, materialized views | 85% |
| 22 | reports | Reportes de progreso, exportacion PDF/Excel, programacion | 75% |

### 2.2 Mercado Objetivo: Educacion K-12

GAMILIT esta disenado para el segmento educativo K-12 hispanohablante, incorporando:

| Requisito | Descripcion |
|-----------|-------------|
| **Comprension lectora** | 5 niveles progresivos de comprension (literal a produccion) |
| **Gamificacion cultural** | Mecanicas basadas en cultura y jerarquia maya |
| **Multi-escuela** | Cada escuela opera como tenant independiente con RLS |
| **Multi-rol** | 4 roles: estudiante, maestro, administrador, padre/tutor |
| **Accesibilidad** | WCAG 2.1 AA target, texto-a-voz, interfaz adaptada a ninos |
| **Idioma** | Espanol principal, soporte multi-idioma extensible |

### 2.3 Multi-Tenancy con RLS

El modelo de aislamiento por escuela implementa:

- Toda tabla transaccional incluye columna `tenant_id`
- Row-Level Security (RLS) activado en PostgreSQL para 251 DDL / 471 runtime policies
- 18 schemas modulares organizados por dominio funcional
- Datos compartidos (contenido global) vs datos aislados (progreso, gamificacion)

### 2.4 Portales Servidos (4)

| Portal | Completitud | Paginas | Audiencia | Funcionalidad Principal |
|--------|-------------|---------|-----------|------------------------|
| Estudiante | ~100% | ~30 | Alumnos K-12 | Ejercicios, gamificacion, leaderboards, tienda |
| Maestro | ~95% | 19 | Docentes | Gestion aulas, asignacion, reportes, revision |
| Administrador | ~90% | 18 | Gestores | Contenido, configuracion, analytics, usuarios |
| Padres | 100% | ~18 | Padres/tutores | Vinculacion, progreso, notificaciones, comunicacion |

---

## 3. Requerimientos Funcionales

### 3.1 Autenticacion y Autorizacion (RF-GAM-001 a RF-GAM-004)

| ID | Modulo | Requerimiento |
|----|--------|---------------|
| RF-GAM-001 | auth | El sistema debe autenticar usuarios via email/password y OAuth 2.0 con JWT (access 15min + refresh 7d) |
| RF-GAM-002 | auth | El sistema debe implementar RBAC con 4 roles academicos: estudiante, maestro, admin, padre |
| RF-GAM-003 | auth | El sistema debe aislar datos por escuela (tenant) mediante Row-Level Security en PostgreSQL |
| RF-GAM-004 | users | El sistema debe gestionar perfiles diferenciados por rol con campos especificos (avatar para estudiante, especialidad para maestro) |

### 3.2 Contenido Educativo (RF-GAM-005 a RF-GAM-012)

| ID | Modulo | Requerimiento |
|----|--------|---------------|
| RF-GAM-005 | modules | El sistema debe implementar 5 modulos educativos progresivos con desbloqueo al 70% de completitud |
| RF-GAM-006 | exercises | El sistema debe soportar 23 tipos de ejercicios interactivos distribuidos en los 5 modulos |
| RF-GAM-007 | exercises | El sistema debe evaluar automaticamente ejercicios de los modulos 1-4 y soportar evaluacion manual para el modulo 5 |
| RF-GAM-008 | exercises | El sistema debe implementar scoring parcial con retroalimentacion inmediata y repeticion espaciada |
| RF-GAM-009 | content | El sistema debe gestionar lecturas con metadatos (grado, dificultad, tema, modulo) y versionado |
| RF-GAM-010 | content | El sistema debe categorizar contenido por modulo, grado escolar y nivel de dificultad con busqueda full-text |
| RF-GAM-011 | classrooms | El sistema debe gestionar aulas con asignacion de estudiantes, maestro titular y configuracion de modulos habilitados |
| RF-GAM-012 | students | El sistema debe trackear progreso academico individual con estadisticas de engagement por modulo y ejercicio |

### 3.3 Gamificacion Maya (RF-GAM-013 a RF-GAM-022)

| ID | Modulo | Requerimiento |
|----|--------|---------------|
| RF-GAM-013 | gamification | El sistema debe calcular XP por ejercicio completado con multiplicadores por dificultad (1x, 1.5x, 2x, 3x) |
| RF-GAM-014 | gamification | El sistema debe implementar 5 rangos jerarquicos maya (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan) con umbrales de XP |
| RF-GAM-015 | gamification | El sistema debe otorgar bonificaciones por racha de dias consecutivos y completitud de modulo |
| RF-GAM-016 | achievements | El sistema debe gestionar logros desbloqueables por hitos academicos, consistencia, progreso y logros secretos |
| RF-GAM-017 | leaderboard | El sistema debe mantener leaderboards en tiempo real por aula, escuela, global y modulo con temporadas |
| RF-GAM-018 | missions | El sistema debe generar 3 misiones diarias y 5 semanales con rotacion automatica y recompensas configurables |
| RF-GAM-019 | store | El sistema debe operar una tienda virtual con ML Coins donde los estudiantes compran avatares, fondos y power-ups |
| RF-GAM-020 | store | El sistema debe gestionar items temporales (power-ups) y permanentes (cosmeticos) con inventario por estudiante |
| RF-GAM-021 | social | El sistema debe soportar formacion de equipos, retos grupales y feed de actividad social |
| RF-GAM-022 | gamification | El sistema debe emitir eventos en tiempo real (Socket.IO) para actualizaciones de XP, logros y leaderboards |

### 3.4 Portales y Stakeholders (RF-GAM-023 a RF-GAM-030)

| ID | Modulo | Requerimiento |
|----|--------|---------------|
| RF-GAM-023 | students | El portal estudiante debe mostrar dashboard con progreso, estadisticas, avatar y acceso a modulos |
| RF-GAM-024 | teachers | El portal maestro debe permitir gestion de aulas, asignacion de ejercicios y revision manual de produccion |
| RF-GAM-025 | teachers | El sistema debe generar reportes de progreso individual y grupal para el maestro |
| RF-GAM-026 | parents | El portal padres debe mostrar dashboard de progreso del hijo con vinculacion via codigo |
| RF-GAM-027 | parents | El sistema debe enviar notificaciones automaticas a padres via email, push y SMS |
| RF-GAM-028 | analytics | El sistema debe calcular metricas de engagement (DAU, WAU, MAU, retention) con materialized views |
| RF-GAM-029 | reports | El sistema debe exportar reportes en formato PDF y Excel con templates configurables |
| RF-GAM-030 | notifications | El sistema debe entregar notificaciones multi-canal (in-app, email, push, SMS) con preferencias por usuario |

### 3.5 Tiempo Real y Multiplayer (RF-GAM-031 a RF-GAM-034)

| ID | Modulo | Requerimiento |
|----|--------|---------------|
| RF-GAM-031 | gamification | El sistema debe actualizar XP, logros y leaderboards en tiempo real via WebSockets |
| RF-GAM-032 | leaderboard | El sistema debe soportar duelos 1v1 entre estudiantes con matchmaking por nivel |
| RF-GAM-033 | social | El sistema debe transmitir estado de presencia de usuarios conectados |
| RF-GAM-034 | notifications | El sistema debe entregar notificaciones in-app instantaneas via Socket.IO |

---

## 4. Requerimientos No Funcionales

### 4.1 Rendimiento

| ID | Requerimiento | Metrica |
|----|---------------|---------|
| RNF-GAM-001 | Tiempo de respuesta API | < 200ms (p95) |
| RNF-GAM-002 | Render inicial de pagina | < 1.5s |
| RNF-GAM-003 | WebSocket latency | < 100ms |
| RNF-GAM-004 | Carga de ejercicio interactivo | < 500ms |
| RNF-GAM-005 | Usuarios concurrentes por tenant | >= 200 |

### 4.2 Seguridad

| ID | Requerimiento | Detalle |
|----|---------------|---------|
| RNF-GAM-006 | Autenticacion | JWT con expiracion corta (15min) + refresh tokens (7d) |
| RNF-GAM-007 | Autorizacion | RBAC con 4 roles academicos y permisos granulares |
| RNF-GAM-008 | Aislamiento de datos | RLS en PostgreSQL para todas las tablas con tenant_id (251 DDL / 471 runtime policies) |
| RNF-GAM-009 | Validacion | DTOs con class-validator en todos los endpoints |
| RNF-GAM-010 | CORS | Configurado por entorno, rate limiting 100 req/min |
| RNF-GAM-011 | Contenido usuario | Sanitizacion de contenido generado por estudiantes |

### 4.3 Escalabilidad

| ID | Requerimiento | Detalle |
|----|---------------|---------|
| RNF-GAM-012 | Horizontal scaling | Stateless backend, Redis para cache compartido |
| RNF-GAM-013 | Multi-tenancy | Escalamiento horizontal via RLS (escuelas como tenants) |
| RNF-GAM-014 | Cache | Redis DB 0 para datos frecuentes (leaderboards, configuraciones) |
| RNF-GAM-015 | Connection pooling | PostgreSQL con pool configurado por ambiente |

### 4.4 Disponibilidad

| ID | Requerimiento | Metrica |
|----|---------------|---------|
| RNF-GAM-016 | Uptime | >= 99.5% SLA |
| RNF-GAM-017 | Health checks | Endpoints activos (DB, Redis, memoria, disco) |
| RNF-GAM-018 | Graceful shutdown | Cierre ordenado de conexiones WebSocket y DB |

### 4.5 Usabilidad

| ID | Requerimiento | Detalle |
|----|---------------|---------|
| RNF-GAM-019 | Mobile-first | Responsive design para mobile, tablet y desktop |
| RNF-GAM-020 | Accesibilidad | WCAG 2.1 AA target, soporte texto-a-voz |
| RNF-GAM-021 | Interfaz adaptada | UI disenada para ninos K-12 con iconografia maya |
| RNF-GAM-022 | Navegadores | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

### 4.6 Mantenibilidad

| ID | Requerimiento | Detalle |
|----|---------------|---------|
| RNF-GAM-023 | Cobertura de tests | >= 80% unitarios, 2324 tests (2296 passed + 28 skipped) activos |
| RNF-GAM-024 | Documentacion API | OpenAPI/Swagger auto-generada y actualizada |
| RNF-GAM-025 | Modularidad | 23 modulos NestJS independientes |
| RNF-GAM-026 | Code standards | ESLint + Prettier, TypeScript strict mode |

---

## 5. Stack Tecnologico

| Capa | Tecnologia | Version |
|------|------------|---------|
| Backend | NestJS + TypeORM | 11.x + 0.3.x |
| Frontend | React + Zustand + TailwindCSS | 19.x + 5.x + 4.x |
| Base de Datos | PostgreSQL con RLS | 15.x |
| Runtime | Node.js | 20.x |
| Build | Vite | 6.x |
| Testing | Jest (backend) + Vitest (frontend) | 29.x / 1.x |
| Real-time | Socket.IO | 4.8+ |
| Auth | JWT + Passport + RBAC | - |
| Cache | Redis | DB 0 |

---

## 6. Epicas de Desarrollo

| Codigo | Epica | SP | Modulos | Estado |
|--------|-------|----|---------|--------|
| EPIC-GAM-SCAFFOLD | Scaffolding del Proyecto | 5 | Estructura base | Completado |
| EPIC-GAM-REQUIREMENTS | Requerimientos y US | 13 | Documentacion | Completado |
| EPIC-GAM-ARCHITECTURE | Diseno de Arquitectura | 13 | Documentacion | Completado |
| EPIC-GAM-DATABASE | Base de Datos (DDL) | 21 | 18 schemas, 173 tablas | Completado |
| EPIC-GAM-BACKEND | Backend NestJS | 34 | 23 modulos, 912 endpoints | Completado |
| EPIC-GAM-FRONTEND | Frontend React | 34 | 4 portales, 575 componentes | Completado |
| EPIC-GAM-K8S | Kubernetes Setup | 8 | Deployment configs | En progreso |
| EPIC-GAM-TESTING | Testing Completo | 13 | 2324 tests | En progreso |
| EPIC-GAM-DEVOPS | DevOps y CI/CD | 8 | Pipelines | En progreso |
| EPIC-GAM-DOCS | Documentacion Final | 8 | Docs completas | En progreso |
| EPIC-GAM-INTEGRATION | Integracion y QA | 5 | E2E validation | En progreso |

**Total:** 11 epicas, 162 Story Points

---

## 7. Restricciones

1. **STANDALONE** - GAMILIT no hereda codigo de otros proyectos, es independiente
2. **MONOREPO** - Todo el codigo (backend, frontend, database) en un solo repositorio GitHub
3. **K-12 Focus** - Contenido y UI diseados para audiencia infantil y juvenil
4. **Multi-tenancy obligatorio** - Toda tabla multi-tenant DEBE incluir tenant_id y RLS
5. **Gamificacion siempre activa** - Todo ejercicio completado genera XP y progreso
6. **Documentation first** - Documentar antes de implementar

---

## 8. Metricas de Exito

| Metrica | Objetivo | Actual |
|---------|----------|--------|
| MVP completado | 100% | 98% |
| Tests pasando | 100% | 2324 (2296 passed + 28 skipped) |
| Cobertura de tests | 80% | ~75% |
| Coherencia DDL-Backend | 100% | ~90.2% |
| Portales operativos | 4/4 | 4/4 |
| Modulos educativos | 5/5 | 5/5 |
| Tipos de ejercicios | 23/23 | 23/23 |

---

## 9. Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Vision original | docs/00-overview/VISION-ALCANCE.md |
| Modulos canonicos | docs/00-overview/MODULOS.md |
| User Stories | docs/10-requirements/user-stories/ |
| Arquitectura | docs/20-architecture/ |
| API Reference | docs/40-api/API-REFERENCE.md |
| ADRs | docs/90-adr/ |
| Inventarios | orchestration/inventarios/ |

---

*Version: 1.0.0 | Creado: 2026-02-07 | Sistema: SIMCO v4.0.0*
