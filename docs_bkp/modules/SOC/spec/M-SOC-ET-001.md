
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-SOC-001 -->
<!-- ID Nuevo: M-SOC-ET-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-SOC-ET-001: Sistema de Aulas Virtuales - Especificación Técnica

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-SOC-001 |
| **Módulo** | 05 - Características Sociales |
| **Título** | Sistema de Aulas Virtuales - Implementación |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Backend Team |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Implementa:**
- [RF-SOC-001: Sistema de Aulas Virtuales](../../01-requerimientos/05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md)

### Implementación DDL

🗄️ **ENUMs:**
- `social_features.classroom_role` → `apps/database/ddl/schemas/social_features/enums/classroom_role.sql:1-8`
- `social_features.classroom_status` → `apps/database/ddl/schemas/social_features/enums/classroom_status.sql:1-8`

🗄️ **Tablas:**
- `social_features.classrooms` → `apps/database/ddl/schemas/social_features/tables/classrooms.sql:1-45`
- `social_features.classroom_members` → `apps/database/ddl/schemas/social_features/tables/classroom_members.sql:1-35`
- `social_features.classroom_invitations` → `apps/database/ddl/schemas/social_features/tables/classroom_invitations.sql:1-40`

---

## 📖 Descripción General

Sistema completo de aulas virtuales que permite a maestros organizar estudiantes, asignar contenido y monitorear progreso en tiempo real.

### Arquitectura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────>│   Backend    │────>│  PostgreSQL  │
│    React     │     │   NestJS     │     │  + RLS       │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 🗄️ Implementación en Base de Datos

### 1. Tabla: classrooms

```sql
-- apps/database/ddl/schemas/social_features/tables/classrooms.sql

CREATE TABLE social_features.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Información básica
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) >= 3),
    description TEXT,

    -- Estado y ownership
    status social_features.classroom_status DEFAULT 'draft' NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

    -- Configuración flexible
    settings JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    activated_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT owner_must_be_teacher CHECK (
        EXISTS (
            SELECT 1 FROM auth_management.profiles
            WHERE user_id = owner_id AND role IN ('admin_teacher', 'super_admin')
        )
    )
);

-- Índices
CREATE INDEX idx_classrooms_owner ON social_features.classrooms(owner_id);
CREATE INDEX idx_classrooms_status ON social_features.classrooms(status);
CREATE INDEX idx_classrooms_created_at ON social_features.classrooms(created_at DESC);

-- RLS Policies
ALTER TABLE social_features.classrooms ENABLE ROW LEVEL SECURITY;

-- Policy: Ver aulas donde soy miembro
CREATE POLICY classrooms_select_member
ON social_features.classrooms
FOR SELECT
USING (
    id IN (
        SELECT classroom_id
        FROM social_features.classroom_members
        WHERE user_id = auth.uid()
    )
);

-- Policy: Solo owner puede actualizar
CREATE POLICY classrooms_update_owner
ON social_features.classrooms
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy: Solo owner puede eliminar
CREATE POLICY classrooms_delete_owner
ON social_features.classrooms
FOR DELETE
USING (owner_id = auth.uid());
```

### 2. Tabla: classroom_members

```sql
-- apps/database/ddl/schemas/social_features/tables/classroom_members.sql

CREATE TABLE social_features.classroom_members (
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role social_features.classroom_role NOT NULL DEFAULT 'student',

    -- Metadatos
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    invited_by UUID REFERENCES auth.users(id),

    -- Primary key compuesta
    PRIMARY KEY (classroom_id, user_id)
);

-- Índices
CREATE INDEX idx_classroom_members_user ON social_features.classroom_members(user_id);
CREATE INDEX idx_classroom_members_role ON social_features.classroom_members(classroom_id, role);

-- RLS
ALTER TABLE social_features.classroom_members ENABLE ROW LEVEL SECURITY;

-- Policy: Ver miembros de mis aulas
CREATE POLICY classroom_members_select_own
ON social_features.classroom_members
FOR SELECT
USING (
    classroom_id IN (
        SELECT classroom_id
        FROM social_features.classroom_members
        WHERE user_id = auth.uid()
    )
);

-- Policy: Solo owner puede agregar/remover
CREATE POLICY classroom_members_manage_owner
ON social_features.classroom_members
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM social_features.classrooms
        WHERE id = classroom_id AND owner_id = auth.uid()
    )
);
```

### 3. Tabla: classroom_invitations

```sql
-- apps/database/ddl/schemas/social_features/tables/classroom_invitations.sql

CREATE TABLE social_features.classroom_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,

    -- Invitación
    invitee_email VARCHAR(255) NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    role social_features.classroom_role NOT NULL DEFAULT 'student',

    -- Token único
    token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES auth.users(id),

    -- Constraints
    CONSTRAINT no_duplicate_pending CHECK (
        accepted_at IS NOT NULL OR NOT EXISTS (
            SELECT 1 FROM social_features.classroom_invitations i2
            WHERE i2.classroom_id = classroom_invitations.classroom_id
              AND i2.invitee_email = classroom_invitations.invitee_email
              AND i2.accepted_at IS NULL
              AND i2.id != classroom_invitations.id
        )
    )
);

-- Índices
CREATE INDEX idx_invitations_token ON social_features.classroom_invitations(token);
CREATE INDEX idx_invitations_email ON social_features.classroom_invitations(invitee_email);
CREATE INDEX idx_invitations_expires ON social_features.classroom_invitations(expires_at)
    WHERE accepted_at IS NULL;
```

### 4. Función: create_classroom

```sql
-- apps/database/ddl/schemas/social_features/functions/create_classroom.sql

CREATE OR REPLACE FUNCTION social_features.create_classroom(
    p_owner_id UUID,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_settings JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_classroom_id UUID;
BEGIN
    -- Validar que owner sea maestro
    IF NOT EXISTS (
        SELECT 1 FROM auth_management.profiles
        WHERE user_id = p_owner_id
          AND role IN ('admin_teacher', 'super_admin')
    ) THEN
        RAISE EXCEPTION 'User must be a teacher to create classrooms';
    END IF;

    -- Crear aula
    INSERT INTO social_features.classrooms (
        name,
        description,
        owner_id,
        status,
        settings
    ) VALUES (
        p_name,
        p_description,
        p_owner_id,
        'draft',
        p_settings
    )
    RETURNING id INTO v_classroom_id;

    -- Agregar owner como miembro
    INSERT INTO social_features.classroom_members (
        classroom_id,
        user_id,
        role,
        joined_at
    ) VALUES (
        v_classroom_id,
        p_owner_id,
        'owner',
        NOW()
    );

    RETURN v_classroom_id;
END;
$$;
```

### 5. Función: invite_to_classroom

```sql
-- apps/database/ddl/schemas/social_features/functions/invite_to_classroom.sql

CREATE OR REPLACE FUNCTION social_features.invite_to_classroom(
    p_classroom_id UUID,
    p_inviter_id UUID,
    p_invitee_email TEXT,
    p_role social_features.classroom_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation_id UUID;
    v_inviter_role social_features.classroom_role;
BEGIN
    -- Validar permisos del inviter
    SELECT role INTO v_inviter_role
    FROM social_features.classroom_members
    WHERE classroom_id = p_classroom_id AND user_id = p_inviter_id;

    IF v_inviter_role IS NULL THEN
        RAISE EXCEPTION 'Inviter is not a member of this classroom';
    END IF;

    -- Solo owner puede invitar assistant_teachers
    IF p_role = 'assistant_teacher' AND v_inviter_role != 'owner' THEN
        RAISE EXCEPTION 'Only owner can invite assistant teachers';
    END IF;

    -- Validar aula activa
    IF NOT EXISTS (
        SELECT 1 FROM social_features.classrooms
        WHERE id = p_classroom_id AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Classroom must be active to send invitations';
    END IF;

    -- Validar email no es ya miembro
    IF EXISTS (
        SELECT 1 FROM social_features.classroom_members cm
        JOIN auth.users u ON cm.user_id = u.id
        WHERE cm.classroom_id = p_classroom_id AND u.email = p_invitee_email
    ) THEN
        RAISE EXCEPTION 'User is already a member of this classroom';
    END IF;

    -- Crear invitación
    INSERT INTO social_features.classroom_invitations (
        classroom_id,
        invitee_email,
        invited_by,
        role,
        token,
        expires_at
    ) VALUES (
        p_classroom_id,
        p_invitee_email,
        p_inviter_id,
        p_role,
        encode(gen_random_bytes(32), 'hex'),
        NOW() + INTERVAL '7 days'
    )
    RETURNING id INTO v_invitation_id;

    RETURN v_invitation_id;
END;
$$;
```

### 6. Función: accept_classroom_invitation

```sql
-- apps/database/ddl/schemas/social_features/functions/accept_classroom_invitation.sql

CREATE OR REPLACE FUNCTION social_features.accept_classroom_invitation(
    p_token TEXT,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation RECORD;
BEGIN
    -- Obtener invitación
    SELECT * INTO v_invitation
    FROM social_features.classroom_invitations
    WHERE token = p_token
      AND expires_at > NOW()
      AND accepted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Verificar aula activa
    IF NOT EXISTS (
        SELECT 1 FROM social_features.classrooms
        WHERE id = v_invitation.classroom_id AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Classroom is not active';
    END IF;

    -- Agregar como miembro
    INSERT INTO social_features.classroom_members (
        classroom_id,
        user_id,
        role,
        invited_by,
        joined_at
    ) VALUES (
        v_invitation.classroom_id,
        p_user_id,
        v_invitation.role,
        v_invitation.invited_by,
        NOW()
    )
    ON CONFLICT (classroom_id, user_id) DO NOTHING;

    -- Marcar invitación como aceptada
    UPDATE social_features.classroom_invitations
    SET
        accepted_at = NOW(),
        accepted_by = p_user_id
    WHERE id = v_invitation.id;

    -- Crear notificación para inviter
    INSERT INTO gamification_system.notifications (
        user_id,
        notification_type,
        priority,
        title,
        body,
        data
    ) VALUES (
        v_invitation.invited_by,
        'classroom_member_joined',
        'medium',
        'Nuevo miembro en tu aula',
        'Un estudiante aceptó tu invitación',
        jsonb_build_object(
            'classroom_id', v_invitation.classroom_id,
            'new_member_id', p_user_id
        )
    );

    RETURN v_invitation.classroom_id;
END;
$$;
```

---

## 💻 Implementación Backend (NestJS)

### 1. Service: ClassroomService

```typescript
// apps/backend/src/modules/social/services/classroom.service.ts

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,
  ) {}

  async create(
    ownerId: string,
    dto: CreateClassroomDto
  ): Promise<Classroom> {
    const result = await this.classroomRepo.query(
      'SELECT social_features.create_classroom($1, $2, $3, $4) as id',
      [ownerId, dto.name, dto.description, dto.settings || {}]
    );

    const classroomId = result[0].id;
    return this.findOne(classroomId);
  }

  async activate(classroomId: string, userId: string): Promise<void> {
    const classroom = await this.findOne(classroomId);

    if (classroom.owner_id !== userId) {
      throw new ForbiddenException('Only owner can activate classroom');
    }

    if (classroom.status !== 'draft') {
      throw new ForbiddenException('Only draft classrooms can be activated');
    }

    await this.classroomRepo.update(classroomId, {
      status: 'active',
      activated_at: new Date(),
    });
  }

  async invite(
    classroomId: string,
    inviterId: string,
    dto: InviteToClassroomDto
  ): Promise<Invitation> {
    const result = await this.classroomRepo.query(
      'SELECT social_features.invite_to_classroom($1, $2, $3, $4) as id',
      [classroomId, inviterId, dto.email, dto.role]
    );

    const invitationId = result[0].id;

    // Enviar email (delegado a NotificationService)
    await this.notificationService.sendInvitationEmail(invitationId);

    return this.findInvitation(invitationId);
  }

  async acceptInvitation(token: string, userId: string): Promise<string> {
    const result = await this.classroomRepo.query(
      'SELECT social_features.accept_classroom_invitation($1, $2) as classroom_id',
      [token, userId]
    );

    return result[0].classroom_id;
  }

  async getMembers(classroomId: string): Promise<ClassroomMember[]> {
    return this.classroomRepo.query(
      `SELECT cm.*, u.email, p.display_name, p.avatar_url
       FROM social_features.classroom_members cm
       JOIN auth.users u ON cm.user_id = u.id
       JOIN auth_management.profiles p ON u.id = p.user_id
       WHERE cm.classroom_id = $1
       ORDER BY cm.role, cm.joined_at`,
      [classroomId]
    );
  }

  async removeMember(
    classroomId: string,
    ownerId: string,
    memberIdToRemove: string
  ): Promise<void> {
    const classroom = await this.findOne(classroomId);

    if (classroom.owner_id !== ownerId) {
      throw new ForbiddenException('Only owner can remove members');
    }

    if (memberIdToRemove === ownerId) {
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    await this.classroomRepo.query(
      'DELETE FROM social_features.classroom_members WHERE classroom_id = $1 AND user_id = $2',
      [classroomId, memberIdToRemove]
    );
  }
}
```

### 2. Controller: ClassroomController

```typescript
// apps/backend/src/modules/social/controllers/classroom.controller.ts

import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Roles('admin_teacher', 'super_admin')
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClassroomDto
  ) {
    return this.classroomService.create(userId, dto);
  }

  @Post(':id/activate')
  async activate(
    @Param('id') classroomId: string,
    @CurrentUser('id') userId: string
  ) {
    await this.classroomService.activate(classroomId, userId);
    return { message: 'Classroom activated successfully' };
  }

  @Post(':id/invite')
  async invite(
    @Param('id') classroomId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteToClassroomDto
  ) {
    return this.classroomService.invite(classroomId, userId, dto);
  }

  @Get(':id/members')
  async getMembers(@Param('id') classroomId: string) {
    return this.classroomService.getMembers(classroomId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') classroomId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string
  ) {
    await this.classroomService.removeMember(classroomId, userId, memberId);
    return { message: 'Member removed successfully' };
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. Component: ClassroomCard

```tsx
// apps/frontend/src/components/classrooms/ClassroomCard.tsx

import React from 'react';
import { Classroom } from '../../types/classroom';

interface ClassroomCardProps {
  classroom: Classroom;
  onSelect: (id: string) => void;
}

export const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  onSelect,
}) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
    deleted: 'bg-red-100 text-red-700',
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => onSelect(classroom.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{classroom.name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${statusColors[classroom.status]}`}>
          {classroom.status}
        </span>
      </div>

      {classroom.description && (
        <p className="text-sm text-gray-600 mb-4">{classroom.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>👥 {classroom.member_count || 0} miembros</span>
        <span>📚 {classroom.content_count || 0} módulos</span>
      </div>
    </div>
  );
};
```

### 2. Component: ClassroomInviteModal

```tsx
// apps/frontend/src/components/classrooms/ClassroomInviteModal.tsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { classroomApi } from '../../api/classroom.api';

interface ClassroomInviteModalProps {
  isOpen: boolean;
  classroomId: string;
  onClose: () => void;
}

export const ClassroomInviteModal: React.FC<ClassroomInviteModalProps> = ({
  isOpen,
  classroomId,
  onClose,
}) => {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<'student' | 'assistant_teacher'>('student');

  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      classroomApi.invite(classroomId, { email, role }),
    onSuccess: () => {
      alert('Invitación enviada exitosamente');
    },
  });

  const handleSubmit = () => {
    const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);

    emailList.forEach(email => {
      inviteMutation.mutate(email);
    });

    setEmails('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Invitar al aula</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Emails (separados por comas)
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
              placeholder="ana@example.com, carlos@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full border rounded p-2"
            >
              <option value="student">Estudiante</option>
              <option value="assistant_teacher">Maestro Asistente</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Enviar Invitaciones
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Test Cases

### Test Case 1: Crear Aula Como Maestro

```typescript
describe('ClassroomService - Create', () => {
  it('should create classroom as teacher', async () => {
    // Arrange
    const teacher = await createUser({ role: 'admin_teacher' });

    // Act
    const classroom = await classroomService.create(teacher.id, {
      name: 'Español 5to Grado',
      description: 'Clase de español básico',
    });

    // Assert
    expect(classroom.name).toBe('Español 5to Grado');
    expect(classroom.status).toBe('draft');
    expect(classroom.owner_id).toBe(teacher.id);

    // Verify membership
    const members = await classroomService.getMembers(classroom.id);
    expect(members).toHaveLength(1);
    expect(members[0].role).toBe('owner');
  });

  it('should fail if non-teacher tries to create classroom', async () => {
    // Arrange
    const student = await createUser({ role: 'student' });

    // Act & Assert
    await expect(
      classroomService.create(student.id, { name: 'Test' })
    ).rejects.toThrow('User must be a teacher');
  });
});
```

### Test Case 2: Invitar y Aceptar

```typescript
describe('ClassroomService - Invitation Flow', () => {
  it('should complete full invitation flow', async () => {
    // Arrange
    const teacher = await createUser({ role: 'admin_teacher' });
    const classroom = await classroomService.create(teacher.id, {
      name: 'Test Classroom',
    });
    await classroomService.activate(classroom.id, teacher.id);

    const studentEmail = 'student@example.com';

    // Act 1: Invite
    const invitation = await classroomService.invite(
      classroom.id,
      teacher.id,
      { email: studentEmail, role: 'student' }
    );

    expect(invitation.token).toBeDefined();
    expect(invitation.expires_at).toBeDefined();

    // Act 2: Accept
    const student = await createUser({ email: studentEmail });
    const resultClassroomId = await classroomService.acceptInvitation(
      invitation.token,
      student.id
    );

    // Assert
    expect(resultClassroomId).toBe(classroom.id);

    const members = await classroomService.getMembers(classroom.id);
    const studentMember = members.find(m => m.user_id === student.id);
    expect(studentMember).toBeDefined();
    expect(studentMember.role).toBe('student');
  });
});
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Backend Team | Creación del documento |

---

**Documento:** `docs/02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-001-aulas-virtuales.md`
**Propósito:** Especificación técnica del sistema de aulas virtuales
**Audiencia:** Desarrolladores Backend, Frontend, Database
