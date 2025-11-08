# API Educativa

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Información General

**Base:** `/api/educational`
**Total Endpoints:** 40+
**Autenticación:** Mayormente requerida (algunos opcionales)

---

## Índice de Endpoints

### Módulos
1. [GET /modules](#get-modules) - Listar módulos
2. [GET /modules/:id](#get-modulesid) - Detalles de módulo
3. [POST /modules](#post-modules) - Crear módulo (teacher+)
4. [PUT /modules/:id](#put-modulesid) - Actualizar módulo
5. [DELETE /modules/:id](#delete-modulesid) - Eliminar módulo

### Ejercicios
6. [GET /exercises](#get-exercises) - Listar ejercicios
7. [GET /exercises/:id](#get-exercisesid) - Detalles de ejercicio
8. [POST /exercises/:id/submit](#post-exercisesidsubmit) - Enviar respuesta
9. [GET /exercises/:id/attempts](#get-exercisesidattempts) - Historial de intentos

### Progreso
10. [GET /progress](#get-progress) - Progreso general
11. [GET /progress/module/:id](#get-progressmoduleid) - Progreso por módulo

---

## GET /modules

Obtiene módulos educativos.

**Autenticación:** Opcional (con auth, incluye progreso)

### Query Params
- `category` (string): Filtrar por categoría
- `difficulty` (string): `beginner` | `intermediate` | `advanced`

### Response 200
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "uuid",
        "title": "Introduction to Python",
        "description": "Learn Python basics",
        "category": "programming",
        "difficulty": "beginner",
        "estimatedHours": 10,
        "lessonsCount": 12,
        "exercisesCount": 30,
        "isPublished": true,
        "order": 1,
        "progress": 45.5
      }
    ]
  }
}
```

---

## GET /modules/:id

Obtiene detalles de módulo específico.

**Autenticación:** Opcional

### Response 200
```json
{
  "success": true,
  "data": {
    "module": {
      "id": "uuid",
      "title": "Introduction to Python",
      "description": "Learn Python basics...",
      "category": "programming",
      "difficulty": "beginner",
      "estimatedHours": 10,
      "prerequisites": ["uuid"],
      "learningObjectives": [
        "Understand Python syntax",
        "Write simple programs"
      ],
      "lessons": [
        {
          "id": "uuid",
          "title": "Variables and Types",
          "order": 1,
          "contentType": "video",
          "duration": 600,
          "isCompleted": false
        }
      ]
    }
  }
}
```

---

## GET /exercises

Obtiene lista de ejercicios.

**Autenticación:** Requerida

### Query Params
- `moduleId` (uuid): Filtrar por módulo
- `difficulty` (string)
- `status` (string): `pending` | `completed`

### Response 200
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "title": "Variables Quiz",
        "moduleId": "uuid",
        "lessonId": "uuid",
        "type": "multiple_choice",
        "difficulty": "beginner",
        "points": 10,
        "estimatedMinutes": 5,
        "isCompleted": false,
        "bestScore": null
      }
    ]
  }
}
```

---

## GET /exercises/:id

Obtiene detalles de ejercicio específico.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "exercise": {
      "id": "uuid",
      "title": "Variables Quiz",
      "description": "Test your knowledge...",
      "type": "multiple_choice",
      "difficulty": "beginner",
      "points": 10,
      "questions": [
        {
          "id": "q1",
          "text": "What is a variable?",
          "type": "multiple_choice",
          "options": [
            { "id": "a", "text": "A container for data" },
            { "id": "b", "text": "A function" },
            { "id": "c", "text": "A loop" }
          ]
        }
      ],
      "hints": [
        "Think about data storage"
      ],
      "timeLimit": 300
    }
  }
}
```

---

## POST /exercises/:id/submit

Envía respuesta de ejercicio.

**Autenticación:** Requerida

### Request Body
```json
{
  "answers": {
    "q1": "a",
    "q2": ["a", "c"]
  },
  "timeSpent": 180
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid",
    "score": 90,
    "maxScore": 100,
    "percentage": 90,
    "passed": true,
    "feedback": {
      "overall": "Great job!",
      "byQuestion": {
        "q1": {
          "correct": true,
          "feedback": "Perfect!"
        },
        "q2": {
          "correct": false,
          "feedback": "Review arrays..."
        }
      }
    },
    "rewards": {
      "mlCoins": 150,
      "xp": 300
    },
    "achievements": ["uuid"],
    "newStats": {
      "totalExercisesCompleted": 151,
      "averageScore": 87.5
    }
  }
}
```

---

## GET /progress

Obtiene progreso general del usuario.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "overallProgress": 35.5,
    "modulesCompleted": 3,
    "totalModules": 10,
    "exercisesCompleted": 45,
    "totalExercises": 150,
    "averageScore": 87.3,
    "lastActivity": "2025-10-27T09:00:00Z"
  }
}
```

---

## Tipos de Ejercicios

| Tipo | Descripción | Evaluación |
|------|-------------|------------|
| `multiple_choice` | Opción múltiple | Automática |
| `true_false` | Verdadero/Falso | Automática |
| `fill_blank` | Llenar espacios | Automática |
| `code_completion` | Completar código | Automática |
| `short_answer` | Respuesta corta | Manual |
| `essay` | Ensayo | Manual |

---

## Documentos Relacionados

> **Implementa requerimientos:**
> - [Módulos Educativos](../../../01-requerimientos/modulos/) - Requerimientos de contenido educativo
> - [UC-STU-003 - Resolver Ejercicio](../../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md)
> - [UC-STU-004 - Ver Progreso](../../../01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md)

**Especificaciones técnicas:**
- [TYPES-EDUCATIONAL-MODULES](../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL-MODULES.md) - 27 mecánicas educativas
- [TYPES-EDUCATIONAL-PROGRESS](../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL-PROGRESS.md) - Tipos de progreso
- [Backend Architecture](../../../02-especificaciones-tecnicas/arquitectura/BACKEND-ARCHITECTURE.md) - Módulo educational

**Desarrollo:**
- [Base de Datos - Educational Content](../../base-de-datos/schemas/educational_content/) - Esquema de BD
- [README de API](./README.md) - Índice de endpoints

---

**Última revisión:** 2025-11-01
