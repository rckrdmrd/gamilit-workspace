# PLAN DE CORRECCIONES: DOCUMENTACION

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-12-23
**Fase:** 3 - Planeacion de Implementaciones
**Basado en:** 14-RESUMEN-GAPS-IDENTIFICADOS.md

---

## RESUMEN EJECUTIVO

| Prioridad | Correcciones | Esfuerzo | Objetivo |
|-----------|--------------|----------|----------|
| P0 - Critica | 8 | 14.5h | Esta semana |
| P1 - Alta | 7 | 10h | Proxima semana |
| P2 - Media | 6 | 18h | 2 semanas |
| **TOTAL** | **21** | **42.5h** | - |

---

## 1. CORRECCIONES P0 - CRITICAS

### C-DOC-001: Actualizar FEATURES-IMPLEMENTADAS.md
**Archivo:** `docs/90-transversal/features/FEATURES-IMPLEMENTADAS.md`
**Problema:** 42 dias desactualizado (2025-11-11)
**Esfuerzo:** 2h

#### Cambios Requeridos:
```yaml
Metricas a actualizar:
  controllers: 38 -> 76
  services: 52 -> 103
  entities: 64 -> 93
  modules: 14 -> 16
  hooks: 19 -> 102
  componentes: 275 -> 497

Secciones a revisar:
  - Resumen de features por modulo
  - Estado de mecanicas M1-M5
  - Portales implementados
```

#### Dependencias:
- Ninguna (puede ejecutarse inmediatamente)

#### Validacion:
- [ ] Valores coinciden con conteos reales de codigo
- [ ] Fecha de version actualizada a 2025-12-23
- [ ] Changelog interno actualizado

---

### C-DOC-002: Actualizar docs/README.md
**Archivo:** `docs/README.md`
**Problema:** Metricas de backend incorrectas
**Esfuerzo:** 30min

#### Cambios Requeridos:
```yaml
Seccion "Metricas del Proyecto":
  backend_controllers: Valor actual -> 76
  backend_services: Valor actual -> 103
  frontend_hooks: Valor actual -> 102
  database_tables: Valor actual -> 132
```

#### Dependencias:
- C-DOC-001 (para consistencia de valores)

#### Validacion:
- [ ] Valores alineados con FEATURES-IMPLEMENTADAS.md
- [ ] Links internos funcionando

---

### C-DOC-003: Documentar Modulo Teacher (Backend)
**Ruta:** `docs/90-transversal/api/` (nuevo archivo)
**Problema:** 50+ endpoints sin documentar
**Esfuerzo:** 4h

#### Contenido a Crear:
```yaml
Archivo: API-TEACHER-MODULE.md

Secciones:
  1. Resumen del modulo
  2. Endpoints por controlador:
     - TeacherController (base)
     - TeacherStudentController
     - TeacherClassController
     - TeacherAssignmentController
     - TeacherGradingController
     - TeacherInterventionController
     - TeacherDashboardController
     - TeacherExerciseController
     - TeacherAnalyticsController
  3. DTOs utilizados
  4. Ejemplos de uso
```

#### Dependencias:
- Lectura de codigo fuente en `apps/backend/src/modules/teacher/`

#### Validacion:
- [ ] Todos los endpoints documentados
- [ ] DTOs referenciados existen
- [ ] Ejemplos de request/response

---

### C-DOC-004: Documentar Portal Student (Frontend)
**Ruta:** `docs/frontend/student/` (nueva carpeta)
**Problema:** 27 paginas sin ninguna documentacion
**Esfuerzo:** 4h

#### Contenido a Crear:
```yaml
Archivos a crear:
  - README.md (indice del portal)
  - PAGES-STUDENT.md (27 paginas)
  - COMPONENTS-STUDENT.md (componentes principales)
  - NAVIGATION-STUDENT.md (flujo de navegacion)

Paginas a documentar:
  - Dashboard.tsx
  - ModuleSelector.tsx
  - ExercisePage.tsx
  - ProfilePage.tsx
  - AchievementsPage.tsx
  - LeaderboardPage.tsx
  - GuildPage.tsx
  - ShopPage.tsx
  - MissionsPage.tsx
  - ... (18 mas)
```

#### Dependencias:
- Lectura de codigo fuente en `apps/frontend/src/apps/student/`

#### Validacion:
- [ ] Todas las 27 paginas documentadas
- [ ] Flujos de navegacion correctos
- [ ] Screenshots si aplica

---

### C-DOC-005: Documentar 9 Tablas Nuevas de Database
**Ruta:** `docs/database/inventarios-database/`
**Problema:** 9 tablas implementadas no documentadas
**Esfuerzo:** 2h

#### Tablas a Documentar:
```yaml
auth_management:
  - parent_accounts
  - parent_student_links
  - parent_notifications
  - parent_account_invitations

gamification_system:
  - item_shop
  - purchases
  - reward_templates
  - achievement_templates

progress_tracking:
  - teacher_interventions
```

#### Por cada tabla:
- Proposito
- Columnas con tipos
- Foreign keys
- Indices
- Triggers asociados

#### Dependencias:
- DDL actualizado en `apps/database/ddl/`

#### Validacion:
- [ ] Todas las 9 tablas documentadas
- [ ] Estructura coincide con DDL real
- [ ] Relaciones correctas

---

### C-DOC-006: Actualizar API.md con Endpoints Faltantes
**Archivo:** `docs/90-transversal/api/API.md`
**Problema:** Solo 150 de 300+ endpoints documentados
**Esfuerzo:** 1h (estructura base)

#### Cambios Requeridos:
```yaml
Agregar secciones:
  - Social Module (35+ endpoints)
  - Admin extendido (56+ endpoints faltantes)
  - Content Module actualizado
  - Progress Module actualizado
```

#### Dependencias:
- C-DOC-003 (Teacher module separado)

#### Validacion:
- [ ] Indice actualizado con nuevos modulos
- [ ] Links a documentacion detallada

---

### C-DOC-007: Resolver Duplicacion Teacher Pages
**Ruta:** `docs/frontend/teacher/`
**Problema:** 11 pares de paginas duplicadas
**Esfuerzo:** 30min

#### Duplicaciones a Resolver:
```yaml
Pares identificados (mantener solo uno):
  - TeacherDashboard.tsx vs TeacherDashboardPage.tsx
  - TeacherStudents.tsx vs TeacherStudentsPage.tsx
  - TeacherClasses.tsx vs TeacherClassesPage.tsx
  - TeacherGrading.tsx vs TeacherGradingPage.tsx
  - TeacherAssignments.tsx vs TeacherAssignmentsPage.tsx
  - TeacherExercises.tsx vs TeacherExercisesPage.tsx
  - TeacherSettings.tsx vs TeacherSettingsPage.tsx
  - TeacherAnalytics.tsx vs TeacherAnalyticsPage.tsx
  - TeacherReports.tsx vs TeacherReportsPage.tsx
  - TeacherNotifications.tsx vs TeacherNotificationsPage.tsx
  - TeacherProfile.tsx vs TeacherProfilePage.tsx
```

#### Accion:
- Documentar convencion de nombres elegida
- Actualizar documentacion para reflejar nombres reales

#### Dependencias:
- Verificar cual archivo esta en uso real (router)

#### Validacion:
- [ ] Documentacion refleja estructura real
- [ ] Sin referencias a archivos inexistentes

---

### C-DOC-008: Mover Paginas Admin de Student a Ubicacion Correcta
**Ruta:** `docs/frontend/`
**Problema:** 3 paginas admin en carpeta student incorrecta
**Esfuerzo:** 30min

#### Archivos a Mover:
```yaml
Origen: apps/frontend/src/apps/student/pages/admin/
Destino: apps/frontend/src/apps/admin/pages/

Archivos:
  - AdminDashboard.tsx
  - AdminSettings.tsx
  - AdminUsers.tsx
```

#### Dependencias:
- Esto es correccion de CODIGO, no documentacion
- Documentar la estructura correcta

#### Validacion:
- [ ] Documentacion refleja estructura correcta
- [ ] Advertencia sobre ubicacion incorrecta actual

---

## 2. CORRECCIONES P1 - ALTAS

### C-DOC-009: Completar Documentacion Admin Module
**Archivo:** `docs/90-transversal/api/API-ADMIN-MODULE.md`
**Problema:** Solo 14 de 70+ endpoints documentados
**Esfuerzo:** 3h

#### Controladores a Documentar:
```yaml
Faltantes:
  - AdminDashboardActivityController
  - AdminDashboardStatsController
  - AdminUserStatsController
  - FeatureFlagsController
  - AdminReportsController
  - AdminAuditController
  - AdminContentController
  - AdminGamificationController
  - ... (14+ mas)
```

---

### C-DOC-010: Actualizar MASTER_INVENTORY.yml
**Archivo:** `orchestration/inventarios/MASTER_INVENTORY.yml`
**Problema:** Conteos parcialmente desactualizados
**Esfuerzo:** 1h

#### Valores a Actualizar:
```yaml
backend:
  controllers: 71 -> 80+
  services: 88 -> 150+

frontend:
  hooks: 89 -> 102+
  components: 483 -> 674
  pages: 31 -> 64

database:
  tables: 123 -> 132
  views: 11 -> 17
  triggers: 90 -> Verificar (discrepancia)
```

---

### C-DOC-011: Documentar Schema Communication
**Ruta:** `docs/database/inventarios-database/`
**Problema:** Schema nuevo sin documentar
**Esfuerzo:** 1h

#### Contenido:
- Proposito del schema
- Tablas incluidas
- Relaciones con otros schemas

---

### C-DOC-012: Actualizar Inventario Triggers
**Archivo:** `docs/database/inventarios-database/`
**Problema:** Error de conteo (90 doc vs 50 real)
**Esfuerzo:** 2h

#### Accion:
- Re-inventariar todos los triggers reales
- Corregir documentacion

---

### C-DOC-013: Documentar Mecanicas Adicionales M1-M2
**Ruta:** `docs/frontend/mechanics/`
**Problema:** 3 mecanicas implementadas no documentadas
**Esfuerzo:** 2h

#### Mecanicas:
- M1: MapaConceptual
- M1: Emparejamiento
- M2: LecturaInferencial

---

### C-DOC-014: Clarificar Estado Mecanicas M5
**Ruta:** `docs/01-fase-alcance-inicial/`
**Problema:** 2 mecanicas documentadas no implementadas
**Esfuerzo:** 30min

#### Mecanicas:
- podcast_reflexivo
- diario_reflexivo

#### Accion:
- Confirmar si estan en backlog o eliminadas
- Actualizar documentacion segun decision

---

### C-DOC-015: Actualizar BACKEND_INVENTORY.yml
**Archivo:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
**Problema:** Conteos desactualizados
**Esfuerzo:** 30min

---

## 3. CORRECCIONES P2 - MEDIAS

### C-DOC-016: Documentar Modulo Social (Backend)
**Esfuerzo:** 3h

### C-DOC-017: Documentar Mecanicas M1-M5 Completas
**Esfuerzo:** 6h

### C-DOC-018: Documentar Componentes Frontend (118+)
**Esfuerzo:** 4h

### C-DOC-019: Actualizar FRONTEND_INVENTORY.yml
**Esfuerzo:** 1h

### C-DOC-020: Documentar Views Nuevas Database
**Esfuerzo:** 2h

### C-DOC-021: Unificar Rutas Duplicadas Auth
**Esfuerzo:** 2h

---

## 4. MATRIZ DE DEPENDENCIAS

```
C-DOC-001 (FEATURES) ─┬─> C-DOC-002 (README)
                      └─> C-DOC-010 (MASTER_INVENTORY)

C-DOC-003 (Teacher API) ──> C-DOC-006 (API.md update)

C-DOC-005 (DB Tables) ──> C-DOC-011 (Communication schema)

C-DOC-007 (Teacher Pages) ──> C-DOC-004 (Student Portal)

C-DOC-012 (Triggers) ─┬─> C-DOC-010 (MASTER_INVENTORY)
                      └─> C-DOC-005 (DB Tables)
```

---

## 5. CHECKLIST DE VALIDACION

### Pre-Implementacion:
- [ ] Todos los archivos fuente identificados
- [ ] Rutas de destino verificadas
- [ ] Sin conflictos de dependencias

### Post-Implementacion:
- [ ] Links internos funcionando
- [ ] Valores numericos consistentes
- [ ] Fechas actualizadas
- [ ] Sin duplicacion de informacion

---

## 6. ORDEN DE EJECUCION RECOMENDADO

### Bloque 1 (Sin dependencias):
1. C-DOC-001: FEATURES-IMPLEMENTADAS.md
2. C-DOC-003: Teacher Module docs
3. C-DOC-005: Database tables
4. C-DOC-012: Triggers inventory

### Bloque 2 (Depende de Bloque 1):
5. C-DOC-002: README.md
6. C-DOC-006: API.md update
7. C-DOC-010: MASTER_INVENTORY.yml

### Bloque 3 (Paralelo):
8. C-DOC-004: Student Portal
9. C-DOC-007: Teacher duplications
10. C-DOC-008: Admin pages location

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
