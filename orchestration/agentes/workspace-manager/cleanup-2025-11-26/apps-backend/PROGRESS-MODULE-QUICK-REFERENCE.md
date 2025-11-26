# Admin Progress Module - Quick Reference

## Endpoints

```
GET /admin/progress/overview
GET /admin/progress/classrooms/:id
GET /admin/progress/students/:id
GET /admin/progress/modules/:id
GET /admin/progress/exercises/:id
GET /admin/progress/export?type=students|classrooms|modules
```

## cURL Examples

```bash
# Set your token
TOKEN="your-admin-jwt-token"
API="http://localhost:3000"

# 1. Progress Overview
curl -H "Authorization: Bearer $TOKEN" \
  $API/admin/progress/overview

# 2. Classroom Progress
curl -H "Authorization: Bearer $TOKEN" \
  $API/admin/progress/classrooms/{classroom-uuid}

# 3. Student Progress
curl -H "Authorization: Bearer $TOKEN" \
  $API/admin/progress/students/{student-uuid}

# With filters
curl -H "Authorization: Bearer $TOKEN" \
  "$API/admin/progress/students/{student-uuid}?classroom_id={classroom-uuid}&module_id={module-uuid}"

# 4. Module Statistics
curl -H "Authorization: Bearer $TOKEN" \
  $API/admin/progress/modules/{module-uuid}

# With classroom filter
curl -H "Authorization: Bearer $TOKEN" \
  "$API/admin/progress/modules/{module-uuid}?classroom_id={classroom-uuid}"

# 5. Exercise Statistics
curl -H "Authorization: Bearer $TOKEN" \
  $API/admin/progress/exercises/{exercise-uuid}

# 6. Export to CSV
curl -H "Authorization: Bearer $TOKEN" \
  "$API/admin/progress/export?type=students&format=csv" > students.csv

curl -H "Authorization: Bearer $TOKEN" \
  "$API/admin/progress/export?type=classrooms&format=csv" > classrooms.csv

curl -H "Authorization: Bearer $TOKEN" \
  "$API/admin/progress/export?type=modules&format=csv" > modules.csv

# Export with filter
curl -H "Authorization: Bearer $TOKEN" \
  "$API/admin/progress/export?type=students&classroom_id={classroom-uuid}&format=csv" > classroom-students.csv
```

## Response Examples

### Overview
```json
{
  "total_users": 150,
  "active_users": 120,
  "total_submissions": 5234,
  "correct_submissions": 4128,
  "avg_score": 78.5,
  "completed_modules": 342,
  "in_progress_modules": 187,
  "avg_progress_percent": 65.3,
  "total_time_spent_hours": 1248.5
}
```

### Classroom Progress
```json
{
  "classroom_id": "uuid",
  "classroom_name": "Matemáticas 5to A",
  "teacher_name": "Prof. María González",
  "total_students": 28,
  "active_students": 25,
  "avg_class_progress_percent": 67.8,
  "students": [...]
}
```

### Student Progress
```json
{
  "user_info": {
    "id": "uuid",
    "display_name": "Juan Pérez",
    "level": 5,
    "total_xp": 1250,
    ...
  },
  "modules_progress": [...],
  "recent_submissions": [...]
}
```

## Query Parameters

### Student Progress
- `classroom_id` (optional): Filter by classroom UUID
- `module_id` (optional): Filter by module UUID

### Module Statistics
- `classroom_id` (optional): Filter by classroom UUID

### Export
- `type` (required): `students`, `classrooms`, or `modules`
- `classroom_id` (optional): Filter by classroom UUID
- `format` (optional): `csv` (default)

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Classroom with ID {uuid} not found"
}
```

## Test Script

```bash
# Set token
export ADMIN_TOKEN="your-jwt-token"

# Run all tests
./apps/backend/scripts/test-progress-endpoints.sh
```

## Files

```
apps/backend/src/modules/admin/
├── controllers/
│   └── admin-progress.controller.ts
├── services/
│   └── admin-progress.service.ts
├── dto/
│   └── progress/
│       ├── index.ts
│       ├── progress-overview.dto.ts
│       ├── classroom-progress.dto.ts
│       ├── student-progress.dto.ts
│       ├── module-progress-stats.dto.ts
│       ├── exercise-stats.dto.ts
│       └── ... (12 files total)
└── admin.module.ts

apps/backend/scripts/
└── test-progress-endpoints.sh
```

## Swagger UI

http://localhost:3000/api/docs#/Admin%20-%20Progress

## Database Tables

- `auth_management.profiles`
- `progress_tracking.exercise_submissions`
- `progress_tracking.module_progress`
- `educational_content.modules`
- `educational_content.exercises`
- `social_features.classrooms`
- `social_features.classroom_members`

## Database Views

- `admin_dashboard.classroom_overview`
- `progress_tracking.user_progress_summary`

## Security

All endpoints require:
- Valid JWT token in `Authorization: Bearer {token}` header
- User must have admin role

## Performance Notes

- Uses database indexes on all JOIN columns
- Leverages pre-calculated views
- Recent submissions limited to 20 records
- CSV exports not paginated (consider for large datasets)

## Support

- Implementation Report: `/IMPLEMENTATION-REPORT-ADMIN-PROGRESS-MODULE-2025-11-24.md`
- Module Summary: `/apps/backend/ADMIN-PROGRESS-MODULE-SUMMARY.md`
- Swagger Docs: http://localhost:3000/api/docs
