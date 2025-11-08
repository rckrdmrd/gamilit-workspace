# US-FUND-003: Dashboard principal estudiante

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 2
**Story Points:** 8 SP
**Presupuesto:** $2,900 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **ver un dashboard gamificado con mi progreso actual** para **mantenerme motivado y visualizar mis logros y actividades pendientes**.

**Contexto del Alcance Inicial:**
El dashboard del MVP muestra información gamificada básica: nivel, XP, monedas, módulos disponibles y actividades pendientes. Los datos están hardcodeados en la base de datos como seed data. No incluye gráficas avanzadas, estadísticas comparativas ni personalización, que se agregarán en extensiones futuras.

---

## Criterios de Aceptación

- [ ] **CA-01:** El dashboard muestra el nivel actual del estudiante (rango Maya)
- [ ] **CA-02:** Se visualiza la experiencia (XP) actual y progreso hacia el siguiente nivel
- [ ] **CA-03:** Se muestran las monedas lectoras (ML Coins) disponibles
- [ ] **CA-04:** Se listan los módulos educativos disponibles (hardcodeados)
- [ ] **CA-05:** Cada módulo muestra: título, descripción breve, progreso (%), icono
- [ ] **CA-06:** Se destacan las actividades pendientes del día
- [ ] **CA-07:** Se muestra un mensaje motivacional relacionado con el progreso
- [ ] **CA-08:** El dashboard es responsive (mobile, tablet, desktop)
- [ ] **CA-09:** Se actualiza en tiempo real al completar actividades
- [ ] **CA-10:** Incluye navegación rápida a módulos y perfil

---

## Especificaciones Técnicas

### Backend (NestJS)

**Endpoints:**
```
GET /api/dashboard/student
- Headers: Authorization: Bearer {token}
- Response: {
    student: {
      id, firstName, lastName, photoUrl,
      level: number,
      rankName: string,
      currentXP: number,
      xpToNextLevel: number,
      coins: number
    },
    modules: [
      {
        id, title, description, iconUrl,
        totalActivities: number,
        completedActivities: number,
        progress: number, // percentage
        isLocked: boolean
      }
    ],
    pendingActivities: [
      {
        id, moduleId, moduleName, title, type,
        estimatedTime: number, // minutes
        dueDate?: Date
      }
    ],
    motivationalMessage: string,
    recentAchievements: [
      { badgeId, badgeName, earnedAt }
    ]
  }
```

**Servicios:**
- **DashboardService:** Lógica de agregación de datos
- **StudentProgressService:** Cálculo de progreso y estadísticas
- **ModulesService:** Obtención de módulos y actividades
- **GamificationService:** Nivel, XP, monedas, rangos

**Consultas Optimizadas:**
- Join de múltiples tablas (students, modules, activities, progress)
- Caching para datos que no cambian frecuentemente (módulos)
- Agregaciones SQL para conteos y promedios

### Frontend (React + Vite)

**Componentes:**
```typescript
- StudentDashboard.tsx: Contenedor principal
- ProgressCard.tsx: Card con nivel, XP, monedas
  - LevelDisplay.tsx: Visualización de rango Maya
  - XPProgressBar.tsx: Barra de progreso XP
  - CoinsDisplay.tsx: Contador de monedas
- ModulesGrid.tsx: Grid de módulos disponibles
  - ModuleCard.tsx: Card individual de módulo
- PendingActivitiesList.tsx: Lista de pendientes
  - ActivityItem.tsx: Item individual
- MotivationalBanner.tsx: Banner con mensaje
- RecentAchievements.tsx: Últimas insignias
```

**Rutas:**
- `/dashboard` - Dashboard principal (redireccionado desde `/`)

**Estado (Zustand):**
```typescript
interface DashboardStore {
  dashboardData: DashboardData | null
  loading: boolean
  error: string | null
  fetchDashboard: () => Promise<void>
  refreshDashboard: () => Promise<void>
}
```

**UI/UX:**
- Layout en grid responsive (CSS Grid / Flexbox)
- Cards con sombras sutiles y hover effects
- Colores del tema Maya (verdes, terracotas, dorados)
- Iconos de Heroicons o similar
- Skeleton loaders mientras carga
- Animaciones suaves con Framer Motion

### Diseño Visual

**Layout Desktop:**
```
┌─────────────────────────────────────────┐
│ Header (Navbar)                         │
├─────────────────┬───────────────────────┤
│ Progress Card   │ Motivational Banner   │
│ (Nivel/XP/Coins)│                       │
├─────────────────┴───────────────────────┤
│ Módulos Disponibles (Grid 3x2)         │
│ [Card] [Card] [Card]                    │
│ [Card] [Card] [Card]                    │
├─────────────────────────────────────────┤
│ Actividades Pendientes (List)           │
│ - Actividad 1                           │
│ - Actividad 2                           │
└─────────────────────────────────────────┘
```

**Layout Mobile:**
- Stacked vertical
- Progress card en top
- Módulos en grid 1 columna
- Actividades al final

---

## Dependencias

**Antes:**
- US-FUND-001 (Autenticación)
- US-FUND-002 (Perfil - usa foto)
- US-GAM-001 (Sistema de rangos)
- US-GAM-002 (Sistema XP)
- US-GAM-003 (Monedas)

**Después:**
- Punto de entrada principal para navegación a actividades
- Base para dashboard de profesor (diferente vista)

---

## Definición de Hecho (DoD)

- [x] Endpoint de dashboard implementado
- [x] Optimización de queries (máx 3 queries)
- [x] Componentes de frontend implementados
- [x] Responsive design probado (mobile, tablet, desktop)
- [x] Loading states y error handling
- [x] Tests unitarios (>80% coverage)
- [x] Tests E2E para dashboard load
- [x] Performance: dashboard carga en <2 segundos
- [x] Documentación de componentes

---

## Notas del Alcance Inicial

- ✅ Datos hardcodeados: módulos pre-cargados en BD
- ✅ Sin gráficas avanzadas (barras, líneas, comparativas)
- ✅ Sin filtros de tiempo (última semana, mes, etc.)
- ✅ Sin leaderboard en dashboard (existe separado en US-GAM-007)
- ✅ Mensajes motivacionales fijos (no personalizados por IA)
- ✅ Sin notificaciones push
- ⚠️ **Extensión futura:** EXT-005-Analytics (gráficas, estadísticas avanzadas)
- ⚠️ **Extensión futura:** EXT-006-Personalization (dashboard personalizable)
- ⚠️ **Extensión futura:** EXT-007-Social (actividad de amigos en dashboard)

---

## Tareas de Implementación

### Backend (Estimado: 16h, Real: 17.5h)

**Total Backend:** 17.5h (~4.4 SP)

- [x] **Tarea B.1:** Servicios de datos y agregación - Estimado: 6h, Real: 7h
  - [x] Subtarea B.1.1: DashboardService con lógica de agregación - 2h
  - [x] Subtarea B.1.2: StudentProgressService para cálculo de progreso - 2h
  - [x] Subtarea B.1.3: GamificationService para nivel, XP, monedas - 1.5h
  - [x] Subtarea B.1.4: ModulesService para obtener módulos y actividades - 1.5h

- [x] **Tarea B.2:** Endpoint GET /dashboard/student - Estimado: 5h, Real: 5.5h
  - [x] Subtarea B.2.1: Estructura de response con todos los campos - 1.5h
  - [x] Subtarea B.2.2: Queries SQL optimizadas con joins - 2h
  - [x] Subtarea B.2.3: Cálculo de progreso por módulo - 1h
  - [x] Subtarea B.2.4: Filtrado de actividades pendientes - 1h

- [x] **Tarea B.3:** Seed data de módulos - Estimado: 3h, Real: 3h
  - [x] Subtarea B.3.1: Script de seed con módulos educativos Maya - 1.5h
  - [x] Subtarea B.3.2: Actividades hardcodeadas por módulo (5-10 cada uno) - 1h
  - [x] Subtarea B.3.3: Mensajes motivacionales en base de datos - 0.5h

- [x] **Tarea B.4:** Optimización y caching - Estimado: 2h, Real: 2h
  - [x] Subtarea B.4.1: Optimización de queries (máximo 3 queries) - 1h
  - [x] Subtarea B.4.2: Índices en base de datos - 0.5h
  - [x] Subtarea B.4.3: Documentación Swagger del endpoint - 0.5h

### Frontend (Estimado: 10h, Real: 10h)

**Total Frontend:** 10h (~2.5 SP)

- [x] **Tarea F.1:** Componentes de dashboard - Estimado: 6h, Real: 6h
  - [x] Subtarea F.1.1: StudentDashboard (contenedor principal) - 1h
  - [x] Subtarea F.1.2: ProgressCard con nivel/XP/monedas - 1.5h
  - [x] Subtarea F.1.3: ModulesGrid y ModuleCard - 1.5h
  - [x] Subtarea F.1.4: PendingActivitiesList - 1h
  - [x] Subtarea F.1.5: MotivationalBanner y RecentAchievements - 1h

- [x] **Tarea F.2:** Estado y layout - Estimado: 4h, Real: 4h
  - [x] Subtarea F.2.1: DashboardStore en Zustand - 1h
  - [x] Subtarea F.2.2: Layout responsive con CSS Grid - 1.5h
  - [x] Subtarea F.2.3: Skeleton loaders mientras carga - 1h
  - [x] Subtarea F.2.4: Página /dashboard con rutas - 0.5h

### Testing (Estimado: 4h, Real: 3.5h)

**Total Testing:** 3.5h (~0.9 SP)

- [x] **Tarea T.1:** Tests unitarios backend - Estimado: 2h, Real: 1.5h
  - [x] Subtarea T.1.1: Tests de DashboardService (agregación) - 0.5h
  - [x] Subtarea T.1.2: Tests de StudentProgressService (cálculos) - 0.5h
  - [x] Subtarea T.1.3: Tests de GamificationService - 0.5h

- [x] **Tarea T.2:** Tests E2E - Estimado: 1h, Real: 1h
  - [x] Subtarea T.2.1: Tests de endpoint GET /dashboard/student - 0.5h
  - [x] Subtarea T.2.2: Tests de performance (carga < 2s) - 0.5h

- [x] **Tarea T.3:** Tests frontend - Estimado: 1h, Real: 1h
  - [x] Subtarea T.3.1: Tests de componentes de dashboard - 0.5h
  - [x] Subtarea T.3.2: Tests de DashboardStore - 0.5h

### Deployment (Estimado: 2h, Real: 1h)

**Total Deployment:** 1h (~0.25 SP)

- [x] **Tarea D.1:** Seed data en producción - Estimado: 1h, Real: 0.5h
  - [x] Subtarea D.1.1: Ejecutar seeds de módulos - 0.25h
  - [x] Subtarea D.1.2: Verificar integridad de datos - 0.25h

- [x] **Tarea D.2:** Deploy y validación - Estimado: 1h, Real: 0.5h
  - [x] Subtarea D.2.1: Deploy a staging - 0.25h
  - [x] Subtarea D.2.2: Smoke tests de dashboard - 0.25h

---

## Resumen de Horas

| Categoría | Estimado | Real | Variación |
|-----------|----------|------|-----------|
| Backend | 16h | 17.5h | +9.4% |
| Frontend | 10h | 10h | 0% |
| Testing | 4h | 3.5h | -12.5% |
| Deployment | 2h | 1h | -50% |
| **TOTAL** | **32h** | **32h** | **0%** |

**Validación:** 8 SP × 4h/SP = 32 horas estimadas ✅

---

## Cronograma Real

**Sprint:** Sprint 1-2 (05-16 Agosto 2024)
**Fecha Inicio Real:** 09 Agosto 2024
**Fecha Fin Real:** 12 Agosto 2024
**Estado:** ✅ Completada
**Notas:** La optimización de queries tomó más tiempo del estimado, pero el frontend avanzó más rápido gracias al sistema de diseño base. El dashboard quedó muy performante (<1.5s de carga) y visualmente atractivo con el tema Maya.

---

## Testing

### Tests Unitarios
```typescript
describe('DashboardService', () => {
  it('should aggregate student data correctly')
  it('should calculate module progress')
  it('should fetch pending activities')
  it('should select appropriate motivational message')
})

describe('StudentProgressService', () => {
  it('should calculate XP to next level')
  it('should determine current rank')
})
```

### Tests E2E
```typescript
describe('Dashboard API', () => {
  it('GET /dashboard/student - returns complete data')
  it('GET /dashboard/student - handles no progress')
  it('GET /dashboard/student - unauthorized returns 401')
})
```

### Tests Frontend
```typescript
describe('StudentDashboard', () => {
  it('renders all dashboard sections')
  it('displays correct XP progress')
  it('shows modules with progress')
  it('lists pending activities')
  it('shows loading state')
  it('handles error state')
  it('navigates to module on click')
})
```

### Tests de Performance
```typescript
it('dashboard loads in under 2 seconds')
it('handles 20+ modules without lag')
```

---

## Estimación

**Desglose de Esfuerzo (8 SP = ~3 días):**
- Backend: queries + aggregation: 1 día
- Frontend: layout + components: 1.5 días
- UI/UX: styling + responsive: 0.75 días
- Testing: 0.5 días
- Optimización: 0.25 días

**Riesgos:**
- Queries complejas pueden requerir optimización
- Responsive design puede tomar más tiempo del estimado
- Datos hardcodeados deben estar bien estructurados

---

## Seed Data Requerido

**Módulos Educativos (ejemplo):**
```sql
INSERT INTO modules (title, description, icon_url, order) VALUES
('Números Mayas', 'Aprende el sistema numérico maya', '/icons/numeros.svg', 1),
('Calendario Haab', 'Descubre el calendario solar maya', '/icons/calendario.svg', 2),
('Astronomía Maya', 'Explora los conocimientos astronómicos', '/icons/astronomia.svg', 3),
...
```

**Actividades (ejemplo):**
- Cada módulo tiene 5-10 actividades hardcodeadas
- Tipos variados: multiple choice, drag & drop, etc.

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
