# PLAN FASE 2: CORRECCIONES DEL PORTAL TEACHER

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Estado:** ✅ PLANEACIÓN COMPLETADA

---

## 📋 RESUMEN DE CORRECCIONES NECESARIAS

| # | Corrección | Prioridad | Agente | Ejecución |
|---|------------|-----------|--------|-----------|
| 1 | Agregar 3 items al Sidebar | P0 (Crítica) | Frontend-Agent | Paralelo |
| 2 | Actualizar FRONTEND_INVENTORY.yml | P1 (Alta) | Architecture-Analyst | Paralelo |
| 3 | Actualizar TRAZA-TAREAS-FRONTEND.md | P1 (Alta) | Architecture-Analyst | Paralelo |

---

## 🎯 CORRECCIÓN 1: SIDEBAR - AGREGAR ITEMS FALTANTES

### Especificación Técnica

**Archivo:** `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`

**Problema:** 3 rutas funcionales no tienen item en el sidebar:
- `/teacher/responses` - Página de respuestas de ejercicios
- `/teacher/classes` - Gestión de aulas
- `/teacher/students` - Gestión de estudiantes

**Solución:** Agregar 3 items al array `teacherItems`

**Items a agregar:**
```typescript
{ id: 'classes',    label: 'Mis Aulas',    path: '/teacher/classes',    icon: School },
{ id: 'students',   label: 'Estudiantes',  path: '/teacher/students',   icon: Users },
{ id: 'responses',  label: 'Respuestas',   path: '/teacher/responses',  icon: ClipboardList },
```

**Ubicación sugerida en el array:**
```typescript
const teacherItems = [
  // Gestión (nuevo grupo)
  { id: 'classes',    label: 'Mis Aulas',    path: '/teacher/classes',    icon: School },
  { id: 'students',   label: 'Estudiantes',  path: '/teacher/students',   icon: Users },
  // Existentes
  { id: 'monitoring', label: 'Monitoreo',    path: '/teacher/monitoring', icon: User },
  { id: 'assignments',label: 'Asignaciones', path: '/teacher/assignments',icon: Calendar },
  { id: 'responses',  label: 'Respuestas',   path: '/teacher/responses',  icon: ClipboardList }, // NUEVO
  { id: 'progress',   label: 'Progreso',     path: '/teacher/progress',   icon: TrendingUp },
  { id: 'alerts',     label: 'Alertas',      path: '/teacher/alerts',     icon: AlertTriangle },
  { id: 'analytics',  label: 'Analíticas',   path: '/teacher/analytics',  icon: BarChart3 },
  { id: 'reports',    label: 'Reportes',     path: '/teacher/reports',    icon: FileText },
  { id: 'communication', label: 'Comunicación', path: '/teacher/communication', icon: MessageSquare },
  { id: 'content',    label: 'Contenido',    path: '/teacher/content',    icon: BookOpen },
  { id: 'gamification', label: 'Gamificación', path: '/teacher/gamification', icon: Trophy },
  { id: 'resources',  label: 'Recursos',     path: '/teacher/resources',  icon: Share2 },
];
```

**Criterios de Aceptación:**
- ✅ Los 3 items aparecen en el sidebar del teacher
- ✅ Los iconos se importan correctamente (School, Users, ClipboardList de lucide-react)
- ✅ Las rutas navegan correctamente a las páginas
- ✅ No hay errores de TypeScript
- ✅ El orden de items es lógico (Gestión → Monitoreo → Análisis → Comunicación)

---

## 🎯 CORRECCIÓN 2: ACTUALIZAR FRONTEND_INVENTORY.yml

### Especificación

**Archivo:** `docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml`

**Acción:** Verificar y agregar entrada para `TeacherExerciseResponsesPage`

**Entrada a verificar/agregar:**
```yaml
teacher_pages:
  - name: TeacherExerciseResponsesPage
    path: apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx
    route: /teacher/responses
    status: implemented
    description: Visualización de respuestas de estudiantes a ejercicios
    hooks:
      - useAuth
      - useUserGamification
      - useExerciseResponses
    components:
      - ResponsesTable
      - ResponseDetailModal
      - ResponseFilters
    api_endpoints:
      - GET /teacher/attempts
      - GET /teacher/attempts/:id
```

---

## 🎯 CORRECCIÓN 3: ACTUALIZAR TRAZA-TAREAS-FRONTEND.md

### Especificación

**Archivo:** `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md`

**Acción:** Agregar entrada documentando el análisis y corrección del sidebar

---

## 📊 PLAN DE EJECUCIÓN

### Grupo 1: Ejecución en Paralelo

| # | Tarea | Agente | Tipo |
|---|-------|--------|------|
| 1.1 | Corregir Sidebar | Frontend-Agent | Orquestación |
| 1.2 | Actualizar FRONTEND_INVENTORY.yml | Architecture-Analyst | Directo |
| 1.3 | Actualizar TRAZA-TAREAS-FRONTEND.md | Architecture-Analyst | Directo |

### Grupo 2: Validación (Secuencial después de Grupo 1)

| # | Tarea | Responsable |
|---|-------|-------------|
| 2.1 | Validar cambios del Frontend-Agent | Architecture-Analyst |
| 2.2 | Verificar que sidebar muestra 3 items nuevos | Architecture-Analyst |
| 2.3 | Confirmar navegación funciona | Architecture-Analyst |

---

## 🚀 PROMPTS PREPARADOS PARA AGENTES

### PROMPT: Frontend-Agent - Corrección Sidebar

```markdown
Lee orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Agregar 3 items faltantes al sidebar del portal Teacher

CONTEXTO:
- El portal Teacher tiene 14 rutas definidas pero solo 11 items en el sidebar
- 3 páginas funcionales no son accesibles desde la navegación:
  - /teacher/responses (TeacherExerciseResponsesPage)
  - /teacher/classes (TeacherClassesPage)
  - /teacher/students (TeacherStudentsPage)

ARCHIVO A MODIFICAR:
apps/frontend/src/shared/components/layout/GamilitSidebar.tsx

ESPECIFICACIÓN:
1. Buscar el array `teacherItems` en el archivo (aproximadamente línea 190-251)
2. Importar los iconos necesarios de lucide-react: School, Users, ClipboardList
3. Agregar los siguientes items al array teacherItems:
   - { id: 'classes', label: 'Mis Aulas', path: '/teacher/classes', icon: School }
   - { id: 'students', label: 'Estudiantes', path: '/teacher/students', icon: Users }
   - { id: 'responses', label: 'Respuestas', path: '/teacher/responses', icon: ClipboardList }
4. Ubicar los items en orden lógico:
   - "Mis Aulas" y "Estudiantes" al inicio (después del dashboard)
   - "Respuestas" después de "Asignaciones" (flujo lógico: asignar → ver respuestas)

CRITERIOS DE ACEPTACIÓN:
- ✅ Los 3 items aparecen en el sidebar cuando el usuario es teacher
- ✅ Los iconos se importan correctamente de lucide-react
- ✅ Las rutas path coinciden exactamente con las definidas en App.tsx
- ✅ No hay errores de TypeScript (npx tsc --noEmit)
- ✅ El orden de items es lógico y consistente

RESTRICCIONES:
- NO modificar otras partes del archivo
- NO cambiar items existentes
- NO agregar funcionalidad adicional
- Seguir el patrón exacto de los items existentes

REFERENCIAS:
- orchestration/agentes/architecture-analyst/ANALISIS-PORTAL-TEACHER-2025-11-26/01-REPORTE-FASE-1-ANALISIS.md
```

---

## ✅ FASE 2 COMPLETADA

Plan listo para ejecución en FASE 3.
