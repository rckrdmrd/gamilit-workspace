# PLAN DE DESARROLLO - PORTAL ADMIN

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Fase:** 2 - PLANEACIÓN
**Versión:** 1.0

---

## RESUMEN DEL PLAN

### Páginas a Desarrollar

| Grupo | Páginas | Prioridad | Paralelizable |
|-------|---------|-----------|---------------|
| **GRUPO 1** | Validación de páginas funcionales | P0 | Sí (5 en paralelo) |
| **GRUPO 2** | Completar páginas parciales | P1 | Sí (3 en paralelo) |
| **GRUPO 3** | Páginas acotadas | P2 | Sí (2 en paralelo) |

### Páginas Descartadas (NO desarrollar)
- ❌ AdminAdvancedPage
- ❌ AdminSettingsPage (por ahora)

---

## GRUPO 1: VALIDACIÓN DE PÁGINAS FUNCIONALES (P0)

### Objetivo
Validar que las páginas marcadas como "100% funcionales" realmente funcionan correctamente con datos reales.

### Páginas a Validar (5 páginas - ejecutar en paralelo)

| # | Página | Estado Reportado | Acción |
|---|--------|-----------------|--------|
| 1 | AdminDashboard/AdminDashboardPage | ✅ 100% | Validar integración con vistas SQL |
| 2 | AdminProgressPage | ✅ 100% | Validar datos de progreso reales |
| 3 | AdminMonitoringPage | ✅ 100% | Validar logs y métricas |
| 4 | AdminAlertsPage | ✅ 100% | Validar gestión de alertas |
| 5 | AdminRolesPage | ✅ 100% | Validar permisos granulares |
| 6 | AdminInstitutionsPage | ✅ 100% | Validar CRUD organizaciones |

### Criterios de Validación
- ✅ Página carga sin errores de TypeScript
- ✅ Datos se muestran correctamente
- ✅ Acciones CRUD funcionan (si aplica)
- ✅ Paginación funciona
- ✅ Filtros funcionan
- ✅ No hay console.error en runtime

---

## GRUPO 2: COMPLETAR PÁGINAS PARCIALES (P1)

### Tareas Detalladas

#### TAREA 2.1: AdminUsersPage - Modal de Edición
**Prioridad:** P1 - Alta
**Estado actual:** 80% funcional
**Faltante:** Modal de edición de usuario

**Especificación:**
```typescript
// Crear componente: UserEditModal.tsx
interface UserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UpdateUserDto) => Promise<void>;
}

// Campos editables:
- display_name: string
- email: string (con validación)
- role: 'student' | 'teacher' | 'admin'
- organization_id: string (select de organizaciones)
- is_active: boolean
```

**Archivos a modificar:**
- `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`
- `apps/frontend/src/apps/admin/components/users/UserEditModal.tsx` (crear)

**Endpoint a usar:**
- PUT `/admin/users/:id`

**Criterios de aceptación:**
- ✅ Modal se abre al hacer click en "Editar"
- ✅ Formulario pre-cargado con datos actuales
- ✅ Validación de campos
- ✅ Guardar actualiza usuario
- ✅ Feedback toast de éxito/error

---

#### TAREA 2.2: AdminGamificationPage - Tab de Logros
**Prioridad:** P1 - Media
**Estado actual:** 85% funcional
**Faltante:** Tab de gestión de logros

**Especificación:**
```typescript
// Tab: AchievementsTab.tsx
// Mostrar lista de achievements definidos en BD
// Endpoint: GET /admin/gamification/achievements (crear si no existe)

// Datos a mostrar:
- achievement_id
- name
- description
- category (de achievement_categories)
- xp_reward
- ml_coins_reward
- icon_url
- requirements (JSON)
- is_active
```

**Archivos a modificar:**
- `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`
- `apps/frontend/src/apps/admin/components/gamification/AchievementsTab.tsx` (crear)

**Alcance ACOTADO:**
- ✅ Vista de lectura de logros existentes
- ⚠️ NO edición de logros (complejidad alta de requirements JSON)
- ✅ Toggle de activación/desactivación

**Criterios de aceptación:**
- ✅ Lista de logros se muestra
- ✅ Categorías se filtran
- ✅ Toggle activa/desactiva logro

---

#### TAREA 2.3: AdminClassroomTeacherPage - Completar UI
**Prioridad:** P1 - Alta
**Estado actual:** 60% funcional
**Faltante:** Completar componentes y flujos

**Especificación:**
```typescript
// Dos tabs principales:
// Tab 1: ClassroomTeachersTab - Ver profesores por aula
// Tab 2: TeacherClassroomsTab - Ver aulas por profesor

// Flujos a completar:
1. Seleccionar aula → Ver profesores asignados → Asignar/remover
2. Seleccionar profesor → Ver aulas asignadas → Asignar/remover
3. Asignación masiva (bulk)
```

**Archivos a modificar:**
- `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx`
- `apps/frontend/src/apps/admin/components/classroom-teacher/ClassroomTeachersTab.tsx`
- `apps/frontend/src/apps/admin/components/classroom-teacher/TeacherClassroomsTab.tsx`

**Endpoints disponibles:**
- GET `/admin/classrooms/:classroomId/teachers`
- POST `/admin/classrooms/:classroomId/teachers`
- DELETE `/admin/classrooms/:classroomId/teachers/:teacherId`
- GET `/admin/teachers/:teacherId/classrooms`
- POST `/admin/teachers/:teacherId/classrooms`
- POST `/admin/classroom-teachers/bulk`

**Criterios de aceptación:**
- ✅ Tab de profesores por aula funciona
- ✅ Tab de aulas por profesor funciona
- ✅ Asignación individual funciona
- ✅ Remoción funciona
- ✅ Feedback de operaciones

---

## GRUPO 3: PÁGINAS CON ALCANCE ACOTADO (P2)

### TAREA 3.1: AdminAnalyticsPage - Documentar Limitaciones
**Prioridad:** P2 - Baja
**Estado actual:** 100% UI, datos limitados
**Acción:** Agregar indicadores visuales de limitaciones

**Alcance definido:**
- ✅ Overview Tab: Funcional completo
- ✅ Top Users Tab: Funcional completo
- ✅ Activity Timeline: Funcional completo
- ⚠️ Engagement Tab: Mostrar badge "Datos limitados"
- ⚠️ Retention Tab: Mostrar badge "Requiere más datos históricos"
- ✅ Export CSV: Funcional

**Archivos a modificar:**
- `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx`

**Criterios de aceptación:**
- ✅ Badge informativo en tabs con datos limitados
- ✅ Tooltip explicando la limitación

---

### TAREA 3.2: AdminContentPage - Definir Alcance Multimedia
**Prioridad:** P2 - Media
**Estado actual:** 70% funcional
**Acción:** Implementar o deshabilitar tabs no funcionales

**Alcance definido:**
- ✅ Tab Pendientes: Funcional - mantener
- ⚠️ Tab Multimedia: Si Supabase Storage configurado → habilitar, si no → ocultar
- ⚠️ Tab Versiones: Mostrar historial básico sin comparación

**Archivos a modificar:**
- `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx`
- `apps/frontend/src/apps/admin/components/content/MediaLibraryManager.tsx`
- `apps/frontend/src/apps/admin/components/content/ContentVersionControl.tsx`

**Criterios de aceptación:**
- ✅ Tab Pendientes funciona correctamente
- ✅ Tabs no funcionales muestran mensaje apropiado
- ✅ No hay errores de runtime

---

### TAREA 3.3: AdminReportsPage - Documentar Limitación de Almacenamiento
**Prioridad:** P2 - Baja
**Estado actual:** 100% UI, almacenamiento en memoria
**Acción:** Agregar banner informativo permanente

**Alcance definido:**
- ✅ Generación de reportes funciona
- ✅ Listado de reportes funciona
- ✅ Descarga funciona
- ⚠️ LIMITACIÓN: Reportes se pierden al reiniciar servidor

**Archivos a modificar:**
- `apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`

**Criterios de aceptación:**
- ✅ Banner visible indicando limitación
- ✅ Funcionalidad existente se mantiene

---

## MATRIZ DE AGENTES A ORQUESTAR

### FASE 3 - EJECUCIÓN

| # | Agente | Tarea | Grupo | Paralelo |
|---|--------|-------|-------|----------|
| 1 | Frontend-Agent | Validar AdminDashboard | G1 | Sí (lote 1) |
| 2 | Frontend-Agent | Validar AdminProgressPage | G1 | Sí (lote 1) |
| 3 | Frontend-Agent | Validar AdminMonitoringPage | G1 | Sí (lote 1) |
| 4 | Frontend-Agent | Validar AdminAlertsPage | G1 | Sí (lote 1) |
| 5 | Frontend-Agent | Validar AdminRolesPage | G1 | Sí (lote 1) |
| 6 | Frontend-Agent | Completar AdminUsersPage (modal edición) | G2 | Sí (lote 2) |
| 7 | Frontend-Agent | Completar AdminGamificationPage (logros) | G2 | Sí (lote 2) |
| 8 | Frontend-Agent | Completar AdminClassroomTeacherPage | G2 | Sí (lote 2) |
| 9 | Frontend-Agent | Acotar AdminAnalyticsPage | G3 | Sí (lote 3) |
| 10 | Frontend-Agent | Acotar AdminContentPage | G3 | Sí (lote 3) |
| 11 | Frontend-Agent | Acotar AdminReportsPage | G3 | Sí (lote 3) |

### Orden de Ejecución

```
LOTE 1 (5 agentes en paralelo) - Validación
├── Agent 1: AdminDashboard
├── Agent 2: AdminProgressPage
├── Agent 3: AdminMonitoringPage
├── Agent 4: AdminAlertsPage
└── Agent 5: AdminRolesPage + AdminInstitutionsPage

    ↓ (esperar resultados)

LOTE 2 (3 agentes en paralelo) - Completar parciales
├── Agent 6: AdminUsersPage
├── Agent 7: AdminGamificationPage
└── Agent 8: AdminClassroomTeacherPage

    ↓ (esperar resultados)

LOTE 3 (3 agentes en paralelo) - Acotar alcances
├── Agent 9: AdminAnalyticsPage
├── Agent 10: AdminContentPage
└── Agent 11: AdminReportsPage
```

---

## PROMPTS PREPARADOS PARA ORQUESTACIÓN

### Prompt Base para Frontend-Agent

```markdown
Lee orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

CONTEXTO DEL PROYECTO:
- Proyecto: GAMILIT - Plataforma educativa gamificada
- Área: Portal de Administración
- Stack: React + TypeScript + TailwindCSS + React Query

DIRECTIVAS OBLIGATORIAS:
1. NO crear archivos nuevos a menos que sea estrictamente necesario
2. Preferir editar archivos existentes
3. Validar que no hay errores de TypeScript después de cambios
4. NO agregar comentarios innecesarios
5. Actualizar inventarios si se crean archivos nuevos
```

---

## CRITERIOS DE ACEPTACIÓN GLOBALES

### Para todas las páginas:
- ✅ No hay errores de TypeScript (`npm run type-check` pasa)
- ✅ Página carga sin errores en consola
- ✅ Datos se muestran correctamente
- ✅ Responsive en desktop (mínimo 1024px)
- ✅ Loading states implementados
- ✅ Error states implementados

### Para CRUD:
- ✅ Create funciona y muestra feedback
- ✅ Read muestra datos correctos
- ✅ Update funciona y muestra feedback
- ✅ Delete funciona con confirmación

### Para paginación:
- ✅ Navegación prev/next funciona
- ✅ Indicador de página actual
- ✅ Total de páginas/items visible

---

## TRAZABILIDAD

### Documentos Relacionados
- `01-ANALISIS-CLASIFICACION-PAGINAS.md` - Análisis de clasificación
- `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md` - Traza de frontend
- `docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml` - Inventario

### Referencias de Código
- `apps/frontend/src/apps/admin/pages/` - Páginas admin
- `apps/frontend/src/apps/admin/components/` - Componentes admin
- `apps/frontend/src/apps/admin/hooks/` - Hooks admin
- `apps/backend/src/modules/admin/` - Backend admin

---

**Estado del Plan:** ✅ COMPLETADO
**Fecha:** 2025-11-24
**Siguiente Fase:** EJECUCIÓN (orquestación de agentes)
