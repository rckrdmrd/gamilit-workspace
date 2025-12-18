# ESPECIFICACION TECNICA - FASE 5A
## Cambios en Sidebar (Bajo Riesgo)

**Fecha:** 2025-12-15
**Prioridad:** ALTA (ejecutar primero)
**Riesgo:** BAJO
**Tiempo estimado de implementacion:** 1-2 horas

---

## 1. OBJETIVO

Remover del sidebar de navegacion las paginas que no se van a usar en esta fase:
- Comunicacion (bloqueada por feature flag)
- Contenido (bloqueada por feature flag)
- Recursos (stub sin implementacion)
- Estudiantes (sera migrada a Dashboard - FASE 5B)
- Analiticas (sera fusionada con Progress - FASE 5C)

---

## 2. ARCHIVOS A MODIFICAR

### 2.1 GamilitSidebar.tsx

**Ruta:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`

**Seccion a modificar:** Lines 192-277 (array `teacherItems`)

#### CODIGO ACTUAL (lineas 192-277):

```typescript
const teacherItems = [
  {
    id: 'classes',
    label: 'Mis Aulas *',
    path: '/teacher/classes',
    icon: 'School',
  },
  {
    id: 'students',
    label: 'Estudiantes *',
    path: '/teacher/students',
    icon: 'Users',
  },
  {
    id: 'monitoring',
    label: 'Monitoreo *',
    path: '/teacher/monitoring',
    icon: 'User',
  },
  {
    id: 'assignments',
    label: 'Asignaciones *',
    path: '/teacher/assignments',
    icon: 'Calendar',
  },
  {
    id: 'responses',
    label: 'Respuestas',
    path: '/teacher/responses',
    icon: 'ClipboardList',
  },
  {
    id: 'reviews',
    label: 'Revisiones M3-M5',
    path: '/teacher/reviews',
    icon: 'CheckCircle',
  },
  {
    id: 'progress',
    label: 'Progreso *',
    path: '/teacher/progress',
    icon: 'TrendingUp',
  },
  {
    id: 'alerts',
    label: 'Alertas *',
    path: '/teacher/alerts',
    icon: 'AlertTriangle',
  },
  {
    id: 'analytics',
    label: 'Analíticas *',
    path: '/teacher/analytics',
    icon: 'BarChart3',
  },
  {
    id: 'reports',
    label: 'Reportes *',
    path: '/teacher/reports',
    icon: 'FileText',
  },
  {
    id: 'communication',
    label: 'Comunicación *',
    path: '/teacher/communication',
    icon: 'MessageSquare',
  },
  {
    id: 'content',
    label: 'Contenido *',
    path: '/teacher/content',
    icon: 'BookOpen',
  },
  {
    id: 'gamification',
    label: 'Gamificación *',
    path: '/teacher/gamification',
    icon: 'Trophy',
  },
  {
    id: 'resources',
    label: 'Recursos *',
    path: '/teacher/resources',
    icon: 'Share2',
  },
];
```

#### CODIGO PROPUESTO:

```typescript
const teacherItems = [
  {
    id: 'classes',
    label: 'Mis Aulas',
    path: '/teacher/classes',
    icon: 'School',
  },
  {
    id: 'monitoring',
    label: 'Monitoreo',
    path: '/teacher/monitoring',
    icon: 'User',
  },
  {
    id: 'assignments',
    label: 'Asignaciones',
    path: '/teacher/assignments',
    icon: 'Calendar',
  },
  {
    id: 'responses',
    label: 'Respuestas',
    path: '/teacher/responses',
    icon: 'ClipboardList',
  },
  {
    id: 'reviews',
    label: 'Revisiones M3-M5',
    path: '/teacher/reviews',
    icon: 'CheckCircle',
  },
  {
    id: 'progress',
    label: 'Progreso',
    path: '/teacher/progress',
    icon: 'TrendingUp',
  },
  {
    id: 'alerts',
    label: 'Alertas',
    path: '/teacher/alerts',
    icon: 'AlertTriangle',
  },
  {
    id: 'reports',
    label: 'Reportes',
    path: '/teacher/reports',
    icon: 'FileText',
  },
  {
    id: 'gamification',
    label: 'Gamificacion',
    path: '/teacher/gamification',
    icon: 'Trophy',
  },
];
```

#### ITEMS REMOVIDOS:
1. `students` (id) - /teacher/students - Sera migrada a Monitoring (FASE 5B)
2. `analytics` (id) - /teacher/analytics - Sera fusionada con Progress (FASE 5C)
3. `communication` (id) - /teacher/communication - Bloqueada
4. `content` (id) - /teacher/content - Bloqueada
5. `resources` (id) - /teacher/resources - Stub

#### ITEMS MODIFICADOS:
- Removido el asterisco (*) de los labels ya que las paginas estan funcionales

---

## 3. CAMBIOS EN ROUTER (App.tsx)

**Ruta:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/App.tsx`

### OPCION A: Mantener rutas (recomendado)
Las rutas se mantienen funcionales pero sin acceso desde el sidebar. Esto permite:
- Acceso directo por URL si es necesario
- No rompe bookmarks existentes
- Facilita reactivacion futura

### OPCION B: Agregar redirects
Si se prefiere redirigir las rutas eliminadas:

```typescript
// Agregar despues de las rutas de teacher
<Route path="/teacher/students" element={<Navigate to="/teacher/monitoring" replace />} />
<Route path="/teacher/analytics" element={<Navigate to="/teacher/progress" replace />} />
<Route path="/teacher/communication" element={<Navigate to="/teacher/dashboard" replace />} />
<Route path="/teacher/content" element={<Navigate to="/teacher/dashboard" replace />} />
<Route path="/teacher/resources" element={<Navigate to="/teacher/dashboard" replace />} />
```

**Recomendacion:** Usar OPCION A para esta fase, agregar redirects en FASE 5B/5C

---

## 4. DEPENDENCIAS

### Archivos que NO se modifican:
- `App.tsx` - Las rutas permanecen (OPCION A)
- Todos los archivos de paginas - No se eliminan
- Hooks y componentes - Permanecen para futuro uso

### Archivos que SI se modifican:
- `GamilitSidebar.tsx` - Array teacherItems

---

## 5. PLAN DE PRUEBAS

### 5.1 Pruebas Manuales

```yaml
Prueba_1_Sidebar_Teacher:
  precondicion: "Login como teacher"
  pasos:
    - Verificar que el sidebar muestra solo 9 items
    - Verificar que NO aparecen: Estudiantes, Analiticas, Comunicacion, Contenido, Recursos
    - Verificar que SI aparecen: Mis Aulas, Monitoreo, Asignaciones, Respuestas, Revisiones, Progreso, Alertas, Reportes, Gamificacion
  resultado_esperado: "Solo 9 items visibles"

Prueba_2_Navegacion_Directa:
  precondicion: "Login como teacher"
  pasos:
    - Navegar directamente a /teacher/students
    - Navegar directamente a /teacher/analytics
    - Navegar directamente a /teacher/communication
  resultado_esperado: "Las paginas cargan correctamente (OPCION A)"

Prueba_3_Dashboard:
  precondicion: "Login como teacher"
  pasos:
    - Navegar al Dashboard
    - Verificar que todas las tabs funcionan
    - Verificar que la navegacion desde Dashboard funciona
  resultado_esperado: "Dashboard funcional sin errores"
```

### 5.2 Criterios de Aceptacion

- [ ] Sidebar muestra exactamente 9 items para teacher
- [ ] No hay errores en consola
- [ ] Navegacion entre paginas funciona correctamente
- [ ] Las rutas directas siguen funcionando (si OPCION A)
- [ ] Dashboard carga sin errores

---

## 6. ROLLBACK

En caso de necesitar revertir:

1. Restaurar array `teacherItems` original en GamilitSidebar.tsx
2. No hay otros archivos modificados

---

## 7. NOTAS ADICIONALES

### Sobre los asteriscos (*) en labels:
El codigo actual usa asteriscos para indicar "en construccion". Se recomienda:
- Remover todos los asteriscos para esta fase
- Las paginas en el sidebar deben considerarse "completas" para el usuario

### Sobre el orden de items:
El orden propuesto agrupa logicamente:
1. **Gestion:** Mis Aulas
2. **Monitoreo:** Monitoreo, Alertas
3. **Pedagogico:** Asignaciones, Respuestas, Revisiones
4. **Analitica:** Progreso, Reportes
5. **Gamificacion:** Gamificacion

---

**Estado:** LISTO PARA IMPLEMENTAR
**Prerequisitos:** Ninguno
**Siguiente fase:** FASE 5B (Migracion Students)

