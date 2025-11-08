# Progress API

**Proyecto:** Gamilit Platform
**Módulo:** API Reference
**Categoría:** Progress Tracking
**Archivo original:** API-REFERENCE.md (líneas 418-500)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## GET /api/progress/:userId
Progreso general del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "overallProgress": {
      "totalModules": 5,
      "completedModules": 2,
      "totalExercises": 75,
      "completedExercises": 34,
      "overallPercentage": 45
    },
    "moduleProgress": [
      {
        "moduleId": "uuid",
        "moduleName": "Module 1",
        "progressPercentage": 100,
        "averageScore": 88,
        "timeSpent": 3600
      }
    ],
    "studyStreak": {
      "currentStreak": 7,
      "longestStreak": 14
    }
  }
}
```

---

## GET /api/progress/attempts/:userId
Historial de intentos

**Query:** `?exerciseId=uuid&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "exerciseTitle": "Crucigrama",
      "score": 85,
      "timeSpent": 180,
      "mlCoinsEarned": 8,
      "xpEarned": 17,
      "isPerfect": false,
      "completedAt": "2025-10-27T12:00:00Z"
    }
  ],
  "meta": { "total": 45, "page": 1 }
}
```

---

## GET /api/progress/analytics/:userId
Analytics detallados

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTimeStudied": 7200,
      "exercisesCompleted": 45,
      "averageScore": 83,
      "improvementRate": 12
    },
    "performanceByModule": [...],
    "performanceByType": [...],
    "trends": {
      "scoreOverTime": [...],
      "activityOverTime": [...]
    }
  }
}
```

---

**Última actualización:** 2025-11-01
