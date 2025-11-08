# API Specification - Teacher Portal

> **⚠️ RFC-0001 VIOLATION - MODULARIZACIÓN REQUERIDA**
>
> Este archivo tiene 1,998 líneas (5.0x el límite de 400L según RFC-0001).
>
> **PENDIENTE:** Este archivo debe ser modularizado en:
> - `teacher-api/README.md` - Índice principal
> - `teacher-api/01-CLASSROOM-MANAGEMENT.md` - Gestión de aulas
> - `teacher-api/02-ASSIGNMENTS.md` - Asignaciones y tareas
> - `teacher-api/03-STUDENT-PROGRESS.md` - Seguimiento de estudiantes
> - `teacher-api/04-ANALYTICS.md` - Analíticas y reportes
>
> **TODO:** Crear subdirectorio `teacher-api/` y dividir este archivo (estimado: 3-5 horas).
>
> ---

## Overview

- **Base URL:** `/api/teacher`
- **Authentication:** JWT Bearer Token (required)
- **Role Required:** `teacher`
- **Total Endpoints:** 29
- **API Version:** v1.0
- **Last Updated:** 2025-10-28

## Authentication

All endpoints require JWT authentication with `role=teacher`.

**Request Header:**
```
Authorization: Bearer <jwt_token>
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Response Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 900
  }
}
```

---

## Endpoints por Módulo

### 1. Classrooms Management (8 endpoints)

#### 1.1 POST /api/teacher/classrooms
**Description:** Create a new classroom
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "name": "Math 101",
  "description": "Advanced Mathematics for Grade 6",
  "school_id": "uuid-optional",
  "grade_level": "6",
  "subject": "Mathematics"
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `school_id`: Optional, valid UUID
- `grade_level`: Optional, max 50 characters
- `subject`: Optional, max 100 characters

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "classroom-uuid",
    "teacher_id": "teacher-uuid",
    "name": "Math 101",
    "description": "Advanced Mathematics for Grade 6",
    "school_id": "school-uuid",
    "grade_level": "6",
    "subject": "Mathematics",
    "is_active": true,
    "created_at": "2025-10-28T10:00:00Z",
    "updated_at": "2025-10-28T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a teacher

---

#### 1.2 GET /api/teacher/classrooms
**Description:** List teacher's classrooms with pagination and filters
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page (10, 25, 50, 100) |
| is_active | boolean | - | Filter by active status |
| subject | string | - | Filter by subject |
| grade_level | string | - | Filter by grade level |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "classroom-uuid",
      "teacher_id": "teacher-uuid",
      "name": "Math 101",
      "description": "Advanced Mathematics",
      "subject": "Mathematics",
      "grade_level": "6",
      "is_active": true,
      "students_count": 24,
      "created_at": "2025-10-15T10:00:00Z",
      "updated_at": "2025-10-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 25,
    "totalPages": 2
  }
}
```

---

#### 1.3 GET /api/teacher/classrooms/:id
**Description:** Get classroom details with statistics
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "classroom-uuid",
    "teacher_id": "teacher-uuid",
    "name": "Math 101",
    "description": "Advanced Mathematics",
    "subject": "Mathematics",
    "grade_level": "6",
    "is_active": true,
    "created_at": "2025-10-15T10:00:00Z",
    "updated_at": "2025-10-15T10:00:00Z",
    "stats": {
      "total_students": 24,
      "active_assignments": 5,
      "avg_grade": 85.5
    }
  }
}
```

**Error Responses:**
- `403 Forbidden`: Not the classroom owner
- `404 Not Found`: Classroom doesn't exist

---

#### 1.4 PUT /api/teacher/classrooms/:id
**Description:** Update classroom information
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "name": "Math 101 - Updated",
  "description": "Updated description",
  "grade_level": "7",
  "subject": "Mathematics"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "classroom-uuid",
    "teacher_id": "teacher-uuid",
    "name": "Math 101 - Updated",
    "description": "Updated description",
    "grade_level": "7",
    "subject": "Mathematics",
    "is_active": true,
    "created_at": "2025-10-15T10:00:00Z",
    "updated_at": "2025-10-28T14:30:00Z"
  }
}
```

---

#### 1.5 DELETE /api/teacher/classrooms/:id
**Description:** Soft delete classroom (sets is_active=false)
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Classroom deleted successfully"
}
```

**Notes:**
- Soft delete: Sets `is_active=false`
- Students are preserved
- Assignment history is preserved

---

#### 1.6 GET /api/teacher/classrooms/:id/students
**Description:** List students in classroom
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john.doe@school.edu",
      "avatar_url": "https://...",
      "enrolled_at": "2025-10-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

---

#### 1.7 POST /api/teacher/classrooms/:id/students
**Description:** Add students to classroom (batch operation)
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "student_ids": [
    "student-uuid-1",
    "student-uuid-2",
    "student-uuid-3"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "successful": [
      {
        "student_id": "student-uuid-1",
        "student_name": "John Doe",
        "enrolled_at": "2025-10-28T14:30:00Z"
      },
      {
        "student_id": "student-uuid-2",
        "student_name": "Jane Smith",
        "enrolled_at": "2025-10-28T14:30:00Z"
      }
    ],
    "failed": [
      {
        "student_id": "student-uuid-3",
        "reason": "Student not found"
      }
    ]
  },
  "meta": {
    "total": 3,
    "successful_count": 2,
    "failed_count": 1
  }
}
```

---

#### 1.8 DELETE /api/teacher/classrooms/:id/students/:studentId
**Description:** Remove student from classroom
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student removed from classroom successfully"
}
```

**Notes:**
- Removes enrollment record
- Preserves student's submission history

---

### 2. Assignments Management (8 endpoints)

#### 2.1 POST /api/teacher/assignments
**Description:** Create a new assignment
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "title": "Chapter 5 Quiz",
  "description": "<p>Complete all questions in Chapter 5. <strong>Show your work</strong> for full credit.</p>",
  "type": "quiz",
  "max_points": 100,
  "deadline": "2025-10-30T23:59:59Z",
  "instructions": "<p>You have 60 minutes to complete this quiz.</p>",
  "resources": [
    {
      "url": "https://example.com/chapter5.pdf"
    },
    {
      "file_id": "file-uuid"
    }
  ]
}
```

**Validation Rules:**
- `title`: Required, 1-255 characters
- `description`: Optional, rich text HTML (sanitized), max 10,000 characters
- `type`: Required, enum: `quiz`, `homework`, `project`, `exam`, `discussion`
- `max_points`: Required, 1-1000
- `deadline`: Optional, ISO 8601 datetime
- `instructions`: Optional, rich text HTML (sanitized)
- `resources`: Optional, array of URL or file_id objects

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "assignment-uuid",
    "teacher_id": "teacher-uuid",
    "title": "Chapter 5 Quiz",
    "description": "<p>Complete all questions in Chapter 5. <strong>Show your work</strong> for full credit.</p>",
    "type": "quiz",
    "max_points": 100,
    "deadline": "2025-10-30T23:59:59Z",
    "instructions": "<p>You have 60 minutes to complete this quiz.</p>",
    "resources": [
      {
        "url": "https://example.com/chapter5.pdf"
      }
    ],
    "is_active": true,
    "created_at": "2025-10-28T10:00:00Z",
    "updated_at": "2025-10-28T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data (e.g., max_points <= 0)

---

#### 2.2 GET /api/teacher/assignments
**Description:** List teacher's assignments with filters
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page (10, 25, 50, 100) |
| status | string | - | Filter: `active`, `draft`, `archived` |
| type | string | - | Filter: `quiz`, `homework`, `project`, `exam`, `discussion` |
| classroom_id | string | - | Filter by classroom UUID |
| search | string | - | Search in title/description |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment-uuid",
      "teacher_id": "teacher-uuid",
      "title": "Chapter 5 Quiz",
      "type": "quiz",
      "max_points": 100,
      "deadline": "2025-10-30T23:59:59Z",
      "is_active": true,
      "stats": {
        "total_assigned": 24,
        "submissions_count": 18,
        "graded_count": 12,
        "avg_score": 85.5
      },
      "created_at": "2025-10-28T10:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 25,
    "totalPages": 2
  }
}
```

---

#### 2.3 GET /api/teacher/assignments/:id
**Description:** Get assignment details with statistics
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "assignment-uuid",
    "teacher_id": "teacher-uuid",
    "title": "Chapter 5 Quiz",
    "description": "<p>Complete all questions...</p>",
    "type": "quiz",
    "max_points": 100,
    "deadline": "2025-10-30T23:59:59Z",
    "instructions": "<p>You have 60 minutes...</p>",
    "resources": [],
    "is_active": true,
    "created_at": "2025-10-28T10:00:00Z",
    "updated_at": "2025-10-28T10:00:00Z",
    "stats": {
      "total_assigned": 24,
      "submissions_count": 18,
      "graded_count": 12,
      "pending_count": 6,
      "avg_score": 85.5,
      "completion_rate": 75.0
    }
  }
}
```

---

#### 2.4 PUT /api/teacher/assignments/:id
**Description:** Update assignment (only if no submissions exist)
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "title": "Chapter 5 Quiz - Updated",
  "description": "<p>Updated description...</p>",
  "max_points": 120,
  "deadline": "2025-11-05T23:59:59Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "assignment-uuid",
    "title": "Chapter 5 Quiz - Updated",
    "description": "<p>Updated description...</p>",
    "max_points": 120,
    "deadline": "2025-11-05T23:59:59Z",
    "updated_at": "2025-10-28T15:00:00Z"
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity`: Assignment has existing submissions

```json
{
  "success": false,
  "error": {
    "code": "ASSIGNMENT_HAS_SUBMISSIONS",
    "message": "Cannot update assignment with existing submissions",
    "details": {
      "submissions_count": 18
    }
  }
}
```

---

#### 2.5 DELETE /api/teacher/assignments/:id
**Description:** Soft delete assignment (sets is_active=false)
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

**Notes:**
- Soft delete: Sets `is_active=false`
- Submissions are preserved

---

#### 2.6 POST /api/teacher/assignments/:id/assign
**Description:** Assign assignment to one or multiple classrooms
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "classroom_ids": [
    "classroom-uuid-1",
    "classroom-uuid-2"
  ],
  "due_date": "2025-11-05T23:59:59Z"
}
```

**Validation Rules:**
- `classroom_ids`: Required, array of valid UUIDs
- `due_date`: Optional, overrides assignment deadline for these classrooms

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assignment_id": "assignment-uuid",
    "assigned_to": [
      {
        "classroom_id": "classroom-uuid-1",
        "classroom_name": "Math 101",
        "students_count": 24,
        "assigned_at": "2025-10-28T15:00:00Z"
      },
      {
        "classroom_id": "classroom-uuid-2",
        "classroom_name": "Math 102",
        "students_count": 28,
        "assigned_at": "2025-10-28T15:00:00Z"
      }
    ]
  },
  "meta": {
    "total_students_assigned": 52
  }
}
```

---

#### 2.7 GET /api/teacher/assignments/:id/submissions
**Description:** View all submissions for an assignment
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter: `pending`, `submitted`, `graded`, `late` |
| classroom_id | string | - | Filter by classroom UUID |
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "submission-uuid",
      "assignment_id": "assignment-uuid",
      "student_id": "student-uuid",
      "student_name": "John Doe",
      "student_email": "john.doe@school.edu",
      "classroom_id": "classroom-uuid",
      "classroom_name": "Math 101",
      "status": "graded",
      "submitted_at": "2025-10-28T14:30:00Z",
      "graded_at": "2025-10-29T10:00:00Z",
      "points_earned": 85,
      "late": false
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

---

#### 2.8 POST /api/teacher/assignments/:id/grade
**Description:** Grade a submission (quick grade endpoint, also in Grading module)
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "submission_id": "submission-uuid",
  "points_earned": 85,
  "feedback": "<p>Good work! <strong>Watch calculations</strong> on question 3.</p>"
}
```

**Validation Rules:**
- `submission_id`: Required, valid UUID
- `points_earned`: Required, 0 <= points <= assignment.max_points
- `feedback`: Optional, rich text HTML (sanitized), max 2000 characters

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-uuid",
    "points_earned": 85,
    "feedback": "<p>Good work! <strong>Watch calculations</strong> on question 3.</p>",
    "status": "graded",
    "graded_at": "2025-10-29T10:00:00Z",
    "graded_by": "teacher-uuid",
    "notification_sent": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Points out of range
- `403 Forbidden`: No access to this submission
- `404 Not Found`: Submission doesn't exist

---

### 3. Grading System (4 endpoints)

#### 3.1 GET /api/teacher/grading/pending
**Description:** List submissions pending grading (grading queue)
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page (10, 25, 50, 100) |
| classroom_id | string | - | Filter by classroom |
| assignment_id | string | - | Filter by assignment |
| student_id | string | - | Filter by student |
| sort | string | oldest | Sort: `oldest`, `newest`, `priority` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "submission-uuid",
      "assignment_id": "assignment-uuid",
      "assignment_title": "Chapter 5 Quiz",
      "student_id": "student-uuid",
      "student_name": "John Doe",
      "student_email": "john.doe@school.edu",
      "classroom_id": "classroom-uuid",
      "classroom_name": "Math 101",
      "content": "Student's submission content...",
      "submitted_at": "2025-10-28T14:30:00Z",
      "deadline": "2025-10-30T23:59:59Z",
      "late": false,
      "days_waiting": 2
    }
  ],
  "meta": {
    "total": 50,
    "pending_count": 50,
    "page": 1,
    "limit": 25,
    "totalPages": 2
  }
}
```

---

#### 3.2 GET /api/teacher/grading/:submissionId
**Description:** View submission details for grading
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "assignment": {
      "id": "assignment-uuid",
      "title": "Chapter 5 Quiz",
      "description": "<p>Complete all questions...</p>",
      "type": "quiz",
      "max_points": 100,
      "instructions": "<p>Show your work...</p>"
    },
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john.doe@school.edu",
      "avatar_url": "https://..."
    },
    "classroom": {
      "id": "classroom-uuid",
      "name": "Math 101"
    },
    "content": "Student's submission content...",
    "attachments": [
      {
        "id": "attachment-uuid",
        "filename": "solution.pdf",
        "url": "https://storage.../solution.pdf",
        "size": 1024000
      }
    ],
    "submitted_at": "2025-10-28T14:30:00Z",
    "deadline": "2025-10-30T23:59:59Z",
    "late": false,
    "status": "pending",
    "points_earned": null,
    "feedback": null,
    "graded_at": null,
    "graded_by": null,
    "previous_submissions": [
      {
        "id": "prev-submission-uuid",
        "submitted_at": "2025-10-27T10:00:00Z",
        "points_earned": 75
      }
    ]
  }
}
```

---

#### 3.3 POST /api/teacher/grading/:submissionId/grade
**Description:** Grade a submission with points and feedback
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "points_earned": 85,
  "feedback": "<p>Good work! <strong>Improve</strong> calculations on #3.</p>",
  "status": "graded",
  "notify_student": true
}
```

**Validation Rules:**
- `points_earned`: Required, 0 <= points <= assignment.max_points
- `feedback`: Optional, rich text HTML (sanitized), max 2000 characters
- `status`: Optional, enum: `graded`, `pending_review`, `needs_revision`. Default: `graded`
- `notify_student`: Optional, boolean. Default: `true`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-uuid",
    "points_earned": 85,
    "feedback": "<p>Good work! <strong>Improve</strong> calculations on #3.</p>",
    "status": "graded",
    "graded_at": "2025-10-29T10:00:00Z",
    "graded_by": "teacher-uuid",
    "notification_sent": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid points (< 0 or > max_points)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_POINTS",
    "message": "Points cannot exceed max points (100)",
    "details": {
      "points_earned": 120,
      "max_points": 100
    }
  }
}
```

- `403 Forbidden`: No access to this submission
- `404 Not Found`: Submission doesn't exist
- `422 Unprocessable Entity`: Already graded (if re-grading not allowed)

---

#### 3.4 POST /api/teacher/grading/:submissionId/feedback
**Description:** Add or update feedback without changing grade
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "feedback": "<p>Additional feedback: <strong>Great improvement</strong> on problem-solving approach.</p>",
  "notify_student": false
}
```

**Validation Rules:**
- `feedback`: Required, rich text HTML (sanitized), max 2000 characters
- `notify_student`: Optional, boolean. Default: `false`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-uuid",
    "feedback": "<p>Additional feedback: <strong>Great improvement</strong> on problem-solving approach.</p>",
    "updated_at": "2025-10-29T11:00:00Z",
    "notification_sent": false
  }
}
```

---

### 4. Progress Tracking (4 endpoints)

#### 4.1 GET /api/teacher/students/:id/progress
**Description:** View student's overall progress
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| start_date | string | - | ISO 8601 date (default: school year start) |
| end_date | string | - | ISO 8601 date (default: NOW()) |
| classroom_id | string | - | Filter by specific classroom |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john.doe@school.edu",
      "avatar_url": "https://..."
    },
    "overall_progress": {
      "total_assignments": 15,
      "completed_assignments": 12,
      "pending_assignments": 3,
      "completion_rate": 80.0,
      "average_grade": 85.5,
      "total_points_earned": 1025,
      "total_points_possible": 1200
    },
    "by_classroom": [
      {
        "classroom_id": "classroom-uuid",
        "classroom_name": "Math 101",
        "assignments_count": 10,
        "completed_count": 8,
        "average_grade": 87.5
      }
    ],
    "recent_submissions": [
      {
        "id": "submission-uuid",
        "assignment_title": "Chapter 5 Quiz",
        "submitted_at": "2025-10-26T14:30:00Z",
        "points_earned": 85,
        "max_points": 100,
        "late": false
      }
    ],
    "performance_trend": [
      {
        "week": "2025-W43",
        "average_grade": 85.0,
        "submissions_count": 3
      },
      {
        "week": "2025-W44",
        "average_grade": 88.0,
        "submissions_count": 4
      }
    ]
  }
}
```

---

#### 4.2 GET /api/teacher/students/:id/analytics
**Description:** Detailed analytics for student
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student_id": "student-uuid",
    "time_metrics": {
      "total_time_on_platform": 1200,
      "avg_time_per_assignment": 45,
      "last_login": "2025-10-28T14:30:00Z"
    },
    "performance_by_type": [
      {
        "type": "quiz",
        "count": 5,
        "average_grade": 88.0,
        "completion_rate": 100.0
      },
      {
        "type": "homework",
        "count": 7,
        "average_grade": 85.5,
        "completion_rate": 85.7
      }
    ],
    "performance_by_subject": [
      {
        "subject": "Mathematics",
        "count": 10,
        "average_grade": 87.5
      },
      {
        "subject": "Science",
        "count": 5,
        "average_grade": 82.0
      }
    ],
    "strengths": ["Algebra", "Geometry"],
    "areas_for_improvement": ["Word Problems", "Time Management"],
    "engagement_score": 85,
    "consistency_score": 78,
    "at_risk": false,
    "at_risk_reasons": []
  }
}
```

**At-Risk Detection Rules:**
- `at_risk = true` if:
  - average_grade < 70%, OR
  - completion_rate < 50%, OR
  - no submission in last 14 days

---

#### 4.3 GET /api/teacher/students/:id/notes
**Description:** View private teacher notes about student
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 25 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "note-uuid",
      "student_id": "student-uuid",
      "teacher_id": "teacher-uuid",
      "note": "<p>Student showed <strong>great improvement</strong> in fractions this week.</p>",
      "is_private": true,
      "created_at": "2025-10-28T10:00:00Z",
      "updated_at": "2025-10-28T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

**Notes:**
- Notes are always private (only visible to the teacher who created them)
- Sorted by `created_at DESC`

---

#### 4.4 POST /api/teacher/students/:id/notes
**Description:** Create private note about student
**Rate Limit:** 100 req/15min

**Request Body:**
```json
{
  "note": "<p>Student needs extra help with <strong>fractions</strong>. Plan to provide additional resources.</p>",
  "is_private": true
}
```

**Validation Rules:**
- `note`: Required, rich text HTML (sanitized), max 2000 characters
- `is_private`: Optional, boolean. Default: `true`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "note-uuid",
    "student_id": "student-uuid",
    "teacher_id": "teacher-uuid",
    "note": "<p>Student needs extra help with <strong>fractions</strong>. Plan to provide additional resources.</p>",
    "is_private": true,
    "created_at": "2025-10-28T15:00:00Z"
  }
}
```

---

### 5. Analytics & Reports (5 endpoints)

#### 5.1 GET /api/teacher/analytics/classroom/:id
**Description:** Aggregated analytics for classroom
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| start_date | string | - | ISO 8601 date (default: school year start) |
| end_date | string | - | ISO 8601 date (default: NOW()) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "classroom": {
      "id": "classroom-uuid",
      "name": "Math 101",
      "subject": "Mathematics",
      "grade_level": "6",
      "students_count": 24
    },
    "overall_performance": {
      "total_assignments": 15,
      "average_completion_rate": 85.0,
      "average_grade": 82.5,
      "total_submissions": 360,
      "pending_grading": 12
    },
    "grade_distribution": [
      {
        "range": "90-100",
        "count": 72,
        "percentage": 20.0
      },
      {
        "range": "80-89",
        "count": 144,
        "percentage": 40.0
      },
      {
        "range": "70-79",
        "count": 90,
        "percentage": 25.0
      },
      {
        "range": "60-69",
        "count": 36,
        "percentage": 10.0
      },
      {
        "range": "0-59",
        "count": 18,
        "percentage": 5.0
      }
    ],
    "performance_by_assignment": [
      {
        "assignment_id": "assignment-uuid",
        "assignment_title": "Chapter 5 Quiz",
        "assignment_type": "quiz",
        "submissions_count": 24,
        "average_grade": 85.5,
        "completion_rate": 100.0,
        "avg_time_to_complete": 45
      }
    ],
    "top_performers": [
      {
        "student_id": "student-uuid",
        "student_name": "Alice Johnson",
        "average_grade": 95.5,
        "completion_rate": 100.0
      }
    ],
    "at_risk_students": [
      {
        "student_id": "student-uuid",
        "student_name": "Bob Smith",
        "average_grade": 65.0,
        "completion_rate": 60.0,
        "reason": ["Low average grade (65%)", "Missed 2 assignments"]
      }
    ],
    "trend": [
      {
        "week": "2025-W43",
        "average_grade": 80.0,
        "submissions_count": 72,
        "completion_rate": 85.0
      },
      {
        "week": "2025-W44",
        "average_grade": 82.5,
        "submissions_count": 96,
        "completion_rate": 90.0
      }
    ]
  }
}
```

**Cache:** TTL 5 minutes (Redis)

---

#### 5.2 GET /api/teacher/analytics/student/:id
**Description:** Student analytics with classroom comparison
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john.doe@school.edu"
    },
    "student_performance": {
      "average_grade": 87.5,
      "completion_rate": 90.0,
      "rank": 5,
      "percentile": 80
    },
    "classroom_average": {
      "average_grade": 82.5,
      "completion_rate": 85.0
    },
    "comparison": {
      "grade_difference": 5.0,
      "above_average": true
    },
    "performance_by_topic": [
      {
        "topic": "Algebra",
        "student_grade": 92.0,
        "classroom_avg": 85.0
      },
      {
        "topic": "Geometry",
        "student_grade": 80.0,
        "classroom_avg": 82.0
      }
    ]
  }
}
```

---

#### 5.3 GET /api/teacher/analytics/assignment/:id
**Description:** Analytics for specific assignment
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assignment": {
      "id": "assignment-uuid",
      "title": "Chapter 5 Quiz",
      "type": "quiz",
      "max_points": 100
    },
    "statistics": {
      "total_assigned": 24,
      "submissions_count": 24,
      "completion_rate": 100.0,
      "average_grade": 85.5,
      "median_grade": 87.0,
      "std_deviation": 8.5,
      "highest_grade": 98,
      "lowest_grade": 62,
      "avg_time_to_complete": 45,
      "late_submissions_count": 2,
      "late_percentage": 8.3
    },
    "grade_distribution": [
      {
        "range": "90-100",
        "count": 8,
        "percentage": 33.3
      },
      {
        "range": "80-89",
        "count": 10,
        "percentage": 41.7
      },
      {
        "range": "70-79",
        "count": 4,
        "percentage": 16.7
      },
      {
        "range": "60-69",
        "count": 2,
        "percentage": 8.3
      }
    ],
    "difficulty_assessment": "appropriate",
    "difficulty_reason": "Average grade is 85.5%, which indicates appropriate difficulty level.",
    "common_mistakes": [
      "Calculation errors in question 3",
      "Misunderstanding of word problems in question 7"
    ]
  }
}
```

**Difficulty Assessment Rules:**
- `too_easy`: average_grade > 90%
- `appropriate`: 60% <= average_grade <= 90%
- `too_hard`: average_grade < 60%

---

#### 5.4 GET /api/teacher/analytics/engagement
**Description:** Engagement metrics across all classrooms
**Rate Limit:** 100 req/15min

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overall_engagement": {
      "total_students": 75,
      "active_students": 68,
      "active_rate": 90.7,
      "avg_login_frequency": 5.2,
      "avg_time_on_platform": 120
    },
    "by_classroom": [
      {
        "classroom_id": "classroom-uuid",
        "classroom_name": "Math 101",
        "students_count": 24,
        "active_students": 22,
        "engagement_score": 85,
        "avg_time_per_student": 130
      }
    ],
    "activity_timeline": [
      {
        "date": "2025-10-28",
        "logins": 68,
        "submissions": 32,
        "time_on_platform": 2040
      },
      {
        "date": "2025-10-27",
        "logins": 65,
        "submissions": 28,
        "time_on_platform": 1950
      }
    ],
    "engagement_alerts": [
      {
        "student_id": "student-uuid",
        "student_name": "Bob Smith",
        "classroom_id": "classroom-uuid",
        "alert_type": "no_login_7days",
        "last_activity": "2025-10-20T10:00:00Z"
      }
    ]
  }
}
```

**Engagement Alert Types:**
- `no_login_7days`: No login in past 7 days
- `no_submission_14days`: No submission in past 14 days
- `low_time`: Time on platform < 30 minutes/week

---

#### 5.5 GET /api/teacher/analytics/reports
**Description:** Generate predefined or custom reports
**Rate Limit:** 100 req/15min

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| report_type | string | weekly | Type: `weekly`, `monthly`, `quarterly`, `custom` |
| classroom_id | string | - | Filter by classroom (optional) |
| start_date | string | - | ISO 8601 date (required for `custom`) |
| end_date | string | - | ISO 8601 date (required for `custom`) |
| format | string | json | Format: `json`, `csv`, `pdf` |
| include_charts | boolean | true | Include charts in PDF (ignored for json/csv) |

**Response (200 OK) - JSON format:**
```json
{
  "success": true,
  "data": {
    "report_id": "report-uuid",
    "report_type": "weekly",
    "generated_at": "2025-10-28T15:00:00Z",
    "period": {
      "start_date": "2025-10-21",
      "end_date": "2025-10-28"
    },
    "summary": {
      "total_classrooms": 3,
      "total_students": 75,
      "total_assignments": 45,
      "overall_avg_grade": 82.5,
      "overall_completion_rate": 85.0
    },
    "classrooms": [
      {
        "classroom_id": "classroom-uuid",
        "classroom_name": "Math 101",
        "students_count": 24,
        "assignments_count": 15,
        "average_grade": 82.5,
        "completion_rate": 85.0,
        "top_performer": "Alice Johnson",
        "at_risk_count": 2
      }
    ]
  }
}
```

**Response (200 OK) - CSV format:**
- Content-Type: `text/csv`
- Filename: `report_weekly_2025-10-28.csv`
- Content: CSV data with columns: classroom, students, assignments, avg_grade, completion_rate

**Response (200 OK) - PDF format:**
- Content-Type: `application/pdf`
- Filename: `report_weekly_2025-10-28.pdf`
- Content: PDF document with formatted report and charts

**Example CSV structure:**
```csv
Classroom,Students,Assignments,Average Grade,Completion Rate,Top Performer,At Risk Count
Math 101,24,15,82.5,85.0,Alice Johnson,2
Science 201,28,10,80.0,90.0,Bob Smith,1
History 301,23,20,85.5,88.0,Carol Lee,0
```

---

## Common Schemas

### Assignment Type
```typescript
enum AssignmentType {
  quiz = "quiz",
  homework = "homework",
  project = "project",
  exam = "exam",
  discussion = "discussion"
}
```

### Submission Status
```typescript
enum SubmissionStatus {
  pending = "pending",
  submitted = "submitted",
  graded = "graded",
  pending_review = "pending_review",
  needs_revision = "needs_revision"
}
```

### Report Type
```typescript
enum ReportType {
  weekly = "weekly",
  monthly = "monthly",
  quarterly = "quarterly",
  custom = "custom"
}
```

### Pagination Metadata
```typescript
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Error Codes

### Standard HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Application Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | User doesn't have required role |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_POINTS` | 400 | Points out of valid range |
| `ASSIGNMENT_HAS_SUBMISSIONS` | 422 | Cannot update assignment with submissions |
| `NOT_CLASSROOM_OWNER` | 403 | User is not the classroom owner |
| `NOT_ASSIGNMENT_OWNER` | 403 | User is not the assignment owner |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

---

## Security

### Authentication
- JWT Bearer token required in `Authorization` header
- Token must contain `role=teacher`
- Token expiry: 24 hours (configurable)

### Authorization
- Ownership verification middleware:
  - `verifyClassroomOwnership`: Checks teacher owns classroom
  - `verifyAssignmentOwnership`: Checks teacher owns assignment
  - `verifySubmissionAccess`: Checks teacher has access via classroom
  - `verifyStudentAccess`: Checks teacher teaches student

### Input Sanitization
- HTML sanitization using DOMPurify
- Allowed HTML tags: `p`, `br`, `strong`, `em`, `u`, `ol`, `ul`, `li`, `a`
- Allowed attributes: `href`, `target`
- XSS prevention through strict sanitization

### Rate Limiting
- 100 requests per 15 minutes per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Caching

### Redis Cache Strategy

**Cached Endpoints:**
- `GET /api/teacher/analytics/classroom/:id` - TTL: 5 minutes
- `GET /api/teacher/analytics/student/:id` - TTL: 5 minutes
- `GET /api/teacher/students/:id/analytics` - TTL: 5 minutes

**Cache Invalidation:**
- On new submission creation
- On grade update
- On assignment creation/update
- On classroom update

**Cache Key Format:**
```
teacher:{teacher_id}:classroom:{classroom_id}:analytics:{start_date}:{end_date}
teacher:{teacher_id}:student:{student_id}:analytics
```

---

## Examples

### Example 1: Create Classroom and Add Students

**Step 1: Create Classroom**
```bash
curl -X POST https://api.glit.com/api/teacher/classrooms \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math 101",
    "description": "Advanced Mathematics for Grade 6",
    "grade_level": "6",
    "subject": "Mathematics"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "classroom-123-uuid",
    "teacher_id": "teacher-456-uuid",
    "name": "Math 101",
    "description": "Advanced Mathematics for Grade 6",
    "grade_level": "6",
    "subject": "Mathematics",
    "is_active": true,
    "created_at": "2025-10-28T10:00:00Z",
    "updated_at": "2025-10-28T10:00:00Z"
  }
}
```

**Step 2: Add Students to Classroom**
```bash
curl -X POST https://api.glit.com/api/teacher/classrooms/classroom-123-uuid/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "student_ids": [
      "student-001-uuid",
      "student-002-uuid",
      "student-003-uuid"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": [
      {
        "student_id": "student-001-uuid",
        "student_name": "John Doe",
        "enrolled_at": "2025-10-28T10:05:00Z"
      },
      {
        "student_id": "student-002-uuid",
        "student_name": "Jane Smith",
        "enrolled_at": "2025-10-28T10:05:00Z"
      },
      {
        "student_id": "student-003-uuid",
        "student_name": "Bob Johnson",
        "enrolled_at": "2025-10-28T10:05:00Z"
      }
    ],
    "failed": []
  },
  "meta": {
    "total": 3,
    "successful_count": 3,
    "failed_count": 0
  }
}
```

---

### Example 2: Create Assignment and Assign to Classroom

**Step 1: Create Assignment**
```bash
curl -X POST https://api.glit.com/api/teacher/assignments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chapter 5 Quiz",
    "description": "<p>Complete all questions in Chapter 5. <strong>Show your work</strong> for full credit.</p>",
    "type": "quiz",
    "max_points": 100,
    "deadline": "2025-10-30T23:59:59Z",
    "instructions": "<p>You have 60 minutes to complete this quiz.</p>"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-789-uuid",
    "teacher_id": "teacher-456-uuid",
    "title": "Chapter 5 Quiz",
    "description": "<p>Complete all questions in Chapter 5. <strong>Show your work</strong> for full credit.</p>",
    "type": "quiz",
    "max_points": 100,
    "deadline": "2025-10-30T23:59:59Z",
    "instructions": "<p>You have 60 minutes to complete this quiz.</p>",
    "resources": [],
    "is_active": true,
    "created_at": "2025-10-28T11:00:00Z",
    "updated_at": "2025-10-28T11:00:00Z"
  }
}
```

**Step 2: Assign to Classroom**
```bash
curl -X POST https://api.glit.com/api/teacher/assignments/assignment-789-uuid/assign \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "classroom_ids": ["classroom-123-uuid"],
    "due_date": "2025-10-30T23:59:59Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assignment_id": "assignment-789-uuid",
    "assigned_to": [
      {
        "classroom_id": "classroom-123-uuid",
        "classroom_name": "Math 101",
        "students_count": 24,
        "assigned_at": "2025-10-28T11:05:00Z"
      }
    ]
  },
  "meta": {
    "total_students_assigned": 24
  }
}
```

---

### Example 3: Grade Submissions from Queue

**Step 1: Get Pending Submissions**
```bash
curl -X GET "https://api.glit.com/api/teacher/grading/pending?sort=oldest&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "submission-001-uuid",
      "assignment_id": "assignment-789-uuid",
      "assignment_title": "Chapter 5 Quiz",
      "student_id": "student-001-uuid",
      "student_name": "John Doe",
      "student_email": "john.doe@school.edu",
      "classroom_id": "classroom-123-uuid",
      "classroom_name": "Math 101",
      "content": "Student's answers...",
      "submitted_at": "2025-10-28T14:30:00Z",
      "deadline": "2025-10-30T23:59:59Z",
      "late": false,
      "days_waiting": 1
    }
  ],
  "meta": {
    "total": 24,
    "pending_count": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Step 2: Grade a Submission**
```bash
curl -X POST https://api.glit.com/api/teacher/grading/submission-001-uuid/grade \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "points_earned": 85,
    "feedback": "<p>Excellent work! <strong>Watch</strong> your calculations on question 3.</p>",
    "status": "graded",
    "notify_student": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-001-uuid",
    "points_earned": 85,
    "feedback": "<p>Excellent work! <strong>Watch</strong> your calculations on question 3.</p>",
    "status": "graded",
    "graded_at": "2025-10-29T10:00:00Z",
    "graded_by": "teacher-456-uuid",
    "notification_sent": true
  }
}
```

---

### Example 4: View Student Progress and Add Note

**Step 1: Get Student Progress**
```bash
curl -X GET "https://api.glit.com/api/teacher/students/student-001-uuid/progress" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student-001-uuid",
      "name": "John Doe",
      "email": "john.doe@school.edu",
      "avatar_url": "https://..."
    },
    "overall_progress": {
      "total_assignments": 15,
      "completed_assignments": 12,
      "pending_assignments": 3,
      "completion_rate": 80.0,
      "average_grade": 85.5,
      "total_points_earned": 1025,
      "total_points_possible": 1200
    },
    "by_classroom": [
      {
        "classroom_id": "classroom-123-uuid",
        "classroom_name": "Math 101",
        "assignments_count": 10,
        "completed_count": 8,
        "average_grade": 87.5
      }
    ],
    "recent_submissions": [
      {
        "id": "submission-001-uuid",
        "assignment_title": "Chapter 5 Quiz",
        "submitted_at": "2025-10-28T14:30:00Z",
        "points_earned": 85,
        "max_points": 100,
        "late": false
      }
    ],
    "performance_trend": [
      {
        "week": "2025-W43",
        "average_grade": 85.0,
        "submissions_count": 3
      }
    ]
  }
}
```

**Step 2: Add Private Note**
```bash
curl -X POST https://api.glit.com/api/teacher/students/student-001-uuid/notes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "note": "<p>Student showed <strong>great improvement</strong> in fractions this week. Continue monitoring progress.</p>",
    "is_private": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "note-001-uuid",
    "student_id": "student-001-uuid",
    "teacher_id": "teacher-456-uuid",
    "note": "<p>Student showed <strong>great improvement</strong> in fractions this week. Continue monitoring progress.</p>",
    "is_private": true,
    "created_at": "2025-10-29T10:30:00Z"
  }
}
```

---

### Example 5: Generate and Download PDF Report

**Generate Monthly Report**
```bash
curl -X GET "https://api.glit.com/api/teacher/analytics/reports?report_type=monthly&format=pdf&include_charts=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  --output report_monthly_2025-10.pdf
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="report_monthly_2025-10.pdf"`
- Body: PDF binary data

**Alternative: Get JSON Report First**
```bash
curl -X GET "https://api.glit.com/api/teacher/analytics/reports?report_type=monthly&format=json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "report-001-uuid",
    "report_type": "monthly",
    "generated_at": "2025-10-28T15:00:00Z",
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31"
    },
    "summary": {
      "total_classrooms": 3,
      "total_students": 75,
      "total_assignments": 45,
      "overall_avg_grade": 82.5,
      "overall_completion_rate": 85.0
    },
    "classrooms": [
      {
        "classroom_id": "classroom-123-uuid",
        "classroom_name": "Math 101",
        "students_count": 24,
        "assignments_count": 15,
        "average_grade": 82.5,
        "completion_rate": 85.0,
        "top_performer": "Alice Johnson",
        "at_risk_count": 2
      }
    ]
  }
}
```

---

## Postman Collection

Import this collection for quick testing:

```json
{
  "info": {
    "name": "GAMILIT Teacher Portal API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.glit.com/api/teacher"
    },
    {
      "key": "jwt_token",
      "value": "your_jwt_token_here"
    }
  ]
}
```

---

## 🔗 Referencias a Implementación

### Requerimientos
📄 **[Teacher Portal Requirements](../../01-requerimientos/teacher-portal/README.md)** - Índice completo
- [REQ-TEACHER-CLASSROOMS.md](../../01-requerimientos/teacher-portal/REQ-TEACHER-CLASSROOMS.md#-referencias-a-implementación) - 8 endpoints
- [REQ-TEACHER-ASSIGNMENTS.md](../../01-requerimientos/teacher-portal/REQ-TEACHER-ASSIGNMENTS.md#-referencias-a-implementación) - 8 endpoints
- [REQ-TEACHER-GRADING-PROGRESS.md](../../01-requerimientos/teacher-portal/REQ-TEACHER-GRADING-PROGRESS.md#-referencias-a-implementación) - 8 endpoints
- [REQ-TEACHER-ANALYTICS.md](../../01-requerimientos/teacher-portal/REQ-TEACHER-ANALYTICS.md#-referencias-a-implementación) - 5 endpoints

### Database
🗄️ **Schemas:** `educational_content`, `progress_tracking`, `audit_logging`
- `educational_content.classrooms` - Aulas virtuales
- `educational_content.classroom_students` - Estudiantes por classroom
- `educational_content.assignments` - Tareas/exámenes
- `educational_content.assignment_classrooms` - Asignación de assignments
- `progress_tracking.submissions` - Entregas de estudiantes
- `progress_tracking.student_notes` - Notas privadas de profesor
- `audit_logging.grading_audit_log` - Auditoría de calificaciones

### Backend
💻 **Module:** `apps/backend/src/modules/teacher/`
- **Controllers:**
  - `classroom.controller.ts` - 8 endpoints CRUD classrooms
  - `assignment.controller.ts` - 8 endpoints CRUD assignments
  - `grading.controller.ts` - 4 endpoints calificación
  - `student-progress.controller.ts` - 4 endpoints progreso
  - `analytics.controller.ts` - 5 endpoints analytics/reportes

- **Services:**
  - `classroom.service.ts`, `assignment.service.ts`, `grading.service.ts`
  - `student-progress.service.ts`, `analytics.service.ts`
  - `report-generator.service.ts` - Exportación PDF/CSV
  - `analytics-cache.service.ts` - Redis cache (TTL 5 min)

- **Guards:**
  - `classroom-ownership.guard.ts` - Verificación de ownership
  - `assignment-ownership.guard.ts`
  - `student-access.guard.ts` - Relación teacher-student via classroom

- **Utils:**
  - `html-sanitizer.util.ts` - DOMPurify para contenido de assignments
  - `pdf-generator.util.ts` - PDFKit/Puppeteer para reportes
  - `statistics.util.ts` - Cálculos de mean, median, std dev, percentiles

### Frontend
🎨 **Feature:** `apps/frontend/src/features/teacher/`
- **Components:** 30+ componentes (ClassroomList, AssignmentList, GradingQueue, SubmissionViewer, etc.)
- **Hooks:** useClassrooms, useAssignments, useGrading, useStudentProgress, useAnalytics
- **Types:** teacher.types.ts, analytics.types.ts, grading.types.ts
- **Rich Text:** TipTap editor para assignments y feedback
- **Charts:** Recharts para analytics (grade distribution, trends, performance radar)

### Épica
📄 **EP009 - Teacher Portal** → `/docs/04-planificacion/epicas/EP009-teacher-portal/`

---

## Changelog

### v1.0 (2025-10-28)
- Initial release
- 29 endpoints implemented
- 5 modules: Classrooms, Assignments, Grading, Progress, Analytics
- JWT authentication
- Rate limiting
- HTML sanitization
- Redis caching for analytics
- PDF/CSV export for reports

---

## Support

For API support, contact:
- **Email:** api-support@glit.com
- **Documentation:** https://docs.glit.com/teacher-api
- **Status Page:** https://status.glit.com

---

**Generated:** 2025-10-28
**Version:** 1.0
**Epic:** EP009 - Teacher Portal
