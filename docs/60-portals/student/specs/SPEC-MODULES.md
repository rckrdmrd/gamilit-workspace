# SPEC-MODULES - Student Portal Educational Modules

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

Los módulos educativos son unidades de contenido que agrupan ejercicios temáticos:
- Organización por dificultad (fácil, medio, difícil, experto)
- Sistema de prerequisitos
- Tracking de progreso por módulo
- Recompensas al completar

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Module Detail | `pages/ModuleDetailPage.tsx` | Detalle de módulo con lista de ejercicios |
| Dashboard | `pages/DashboardComplete.tsx` | Grid de módulos en dashboard |

---

## 3. Componentes

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| ModulesSection | `components/dashboard/ModulesSection.tsx` | Grid de módulos en dashboard |
| ModuleGridCard | `components/dashboard/ModuleGridCard.tsx` | Card de módulo individual |
| ModuleGridCardEnhanced | `components/dashboard/ModuleGridCardEnhanced.tsx` | Card mejorada |
| ModuleProgressCard | `components/progress/ModuleProgressCard.tsx` | Card con progreso |

---

## 4. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useUserModules | `hooks/useUserModules.ts` | Módulos con progreso del usuario |
| useUserClassroom | `hooks/useUserClassroom.ts` | Aula para filtrado de módulos |

---

## 5. APIs Consumidas

### 5.1 Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/educational/users/{userId}/modules` | GET | Lista de módulos con progreso |

### 5.2 Query Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| classroomId | string | Filtrar por aula (opcional) |

### 5.3 Response Type

```typescript
interface UserModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'backlog';
  progress: number;            // 0-100
  totalExercises: number;
  completedExercises: number;
  estimatedTime: number;       // minutos
  xpReward: number;
  mlCoinsReward?: number;
  icon?: string;
  category: string;
  prerequisites?: string[];
  tags?: string[];
}
```

---

## 6. Estados de Módulo

### 6.1 Flujo de Estados

```
locked → available → in_progress → completed
           ↓
        backlog (en construcción)
```

### 6.2 Descripción

| Estado | Descripción | Color | Acción |
|--------|-------------|-------|--------|
| locked | Prerequisitos no cumplidos | Gray | Deshabilitado |
| available | Listo para comenzar | Color variable | "Comenzar Módulo" |
| in_progress | En curso | Color variable | "Continuar" |
| backlog | En construcción | Amber | "En Construcción" |
| completed | Terminado | Color variable | "Revisar Módulo" |

---

## 7. Sistema de Dificultad

| Nivel | Label | Estrellas | Color |
|-------|-------|-----------|-------|
| facil | Fácil | ⭐ | Green |
| medio | Medio | ⭐⭐ | Yellow |
| dificil | Difícil | ⭐⭐⭐ | Red |
| experto | Experto | ⭐⭐⭐⭐ | Purple |

---

## 8. Recompensas

### 8.1 Por Ejercicio

- XP: Según dificultad (50-200)
- ML Coins: Según dificultad (25-100)

### 8.2 Por Módulo Completado

- XP Bonus: ~200 XP
- ML Coins Bonus: ~100 ML
- Achievement posible

---

## 9. Sistema de Prerequisitos

```typescript
interface Module {
  prerequisites?: string[];  // IDs de módulos requeridos
}

// Lógica de bloqueo
const isLocked = (module: Module, completedModules: string[]): boolean => {
  if (!module.prerequisites) return false;
  return !module.prerequisites.every(id => completedModules.includes(id));
};
```

---

## 10. Visualización en Dashboard

### 10.1 Grid Layout

- Desktop: 2 columnas (8 cols del grid de 12)
- Mobile: 1 columna

### 10.2 Información Mostrada

- Título
- Descripción
- Dificultad (badge con estrellas)
- Progreso (barra)
- Ejercicios: `completed/total`
- Tiempo estimado
- XP Reward
- Estado/Acción

---

## 11. Hooks

### 11.1 useUserModules

```typescript
const { modules, loading, error, refresh, isRefreshing } = useUserModules({
  classroomId: string | undefined
});
```

### 11.2 Query Keys

```typescript
export const userModulesKeys = {
  all: ['userModules'] as const,
  user: (userId: string) => [...userModulesKeys.all, userId] as const,
  byClassroom: (userId: string, classroomId?: string) =>
    [...userModulesKeys.user(userId), 'classroom', classroomId ?? 'all'] as const,
};
```

---

## 12. Gaps Conocidos

| ID | Descripción | Severidad |
|----|-------------|-----------|
| - | Sistema de prerequisitos no validado visualmente | Baja |
| - | ModuleDetailPage no incluido en auditoría detallada | Media |

---

## 13. Referencias

- **Hooks:** `STUDENT-HOOKS-SPEC.md`
- **Progress:** `SPEC-PROGRESS.md`
- **Exercises:** `SPEC-EXERCISES.md`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.0.0*
