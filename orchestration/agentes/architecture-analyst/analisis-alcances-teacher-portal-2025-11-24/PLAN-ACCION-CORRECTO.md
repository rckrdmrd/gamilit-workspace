# PLAN DE ACCIÓN CORRECTO - Portal Teacher Fuera de Alcance

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 2.0.0 (CORREGIDA)
**Severidad:** 🟢 BAJA (Clarificado que es Feature Futura)

---

## 🎯 CLARIFICACIÓN DE ALCANCES

### Alcances Según Documentación Oficial

**FASE 1 (EAI-005 - Admin Base) - ✅ EN ALCANCE:**
- Gestión de Aulas CRUD (sin maestros asignados)
- Gestión de Estudiantes en Aulas
- Asignación de Módulos
- Configuración Básica de Aulas
- Vista de Actividad de Aula
- **NOTA:** Aulas gestionadas por super admin, NO por maestros

**FASE 3 (EXT-001 - Portal Maestros) - ❌ FUERA DE ALCANCE:**
- US-PM-000: Dashboard de Maestro
- US-PM-001a/b: Classroom CRUD + Student Enrollment (por maestros)
- US-PM-002a/b/c: Assignment CRUD + Distribution + Submissions
- US-PM-003a/b: Grading Queue + Grading Interface
- US-PM-004a/b: Progress Analytics + Teacher Notes
- US-PM-005a/b/c: Classroom Analytics + Report Generation + Engagement Metrics
- US-PM-006: Bloquear Alumnos
- **TOTAL:** 14 User Stories (66 SP)

---

## 📊 ESTADO ACTUAL VS ESPERADO

### Portal Teacher Implementado (11 páginas en sidebar)

| # | Página | Ruta | Estado Actual | Estado Esperado (Fase 1) |
|---|--------|------|---------------|--------------------------|
| 1 | Dashboard | `/teacher/dashboard` | ⚠️ Funcional | ❌ FUERA DE ALCANCE |
| 2 | Monitoreo | `/teacher/monitoring` | ⚠️ Parcial (404s) | ❌ FUERA DE ALCANCE |
| 3 | Asignaciones | `/teacher/assignments` | ⚠️ Parcial (solo lectura) | ❌ FUERA DE ALCANCE |
| 4 | Progreso | `/teacher/progress` | ⚠️ Parcial (404s) | ❌ FUERA DE ALCANCE |
| 5 | Alertas | `/teacher/alerts` | ✅ Funcional | ❌ FUERA DE ALCANCE |
| 6 | Analíticas | `/teacher/analytics` | ⚠️ Wrapper | ❌ FUERA DE ALCANCE |
| 7 | Reportes | `/teacher/reports` | ⚠️ Parcial (mocks) | ❌ FUERA DE ALCANCE |
| 8 | Comunicación | `/teacher/communication` | ✅ UnderConstruction | ❌ FUERA DE ALCANCE |
| 9 | Contenido | `/teacher/content` | ⚠️ Wrapper | ❌ FUERA DE ALCANCE |
| 10 | Gamificación | `/teacher/gamification` | ⚠️ Wrapper | ❌ FUERA DE ALCANCE |
| 11 | Recursos | `/teacher/resources` | ✅ UnderConstruction | ❌ FUERA DE ALCANCE |

**CONCLUSIÓN:** Las 11 páginas pertenecen a EXT-001 (Fase 3) y están **FUERA DEL ALCANCE ACTUAL**.

---

## 🛠️ PLAN DE ACCIÓN CORRECTO

### Objetivo

Marcar **TODAS** las páginas del Portal Teacher como "En Construcción" para reflejar que pertenecen a una fase futura (EXT-001).

---

## 📋 TAREAS REQUERIDAS

### TAREA 1: Actualizar Páginas con UnderConstruction

**Duración:** 2-4 horas
**Responsable:** Frontend-Developer

#### Páginas a Actualizar (9 de 11)

Ya implementadas correctamente:
- ✅ `TeacherCommunicationPage.tsx` (usa UnderConstruction)
- ✅ `TeacherResourcesPage.tsx` (usa UnderConstruction)

**Pendientes de actualizar:**
1. ✅ `TeacherDashboardPage.tsx` → Reemplazar con UnderConstruction
2. ✅ `TeacherMonitoringPage.tsx` → Reemplazar con UnderConstruction
3. ✅ `TeacherAssignmentsPage.tsx` → Reemplazar con UnderConstruction
4. ✅ `TeacherProgressPage.tsx` → Reemplazar con UnderConstruction
5. ✅ `TeacherAlertsPage.tsx` → Reemplazar con UnderConstruction
6. ✅ `TeacherAnalyticsPage.tsx` → Reemplazar con UnderConstruction
7. ✅ `TeacherReportsPage.tsx` → Reemplazar con UnderConstruction
8. ✅ `TeacherContentPage.tsx` → Reemplazar con UnderConstruction
9. ✅ `TeacherGamificationPage.tsx` → Reemplazar con UnderConstruction

---

### TAREA 2: Crear Template Estándar para Portal Teacher

**Ubicación:** `apps/frontend/src/apps/teacher/pages/TeacherPortalUnderConstruction.tsx`

```typescript
import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { UnderConstruction } from '@shared/components/UnderConstruction';

interface TeacherPortalUnderConstructionProps {
  pageName: string;
  pageDescription: string;
  upcomingFeatures: string[];
  estimatedPhase?: string;
}

/**
 * Template genérico para páginas del Portal Teacher en desarrollo
 * Todas las funcionalidades del Portal Teacher pertenecen a EXT-001 (Fase 3)
 */
export const TeacherPortalUnderConstruction: React.FC<TeacherPortalUnderConstructionProps> = ({
  pageName,
  pageDescription,
  upcomingFeatures,
  estimatedPhase = 'Fase 3 - Portal Maestros (EXT-001)',
}) => {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <UnderConstruction
        title={pageName}
        message={`${pageDescription}\n\nEsta funcionalidad será implementada en: ${estimatedPhase}`}
        upcomingFeatures={upcomingFeatures}
      />
    </TeacherLayout>
  );
};

export default TeacherPortalUnderConstruction;
```

---

### TAREA 3: Actualizar Cada Página Individual

#### Ejemplo: TeacherDashboardPage.tsx

**ANTES:**
```typescript
export default function TeacherDashboardPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  return (
    <TeacherLayout user={user} ...>
      <TeacherDashboard />
    </TeacherLayout>
  );
}
```

**DESPUÉS:**
```typescript
import { TeacherPortalUnderConstruction } from './TeacherPortalUnderConstruction';

export default function TeacherDashboardPage() {
  return (
    <TeacherPortalUnderConstruction
      pageName="Dashboard de Maestro"
      pageDescription="Vista general de tus aulas, estudiantes y métricas de progreso."
      estimatedPhase="Fase 3 - Portal Maestros (EXT-001)"
      upcomingFeatures={[
        'Vista general de todas tus aulas',
        'Resumen de estudiantes activos',
        'Métricas de progreso promedio',
        'Actividad reciente de todas las aulas',
        'Insights y alertas de intervención',
        'Acceso rápido a cada aula',
      ]}
    />
  );
}
```

---

### TAREA 4: Actualizar Routing (Opcional)

Si quieres evitar que los usuarios accedan al portal teacher, puedes:

**Opción A:** Mantener rutas pero mostrar UnderConstruction en cada página (RECOMENDADO)
- ✅ Usuarios pueden ver el sidebar con las funcionalidades futuras
- ✅ Cada página muestra claramente que está en desarrollo
- ✅ No rompe enlaces existentes

**Opción B:** Redirigir todo `/teacher/*` a una página genérica
```typescript
// En App.tsx
<Route path="/teacher/*" element={
  <TeacherPortalUnderConstruction
    pageName="Portal de Maestros"
    pageDescription="Portal completo para gestión de aulas y estudiantes."
    upcomingFeatures={[...]}
  />
} />
```

**RECOMENDACIÓN:** Usar Opción A para mejor UX

---

### TAREA 5: Actualizar Sidebar con Indicadores Visuales (Opcional)

**Ubicación:** `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`

Agregar indicador visual en items de teacher:

```typescript
const teacherItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/teacher/dashboard',
    icon: 'Home',
    badge: '🚧 Próximamente', // Agregar badge
  },
  // ... resto de items
];
```

**Beneficio:** Usuario sabe desde el sidebar que son funciones futuras

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Pre-Implementación
- [ ] Confirmar que Fase 3 (EXT-001) está fuera de alcance actual
- [ ] Aprobar plan de acción con Product Owner
- [ ] Asignar recursos (Frontend-Developer)

### Implementación
- [ ] Crear `TeacherPortalUnderConstruction.tsx` template
- [ ] Actualizar `TeacherDashboardPage.tsx`
- [ ] Actualizar `TeacherMonitoringPage.tsx`
- [ ] Actualizar `TeacherAssignmentsPage.tsx`
- [ ] Actualizar `TeacherProgressPage.tsx`
- [ ] Actualizar `TeacherAlertsPage.tsx`
- [ ] Actualizar `TeacherAnalyticsPage.tsx`
- [ ] Actualizar `TeacherReportsPage.tsx`
- [ ] Actualizar `TeacherContentPage.tsx`
- [ ] Actualizar `TeacherGamificationPage.tsx`
- [ ] Validar que `TeacherCommunicationPage.tsx` y `TeacherResourcesPage.tsx` ya usan UnderConstruction

### Validación
- [ ] Testing manual de las 11 páginas
- [ ] Verificar que todas muestran UnderConstruction correctamente
- [ ] Verificar que no hay errores 404 ni console errors
- [ ] Verificar que gamification header carga correctamente
- [ ] Verificar navegación entre páginas funciona

### Documentación
- [ ] Actualizar Manual Portal Teacher indicando que Fase 3 está en desarrollo
- [ ] Crear documento de roadmap visible para usuarios
- [ ] Actualizar trazas del proyecto

---

## 📊 ESTIMACIONES

| Tarea | Duración | Prioridad |
|-------|----------|-----------|
| Crear template UnderConstruction | 30 min | P0 |
| Actualizar 9 páginas | 1-2 horas | P0 |
| Agregar badges en sidebar (opcional) | 30 min | P1 |
| Testing y validación | 1 hora | P0 |
| Documentación | 30 min | P1 |
| **TOTAL** | **2-4 horas** | - |

---

## 🎯 BENEFICIOS

1. ✅ **Claridad para usuarios:** Saben que funcionalidades vendrán en Fase 3
2. ✅ **Sin errores 404:** No hay llamadas a endpoints que no existen
3. ✅ **Mejor UX:** Mensajes explicativos en lugar de páginas rotas
4. ✅ **Mantenible:** Template reutilizable para futuras features
5. ✅ **Alineado con documentación:** Refleja correctamente los alcances

---

## 📝 MENSAJES SUGERIDOS POR PÁGINA

### Dashboard
```
"Vista general de tus aulas, estudiantes y métricas de progreso."

Funcionalidades próximas:
- Vista general de todas tus aulas
- Resumen de estudiantes activos
- Métricas de progreso promedio
- Actividad reciente de todas las aulas
- Insights y alertas de intervención
- Acceso rápido a cada aula

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Monitoreo
```
"Monitorea en tiempo real la actividad de tus estudiantes y detecta oportunidades de intervención."

Funcionalidades próximas:
- Monitoreo en tiempo real por aula
- Visualización de estudiantes activos
- Alertas de inactividad
- Indicadores de progreso individual
- Filtros por aula y estado

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Asignaciones
```
"Crea y gestiona asignaciones para tus aulas, califica trabajos y proporciona retroalimentación."

Funcionalidades próximas:
- Crear asignaciones personalizadas
- Distribuir a una o varias aulas
- Revisar entregas de estudiantes
- Calificar con rúbricas
- Proporcionar feedback detallado
- Generar reportes de rendimiento

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Progreso
```
"Analiza el progreso académico de tus estudiantes con métricas detalladas y visualizaciones."

Funcionalidades próximas:
- Dashboard de progreso por aula
- Gráficas de tendencias
- Comparativas entre estudiantes
- Identificación de rezagos
- Métricas de completitud por módulo

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Alertas
```
"Sistema inteligente de alertas para intervención temprana con estudiantes en riesgo."

Funcionalidades próximas:
- Alertas de inactividad prolongada
- Detección de bajo rendimiento
- Identificación de tendencias decrecientes
- Sugerencias de intervención
- Priorización automática de casos

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Analíticas
```
"Análisis avanzados de rendimiento, engagement y métricas educativas."

Funcionalidades próximas:
- Gráficas de rendimiento temporal
- Métricas de engagement
- Análisis comparativo entre aulas
- Identificación de patrones de aprendizaje
- Exportación de datos

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Reportes
```
"Genera reportes personalizados de progreso, evaluación e intervención."

Funcionalidades próximas:
- Reportes de progreso por estudiante
- Reportes de evaluación por aula
- Reportes de intervención
- Exportación en PDF, Excel, CSV
- Plantillas personalizables

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Contenido
```
"Gestiona contenido educativo, ejercicios y materiales didácticos."

Funcionalidades próximas:
- Ver catálogo completo de ejercicios
- Crear ejercicios personalizados
- Editar ejercicios existentes
- Subir recursos multimedia
- Organizar por temas y dificultad

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

### Gamificación
```
"Visualiza configuración de gamificación: rangos, insignias, puntos y recompensas."

Funcionalidades próximas:
- Ver configuración global de gamificación
- Consultar rangos Maya y umbrales
- Ver insignias disponibles
- Sistema de puntos y XP
- Catálogo de recompensas

Disponible en: Fase 3 - Portal Maestros (EXT-001)
```

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### HOY (2025-11-24)
1. [ ] Revisar y aprobar este plan con Product Owner
2. [ ] Asignar Frontend-Developer
3. [ ] Crear template `TeacherPortalUnderConstruction.tsx`

### MAÑANA (2025-11-25)
4. [ ] Actualizar las 9 páginas pendientes
5. [ ] Testing manual de todas las páginas

### PASADO MAÑANA (2025-11-26)
6. [ ] Validación final
7. [ ] Actualizar documentación
8. [ ] Deploy a staging/producción

**ESTIMACIÓN TOTAL:** 2-4 horas de desarrollo + validación

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 2.0.0 (Corregida según alcances documentados)
**Próxima Revisión:** Cuando se planifique implementación de Fase 3 (EXT-001)
