# MAPA VISUAL DE RUTAS - routes.constants.ts

## Árbol Completo de Endpoints

```
API_ROUTES
│
├── TEACHER (57 endpoints)
│   │
│   ├── Dashboard (6)
│   │   ├── DASHBOARD: /teacher/dashboard
│   │   ├── DASHBOARD_STATS: /teacher/dashboard/stats
│   │   ├── DASHBOARD_ACTIVITIES: /teacher/dashboard/activities
│   │   ├── DASHBOARD_ALERTS: /teacher/dashboard/alerts
│   │   ├── DASHBOARD_TOP_PERFORMERS: /teacher/dashboard/top-performers
│   │   └── DASHBOARD_MODULE_PROGRESS: /teacher/dashboard/module-progress
│   │
│   ├── Classrooms (11)
│   │   ├── CLASSROOMS: /teacher/classrooms
│   │   ├── CLASSROOM_BY_ID(id): /teacher/classrooms/:id
│   │   ├── CLASSROOM_TEACHERS(id): /teacher/classrooms/:id/teachers
│   │   ├── CLASSROOM_STUDENTS(id): /teacher/classrooms/:id/students
│   │   ├── CLASSROOM_STATS(id): /teacher/classrooms/:id/stats
│   │   ├── CLASSROOM_PROGRESS(id): /teacher/classrooms/:id/progress
│   │   ├── CLASSROOM_STUDENT_BLOCK(cId, sId): /teacher/classrooms/:cId/students/:sId/block
│   │   ├── CLASSROOM_STUDENT_UNBLOCK(cId, sId): /teacher/classrooms/:cId/students/:sId/unblock
│   │   └── CLASSROOM_STUDENT_PERMISSIONS(cId, sId): /teacher/classrooms/:cId/students/:sId/permissions
│   │
│   ├── Students (7)
│   │   ├── STUDENT_PROGRESS(id): /teacher/students/:id/progress
│   │   ├── STUDENT_OVERVIEW(id): /teacher/students/:id/overview
│   │   ├── STUDENT_STATS(id): /teacher/students/:id/stats
│   │   ├── STUDENT_NOTES(id): /teacher/students/:id/notes
│   │   ├── STUDENT_ADD_NOTE(id): /teacher/students/:id/note
│   │   ├── STUDENT_INSIGHTS(id): /teacher/students/:id/insights
│   │   └── STUDENT_BONUS(id): /teacher/students/:id/bonus ⭐ NEW
│   │
│   ├── ALERTS (7) ⭐ NEW MODULE
│   │   ├── BASE: /teacher/alerts
│   │   ├── BY_ID(id): /teacher/alerts/:id
│   │   ├── ACKNOWLEDGE(id): /teacher/alerts/:id/acknowledge
│   │   ├── RESOLVE(id): /teacher/alerts/:id/resolve
│   │   ├── DISMISS(id): /teacher/alerts/:id/dismiss
│   │   ├── STUDENT_HISTORY(studentId): /teacher/alerts/student/:studentId/history
│   │   └── GENERATE: /teacher/alerts/generate
│   │
│   ├── MESSAGES (7) ⭐ NEW MODULE
│   │   ├── BASE: /teacher/messages
│   │   ├── BY_ID(id): /teacher/messages/:id
│   │   ├── CONVERSATIONS: /teacher/messages/conversations
│   │   ├── UNREAD_COUNT: /teacher/messages/unread-count
│   │   ├── MARK_READ(id): /teacher/messages/:id/read
│   │   ├── CLASSROOM_ANNOUNCEMENT(cId): /teacher/messages/classroom/:cId/announcement
│   │   └── STUDENT_FEEDBACK(sId): /teacher/messages/student/:sId/feedback
│   │
│   ├── CONTENT (4) ⭐ NEW MODULE
│   │   ├── BASE: /teacher/content
│   │   ├── BY_ID(id): /teacher/content/:id
│   │   ├── CLONE(id): /teacher/content/:id/clone
│   │   └── PUBLISH(id): /teacher/content/:id/publish
│   │
│   ├── Submissions (3)
│   │   ├── SUBMISSIONS: /teacher/submissions
│   │   ├── SUBMISSION_BY_ID(id): /teacher/submissions/:id
│   │   ├── SUBMISSION_FEEDBACK(id): /teacher/submissions/:id/feedback
│   │   └── SUBMISSIONS_BULK_GRADE: /teacher/submissions/bulk-grade
│   │
│   ├── Assignments & Grades (4)
│   │   ├── ASSIGNMENTS: /teacher/assignments
│   │   ├── ASSIGNMENT_BY_ID(id): /teacher/assignments/:id
│   │   ├── GRADES: /teacher/grades
│   │   └── GRADE_BY_ID(id): /teacher/grades/:id
│   │
│   ├── Analytics (5) ⭐ NEW MODULE
│   │   ├── ANALYTICS: /teacher/analytics
│   │   ├── ANALYTICS_CLASSROOM(id): /teacher/analytics/classroom/:id
│   │   ├── ANALYTICS_ASSIGNMENT(id): /teacher/analytics/assignment/:id
│   │   ├── ANALYTICS_ENGAGEMENT: /teacher/analytics/engagement
│   │   └── ANALYTICS_REPORTS: /teacher/analytics/reports
│   │
│   └── Reports (3)
│       ├── REPORTS: /teacher/reports
│       ├── REPORT_BY_ID(id): /teacher/reports/:id
│       └── REPORTS_GENERATE: /teacher/reports/generate
│
│
└── ADMIN (108 endpoints)
    │
    ├── Dashboard (11)
    │   ├── DASHBOARD: /admin/dashboard
    │   ├── DASHBOARD_STATS: /admin/dashboard/stats
    │   ├── DASHBOARD_RECENT_ACTIVITY: /admin/dashboard/recent-activity
    │   ├── DASHBOARD_USER_STATS: /admin/dashboard/user-stats
    │   ├── DASHBOARD_ORGANIZATION_STATS: /admin/dashboard/organization-stats
    │   ├── DASHBOARD_MODERATION_QUEUE: /admin/dashboard/moderation-queue
    │   ├── DASHBOARD_CLASSROOM_OVERVIEW: /admin/dashboard/classroom-overview
    │   ├── DASHBOARD_ASSIGNMENT_STATS: /admin/dashboard/assignment-stats
    │   ├── DASHBOARD_ACTIONS_RECENT: /admin/dashboard/actions/recent
    │   ├── DASHBOARD_ALERTS: /admin/dashboard/alerts
    │   └── DASHBOARD_ANALYTICS_USER_ACTIVITY: /admin/dashboard/analytics/user-activity
    │
    ├── ALERTS (6) ⭐ NEW MODULE
    │   ├── BASE: /admin/alerts
    │   ├── BY_ID(id): /admin/alerts/:id
    │   ├── STATS_SUMMARY: /admin/alerts/stats/summary
    │   ├── ACKNOWLEDGE(id): /admin/alerts/:id/acknowledge
    │   ├── RESOLVE(id): /admin/alerts/:id/resolve
    │   └── SUPPRESS(id): /admin/alerts/:id/suppress
    │
    ├── ANALYTICS (8) ⭐ NEW MODULE
    │   ├── BASE: /admin/analytics
    │   ├── OVERVIEW: /admin/analytics/overview
    │   ├── ENGAGEMENT: /admin/analytics/engagement
    │   ├── GAMIFICATION: /admin/analytics/gamification
    │   ├── ACTIVITY_TIMELINE: /admin/analytics/activity-timeline
    │   ├── TOP_USERS: /admin/analytics/top-users
    │   ├── RETENTION: /admin/analytics/retention
    │   └── EXPORT: /admin/analytics/export
    │
    ├── MONITORING (6) ⭐ NEW MODULE
    │   ├── BASE: /admin/monitoring
    │   ├── METRICS: /admin/monitoring/metrics
    │   ├── METRICS_HISTORY: /admin/monitoring/metrics/history
    │   ├── ERRORS_STATS: /admin/monitoring/errors/stats
    │   ├── ERRORS_RECENT: /admin/monitoring/errors/recent
    │   └── ERRORS_TRENDS: /admin/monitoring/errors/trends
    │
    ├── PROGRESS (7) ⭐ NEW MODULE
    │   ├── BASE: /admin/progress
    │   ├── OVERVIEW: /admin/progress/overview
    │   ├── CLASSROOM(id): /admin/progress/classrooms/:id
    │   ├── STUDENT(id): /admin/progress/students/:id
    │   ├── MODULE(id): /admin/progress/modules/:id
    │   ├── EXERCISE(id): /admin/progress/exercises/:id
    │   └── EXPORT: /admin/progress/export
    │
    ├── REPORTS (4) ⭐ NEW MODULE
    │   ├── BASE: /admin/reports
    │   ├── GENERATE: /admin/reports/generate
    │   ├── BY_ID(id): /admin/reports/:id
    │   └── DOWNLOAD(id): /admin/reports/:id/download
    │
    ├── LOGS (1) ⭐ NEW MODULE
    │   └── LOGS: /admin/logs
    │
    ├── SYSTEM (13) ⭐ NEW MODULE
    │   ├── BASE: /admin/system
    │   ├── HEALTH: /admin/system/health
    │   ├── METRICS: /admin/system/metrics
    │   ├── AUDIT_LOG: /admin/system/audit-log
    │   ├── CONFIG: /admin/system/config
    │   ├── CONFIG_CATEGORY(cat): /admin/system/config/:cat
    │   ├── MAINTENANCE: /admin/system/maintenance
    │   ├── MAINTENANCE_CLEANUP_LOGS: /admin/system/maintenance/cleanup-logs
    │   ├── MAINTENANCE_CLEANUP_ACTIVITY: /admin/system/maintenance/cleanup-activity
    │   ├── MAINTENANCE_OPTIMIZE_DATABASE: /admin/system/maintenance/optimize-database
    │   ├── MAINTENANCE_CLEAR_CACHE: /admin/system/maintenance/clear-cache
    │   └── MAINTENANCE_CLEANUP_SESSIONS: /admin/system/maintenance/cleanup-sessions
    │
    ├── Organizations (5)
    │   ├── ORGANIZATIONS: /admin/organizations
    │   ├── ORGANIZATION_BY_ID(id): /admin/organizations/:id
    │   ├── ORGANIZATION_STATS(id): /admin/organizations/:id/stats
    │   ├── ORGANIZATION_USERS(id): /admin/organizations/:id/users
    │   ├── ORGANIZATION_SUBSCRIPTION(id): /admin/organizations/:id/subscription
    │   └── ORGANIZATION_FEATURES(id): /admin/organizations/:id/features
    │
    ├── Users Management (13)
    │   ├── USERS: /admin/users
    │   ├── USER_BY_ID(id): /admin/users/:id
    │   ├── USER_STATS: /admin/users/stats
    │   ├── USER_SUSPEND(id): /admin/users/:id/suspend
    │   ├── USER_ACTIVATE(id): /admin/users/:id/activate
    │   ├── USER_UNSUSPEND(id): /admin/users/:id/unsuspend
    │   ├── USER_DEACTIVATE(id): /admin/users/:id/deactivate
    │   ├── USER_RESET_PASSWORD(id): /admin/users/:id/reset-password
    │   ├── USER_BULK_SUSPEND: /admin/users/bulk/suspend
    │   ├── USER_BULK_DELETE: /admin/users/bulk/delete
    │   └── USER_BULK_UPDATE_ROLE: /admin/users/bulk/update-role
    │
    ├── ROLES (3) ⭐ NEW MODULE
    │   ├── BASE: /admin/roles
    │   ├── PERMISSIONS: /admin/roles/permissions
    │   └── ROLE_PERMISSIONS(id): /admin/roles/:id/permissions
    │
    ├── Classrooms (3)
    │   ├── CLASSROOMS: /admin/classrooms
    │   ├── CLASSROOM_BY_ID(id): /admin/classrooms/:id
    │   ├── CLASSROOM_TEACHERS(id): /admin/classrooms/:id/teachers
    │   └── CLASSROOM_STUDENTS(id): /admin/classrooms/:id/students
    │
    ├── CLASSROOM_TEACHERS_REST (4) ⭐ NEW MODULE
    │   ├── BASE: /admin/classroom-teachers
    │   ├── CLASSROOM_TEACHERS(cId): /admin/classrooms/:cId/teachers
    │   ├── TEACHER_CLASSROOMS(tId): /admin/teachers/:tId/classrooms
    │   └── BULK: /admin/classroom-teachers/bulk
    │
    ├── CONTENT (9) ⭐ NEW MODULE
    │   ├── BASE: /admin/content
    │   ├── PENDING: /admin/content/pending
    │   ├── EXERCISES_PENDING: /admin/content/exercises/pending
    │   ├── APPROVE(id): /admin/content/:id/approve
    │   ├── EXERCISES_APPROVE(id): /admin/content/exercises/:id/approve
    │   ├── REJECT(id): /admin/content/:id/reject
    │   ├── EXERCISES_REJECT(id): /admin/content/exercises/:id/reject
    │   ├── VERSION: /admin/content/version
    │   └── MEDIA: /admin/content/media
    │
    ├── BULK_OPERATIONS (6) ⭐ NEW MODULE
    │   ├── BASE: /admin/bulk-operations
    │   ├── SUSPEND_USERS: /admin/bulk-operations/suspend-users
    │   ├── ACTIVATE_USERS: /admin/bulk-operations/activate-users
    │   ├── UPDATE_ROLE: /admin/bulk-operations/update-role
    │   ├── DELETE_USERS: /admin/bulk-operations/delete-users
    │   └── BY_ID(id): /admin/bulk-operations/:id
    │
    └── GAMIFICATION_CONFIG (7)
        ├── BASE: /admin/gamification/config
        ├── SETTINGS: /admin/gamification/config/settings
        ├── PREVIEW: /admin/gamification/config/settings/preview
        ├── RESTORE_DEFAULTS: /admin/gamification/config/settings/restore-defaults
        ├── PARAMETERS: /admin/gamification/config/parameters
        ├── PARAMETER_BY_ID(id): /admin/gamification/config/parameters/:id
        ├── MAYA_RANKS: /admin/gamification/config/maya-ranks
        └── MAYA_RANK(name): /admin/gamification/config/maya-ranks/:name
```

---

## Estadísticas por Módulo

| Módulo | Endpoints | Tipo | Estado |
|--------|-----------|------|--------|
| **TEACHER.Dashboard** | 6 | Simple | ✅ Expandido |
| **TEACHER.Classrooms** | 11 | Complejo | ✅ Expandido |
| **TEACHER.Students** | 7 | Simple | ⭐ Nuevo |
| **TEACHER.ALERTS** | 7 | Complejo | ⭐ Nuevo |
| **TEACHER.MESSAGES** | 7 | Complejo | ⭐ Nuevo |
| **TEACHER.CONTENT** | 4 | Simple | ⭐ Nuevo |
| **TEACHER.Submissions** | 3 | Simple | ✅ Expandido |
| **TEACHER.Assignments** | 2 | Simple | Existente |
| **TEACHER.Grades** | 2 | Simple | Existente |
| **TEACHER.Analytics** | 5 | Simple | ⭐ Nuevo |
| **TEACHER.Reports** | 3 | Simple | ⭐ Nuevo |
| **ADMIN.Dashboard** | 11 | Simple | ✅ Expandido |
| **ADMIN.ALERTS** | 6 | Complejo | ⭐ Nuevo |
| **ADMIN.ANALYTICS** | 8 | Complejo | ⭐ Nuevo |
| **ADMIN.MONITORING** | 6 | Complejo | ⭐ Nuevo |
| **ADMIN.PROGRESS** | 7 | Complejo | ⭐ Nuevo |
| **ADMIN.REPORTS** | 4 | Complejo | ⭐ Nuevo |
| **ADMIN.LOGS** | 1 | Simple | ⭐ Nuevo |
| **ADMIN.SYSTEM** | 13 | Complejo | ⭐ Nuevo |
| **ADMIN.Organizations** | 5 | Simple | ✅ Expandido |
| **ADMIN.Users** | 13 | Simple | ✅ Expandido |
| **ADMIN.ROLES** | 3 | Complejo | ⭐ Nuevo |
| **ADMIN.Classrooms** | 3 | Simple | Existente |
| **ADMIN.CLASSROOM_TEACHERS_REST** | 4 | Complejo | ⭐ Nuevo |
| **ADMIN.CONTENT** | 9 | Complejo | ⭐ Nuevo |
| **ADMIN.BULK_OPERATIONS** | 6 | Complejo | ⭐ Nuevo |
| **ADMIN.GAMIFICATION_CONFIG** | 7 | Complejo | ✅ Reorganizado |

---

## Leyenda

- ⭐ **Nuevo**: Módulo agregado en esta actualización
- ✅ **Expandido**: Módulo existente con endpoints agregados
- **Existente**: Módulo sin cambios

---

**Fecha:** 2025-11-24  
**Total de endpoints:** 165  
**Cobertura:** 100% de controllers implementados
