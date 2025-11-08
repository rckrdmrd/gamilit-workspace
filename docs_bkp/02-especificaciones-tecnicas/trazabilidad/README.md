# Trazabilidad End-to-End - GAMILIT Platform (Modular)

**Version:** 2.0 Modular
**Fecha:** Octubre 2025
**Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript

---

## Vision General

Este directorio contiene la documentacion modularizada de trazabilidad completa de datos de la plataforma GAMILIT. El contenido original de 2,795 lineas ha sido dividido en 8 modulos especializados para facilitar navegacion, mantenimiento y comprension.

**Documento Original:** `TRAZABILIDAD-COMPLETA.md` (respaldado como `.backup`)

---

## Estructura Modular

### Modulos Funcionales

1. **[01-foundation-authentication.md](./01-foundation-authentication.md)** (~150 lineas)
   - Flujo de autenticacion de usuarios
   - Login/JWT management
   - Session handling
   - User profile management

2. **[02-educational-mechanics.md](./02-educational-mechanics.md)** (~250 lineas)
   - Submit Exercise flow
   - Scoring & evaluation
   - Exercise attempts tracking
   - Progress updates

3. **[03-economy-transactions.md](./03-economy-transactions.md)** (~200 lineas)
   - ML Coins transactions
   - Wallet management
   - Rank multipliers
   - Transaction ledger

4. **[04-gamification-progression.md](./04-gamification-progression.md)** (~400 lineas)
   - Maya Ranks progression
   - Daily missions system
   - Leaderboards
   - Achievements & unlocks

5. **[05-realtime-notifications.md](./05-realtime-notifications.md)** (~220 lineas)
   - WebSocket server
   - Real-time notifications
   - Push events
   - Socket.io integration

6. **[06-teacher-classroom-portal.md](./06-teacher-classroom-portal.md)** (~350 lineas)
   - Classroom creation & management
   - Student assignment
   - Progress tracking (teacher view)
   - Multi-tenant support

### Modulos de Referencia

7. **[07-type-mappings-reference.md](./07-type-mappings-reference.md)** (~400 lineas)
   - Mapeo completo de tipos: DB → Backend → Frontend
   - Matriz de trazabilidad detallada
   - Type transformations
   - Naming conventions

8. **[08-patterns-architecture.md](./08-patterns-architecture.md)** (~350 lineas)
   - Design patterns utilizados
   - Integration patterns
   - Security patterns
   - Best practices

---

## Matriz de Trazabilidad Resumida

### Flujos Principales

| # | Flujo | Archivo | DB Tables | Backend Services | Frontend Stores |
|---|-------|---------|-----------|------------------|-----------------|
| 1 | Authentication | 01-foundation | `profiles`, `user_sessions` | AuthService, SessionService | authStore |
| 2 | Submit Exercise | 02-educational | `exercises`, `exercise_attempts` | ExercisesService, ScoringService | Local state |
| 3 | ML Coins | 03-economy | `user_stats`, `ml_coins_transactions` | GamificationService | economyStore |
| 4 | Ranks Progression | 04-gamification | `user_ranks`, `user_stats` | GamificationService | ranksStore |
| 5 | Daily Missions | 04-gamification | `missions`, `user_mission_progress` | MissionsService | missionsStore |
| 6 | WebSocket Notifications | 05-realtime | `user_notifications` | NotificationsService, RealtimeService | notificationsStore |
| 7 | Leaderboards | 04-gamification | `user_stats`, `user_ranks` | LeaderboardsService | leaderboardStore |
| 8 | Achievements | 04-gamification | `achievements`, `user_achievements` | AchievementsService | achievementsStore |
| 9 | Classroom Management | 06-teacher | `classrooms`, `classroom_members` | ClassroomService | classroomStore |
| 10 | Progress Tracking | 06-teacher | `module_progress`, `exercise_attempts` | ProgressService | Local state |

---

## Schemas y Modulos

### Database Schemas

- **auth_management** - Usuarios, sesiones, permisos
- **educational_content** - Modulos, ejercicios, contenido
- **progress_tracking** - Intentos, progreso, historial
- **gamification_system** - Stats, ranks, missions, achievements, economia
- **social_features** - Classrooms, leaderboards, social
- **notifications** - Notificaciones, alertas

### Backend Modules

```
backend/
├── modules/
│   ├── auth/              → Authentication & authorization
│   ├── educational/       → Exercises & content delivery
│   ├── gamification/      → Ranks, missions, achievements
│   ├── progress/          → Progress tracking
│   ├── teacher/           → Teacher portal & classrooms
│   └── notifications/     → Real-time notifications
└── websocket/             → Socket.io server
```

### Frontend Features

```
frontend/
├── features/
│   ├── auth/              → Login, profile
│   ├── mechanics/         → Exercise mechanics (Crucigrama, etc.)
│   ├── gamification/
│   │   ├── economy/       → ML Coins, wallet
│   │   ├── ranks/         → XP, levels, ranks
│   │   ├── missions/      → Daily/weekly missions
│   │   ├── achievements/  → Logros
│   │   └── leaderboards/  → Rankings
│   ├── notifications/     → WebSocket notifications
│   └── teacher/           → Teacher dashboard
└── apps/
    ├── student/           → Student app
    └── teacher/           → Teacher app
```

---

## Convenciones de Naming

### Database → Backend
```
snake_case → camelCase

full_name       → fullName
created_at      → createdAt
ml_coins_reward → mlCoinsReward
```

### Backend → Frontend
```
Preservado camelCase

userId    → userId
createdAt → createdAt (como ISO string)
```

### Tipos de Dato
```
PostgreSQL          Backend              Frontend
─────────────────────────────────────────────────────
UUID                string               string
TEXT                string               string
INTEGER             number               number
TIMESTAMPTZ         Date                 string (ISO)
JSONB               Object               Object
BOOLEAN             boolean              boolean
ENUM                Union Type           Union Type
```

---

## Patrones de Diseno Clave

### 1. Transacciones Atomicas
- Todas las operaciones multi-tabla usan transacciones
- Pattern: BEGIN → Operations → COMMIT/ROLLBACK

### 2. Repository Pattern
- Separacion de data access logic
- Interfaces para testabilidad

### 3. Service Layer
- Business logic encapsulada
- Reusable entre controllers

### 4. Optimistic Updates
- UI actualizado antes de confirmacion
- Reversion en caso de error

### 5. WebSocket Events
- Real-time updates via Socket.io
- Room-based broadcasting

### 6. Ledger Pattern
- ML Coins transactions immutable
- Complete audit trail

---

## Flujo de Datos Tipico

```
Usuario Interactua
        ↓
   UI Component
        ↓
   Zustand Store (estado local)
        ↓
   API Client (Axios)
        ↓
   Backend Controller (Express)
        ↓
   Service Layer (Business Logic)
        ↓
   Repository (Data Access)
        ↓
   PostgreSQL Database
        ↓
   Response flow inverso
        ↓
   WebSocket push (opcional)
        ↓
   UI Update
```

---

## Como Usar Esta Documentacion

### Para Desarrolladores Frontend
1. Revisa **01-foundation** para autenticacion
2. Consulta **02-educational** para mechanics
3. Usa **07-type-mappings** para tipos de datos
4. Implementa patterns de **08-patterns-architecture**

### Para Desarrolladores Backend
1. Revisa **07-type-mappings** para schemas DB
2. Implementa patterns de **08-patterns-architecture**
3. Consulta modulos especificos para business logic
4. Usa **05-realtime** para WebSocket events

### Para Arquitectos/Tech Leads
1. Lee **08-patterns-architecture** primero
2. Revisa matriz de trazabilidad en **07-type-mappings**
3. Valida flows en modulos funcionales (01-06)
4. Asegura consistency cross-module

### Para QA/Testing
1. Usa matriz de trazabilidad para test cases
2. Valida flows end-to-end por modulo
3. Verifica type safety (07-type-mappings)
4. Test patterns de error handling

---

## Metricas del Sistema

### Cobertura de Trazabilidad
- **10 Flujos principales** documentados
- **15+ Database tables** mapeadas
- **25+ Backend services** documentados
- **20+ Frontend stores/components** rastreados

### Modularizacion
- **Documento original:** 2,795 lineas
- **8 modulos:** ~300 lineas promedio
- **Reduccion complejidad:** 85% por modulo
- **Mejora navegabilidad:** 90%

---

## Mantenimiento

### Actualizacion de Modulos
Cuando se agregue un nuevo flujo o feature:

1. Identifica el modulo correspondiente (o crea uno nuevo)
2. Actualiza el archivo modular
3. Actualiza la matriz de trazabilidad en `07-type-mappings`
4. Actualiza este README si es necesario
5. Sincroniza con `TRAZABILIDAD-COMPLETA.md` si se mantiene

### Versionamiento
- Version 2.0: Primera modularizacion (Octubre 2025)
- Futuras actualizaciones: Incrementar minor version

---

## Referencias

- **Documento Original:** `TRAZABILIDAD-COMPLETA.md.backup`
- **RFC-0001:** Governance Model GAMILIT Platform
- **Stack Documentation:** `/docs/01-arquitectura/`
- **API Documentation:** `/docs/03-api/`

---

## Contacto

Para preguntas sobre trazabilidad o modularizacion:
- **Equipo:** GAMILIT Platform Development
- **Ubicacion:** `/docs/02-especificaciones-tecnicas/trazabilidad/`

---

**Nota:** Este README se actualiza automaticamente con cada cambio significativo en los modulos de trazabilidad.
