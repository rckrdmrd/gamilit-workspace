---
titulo: Flujo Student - Amigos
tipo: flujo
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Flujo Student - Amigos

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Resumen

Flujo para consultar lista de amigos, enviar solicitudes, aceptarlas y visualizar actividad social.

## Diagrama Mermaid

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as FriendsPage
    participant BE as FriendshipsController
    participant DB as Database

    S->>FE: Abre amigos
    FE->>BE: GET /social/users/:userId/friends
    FE->>BE: GET /social/users/:userId/friends/pending
    FE->>BE: GET /social/activities/feed
    BE->>DB: friendships + friend_requests + user_activities
    BE-->>FE: Lista + solicitudes + actividad
    S->>FE: Enviar solicitud
    FE->>BE: POST /social/friendships/request
    BE->>DB: Crea solicitud
    BE-->>FE: Estado actualizado
```

## Trazabilidad

### Frontend
- `apps/frontend/src/apps/student/pages/FriendsPage.tsx`
- `apps/frontend/src/services/api/friendsAPI.ts`

### Backend
- `apps/backend/src/modules/social/controllers/friendships.controller.ts`
- `apps/backend/src/modules/social/services/friendships.service.ts`
- `apps/backend/src/modules/social/controllers/user-activities.controller.ts`

### Datos
- `social_features.friendships`
- `social_features.friend_requests`
- `social_features.user_activities`
