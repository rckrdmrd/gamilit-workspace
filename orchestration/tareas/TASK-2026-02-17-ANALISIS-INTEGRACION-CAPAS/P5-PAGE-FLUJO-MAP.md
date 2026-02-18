# P5 Page-to-Flujo Frontend Mapping

**Date:** 2026-02-17 | **Status:** Complete

## Summary

| Metric | Value |
|--------|-------|
| Total pages (.tsx in pages/) | 68 active + 2 legacy = 70 |
| Routes in App.tsx | 75 `<Route` definitions |
| TODO/FIXME in page files | 6 across 5 files |
| missionsStore deprecation | Complete (0 active usage) |
| Parent portal gap | 4 pages for 7 flujos |

## Pages by Portal

| Portal | Pages | Flujos | Coverage |
|--------|-------|--------|----------|
| Student | 20 | 18 (FL-STU-01..18) | 100%+ |
| Teacher | 19 | 9 (FL-TCH-01..09) | 100%+ |
| Admin | 19 | 11 (FL-ADM-01..11) | 100%+ |
| Parent | 4 | 7 (FL-PRN-01..07) | 57% |
| Shared/Auth | 6 | 6 (FL-AUTH-01..03, FL-SHR-01..03) | 100% |
| **Total** | **68** | **51** | **92%** |

## Student Pages (20)

| Page | Maps to Flujo | API Integration |
|------|---------------|-----------------|
| DashboardComplete | FL-STU-01 | userStatsAPI, progressAPI |
| LearningPage | FL-STU-02/03 | educationalAPI, exercisesAPI |
| ExercisePage | FL-STU-04 | exercisesAPI, mechanicsAPI (mock) |
| ModuleDetailPage | FL-STU-05 | educationalAPI |
| AssignmentsPage | FL-STU-06 | assignmentsAPI |
| AssignmentDetailPage | FL-STU-06 | assignmentsAPI |
| ShopPage | FL-STU-07 | economyAPI, inventoryAPI |
| InventoryPage | FL-STU-08 | inventoryAPI |
| FriendsPage | FL-STU-09 | socialAPI |
| GuildsPage | FL-STU-10 | socialAPI |
| LeaderboardPage | FL-STU-11 | leaderboardAPI |
| MissionsPage | FL-STU-12 | missionsAPI (hook-based) |
| EnhancedProfilePage | FL-STU-13 | profileAPI, userStatsAPI |
| NotificationsPage | FL-STU-14 | notificationsAPI |
| NotificationPreferencesPage | FL-STU-14 | notificationsAPI |
| SettingsPage | FL-STU-15 | settingsAPI |
| DeviceManagementSection | FL-STU-15 | settingsAPI |
| EmailVerificationPage | FL-AUTH-01 | authAPI |
| PasswordResetPage | FL-AUTH-03 | authAPI |
| NotFoundPage | (utility) | — |

## Teacher Pages (19)

| Page | Maps to Flujo |
|------|---------------|
| TeacherDashboard | FL-TCH-01 |
| TeacherClasses | FL-TCH-02 |
| TeacherStudents | FL-TCH-02 |
| TeacherAssignments | FL-TCH-03 |
| TeacherContentPage | FL-TCH-03 |
| TeacherContentManagement | FL-TCH-03 |
| TeacherExerciseResponses | FL-TCH-03 |
| TeacherReviewPanel | FL-TCH-03 |
| TeacherAnalytics | FL-TCH-04 |
| TeacherProgress | FL-TCH-04 |
| TeacherReports | FL-TCH-04 |
| TeacherGamification | FL-TCH-05 |
| TeacherCommunicationPage | FL-TCH-06 |
| TeacherMonitoring | FL-TCH-06 |
| TeacherAlerts | FL-TCH-06 |
| TeacherAlertConfig | FL-TCH-06 |
| TeacherNotificationsPage | FL-TCH-06 |
| TeacherNotificationPreferencesPage | FL-TCH-06 |
| TeacherSettings | FL-TCH-09 |

## Admin Pages (19)

| Page | Maps to Flujo |
|------|---------------|
| AdminDashboardPage | FL-ADM-01 |
| AdminSettingsPage | FL-ADM-02 |
| AdminAdvancedPage | FL-ADM-02 |
| AdminUsersPage | FL-ADM-03 |
| AdminRolesPage | FL-ADM-03 |
| AdminInstitutionsPage | FL-ADM-04 |
| AdminClassroomTeacherPage | FL-ADM-05 |
| AdminAuditLogsPage | FL-ADM-06 |
| AdminAlertsPage | FL-ADM-06 |
| AdminMonitoringPage | FL-ADM-07 |
| AdminContentPage | FL-ADM-08 |
| AdminExerciseCreatePage | FL-ADM-08 |
| AdminAnalyticsPage | FL-ADM-09 |
| AdminProgressPage | FL-ADM-09 |
| AdminReportsPage | FL-ADM-10 |
| AdminAssignmentsPage | FL-ADM-10 |
| AdminGamificationPage | FL-ADM-11 |
| AdminNotificationsPage | FL-ADM-06 |
| AdminNotificationPreferencesPage | FL-ADM-06 |

## Parent Pages (4) — GAP IDENTIFIED

| Page | Maps to Flujo | Status |
|------|---------------|--------|
| ParentLoginPage | FL-PRN-01 | OK |
| ParentRegisterPage | FL-PRN-01 | OK |
| ParentDashboardPage | FL-PRN-02 | OK — covers dashboard + basic progress |
| ChildProgressPage | FL-PRN-04 | OK — detailed child progress |

### Missing Parent Pages (3 flujos uncovered)

| Flujo | Description | Missing Page |
|-------|-------------|-------------|
| FL-PRN-03 | Notifications & communication | No dedicated page — uses ParentDashboardPage partially |
| FL-PRN-05 | Academic calendar | No page |
| FL-PRN-06 | Teacher messaging | No page |
| FL-PRN-07 | Settings & preferences | No page |

**Action (P6):** Document as known gap. Parent portal has minimal 4-page implementation.

## Shared/Auth Pages (6)

| Page | Location | Maps to Flujo |
|------|----------|---------------|
| LoginPage | pages/auth/ | FL-AUTH-01 |
| RegisterPage | pages/auth/ | FL-AUTH-01 |
| ForgotPasswordPage | pages/auth/ | FL-AUTH-03 |
| AchievementsPage | pages/ | FL-STU-11 |
| ModuleDetailsPage | pages/ | FL-STU-05 |
| MyProgressPage | pages/ | FL-STU-04 |

## Legacy Pages (2)

| Page | Status |
|------|--------|
| pages/_legacy/DashboardPage.tsx | Deprecated — replaced by DashboardComplete |

## TODO/FIXME Inventory

| File | Count | Content |
|------|-------|---------|
| DashboardComplete.tsx | 1 | Minor UI polish |
| AdminGamificationPage.tsx | 1 | Config expansion |
| InventoryPage.tsx | 1 | Item filter improvement |
| StreaksMissionsSection.tsx | 1 | Animation enhancement |
| RestoreDefaultsDialog.tsx | 2 | Confirmation UX |
| **Total** | **6** | All low-priority UI polish |

## missionsStore Deprecation Status

- `missionsStore.ts` — Only referenced in test file (`__tests__/missionsStore.test.ts`) and `MIGRATION-GUIDE.md`
- `MissionsPage.tsx` uses `useMissions` hook (React Query) — migration complete
- **Status:** COMPLETE — no active usage of deprecated store
