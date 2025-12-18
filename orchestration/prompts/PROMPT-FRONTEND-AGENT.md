# PROMPT FRONTEND-AGENT - EXTENSIÓN GAMILIT

**Versión:** 2.0.0
**Fecha:** 2025-12-05
**Tipo:** Extensión de prompt global
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

---

## HERENCIA

```yaml
EXTIENDE: core/orchestration/agents/PROMPT-FRONTEND-AGENT.md
CONTEXTO: orchestration/00-guidelines/CONTEXTO-PROYECTO.md
```

**IMPORTANTE:** Este archivo NO duplica el prompt global. Solo contiene:
1. Resolución de variables para GAMILIT
2. Extensiones específicas del proyecto (si las hay)

---

## RESOLUCIÓN DE VARIABLES PARA GAMILIT

Al leer el prompt global, resolver estos placeholders:

```yaml
{PROJECT_NAME}:    GAMILIT
{FRONTEND_ROOT}:   apps/frontend
{FRONTEND_SRC}:    apps/frontend/src
{FRONTEND_TESTS}:  apps/frontend/tests
{BACKEND_ROOT}:    apps/backend
{API_URL}:         http://localhost:3000
```

---

## APPS DEL PROYECTO GAMILIT

GAMILIT implementa multi-app dentro del mismo frontend:

| App | Ruta Base | Propósito | Usuarios |
|-----|-----------|-----------|----------|
| `student` | `/student/` | Experiencia gamificada de aprendizaje | Estudiantes |
| `teacher` | `/teacher/` | Gestión de cursos y seguimiento | Docentes |
| `admin` | `/admin/` | Administración del sistema | Administradores |
| `institution` | `/institution/` | Gestión de institución | Directivos |

---

## ESTRUCTURA ESPECÍFICA GAMILIT

```bash
apps/frontend/src/
├── shared/                    # Compartido entre todas las apps
│   ├── components/
│   │   ├── ui/               # Button, Input, Card, Modal, etc.
│   │   ├── layout/           # Header, Sidebar, Footer
│   │   └── gamification/     # BadgeDisplay, ProgressBar, XPCounter
│   ├── types/                # Types SSOT (Single Source of Truth)
│   │   ├── user.types.ts
│   │   ├── gamification.types.ts
│   │   └── content.types.ts
│   ├── hooks/                # Custom hooks compartidos
│   ├── stores/               # Zustand stores
│   ├── services/api/         # API services
│   └── constants/            # Constantes globales
├── apps/
│   ├── student/              # App Estudiante
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Lessons.tsx
│   │   │   ├── Challenges.tsx
│   │   │   └── Profile.tsx
│   │   ├── components/
│   │   └── routes.tsx
│   ├── teacher/              # App Docente
│   ├── admin/                # App Admin
│   └── institution/          # App Institución
└── main.tsx                  # Entry point
```

---

## RUTAS DE TRABAJO GAMILIT

```bash
# Componentes
apps/frontend/src/shared/components/ui/
apps/frontend/src/shared/components/layout/
apps/frontend/src/shared/components/gamification/

# Types (SSOT - importar desde @shared/types)
apps/frontend/src/shared/types/

# Stores
apps/frontend/src/shared/stores/

# API Services
apps/frontend/src/shared/services/api/

# App Pages
apps/frontend/src/apps/{app}/pages/

# Inventarios
orchestration/inventarios/MASTER_INVENTORY.yml
orchestration/inventarios/FRONTEND_INVENTORY.yml

# Trazas
orchestration/trazas/TRAZA-TAREAS-FRONTEND.md
```

---

## DIRECTIVAS ESPECÍFICAS GAMILIT

Además de las directivas globales, consultar:

```yaml
Directivas del proyecto:
  - orchestration/directivas/GUIA-NOMENCLATURA-COMPLETA.md

Documentación de diseño:
  - docs/01-fase-alcance-inicial/ (especificaciones de UI)
  - docs/95-guias-desarrollo/frontend/ (convenciones de código)
  - docs/97-adr/ (decisiones arquitectónicas)
```

---

## EXTENSIONES ESPECÍFICAS (si difieren del global)

### Componentes de Gamificación

GAMILIT tiene componentes específicos para gamificación:

```typescript
// Componentes en shared/components/gamification/
import { BadgeDisplay } from '@shared/components/gamification/BadgeDisplay';
import { XPProgressBar } from '@shared/components/gamification/XPProgressBar';
import { LevelIndicator } from '@shared/components/gamification/LevelIndicator';
import { ChallengeCard } from '@shared/components/gamification/ChallengeCard';
import { LeaderboardWidget } from '@shared/components/gamification/LeaderboardWidget';
import { AchievementToast } from '@shared/components/gamification/AchievementToast';
```

### Tema Visual Maya

GAMILIT usa una temática visual basada en la cultura Maya:

```typescript
// Colores y variables CSS en tailwind.config.js
// Iconografía maya para badges y rangos
// Animaciones de celebración al subir de nivel
```

### Stores Específicos

```typescript
// Stores de gamificación
import { useGamificationStore } from '@shared/stores/gamificationStore';
import { useChallengeStore } from '@shared/stores/challengeStore';
import { useProgressStore } from '@shared/stores/progressStore';

// useGamificationStore contiene:
// - currentLevel, xp, badges, activeStreak
// - fetchUserGamification(), earnXP(), claimBadge()
```

### Multi-tenant en Frontend

```typescript
// El tenant se obtiene del token JWT
const { user } = useAuthStore();
const tenantId = user?.tenantId;

// Todas las llamadas API incluyen tenant context
const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': tenantId
};
```

---

## FLUJO DE INICIO

Cuando el usuario diga "lee el prompt de Frontend Agent para GAMILIT":

1. **Leer prompt global:** `core/orchestration/agents/PROMPT-FRONTEND-AGENT.md`
2. **Leer este archivo:** Para resolver variables y ver extensiones
3. **Leer contexto:** `orchestration/00-guidelines/CONTEXTO-PROYECTO.md`
4. **Listo para recibir tarea**

---

**Nota:** Cualquier mejora a las directivas generales se hace en `core/orchestration/agents/PROMPT-FRONTEND-AGENT.md` y se refleja automáticamente en todos los proyectos.
