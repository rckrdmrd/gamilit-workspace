# Social API

**Proyecto:** Gamilit Platform
**Módulo:** API Reference
**Categoría:** Social Features
**Archivo original:** API-REFERENCE.md (líneas 504-560)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Classrooms

### GET /api/social/classrooms
Listar classrooms del usuario

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "6th Grade A",
      "teacherName": "Prof. Smith",
      "studentCount": 25,
      "inviteCode": "ABC123"
    }
  ]
}
```

---

### POST /api/social/classrooms/join
Unirse a classroom

**Request:**
```json
{
  "inviteCode": "ABC123"
}
```

---

## Teams

### GET /api/social/teams
Listar equipos

**Query:** `?classroomId=uuid`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Team Alpha",
      "memberCount": 5,
      "totalXP": 2500,
      "teamRank": 1
    }
  ]
}
```

---

**Última actualización:** 2025-11-01
