# ADR-030: Convencion de Nombres de Paginas — Sufijo "Page"

**Estado:** ENMENDADO
**Fecha original:** 2026-01-25
**Fecha enmienda:** 2026-02-19
**Contexto original:** TASK-2026-01-30-CORRECCION-INTEGRAL (Fase 3.2)
**Contexto enmienda:** TASK-2026-02-19-ESTANDARIZACION-PORTALES (Track F — Naming Analysis)

---

## Contexto Original (2026-01-25)

Los componentes de pagina en el frontend usaban el patron `{Nombre}Page.tsx`:

- `TeacherDashboardPage.tsx`
- `TeacherAnalyticsPage.tsx`
- `StudentProfilePage.tsx`
- etc.

Se identificaron problemas de redundancia y verbosidad. La decision fue remover el sufijo "Page" de todos los componentes en directorios `pages/`.

## Problema Detectado (2026-02-19)

Un analisis de consistencia (Track F) revelo que la decision original **solo se aplico al portal Teacher**. El resto del codebase nunca fue migrado:

| Portal | Total Paginas | Con sufijo "Page" | Sin sufijo "Page" | Cumple ADR original |
|--------|--------------|-------------------|-------------------|---------------------|
| Teacher | 19 | 0 | 19 | SI |
| Admin | 19 | 19 | 0 | NO |
| Student | ~21 | ~18 | ~3 | NO |
| Parent | 4 | 4 | 0 | NO |
| Root (src/pages/) | 5 | 5 | 0 | NO |

**Resultado:** 46 de 68 paginas (~68%) retienen el sufijo "Page". Solo 19 paginas del Teacher portal (~28%) siguen la convencion original. La decision nunca fue implementada de forma completa.

### Archivos que NO cumplen (ejemplos representativos)

**Admin (19/19 con sufijo):**
`AdminDashboardPage.tsx`, `AdminUsersPage.tsx`, `AdminRolesPage.tsx`, `AdminSettingsPage.tsx`, `AdminAnalyticsPage.tsx`, `AdminContentPage.tsx`, `AdminReportsPage.tsx`, `AdminAuditLogsPage.tsx`, `AdminGamificationPage.tsx`, `AdminMonitoringPage.tsx`, `AdminAdvancedPage.tsx`, `AdminAlertsPage.tsx`, `AdminNotificationsPage.tsx`, `AdminNotificationPreferencesPage.tsx`, `AdminInstitutionsPage.tsx`, `AdminAssignmentsPage.tsx`, `AdminProgressPage.tsx`, `AdminClassroomTeacherPage.tsx`, `AdminExerciseCreatePage.tsx`

**Student (con sufijo):**
`AchievementsPage.tsx`, `AssignmentsPage.tsx`, `ShopPage.tsx`, `ExercisePage.tsx`, `LeaderboardPage.tsx`, `FriendsPage.tsx`, `GuildsPage.tsx`, `InventoryPage.tsx`, `LearningPage.tsx`, `MissionsPage.tsx`, `SettingsPage.tsx`, `EnhancedProfilePage.tsx`, `ModuleDetailPage.tsx`, `NotificationsPage.tsx`, `NotificationPreferencesPage.tsx`, `PasswordResetPage.tsx`, `EmailVerificationPage.tsx`, `NotFoundPage.tsx`

**Parent (4/4 con sufijo):**
`ParentDashboardPage.tsx`, `ParentLoginPage.tsx`, `ParentRegisterPage.tsx`, `ChildProgressPage.tsx`

### Archivos que SI cumplen (Teacher, 19/19 sin sufijo)

`TeacherDashboard.tsx`, `TeacherAnalytics.tsx`, `TeacherAssignments.tsx`, `TeacherClasses.tsx`, `TeacherStudents.tsx`, `TeacherGamification.tsx`, `TeacherSettings.tsx`, `TeacherAlerts.tsx`, `TeacherAlertConfig.tsx`, `TeacherReports.tsx`, `TeacherProgress.tsx`, `TeacherContent.tsx`, `TeacherContentManagement.tsx`, `TeacherCommunication.tsx`, `TeacherMonitoring.tsx`, `TeacherNotifications.tsx`, `TeacherNotificationPreferences.tsx`, `TeacherReviewPanel.tsx`, `TeacherExerciseResponses.tsx`

## Decision Enmendada

**Se revierte la decision original. El sufijo "Page" se declara como la convencion canonica para archivos de pagina.**

### Justificacion

1. **Mayoria absoluta:** 46/68 paginas (~68%) ya usan el sufijo "Page". Migrar la mayoria hacia la minoria seria irrazonable.
2. **Claridad explicita:** `AdminDashboardPage.tsx` es inmediatamente comprensible sin depender del contexto del directorio (e.g., al buscar en el editor, en imports, en stack traces).
3. **Costo de migracion prohibitivo:** Renombrar 19 archivos Teacher + actualizar App.tsx routes, imports en componentes, barrel files, y tests es un cambio masivo con alto riesgo de regresion y sin beneficio funcional.
4. **Consistencia real vs teorica:** La consistencia que importa es la que existe en el codigo. El codigo es consistente en "Page" suffix; la excepcion es Teacher.
5. **Convencion explicita > implicita:** Depender del directorio `pages/` para inferir tipo es fragil (los archivos se mueven, se referencian fuera de contexto, se buscan globalmente).

### Nueva Convencion Canonica

| Elemento | Convencion | Ejemplo |
|----------|-----------|---------|
| Paginas | `{Portal}{Nombre}Page.tsx` | `AdminDashboardPage.tsx` |
| Paginas sin prefijo portal | `{Nombre}Page.tsx` | `ShopPage.tsx`, `LoginPage.tsx` |
| Componentes | `{Nombre}.tsx` | `RoleEditor.tsx` |
| Hooks | `use{Nombre}.ts` | `useTeacherPageSetup.ts` |
| Stores | `{nombre}Store.ts` | `leaderboardStore.ts` |

### Alcance

Esta convencion aplica a **todos los portales**:
- Student Portal
- Teacher Portal (deuda tecnica: 19 archivos sin sufijo pendientes de alinear)
- Admin Portal
- Parent Portal
- Root pages (`src/pages/`)

### Excepciones

- **Teacher portal:** Las 19 paginas actuales sin sufijo "Page" se mantienen temporalmente como deuda tecnica. Se alinearan al patron canonico cuando se toque cada archivo por motivos funcionales (no se hara un renombre masivo dedicado).
- **Sub-componentes en `pages/`:** Archivos como `settings/ToggleSwitch.tsx`, `settings/SaveButton.tsx` que son componentes auxiliares dentro de subdirectorios de paginas NO requieren sufijo "Page" (no son paginas, son componentes).

## Consecuencias

### Positivas

- **Consistencia con el codebase real:** La documentacion ahora refleja lo que existe
- **Explicitud:** Los nombres de archivo son autoexplicativos en cualquier contexto
- **Sin migracion masiva:** Evita un renombre de alto riesgo sin beneficio funcional

### Negativas

- **Inconsistencia temporal en Teacher:** 19 archivos no siguen el patron hasta que sean tocados
- **Nombres ligeramente mas largos:** "Page" agrega 4 caracteres

### Plan de Convergencia para Teacher Portal

Las 19 paginas del Teacher portal se renombraran de forma **oportunista** (no dedicada):
- Cuando un archivo Teacher page se modifique por motivos funcionales, se renombra a `{Nombre}Page.tsx`
- Se actualiza el import correspondiente en App.tsx y cualquier barrel file
- NO se crea un ticket dedicado para renombre masivo

## Patron de Nombres Final

```
apps/frontend/src/apps/{portal}/
+-- components/               # Componentes reutilizables
|   +-- {Nombre}.tsx          # Sin sufijo
+-- pages/                    # Paginas/vistas
|   +-- {Nombre}Page.tsx      # CON sufijo "Page" (canonico)
+-- hooks/                    # Hooks custom
|   +-- use{Nombre}.ts        # Prefijo "use"
+-- stores/                   # Estado global
    +-- {nombre}Store.ts      # Sufijo "Store"
```

## Historial de Cambios

| Version | Fecha | Cambio |
|---------|-------|--------|
| v1.0.0 | 2026-01-25 | Decision original: remover sufijo "Page" |
| v2.0.0 | 2026-02-19 | Enmienda: revertir decision, sufijo "Page" es canonico |

## Referencias

- Teacher Portal: `apps/frontend/src/apps/teacher/pages/`
- Admin Portal: `apps/frontend/src/apps/admin/pages/`
- FRONTEND_INVENTORY.yml
- TASK-2026-01-30-CORRECCION-INTEGRAL (decision original)
- TASK-2026-02-19-ESTANDARIZACION-PORTALES Track F (analisis que detecto el conflicto)

---

*Sistema SIMCO v4.3.0*
*Fecha documentacion: 2026-02-19*
