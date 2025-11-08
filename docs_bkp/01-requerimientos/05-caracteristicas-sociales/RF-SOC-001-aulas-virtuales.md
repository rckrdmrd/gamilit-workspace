# RF-SOC-001: Sistema de Aulas Virtuales

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-SOC-001 |
| **Módulo** | 05 - Características Sociales |
| **Título** | Sistema de Aulas Virtuales |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Social Features Team |
| **Stakeholders** | Product Owner, Teachers, Backend Team, Frontend Team |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/schemas/social_features/enums/classroom_role.sql:1-8`
- **Tipo:** `social_features.classroom_role`
- **Valores:** `'owner'`, `'assistant_teacher'`, `'student'`

🗄️ **ENUM: classroom_status**
- **Ubicación:** `apps/database/ddl/schemas/social_features/enums/classroom_status.sql:1-8`
- **Tipo:** `social_features.classroom_status`
- **Valores:** `'draft'`, `'active'`, `'archived'`, `'deleted'`

🗄️ **Tablas Relacionadas:**
1. **`social_features.classrooms`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/tables/classrooms.sql:1-45`
   - **Columnas clave:**
     - `id UUID PRIMARY KEY`
     - `name VARCHAR(200)`
     - `description TEXT`
     - `status classroom_status DEFAULT 'draft'`
     - `owner_id UUID` (maestro creador)
     - `settings JSONB` (configuración flexible)
     - `created_at`, `updated_at`

2. **`social_features.classroom_members`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/tables/classroom_members.sql:1-35`
   - **Propósito:** Membresía de usuarios en aulas
   - **Columnas clave:**
     - `classroom_id UUID`
     - `user_id UUID`
     - `role classroom_role`
     - `joined_at TIMESTAMPTZ`
     - `invited_by UUID`

3. **`social_features.classroom_invitations`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/tables/classroom_invitations.sql:1-40`
   - **Propósito:** Invitaciones pendientes
   - **Columnas clave:**
     - `id UUID`
     - `classroom_id UUID`
     - `invitee_email VARCHAR(255)`
     - `invited_by UUID`
     - `role classroom_role`
     - `token VARCHAR(64)` (código único)
     - `expires_at TIMESTAMPTZ`
     - `accepted_at TIMESTAMPTZ`

🗄️ **Funciones SQL:**
1. **`create_classroom(p_owner_id UUID, p_name TEXT, p_description TEXT)`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/functions/create_classroom.sql:1-50`
   - **Propósito:** Crear aula y agregar owner como miembro

2. **`invite_to_classroom(p_classroom_id UUID, p_inviter_id UUID, p_email TEXT, p_role classroom_role)`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/functions/invite_to_classroom.sql:1-70`
   - **Propósito:** Crear invitación con token único

3. **`accept_classroom_invitation(p_token TEXT, p_user_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/functions/accept_classroom_invitation.sql:1-60`
   - **Propósito:** Procesar aceptación de invitación

4. **`get_classroom_members_count(p_classroom_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/social_features/functions/get_classroom_members_count.sql:1-20`
   - **Propósito:** Contar miembros por rol

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-SOC-001: Implementación del Sistema de Aulas Virtuales](../../02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-001-aulas-virtuales.md)

### Documentos Relacionados

- [RF-AUTH-001: Sistema de Roles](../01-autenticacion-autorizacion/RF-AUTH-001-roles.md) - Roles base del sistema
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-estados-progreso.md) - Progreso de estudiantes en aulas
- [RF-CNT-001: Gestión de Contenido](../07-contenido-media/RF-CNT-001-gestion-media.md) - Contenido asignado a aulas

---

## 📖 Descripción General

### Propósito

El **Sistema de Aulas Virtuales** permite a los maestros crear espacios educativos organizados donde pueden:
- Organizar estudiantes por grupos, grados o asignaturas
- Asignar contenido educativo (módulos, lecciones, ejercicios)
- Monitorear progreso de estudiantes en tiempo real
- Colaborar con otros maestros (maestros asistentes)
- Gestionar membresía (invitar, remover estudiantes)

### Contexto Educativo

Las aulas virtuales replican la estructura del aula física pero con ventajas digitales:
- **Flexibilidad:** Sin límite de espacio físico
- **Trazabilidad:** Todo el progreso es medido automáticamente
- **Colaboración:** Maestros pueden co-enseñar
- **Accesibilidad:** Estudiantes acceden desde cualquier lugar

### Alcance

**Incluye:**
- ✅ Creación y gestión de aulas
- ✅ 3 roles: owner (maestro principal), assistant_teacher, student
- ✅ Sistema de invitaciones por email
- ✅ Gestión de membresía (agregar, remover miembros)
- ✅ 4 estados de aula (draft, active, archived, deleted)
- ✅ Configuración personalizable por aula (JSONB)
- ✅ Dashboard de progreso de estudiantes
- ✅ Asignación de contenido a aula

**Excluye:**
- ❌ Chat en vivo (fuera del alcance inicial)
- ❌ Videollamadas integradas
- ❌ Pizarra colaborativa en tiempo real
- ❌ Evaluaciones síncronas (exámenes con tiempo límite)

---

## ⚙️ Requerimientos Funcionales

### 1. Roles en Aula

#### 1.1. Owner (Maestro Principal) 👨‍🏫

**Descripción:**
- Creador del aula
- Control total sobre el aula
- Solo puede haber 1 owner por aula
- Puede transferir ownership a otro maestro

**Permisos:**
| Acción | Permitido |
|--------|-----------|
| Ver aula | ✅ |
| Editar configuración aula | ✅ |
| Archivar/Eliminar aula | ✅ |
| Invitar estudiantes | ✅ |
| Invitar assistant_teacher | ✅ |
| Remover miembros | ✅ (excepto a sí mismo) |
| Asignar contenido | ✅ |
| Ver progreso estudiantes | ✅ |
| Calificar ejercicios | ✅ |
| Transferir ownership | ✅ |

**Flujo de creación de aula:**
```
Maestro hace click "Crear Aula"
        ↓
Formulario: nombre, descripción, configuración
        ↓
Submit → Backend: create_classroom()
        ↓
Aula creada en estado 'draft'
Maestro agregado como 'owner' en classroom_members
        ↓
Maestro puede invitar estudiantes
```

---

#### 1.2. Assistant Teacher (Maestro Asistente) 👩‍🏫

**Descripción:**
- Co-maestro del aula
- Ayuda con calificación y monitoreo
- Puede haber múltiples assistant_teachers
- No puede modificar configuración del aula

**Permisos:**
| Acción | Permitido |
|--------|-----------|
| Ver aula | ✅ |
| Editar configuración aula | ❌ |
| Archivar/Eliminar aula | ❌ |
| Invitar estudiantes | ✅ |
| Invitar assistant_teacher | ❌ (solo owner) |
| Remover miembros | ❌ |
| Asignar contenido | ✅ |
| Ver progreso estudiantes | ✅ |
| Calificar ejercicios | ✅ |

**Caso de uso típico:**
- Escuela con 2-3 maestros enseñando la misma materia
- Maestro principal invita a colegas como assistant_teachers
- Todos pueden calificar y monitorear, pero solo owner controla aula

---

#### 1.3. Student (Estudiante) 👨‍🎓

**Descripción:**
- Miembro del aula sin permisos administrativos
- Accede a contenido asignado
- Puede ver su propio progreso

**Permisos:**
| Acción | Permitido |
|--------|-----------|
| Ver aula | ✅ (solo info básica) |
| Ver contenido asignado | ✅ |
| Completar ejercicios | ✅ |
| Ver su propio progreso | ✅ |
| Ver progreso de otros | ❌ |
| Invitar otros estudiantes | ❌ |
| Salir del aula | ✅ |

**Restricciones:**
- No puede ver datos de otros estudiantes
- No puede modificar configuración
- No puede invitar a nadie

---

### 2. Estados del Aula

#### Estado 1: Draft (Borrador) 📝

**Descripción:**
- Estado inicial al crear aula
- Aula no visible para estudiantes
- Maestro puede configurar antes de activar

**Características:**
- Solo visible para owner y assistant_teachers
- Estudiantes no pueden ser invitados (solo después de activar)
- Puede ser editada libremente
- No genera notificaciones

**Transición a Active:**
```sql
UPDATE social_features.classrooms
SET status = 'active',
    activated_at = NOW()
WHERE id = classroom_id AND status = 'draft';
```

**Validaciones antes de activar:**
- ✅ Nombre del aula configurado
- ✅ Al menos 1 owner

---

#### Estado 2: Active (Activa) ✅

**Descripción:**
- Aula operativa y visible
- Estudiantes pueden ser invitados
- Contenido puede ser asignado

**Características:**
- Visible en listado de aulas para todos los miembros
- Invitaciones pueden ser enviadas
- Progreso de estudiantes se trackea
- Dashboard de progreso disponible

**Acciones disponibles:**
- Invitar estudiantes/maestros
- Asignar módulos/lecciones
- Ver dashboard de progreso
- Calificar ejercicios de escritura
- Comunicar con estudiantes (notificaciones)

---

#### Estado 3: Archived (Archivada) 📦

**Descripción:**
- Aula finalizada pero con datos preservados
- Solo lectura para todos
- No acepta nuevos miembros ni contenido

**Características:**
- Historial de progreso preservado
- Estudiantes pueden ver su progreso final
- Maestros pueden consultar datos
- No aparece en listado activo de aulas
- Puede ser reactivada por owner

**Casos de uso:**
- Fin de semestre/año escolar
- Aula completada por todos los estudiantes
- Preservar datos históricos sin interferir con aulas actuales

**Transición a Active:**
```sql
UPDATE social_features.classrooms
SET status = 'active',
    archived_at = NULL
WHERE id = classroom_id AND status = 'archived';
```

---

#### Estado 4: Deleted (Eliminada) ❌

**Descripción:**
- Aula marcada para eliminación
- Soft delete (no se borra físicamente)
- Puede ser recuperada dentro de 30 días

**Características:**
- No visible para nadie (excepto owner con permisos de recuperación)
- Después de 30 días, puede ser eliminada permanentemente
- Estudiantes reciben notificación si estaban activos

**Proceso de eliminación:**
```
Owner hace click "Eliminar Aula"
        ↓
Confirmación: "¿Seguro? Tienes 30 días para recuperar"
        ↓
UPDATE status = 'deleted', deleted_at = NOW()
        ↓
Job programado: eliminar permanentemente después de 30 días
```

---

### 3. Sistema de Invitaciones

#### 3.1. Crear Invitación

**Flujo:**
```
Maestro ingresa email de invitado + rol (student/assistant_teacher)
        ↓
Backend: invite_to_classroom(classroom_id, inviter_id, email, role)
        ↓
1. Generar token único (UUID)
2. Crear registro en classroom_invitations
3. Enviar email con link: /invitations/{token}
4. Expiración: 7 días
        ↓
Invitado recibe email
```

**Estructura de email:**
```html
¡Hola!

{inviter_name} te ha invitado a unirte al aula "{classroom_name}" como {role}.

[Aceptar Invitación]

Este enlace expira el {expiry_date}.
```

#### 3.2. Aceptar Invitación

**Flujo:**
```
Usuario hace click en link del email
        ↓
Frontend: /invitations/{token}
        ↓
Si no está autenticado: Redirigir a login/registro
        ↓
Usuario autenticado
        ↓
Backend: accept_classroom_invitation(token, user_id)
        ↓
1. Validar token no expirado
2. Validar invitación no aceptada previamente
3. Crear registro en classroom_members
4. Marcar invitación como aceptada (accepted_at = NOW())
5. Notificar al inviter
        ↓
Redirigir a aula
```

**Validaciones:**
- Token existe y no ha expirado
- Invitación no ha sido aceptada
- Usuario no es ya miembro del aula
- Aula está en estado 'active' (no draft/deleted)

#### 3.3. Rechazar/Expirar Invitación

**Casos:**
1. **Usuario rechaza explícitamente:** Marcar como `rejected_at = NOW()`
2. **Token expira (7 días):** Invitación inválida, requiere nueva invitación
3. **Aula eliminada:** Invitación automáticamente inválida

---

### 4. Gestión de Membresía

#### 4.1. Agregar Miembro (por invitación)

Ya cubierto en sección 3.

#### 4.2. Remover Miembro

**Quién puede remover:**
- Owner puede remover a cualquiera (excepto a sí mismo)
- Assistant_teacher NO puede remover a nadie

**Flujo:**
```
Owner selecciona miembro → "Remover de aula"
        ↓
Confirmación
        ↓
DELETE FROM classroom_members
WHERE classroom_id = ? AND user_id = ?
        ↓
Notificar al usuario removido
```

**Restricciones:**
- Owner no puede removerse a sí mismo (debe transferir ownership primero)
- Si owner es removido, aula queda sin owner (estado inconsistente) → Prevenir

#### 4.3. Transferir Ownership

**Flujo:**
```
Owner actual selecciona nuevo owner (debe ser assistant_teacher del aula)
        ↓
Confirmación: "¿Seguro? Perderás control del aula"
        ↓
BEGIN TRANSACTION;
  -- Cambiar owner actual a assistant_teacher
  UPDATE classroom_members
  SET role = 'assistant_teacher'
  WHERE classroom_id = ? AND user_id = current_owner_id;

  -- Promover nuevo owner
  UPDATE classroom_members
  SET role = 'owner'
  WHERE classroom_id = ? AND user_id = new_owner_id;

  -- Actualizar owner_id en classroom
  UPDATE classrooms
  SET owner_id = new_owner_id
  WHERE id = classroom_id;
COMMIT;
        ↓
Notificar a ambos usuarios
```

#### 4.4. Salir del Aula (estudiante)

**Flujo:**
```
Estudiante hace click "Salir del aula"
        ↓
Confirmación: "¿Seguro? Perderás acceso al contenido"
        ↓
DELETE FROM classroom_members
WHERE classroom_id = ? AND user_id = ?
        ↓
Notificar al owner
```

**Consecuencias:**
- Pierde acceso a contenido del aula
- Progreso se preserva (por si vuelve)
- Puede ser re-invitado

---

### 5. Configuración del Aula

#### 5.1. Configuración Básica

**Campos editables por owner:**
- `name` (VARCHAR 200) - Nombre del aula
- `description` (TEXT) - Descripción detallada
- `settings` (JSONB) - Configuración flexible

**Ejemplo de settings JSONB:**
```json
{
  "allow_student_self_enroll": false,
  "enrollment_code": null,
  "require_approval_to_join": false,
  "student_visibility": "progress_only",
  "allow_peer_interaction": true,
  "default_module_visibility": "sequential",
  "grading_policy": {
    "allow_retries": true,
    "max_attempts": 3,
    "passing_score": 70
  },
  "notifications": {
    "notify_on_completion": true,
    "notify_on_low_performance": true,
    "digest_frequency": "weekly"
  }
}
```

#### 5.2. Opciones de Configuración

| Opción | Valores | Descripción |
|--------|---------|-------------|
| `allow_student_self_enroll` | boolean | Permitir a estudiantes unirse con código |
| `enrollment_code` | string\|null | Código para auto-inscripción (si habilitado) |
| `student_visibility` | `'none'`, `'progress_only'`, `'all'` | Qué pueden ver estudiantes de otros |
| `allow_peer_interaction` | boolean | Comentarios entre estudiantes |
| `default_module_visibility` | `'all'`, `'sequential'` | Desbloqueo de módulos |
| `grading_policy.allow_retries` | boolean | Permitir reintentos |
| `grading_policy.max_attempts` | integer | Intentos máximos por ejercicio |
| `grading_policy.passing_score` | integer | Puntaje mínimo para aprobar (%) |

---

### 6. Dashboard de Progreso

#### 6.1. Vista General del Aula

**Maestro ve:**
- Total estudiantes en aula
- Progreso promedio del aula (%)
- Estudiantes activos esta semana
- Ejercicios completados (totales)
- Módulos asignados y completitud

**Ejemplo de dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│  Aula: Español Básico - 5to Grado                       │
│  Estudiantes: 28 | Progreso Promedio: 67%               │
└─────────────────────────────────────────────────────────┘

📊 Progreso por Módulo:
  Módulo 1: Vocabulario Maya    ████████████████░░░░ 82%
  Módulo 2: Gramática Básica    ██████████░░░░░░░░░░ 53%
  Módulo 3: Lectura Comprensiva ████░░░░░░░░░░░░░░░░ 21%

👥 Estudiantes con Mejor Progreso:
  1. Ana López          95% (Ah K'in)
  2. Carlos Méndez      89% (Nacom)
  3. María Hernández    87% (Nacom)

⚠️ Estudiantes en Riesgo (< 40%):
  - Pedro García        28% (última actividad: 5 días)
  - Laura Martínez      35% (última actividad: 3 días)
```

#### 6.2. Vista Individual de Estudiante

**Maestro ve (al hacer click en estudiante):**
```
┌─────────────────────────────────────────────────────────┐
│  Ana López (ana.lopez@example.com)                      │
│  Rango: Ah K'in ☀️ | Progreso: 95%                      │
│  Última actividad: Hoy, 10:45 AM                        │
└─────────────────────────────────────────────────────────┘

📈 Estadísticas:
  - Ejercicios completados: 287 / 302
  - Tasa de éxito: 94%
  - Tiempo promedio por ejercicio: 2.3 min
  - Racha actual: 12 días 🔥

📚 Progreso por Módulo:
  ✅ Módulo 1: Vocabulario Maya       100% (Dominado)
  ✅ Módulo 2: Gramática Básica       100% (Completado)
  🔵 Módulo 3: Lectura Comprensiva     78% (En progreso)
  🔘 Módulo 4: Escritura Creativa       0% (No iniciado)

💪 Fortalezas:
  - Excelente en ejercicios de vocabulario
  - Alta consistencia (racha de 12 días)
  - Completa ejercicios sin usar comodines

⚠️ Áreas de mejora:
  - Ejercicios de pronunciación: 67% (bajo su promedio)
```

---

## 💼 Casos de Uso

### CU-SOC-001-001: Crear Aula y Activarla

**Actor:** Maestro (con rol admin_teacher)

**Precondiciones:**
- Usuario autenticado con rol `admin_teacher`

**Flujo Principal:**

1. Maestro navega a "Mis Aulas" → "Crear Aula"
2. Formulario de creación:
   - Nombre: "Español Básico - 5to Grado"
   - Descripción: "Clase de español para estudiantes de 5to grado"
   - Configuración: (valores por defecto)
3. Maestro hace click "Crear"
4. Backend ejecuta `create_classroom()`:
   ```sql
   BEGIN;
     INSERT INTO social_features.classrooms (id, name, description, owner_id, status)
     VALUES (gen_random_uuid(), 'Español Básico - 5to Grado', '...', maestro_id, 'draft');

     INSERT INTO social_features.classroom_members (classroom_id, user_id, role)
     VALUES (new_classroom_id, maestro_id, 'owner');
   COMMIT;
   ```
5. Sistema redirige a vista del aula en estado `draft`
6. Maestro configura aula (opcional)
7. Maestro hace click "Activar Aula"
8. Sistema cambia estado a `active`
9. Notificación: "Aula activada. Ya puedes invitar estudiantes."

**Postcondiciones:**
- Aula existe en estado `active`
- Maestro es miembro con rol `owner`

---

### CU-SOC-001-002: Invitar Estudiantes al Aula

**Actor:** Maestro (owner o assistant_teacher)

**Precondiciones:**
- Aula en estado `active`
- Maestro tiene permisos de invitar

**Flujo Principal:**

1. Maestro en vista de aula → "Invitar Estudiantes"
2. Formulario:
   - Emails: "ana@example.com, carlos@example.com, maria@example.com"
   - Rol: "Student" (seleccionado por defecto)
3. Maestro hace click "Enviar Invitaciones"
4. Backend procesa cada email:
   ```sql
   FOR each_email IN emails_list LOOP
     PERFORM social_features.invite_to_classroom(
       classroom_id,
       maestro_id,
       each_email,
       'student'
     );
   END LOOP;
   ```
5. Sistema genera tokens únicos para cada invitación
6. Envía emails:
   ```
   De: noreply@gamilit.com
   Para: ana@example.com
   Asunto: Invitación al aula "Español Básico - 5to Grado"

   ¡Hola!

   La maestra María Rodríguez te ha invitado a unirte al aula
   "Español Básico - 5to Grado" como estudiante.

   [Aceptar Invitación] → https://gamilit.com/invitations/abc123...

   Este enlace expira el 14 de noviembre de 2025.
   ```
7. Maestro ve lista de invitaciones pendientes en UI

**Postcondiciones:**
- 3 invitaciones creadas con estado `pending`
- Emails enviados a estudiantes
- Tokens válidos por 7 días

---

### CU-SOC-001-003: Estudiante Acepta Invitación

**Actor:** Estudiante

**Precondiciones:**
- Invitación válida recibida por email

**Flujo Principal:**

1. Estudiante hace click en link del email
2. Redirigido a `/invitations/{token}`
3. Sistema valida token:
   - Existe ✅
   - No expirado ✅
   - No aceptado previamente ✅
   - Aula en estado `active` ✅
4. **Si NO está autenticado:**
   - Mostrar opciones: "Iniciar Sesión" o "Registrarse"
   - Después de autenticar, continuar flujo
5. **Si está autenticado:**
   - Mostrar confirmación:
     ```
     ┌─────────────────────────────────────────┐
     │  Te han invitado al aula:               │
     │  "Español Básico - 5to Grado"           │
     │                                         │
     │  Maestra: María Rodríguez               │
     │  Rol: Estudiante                        │
     │                                         │
     │  [Aceptar]  [Rechazar]                  │
     └─────────────────────────────────────────┘
     ```
6. Estudiante hace click "Aceptar"
7. Backend ejecuta `accept_classroom_invitation()`:
   ```sql
   BEGIN;
     -- Validar invitación
     SELECT * FROM classroom_invitations
     WHERE token = ? AND expires_at > NOW() AND accepted_at IS NULL
     FOR UPDATE;

     -- Agregar como miembro
     INSERT INTO classroom_members (classroom_id, user_id, role, invited_by)
     VALUES (classroom_id, user_id, 'student', inviter_id);

     -- Marcar invitación como aceptada
     UPDATE classroom_invitations
     SET accepted_at = NOW(), accepted_by = user_id
     WHERE token = ?;

     -- Crear notificación para maestro
     INSERT INTO notifications (...)
   COMMIT;
   ```
8. Sistema redirige a vista del aula
9. Maestro recibe notificación: "Ana López se unió al aula"

**Postcondiciones:**
- Estudiante es miembro del aula con rol `student`
- Invitación marcada como aceptada
- Maestro notificado

---

## 🔒 Consideraciones de Seguridad

### 1. Control de Acceso

**Row Level Security (RLS) Policies:**

```sql
-- Policy: Usuarios solo pueden ver aulas donde son miembros
CREATE POLICY classroom_select_own
ON social_features.classrooms
FOR SELECT
USING (
  id IN (
    SELECT classroom_id
    FROM social_features.classroom_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Solo owner puede actualizar aula
CREATE POLICY classroom_update_owner
ON social_features.classrooms
FOR UPDATE
USING (owner_id = auth.uid());

-- Policy: Solo owner puede eliminar aula
CREATE POLICY classroom_delete_owner
ON social_features.classrooms
FOR DELETE
USING (owner_id = auth.uid());
```

### 2. Validación de Invitaciones

**Prevenir abuso:**
- Tokens criptográficamente seguros (UUID v4)
- Expiración de 7 días
- Un solo uso por token
- Rate limiting: máximo 50 invitaciones por hora por aula
- Validar que email no sea ya miembro

### 3. Protección de Datos de Estudiantes

**FERPA/GDPR Compliance:**
- Estudiantes solo ven su propio progreso
- Maestros ven datos agregados y anónimos (salvo sus propios estudiantes)
- Padres pueden solicitar acceso a datos de sus hijos (requiere verificación)
- Datos se anonimiza después de 5 años de inactividad

---

## ✅ Criterios de Aceptación

### CA-SOC-001-001: Crear Aula

- [ ] Maestro puede crear aula con nombre y descripción
- [ ] Aula se crea en estado `draft` por defecto
- [ ] Maestro creador es automáticamente `owner`
- [ ] Aula puede ser activada por owner

### CA-SOC-001-002: Invitar Miembros

- [ ] Owner y assistant_teacher pueden invitar estudiantes
- [ ] Solo owner puede invitar assistant_teachers
- [ ] Email de invitación contiene link único
- [ ] Invitación expira después de 7 días
- [ ] Invitación puede ser aceptada por usuario autenticado

### CA-SOC-001-003: Roles y Permisos

- [ ] Owner tiene todos los permisos
- [ ] Assistant_teacher puede calificar pero no modificar aula
- [ ] Student solo ve contenido y su propio progreso
- [ ] Permisos validados en backend (no confiar en frontend)

### CA-SOC-001-004: Estados de Aula

- [ ] Aula inicia en `draft`
- [ ] Puede activarse (`active`)
- [ ] Puede archivarse (`archived`)
- [ ] Puede eliminarse (soft delete → `deleted`)
- [ ] Transiciones de estado validadas

### CA-SOC-001-005: Dashboard de Progreso

- [ ] Maestro ve progreso promedio del aula
- [ ] Maestro ve progreso individual de cada estudiante
- [ ] Dashboard actualiza en tiempo real
- [ ] Estudiantes en riesgo identificados automáticamente

---

## 🧪 Testing

### Test Case 1: Crear Aula Como Maestro

```typescript
test('Teacher can create classroom', async () => {
  // Arrange
  const teacher = await createUser({ role: 'admin_teacher' });

  // Act
  const classroom = await classroomService.create(teacher.id, {
    name: 'Español 5to Grado',
    description: 'Clase de español',
  });

  // Assert
  expect(classroom.name).toBe('Español 5to Grado');
  expect(classroom.status).toBe('draft');
  expect(classroom.owner_id).toBe(teacher.id);

  // Verify teacher is member with role 'owner'
  const members = await classroomService.getMembers(classroom.id);
  const ownerMember = members.find(m => m.user_id === teacher.id);
  expect(ownerMember.role).toBe('owner');
});
```

### Test Case 2: Invitar y Aceptar Invitación

```typescript
test('Student can accept invitation to classroom', async () => {
  // Arrange
  const teacher = await createUser({ role: 'admin_teacher' });
  const classroom = await classroomService.create(teacher.id, {
    name: 'Test Classroom',
  });
  await classroomService.activate(classroom.id);

  const studentEmail = 'student@example.com';

  // Act - Invite
  const invitation = await classroomService.invite(
    classroom.id,
    teacher.id,
    studentEmail,
    'student'
  );

  expect(invitation.token).toBeDefined();
  expect(invitation.expires_at).toBeDefined();

  // Act - Accept
  const student = await createUser({ email: studentEmail });
  await classroomService.acceptInvitation(invitation.token, student.id);

  // Assert
  const members = await classroomService.getMembers(classroom.id);
  const studentMember = members.find(m => m.user_id === student.id);
  expect(studentMember).toBeDefined();
  expect(studentMember.role).toBe('student');

  // Verify invitation marked as accepted
  const updatedInvitation = await getInvitation(invitation.id);
  expect(updatedInvitation.accepted_at).not.toBeNull();
});
```

### Test Case 3: Restricción de Permisos por Rol

```typescript
test('Student cannot remove other students from classroom', async () => {
  // Arrange
  const teacher = await createUser({ role: 'admin_teacher' });
  const student1 = await createUser({ role: 'student' });
  const student2 = await createUser({ role: 'student' });

  const classroom = await createActiveClassroom(teacher.id);
  await addMemberToClassroom(classroom.id, student1.id, 'student');
  await addMemberToClassroom(classroom.id, student2.id, 'student');

  // Act & Assert
  await expect(
    classroomService.removeMember(classroom.id, student1.id, student2.id) // student1 trying to remove student2
  ).rejects.toThrow('Insufficient permissions');
});

test('Owner can remove students', async () => {
  // Arrange
  const teacher = await createUser({ role: 'admin_teacher' });
  const student = await createUser({ role: 'student' });

  const classroom = await createActiveClassroom(teacher.id);
  await addMemberToClassroom(classroom.id, student.id, 'student');

  // Act
  await classroomService.removeMember(classroom.id, teacher.id, student.id);

  // Assert
  const members = await classroomService.getMembers(classroom.id);
  const studentMember = members.find(m => m.user_id === student.id);
  expect(studentMember).toBeUndefined();
});
```

---

## 📊 Diagramas

### Diagrama 1: Arquitectura del Sistema de Aulas

```
┌───────────────────────────────────────────────────────────┐
│              SISTEMA DE AULAS VIRTUALES                   │
└───────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Frontend     │       │    Backend      │       │   PostgreSQL    │
│     (React)     │       │    (NestJS)     │       │                 │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │ POST /classrooms        │                         │
         │ (create classroom)      │                         │
         │────────────────────────>│                         │
         │                         │ create_classroom()      │
         │                         │────────────────────────>│
         │                         │                         │
         │                         │  BEGIN;                 │
         │                         │  INSERT classrooms      │
         │                         │  INSERT classroom_      │
         │                         │         members (owner) │
         │                         │  COMMIT;                │
         │                         │                         │
         │                         │<────────────────────────│
         │<────────────────────────│                         │
         │ { classroom_id, ... }   │                         │
         │                         │                         │
         │ POST /classrooms/:id/   │                         │
         │      invite             │                         │
         │────────────────────────>│                         │
         │                         │ invite_to_classroom()   │
         │                         │────────────────────────>│
         │                         │                         │
         │                         │  INSERT invitation      │
         │                         │  RETURN token           │
         │                         │                         │
         │                         │<────────────────────────│
         │                         │ Send Email              │
         │                         │──────────>[Email Svc]   │
         │<────────────────────────│                         │
         │                         │                         │
```

### Diagrama 2: Flujo de Invitación

```
┌────────────────────────────────────────────────────────────┐
│             FLUJO DE INVITACIÓN A AULA                     │
└────────────────────────────────────────────────────────────┘

    [Maestro ingresa email de estudiante]
                    ↓
    ┌───────────────────────────────┐
    │ Backend: invite_to_classroom()│
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ 1. Validar permisos maestro   │
    │ 2. Validar aula activa        │
    │ 3. Validar email no es miembro│
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ Generar token único (UUID)    │
    │ Expiración: NOW() + 7 days    │
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ INSERT classroom_invitations  │
    │ - token                       │
    │ - classroom_id                │
    │ - invitee_email               │
    │ - invited_by                  │
    │ - role ('student')            │
    │ - expires_at                  │
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ Enviar email con link         │
    │ /invitations/{token}          │
    └───────────┬───────────────────┘
                ↓
        [Estudiante recibe email]
                ↓
        [Click en link]
                ↓
    ┌───────────────────────────────┐
    │ ¿Autenticado?                 │
    └───────┬───────────────────────┘
            │
      ┌─────┴──────┐
      NO          SÍ
      │            │
      ↓            ↓
  [Login/     [Mostrar confirmación]
   Registro]       │
      │            ↓
      └────────>[Aceptar Invitación]
                   ↓
    ┌───────────────────────────────┐
    │ accept_classroom_invitation() │
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────────┐
    │ BEGIN;                        │
    │ 1. Validar token              │
    │ 2. INSERT classroom_members   │
    │ 3. UPDATE invitation          │
    │    SET accepted_at = NOW()    │
    │ 4. CREATE notification        │
    │ COMMIT;                       │
    └───────────┬───────────────────┘
                ↓
    [Redirigir a vista del aula]
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Social Features Team | Creación del documento |

---

**Documento:** `docs/01-requerimientos/05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md`
**Propósito:** Requerimientos funcionales del sistema de aulas virtuales
**Audiencia:** Product Owner, Teachers, Developers, QA Team
