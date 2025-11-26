# PLAN DE EJECUCIÓN FASE 2: CORRECCIONES PORTAL ADMIN

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Basado en:** REPORTE-ANALISIS-FASE1-ADMIN-PORTAL.md
**Estado:** FASE 2 PLANEACIÓN

---

## RESUMEN DEL PLAN

Se identificaron **8 correcciones** organizadas en **4 grupos de ejecución**:
- **Grupo 1:** Actualización de Inventarios (3 tareas paralelas)
- **Grupo 2:** Correcciones Frontend P1 (2 tareas paralelas)
- **Grupo 3:** Integración y Cleanup (2 tareas secuenciales)
- **Grupo 4:** Documentación (Architecture-Analyst directo)

**Total de agentes a orquestar:** 5 en Fase inicial + 2 secuenciales = 7 orquestaciones

---

## GRUPO 1: ACTUALIZACIÓN DE INVENTARIOS

### Estrategia: 3 AGENTES EN PARALELO

Estas tareas son **independientes** y pueden ejecutarse simultáneamente.

---

### TAREA 1.1: Actualizar BACKEND_INVENTORY.yml

**Agente:** Backend-Agent (general-purpose)
**Prioridad:** P0 (Crítica)
**Dependencias:** Ninguna

**Problema identificado:**
- El módulo admin documenta `DTOs: 0` pero existen ~42 DTOs reales
- Estructura de DTOs en `apps/backend/src/modules/admin/dto/`

**Especificación:**
```yaml
OBJETIVO: Actualizar BACKEND_INVENTORY.yml con conteo real de DTOs del módulo admin

UBICACIÓN_ARCHIVO: orchestration/inventarios/BACKEND_INVENTORY.yml

CAMBIOS_REQUERIDOS:
  1. Localizar sección del módulo admin (aprox línea 54)
  2. Cambiar "dtos: 0" a "dtos: 42" (o conteo real)
  3. Agregar lista detallada de DTOs por subcarpeta:
     - alerts/ (~7 DTOs)
     - analytics/ (~10 DTOs)
     - classroom-assignments/ (~17 DTOs)
     - interventions/ (~5 DTOs)
     - monitoring/ (~9 DTOs)
     - progress/ (~10 DTOs)
     - bulk-operations/ (~5 DTOs)
     - content/ (~12 DTOs)
     - dashboard/ (~15 DTOs)
     - gamification-config/ (~13 DTOs)
     - organizations/ (~10 DTOs)
     - roles/ (~4 DTOs)
     - system/ (~14 DTOs)
     - users/ (~10 DTOs)
  4. Actualizar fecha de última modificación

CRITERIOS_ACEPTACIÓN:
  - ✅ Conteo de DTOs refleja realidad (~120+ total módulo admin)
  - ✅ Lista detallada por subcarpeta incluida
  - ✅ Fecha actualizada a 2025-11-26
  - ✅ Formato YAML válido

RESTRICCIONES:
  - NO modificar otras secciones del inventario
  - Mantener formato existente
  - Documentar cambios en TRAZA-TAREAS-BACKEND.md
```

---

### TAREA 1.2: Actualizar FRONTEND_INVENTORY.yml - Páginas

**Agente:** Frontend-Agent (general-purpose)
**Prioridad:** P0 (Crítica)
**Dependencias:** Ninguna

**Problema identificado:**
- Inventario documenta 12 páginas admin pero existen 14+
- Falta: AdminProgressPage, AdminAnalyticsPage, AdminAlertsPage
- ~28 componentes nuevos no documentados

**Especificación:**
```yaml
OBJETIVO: Actualizar FRONTEND_INVENTORY.yml con páginas y componentes admin reales

UBICACIÓN_ARCHIVO: orchestration/inventarios/FRONTEND_INVENTORY.yml

CAMBIOS_REQUERIDOS:
  1. Actualizar lista de páginas admin (sección páginas):
     AGREGAR:
     - AdminProgressPage → /admin/progress (nueva)
     - AdminAnalyticsPage → /admin/analytics (nueva)
     - AdminAlertsPage → /admin/alerts (nueva)
     TOTAL: 12 → 15+ páginas

  2. Agregar nuevos componentes admin por categoría:
     alerts/:
       - AlertCard, AlertFilters, AlertsList, AlertsStats
       - AcknowledgeAlertModal, AlertDetailsModal, ResolveAlertModal
     analytics/:
       - EngagementTab, GamificationTab, OverviewTab, RetentionTab
     gamification/:
       - AchievementsTab, BulkUpdateDialog, MayaRankEditModal
       - ParameterEditModal, PreviewImpactDialog, RestoreDefaultsDialog
     monitoring/:
       - AlertasTab, ErrorTrackingTab, LogsViewer, MetricsTab
     progress/:
       - ClassroomSelector, ClassroomsView, OverviewView
       - StudentDetailView, StudentSearch
     reports/:
       - BetaBanner, ReportGenerationForm, ReportsList
     settings/:
       - GeneralSettings, SecuritySettings

  3. Actualizar conteo total de componentes (163 → ~191)
  4. Actualizar fecha de última modificación

CRITERIOS_ACEPTACIÓN:
  - ✅ Todas las páginas admin listadas (15+)
  - ✅ Nuevos componentes documentados (~28)
  - ✅ Conteo total actualizado
  - ✅ Fecha actualizada a 2025-11-26
  - ✅ Formato YAML válido

RESTRICCIONES:
  - NO modificar secciones de student o teacher
  - Mantener formato existente
  - Documentar cambios en TRAZA-TAREAS-FRONTEND.md
```

---

### TAREA 1.3: Validar DATABASE_INVENTORY.yml

**Agente:** Explore Agent (validación rápida)
**Prioridad:** P0 (Verificación)
**Dependencias:** Ninguna

**Nota:** El DATABASE_INVENTORY.yml ya está actualizado (2025-11-24) pero necesita verificación de coherencia con los schemas usados por admin.

**Especificación:**
```yaml
OBJETIVO: Verificar que DATABASE_INVENTORY.yml incluye todos los schemas/tablas del admin

VERIFICAR_SCHEMAS:
  - admin_dashboard (vistas materializadas, bulk_operations)
  - audit_logging (system_alerts, audit_logs)
  - auth_management (profiles, user_roles, memberships)
  - system_configuration (feature_flags, system_settings)
  - progress_tracking (student_intervention_alerts)

ENTREGABLE:
  - Confirmación de que inventory está actualizado
  - O lista de objetos faltantes si los hay

CRITERIOS_ACEPTACIÓN:
  - ✅ Todos los schemas admin documentados
  - ✅ Tablas relevantes listadas
  - ✅ Estado: VALIDADO o NECESITA ACTUALIZACIÓN
```

---

## GRUPO 2: CORRECCIONES FRONTEND P1

### Estrategia: 2 AGENTES EN PARALELO

Estas correcciones son en páginas diferentes y pueden ejecutarse simultáneamente.

---

### TAREA 2.1: Resolver AdminContentPage - Tabs Mock

**Agente:** Frontend-Agent (general-purpose)
**Prioridad:** P1 (Media)
**Dependencias:** Ninguna

**Problema identificado:**
- Tab "Multimedia" usa datos mock
- Tab "Versiones" usa datos mock
- Puede causar confusión a usuarios

**Especificación:**
```yaml
OBJETIVO: Resolver tabs con datos mock en AdminContentPage

UBICACIÓN: apps/frontend/src/apps/admin/pages/AdminContentPage.tsx

OPCIONES_IMPLEMENTACIÓN:
  OPCIÓN_A (Recomendada - Rápida):
    - Agregar componente UnderConstruction a tabs Multimedia y Versiones
    - Mensaje: "Gestión de multimedia estará disponible próximamente"
    - Mantener tab Pendientes funcional

  OPCIÓN_B (Completa - Más tiempo):
    - Integrar con endpoints reales de admin-content
    - GET /admin/content/media
    - DELETE /admin/content/media/:id

DECISIÓN: Implementar OPCIÓN_A (UnderConstruction) para MVP

CAMBIOS_REQUERIDOS:
  1. Importar UnderConstruction de shared/components
  2. En tab "Multimedia": Reemplazar contenido mock con UnderConstruction
  3. En tab "Versiones": Reemplazar contenido mock con UnderConstruction
  4. Mantener tab "Pendientes" sin cambios (funcional)

CRITERIOS_ACEPTACIÓN:
  - ✅ Tabs mock reemplazados con UnderConstruction
  - ✅ Tab Pendientes sigue funcionando
  - ✅ Sin errores TypeScript
  - ✅ Build exitoso

RESTRICCIONES:
  - NO romper funcionalidad existente de tab Pendientes
  - Usar componente UnderConstruction existente
```

---

### TAREA 2.2: Completar AdminGamificationPage - Tab Achievements

**Agente:** Frontend-Agent (general-purpose)
**Prioridad:** P1 (Media)
**Dependencias:** Ninguna

**Problema identificado:**
- Tab Achievements tiene funcionalidad incompleta
- Otros tabs (Parameters, MayaRanks, Settings) funcionan bien

**Especificación:**
```yaml
OBJETIVO: Evaluar y resolver tab Achievements en AdminGamificationPage

UBICACIÓN: apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx
COMPONENTE: apps/frontend/src/apps/admin/components/gamification/AchievementsTab.tsx

ANÁLISIS_REQUERIDO:
  1. Verificar qué funcionalidad tiene AchievementsTab
  2. Verificar si hay endpoint backend disponible
  3. Determinar si completar o marcar UnderConstruction

OPCIONES:
  SI_HAY_ENDPOINT:
    - Completar integración con backend
    - Asegurar CRUD funcional

  SI_NO_HAY_ENDPOINT:
    - Agregar UnderConstruction con mensaje apropiado
    - Documentar para Fase 2

CRITERIOS_ACEPTACIÓN:
  - ✅ Tab Achievements funcional O con UnderConstruction
  - ✅ Otros tabs siguen funcionando
  - ✅ Sin errores TypeScript
  - ✅ Build exitoso

RESTRICCIONES:
  - NO romper tabs existentes (Parameters, MayaRanks, Settings)
  - Documentar decisión tomada
```

---

## GRUPO 3: INTEGRACIÓN Y CLEANUP

### Estrategia: 2 TAREAS SECUENCIALES

Estas tareas requieren evaluación y pueden tener dependencias.

---

### TAREA 3.1: Agregar AdminClassroomTeacherPage al Router

**Agente:** Frontend-Agent (general-purpose)
**Prioridad:** P1 (Media)
**Dependencias:** Después de Grupo 2
**Ejecutar:** SECUENCIAL

**Problema identificado:**
- AdminClassroomTeacherPage existe pero no tiene ruta en el router
- No usa AdminLayout

**Especificación:**
```yaml
OBJETIVO: Integrar AdminClassroomTeacherPage al sistema de rutas

UBICACIÓN_ROUTER: apps/frontend/src/App.tsx (o router config)
UBICACIÓN_PÁGINA: apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx

CAMBIOS_REQUERIDOS:
  1. Agregar ruta /admin/classroom-teachers al router
  2. Asegurar que use AdminLayout como wrapper
  3. Agregar al menú de navegación admin si aplica
  4. Verificar que componentes ClassroomTeachersTab y TeacherClassroomsTab funcionen

CRITERIOS_ACEPTACIÓN:
  - ✅ Ruta /admin/classroom-teachers accesible
  - ✅ Usa AdminLayout
  - ✅ Navegación funcional
  - ✅ Sin errores TypeScript

RESTRICCIONES:
  - Mantener consistencia con otras rutas admin
  - Seguir patrón existente de rutas
```

---

### TAREA 3.2: Evaluar AdminApprovalsPage (Posible Duplicado)

**Agente:** Explore Agent (análisis)
**Prioridad:** P2 (Baja)
**Dependencias:** Después de Tarea 3.1
**Ejecutar:** SECUENCIAL

**Problema identificado:**
- AdminApprovalsPage tiene funcionalidad similar a AdminContentPage
- Posible duplicidad que causa confusión

**Especificación:**
```yaml
OBJETIVO: Analizar si AdminApprovalsPage es duplicado de AdminContentPage

ANÁLISIS_REQUERIDO:
  1. Comparar funcionalidad de ambas páginas
  2. Verificar si comparten endpoints
  3. Determinar si una puede eliminarse
  4. Documentar recomendación

ENTREGABLE:
  - Reporte de análisis con recomendación:
    A) Eliminar AdminApprovalsPage (si es duplicado)
    B) Mantener ambas (si tienen propósitos diferentes)
    C) Fusionar funcionalidades (si hay overlap parcial)

CRITERIOS_ACEPTACIÓN:
  - ✅ Análisis documentado
  - ✅ Recomendación clara
  - ✅ NO se realizan cambios destructivos sin aprobación
```

---

## GRUPO 4: DOCUMENTACIÓN (ARCHITECTURE-ANALYST DIRECTO)

### Estrategia: TAREAS DIRECTAS (Sin orquestación)

Estas tareas las realizo yo directamente como Architecture-Analyst.

---

### TAREA 4.1: Crear Documento Alcance Fase 2

**Ejecutor:** Architecture-Analyst (directo)
**Prioridad:** P2
**Dependencias:** Después de Grupos 1-3

**Contenido:**
- Listar páginas placeholder para Fase 2
- Definir requisitos para cada una
- Estimar esfuerzo

---

### TAREA 4.2: Actualizar Trazas

**Ejecutor:** Architecture-Analyst (directo)
**Prioridad:** P2
**Dependencias:** Al finalizar todas las tareas

**Contenido:**
- Actualizar TRAZA-TAREAS-FRONTEND.md
- Actualizar TRAZA-TAREAS-BACKEND.md
- Documentar correcciones realizadas

---

## CRONOGRAMA DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CRONOGRAMA DE ORQUESTACIÓN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RONDA 1 (PARALELO - 5 agentes máximo)                                     │
│  ├── Tarea 1.1: Backend-Agent → Actualizar BACKEND_INVENTORY               │
│  ├── Tarea 1.2: Frontend-Agent → Actualizar FRONTEND_INVENTORY             │
│  ├── Tarea 1.3: Explore Agent → Validar DATABASE_INVENTORY                 │
│  ├── Tarea 2.1: Frontend-Agent → AdminContentPage tabs mock                │
│  └── Tarea 2.2: Frontend-Agent → AdminGamificationPage Achievements        │
│                                                                             │
│  ════════════════════════════════════════════════════════════════════════  │
│                          VALIDACIÓN RONDA 1                                 │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  RONDA 2 (SECUENCIAL - después de validación)                              │
│  ├── Tarea 3.1: Frontend-Agent → AdminClassroomTeacherPage router          │
│  └── Tarea 3.2: Explore Agent → Evaluar AdminApprovalsPage                 │
│                                                                             │
│  ════════════════════════════════════════════════════════════════════════  │
│                          VALIDACIÓN RONDA 2                                 │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  RONDA 3 (DIRECTO - Architecture-Analyst)                                  │
│  ├── Tarea 4.1: Crear documento Alcance Fase 2                             │
│  └── Tarea 4.2: Actualizar trazas finales                                  │
│                                                                             │
│  ════════════════════════════════════════════════════════════════════════  │
│                       VALIDACIÓN FINAL                                      │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## MATRIZ DE AGENTES POR RONDA

### RONDA 1 (5 agentes paralelos)

| # | Agente | Tarea | Prompt File | Descripción |
|---|--------|-------|-------------|-------------|
| 1 | general-purpose | 1.1 | PROMPT-BACKEND-AGENT.md | Actualizar BACKEND_INVENTORY |
| 2 | general-purpose | 1.2 | PROMPT-FRONTEND-AGENT.md | Actualizar FRONTEND_INVENTORY |
| 3 | Explore | 1.3 | N/A | Validar DATABASE_INVENTORY |
| 4 | general-purpose | 2.1 | PROMPT-FRONTEND-AGENT.md | AdminContentPage tabs |
| 5 | general-purpose | 2.2 | PROMPT-FRONTEND-AGENT.md | AdminGamificationPage |

### RONDA 2 (2 agentes secuenciales)

| # | Agente | Tarea | Prompt File | Descripción |
|---|--------|-------|-------------|-------------|
| 6 | general-purpose | 3.1 | PROMPT-FRONTEND-AGENT.md | Router ClassroomTeacher |
| 7 | Explore | 3.2 | N/A | Evaluar ApprovalsPage |

---

## CRITERIOS DE ÉXITO GLOBAL

### Al finalizar RONDA 1:
- [ ] BACKEND_INVENTORY.yml actualizado con DTOs admin
- [ ] FRONTEND_INVENTORY.yml actualizado con páginas/componentes
- [ ] DATABASE_INVENTORY.yml validado
- [ ] AdminContentPage sin tabs mock (UnderConstruction)
- [ ] AdminGamificationPage Achievements resuelto

### Al finalizar RONDA 2:
- [ ] AdminClassroomTeacherPage accesible vía router
- [ ] AdminApprovalsPage evaluado con recomendación

### Al finalizar RONDA 3:
- [ ] Documento Alcance Fase 2 creado
- [ ] Trazas actualizadas
- [ ] Build frontend exitoso
- [ ] Sin errores TypeScript nuevos

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Agente no encuentra archivo | Baja | Medio | Proporcionar rutas absolutas en prompts |
| Conflicto en inventarios | Media | Bajo | Backup antes de modificar |
| Build falla después de cambios | Media | Alto | Ejecutar build después de cada ronda |
| Dependencias no detectadas | Baja | Medio | Validación manual post-agente |

---

## APROBACIÓN PARA FASE 3

**FASE 2: PLANEACIÓN - COMPLETADA ✅**

**Plan listo para ejecución. Esperando aprobación para proceder con FASE 3: EJECUCIÓN.**

**Agentes a orquestar en Ronda 1:** 5
**Agentes a orquestar en Ronda 2:** 2
**Tareas directas:** 2

---

**Fecha de creación:** 2025-11-26
**Autor:** Architecture-Analyst
