# MATRIX-A1: Page-Component Map

**Agent:** A (Frontend Deep Audit)
**Date:** 2026-02-20
**Scope:** Teacher Portal - 19 pages, 57 components, 28 hooks, 16 API services

---

## Summary

| Category | Count |
|----------|-------|
| Pages | 19 |
| Components (total) | 57 |
| Components used by pages (direct) | 33 |
| Components used only by other components | 14 |
| Components exported via barrel but no page import | 9 |
| Hooks (teacher-specific) | 27 (+ index.ts) |
| Hooks used by pages | 20 |
| Hooks used only by components | 3 |
| Hooks never imported by any page or component | 4 |
| API Service Files | 16 (+ index.ts) |
| API Services used | 15 |
| Shared hooks used (from outside teacher/) | 5 |

---

## Page -> Component -> Hook -> API Map

### 1. TeacherDashboard.tsx
- **Route:** `/teacher/dashboard`
- **Components:**
  - `TeacherPageShell` (shared wrapper)
  - `StudentMonitoringPanel` -> monitoring/
  - `AssignmentCreator` -> assignments/
  - `ClassProgressDashboard` -> progress/
  - `InterventionAlertsPanel` -> alerts/
  - `LearningAnalyticsDashboard` -> analytics/
  - `PerformanceInsightsPanel` -> analytics/
  - `ReportGenerator` -> reports/
  - `ParentCommunicationHub` -> collaboration/
  - `ResourceSharingPanel` -> collaboration/
- **Hooks:** `useTeacherDashboard`, `useClassrooms`
- **Direct API calls:** `classroomsApi.getClassroomStudents`, `assignmentsApi.getUpcomingAssignments`
- **Sub-components loaded transitively:**
  - StudentMonitoringPanel -> StudentStatusCard, SuspendStudentModal, StudentActionsMenu, RefreshControl, StudentPagination (uses useStudentMonitoring, useStudentBlocking)
  - AssignmentCreator -> AssignmentWizard, AssignmentList (uses useAssignments)
  - ClassProgressDashboard -> ProgressChart, ModuleCompletionCard, StudentProgressList, StudentDetailModal (uses useClassroomData)
  - InterventionAlertsPanel (uses useInterventionAlerts)
  - LearningAnalyticsDashboard -> EngagementMetricsChart (uses useAnalytics)
  - ReportGenerator -> ReportTemplateSelector (uses analyticsApi.generateReport)
  - ParentCommunicationHub (standalone)
  - ResourceSharingPanel (standalone)

### 2. TeacherClasses.tsx
- **Route:** `/teacher/classes`
- **Components:**
  - `TeacherPageShell`
- **Hooks:** `useClassrooms`
- **API:** classroomsApi (via useClassrooms: getClassrooms, createClassroom, updateClassroom, deleteClassroom)

### 3. TeacherAssignments.tsx
- **Route:** `/teacher/assignments`
- **Components:**
  - `TeacherPageShell`
  - `ImprovedAssignmentWizard` -> assignments/
  - `AssignmentCard` -> assignments/
  - `SubmissionsModal` -> assignments/
  - `GradeSubmissionModal` -> dashboard/
- **Hooks:** `useAssignments`, `useClassrooms`
- **API:** assignmentsApi (via useAssignments: getAssignments, createAssignment, getAssignmentSubmissions, gradeSubmission, sendReminder)

### 4. TeacherAnalytics.tsx
- **Route:** `/teacher/analytics`
- **Components:**
  - `TeacherPageShell`
- **Hooks:** `useAnalytics`, `useClassrooms`
- **API:** analyticsApi (via useAnalytics: getClassroomAnalytics, getEngagementMetrics, generateReport)

### 5. TeacherProgress.tsx
- **Route:** `/teacher/progress`
- **Components:**
  - `TeacherPageShell`
  - `ClassProgressDashboard` -> progress/
- **Hooks:** `useClassrooms`, `useClassroomsStats`, `useAnalytics`
- **API:** classroomsApi (via useClassroomsStats: getClassroomStats), analyticsApi (via useAnalytics: getEngagementMetrics)

### 6. TeacherGamification.tsx
- **Route:** `/teacher/gamification`
- **Components:**
  - `TeacherPageShell`
- **Hooks:** `useGrantBonus`, `useEconomyAnalytics`, `useStudentsEconomy`, `useAchievementsStats`
- **API:** bonusCoinsApi (via useGrantBonus), analyticsApi (via useEconomyAnalytics, useStudentsEconomy, useAchievementsStats)

### 7. TeacherMonitoring.tsx
- **Route:** `/teacher/monitoring`
- **Components:**
  - `TeacherPageShell`
  - `StudentMonitoringPanel` -> monitoring/
- **Hooks:** `useClassrooms`, `useClassroomRealtime`
- **API:** classroomsApi (via useClassrooms), WebSocket via useClassroomRealtime

### 8. TeacherStudents.tsx
- **Route:** `/teacher/students`
- **Components:**
  - `TeacherPageShell`
  - `StudentDetailModal` -> monitoring/
- **Hooks:** `useClassrooms`
- **Direct API calls:** `classroomsApi.getClassroomStudents` (NOT via hook)

### 9. TeacherReports.tsx
- **Route:** `/teacher/reports`
- **Components:**
  - `TeacherPageShell`
  - `ReportGenerator` -> reports/
  - `RecentReportsTable` -> reports/
  - `ScheduledReportsTab` -> reports/
  - `SharedReportsTab` -> reports/
- **Hooks:** None teacher-specific (components use their own)
- **Direct API calls:** `reportsApi.getRecentReports`, `reportsApi.getReportStats`, `reportsApi.downloadReport`, `reportsApi.deleteReport`, `classroomsApi.getClassrooms`

### 10. TeacherSettings.tsx
- **Route:** `/teacher/settings`
- **Components:**
  - `TeacherPageShell`
  - `ProfileSettingsSection` -> settings/
  - `TeachingPreferencesSection` -> settings/
  - `NotificationsSettingsSection` -> settings/
  - `PrivacySettingsSection` -> settings/
- **Hooks:** None teacher-specific hooks
- **Shared hooks:** `useAuth`, `useUserPreferences`, `useApiError`
- **API:** profileAPI (updateProfile, updatePreferences, uploadAvatar, updatePassword)

### 11. TeacherContent.tsx
- **Route:** `/teacher/content`
- **Components:**
  - `TeacherPageShell`
  - Conditionally renders `TeacherContentManagement` or `UnderConstruction`
- **Feature flag:** `FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION`

### 12. TeacherContentManagement.tsx
- **Route:** Rendered inside TeacherContent.tsx
- **Components:**
  - `TeacherPageShell`
- **Hooks:** `useTeacherContent`
- **API:** teacherContentApi (via useTeacherContent: getContent, createContent, updateContent, deleteContent, cloneContent, publishContent)

### 13. TeacherCommunication.tsx
- **Route:** `/teacher/communication`
- **Components:**
  - `TeacherPageShell`
  - `MessagesList` -> communication/
  - `MessageComposer` -> communication/
  - `ConversationsList` -> communication/
  - `AnnouncementForm` -> communication/
  - `FeedbackForm` -> communication/
  - `MessageFilters` -> communication/
- **Hooks:** `useTeacherMessages`, `useClassrooms`
- **Shared hooks:** `useWebSocket` (from features/notifications/)
- **Feature flag:** `FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION`
- **API:** teacherMessagesApi (via useTeacherMessages)

### 14. TeacherNotifications.tsx
- **Route:** `/teacher/notifications`
- **Components:**
  - `TeacherPageShell`
- **Hooks:** None teacher-specific
- **Shared store:** `useNotificationsStore` (from features/notifications/ — Zustand)
- **API:** notificationsApi (via Zustand store)

### 15. TeacherNotificationPreferences.tsx
- **Route:** `/teacher/notification-preferences`
- **Components:**
  - `TeacherPageShell`
- **Hooks:** None teacher-specific
- **Shared store/hooks:** `useNotificationsStore`, `usePushNotifications` (from features/notifications/)

### 16. TeacherAlerts.tsx
- **Route:** `/teacher/alerts`
- **Components:**
  - `TeacherPageShell`
  - `InterventionAlertsPanel` -> alerts/
- **Hooks:** `useClassrooms`
- **API:** interventionAlertsApi (via InterventionAlertsPanel -> useInterventionAlerts)

### 17. TeacherAlertConfig.tsx
- **Route:** `/teacher/alert-config`
- **Components:**
  - `TeacherPageShell`
- **Hooks:** `useAlertConfig`
- **API:** alertConfigApi (via useAlertConfig)

### 18. TeacherReviewPanel.tsx
- **Route:** `/teacher/reviews`
- **Components:**
  - `TeacherPageShell`
  - `ReviewList` -> review-panel/
  - `ReviewDetail` -> review-panel/
- **Hooks:** `useMyReviews`, `useManualReviewDetail`, `useManualReviewConfig`
- **API:** manualReviewApi (shared), API_ENDPOINTS.teacher.reviews.config

### 19. TeacherExerciseResponses.tsx
- **Route:** `/teacher/exercise-responses`
- **Components:**
  - `TeacherPageShell`
  - `ResponsesTable` -> responses/
  - `ResponseDetailModal` -> responses/
  - `ResponseFilters` -> responses/
- **Hooks:** `useExerciseResponses`
- **API:** exerciseResponsesApi (via useExerciseResponses)

---

## Component Hierarchy (57 total)

### alerts/ (2)
| Component | Used By | Status |
|-----------|---------|--------|
| AlertCard.tsx | Unknown | POTENTIALLY ORPHANED |
| InterventionAlertsPanel.tsx | TeacherDashboard, TeacherAlerts | ACTIVE |

### analytics/ (3)
| Component | Used By | Status |
|-----------|---------|--------|
| EngagementMetricsChart.tsx | LearningAnalyticsDashboard | ACTIVE (indirect) |
| LearningAnalyticsDashboard.tsx | TeacherDashboard | ACTIVE |
| PerformanceInsightsPanel.tsx | TeacherDashboard | ACTIVE |

### assignments/ (5)
| Component | Used By | Status |
|-----------|---------|--------|
| AssignmentCard.tsx | TeacherAssignments | ACTIVE |
| AssignmentCreator.tsx | TeacherDashboard | ACTIVE |
| AssignmentList.tsx | AssignmentCreator | ACTIVE (indirect) |
| AssignmentWizard.tsx | AssignmentCreator | ACTIVE (indirect) |
| ImprovedAssignmentWizard.tsx | TeacherAssignments | ACTIVE |
| SubmissionsModal.tsx | TeacherAssignments | ACTIVE |

### collaboration/ (2)
| Component | Used By | Status |
|-----------|---------|--------|
| ParentCommunicationHub.tsx | TeacherDashboard | ACTIVE |
| ResourceSharingPanel.tsx | TeacherDashboard | ACTIVE |

### communication/ (6)
| Component | Used By | Status |
|-----------|---------|--------|
| AnnouncementForm.tsx | TeacherCommunication | ACTIVE |
| ConversationsList.tsx | TeacherCommunication | ACTIVE |
| FeedbackForm.tsx | TeacherCommunication | ACTIVE |
| MessageComposer.tsx | TeacherCommunication | ACTIVE |
| MessageFilters.tsx | TeacherCommunication | ACTIVE |
| MessagesList.tsx | TeacherCommunication | ACTIVE |

### dashboard/ (9)
| Component | Used By | Status |
|-----------|---------|--------|
| ClassroomCard.tsx | ClassroomsGrid | ACTIVE (indirect) |
| ClassroomsGrid.tsx | barrel export only | POTENTIALLY ORPHANED |
| CreateAssignmentModal.tsx | barrel export only | POTENTIALLY ORPHANED |
| CreateClassroomModal.tsx | barrel export only | POTENTIALLY ORPHANED |
| GradeSubmissionModal.tsx | TeacherAssignments | ACTIVE |
| PendingSubmissionsList.tsx | barrel export only | POTENTIALLY ORPHANED |
| QuickActionsPanel.tsx | barrel export only | POTENTIALLY ORPHANED |
| RecentAssignmentsList.tsx | barrel export only | POTENTIALLY ORPHANED |
| StudentAlerts.tsx | barrel export only | POTENTIALLY ORPHANED |
| TeacherDashboardHero.tsx | barrel export only | POTENTIALLY ORPHANED |

### monitoring/ (7)
| Component | Used By | Status |
|-----------|---------|--------|
| RefreshControl.tsx | StudentMonitoringPanel | ACTIVE (indirect) |
| StudentActionsMenu.tsx | StudentMonitoringPanel | ACTIVE (indirect) |
| StudentDetailModal.tsx | TeacherStudents, ClassProgressDashboard | ACTIVE |
| StudentMonitoringPanel.tsx | TeacherDashboard, TeacherMonitoring | ACTIVE |
| StudentPagination.tsx | StudentMonitoringPanel | ACTIVE (indirect) |
| StudentStatusCard.tsx | StudentMonitoringPanel | ACTIVE (indirect) |
| SuspendStudentModal.tsx | StudentMonitoringPanel | ACTIVE (indirect) |

### progress/ (4)
| Component | Used By | Status |
|-----------|---------|--------|
| ClassProgressDashboard.tsx | TeacherDashboard, TeacherProgress | ACTIVE |
| ModuleCompletionCard.tsx | ClassProgressDashboard | ACTIVE (indirect) |
| ProgressChart.tsx | ClassProgressDashboard | ACTIVE (indirect) |
| StudentProgressList.tsx | ClassProgressDashboard | ACTIVE (indirect) |

### reports/ (5)
| Component | Used By | Status |
|-----------|---------|--------|
| RecentReportsTable.tsx | TeacherReports | ACTIVE |
| ReportGenerator.tsx | TeacherDashboard, TeacherReports | ACTIVE |
| ReportTemplateSelector.tsx | ReportGenerator | ACTIVE (indirect) |
| ScheduledReportsTab.tsx | TeacherReports | ACTIVE |
| SharedReportsTab.tsx | TeacherReports | ACTIVE |

### responses/ (3)
| Component | Used By | Status |
|-----------|---------|--------|
| ResponseDetailModal.tsx | TeacherExerciseResponses | ACTIVE |
| ResponseFilters.tsx | TeacherExerciseResponses | ACTIVE |
| ResponsesTable.tsx | TeacherExerciseResponses | ACTIVE |

### review-panel/ (2)
| Component | Used By | Status |
|-----------|---------|--------|
| ReviewDetail.tsx | TeacherReviewPanel | ACTIVE |
| ReviewList.tsx | TeacherReviewPanel | ACTIVE |

### settings/ (5)
| Component | Used By | Status |
|-----------|---------|--------|
| NotificationsSettingsSection.tsx | TeacherSettings | ACTIVE |
| PrivacySettingsSection.tsx | TeacherSettings | ACTIVE |
| ProfileSettingsSection.tsx | TeacherSettings | ACTIVE |
| SaveButton.tsx | settings sections | ACTIVE (indirect) |
| TeachingPreferencesSection.tsx | TeacherSettings | ACTIVE |

### shared/ (1)
| Component | Used By | Status |
|-----------|---------|--------|
| TeacherPageShell.tsx | All 19 pages | ACTIVE |

### root (1)
| Component | Used By | Status |
|-----------|---------|--------|
| withTeacherLayout.tsx | DEPRECATED (replaced by TeacherPageShell) | DEPRECATED |
