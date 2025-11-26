# Admin Analytics Module - Quick Reference Guide

## Base URL
```
http://localhost:3000/api/admin/analytics
```

## Authentication
All endpoints require:
- Valid JWT token in Authorization header
- Admin role (enforced by AdminGuard)

```bash
Authorization: Bearer <your-jwt-token>
```

---

## 7 Endpoints Reference

### 1. Analytics Overview
```bash
GET /admin/analytics/overview
```

**Response:**
```json
{
  "total_users": 1250,
  "total_students": 1000,
  "total_teachers": 50,
  "active_users": 850,
  "avg_xp": 1523.45,
  "avg_exercises_completed": 12.8,
  "avg_engagement_score": 67.5,
  "inactive_users": 120,
  "beginner_users": 450,
  "intermediate_users": 380,
  "advanced_users": 300
}
```

---

### 2. Engagement Analytics
```bash
GET /admin/analytics/engagement
GET /admin/analytics/engagement?role=student
GET /admin/analytics/engagement?date_from=2025-01-01T00:00:00Z
```

**Query Parameters:**
- `role` (optional): Filter by role (e.g., "student", "admin_teacher")
- `date_from` (optional): ISO date string

**Response:**
```json
{
  "by_segment": [
    {
      "user_segment": "advanced",
      "users_count": 300,
      "avg_engagement_score": 85.5,
      "avg_exercises_completed": 25.3,
      "avg_streak": 12.5,
      "active_last_7d": 280,
      "active_last_30d": 295
    }
  ]
}
```

---

### 3. Gamification Analytics
```bash
GET /admin/analytics/gamification
```

**Response:**
```json
{
  "xp_distribution": [
    { "xp_range": "0 XP", "users_count": 120 },
    { "xp_range": "1-100 XP", "users_count": 450 }
  ],
  "ranks_distribution": [
    {
      "current_rank": "halach_uinik",
      "users_count": 120,
      "avg_xp": 5280.5,
      "avg_exercises": 42.3
    }
  ],
  "levels_distribution": [
    { "current_level": 1, "users_count": 230 },
    { "current_level": 2, "users_count": 180 }
  ]
}
```

---

### 4. Activity Timeline
```bash
GET /admin/analytics/activity-timeline
GET /admin/analytics/activity-timeline?days=7
GET /admin/analytics/activity-timeline?days=90
```

**Query Parameters:**
- `days` (optional, default: 30): Number of days (1-90)

**Response:**
```json
{
  "timeline": [
    {
      "activity_date": "2025-11-24",
      "unique_users": 245,
      "total_activities": 1230,
      "exercises_completed": 580,
      "modules_completed": 45,
      "logins": 320
    }
  ]
}
```

---

### 5. Top Users
```bash
GET /admin/analytics/top-users?metric=xp
GET /admin/analytics/top-users?metric=exercises&limit=5
GET /admin/analytics/top-users?metric=streak&role=student&limit=20
```

**Query Parameters:**
- `metric` (required): "xp" | "exercises" | "streak"
- `role` (optional): Filter by role
- `limit` (optional, default: 10): Number of users (1-100)

**Response:**
```json
{
  "metric": "xp",
  "users": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "display_name": "Juan Pérez",
      "email": "juan.perez@example.com",
      "role": "student",
      "total_xp": 5280,
      "exercises_completed": 42,
      "current_streak": 15,
      "current_rank": "halach_uinik",
      "current_level": 8,
      "engagement_score": 85.5
    }
  ]
}
```

---

### 6. Retention Analytics
```bash
GET /admin/analytics/retention
```

**Response:**
```json
{
  "cohorts": [
    {
      "cohort_month": "2025-11-01T00:00:00Z",
      "cohort_size": 150,
      "retained_users": 125,
      "retention_rate": 83.33
    }
  ]
}
```

---

### 7. Export Analytics
```bash
GET /admin/analytics/export?type=overview
GET /admin/analytics/export?type=users
GET /admin/analytics/export?type=engagement
GET /admin/analytics/export?type=gamification
```

**Query Parameters:**
- `type` (required): "overview" | "users" | "engagement" | "gamification"
- `format` (optional, default: "csv"): Export format

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="analytics-{type}-{date}.csv"`
- CSV data in response body

---

## cURL Examples

### Login (Get Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourpassword"
  }'
```

### Get Analytics Overview
```bash
curl -X GET http://localhost:3000/api/admin/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq
```

### Get Top 10 Users by XP
```bash
curl -X GET "http://localhost:3000/api/admin/analytics/top-users?metric=xp&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq
```

### Export Users Data to CSV
```bash
curl -X GET "http://localhost:3000/api/admin/analytics/export?type=users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o analytics-users.csv
```

---

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not an admin user |
| 500 | Internal Server Error | Server error |

---

## Testing Script

Run the comprehensive test script:
```bash
chmod +x apps/backend/scripts/test-analytics-endpoints.sh
./apps/backend/scripts/test-analytics-endpoints.sh
```

The script will:
1. Prompt for admin credentials
2. Test all 7 endpoints
3. Test various parameter combinations
4. Export and save CSV files
5. Test error handling
6. Display formatted results

---

## Swagger Documentation

Interactive API documentation:
```
http://localhost:3000/api-docs#/Admin%20-%20Analytics
```

Features:
- Try out endpoints directly
- View request/response schemas
- See parameter documentation
- Test authentication

---

## Query Performance Tips

1. **Use filters when possible**
   - Filter by role to reduce dataset
   - Use date_from to limit historical data

2. **Optimize timeline queries**
   - Request only needed days
   - Use smaller date ranges for faster responses

3. **Limit top users results**
   - Use smaller limits (10-20) for quick responses
   - Avoid requesting 100 users unless necessary

4. **Export considerations**
   - Users export is the largest (all user data)
   - Overview and engagement exports are quick
   - Gamification export has multiple sections

---

## Common Use Cases

### Dashboard Overview
```bash
GET /admin/analytics/overview
GET /admin/analytics/engagement
GET /admin/analytics/activity-timeline?days=7
```

### User Engagement Report
```bash
GET /admin/analytics/engagement?role=student
GET /admin/analytics/top-users?metric=xp&role=student&limit=20
GET /admin/analytics/retention
```

### Gamification Analysis
```bash
GET /admin/analytics/gamification
GET /admin/analytics/top-users?metric=xp&limit=50
GET /admin/analytics/top-users?metric=streak&limit=20
```

### Weekly Activity Report
```bash
GET /admin/analytics/activity-timeline?days=7
GET /admin/analytics/top-users?metric=exercises&limit=10
GET /admin/analytics/engagement
```

### Data Export for External Analysis
```bash
GET /admin/analytics/export?type=users
GET /admin/analytics/export?type=engagement
GET /admin/analytics/export?type=gamification
```

---

## Troubleshooting

### "Unauthorized" Error
- Check if JWT token is valid
- Ensure token is not expired
- Verify Authorization header format

### "Forbidden" Error
- Verify user has admin role
- Check AdminGuard configuration
- Review user roles in database

### Empty Results
- Check if database has data
- Verify materialized view is populated
- Ensure activity logs are being created

### Slow Queries
- Check materialized view refresh status
- Verify indexes exist
- Monitor database connection pool

---

## Database Requirements

### Required Tables/Views
1. `admin_dashboard.user_analytics_mv` (materialized view)
2. `audit_logging.user_activity_logs` (for timeline)
3. `auth_management.profiles`
4. `gamification_system.user_stats`

### Required Indexes
- `idx_user_analytics_mv_user` (user_id)
- `idx_user_analytics_mv_role` (role)
- `idx_user_analytics_mv_segment` (user_segment)

---

## Support

For issues or questions:
1. Check implementation report: `IMPLEMENTATION-REPORT-ADMIN-ANALYTICS-MODULE-2025-11-24.md`
2. Review Swagger documentation: `/api-docs`
3. Run test script for diagnostics
4. Check server logs for errors

---

**Last Updated:** 2025-11-24
**Version:** 1.0.0
**Module:** Admin Analytics (Plan 2)
