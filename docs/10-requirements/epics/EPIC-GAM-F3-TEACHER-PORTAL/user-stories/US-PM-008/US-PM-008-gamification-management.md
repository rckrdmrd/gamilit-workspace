---
id: "US-PM-008"
title: "Gestion de Gamificacion para Maestros"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 8
budget: "$3,200 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "gamification", "ml-coins", "teacher", "economy"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# US-PM-008: Gestion de Gamificacion para Maestros

**Epica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Fase 3 - Extensiones
**Story Points:** 8 SP
**Presupuesto:** $3,200 MXN
**Prioridad:** Media
**Estado:** Done

---

## Descripcion

Como profesor, quiero visualizar las estadisticas de economia de ML Coins de mi clase y otorgar bonus manuales a estudiantes para incentivar comportamientos positivos y monitorear la salud economica del sistema de gamificacion.

**Contexto del Alcance:**

Esta pagina permite a los profesores:
- Visualizar estadisticas globales de economia (circulacion, balance promedio)
- Ver leaderboard de estudiantes por ML Coins
- Consultar logros disponibles y estadisticas de desbloqueo
- Otorgar bonus manual de ML Coins (1-1000 ML) con justificacion

**Restricciones:**
- Los profesores NO pueden modificar tasas de recompensas (Solo Admin)
- Los profesores NO pueden crear/eliminar achievements (Solo Admin)
- Los profesores NO pueden modificar configuracion de gamificacion (Solo Admin)

---

## Criterios de Aceptacion

### CA-01: Panel de Estadisticas de Economia
- [x] Mostrar circulacion total de ML Coins en la clase
- [x] Mostrar balance promedio por estudiante
- [x] Mostrar ML Coins ganados y gastados hoy
- [x] Indicadores visuales de tendencia (TrendingUp/TrendingDown)

### CA-02: Leaderboard de Estudiantes
- [x] Lista de estudiantes ordenados por balance de ML Coins
- [x] Para cada estudiante mostrar:
  - Nombre y ranking
  - Balance actual
  - ML Coins ganados esta semana
  - ML Coins gastados esta semana
  - Nivel y rango
- [x] Boton de accion rapida para otorgar bonus

### CA-03: Vista de Logros
- [x] Grid de achievements disponibles en la plataforma
- [x] Mostrar para cada logro:
  - Nombre y descripcion
  - Recompensa en ML Coins
  - Cantidad de estudiantes que lo han desbloqueado
- [x] Contador total de logros y desbloqueos

### CA-04: Sistema de Otorgamiento de Bonus
- [x] Modal para otorgar bonus a estudiante seleccionado
- [x] Campo de cantidad con rango 1-1000 ML Coins
- [x] Campo de justificacion obligatorio (minimo 10 caracteres)
- [x] Validaciones en cliente y servidor
- [x] Notificacion de exito con nuevo balance
- [x] Actualizacion optimista del UI

### CA-05: Informacion de Configuracion (Solo Lectura)
- [x] Mostrar tasas de ganancia actuales (solo visualizacion)
- [x] Mostrar costos de items/pistas (solo visualizacion)
- [x] Banner informativo indicando que solo admins pueden modificar

### CA-06: Estados de Carga y Error
- [x] Loading states para cada seccion de datos
- [x] Manejo de errores con mensajes claros
- [x] Boton de refresh para recargar datos
- [x] Retry en caso de fallo de API

---

## Especificaciones Tecnicas

### Frontend

**Ruta:**
```
/teacher/gamification
```

**Paginas:**
- `TeacherGamificationPage.tsx` - Wrapper con layout
- `TeacherGamification.tsx` - Componente principal con toda la logica

**Hooks Utilizados:**
```typescript
import { useGrantBonus } from '@apps/teacher/hooks/useGrantBonus';
import { useEconomyAnalytics } from '@apps/teacher/hooks/useEconomyAnalytics';
import { useStudentsEconomy } from '@apps/teacher/hooks/useStudentsEconomy';
import { useAchievementsStats } from '@apps/teacher/hooks/useAchievementsStats';
```

**Interfaces Principales:**
```typescript
interface StudentEconomyData {
  id: string;
  name: string;
  balance: number;
  earned_this_week: number;
  spent_this_week: number;
  rank: string;
  level: number;
}

interface ClassEconomyStats {
  total_circulation: number;
  average_balance: number;
  total_earned_today: number;
  total_spent_today: number;
  inflation_rate: number;
  wealth_distribution: {
    top_10_percent: number;
    bottom_50_percent: number;
  };
}
```

### Backend

**Endpoints Utilizados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/teacher/economy/analytics` | Estadisticas de economia de la clase |
| GET | `/teacher/economy/students` | Lista de estudiantes con datos de economia |
| GET | `/teacher/achievements/stats` | Estadisticas de logros |
| POST | `/teacher/students/:id/bonus` | Otorgar bonus a estudiante |

**Request de Otorgar Bonus:**
```typescript
POST /teacher/students/:id/bonus
{
  amount: number;      // 1-1000
  reason: string;      // min 10 chars
}

Response:
{
  amountGranted: number;
  newBalance: number;
  studentId: string;
}
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Gestion de Gamificacion                             [Refresh]    |
|  Monitorea y controla la economia de ML Coins                     |
+-------------------------------------------------------------------+
|  [Acciones Disponibles]        [Solo Administradores]             |
|  - Visualizar economia         - Modificar tasas                  |
|  - Ver leaderboard             - Crear achievements               |
|  - Otorgar bonus               - Configurar reglas                |
+-------------------------------------------------------------------+
|  [Circulacion]  [Balance Prom]  [Ganado Hoy]  [Gastado Hoy]      |
|   12,500 ML       450 ML         +2,340 ML      -890 ML          |
+-------------------------------------------------------------------+
|  OTORGAR BONUS                                                    |
|  [Estudiante: ___v]  [Cantidad: 50]  [Razon: ________]           |
|  [Otorgar Bonus]                                                  |
+-------------------------------------------------------------------+
|  TOP ESTUDIANTES POR ML COINS                                     |
|  1. Juan Perez    Lvl 5  Detective  Balance: 1,250 ML  [Bonus]   |
|  2. Maria Lopez   Lvl 4  Novato     Balance: 980 ML    [Bonus]   |
+-------------------------------------------------------------------+
|  LOGROS DISPONIBLES (5 logros, 127 desbloqueos)                  |
|  [Primer Caso]  [Lector Experto]  [Streak 7 Dias]                |
+-------------------------------------------------------------------+
```

---

## Dependencias

### Dependencias de User Stories:
- US-PM-000 (Dashboard Maestro) - Navegacion
- EP001 (Auth System) - JWT auth y role='teacher'

### Dependencias de Backend:
- Sistema de economia ML Coins implementado
- Endpoints de gamificacion del Teacher Portal
- Sistema de achievements

---

## Estimacion de Esfuerzo

**Backend:** 3 SP
- Endpoints de analytics de economia
- Endpoint de otorgar bonus
- Validaciones y permisos

**Frontend:** 4 SP
- Componente principal con 4 secciones
- Integracion con 4 hooks
- Modal de otorgamiento de bonus

**Testing:** 1 SP

**Total:** 8 SP = $3,200 MXN

---

## Notas de Implementacion

- Pagina implementada: `apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx`
- Wrapper: `apps/frontend/src/apps/teacher/pages/TeacherGamificationPage.tsx`
- Los rewards vienen predefinidos de la base de datos
- Se incluye seccion "Proximamente" para features futuras
- Diseado con tema "Detective" consistente con la plataforma

---

**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
**Estado:** Done - Implementado
