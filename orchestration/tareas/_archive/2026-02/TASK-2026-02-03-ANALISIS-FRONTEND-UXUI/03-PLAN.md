# FASE P - PLAN DE EJECUCIÓN

**Tarea:** TASK-2026-02-03-ANALISIS-FRONTEND-UXUI
**Fecha:** 2026-02-03
**Perfil:** Frontend/UX-UI Analyst
**Modo:** @ANALYSIS (C+A+P) - Planificación sin ejecución

---

## ESTRUCTURA DEL PLAN

Este plan está organizado en **6 FASES principales**, cada una con **subtareas en múltiples niveles**.
Cada subtarea sigue el ciclo **CAPVED** y puede ser ejecutada por subagentes en paralelo cuando no hay dependencias.

```
PLAN-MAESTRO/
├── FASE-1: Validación de Componentes (13 subtareas)
├── FASE-2: Validación de Páginas y Routing (8 subtareas)
├── FASE-3: Validación de Flujos UX (7 subtareas)
├── FASE-4: Validación Frontend vs BD (6 subtareas)
├── FASE-5: Purga de Documentación (5 subtareas)
└── FASE-6: Integración de Definiciones (9 subtareas)
```

**Total:** 48 subtareas | **Paralelizables:** 32 | **Secuenciales:** 16

---

# ═══════════════════════════════════════════════════════════════════════════════
# FASE 1: VALIDACIÓN DE COMPONENTES
# ═══════════════════════════════════════════════════════════════════════════════

## FASE-1: Validación de Componentes

**Objetivo:** Auditar 495+ componentes y documentar gaps
**Duración estimada:** 3h
**Subagentes recomendados:** 4 en paralelo

---

### SUBTASK-1.1: Auditar shared/components

**ID:** ST-1.1
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Tareas Principales

| ID | Tarea | CAPVED | Entregable |
|----|-------|--------|------------|
| ST-1.1.1 | Auditar componentes base (Button, Input, etc.) | C+A | Lista de 69 componentes con estado |
| ST-1.1.2 | Verificar documentación JSDoc | A | % de cobertura JSDoc |
| ST-1.1.3 | Identificar componentes sin tests | A | Lista de componentes sin test |
| ST-1.1.4 | Generar inventario actualizado | D | SHARED-COMPONENTS-INVENTORY.yml |

#### Nivel 2: Subtareas de ST-1.1.1

| ID | Subtarea | Archivos |
|----|----------|----------|
| ST-1.1.1.a | Auditar shared/components/base/ | ~20 archivos |
| ST-1.1.1.b | Auditar shared/components/layout/ | ~10 archivos |
| ST-1.1.1.c | Auditar shared/components/common/ | ~15 archivos |
| ST-1.1.1.d | Auditar shared/components/feedback/ | ~8 archivos |
| ST-1.1.1.e | Auditar shared/components/loading/ | ~6 archivos |
| ST-1.1.1.f | Auditar shared/components/mechanics/ | ~10 archivos |

**Criterios de Aceptación:**
- [ ] 100% componentes catalogados
- [ ] Gaps documentados en matriz
- [ ] Componentes deprecados identificados

---

### SUBTASK-1.2: Auditar features/auth

**ID:** ST-1.2
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí (con ST-1.1, ST-1.3, ST-1.4)

#### Nivel 1: Tareas Principales

| ID | Tarea | CAPVED | Entregable |
|----|-------|--------|------------|
| ST-1.2.1 | Auditar 16 componentes auth | C+A | Lista con estado |
| ST-1.2.2 | Verificar 5 hooks auth | A | Matriz hooks vs specs |
| ST-1.2.3 | Validar authStore vs ET-AUTH-* | V | Reporte coherencia |
| ST-1.2.4 | Verificar flujos 2FA | A | Checklist 2FA |

**Criterios de Aceptación:**
- [ ] Coherencia auth ≥ 95%
- [ ] Todos los flujos mapeados
- [ ] ET files actualizados identificados

---

### SUBTASK-1.3: Auditar features/gamification

**ID:** ST-1.3
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Tareas Principales

| ID | Tarea | CAPVED | Entregable |
|----|-------|--------|------------|
| ST-1.3.1 | Auditar gamification/achievements | C+A | 12 componentes |
| ST-1.3.2 | Auditar gamification/battles | C+A | 8 componentes |
| ST-1.3.3 | Auditar gamification/economy | C+A | 14 componentes (CRÍTICO) |
| ST-1.3.4 | Auditar gamification/leaderboard | C+A | 6 componentes |
| ST-1.3.5 | Auditar gamification/missions | C+A | 10 componentes |
| ST-1.3.6 | Auditar gamification/ranks | C+A | 8 componentes |
| ST-1.3.7 | Auditar gamification/social | C+A | 16 componentes |

#### Nivel 2: Subtareas de ST-1.3.3 (Economy - CRÍTICO)

| ID | Subtarea | Componentes | Prioridad |
|----|----------|-------------|-----------|
| ST-1.3.3.a | Auditar Shop/* | 6 | P1 |
| ST-1.3.3.b | Auditar Wallet/* | 3 | P1 |
| ST-1.3.3.c | Auditar Inventory/* | 3 | P1 |
| ST-1.3.3.d | Auditar Analytics/* | 2 | P2 |
| ST-1.3.3.e | Verificar economyStore | 1 store | P1 |
| ST-1.3.3.f | Mapear economy API | 15 endpoints | P1 |

**Criterios de Aceptación:**
- [ ] 74+ componentes catalogados
- [ ] Stores documentados
- [ ] Gaps de economía priorizados

---

### SUBTASK-1.4: Auditar features/mechanics

**ID:** ST-1.4
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Tareas por Módulo

| ID | Módulo | Mecánicas | Estado Esperado |
|----|--------|-----------|-----------------|
| ST-1.4.1 | M1 - Literal | 7 | 100% doc |
| ST-1.4.2 | M2 - Inferencial | 6 | 100% doc |
| ST-1.4.3 | M3 - Crítica | 5 | 100% doc |
| ST-1.4.4 | M4 - Digital | 5 | 95% doc |
| ST-1.4.5 | M5 - Producción | 3 | 95% doc |
| ST-1.4.6 | Auxiliar | 4 | 90% doc |

#### Nivel 2: Verificación por Mecánica (Ejemplo M1)

| ID | Mecánica | Componentes | Validar |
|----|----------|-------------|---------|
| ST-1.4.1.a | CompletarEspacios | 3 | Props, estados, eventos |
| ST-1.4.1.b | Crucigrama | 4 | Lógica de validación |
| ST-1.4.1.c | Emparejamiento | 3 | Drag & drop |
| ST-1.4.1.d | MapaConceptual | 5 | Canvas rendering |
| ST-1.4.1.e | SopaLetras | 3 | Grid interactivo |
| ST-1.4.1.f | Timeline | 4 | Ordenamiento |
| ST-1.4.1.g | VerdaderoFalso | 2 | Toggle states |

**Criterios de Aceptación:**
- [ ] 56 mecánicas verificadas
- [ ] Todas con rúbricas de scoring
- [ ] Coherencia con ET-ACT-* ≥ 95%

---

### SUBTASK-1.5: Auditar apps/admin

**ID:** ST-1.5
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Auditoría por Categoría

| ID | Categoría | Componentes | Prioridad |
|----|-----------|-------------|-----------|
| ST-1.5.1 | admin/components/dashboard | 8 | P2 |
| ST-1.5.2 | admin/components/users | 12 | P2 |
| ST-1.5.3 | admin/components/gamification | 15 | P2 |
| ST-1.5.4 | admin/components/content | 10 | P2 |
| ST-1.5.5 | admin/components/monitoring | 8 | P3 |
| ST-1.5.6 | admin/components/analytics | 12 | P2 |
| ST-1.5.7 | admin/components/advanced | 6 | P3 |
| ST-1.5.8 | admin/pages (18) | 18 | P2 |

**Criterios de Aceptación:**
- [ ] 100+ componentes admin auditados
- [ ] 18 páginas verificadas vs rutas
- [ ] Gaps de ET-ADM-* documentados

---

### SUBTASK-1.6: Auditar apps/student

**ID:** ST-1.6
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Auditoría por Categoría

| ID | Categoría | Componentes | Estado |
|----|-----------|-------------|--------|
| ST-1.6.1 | student/components/dashboard | 10 | Verificar |
| ST-1.6.2 | student/components/exercise | 15 | Verificar |
| ST-1.6.3 | student/components/gamification | 12 | Verificar |
| ST-1.6.4 | student/components/achievements | 8 | Verificar |
| ST-1.6.5 | student/components/progress | 10 | Verificar |
| ST-1.6.6 | student/pages (28) | 28 | CRÍTICO |

#### Nivel 2: Páginas Estudiante (Detalle)

| ID | Página | Ruta | Documentada |
|----|--------|------|-------------|
| ST-1.6.6.a | DashboardComplete | /dashboard | ✅ |
| ST-1.6.6.b | ExercisePage | /exercises/:id | ✅ |
| ST-1.6.6.c | LeaderboardPage | /leaderboard | ✅ |
| ST-1.6.6.d | MissionsPage | /missions | ✅ |
| ST-1.6.6.e | ShopPage | /shop | ❌ GAP |
| ST-1.6.6.f | InventoryPage | /inventory | ❌ GAP |
| ST-1.6.6.g | GuildsPage | /guilds | ❌ GAP |
| ST-1.6.6.h | FriendsPage | /friends | ❌ GAP |

**Criterios de Aceptación:**
- [ ] 80+ componentes auditados
- [ ] 28 páginas verificadas
- [ ] 6 gaps de rutas documentados

---

### SUBTASK-1.7: Auditar apps/teacher

**ID:** ST-1.7
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Auditoría

| ID | Tarea | Componentes | Estado |
|----|-------|-------------|--------|
| ST-1.7.1 | Auditar teacher/components | 70+ | 100% esperado |
| ST-1.7.2 | Verificar teacher/pages (15) | 15 | 100% esperado |
| ST-1.7.3 | Validar APIs teacher | 130 endpoints | 87% cobertura |
| ST-1.7.4 | Verificar review-panel M4-M5 | 8 comp | Crítico |

**Criterios de Aceptación:**
- [ ] Coherencia teacher ≥ 95%
- [ ] Panel de revisión manual validado

---

### SUBTASK-1.8: Auditar apps/parent (CRÍTICO)

**ID:** ST-1.8
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí
**Prioridad:** P0

#### Nivel 1: Auditoría Completa

| ID | Tarea | Archivos | Estado |
|----|-------|----------|--------|
| ST-1.8.1 | Auditar parent/components | 20+ | 0% doc |
| ST-1.8.2 | Auditar parent/pages (4) | 4 | 0% doc |
| ST-1.8.3 | Auditar parent/api | parentAPI | 0% doc |
| ST-1.8.4 | Auditar parent/store | parentStore | 0% doc |
| ST-1.8.5 | Mapear flujos parent | 4 flujos | 0% doc |

#### Nivel 2: Detalle de Páginas Parent

| ID | Página | Ruta | Necesita |
|----|--------|------|----------|
| ST-1.8.2.a | ParentDashboardPage | /parent/dashboard | ET + US |
| ST-1.8.2.b | ParentLoginPage | /parent/login | ET |
| ST-1.8.2.c | ParentRegisterPage | /parent/register | ET + US |
| ST-1.8.2.d | ChildProgressPage | /parent/child/:id | ET + US |

**Criterios de Aceptación:**
- [ ] Inventario completo de parent portal
- [ ] Lista de ET files necesarios
- [ ] Lista de US necesarias

---

### SUBTASK-1.9: Auditar hooks compartidos

**ID:** ST-1.9
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Hooks por Ubicación

| ID | Ubicación | Hooks | Estado |
|----|-----------|-------|--------|
| ST-1.9.1 | shared/hooks/ | 13 | Documentar |
| ST-1.9.2 | features/*/hooks/ | 30+ | Documentar |
| ST-1.9.3 | apps/*/hooks/ | 15+ | Documentar |
| ST-1.9.4 | hooks/ (raíz - deprecated) | 3 | Marcar deprecated |

**Criterios de Aceptación:**
- [ ] 60+ hooks catalogados
- [ ] Deprecados identificados
- [ ] JSDoc coverage ≥ 80%

---

### SUBTASK-1.10: Auditar stores Zustand

**ID:** ST-1.10
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Stores por Feature

| ID | Feature | Stores | Documentados |
|----|---------|--------|--------------|
| ST-1.10.1 | auth | 1 | ✅ |
| ST-1.10.2 | gamification | 8 | ⚠️ 6/8 |
| ST-1.10.3 | missions | 1 | ✅ |
| ST-1.10.4 | notifications | 1 | ✅ |
| ST-1.10.5 | assignments | 1 | ⚠️ |
| ST-1.10.6 | parent | 1 | ❌ |
| ST-1.10.7 | Otros | 19 | ⚠️ |

**Criterios de Aceptación:**
- [ ] 32 stores auditados
- [ ] Estructura state/actions documentada
- [ ] Coherencia con schemas BD

---

### SUBTASK-1.11: Auditar servicios API

**ID:** ST-1.11
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Servicios por Dominio

| ID | Dominio | Archivos | Endpoints |
|----|---------|----------|-----------|
| ST-1.11.1 | services/api/auth | 3 | 40 |
| ST-1.11.2 | services/api/admin | 4 | 150 |
| ST-1.11.3 | services/api/teacher | 13 | 130 |
| ST-1.11.4 | services/api/features | 8 | 200 |
| ST-1.11.5 | services/api/core | 6 | 148 |

**Criterios de Aceptación:**
- [ ] 22 archivos API auditados
- [ ] Endpoints mapeados vs backend
- [ ] Cobertura ≥ 85%

---

### SUBTASK-1.12: Auditar tipos TypeScript

**ID:** ST-1.12
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Paralelizable:** Sí

#### Nivel 1: Tipos por Ubicación

| ID | Ubicación | Archivos | Estado |
|----|-----------|----------|--------|
| ST-1.12.1 | shared/types/ | 21 | Verificar |
| ST-1.12.2 | features/*/types/ | 15+ | Verificar |
| ST-1.12.3 | apps/*/types/ | 5+ | Verificar |
| ST-1.12.4 | types/ (raíz) | 3 | Verificar |

**Criterios de Aceptación:**
- [ ] Tipos sincronizados con backend
- [ ] Sin any explícito
- [ ] Zod schemas alineados

---

### SUBTASK-1.13: Consolidar inventario componentes

**ID:** ST-1.13
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-1.1 a ST-1.12
**Paralelizable:** No (requiere resultados previos)

#### Nivel 1: Consolidación

| ID | Tarea | Input | Output |
|----|-------|-------|--------|
| ST-1.13.1 | Consolidar auditorías | ST-1.1 a ST-1.12 | CONSOLIDADO-COMPONENTES.yml |
| ST-1.13.2 | Generar matriz de gaps | Consolidado | MATRIZ-GAPS-COMPONENTES.yml |
| ST-1.13.3 | Actualizar FRONTEND_INVENTORY | Matriz | FRONTEND_INVENTORY.yml v2.0 |
| ST-1.13.4 | Crear lista de acciones | Matriz | ACCIONES-FASE-1.md |

**Criterios de Aceptación:**
- [ ] Inventario actualizado a v2.0
- [ ] Matriz de gaps completa
- [ ] Acciones priorizadas

---

# ═══════════════════════════════════════════════════════════════════════════════
# FASE 2: VALIDACIÓN DE PÁGINAS Y ROUTING
# ═══════════════════════════════════════════════════════════════════════════════

## FASE-2: Validación de Páginas y Routing

**Objetivo:** Auditar 85 páginas y 72+ rutas
**Duración estimada:** 2h
**Subagentes recomendados:** 2 en paralelo
**Dependencias:** Puede ejecutarse en paralelo con FASE-1

---

### SUBTASK-2.1: Auditar rutas públicas

**ID:** ST-2.1
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna

| ID | Ruta | Página | Estado |
|----|------|--------|--------|
| ST-2.1.1 | /login | LoginPage | Verificar |
| ST-2.1.2 | /register | RegisterPage | Verificar |
| ST-2.1.3 | /forgot-password | ForgotPasswordPage | Verificar |
| ST-2.1.4 | /reset-password | PasswordResetPage | Verificar |
| ST-2.1.5 | /verify-email | EmailVerificationPage | Verificar |
| ST-2.1.6 | /parent/login | ParentLoginPage | ❌ Sin doc |
| ST-2.1.7 | /parent/register | ParentRegisterPage | ❌ Sin doc |

---

### SUBTASK-2.2: Auditar rutas student

**ID:** ST-2.2
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna

| ID | Ruta | Documentada | Acción |
|----|------|-------------|--------|
| ST-2.2.1 | /dashboard | ✅ | Verificar |
| ST-2.2.2 | /progress | ✅ | Verificar |
| ST-2.2.3 | /exercises/:id | ✅ | Verificar |
| ST-2.2.4 | /achievements | ✅ | Verificar |
| ST-2.2.5 | /leaderboard | ✅ | Verificar |
| ST-2.2.6 | /missions | ✅ | Verificar |
| ST-2.2.7 | /shop | ❌ | Crear ET |
| ST-2.2.8 | /inventory | ❌ | Crear ET |
| ST-2.2.9 | /guilds | ❌ | Crear ET |
| ST-2.2.10 | /friends | ❌ | Crear ET |
| ST-2.2.11 | /settings/* | ⚠️ | Actualizar ET |

---

### SUBTASK-2.3: Auditar rutas teacher

**ID:** ST-2.3
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna

| ID | Ruta | Estado |
|----|------|--------|
| ST-2.3.1-15 | /teacher/* (15 rutas) | ✅ 100% documentadas |

**Criterios:** Verificar coherencia con ET-TCH-*

---

### SUBTASK-2.4: Auditar rutas admin

**ID:** ST-2.4
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna

| ID | Ruta | Documentada | Acción |
|----|------|-------------|--------|
| ST-2.4.1-16 | /admin/* (16 rutas) | ✅ | Verificar |
| ST-2.4.17 | /admin/integrations/lti | ❌ | Crear ET |
| ST-2.4.18 | /admin/audit-logs | ⚠️ | Actualizar ET |

---

### SUBTASK-2.5: Auditar rutas parent

**ID:** ST-2.5
**Perfil:** PERFIL-FRONTEND
**Dependencias:** Ninguna
**Prioridad:** P0

| ID | Ruta | Necesita |
|----|------|----------|
| ST-2.5.1 | /parent/dashboard | ET-PAR-001 + US |
| ST-2.5.2 | /parent/child/:studentId | ET-PAR-002 + US |
| ST-2.5.3 | /parent/login | ET-PAR-003 |
| ST-2.5.4 | /parent/register | ET-PAR-004 + US |

---

### SUBTASK-2.6: Verificar guards y protección

**ID:** ST-2.6
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-2.1 a ST-2.5

| ID | Guard | Rutas Protegidas | Verificar |
|----|-------|------------------|-----------|
| ST-2.6.1 | AuthGuard | Todas privadas | Funcionamiento |
| ST-2.6.2 | RoleGuard | Por rol | Permisos |
| ST-2.6.3 | TenantGuard | Multi-tenant | Aislamiento |

---

### SUBTASK-2.7: Verificar redirects y fallbacks

**ID:** ST-2.7
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-2.1 a ST-2.6

| ID | Verificación |
|----|--------------|
| ST-2.7.1 | / → /dashboard (estudiante) |
| ST-2.7.2 | /unauthorized |
| ST-2.7.3 | /* → 404 |
| ST-2.7.4 | /teacher/resources → /teacher/dashboard (deprecated) |

---

### SUBTASK-2.8: Consolidar inventario rutas

**ID:** ST-2.8
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-2.1 a ST-2.7

**Entregables:**
- INVENTARIO-RUTAS.yml
- MATRIZ-GAPS-RUTAS.yml
- ACCIONES-FASE-2.md

---

# ═══════════════════════════════════════════════════════════════════════════════
# FASE 3: VALIDACIÓN DE FLUJOS UX
# ═══════════════════════════════════════════════════════════════════════════════

## FASE-3: Validación de Flujos UX

**Objetivo:** Validar flujos de usuario contra especificaciones
**Duración estimada:** 2h
**Subagentes recomendados:** 3 en paralelo
**Dependencias:** Puede ejecutarse en paralelo con FASE-1 y FASE-2

---

### SUBTASK-3.1: Validar flujos autenticación

**ID:** ST-3.1
**Perfil:** PERFIL-UXUI
**Dependencias:** Ninguna

| ID | Flujo | ET | Estado |
|----|-------|-----|--------|
| ST-3.1.1 | Login básico | ET-AUTH-001 | Verificar |
| ST-3.1.2 | Registro | ET-AUTH-002 | Verificar |
| ST-3.1.3 | Recuperar contraseña | ET-AUTH-003 | Verificar |
| ST-3.1.4 | 2FA | ET-AUTH-004 | Verificar |
| ST-3.1.5 | OAuth (Google, MS) | ET-AUTH-005 | Verificar |

---

### SUBTASK-3.2: Validar flujos ejercicios

**ID:** ST-3.2
**Perfil:** PERFIL-UXUI
**Dependencias:** Ninguna

| ID | Flujo | Módulos | ET |
|----|-------|---------|-----|
| ST-3.2.1 | Ejercicio autocorregible | M1-M2 | ET-ACT-* |
| ST-3.2.2 | Ejercicio manual review | M3-M5 | ET-ACT-* |
| ST-3.2.3 | Feedback inmediato | Todos | ET-ACT-007 |
| ST-3.2.4 | Navegación entre ejercicios | Todos | ET-ACT-008 |

---

### SUBTASK-3.3: Validar flujos gamificación

**ID:** ST-3.3
**Perfil:** PERFIL-UXUI
**Dependencias:** Ninguna

| ID | Flujo | ET | Estado |
|----|-------|-----|--------|
| ST-3.3.1 | Obtener XP | ET-GAM-002 | Verificar |
| ST-3.3.2 | Subir de rango | ET-GAM-001 | Verificar |
| ST-3.3.3 | Desbloquear logro | ET-GAM-005 | Verificar |
| ST-3.3.4 | Comprar en tienda | ET-GAM-003 | ❌ Sin doc |
| ST-3.3.5 | Usar comodín | ET-GAM-004 | Verificar |
| ST-3.3.6 | Completar misión | ET-GAM-008 | Verificar |

---

### SUBTASK-3.4: Validar flujos sociales

**ID:** ST-3.4
**Perfil:** PERFIL-UXUI
**Dependencias:** Ninguna
**Prioridad:** P1

| ID | Flujo | ET | Estado |
|----|-------|-----|--------|
| ST-3.4.1 | Agregar amigo | - | ❌ Sin doc |
| ST-3.4.2 | Crear guild | - | ❌ Sin doc |
| ST-3.4.3 | Unirse a guild | - | ❌ Sin doc |
| ST-3.4.4 | Peer challenge | - | ❌ Sin doc |
| ST-3.4.5 | Ver leaderboard social | ET-GAM-007 | ⚠️ Parcial |

---

### SUBTASK-3.5: Validar flujos teacher

**ID:** ST-3.5
**Perfil:** PERFIL-UXUI
**Dependencias:** Ninguna

| ID | Flujo | Estado |
|----|-------|--------|
| ST-3.5.1 | Crear asignación | ✅ Documentado |
| ST-3.5.2 | Calificar ejercicio | ✅ Documentado |
| ST-3.5.3 | Monitorear estudiantes | ✅ Documentado |
| ST-3.5.4 | Generar reporte | ✅ Documentado |
| ST-3.5.5 | Enviar mensaje | ✅ Documentado |

---

### SUBTASK-3.6: Validar flujos parent

**ID:** ST-3.6
**Perfil:** PERFIL-UXUI
**Dependencias:** Ninguna
**Prioridad:** P0

| ID | Flujo | Necesita |
|----|-------|----------|
| ST-3.6.1 | Onboarding parent | ET-PAR-001 + US |
| ST-3.6.2 | Vincular hijo | ET-PAR-002 + US |
| ST-3.6.3 | Ver progreso hijo | ET-PAR-003 + US |
| ST-3.6.4 | Recibir notificaciones | ET-PAR-004 + US |

---

### SUBTASK-3.7: Consolidar matriz flujos

**ID:** ST-3.7
**Perfil:** PERFIL-UXUI
**Dependencias:** ST-3.1 a ST-3.6

**Entregables:**
- MATRIZ-FLUJOS-UX.yml
- GAPS-FLUJOS.md
- ACCIONES-FASE-3.md

---

# ═══════════════════════════════════════════════════════════════════════════════
# FASE 4: VALIDACIÓN FRONTEND vs BD
# ═══════════════════════════════════════════════════════════════════════════════

## FASE-4: Validación Frontend vs Base de Datos

**Objetivo:** Verificar coherencia entre frontend y modelo de datos
**Duración estimada:** 1.5h
**Subagentes recomendados:** 2 en paralelo
**Dependencias:** FASE-1 completada (inventario componentes)

---

### SUBTASK-4.1: Mapear stores vs schemas

**ID:** ST-4.1
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-1.10

| Store | Schema BD | Coherencia |
|-------|-----------|------------|
| authStore | auth_management | Verificar |
| economyStore | gamification_system | Verificar |
| ranksStore | gamification_system | Verificar |
| achievementsStore | gamification_system | Verificar |
| friendsStore | social_features | Verificar |
| guildsStore | social_features | Verificar |
| notificationsStore | notifications | Verificar |

---

### SUBTASK-4.2: Mapear API services vs endpoints

**ID:** ST-4.2
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-1.11

| Dominio | Frontend APIs | Backend Endpoints | Cobertura |
|---------|---------------|-------------------|-----------|
| Auth | 40 | 45 | Verificar |
| Users | 25 | 30 | Verificar |
| Gamification | 95 | 120 | Verificar |
| Progress | 65 | 80 | Verificar |
| Content | 70 | 100 | Verificar |
| Social | 55 | 90 | Verificar |
| Teacher | 130 | 150 | Verificar |

---

### SUBTASK-4.3: Identificar tablas sin UI

**ID:** ST-4.3
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-4.1

| Tabla | Schema | Necesita UI | Prioridad |
|-------|--------|-------------|-----------|
| content_tags | educational_content | Sí (admin) | P2 |
| content_approvals | content_management | Sí (admin) | P2 |
| discussion_threads | social_features | Sí (student) | P1 |
| social_interactions | social_features | Opcional | P3 |
| user_follows | social_features | Sí (student) | P1 |
| message_participants | communication | Parcial | P2 |

---

### SUBTASK-4.4: Verificar tipos vs entities

**ID:** ST-4.4
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-1.12

**Verificar:**
- Tipos frontend alineados con DTOs backend
- Zod schemas coherentes con entities
- ENUMs sincronizados

---

### SUBTASK-4.5: Verificar validaciones frontend vs BD

**ID:** ST-4.5
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-4.4

**Verificar:**
- Validaciones Zod reflejan constraints BD
- Límites de campos coinciden
- Valores por defecto alineados

---

### SUBTASK-4.6: Consolidar coherencia FE-BD

**ID:** ST-4.6
**Perfil:** PERFIL-FRONTEND
**Dependencias:** ST-4.1 a ST-4.5

**Entregables:**
- MATRIZ-COHERENCIA-FE-BD.yml
- GAPS-COHERENCIA.md
- ACCIONES-FASE-4.md

---

# ═══════════════════════════════════════════════════════════════════════════════
# FASE 5: PURGA DE DOCUMENTACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

## FASE-5: Purga de Documentación Obsoleta

**Objetivo:** Limpiar documentación obsoleta o redundante
**Duración estimada:** 1h
**Subagentes recomendados:** 1 (secuencial)
**Dependencias:** FASE-1, FASE-2, FASE-3 completadas

---

### SUBTASK-5.1: Identificar tareas archivables

**ID:** ST-5.1
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** Ninguna

| Carpeta | Tareas | Acción |
|---------|--------|--------|
| tareas/2026-01-25/ | 12 | Evaluar archivo |
| tareas/2026-01-27/ | 9 | Evaluar archivo |
| tareas/2026-01-30/ | 2 | Evaluar archivo |
| tareas/2026-01-31/ | 1 | Evaluar archivo |

---

### SUBTASK-5.2: Identificar ET files obsoletos

**ID:** ST-5.2
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** FASE-1, FASE-2, FASE-3

**Criterios de obsolescencia:**
- Referencia a componentes eliminados
- Referencia a rutas deprecated
- No actualizado en >60 días
- Marcado como DRAFT sin progreso

---

### SUBTASK-5.3: Identificar US completadas sin marcar

**ID:** ST-5.3
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** FASE-3

| Épica | US Totales | Completadas | Sin Marcar |
|-------|------------|-------------|------------|
| EAI-001 | 8 | 8 | Verificar |
| EAI-002 | 8 | 8 | Verificar |
| EAI-003 | 8 | 8 | Verificar |
| EAI-004 | 8 | 8 | Verificar |
| EAI-005 | 10 | 9 | Verificar |

---

### SUBTASK-5.4: Generar lista de purga

**ID:** ST-5.4
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-5.1 a ST-5.3

**Entregable:** LISTA-PURGA-DOCUMENTACION.md
- Archivos a archivar
- Archivos a eliminar
- Archivos a actualizar
- Archivos a consolidar

---

### SUBTASK-5.5: Ejecutar purga (Plan)

**ID:** ST-5.5
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-5.4

**NOTA:** Esta subtarea solo genera el PLAN de purga.
La ejecución se hará en fase posterior.

**Entregable:** PLAN-EJECUCION-PURGA.md

---

# ═══════════════════════════════════════════════════════════════════════════════
# FASE 6: INTEGRACIÓN DE DEFINICIONES
# ═══════════════════════════════════════════════════════════════════════════════

## FASE-6: Integración de Definiciones Faltantes

**Objetivo:** Crear ET files y US faltantes identificados
**Duración estimada:** 2h
**Subagentes recomendados:** 4 en paralelo
**Dependencias:** FASE-1 a FASE-5 completadas

---

### SUBTASK-6.1: Crear ET files para Parent Portal

**ID:** ST-6.1
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-1.8
**Prioridad:** P0

| ID | ET File | Contenido |
|----|---------|-----------|
| ST-6.1.1 | ET-PAR-001 | Parent Dashboard |
| ST-6.1.2 | ET-PAR-002 | Child Progress View |
| ST-6.1.3 | ET-PAR-003 | Parent Login |
| ST-6.1.4 | ET-PAR-004 | Parent Register |
| ST-6.1.5 | ET-PAR-005 | Parent Notifications |

---

### SUBTASK-6.2: Crear ET files para Economía

**ID:** ST-6.2
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-1.3.3
**Prioridad:** P1

| ID | ET File | Contenido |
|----|---------|-----------|
| ST-6.2.1 | ET-SHOP-001 | Shop Overview |
| ST-6.2.2 | ET-SHOP-002 | Purchase Flow |
| ST-6.2.3 | ET-WALLET-001 | Wallet Management |
| ST-6.2.4 | ET-INV-001 | Inventory Management |

---

### SUBTASK-6.3: Crear ET files para Social

**ID:** ST-6.3
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-3.4
**Prioridad:** P1

| ID | ET File | Contenido |
|----|---------|-----------|
| ST-6.3.1 | ET-SOC-001 | Friends System |
| ST-6.3.2 | ET-SOC-002 | Guilds System |
| ST-6.3.3 | ET-SOC-003 | Social Interactions |
| ST-6.3.4 | ET-SOC-004 | User Follows |

---

### SUBTASK-6.4: Crear US faltantes para EXT-011

**ID:** ST-6.4
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-6.1
**Prioridad:** P0

| ID | US | Título |
|----|-----|--------|
| ST-6.4.1 | US-PAR-001 | Como padre quiero ver el progreso de mi hijo |
| ST-6.4.2 | US-PAR-002 | Como padre quiero recibir alertas de bajo rendimiento |
| ST-6.4.3 | US-PAR-003 | Como padre quiero vincular mi cuenta con mi hijo |
| ST-6.4.4 | US-PAR-004 | Como padre quiero comunicarme con el profesor |

---

### SUBTASK-6.5: Crear US faltantes para Social

**ID:** ST-6.5
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-6.3
**Prioridad:** P1

| ID | US | Título |
|----|-----|--------|
| ST-6.5.1 | US-SOC-001 | Como estudiante quiero agregar amigos |
| ST-6.5.2 | US-SOC-002 | Como estudiante quiero crear un guild |
| ST-6.5.3 | US-SOC-003 | Como estudiante quiero retar a un amigo |
| ST-6.5.4 | US-SOC-004 | Como estudiante quiero seguir a otros |

---

### SUBTASK-6.6: Actualizar BACKLOG.yml

**ID:** ST-6.6
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-6.1 a ST-6.5

**Actualizar épicas:**
- EXT-007: LTI (agregar ET files)
- EXT-008: White-Label (agregar ET files)
- EXT-009: Peer Challenges (agregar US)
- EXT-010: Parent Notifications (agregar ET/US)
- EXT-011: Parent Portal (completar)

---

### SUBTASK-6.7: Actualizar FRONTEND_INVENTORY

**ID:** ST-6.7
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-1.13

**Actualizar a v2.0:**
- Componentes: 495+ documentados
- Páginas: 85 con rutas
- Stores: 32 con schemas
- Hooks: 60+ catalogados

---

### SUBTASK-6.8: Actualizar MASTER_INVENTORY

**ID:** ST-6.8
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-6.7

**Actualizar a v5.5.0:**
- Coherencia FE-BD actualizada
- Gaps resueltos documentados
- ET files nuevos contados

---

### SUBTASK-6.9: Generar ROADMAP de ejecución

**ID:** ST-6.9
**Perfil:** PERFIL-DOCUMENTATION
**Dependencias:** ST-6.1 a ST-6.8

**Entregables:**
- ROADMAP-EJECUCION-FRONTEND.md
- ORDEN-PRIORIDADES.yml
- DEPENDENCIAS-TAREAS.yml

---

# ═══════════════════════════════════════════════════════════════════════════════
# ORDEN DE EJECUCIÓN
# ═══════════════════════════════════════════════════════════════════════════════

## Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          EJECUCIÓN PARALELA                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SPRINT 1 (Paralelo):                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   FASE-1     │  │   FASE-2     │  │   FASE-3     │                   │
│  │ Componentes  │  │   Rutas      │  │   Flujos     │                   │
│  │ (13 tasks)   │  │ (8 tasks)    │  │ (7 tasks)    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
│         │                 │                 │                            │
│         └────────────┬────┴────────────────┬┘                            │
│                      ▼                     ▼                             │
│  SPRINT 2:     ┌──────────────┐      ┌──────────────┐                   │
│                │   FASE-4     │      │   FASE-5     │                   │
│                │ Coherencia   │      │   Purga      │                   │
│                │ (6 tasks)    │      │ (5 tasks)    │                   │
│                └──────┬───────┘      └──────┬───────┘                   │
│                       │                     │                            │
│                       └─────────┬───────────┘                            │
│                                 ▼                                        │
│  SPRINT 3:               ┌──────────────┐                               │
│                          │   FASE-6     │                               │
│                          │ Integración  │                               │
│                          │ (9 tasks)    │                               │
│                          └──────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Resumen de Ejecución

| Sprint | Fases | Subtareas | Subagentes | Tiempo Est. |
|--------|-------|-----------|------------|-------------|
| Sprint 1 | FASE-1, FASE-2, FASE-3 | 28 | 4-6 paralelos | 4h |
| Sprint 2 | FASE-4, FASE-5 | 11 | 2-3 paralelos | 2h |
| Sprint 3 | FASE-6 | 9 | 2-4 paralelos | 2h |
| **TOTAL** | 6 Fases | 48 subtareas | 8 max | 8h |

---

## Criterios de Éxito del Plan

### Métricas Objetivo

| Métrica | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| Coherencia FE ↔ Docs | 85% | 95% | +10% |
| Coherencia FE ↔ BD | 79% | 90% | +11% |
| Componentes documentados | 425/495 | 495/495 | +70 |
| ET files completos | 92 | 110 | +18 |
| US documentadas | 138 | 150 | +12 |

### Definition of Done

- [ ] 100% componentes inventariados
- [ ] 100% rutas documentadas
- [ ] 100% flujos UX validados
- [ ] Coherencia FE-BD ≥ 90%
- [ ] Documentación obsoleta purgada
- [ ] ET files faltantes creados
- [ ] US faltantes creadas
- [ ] Inventarios actualizados
- [ ] ROADMAP de ejecución generado

---

**Fase P completada:** 2026-02-03
**Siguiente:** Fase V (Validación del Plan)
