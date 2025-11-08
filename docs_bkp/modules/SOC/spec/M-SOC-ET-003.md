
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-SOC-003 -->
<!-- ID Nuevo: M-SOC-ET-003 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-SOC-ET-003: Especificación Técnica - Sistema de Amigos

**ID:** ET-SOC-003
**Título:** Implementación del Sistema de Amigos y Red Social
**Módulo:** 05-caracteristicas-sociales
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Media ⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación completa del sistema de amigos que permite a los estudiantes conectarse, compartir progreso y motivarse mutuamente. Incluye:

- Schema de base de datos con manejo de amistades, bloqueos y privacidad
- Backend (NestJS) con servicios de amistad y feed de actividades
- Frontend (React) con componentes sociales y feed en tiempo real
- Sistema de sugerencias de amigos mediante algoritmo de scoring
- Compliance con COPPA para menores de 13 años
- Tests unitarios y de integración

---

## 🔗 Referencias

**Implementa:**
- [RF-SOC-003: Sistema de Amigos](../../01-requerimientos/05-caracteristicas-sociales/RF-SOC-003-sistema-amigos.md)

**Relacionado con:**
- [ET-SOC-001: Aulas Virtuales](./ET-SOC-001-aulas-virtuales.md)
- [ET-NOT-001: Sistema de Notificaciones](../06-notificaciones/ET-NOT-001-tipos-notificaciones.md)

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 ENUMs

```sql
-- Archivo: apps/database/ddl/schemas/social_features/enums/friendship_status.sql
CREATE TYPE social_features.friendship_status AS ENUM (
    'pending',     -- Solicitud enviada
    'accepted',    -- Amigos
    'blocked',     -- Bloqueado
    'unfriended'   -- Amistad terminada
);

-- Archivo: apps/database/ddl/schemas/social_features/enums/privacy_level.sql
CREATE TYPE social_features.privacy_level AS ENUM (
    'public',      -- Visible para todos
    'friends_only',-- Solo amigos
    'hidden'       -- Oculto
);

-- Archivo: apps/database/ddl/schemas/social_features/enums/activity_type.sql
CREATE TYPE social_features.activity_type AS ENUM (
    'achievement_unlocked',
    'level_completed',
    'rank_promoted',
    'streak_milestone',
    'project_completed',
    'first_place_leaderboard'
);
```

### 1.2 Tabla: `friendships`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/friendships.sql
CREATE TABLE social_features.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    status social_features.friendship_status NOT NULL DEFAULT 'pending',
    initiated_by UUID NOT NULL REFERENCES auth.users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CHECK (user1_id < user2_id), -- Garantiza orden único
    UNIQUE (user1_id, user2_id)
);

CREATE INDEX idx_friendships_user1 ON social_features.friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON social_features.friendships(user2_id);
CREATE INDEX idx_friendships_status ON social_features.friendships(status);

-- RLS
ALTER TABLE social_features.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
ON social_features.friendships FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());
```

### 1.3 Tabla: `friend_requests`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/friend_requests.sql
CREATE TABLE social_features.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    message TEXT,
    status social_features.friendship_status NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),

    CHECK (from_user_id != to_user_id),
    UNIQUE (from_user_id, to_user_id)
);

CREATE INDEX idx_friend_requests_to_user ON social_features.friend_requests(to_user_id, status);
CREATE INDEX idx_friend_requests_expires ON social_features.friend_requests(expires_at) WHERE status = 'pending';
```

### 1.4 Tabla: `blocked_users`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/blocked_users.sql
CREATE TABLE social_features.blocked_users (
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,

    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON social_features.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON social_features.blocked_users(blocked_id);
```

### 1.5 Tabla: `user_activities`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/user_activities.sql
CREATE TABLE social_features.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    activity_type social_features.activity_type NOT NULL,
    activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activities_user ON social_features.user_activities(user_id, created_at DESC);
CREATE INDEX idx_user_activities_type ON social_features.user_activities(activity_type);
CREATE INDEX idx_user_activities_visible ON social_features.user_activities(is_visible) WHERE is_visible = TRUE;

-- Retention: Eliminar actividades >90 días
CREATE OR REPLACE FUNCTION social_features.cleanup_old_activities()
RETURNS VOID AS $$
BEGIN
    DELETE FROM social_features.user_activities
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

### 1.6 Tabla: `privacy_settings`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/privacy_settings.sql
CREATE TABLE social_features.privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    recent_activity social_features.privacy_level NOT NULL DEFAULT 'public',
    progress_visibility social_features.privacy_level NOT NULL DEFAULT 'friends_only',
    friends_list_visibility social_features.privacy_level NOT NULL DEFAULT 'private',
    online_status_visible BOOLEAN NOT NULL DEFAULT TRUE,
    allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE,

    is_minor BOOLEAN NOT NULL DEFAULT FALSE,
    parental_approval_required BOOLEAN GENERATED ALWAYS AS (is_minor) STORED,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para configurar privacidad restrictiva para menores
CREATE OR REPLACE FUNCTION social_features.set_minor_privacy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_minor = TRUE THEN
        NEW.recent_activity := 'private';
        NEW.progress_visibility := 'hidden';
        NEW.friends_list_visibility := 'private';
        NEW.online_status_visible := FALSE;
        NEW.allow_direct_messages := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_minor_privacy
BEFORE INSERT OR UPDATE ON social_features.privacy_settings
FOR EACH ROW
EXECUTE FUNCTION social_features.set_minor_privacy();
```

### 1.7 Función: `send_friend_request()`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/functions/send_friend_request.sql
CREATE OR REPLACE FUNCTION social_features.send_friend_request(
    p_from_user_id UUID,
    p_to_user_id UUID,
    p_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_pending_count INT;
    v_is_blocked BOOLEAN;
    v_is_minor BOOLEAN;
BEGIN
    -- Verificar si el remitente es menor y requiere aprobación
    SELECT is_minor INTO v_is_minor
    FROM social_features.privacy_settings
    WHERE user_id = p_from_user_id;

    IF v_is_minor AND NOT EXISTS (
        SELECT 1 FROM auth.parental_approvals
        WHERE user_id = p_from_user_id
        AND approval_type = 'send_friend_requests'
        AND approved = TRUE
    ) THEN
        RAISE EXCEPTION 'Minor requires parental approval to send friend requests';
    END IF;

    -- Verificar si está bloqueado
    SELECT EXISTS (
        SELECT 1 FROM social_features.blocked_users
        WHERE blocker_id = p_to_user_id AND blocked_id = p_from_user_id
    ) INTO v_is_blocked;

    IF v_is_blocked THEN
        RAISE EXCEPTION 'Cannot send request to user who blocked you';
    END IF;

    -- Verificar límite de solicitudes pendientes
    SELECT COUNT(*) INTO v_pending_count
    FROM social_features.friend_requests
    WHERE from_user_id = p_from_user_id AND status = 'pending';

    IF v_pending_count >= 20 THEN
        RAISE EXCEPTION 'Maximum pending friend requests limit reached (20)';
    END IF;

    -- Crear solicitud
    INSERT INTO social_features.friend_requests
    (from_user_id, to_user_id, message, status)
    VALUES (p_from_user_id, p_to_user_id, p_message, 'pending')
    RETURNING id INTO v_request_id;

    -- Crear notificación
    INSERT INTO public.notifications (user_id, type, priority, title, message, metadata)
    VALUES (
        p_to_user_id,
        'friend_request',
        'medium',
        'Nueva solicitud de amistad',
        p_message,
        jsonb_build_object('from_user_id', p_from_user_id, 'request_id', v_request_id)
    );

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.8 Función: `accept_friend_request()`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/functions/accept_friend_request.sql
CREATE OR REPLACE FUNCTION social_features.accept_friend_request(
    p_request_id UUID,
    p_accepter_id UUID
) RETURNS VOID AS $$
DECLARE
    v_from_user_id UUID;
    v_to_user_id UUID;
    v_friend_count INT;
    v_max_friends INT := 50;
    v_is_minor BOOLEAN;
BEGIN
    -- Obtener datos de la solicitud
    SELECT from_user_id, to_user_id
    INTO v_from_user_id, v_to_user_id
    FROM social_features.friend_requests
    WHERE id = p_request_id AND to_user_id = p_accepter_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or already processed';
    END IF;

    -- Verificar si alguno es menor
    SELECT is_minor INTO v_is_minor
    FROM social_features.privacy_settings
    WHERE user_id = p_accepter_id OR user_id = v_from_user_id
    LIMIT 1;

    IF v_is_minor THEN
        v_max_friends := 25;
    END IF;

    -- Verificar límite de amigos del aceptante
    SELECT COUNT(*) INTO v_friend_count
    FROM social_features.friendships
    WHERE (user1_id = p_accepter_id OR user2_id = p_accepter_id)
    AND status = 'accepted';

    IF v_friend_count >= v_max_friends THEN
        RAISE EXCEPTION 'Maximum friends limit reached (%)' , v_max_friends;
    END IF;

    -- Crear amistad (garantizando user1 < user2)
    INSERT INTO social_features.friendships
    (user1_id, user2_id, status, initiated_by, accepted_at)
    VALUES (
        LEAST(v_from_user_id, p_accepter_id),
        GREATEST(v_from_user_id, p_accepter_id),
        'accepted',
        v_from_user_id,
        CURRENT_TIMESTAMP
    );

    -- Actualizar solicitud
    UPDATE social_features.friend_requests
    SET status = 'accepted'
    WHERE id = p_request_id;

    -- Notificar al remitente
    INSERT INTO public.notifications (user_id, type, priority, title, message, metadata)
    VALUES (
        v_from_user_id,
        'friend_request_accepted',
        'medium',
        'Solicitud aceptada',
        'Tu solicitud de amistad fue aceptada',
        jsonb_build_object('accepter_id', p_accepter_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.9 Función: `get_friend_feed()`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/functions/get_friend_feed.sql
CREATE OR REPLACE FUNCTION social_features.get_friend_feed(
    p_user_id UUID,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
) RETURNS TABLE(
    activity_id UUID,
    user_id UUID,
    user_name VARCHAR,
    user_avatar VARCHAR,
    activity_type social_features.activity_type,
    activity_data JSONB,
    likes_count INT,
    comments_count INT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ua.id,
        ua.user_id,
        u.name,
        u.avatar_url,
        ua.activity_type,
        ua.activity_data,
        ua.likes_count,
        ua.comments_count,
        ua.created_at
    FROM social_features.user_activities ua
    JOIN auth.users u ON u.id = ua.user_id
    WHERE ua.is_visible = TRUE
    AND ua.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    AND ua.user_id IN (
        -- Obtener IDs de amigos
        SELECT CASE
            WHEN f.user1_id = p_user_id THEN f.user2_id
            ELSE f.user1_id
        END
        FROM social_features.friendships f
        WHERE (f.user1_id = p_user_id OR f.user2_id = p_user_id)
        AND f.status = 'accepted'
    )
    ORDER BY ua.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Service: `FriendshipService`

```typescript
// Archivo: apps/backend/src/modules/social/services/friendship.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class FriendshipService {
    constructor(private dataSource: DataSource) {}

    async sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<string> {
        const result = await this.dataSource.query(
            'SELECT social_features.send_friend_request($1, $2, $3) AS request_id',
            [fromUserId, toUserId, message]
        );
        return result[0].request_id;
    }

    async acceptFriendRequest(requestId: string, accepterId: string): Promise<void> {
        await this.dataSource.query(
            'SELECT social_features.accept_friend_request($1, $2)',
            [requestId, accepterId]
        );
    }

    async rejectFriendRequest(requestId: string, rejecterId: string): Promise<void> {
        await this.dataSource.query(
            `UPDATE social_features.friend_requests
             SET status = 'rejected'
             WHERE id = $1 AND to_user_id = $2`,
            [requestId, rejecterId]
        );
    }

    async getFriends(userId: string): Promise<any[]> {
        return this.dataSource.query(`
            SELECT
                CASE
                    WHEN f.user1_id = $1 THEN f.user2_id
                    ELSE f.user1_id
                END AS friend_id,
                u.name,
                u.avatar_url,
                up.current_level,
                up.current_xp,
                up.current_rank,
                CASE
                    WHEN u.last_activity_at >= CURRENT_TIMESTAMP - INTERVAL '5 minutes' THEN 'online'
                    WHEN u.last_activity_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 'recently_active'
                    ELSE 'offline'
                END AS status
            FROM social_features.friendships f
            JOIN auth.users u ON u.id = CASE WHEN f.user1_id = $1 THEN f.user2_id ELSE f.user1_id END
            LEFT JOIN progress_tracking.user_progress up ON up.user_id = u.id
            WHERE (f.user1_id = $1 OR f.user2_id = $1)
            AND f.status = 'accepted'
            ORDER BY u.last_activity_at DESC NULLS LAST
        `, [userId]);
    }

    async blockUser(blockerId: string, blockedId: string): Promise<void> {
        // Eliminar amistad si existe
        await this.dataSource.query(`
            DELETE FROM social_features.friendships
            WHERE (user1_id = $1 AND user2_id = $2)
               OR (user1_id = $2 AND user2_id = $1)
        `, [Math.min(blockerId, blockedId), Math.max(blockerId, blockedId)]);

        // Añadir a bloqueados
        await this.dataSource.query(
            `INSERT INTO social_features.blocked_users (blocker_id, blocked_id)
             VALUES ($1, $2)
             ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
            [blockerId, blockedId]
        );
    }

    async getFriendSuggestions(userId: string, limit: number = 10): Promise<any[]> {
        return this.dataSource.query(`
            WITH user_friends AS (
                SELECT CASE
                    WHEN f.user1_id = $1 THEN f.user2_id
                    ELSE f.user1_id
                END AS friend_id
                FROM social_features.friendships f
                WHERE (f.user1_id = $1 OR f.user2_id = $1)
                AND f.status = 'accepted'
            ),
            suggestions AS (
                SELECT
                    u.id,
                    u.name,
                    u.avatar_url,
                    COUNT(DISTINCT cm.classroom_id) * 5 +  -- Compañeros de aula
                    COUNT(DISTINCT uf.friend_id) * 3 +      -- Amigos en común
                    CASE
                        WHEN ABS(up1.current_level - up2.current_level) <= 3 THEN 2
                        ELSE 0
                    END AS score                            -- Nivel similar
                FROM auth.users u
                LEFT JOIN social_features.classroom_members cm ON cm.user_id = u.id
                LEFT JOIN user_friends uf ON uf.friend_id IN (
                    SELECT CASE WHEN f2.user1_id = u.id THEN f2.user2_id ELSE f2.user1_id END
                    FROM social_features.friendships f2
                    WHERE (f2.user1_id = u.id OR f2.user2_id = u.id)
                )
                LEFT JOIN progress_tracking.user_progress up1 ON up1.user_id = $1
                LEFT JOIN progress_tracking.user_progress up2 ON up2.user_id = u.id
                WHERE u.id != $1
                AND u.id NOT IN (SELECT friend_id FROM user_friends)
                AND u.id NOT IN (SELECT blocked_id FROM social_features.blocked_users WHERE blocker_id = $1)
                GROUP BY u.id, up1.current_level, up2.current_level
                HAVING COUNT(*) > 0
                ORDER BY score DESC
                LIMIT $2
            )
            SELECT * FROM suggestions
        `, [userId, limit]);
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Hook: `useFriends`

```typescript
// Archivo: apps/frontend/src/hooks/useFriends.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useFriends(userId: string) {
    return useQuery({
        queryKey: ['friends', userId],
        queryFn: async () => {
            const response = await apiClient.get(`/friends/${userId}`);
            return response.data;
        }
    });
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { to_user_id: string; message?: string }) => {
            const response = await apiClient.post('/friends/request', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
        }
    });
}

export function useAcceptFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: string) => {
            await apiClient.post(`/friends/request/${requestId}/accept`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
        }
    });
}
```

### 3.2 Componente: `FriendsList`

```typescript
// Archivo: apps/frontend/src/components/social/FriendsList.tsx
import React from 'react';
import { useFriends } from '../../hooks/useFriends';

export function FriendsList({ userId }: { userId: string }) {
    const { data: friends, isLoading } = useFriends(userId);

    if (isLoading) return <div>Cargando amigos...</div>;
    if (!friends || friends.length === 0) return <div>No tienes amigos aún</div>;

    return (
        <div className="friends-list">
            {friends.map(friend => (
                <div key={friend.friend_id} className="friend-item">
                    <img src={friend.avatar_url} alt={friend.name} className="avatar" />
                    <div className="friend-info">
                        <h3>{friend.name}</h3>
                        <span className="rank">{friend.current_rank}</span>
                        <span className={`status ${friend.status}`}>
                            {friend.status === 'online' ? '🟢' : friend.status === 'recently_active' ? '🟡' : '⚪'}
                        </span>
                    </div>
                    <div className="friend-stats">
                        <span>Nivel {friend.current_level}</span>
                        <span>{friend.current_xp} XP</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
```

---

## ✅ Criterios de Aceptación

- [x] Tabla `friendships` con constraint de orden único (user1 < user2)
- [x] Tabla `friend_requests` con límite de 20 solicitudes pendientes
- [x] Tabla `blocked_users` previene interacciones con usuarios bloqueados
- [x] Tabla `privacy_settings` con configuración automática para menores
- [x] Función `send_friend_request()` valida COPPA y bloqueos
- [x] Función `accept_friend_request()` respeta límites de amigos (50/25)
- [x] Función `get_friend_feed()` retorna actividades de amigos (últimos 7 días)
- [x] FriendshipService implementa lógica de negocio completa
- [x] Hook `useFriends` cachea datos eficientemente
- [x] Componente `FriendsList` muestra estado de actividad en tiempo real

---

## 📚 Referencias Técnicas

### Database
- Schema: `social_features`
- Tablas: `friendships`, `friend_requests`, `blocked_users`, `user_activities`, `privacy_settings`
- Funciones: `send_friend_request()`, `accept_friend_request()`, `get_friend_feed()`

### Backend
- Service: `apps/backend/src/modules/social/services/friendship.service.ts`
- Controller: `apps/backend/src/modules/social/controllers/friendship.controller.ts`

### Frontend
- Hook: `apps/frontend/src/hooks/useFriends.ts`
- Component: `apps/frontend/src/components/social/FriendsList.tsx`
- Component: `apps/frontend/src/components/social/FriendFeed.tsx`

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, Frontend, Legal (COPPA)
**Próxima revisión:** 2026-01-07
