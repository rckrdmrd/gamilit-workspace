# Exercise Responses API - Quick Reference

**Module:** Teacher - Exercise Responses
**Date:** 2025-11-24

---

## 🚀 Quick Start

### Testing the API

```bash
# 1. Start backend
cd apps/backend
npm run start:dev

# 2. Get a teacher JWT token (login via /api/auth/login)

# 3. Run test script
export TEACHER_JWT_TOKEN="your_token_here"
./scripts/test-exercise-responses.sh
```

---

## 📋 Endpoints Summary

### Base URL: `/api/teacher`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attempts` | GET | Get paginated list with filters |
| `/attempts/:id` | GET | Get attempt detail |
| `/attempts/student/:studentId` | GET | Get student's attempts |
| `/exercises/:exerciseId/responses` | GET | Get exercise responses |

---

## 🔑 Common Query Patterns

### Get all attempts (paginated)
```bash
GET /api/teacher/attempts?page=1&limit=20
```

### Get correct attempts only
```bash
GET /api/teacher/attempts?is_correct=true
```

### Get attempts for specific student
```bash
GET /api/teacher/attempts/student/{studentId}
```

### Get attempts for specific exercise
```bash
GET /api/teacher/exercises/{exerciseId}/responses
```

### Get attempts in date range
```bash
GET /api/teacher/attempts?from_date=2024-01-01T00:00:00Z&to_date=2024-12-31T23:59:59Z
```

### Get attempts sorted by score
```bash
GET /api/teacher/attempts?sort_by=score&sort_order=desc&limit=10
```

### Get attempts for specific classroom
```bash
GET /api/teacher/attempts?classroom_id={classroomId}
```

---

## 📊 Response Structure

### Paginated List Response
```json
{
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "Juan Pérez",
      "exercise_id": "uuid",
      "exercise_title": "Comprensión Lectora",
      "module_name": "Módulo 1: Lectura Literal",
      "attempt_number": 1,
      "submitted_answers": {},
      "is_correct": true,
      "score": 85,
      "time_spent_seconds": 120,
      "hints_used": 2,
      "comodines_used": ["pistas"],
      "xp_earned": 50,
      "ml_coins_earned": 10,
      "submitted_at": "2024-11-24T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

### Detail Response
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "student_name": "Juan Pérez",
  "exercise_id": "uuid",
  "exercise_title": "Comprensión Lectora",
  "module_name": "Módulo 1: Lectura Literal",
  "attempt_number": 1,
  "submitted_answers": { "answers": ["A", "B", "C"] },
  "is_correct": true,
  "score": 85,
  "time_spent_seconds": 120,
  "hints_used": 2,
  "comodines_used": ["pistas"],
  "xp_earned": 50,
  "ml_coins_earned": 10,
  "submitted_at": "2024-11-24T10:30:00Z",
  "correct_answer": { "answers": ["A", "B", "C"] },
  "exercise_type": "multiple_choice",
  "max_score": 100
}
```

---

## 🔧 Query Parameters

### Filters
- `student_id` (UUID) - Filter by student
- `exercise_id` (UUID) - Filter by exercise
- `module_id` (UUID) - Filter by module
- `classroom_id` (UUID) - Filter by classroom
- `from_date` (ISO 8601) - Start date
- `to_date` (ISO 8601) - End date
- `is_correct` (boolean) - Filter by correctness

### Pagination
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page

### Sorting
- `sort_by` (submitted_at | score | time) - Sort field
- `sort_order` (asc | desc) - Sort direction

---

## 🔒 Authentication

All endpoints require:

```
Authorization: Bearer {jwt_token}
```

Role required: `ADMIN_TEACHER` or `SUPER_ADMIN`

---

## ⚠️ Error Responses

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
  "message": "Teacher does not have access to student {studentId}"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Attempt {attemptId} not found or access denied"
}
```

---

## 📁 File Locations

### Backend
- DTOs: `apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts`
- Service: `apps/backend/src/modules/teacher/services/exercise-responses.service.ts`
- Controller: `apps/backend/src/modules/teacher/controllers/exercise-responses.controller.ts`
- Module: `apps/backend/src/modules/teacher/teacher.module.ts`

### Tests
- Script: `apps/backend/scripts/test-exercise-responses.sh`

### Documentation
- Implementation: `apps/backend/EXERCISE-RESPONSES-IMPLEMENTATION-REPORT.md`
- Frontend Guide: `apps/backend/EXERCISE-RESPONSES-FRONTEND-INTEGRATION.md`
- Summary: `EXERCISE-RESPONSES-SUMMARY.md`

---

## 🎯 Common Use Cases

### 1. Teacher Dashboard - Recent Activity
```typescript
// Show last 10 attempts across all classrooms
GET /api/teacher/attempts?limit=10&sort_by=submitted_at&sort_order=desc
```

### 2. Student Profile - All Attempts
```typescript
// Show all attempts for specific student
GET /api/teacher/attempts/student/{studentId}
```

### 3. Exercise Analytics - Performance
```typescript
// Analyze exercise performance
GET /api/teacher/exercises/{exerciseId}/responses
```

### 4. Classroom Monitoring - Today's Activity
```typescript
// Show today's attempts in classroom
GET /api/teacher/attempts?classroom_id={id}&from_date={today}
```

### 5. Intervention Alerts - Struggling Students
```typescript
// Find students with incorrect attempts
GET /api/teacher/attempts?is_correct=false&classroom_id={id}
```

---

## 💡 Tips

### Efficient Queries
- Use `classroom_id` filter to reduce dataset
- Use pagination for large result sets
- Cache module/exercise metadata
- Use specific filters to reduce query time

### Best Practices
- Always include pagination parameters
- Use appropriate page sizes (20-50 for UI, 100 for exports)
- Filter by date range for performance reports
- Sort by `submitted_at` for chronological views
- Sort by `score` for performance rankings

### Frontend Integration
- Create reusable hooks for common queries
- Implement client-side caching
- Use optimistic updates when possible
- Handle loading and error states

---

## 🔗 Swagger Documentation

Access interactive API documentation at:

```
http://localhost:3000/api/docs
```

Search for: **Teacher - Exercise Responses**

---

## 📞 Support

For questions or issues:
- Check implementation report for detailed information
- Review frontend integration guide for examples
- Run test script to verify endpoints
- Contact Backend-Agent for assistance

---

**Last Updated:** 2025-11-24
**Version:** 1.0.0
**Status:** Production Ready ✅
