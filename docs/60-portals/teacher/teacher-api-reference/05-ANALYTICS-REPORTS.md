---
titulo: Portal Teacher - Analytics & Reports APIs
tipo: portal
portal: teacher
seccion: api-reference
archivo: 05-ANALYTICS-REPORTS
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - Analytics & Reports APIs

**Version:** 1.3.0
**Parte de:** [Portal Teacher - API Reference](../PORTAL-TEACHER-API-REFERENCE.md)

---

## 6. Analytics APIs

### 6.1 GET /teacher/analytics/classroom/:id

Analiticas detalladas de un aula.

**Response (200):**
```json
{
  "classroom_id": "uuid",
  "period": {
    "from": "2025-01-01",
    "to": "2025-11-29"
  },
  "overview": {
    "total_students": 28,
    "active_students": 25,
    "average_completion": 72.5,
    "average_score": 85.3,
    "total_submissions": 1250,
    "total_time_hours": 450
  },
  "performance_distribution": {
    "excellent": 8,    // 90-100
    "good": 12,        // 80-89
    "average": 5,      // 70-79
    "below_average": 2, // 60-69
    "struggling": 1    // <60
  },
  "completion_trend": [
    { "week": "2025-W45", "completion_rate": 68.5 },
    { "week": "2025-W46", "completion_rate": 71.2 },
    { "week": "2025-W47", "completion_rate": 72.5 }
  ],
  "engagement_metrics": {
    "average_sessions_per_week": 3.5,
    "average_session_duration_minutes": 35,
    "peak_activity_hour": 16,
    "most_active_day": "Tuesday"
  },
  "at_risk_students": [
    {
      "student_id": "uuid",
      "name": "Maria Garcia",
      "risk_level": "high",
      "reason": "No activity in 7 days"
    }
  ]
}
```

### 6.2 GET /teacher/analytics/economy

Analiticas de economia ML Coins.

**Response (200):**
```json
{
  "overview": {
    "total_circulation": 125000,
    "average_balance": 980,
    "median_balance": 850,
    "gini_coefficient": 0.32
  },
  "distribution": {
    "ranges": [
      { "range": "0-500", "count": 15, "percentage": 12.0 },
      { "range": "501-1000", "count": 45, "percentage": 36.0 },
      { "range": "1001-2000", "count": 40, "percentage": 32.0 },
      { "range": "2001-5000", "count": 20, "percentage": 16.0 },
      { "range": "5001+", "count": 5, "percentage": 4.0 }
    ]
  },
  "top_earners": [
    {
      "student_id": "uuid",
      "name": "Ana Lopez",
      "balance": 8500,
      "weekly_earnings": 450,
      "maya_rank": "Arquitecto Maya"
    }
  ],
  "spending_patterns": {
    "comodines": 35000,
    "customizations": 15000,
    "power_ups": 8000
  }
}
```

### 6.3 GET /teacher/analytics/achievements

Estadisticas de logros por aula.

**Response (200):**
```json
{
  "classroom_id": "uuid",
  "total_achievements": 45,
  "total_unlocks": 892,
  "achievements": [
    {
      "id": "uuid",
      "name": "Primera Victoria",
      "description": "Completar primer ejercicio",
      "category": "progress",
      "unlock_count": 28,
      "unlock_percentage": 100,
      "average_unlock_time_days": 2.5
    },
    {
      "id": "uuid",
      "name": "Maestro del Tiempo",
      "description": "Completar Timeline perfecto",
      "category": "mastery",
      "unlock_count": 12,
      "unlock_percentage": 42.8,
      "average_unlock_time_days": 15.3
    }
  ],
  "rarest_achievements": [
    {
      "id": "uuid",
      "name": "Leyenda Maya",
      "unlock_count": 2,
      "unlock_percentage": 7.1
    }
  ]
}
```

---

## 9. Reports APIs

### 9.1 POST /teacher/reports/generate

Genera reporte PDF/Excel.

**Request:**
```http
POST /api/teacher/reports/generate
Content-Type: application/json

{
  "format": "pdf",
  "report_type": "student_insights",
  "classroom_id": "uuid",
  "student_ids": ["uuid1", "uuid2"],
  "include_sections": [
    "summary",
    "progress",
    "achievements",
    "insights",
    "recommendations"
  ],
  "date_range": {
    "from": "2025-01-01",
    "to": "2025-11-29"
  }
}
```

**Response (200):**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="student-insights-report.pdf"
- Binary PDF content
