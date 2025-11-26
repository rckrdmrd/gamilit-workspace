# Admin Interventions API - Quick Reference Guide

**Base URL:** `/admin/interventions`
**Auth Required:** Bearer Token (SUPER_ADMIN or ADMIN_TEACHER)

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/interventions` | List all alerts |
| GET | `/admin/interventions/:id` | Get specific alert |
| PATCH | `/admin/interventions/:id/acknowledge` | Acknowledge alert |
| PATCH | `/admin/interventions/:id/resolve` | Resolve alert |
| DELETE | `/admin/interventions/:id/dismiss` | Dismiss alert |

---

## 1. List All Alerts

**GET** `/admin/interventions`

### Query Parameters (all optional)

| Parameter | Type | Values | Example |
|-----------|------|--------|---------|
| severity | enum | low, medium, high, critical | `severity=critical` |
| status | enum | active, acknowledged, resolved, dismissed | `status=active` |
| alert_type | enum | no_activity, low_score, declining_trend, repeated_failures, excessive_time, low_engagement | `alert_type=low_score` |
| student_id | uuid | Student UUID | `student_id=123e4567...` |
| classroom_id | uuid | Classroom UUID | `classroom_id=123e4567...` |
| date_from | ISO date | Start date | `date_from=2025-01-01T00:00:00Z` |
| date_to | ISO date | End date | `date_to=2025-12-31T23:59:59Z` |
| page | integer | Page number (≥1) | `page=1` |
| limit | integer | Items per page (1-100) | `limit=20` |

### Example Request
```bash
curl -X GET \
  "http://localhost:3000/admin/interventions?severity=high&status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
```json
{
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "student_email": "juan@example.com",
      "classroom_id": "uuid",
      "classroom_name": "6to Grado A",
      "alert_type": "low_score",
      "severity": "high",
      "title": "Bajo rendimiento detectado",
      "description": "Promedio de 45% en últimos 3 ejercicios",
      "metrics": {
        "average_score": 45,
        "exercises_completed": 3
      },
      "status": "active",
      "generated_at": "2025-11-24T10:00:00Z",
      "tenant_id": "uuid",
      "created_at": "2025-11-24T10:00:00Z",
      "updated_at": "2025-11-24T10:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "total_pages": 2
}
```

---

## 2. Get Specific Alert

**GET** `/admin/interventions/:id`

### Example Request
```bash
curl -X GET \
  "http://localhost:3000/admin/interventions/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
Same as single alert object from list endpoint.

---

## 3. Acknowledge Alert

**PATCH** `/admin/interventions/:id/acknowledge`

Changes status from `active` → `acknowledged`

### Request Body
```json
{
  "acknowledgment_note": "Reviewing student and planning intervention"
}
```

Note: `acknowledgment_note` is optional

### Example Request
```bash
curl -X PATCH \
  "http://localhost:3000/admin/interventions/123e4567-e89b-12d3-a456-426614174000/acknowledge" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"acknowledgment_note": "Contacting parent"}'
```

### Response
Updated alert object with:
- `status`: "acknowledged"
- `acknowledged_by`: admin user ID
- `acknowledged_by_name`: admin display name
- `acknowledged_at`: timestamp

---

## 4. Resolve Alert

**PATCH** `/admin/interventions/:id/resolve`

Changes status from `active` or `acknowledged` → `resolved`

### Request Body
```json
{
  "resolution_notes": "Met with student and parent. Created study plan. Will monitor weekly."
}
```

Note: `resolution_notes` is **required** (min 10 characters)

### Example Request
```bash
curl -X PATCH \
  "http://localhost:3000/admin/interventions/123e4567-e89b-12d3-a456-426614174000/resolve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution_notes": "Met with student and parent. Identified learning gap in fractions. Created personalized study plan with additional support. Will monitor weekly."
  }'
```

### Response
Updated alert object with:
- `status`: "resolved"
- `resolved_by`: admin user ID
- `resolved_by_name`: admin display name
- `resolved_at`: timestamp
- `resolution_notes`: provided notes

---

## 5. Dismiss Alert

**DELETE** `/admin/interventions/:id/dismiss`

Changes status to `dismissed` (for false positives or non-actionable alerts)

### Example Request
```bash
curl -X DELETE \
  "http://localhost:3000/admin/interventions/123e4567-e89b-12d3-a456-426614174000/dismiss" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
Updated alert object with:
- `status`: "dismissed"

---

## Alert Types

| Type | Description | Example Trigger |
|------|-------------|-----------------|
| no_activity | Student has not logged in | No activity for 7+ days |
| low_score | Below average performance | Score < 60% |
| declining_trend | Performance decreasing | 3 consecutive score drops |
| repeated_failures | Multiple failed attempts | 3+ consecutive failures |
| excessive_time | Taking too long on exercises | Time > 2x expected |
| low_engagement | Not completing assignments | < 50% completion rate |

---

## Severity Levels

| Severity | Priority | Color Code | When Used |
|----------|----------|------------|-----------|
| critical | 1 (highest) | Red | Immediate action required |
| high | 2 | Orange | Urgent attention needed |
| medium | 3 | Yellow | Should be addressed soon |
| low | 4 (lowest) | Blue | Monitor situation |

---

## Status Workflow

```
active (initial state)
  ↓
  → acknowledge → acknowledged
                    ↓
                    → resolve → resolved
  → dismiss → dismissed
```

**State Transitions:**
- `active` → `acknowledged` (acknowledge endpoint)
- `active` → `resolved` (resolve endpoint - skip acknowledgment)
- `acknowledged` → `resolved` (resolve endpoint)
- Any state → `dismissed` (dismiss endpoint)

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Intervention alert can only be acknowledged when status is 'active'. Current status: acknowledged",
  "error": "Bad Request"
}
```

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
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Intervention alert with ID 123e4567-... not found",
  "error": "Not Found"
}
```

---

## Common Filter Combinations

### Critical Active Alerts
```
GET /admin/interventions?severity=critical&status=active
```

### All Alerts for a Student
```
GET /admin/interventions?student_id=<UUID>
```

### Low Score Alerts in Last Week
```
GET /admin/interventions?alert_type=low_score&date_from=2025-11-17T00:00:00Z
```

### Classroom Alerts Needing Attention
```
GET /admin/interventions?classroom_id=<UUID>&status=active&severity=high
```

### Recent Resolved Cases
```
GET /admin/interventions?status=resolved&date_from=2025-11-01T00:00:00Z
```

---

## JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000';
const token = 'YOUR_JWT_TOKEN';

// List alerts
const listAlerts = async () => {
  const response = await axios.get(`${API_BASE}/admin/interventions`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      severity: 'high',
      status: 'active',
      page: 1,
      limit: 20
    }
  });
  return response.data;
};

// Acknowledge alert
const acknowledgeAlert = async (alertId: string, note?: string) => {
  const response = await axios.patch(
    `${API_BASE}/admin/interventions/${alertId}/acknowledge`,
    { acknowledgment_note: note },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Resolve alert
const resolveAlert = async (alertId: string, notes: string) => {
  const response = await axios.patch(
    `${API_BASE}/admin/interventions/${alertId}/resolve`,
    { resolution_notes: notes },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Dismiss alert
const dismissAlert = async (alertId: string) => {
  const response = await axios.delete(
    `${API_BASE}/admin/interventions/${alertId}/dismiss`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
```

---

## Testing Script

Use the provided test script:

```bash
./apps/backend/scripts/test-interventions-endpoints.sh <JWT_TOKEN>
```

---

## Swagger Documentation

Full interactive API documentation available at:
```
http://localhost:3000/api-docs
```

Look for the **"Admin - Interventions"** tag.

---

## Related Database

**Table:** `progress_tracking.student_intervention_alerts`
**Function:** `progress_tracking.generate_student_alerts()`

Alerts are automatically generated by database triggers on:
- Exercise submissions
- Module progress updates
- User activity tracking

---

## Support

For issues or questions:
- Check Swagger docs: `/api-docs`
- Review implementation report: `IMPLEMENTATION-REPORT-ADMIN-INTERVENTIONS-BE-001.md`
- Test script: `scripts/test-interventions-endpoints.sh`
