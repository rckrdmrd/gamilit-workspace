# FL-STU-15 - Learning Page

**ID:** FL-STU-15
**Version:** 1.0.0
**Fecha:** 2026-02-17
**Estado:** Planificado
**Portal:** Student
**Prioridad:** P3

---

## 1. Resumen

Flujo de la pagina de aprendizaje (Learning Hub) que presenta los 5 modulos educativos de comprension lectora al estudiante. La pagina muestra un grid de tarjetas por modulo con progreso individual, sistema de desbloqueo secuencial (modulo N requiere completar modulo N-1), busqueda de modulos, estadisticas globales de progreso, y navegacion a la pagina de detalle de cada modulo. Incluye animaciones staggered con Framer Motion, tematica de detective, y hero section con progreso total. Actualmente usa datos mock para progreso (pendiente integracion con API real).

---

## 2. Precondiciones

- Usuario autenticado con rol `student`.
- Sesion activa con JWT valido.
- Datos de gamificacion disponibles (XP, nivel, rango) para el header.
- Modulos educativos definidos (5 modulos fijos en el frontend).
- Progreso del estudiante cargado o mock disponible como fallback.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Estudiante accede a /learning] --> B[LearningPage monta]
    B --> C[Cargar datos: useAuthStore + useUserGamification]
    C --> D[Renderizar hero section con progreso total]
    D --> E[Renderizar grid de 5 modulos con progreso]

    E --> F{Interaccion del estudiante?}
    F -- Buscar modulo --> G[Filtrar modulos por searchQuery]
    G --> H[Mostrar modulos filtrados o empty state]
    F -- Click en modulo desbloqueado --> I[navigate a /modules/:moduleId]
    F -- Click en modulo bloqueado --> J[No action - boton disabled]

    I --> K[ModuleDetailPage carga ejercicios del modulo]

    subgraph ModuloCard [Tarjeta de Modulo]
        L[Icono + numero de modulo]
        M[Titulo + descripcion]
        N[Barra de progreso]
        O[Ejercicios completados / total]
        P{Desbloqueado?}
        P -- Si --> Q[Mostrar CTA "Continuar" + progreso]
        P -- No --> R[Mostrar candado + "Completa Modulo N-1"]
        S{Completado 100%?}
        S -- Si --> T[Mostrar 3 estrellas + badge "Completado"]
    end

    subgraph HeroSection [Hero Section]
        U[Progreso total %]
        V[Ejercicios completados / total]
        W[Centro de Aprendizaje - Casos de Detective]
    end
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga inicial ===
1. FE: App.tsx ruta /learning → LearningPage renderiza (lazy loaded)
2. FE: useAuthStore → obtiene user (id, role, tenant_id)
3. FE: useUserGamification(user.id) → datos de XP, nivel, rango para header
4. FE: GamifiedHeader renderiza con datos de gamificacion

=== Datos de modulos (actualmente mock) ===
5. FE: Array estatico `modules` define 5 modulos:
   - M1: Comprension Literal (7 ejercicios)
   - M2: Comprension Inferencial (5 ejercicios)
   - M3: Comprension Critica (5 ejercicios)
   - M4: Literacidad Digital (9 ejercicios)
   - M5: Produccion Textual (3 ejercicios)
6. FE: mockProgress define progreso por modulo (PENDIENTE: reemplazar con API real)

=== Integracion futura con API ===
7. FE: (PLANIFICADO) Hook de progreso del estudiante → GET /api/v1/progress/modules (nota: el hook `useStudentProgress` del teacher portal fue removido en Teacher Portal Audit 2026-02-20; este flujo del student portal requiere un hook propio o usar `studentProgressApi` directamente)
8. BE: (PLANIFICADO) ProgressController → ProgressService.getModuleProgress(userId)
9. DB: (PLANIFICADO) SELECT FROM progress_tracking.exercise_submissions
     JOIN educational_content.modules
     GROUP BY module_id
     → { moduleId, completedExercises, totalExercises, progressPercent, unlocked }
10. FE: Reemplazar mockProgress con datos reales

=== Calculos frontend ===
11. FE: totalProgress = promedio de progreso de todos los modulos
12. FE: totalCompleted = suma de ejercicios completados
13. FE: totalExercises = suma de ejercicios por modulo (29 total)
14. FE: filteredModules = modules.filter(titulo/descripcion incluye searchQuery)

=== Navegacion a modulo ===
15. FE: handleModuleClick(moduleId, unlocked) → si unlocked, navigate('/modules/:moduleId')
16. FE: ModuleDetailPage carga → ejercicios del modulo seleccionado
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/student/pages/LearningPage.tsx` |
| Pagina Detalle Modulo | `apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx` |
| Auth Store | `apps/frontend/src/features/auth/store/authStore.ts` |
| Hook Gamificacion | `apps/frontend/src/shared/hooks/useUserGamification.ts` |
| Header | `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx` |
| Card Base | `apps/frontend/src/shared/components/base/DetectiveCard.tsx` |
| Rutas | `apps/frontend/src/App.tsx` (ruta: `/learning`) |

### Backend (integracion futura)

| Tipo | Archivo |
|------|---------|
| Controller Modules | `apps/backend/src/modules/educational/controllers/modules.controller.ts` |
| Controller Exercises | `apps/backend/src/modules/educational/controllers/exercises.controller.ts` |
| Guard JWT | `apps/backend/src/modules/auth/guards/jwt-auth.guard.ts` |

### Base de Datos

| Tipo | Archivo |
|------|---------|
| Tabla modules | `apps/database/ddl/schemas/educational_content/tables/01-modules.sql` |
| Tabla exercises | `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql` |
| Tabla module_dependencies | `apps/database/ddl/schemas/educational_content/tables/module_dependencies.sql` |
| Tabla difficulty_criteria | `apps/database/ddl/schemas/educational_content/tables/20-difficulty_criteria.sql` |

---

## 6. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Desbloqueo secuencial | FE (mock) | Modulo N requiere modulo N-1 completado para desbloquear |
| 5 modulos fijos | FE | Array estatico, no configurable por backend aun |
| Busqueda local | FE | Filtro por titulo y descripcion en memoria |
| Progreso porcentual 0-100 | FE | Calculado como (completados / total) * 100 |
| Animaciones staggered | FE | Framer Motion con delay 0.1s entre tarjetas |
| Click solo en desbloqueados | FE | button disabled={!isUnlocked} |
| Autenticacion requerida | FE | Ruta protegida en App.tsx |
| Mock data temporal | FE | mockProgress sera reemplazado por API real |
| Total ejercicios: 29 | FE | 7 + 5 + 5 + 9 + 3 = 29 ejercicios en 5 modulos |

---

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | FE | N/A | ProtectedRoute redirige a /login |
| Error cargando gamification data | FE | N/A | Header muestra defaults (nivel 1, 0 XP) |
| Busqueda sin resultados | FE | N/A | Muestra empty state con icono Search y "No se encontraron modulos" |
| Modulo bloqueado clickeado | FE | N/A | Sin accion (button disabled) |
| Error en hook useUserGamification | FE | 500 | Graceful degradation, muestra pagina sin datos de gamificacion |
| Ruta /modules/:id no encontrada | FE | N/A | React Router muestra 404 |
| Error futuro en API de progreso | FE | 500 | Fallback a mockProgress (degradacion graceful) |

---

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/student/pages/LearningPage.tsx` | Grid de 5 modulos, hero section, busqueda, mock progress |
| Frontend Ruta | `apps/frontend/src/App.tsx` | Ruta /learning con lazy load de LearningPage |
| Frontend Auth | `apps/frontend/src/features/auth/store/authStore.ts` | Estado de usuario para header y proteccion de ruta |
| Frontend Gamification | `apps/frontend/src/shared/hooks/useUserGamification.ts` | Datos de XP/nivel/rango para GamifiedHeader |
| Frontend Detalle Modulo | `apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx` | Pagina destino al clickear un modulo |
| Backend Modules | `apps/backend/src/modules/educational/controllers/modules.controller.ts` | Endpoints de modulos (integracion futura) |
| Backend Exercises | `apps/backend/src/modules/educational/controllers/exercises.controller.ts` | Endpoints de ejercicios por modulo |
| DDL Modules | `apps/database/ddl/schemas/educational_content/tables/01-modules.sql` | Tabla de modulos educativos |
| DDL Exercises | `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql` | Tabla de ejercicios con module_id FK |
| DDL Dependencies | `apps/database/ddl/schemas/educational_content/tables/module_dependencies.sql` | Dependencias entre modulos |

---

## 9. Referencias

- Epic: EPIC-GAM-F1-EXERCISES
- Especificacion: `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md`
- Especificacion: `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-002-niveles-dificultad.md`
- Modulos educativos: `docs/00-overview/MODULOS.md`
- Portal estudiante: `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md`
- Mecanicas de gamificacion: `docs/20-architecture/MECANICAS-GAMIFICACION-V6.md`
- ADR-008: Sistema Dual Exercise Mechanics (`docs/90-adr/ADR-008-sistema-dual-exercise-mechanics.md`)
