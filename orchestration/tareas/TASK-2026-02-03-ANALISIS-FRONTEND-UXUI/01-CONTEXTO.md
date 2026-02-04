# FASE C - CONTEXTO

**Tarea:** TASK-2026-02-03-ANALISIS-FRONTEND-UXUI
**Fecha:** 2026-02-03
**Perfil:** Frontend/UX-UI Analyst

---

## 1. DESCRIPCIÓN DEL PROYECTO

**GAMILIT** es una plataforma EdTech de gamificación educativa para enseñanza de comprensión lectora, utilizando contenido especializado sobre Marie Curie y un sistema de gamificación inspirado en la civilización Maya.

### 1.1 Estado Actual del Proyecto

| Métrica | Valor | Fuente |
|---------|-------|--------|
| Estado MVP | 95% | MASTER_INVENTORY v5.4.0 |
| Componentes Frontend | 458 | FRONTEND_INVENTORY |
| Páginas | 85 | FRONTEND_INVENTORY |
| Stores Zustand | 32 | MASTER_INVENTORY |
| Rutas | 60+ | App.tsx |
| Endpoints Backend | 850 | MASTER_INVENTORY |
| Tablas BD | 140 | DATABASE_INVENTORY |
| Schemas BD | 16 | DATABASE_INVENTORY |
| Tareas Completadas | 50 | _INDEX.yml |

### 1.2 Stack Tecnológico Frontend

- **Framework:** React 19.2.0
- **Build Tool:** Vite 6.2.0 (SWC)
- **Lenguaje:** TypeScript 5.9.3 (Strict Mode)
- **Estilos:** Tailwind CSS 4.1.14
- **Estado Global:** Zustand 5.0.8
- **Formularios:** React Hook Form 7.65.0 + Zod 4.1.12
- **HTTP:** Axios 1.12.2 + React Query 5.90.7
- **WebSocket:** Socket.IO Client 4.8.1
- **Animaciones:** Framer Motion 12.23.24
- **Testing:** Vitest 3.2.4 + Playwright 1.56.1

---

## 2. ALCANCE DE LA TAREA

### 2.1 Objetivo Principal

Realizar un análisis exhaustivo del frontend de GAMILIT comparando:
1. **Componentes** implementados vs documentación
2. **Páginas** implementadas vs especificaciones
3. **Routing** vs flujos definidos
4. **Funcionalidad** vs requerimientos
5. **Frontend** vs Base de Datos (coherencia)

### 2.2 Entregables Esperados

1. **Plan de análisis** estructurado en fases con subtareas CAPVED
2. **Matriz de gaps** entre desarrollo y documentación
3. **Lista de documentación a purgar** (obsoleta)
4. **Definiciones faltantes** a integrar
5. **Historias de usuario** pendientes identificadas
6. **Orden de ejecución** lógico con dependencias

### 2.3 Restricciones

- Esta es la **Fase 1 (Análisis y Planificación)** - NO ejecutar código
- Modo: `@ANALYSIS` (C+A+P sin E)
- Usar subagentes para análisis paralelo cuando sea posible
- Documentar todo en estructura CAPVED

---

## 3. CONTEXTO TÉCNICO RECOPILADO

### 3.1 Estructura del Frontend

```
apps/frontend/
├── src/
│   ├── main.tsx                    # Punto de entrada
│   ├── App.tsx                     # Router y providers (735 líneas, 60+ rutas)
│   ├── app/providers/              # AuthContext, BrandingProvider
│   ├── shared/                     # Código compartido
│   │   ├── components/ (69)        # Componentes base
│   │   ├── hooks/ (13)             # Hooks personalizados
│   │   ├── types/ (21)             # Tipos compartidos
│   │   └── utils/ (17)             # Utilidades
│   ├── services/api/               # Servicios API (22)
│   ├── features/                   # Features de negocio
│   │   ├── auth/ (16 comp, 5 hooks)
│   │   ├── gamification/ (74+ comp)
│   │   ├── mechanics/ (56 comp)
│   │   ├── exercises/
│   │   ├── notifications/
│   │   ├── progress/
│   │   └── parent/
│   └── apps/                       # Aplicaciones por rol
│       ├── admin/ (100+ comp, 18 páginas)
│       ├── student/ (80+ comp, 28 páginas)
│       ├── teacher/ (70+ comp, 15 páginas)
│       └── parent/ (20+ comp, 4 páginas)
```

### 3.2 Portales Implementados

| Portal | Componentes | Páginas | Estado | Notas |
|--------|-------------|---------|--------|-------|
| Student | 80+ | 28 | 95% | Dashboard, ejercicios, gamificación |
| Teacher | 70+ | 15 | 100% | Gestión de clases, calificación |
| Admin | 100+ | 18 | 95% | Gestión usuarios, contenido |
| Parent | 20+ | 4 | 40% | EXT-011 en backlog |

### 3.3 Mecánicas Educativas (56 componentes)

| Módulo | Mecánicas | Estado |
|--------|-----------|--------|
| M1 - Literal | 7 (Crucigrama, Sopa, Timeline, etc.) | 100% |
| M2 - Inferencial | 6 (Detective, Hipótesis, Predicción) | 100% |
| M3 - Crítica | 5 (Debate, Fuentes, Tribunal) | 100% |
| M4 - Digital | 5 (FakeNews, Quiz TikTok) | 100% |
| M5 - Producción | 3 (Comic, Diario, VideoCarta) | 100% |
| Auxiliar | 4 (CallToAction, Collage) | 100% |

### 3.4 Épicas Documentadas

**Completadas (17/22):**
- EAI-001: Fundamentos
- EAI-002: Actividades Educativas M1-M5
- EAI-003: Gamificación
- EAI-004: Social
- EAI-005: Portal Estudiante
- EAI-006: Portal Maestro
- EAI-008: Portal Admin
- EXT-001 a EXT-006

**En Backlog (5/22):**
- EXT-007: LTI Integration (30%)
- EXT-008: White-Label (40%)
- EXT-009: Peer Challenges (50%)
- EXT-010: Parent Notifications (40%)
- EXT-011: Parent Portal (30%)

---

## 4. DOCUMENTACIÓN EXISTENTE

### 4.1 Ubicaciones Principales

| Ubicación | Contenido | Archivos |
|-----------|-----------|----------|
| `docs/00-vision-general/` | Visión, onboarding, glosario | 6 |
| `docs/50-requerimientos/` | ET files, US, RF | 92+ |
| `orchestration/inventarios/` | Inventarios SSOT | 13 |
| `orchestration/tareas/` | 50 tareas completadas | ~100 |

### 4.2 Inventarios SSOT

- **MASTER_INVENTORY.yml** (v5.4.0) - Consolidado principal
- **DATABASE_INVENTORY.yml** (v5.0.0) - 140 tablas, 16 schemas
- **BACKEND_INVENTORY.yml** - 22 módulos, 850 endpoints
- **FRONTEND_INVENTORY.yml** - 458 componentes, 85 páginas

---

## 5. GAPS INICIALES IDENTIFICADOS

### 5.1 Frontend vs Documentación

| Área | Documentado | Implementado | Gap |
|------|-------------|--------------|-----|
| Componentes | ~400 | 458 | +58 sin documentar |
| Páginas | 65 | 85 | +20 sin documentar |
| Hooks | 50 | 60+ | +10 sin documentar |
| Stores | 18 | 32 | +14 sin documentar |

### 5.2 Frontend vs BD

| Área | En Frontend | En BD | Estado |
|------|-------------|-------|--------|
| Entities consumidas | ~120 | 158 | 76% cobertura |
| Endpoints usados | ~600 | 850 | 71% cobertura |
| Tablas sin UI | - | 7 | Pendientes de análisis |

### 5.3 Documentación Potencialmente Obsoleta

- Tareas archivadas de 2026-01-24 (21 tareas)
- ET files que ya no corresponden a implementación actual
- Historias de usuario completadas pero no marcadas
- Especificaciones de épicas parciales

---

## 6. PRÓXIMOS PASOS

1. **Fase A (Análisis):** Detallar gaps por área
2. **Fase P (Plan):** Estructurar subtareas en niveles CAPVED
3. **Fase V (Validación):** Validar plan con criterios de coherencia
4. **Fase D (Documentación):** Consolidar en formato ejecutable

---

## 7. REFERENCIAS

- `@MASTER_INV` - MASTER_INVENTORY.yml
- `@INV_FE` - FRONTEND_INVENTORY.yml
- `@INV_DB` - DATABASE_INVENTORY.yml
- `@GAMILIT_FRONTEND` - apps/frontend/src/
- `docs/00-vision-general/` - Documentación de visión
- `orchestration/tareas/_INDEX.yml` - Índice de tareas

---

**Fase C completada:** 2026-02-03 14:30
**Siguiente:** Fase A (Análisis)
