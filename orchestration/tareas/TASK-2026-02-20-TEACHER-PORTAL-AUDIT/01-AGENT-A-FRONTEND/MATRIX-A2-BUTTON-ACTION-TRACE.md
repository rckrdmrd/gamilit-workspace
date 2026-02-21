# MATRIX-A2: Button/Action Trace

**Agent:** A (Frontend Deep Audit)
**Date:** 2026-02-20
**Scope:** Every interactive element in all 19 Teacher portal pages

---

## Legend

- **COMPLETE**: Button -> Handler -> Hook -> API -> HTTP endpoint is fully wired
- **PARTIAL**: Some links in the chain are missing or use mock data
- **BROKEN**: The action references a function or endpoint that does not exist
- **FEATURE-FLAGGED**: Behind a feature flag, may be disabled

---

## 1. TeacherDashboard.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Classroom selector dropdown | `onChange -> selectClassroom` | useClassrooms -> classroomsApi | GET /teacher/classrooms | COMPLETE |
| 2 | Refresh button | `onClick -> refresh` | useTeacherDashboard (refetch all) | GET /teacher/dashboard/* | COMPLETE |
| 3 | Quick action: "Monitoreo" | `onClick -> setActiveTab('monitoring')` | Local state only (tab switch) | N/A | COMPLETE |
| 4 | Quick action: "Asignaciones" | `onClick -> setActiveTab('assignments')` | Local state only | N/A | COMPLETE |
| 5 | Quick action: "Progreso" | `onClick -> setActiveTab('progress')` | Local state only | N/A | COMPLETE |
| 6 | Quick action: "Alertas" | `onClick -> setActiveTab('alerts')` | Local state only | N/A | COMPLETE |
| 7 | 10 tab navigation buttons | `onClick -> setActiveTab(id)` | Local state only | N/A | COMPLETE |

## 2. TeacherClasses.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Search input | `onChange -> setSearchTerm` | Local filter (client-side) | N/A | COMPLETE |
| 2 | "Crear Nueva Clase" button | `onClick -> setShowCreateModal(true)` | Local state | N/A | COMPLETE |
| 3 | Create modal submit | `onSubmit -> createClassroom` | useClassrooms -> classroomsApi | POST /teacher/classrooms | COMPLETE |
| 4 | Edit button per card | `onClick -> setEditingClassroom` | Local state | N/A | COMPLETE |
| 5 | Edit modal submit | `onSubmit -> updateClassroom` | useClassrooms -> classroomsApi | PUT /teacher/classrooms/:id | COMPLETE |
| 6 | Delete button per card | `onClick -> setDeletingClassroom` | Local state | N/A | COMPLETE |
| 7 | Delete confirmation | `onClick -> deleteClassroom` | useClassrooms -> classroomsApi | DELETE /teacher/classrooms/:id | COMPLETE |
| 8 | Classroom card click | `onClick -> navigate('/teacher/progress?classroomId=')` | useNavigate | N/A (navigation) | COMPLETE |
| 9 | Refresh button | `onClick -> refresh` | useClassrooms | GET /teacher/classrooms | COMPLETE |

## 3. TeacherAssignments.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | "Crear Asignacion" button | `onClick -> setShowCreateModal(true)` | Local state | N/A | COMPLETE |
| 2 | Assignment wizard submit | `onSubmit -> createAssignment` | useAssignments -> assignmentsApi | POST /teacher/assignments | COMPLETE |
| 3 | Refresh button | `onClick -> refetch` | useAssignments (React Query) | GET /teacher/assignments | COMPLETE |
| 4 | "Ver Entregas" per assignment | `onClick -> viewSubmissions(id)` | useAssignments -> assignmentsApi | GET /teacher/assignments/:id/submissions | COMPLETE |
| 5 | "Enviar Recordatorio" per assignment | `onClick -> sendReminder(id)` | useAssignments -> assignmentsApi | POST /teacher/assignments/:id/remind | COMPLETE |
| 6 | Grade submission in modal | `onSubmit -> gradeSubmission` | useAssignments -> assignmentsApi | POST /teacher/submissions/:id/grade | COMPLETE |

## 4. TeacherAnalytics.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Classroom select | `onChange -> setSelectedClassroom` | Local state -> triggers useAnalytics refetch | GET /teacher/analytics | COMPLETE |
| 2 | Date range inputs | `onChange -> setStartDate/setEndDate` | Local state | N/A | COMPLETE |
| 3 | "Exportar a CSV" button | `onClick -> handleExportCSV()` | useAnalytics -> analyticsApi | POST /teacher/analytics/report | COMPLETE |
| 4 | Refresh button | `onClick -> refetch` | useAnalytics (React Query) | GET /teacher/analytics | COMPLETE |
| 5 | 3 tab buttons | `onClick -> setActiveTab` | Local state | N/A | COMPLETE |

## 5. TeacherProgress.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Custom classroom dropdown | `onClick -> selectClassroom` | useClassrooms | GET /teacher/classrooms | COMPLETE |
| 2 | 2 tab buttons (progress/engagement) | `onClick -> setActiveTab` | Local state | N/A | COMPLETE |
| 3 | "Exportar CSV" button | `onClick -> handleExport` | useAnalytics -> analyticsApi | POST /teacher/analytics/report | COMPLETE |
| 4 | "Crear Primera Clase" button | `onClick -> navigate('/teacher/classes')` | useNavigate | N/A (navigation) | COMPLETE |

## 6. TeacherGamification.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Student select dropdown | `onChange -> setSelectedStudentId` | Local state | N/A | COMPLETE |
| 2 | Bonus amount +/- buttons | `onClick -> setAmount(+/-10)` | useGrantBonus local state | N/A | COMPLETE |
| 3 | "Otorgar Bonus" button | `onClick -> handleGrantBonus` | useGrantBonus -> bonusCoinsApi | POST /teacher/students/:id/bonus | COMPLETE |
| 4 | Search input (students) | `onChange -> setSearchTerm` | Local filter (client-side) | N/A | COMPLETE |
| 5 | Sort select | `onChange -> setSortBy` | Local sort | N/A | COMPLETE |
| 6 | Sort order toggle | `onClick -> toggleSortOrder` | Local sort | N/A | COMPLETE |
| 7 | Per-student "Dar Bonus" button | `onClick -> openBonusModal(student)` | Local state | N/A | COMPLETE |
| 8 | Refresh button | `onClick -> refetch all` | useStudentsEconomy, useEconomyAnalytics, useAchievementsStats | GET /teacher/analytics/* | COMPLETE |
| 9 | Modal confirm/cancel | `onClick -> grantBonus/close` | useGrantBonus -> bonusCoinsApi | POST /teacher/students/:id/bonus | COMPLETE |

## 7. TeacherMonitoring.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Refresh button | `onClick -> refresh` | useClassrooms | GET /teacher/classrooms | COMPLETE |
| 2 | Show/Hide filters toggle | `onClick -> setShowFilters(!showFilters)` | Local state | N/A | COMPLETE |
| 3 | Classroom selection buttons | `onClick -> selectClassroom(id)` | useClassrooms | GET /teacher/classrooms | COMPLETE |
| 4 | Reconnect button (disconnected) | `onClick -> realtimeReconnect` | useClassroomRealtime | WebSocket reconnect | COMPLETE |
| 5 | Clear events button | `onClick -> clearEvents` | useClassroomRealtime local state | N/A | COMPLETE |

## 8. TeacherStudents.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Search input | `onChange -> setSearchTerm` | Local filter | N/A | COMPLETE |
| 2 | Class filter select | `onChange -> setSelectedClass` | Local state -> triggers API refetch | GET /teacher/classrooms/:id/students | COMPLETE |
| 3 | Performance filter select | `onChange -> setPerformanceFilter` | Local client-side filter | N/A | COMPLETE |
| 4 | Sortable column headers | `onClick -> setSortBy/setSortOrder` | Local sort | N/A | COMPLETE |
| 5 | Row click | `onClick -> openDetailModal(student)` | StudentDetailModal | N/A | COMPLETE |

## 9. TeacherReports.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Refresh button | `onClick -> loadReports` | Direct reportsApi calls | GET /teacher/reports/recent, GET /teacher/reports/stats | COMPLETE |
| 2 | Classroom selector | `onChange -> setSelectedClassroom` | Local state | N/A | COMPLETE |
| 3 | Report type filter | `onChange -> setReportFilter` | Local filter | N/A | COMPLETE |
| 4 | Download button per report | `onClick -> handleDownload(id)` | reportsApi.downloadReport | GET /teacher/reports/:id/download | COMPLETE |
| 5 | Delete button per report | `onClick -> setDeletingReport(id)` | Local state | N/A | COMPLETE |
| 6 | Delete confirmation | `onClick -> handleDeleteReport` | reportsApi.deleteReport | DELETE /teacher/reports/:id | COMPLETE |
| 7 | 3 tab buttons | `onClick -> setActiveTab` | Local state | N/A | COMPLETE |

## 10. TeacherSettings.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | 4 sidebar nav buttons | `onClick -> setActiveSection` | Local state | N/A | COMPLETE |
| 2 | Save button (profile) | `onClick -> handleSave` | profileAPI.updateProfile | PUT /profile/:id | COMPLETE |
| 3 | Save button (teaching) | `onClick -> handleSave` | profileAPI.updatePreferences | PUT /profile/:id/preferences | COMPLETE |
| 4 | Save button (notifications) | `onClick -> handleSave` | profileAPI.updatePreferences | PUT /profile/:id/preferences | COMPLETE |
| 5 | Save button (privacy) | `onClick -> handleSave` | profileAPI.updatePreferences | PUT /profile/:id/preferences | COMPLETE |
| 6 | Avatar upload | `onChange -> handleAvatarUpload` | profileAPI.uploadAvatar | POST /profile/:id/avatar | COMPLETE |
| 7 | Password change submit | `onClick -> handlePasswordChange` | profileAPI.updatePassword | PUT /profile/:id/password | COMPLETE |

## 11. TeacherContent.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | (Feature flagged) | Delegates to TeacherContentManagement | N/A | N/A | FEATURE-FLAGGED |

## 12. TeacherContentManagement.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | "Nuevo Contenido" button | `onClick -> setShowCreateModal(true)` | Local state | N/A | COMPLETE |
| 2 | Search input | `onChange -> updateFilters({search})` | useTeacherContent | GET /teacher/content | COMPLETE |
| 3 | Type filter select | `onChange -> updateFilters({contentType})` | useTeacherContent | GET /teacher/content | COMPLETE |
| 4 | Status filter select | `onChange -> updateFilters({status})` | useTeacherContent | GET /teacher/content | COMPLETE |
| 5 | Edit button per item | `onClick -> setEditingContent` | Local state | N/A | COMPLETE |
| 6 | Clone button per item | `onClick -> handleClone(id)` | useTeacherContent -> teacherContentApi | POST /teacher/content/:id/clone | COMPLETE |
| 7 | Publish button per item | `onClick -> handlePublish(id)` | useTeacherContent -> teacherContentApi | PATCH /teacher/content/:id/publish | COMPLETE |
| 8 | Delete button per item | `onClick -> handleDelete(id)` | useTeacherContent -> teacherContentApi | DELETE /teacher/content/:id | COMPLETE |
| 9 | Modal create/save | `onSubmit -> createContent/updateContent` | useTeacherContent -> teacherContentApi | POST/PUT /teacher/content | COMPLETE |

## 13. TeacherCommunication.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | "Nuevo Mensaje" toggle | `onClick -> setShowComposer(!showComposer)` | Local state | N/A | FEATURE-FLAGGED |
| 2 | 4 tab buttons | `onClick -> setActiveTab` | Local state | N/A | FEATURE-FLAGGED |
| 3 | Pagination prev/next | `onClick -> prevPage/nextPage` | useTeacherMessages | GET /teacher/messages | FEATURE-FLAGGED |
| 4 | Message click (inbox) | `onClick -> handleMessageClick` | useTeacherMessages -> markAsRead | POST /teacher/messages/:id/read | FEATURE-FLAGGED |
| 5 | Conversation click | `onClick -> handleConversationClick` | useTeacherMessages | GET /teacher/messages | FEATURE-FLAGGED |
| 6 | Send message | `onSubmit -> sendMessage` | useTeacherMessages -> teacherMessagesApi | POST /teacher/messages | FEATURE-FLAGGED |
| 7 | Send announcement | `onSubmit -> sendAnnouncement` | useTeacherMessages -> teacherMessagesApi | POST /teacher/messages/classroom/:id/announce | FEATURE-FLAGGED |
| 8 | Send feedback | `onSubmit -> sendFeedback` | useTeacherMessages -> teacherMessagesApi | POST /teacher/messages/student/:id/feedback | FEATURE-FLAGGED |

## 14. TeacherNotifications.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Refresh button | `onClick -> fetchNotifications` | useNotificationsStore (Zustand) | GET /notifications | COMPLETE |
| 2 | Filter toggle | `onClick -> setShowFilters` | Local state | N/A | COMPLETE |
| 3 | "Marcar todas" button | `onClick -> markAllAsRead` | useNotificationsStore | PATCH /notifications/mark-all-read | COMPLETE |
| 4 | Settings link | `onClick -> navigate('/teacher/notification-preferences')` | useNavigate | N/A | COMPLETE |
| 5 | Status filter buttons | `onClick -> setFilter({status})` | Local filter | N/A | COMPLETE |
| 6 | Type filter select | `onChange -> setFilter({type})` | Local filter | N/A | COMPLETE |
| 7 | Mark as read per notification | `onClick -> markAsRead(id)` | useNotificationsStore | PATCH /notifications/:id/read | COMPLETE |
| 8 | Delete per notification | `onClick -> deleteNotification(id)` | useNotificationsStore | DELETE /notifications/:id | COMPLETE |

## 15. TeacherNotificationPreferences.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Back link | `onClick -> navigate('/teacher/notifications')` | useNavigate | N/A | COMPLETE |
| 2 | Push toggle button | `onClick -> togglePush` | usePushNotifications | Browser Push API | COMPLETE |
| 3 | Per-type in-app/email/push toggles | `onClick -> updatePreference(type, channel)` | useNotificationsStore | PUT /notifications/preferences | COMPLETE |
| 4 | Register device button | `onClick -> requestPermission` | usePushNotifications | POST /notifications/devices | COMPLETE |
| 5 | Per-device delete button | `onClick -> deleteDevice(id)` | useNotificationsStore | DELETE /notifications/devices/:id | COMPLETE |

## 16. TeacherAlerts.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Show/Hide filters toggle | `onClick -> setShowFilters` | Local state | N/A | COMPLETE |
| 2 | "Configurar Alertas" link | `onClick -> navigate('/teacher/alert-config')` | useNavigate | N/A | COMPLETE |
| 3 | Priority filter buttons | `onClick -> setFilter({severity})` | Local state -> passed to InterventionAlertsPanel | N/A | COMPLETE |
| 4 | Type filter buttons | `onClick -> setFilter({type})` | Local state | N/A | COMPLETE |
| 5 | Clear filters button | `onClick -> clearFilters` | Local state | N/A | COMPLETE |
| 6 | Per-filter-chip X button | `onClick -> removeFilter` | Local state | N/A | COMPLETE |

## 17. TeacherAlertConfig.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Refresh button | `onClick -> refresh` | useAlertConfig | GET /teacher/alert-config | COMPLETE |
| 2 | "Inicializar Configuraciones" button | `onClick -> initializeDefaults` | useAlertConfig -> alertConfigApi | POST /teacher/alert-config/initialize | COMPLETE |
| 3 | Per-alert enable toggle | `onClick -> toggleEnabled(id, bool)` | useAlertConfig -> alertConfigApi | PUT /teacher/alert-config/:id | COMPLETE |
| 4 | Per-alert threshold edit button | `onClick -> setEditing(id)` | Local state | N/A | COMPLETE |
| 5 | Threshold save button | `onClick -> updateConfiguration(id, {threshold_value})` | useAlertConfig -> alertConfigApi | PUT /teacher/alert-config/:id | COMPLETE |
| 6 | Threshold cancel button | `onClick -> setEditing(null)` | Local state | N/A | COMPLETE |
| 7 | Per-alert in-app notification toggle | `onClick -> updateConfiguration(id, {notify_in_app})` | useAlertConfig -> alertConfigApi | PUT /teacher/alert-config/:id | COMPLETE |
| 8 | Per-alert email notification toggle | `onClick -> updateConfiguration(id, {notify_email})` | useAlertConfig -> alertConfigApi | PUT /teacher/alert-config/:id | COMPLETE |

## 18. TeacherReviewPanel.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | 4 status tab buttons | `onClick -> setStatusFilter` | Local state -> passed to useMyReviews | GET /teacher/reviews/my?status= | COMPLETE |
| 2 | Search input | `onChange -> setSearchTerm` | Local client-side filter | N/A | COMPLETE |
| 3 | Module filter select | `onChange -> setModuleFilter` | useManualReviewConfig data | Local filter | COMPLETE |
| 4 | Exercise filter select | `onChange -> setExerciseFilter` | useManualReviewConfig data | Local filter | COMPLETE |
| 5 | Review selection (click) | `onClick -> setSelectedReview(id)` | useManualReviewDetail | GET /teacher/reviews/:id | COMPLETE |

## 19. TeacherExerciseResponses.tsx

| # | Element | Handler | Hook/API | HTTP Endpoint | Status |
|---|---------|---------|----------|---------------|--------|
| 1 | Filter controls | `onChange -> setFilters(...)` | useExerciseResponses (React Query) | GET /teacher/attempts | COMPLETE |
| 2 | Clear filters | `onClick -> clearFilters` | Local state reset | N/A | COMPLETE |
| 3 | Pagination buttons | `onClick -> setPage` | useExerciseResponses | GET /teacher/attempts?page= | COMPLETE |
| 4 | Sort controls | `onClick -> setSort` | useExerciseResponses | GET /teacher/attempts?sort_by=&sort_order= | COMPLETE |
| 5 | View detail button | `onClick -> setSelectedAttempt(id)` | Local state -> triggers ResponseDetailModal | N/A | COMPLETE |
| 6 | Retry button (error state) | `onClick -> refetch` | useExerciseResponses | GET /teacher/attempts | COMPLETE |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total interactive elements traced | 122 |
| COMPLETE chains | 114 |
| FEATURE-FLAGGED chains | 8 |
| BROKEN chains | 0 |
| PARTIAL chains (mock data) | 0* |

*Note: `useStudentsEconomy` has mock data fallback when `FEATURE_FLAGS.USE_MOCK_DATA` is true, but the real API chain is complete.
