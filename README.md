# GAMILIT - Plataforma de Gamificacion Educativa

**Version:** 3.0.0
**Ultima actualizacion:** 2026-02-14
**Estado:** Produccion Activa - MVP 98% Completado

---

## Que es GAMILIT

**GAMILIT** (Gamificacion Maya para la Lectoescritura en Tecnologia) es una plataforma educativa que integra la cultura maya con mecanicas de gamificacion para mejorar la comprension lectora de estudiantes K-12.

**Tipo:** STANDALONE (L2A — STANDALONE_HEREDERO)
**Stack:** NestJS 11 + React 19 + PostgreSQL 15 + Redis + Socket.IO 4.8+ + Vite 6.x

---

## Propuesta de Valor

- **Gamificacion completa:** Sistema de XP, rangos maya (5 niveles jerarquicos), logros, misiones, economia virtual (ML Coins)
- **Portales diferenciados:** Estudiante, Maestro, Administrador, Padres
- **Modulos progresivos:** Comprension literal -> inferencial -> critica -> digital -> produccion
- **23 tipos de ejercicios interactivos:** Crucigrama, detective textual, tribunal de opiniones, verificador fake news, comic digital, y mas
- **Analytics y reportes:** Progreso academico, metricas de engagement, reportes para padres y maestros

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|------------|---------|
| **Backend** | NestJS + TypeORM | 11.x + 0.3.x |
| **Frontend** | React + Zustand + TailwindCSS | 19.x + 5.x + 4.x |
| **Base de Datos** | PostgreSQL (RLS) | 15.x |
| **Runtime** | Node.js | 20.x |
| **Build** | Vite (frontend), tsc (backend) | 6.x |
| **Testing** | Jest (backend), Vitest (frontend) | - |
| **Real-time** | Socket.IO | 4.8+ |
| **Auth** | JWT + Passport + RBAC | - |
| **Cache** | Redis | DB 0 |

---

## Estructura del Proyecto

```
gamilit/
+-- apps/                      # MONOREPO (mismo repositorio)
|   +-- backend/               # NestJS 11 (22 modulos, 899 endpoints)
|   +-- frontend/              # React 19 + Zustand + TailwindCSS
|   +-- database/              # PostgreSQL 15 DDL (18 schemas, 169 tablas)
|   +-- devops/                # Deployment scripts
|   +-- _MAP.md
+-- docs/                      # Documentacion del producto (11 secciones)
|   +-- 00-overview/
|   +-- 10-requirements/
|   +-- 20-architecture/
|   +-- 30-ux-ui/
|   +-- 40-api/
|   +-- 90-adr/
+-- orchestration/             # Sistema SIMCO local
    +-- inventarios/
    +-- work-items/
    +-- references/
```

---

## Modulos Educativos

### Modulo 1: Comprension Literal
Crucigrama, Linea de tiempo, Completar espacios, Verdadero/Falso, Sopa de letras

### Modulo 2: Comprension Inferencial
Detective textual, Construccion de hipotesis, Prediccion narrativa, Puzzle de contexto, Rueda de inferencias

### Modulo 3: Comprension Critica y Valorativa
Tribunal de opiniones, Debate digital, Analisis de fuentes, Podcast argumentativo, Matriz de perspectivas

### Modulo 4: Lectura Digital y Multimodal
Verificador de fake news, Infografia interactiva, Quiz TikTok, Navegacion hipertextual, Analisis de memes

### Modulo 5: Produccion y Expresion Lectora
Diario multimedia, Comic digital, Video carta (estudiante elige 1 de 3)

---

## Portales

| Portal | Completitud | Descripcion |
|--------|-------------|-------------|
| Estudiante | ~100% | Dashboard, 5 modulos, gamificacion, leaderboards |
| Maestro | ~95% | Gestion aulas, asignacion ejercicios, reportes, revision manual |
| Administrador | ~90% | Gestion contenido, configuracion, analytics, usuarios |
| Padres | 100% | Vinculacion, progreso academico, notificaciones, comunicacion |

---

## Metricas del Proyecto

| Categoria | Metricas |
|-----------|----------|
| **Base de Datos** | 18 schemas, 169 tablas, 207 politicas RLS, 183 funciones (DDL), 67 triggers, 40 ENUMs |
| **Backend** | 22 modulos, 152 entities, 170 services, 107 controllers, 899 endpoints, 399 DTOs |
| **Frontend** | 474 componentes, 68 paginas, 4 portales, 14 stores Zustand, 101 hooks |
| **Calidad** | 833 tests pasando, 90.5% coherencia DDL-Backend |

> **Fuente:** `orchestration/inventarios/MASTER_INVENTORY.yml`

---

## Gamificacion - Sistema Maya

### Sistema de XP
- Puntos por ejercicio completado con multiplicadores por dificultad
- Niveles progresivos con desbloqueo de contenido
- Bonificaciones por racha y completitud

### Rangos Jerarquicos Maya (5 Niveles — DB Seeds v2.1)
| Nivel | Titulo Maya | XP Min | Multiplicador |
|-------|-------------|--------|---------------|
| 1 | Ajaw (Senor) | 0 | 1.00x |
| 2 | Nacom (Capitan de Guerra) | 500 | 1.10x |
| 3 | Ah K'in (Sacerdote del Sol) | 1,000 | 1.15x |
| 4 | Halach Uinic (Hombre Verdadero) | 1,500 | 1.20x |
| 5 | K'uk'ulkan (Serpiente Emplumada) | 1,900 | 1.25x |

### Economia Virtual
- **ML Coins:** Moneda virtual ganada por ejercicios y misiones
- **Tienda:** Items cosmeticos, power-ups, avatares tematicos maya
- **Misiones:** Retos diarios y semanales con recompensas

### Logros e Insignias
- 30 mecanicas de ejercicio interactivo
- Badges por hitos academicos y sociales
- Milestones de progreso por modulo

---

## Comandos de Desarrollo

```bash
# Backend (desde apps/backend/)
npm run build        # Compilar NestJS
npm run lint         # ESLint
npm run test         # Jest (833 tests)
npm run start:dev    # Desarrollo (puerto 3006)

# Frontend (desde apps/frontend/)
npm run build        # Vite build
npm run lint         # ESLint
npm run test         # Vitest
npm run typecheck    # TypeScript
npm run dev          # Desarrollo (puerto 3005)

# Database
bash apps/database/scripts/recreate-database.sh
```

---

## Credenciales de Desarrollo

| Servicio | Puerto | DB / Config | Usuario | Password |
|----------|--------|-------------|---------|----------|
| Frontend Web | 3005 | - | - | - |
| Backend API | 3006 | - | - | - |
| PostgreSQL | 5432 | gamilit_platform | gamilit_user | gamilit_dev_2026 |
| Redis | 6379 | DB 0 | - | - |

---

## Git Repository

**Remote:** GitHub - `git@github.com:rckrdmrd/gamilit-workspace.git`
**Branch:** master
**Tipo:** MONOREPO (NO submodules)

---

## Relacion con el Workspace

- **Tipo:** STANDALONE_HEREDERO (Nivel 2A)
- **Herencia de codigo:** Ninguna (independiente)
- **Rol:** REFERENCE_SOURCE (fuente de patrones para catalogo compartido)
- **Propagacion:** NO propaga a otros proyectos

### Patrones Extraibles
Gamilit es fuente de patrones que se extraen a `shared/catalog/`:
- Arquitectura monorepo
- Constants SSOT (sincronizacion entre capas)
- Modulos NestJS estandarizados
- Inventarios YAML por capa
- Sistema completo de gamificacion educativa

---

## Referencias

### Documentacion Interna
- **Vision:** `docs/00-overview/`
- **Arquitectura:** `docs/20-architecture/`
- **APIs:** `docs/40-api/`
- **ADRs:** `docs/90-adr/`

### Inventarios
- `orchestration/inventarios/MASTER_INVENTORY.yml`
- `orchestration/inventarios/DATABASE_INVENTORY.yml`
- `orchestration/inventarios/BACKEND_INVENTORY.yml`
- `orchestration/inventarios/FRONTEND_INVENTORY.yml`

---

*Ultima actualizacion: 2026-02-14*
*Sistema SIMCO v4.0.0 + NEXUS v4.1*
