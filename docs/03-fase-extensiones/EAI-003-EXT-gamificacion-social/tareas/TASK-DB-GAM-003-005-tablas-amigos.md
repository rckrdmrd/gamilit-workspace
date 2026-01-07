---
id: "TASK-DB-GAM-003"
title: "Crear tablas para sistema de amigos"
type: "Task"
status: "To Do"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-003-EXT"
parent_us: "US-GAM-010"
estimated_hours: 3
labels: ["database", "social", "friendships", "rls"]
created_date: "2026-01-04"
updated_date: "2026-01-04"
---

# TASK-DB-GAM-003-005: Crear tablas para sistema de amigos

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | TASK-DB-GAM-003 |
| **US Padre** | US-GAM-010 |
| **Epic** | EAI-003-EXT |
| **Tipo** | Database |
| **Estimacion** | 3 horas |
| **Estado** | To Do |

---

## Subtareas

| ID | Descripcion | Estado |
|----|-------------|--------|
| DB-GAM-003 | Crear tabla `social_features.friendships` | To Do |
| DB-GAM-004 | Crear tabla `social_features.friend_requests` | To Do |
| DB-GAM-005 | Crear RLS policies para privacidad | To Do |

---

## Especificaciones Tecnicas

### Tabla: friendships

```sql
CREATE TABLE social_features.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE INDEX idx_friendships_user_id ON social_features.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON social_features.friendships(friend_id);
```

### Tabla: friend_requests

```sql
CREATE TABLE social_features.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id <> recipient_id)
);

CREATE INDEX idx_friend_requests_recipient ON social_features.friend_requests(recipient_id)
  WHERE status = 'pending';
```

### RLS Policies

```sql
-- Friendships: usuarios solo ven sus propias amistades
CREATE POLICY "users_view_own_friendships" ON social_features.friendships
  FOR SELECT USING (auth.uid() IN (user_id, friend_id));

-- Friend requests: usuarios ven solicitudes donde participan
CREATE POLICY "users_view_own_requests" ON social_features.friend_requests
  FOR SELECT USING (auth.uid() IN (requester_id, recipient_id));

-- Solo el recipient puede actualizar (aceptar/rechazar)
CREATE POLICY "recipient_can_respond" ON social_features.friend_requests
  FOR UPDATE USING (auth.uid() = recipient_id);
```

---

## Criterios de Aceptacion

- [ ] Tablas creadas en schema `social_features`
- [ ] Indices optimizados para consultas frecuentes
- [ ] RLS policies que garantizan privacidad
- [ ] Constraints de integridad (no auto-amistad)
- [ ] Migracion reversible

---

## Referencias

- **US Padre:** [US-GAM-010](../historias-usuario/US-GAM-010-sistema-amigos.md)
- **Schema:** `social_features`

---

**Creado:** 2026-01-04
**Extraido de:** US-GAM-010
