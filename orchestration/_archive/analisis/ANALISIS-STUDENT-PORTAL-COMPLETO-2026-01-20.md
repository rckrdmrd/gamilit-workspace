# ANALISIS INTEGRAL DEL STUDENT PORTAL - GAMILIT

**ID:** TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS
**Fecha:** 2026-01-20
**Analista:** @PERFIL_ORQUESTADOR
**Proyecto:** gamilit
**Metodologia:** CAPVED (Contexto, Analisis, Planeacion, Validacion, Ejecucion, Documentacion)
**Estado:** EN PROGRESO - FASE ANALISIS

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo de la Tarea

Realizar un analisis detallado de la documentacion y definiciones de todas las paginas del portal de estudiantes (Student Portal) del frontend de gamilit, identificando:

- Definiciones de funcionalidades y acciones por componente
- Consumo de APIs y coherencia con backend
- Funcionalidades de exportacion (PDF/Excel) y multimedia
- Gaps en documentacion
- Plan de subtareas con dependencias CAPVED

### 1.2 Metricas del Analisis

| Metrica | Valor |
|---------|-------|
| **Paginas analizadas** | 27 (15 principales + 12 complementarias) |
| **Componentes identificados** | 463+ |
| **Hooks personalizados** | 12+ |
| **APIs consumidas** | 25+ categorias |
| **Endpoints backend relevantes** | 80+ |
| **Gaps de coherencia identificados** | 8 (2 criticos, 2 altos, 2 medios, 2 bajos) |
| **Gaps documentados previamente** | 8 (5 resueltos + 3 en orchestration) |

---

## 2. INVENTARIO DE PAGINAS DEL STUDENT PORTAL

### 2.1 Paginas Principales (15)

| # | Pagina | Ruta | Proposito | Estado |
|---|--------|------|-----------|--------|
| 1 | **DashboardComplete** | `/dashboard` | Dashboard principal con progreso, modulos, misiones | Funcional |
| 2 | **ExercisePage** | `/exercises/:exerciseId` | Resolucion de ejercicios con 20+ mecanicas | Funcional |
| 3 | **AssignmentsPage** | `/assignments` | Hub de tareas asignadas por profesor | Funcional |
| 4 | **AssignmentDetailPage** | `/assignments/:id` | Detalle de tarea con ejercicios | Funcional |
| 5 | **ModuleDetailPage** | `/modules/:moduleId` | Vista de modulo con ejercicios y progreso | Funcional |
| 6 | **GamificationPage** | `/gamification` | Dashboard de gamificacion (rangos, economia, logros) | Funcional |
| 7 | **ProfilePage** | `/profile` | Perfil con estadisticas generales | Funcional |
| 8 | **SettingsPage** | `/settings` | Configuracion de preferencias | Parcial (95%) |
| 9 | **MissionsPage** | `/missions` | Misiones diarias/semanales | Funcional |
| 10 | **LeaderboardPage** | `/leaderboard` | Rankings y comparacion | Funcional |
| 11 | **ShopPage** | `/shop` | Tienda de cosmeticos y power-ups | Funcional |
| 12 | **InventoryPage** | `/inventory` | Inventario de items | Funcional |
| 13 | **GuildsPage** | `/guilds` | Gremios/comunidades | Funcional |
| 14 | **FriendsPage** | `/friends` | Lista de amigos | Funcional |
| 15 | **AchievementsPage** | `/achievements` | Sistema de logros | Funcional |

### 2.2 Paginas Complementarias (12)

| # | Pagina | Proposito | Estado |
|---|--------|-----------|--------|
| 16 | NotificationsPage | Centro de notificaciones | Funcional |
| 17 | NotificationPreferencesPage | Preferencias de notificaciones | Funcional |
| 18 | EnhancedProfilePage | Perfil mejorado (alternativa) | Funcional |
| 19 | TwoFactorAuthPage | Autenticacion 2FA | Funcional |
| 20 | EmailVerificationPage | Verificacion de email | Funcional |
| 21 | PasswordRecoveryPage | Recuperacion de contrasena | Funcional |
| 22 | PasswordResetPage | Restablecer contrasena | Funcional |
| 23 | DeviceManagementSection | Gestion de dispositivos | Funcional |
| 24 | NotFoundPage | Pagina 404 | Funcional |
| 25 | LoginPage | Inicio de sesion | Funcional |
| 26 | RegisterPage | Registro de usuario | Funcional |
| 27 | ForgotPasswordPage | Olvide mi contrasena | Funcional |

---

## 3. ANALISIS DE COMPONENTES POR PAGINA

### 3.1 DashboardComplete (Dashboard Principal)

**Componentes:**
- `GamifiedHeader` - Encabezado con datos de usuario
- `EnhancedStatsGrid` - Grid de estadisticas del detective
- `MissionsPanel` - Panel de misiones activas
- `ModulesSection` - Seccion de modulos disponibles
- `RecentActivityPanel` - Panel de actividad reciente
- `RankProgressWidget` - Widget de progreso de rango Maya
- `QuickActionsWidget` - Acciones rapidas

**Hooks:**
- `useAuth()` - Autenticacion
- `useDashboardData()` - Datos consolidados del dashboard
- `useMissions()` - Misiones disponibles
- `useUserModules()` - Modulos del usuario
- `useRecentActivities()` - Actividades recientes
- `useUserGamification()` - Datos de gamificacion
- `useUserClassroom()` - Aula del usuario

**APIs Consumidas:**
- `GET /gamification/users/{userId}/ml-coins`
- `GET /gamification/ranks/users/{userId}/rank-progress`
- `GET /gamification/users/{userId}/achievements`
- `GET /progress/users/{userId}/summary`
- `GET /gamification/missions/daily|weekly`
- `GET /educational/users/{userId}/modules`
- `GET /progress/users/{userId}/recent-activities`

### 3.2 ExercisePage (Resolucion de Ejercicios)

**Componentes:**
- `GamifiedHeader` - Encabezado
- `DetectiveCard`, `DetectiveButton` - UI tematica
- `ScoreDisplay`, `TimerWidget`, `ProgressTracker` - Indicadores
- `HintSystem`, `FeedbackModal` - Sistema de pistas
- `PowerUpBar` - Barra de power-ups
- Mecanicas dinamicas (20+ tipos)

**Hooks:**
- `useAuth()` - Autenticacion
- `useUserGamification()` - Gamificacion
- `useExerciseAutoSave()` - Auto-guardado
- `useExercisePowerUps()` - Power-ups

**APIs Consumidas:**
- `GET /educational/exercises/{exerciseId}`
- `POST /educational/exercises/{exerciseId}/save`
- `POST /educational/exercises/{exerciseId}/submit`
- `GET /educational/exercises/{exerciseId}/hints`

**Mecanicas Soportadas (33):**
- **M1-M3 Basicas (23):** SelectivoMultiple, RellenarEspacios, VerdaderoFalso, Ordenamiento, Asociacion, ConstruccionHipotesis, PuzzleContexto, RuedaInferencias, DetectiveTextual, AnalisisTexto, etc.
- **M4 Creativas (5):** VerificadorFakeNews, InfografiaInteractiva, QuizTikTok, NavegacionHipertextual, AnalisisMemes
- **M5 Multimedia (3):** DiarioMultimedia, ComicDigital, VideoCarta

### 3.3 ProfilePage / SettingsPage

**ProfilePage Componentes:**
- `GamifiedHeader`, `DetectiveCard`, `RankBadge`
- Estadisticas dinamicas (ML Coins, logros, ejercicios)

**SettingsPage Secciones:**
1. Profile - Avatar, nombre, biografia
2. Account - Email, cambio de contrasena
3. Preferences - Tema, idioma, notificaciones
4. Privacy - Visibilidad de perfil
5. Connected Accounts - Google, GitHub

**APIs Consumidas:**
- `GET /users/{userId}/statistics`
- `PUT /profile/update`
- `PUT /profile/password`
- `PUT /profile/preferences`
- `POST /profile/avatar`

---

## 4. GAPS DE COHERENCIA IDENTIFICADOS

### 4.1 GAPS CRITICOS (Funcionalidad Potencialmente Rota)

#### GAP-SP-001: Ruta de Rango Inconsistente
**Severidad:** CRITICO
**Frontend espera:**
```typescript
/gamification/users/{userId}/rank
```
**Backend proporciona:**
```typescript
/gamification/ranks/current (usa usuario autenticado)
```
**Impacto:** Frontend podria fallar al obtener rango actual
**Accion:** Verificar y alinear rutas

#### GAP-SP-002: Estructura de Misiones Triple-wrapped
**Severidad:** CRITICO
**Frontend espera:**
```typescript
response.data.data.missions  // Triple wrapping
```
**Backend probablemente retorna:**
```typescript
{ data: { missions: [...] } } // o { missions: [...] }
```
**Impacto:** Parsing incorrecto de misiones
**Accion:** Normalizar estructura de respuesta

### 4.2 GAPS ALTOS (Type Mismatch)

#### GAP-SP-003: Achievements con Wrapping Innecesario
**Severidad:** ALTO
**Backend retorna:**
```typescript
return { data: result }  // Wrapping adicional
```
**Frontend maneja defensivamente:**
```typescript
if (Array.isArray(data)) { ... }
else if (data?.data?.achievements) { ... }
else if (data?.achievements) { ... }
```
**Impacto:** Code smell, mantenimiento dificil
**Accion:** Remover wrapping en backend

#### GAP-SP-004: Nomenclatura Inconsistente snake_case/camelCase
**Severidad:** ALTO
**Backend:** `current_balance`, `total_earned`, `avatar_url`, `display_name`
**Frontend espera:** `currentBalance`, `totalEarned`, `avatarUrl`, `displayName`
**Impacto:** Transformers necesarios en toda la API
**Accion:** Documentar y estandarizar

### 4.3 GAPS MEDIOS (Endpoints No Consumidos)

#### GAP-SP-005: Endpoints Consolidados No Utilizados
**Backend proporciona pero Frontend NO consume:**
- `/gamification/ranks/users/{userId}/progress` - Progreso completo
- `/gamification/ranks/users/{userId}/multipliers` - Multiplicadores
- `/progress/modules/{moduleId}/stats` - Estadisticas de modulos
- `/progress/users/{userId}/learning-path` - Ruta personalizada

**Impacto:** Multiples requests innecesarios
**Accion:** Evaluar migracion a endpoints consolidados

#### GAP-SP-006: Test Coverage Critico
**Coverage actual:** 13%
**Coverage meta:** 40%
**Gap:** -27%
**Impacto:** Alta probabilidad de regresiones
**Accion:** Plan de testing prioritario

### 4.4 GAPS BAJOS (Code Smells)

#### GAP-SP-007: Defensive Mapping en Frontend
**Descripcion:** Frontend tiene mappers defensivos debido a inconsistencia en backend
**Impacto:** Mantenimiento adicional
**Accion:** Resolver inconsistencias en backend primero

#### GAP-SP-008: Documentacion de Ejercicios Incompleta
**Descripcion:** 33 mecanicas sin documentacion detallada de entrada/salida
**Impacto:** Dificultad para nuevos desarrolladores
**Accion:** Documentar especificaciones por mecanica

---

## 5. FUNCIONALIDADES MULTIMEDIA Y EXPORTACION

### 5.1 Exportacion PDF
**Funcionalidad:** Certificados de completacion
**Endpoint:** `GET /api/v1/certificates/:id/download`
**Features:**
- PDF con codigo QR para verificacion
- Verificacion publica: `GET /api/v1/certificates/verify/:code`
- Tipos: module_completion, course_completion, achievement

### 5.2 Multimedia Soportada
**Tipos permitidos:**
- **Imagenes:** JPEG, PNG, GIF, WebP (max 5MB para avatars)
- **Videos:** MP4, WebM, MOV (max 3min para VideoCarta)
- **Audio:** MP3, WAV, OGG, M4A
- **Documentos:** PDF, DOCX, TXT (materiales de estudio)

**Componentes Multimedia:**
- `MediaUploader.tsx` - Carga de archivos (50MB max)
- `useVideoRecorder.ts` - Grabacion de video webcam
- `useAudioRecorder.ts` - Grabacion de audio

**Endpoints:**
- `POST /media/upload` - Subir archivo
- `GET /media/:id` - Descargar archivo
- `DELETE /media/:id` - Eliminar archivo

### 5.3 Sistema de Revision Manual (M4-M5)
**Ejercicios que requieren revision manual:**
- DiarioMultimedia (texto + imagen + audio)
- ComicDigital (image + text)
- VideoCarta (video grabado max 3min)
- AnalisisMemes

**Flujo:**
1. Estudiante envia ejercicio creativo
2. Backend crea registro en `manual_reviews` (PENDING)
3. Docente evalua con rubrica
4. Backend actualiza estado a REVIEWED
5. Estudiante recibe feedback y puntuacion

---

## 6. DOCUMENTACION EXISTENTE - ESTADO

### 6.1 Gaps Documentados (docs/95-guias-desarrollo/student-portal/gaps/)

| Gap ID | Titulo | Estado | Fecha |
|--------|--------|--------|-------|
| STUDENT-GAP-001 | Misiones no otorgan recompensas | ✅ RESUELTO | 2025-11-24 |
| STUDENT-GAP-002 | Misiones no actualizan progreso | ✅ RESUELTO | 2025-11-29 |
| STUDENT-GAP-006 | Perfil stats hardcodeadas | ✅ RESUELTO | 2025-11-24 |
| STUDENT-GAP-007 | Settings no persiste | ✅ RESUELTO | 2025-11-24 |
| STUDENT-GAP-008 | Backend getUserStatistics mock | ✅ RESUELTO | 2025-11-24 |

### 6.2 Documentacion en Orchestration

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| FRONTEND_INVENTORY.yml | Inventario consolidado (4,600+ lineas) | Actualizado 2026-01-16 |
| BACKEND_INVENTORY.yml | Inventario backend (612 endpoints) | Actualizado |
| DATABASE_INVENTORY.yml | Inventario BD (16 schemas, 135+ tablas) | Actualizado |
| GAP-011-ENDPOINTS-COMPLETION-SUMMARY.md | 80+ endpoints agregados | ✅ COMPLETADO |

### 6.3 Documentacion Faltante o Incompleta

| Tipo | Descripcion | Prioridad |
|------|-------------|-----------|
| Especificaciones de mecanicas | 33 mecanicas sin spec detallada | P1 |
| Documentacion de DTOs | Coherencia FE-BE no documentada | P1 |
| Guia de desarrollo Student Portal | README desactualizado (2025-11-29) | P2 |
| Plan de testing | 0 tests E2E, coverage 13% | P0 |

---

## 7. PLAN DE SUBTAREAS - METODOLOGIA CAPVED

### 7.1 FASE 1: Correccion de Gaps Criticos (P0)

#### SUBTAREA 1.1: Alinear Ruta de Rango (GAP-SP-001)
**CAPVED:**
- **C:** Gap entre frontend `/users/{userId}/rank` y backend `/ranks/current`
- **A:** Impacto en DashboardComplete, GamificationPage, ProfilePage
- **P:** Opcion A: Agregar endpoint en backend | Opcion B: Modificar frontend
- **V:** Build + lint + test manual de flujos de rango
- **E:** Implementar cambio seleccionado
- **D:** Actualizar documentacion de API

**Dependencias:** Ninguna
**Estimacion:** 2h
**Archivos:**
- Backend: `ranks.controller.ts`
- Frontend: `gamification.api.ts`

#### SUBTAREA 1.2: Normalizar Estructura de Misiones (GAP-SP-002)
**CAPVED:**
- **C:** Frontend espera triple wrapping en respuesta de misiones
- **A:** Impacto en MissionsPage, DashboardComplete
- **P:** Normalizar respuesta backend a `{ missions: [...] }`
- **V:** Build + verificar parsing en frontend
- **E:** Modificar missions.controller.ts y missionsAPI.ts
- **D:** Actualizar spec de API

**Dependencias:** Ninguna
**Estimacion:** 2h
**Archivos:**
- Backend: `missions.controller.ts`
- Frontend: `missionsAPI.ts`

### 7.2 FASE 2: Resolucion de Gaps Altos (P1)

#### SUBTAREA 2.1: Remover Wrapping en Achievements (GAP-SP-003)
**Dependencias:** FASE 1 completada
**Estimacion:** 1.5h

#### SUBTAREA 2.2: Documentar Estandar de Nomenclatura (GAP-SP-004)
**Dependencias:** Ninguna
**Estimacion:** 2h

#### SUBTAREA 2.3: Plan de Testing Prioritario (GAP-SP-006)
**Dependencias:** Ninguna
**Estimacion:** 4h (planning) + 8h (ejecucion)

### 7.3 FASE 3: Optimizaciones (P2)

#### SUBTAREA 3.1: Evaluar Migracion a Endpoints Consolidados (GAP-SP-005)
**Dependencias:** FASE 1 y 2 completadas
**Estimacion:** 4h

#### SUBTAREA 3.2: Documentar Especificaciones de Mecanicas (GAP-SP-008)
**Dependencias:** Ninguna
**Estimacion:** 8h (2h por cada grupo M1-M3, M4, M5)

### 7.4 FASE 4: Documentacion y Limpieza

#### SUBTAREA 4.1: Actualizar README de Student Portal
**Dependencias:** FASES 1-3 completadas
**Estimacion:** 2h

#### SUBTAREA 4.2: Purgar Documentacion Obsoleta
**Dependencias:** Ninguna
**Estimacion:** 1h

---

## 8. ORDEN DE EJECUCION LOGICO

```
FASE 1 (P0 - Criticos) - Paralelo donde sea posible
├── SUBTAREA 1.1: Alinear Ruta de Rango
└── SUBTAREA 1.2: Normalizar Estructura Misiones

FASE 2 (P1 - Altos) - Secuencial dependiente de FASE 1
├── SUBTAREA 2.1: Remover Wrapping Achievements (depende de 1.1)
├── SUBTAREA 2.2: Documentar Estandar Nomenclatura (paralelo)
└── SUBTAREA 2.3: Plan de Testing (paralelo)

FASE 3 (P2 - Optimizaciones) - Secuencial dependiente de FASE 2
├── SUBTAREA 3.1: Evaluar Endpoints Consolidados (depende de 2.1, 2.2)
└── SUBTAREA 3.2: Documentar Mecanicas (paralelo)

FASE 4 (Documentacion) - Final
├── SUBTAREA 4.1: Actualizar README (depende de FASE 3)
└── SUBTAREA 4.2: Purgar Obsoletos (paralelo)
```

### 8.1 Timeline Estimado

| Fase | Subtareas | Estimacion | Acumulado |
|------|-----------|------------|-----------|
| FASE 1 | 1.1, 1.2 | 4h | 4h |
| FASE 2 | 2.1, 2.2, 2.3 | 14h | 18h |
| FASE 3 | 3.1, 3.2 | 12h | 30h |
| FASE 4 | 4.1, 4.2 | 3h | 33h |
| **TOTAL** | **9 subtareas** | **33h** | - |

---

## 9. PERFILES DE AGENTE REQUERIDOS

| Subtarea | Perfil Recomendado |
|----------|-------------------|
| 1.1, 1.2, 2.1 | @PERFIL_BACKEND + @PERFIL_FRONTEND |
| 2.2, 4.1, 4.2 | @PERFIL_DOCUMENTATION |
| 2.3 | @PERFIL_TESTING |
| 3.1 | @PERFIL_ARCHITECT |
| 3.2 | @PERFIL_REQUIREMENTS + @PERFIL_DOCUMENTATION |

---

## 10. CRITERIOS DE ACEPTACION GLOBALES

### 10.1 Para Cada Subtarea
- [ ] Build exitoso (backend + frontend)
- [ ] Lint sin errores
- [ ] Tests relevantes pasando
- [ ] Documentacion actualizada
- [ ] Inventarios sincronizados

### 10.2 Para la Tarea Completa
- [ ] Todos los gaps criticos resueltos
- [ ] Coherencia FE-BE al 100% en endpoints documentados
- [ ] Test coverage >= 25% (incremental desde 13%)
- [ ] README actualizado con fecha actual
- [ ] Documentacion obsoleta purgada
- [ ] _INDEX.yml de tareas actualizado

---

## 11. REFERENCIAS

### Documentacion Consultada
- `/orchestration/inventarios/FRONTEND_INVENTORY.yml`
- `/orchestration/inventarios/BACKEND_INVENTORY.yml`
- `/docs/95-guias-desarrollo/student-portal/README.md`
- `/orchestration/reportes/gaps/GAP-011-ENDPOINTS-COMPLETION-SUMMARY.md`

### Archivos Clave del Frontend Student Portal
- `/apps/frontend/src/apps/student/pages/` - Paginas
- `/apps/frontend/src/apps/student/components/` - Componentes
- `/apps/frontend/src/apps/student/hooks/` - Hooks
- `/apps/frontend/src/lib/api/` - APIs

### Archivos Clave del Backend
- `/apps/backend/src/modules/gamification/` - Gamificacion
- `/apps/backend/src/modules/educational/` - Educativo
- `/apps/backend/src/modules/progress/` - Progreso

---

**Documento generado:** 2026-01-20
**Proxima actualizacion:** Al completar FASE 1
**Estado:** EN PROGRESO - FASE ANALISIS COMPLETADA
