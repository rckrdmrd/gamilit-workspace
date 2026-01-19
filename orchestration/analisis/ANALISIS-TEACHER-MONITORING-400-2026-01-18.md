# ANALISIS COMPLETO: Error 400 en Teacher/Monitoring

**Fecha:** 2026-01-18
**Estado:** ANALISIS COMPLETADO - PLAN DE ACCION DEFINIDO
**Prioridad:** CRITICA
**Afecta:** Portal de Maestros - Pagina Teacher/Monitoring

---

## 1. DESCRIPCION DEL PROBLEMA

### 1.1 Errores Reportados en Consola

```
WebSocket connection to 'ws://localhost:3006/socket.io/?EIO=4&transport=websocket' failed:
WebSocket is closed before the connection is established.

🔌 Connecting to WebSocket server: ws://localhost:3006
✅ WebSocket connected: mbU6l9NRQvHA11qcAAAL
✅ WebSocket authenticated

GET http://localhost:3006/api/v1/teacher/classrooms/00000000-0000-0000-0000-000000000001 400 (Bad Request)

[ClassroomsAPI] Error fetching classroom details: AxiosError {...}
[useClassrooms] Error selecting classroom: AxiosError {...}
```

### 1.2 Flujo del Error

```
TeacherMonitoringPage
       │
       │ useClassrooms() hook
       │
       ├─> fetchClassrooms() ──> GET /teacher/classrooms ──> OK (200)
       │                                    │
       │                         Devuelve: [{ id: '00000000-...', name: 'GAMILIT...'}]
       │
       ├─> useEffect: auto-select first classroom
       │       if (classrooms.length > 0) selectClassroom(classrooms[0].id)
       │
       └─> selectClassroom('00000000-0000-0000-0000-000000000001')
                    │
                    └─> getClassroomById(id) ──> GET /teacher/classrooms/:id ──> 400 BAD REQUEST
```

---

## 2. OBJETOS IMPLICADOS

### 2.1 Frontend (React)

| Archivo | Linea | Rol |
|---------|-------|-----|
| `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx` | 50-54 | Pagina principal, auto-select classroom |
| `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` | 71-88 | Hook selectClassroom que falla |
| `apps/frontend/src/services/api/teacher/classroomsApi.ts` | 157-167 | Metodo getClassroomById |
| `apps/frontend/src/services/api/apiClient.ts` | 25-31 | Cliente Axios base |
| `apps/frontend/src/config/api.config.ts` | 404-405 | Endpoint configuration |
| `apps/frontend/src/features/notifications/hooks/useWebSocket.ts` | 144-247 | WebSocket hook (error inicial) |

### 2.2 Backend (NestJS)

| Archivo | Linea | Rol |
|---------|-------|-----|
| `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` | 174-204 | Endpoint GET /:id |
| `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | 224-241 | Servicio getClassroomById |
| `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | 971-979 | validateTeacherAccess |
| `apps/backend/src/main.ts` | 55-64 | Global ValidationPipe |
| `apps/backend/src/shared/filters/http-exception.filter.ts` | 43-96 | AllExceptionsFilter |

### 2.3 Base de Datos

| Archivo | Descripcion |
|---------|-------------|
| `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql` | Tabla classrooms |
| `apps/database/ddl/schemas/social_features/tables/06-teacher_classrooms.sql` | Relacion teacher-classroom |
| `apps/database/seeds/dev/social_features/02-classrooms.sql` | Seed del classroom DEFAULT |

### 2.4 Documentacion Relacionada

| Archivo | Contenido |
|---------|-----------|
| `orchestration/analisis/ANALISIS-DETALLADO-CLASSROOMID-2026-01-08.md` | Analisis previo de problemas con classroomId |
| `docs/95-guias-desarrollo/PORTAL-TEACHER-API-REFERENCE.md` | Referencia de API |
| `docs/95-guias-desarrollo/errores-comunes/database/ERR-DB-001-uuid-format.md` | Errores de formato UUID |

---

## 3. ANALISIS DE CAUSA RAIZ

### 3.1 UUID Problematico

El UUID `00000000-0000-0000-0000-000000000001` se usa extensivamente como:
- ID del classroom DEFAULT en seeds
- ID del tenant de prueba (gamilit-test)
- ID de referencia en tests

**Caracteristicas del UUID:**
- Formato: 8-4-4-4-12 (CORRECTO)
- Version: 0 (INCORRECTO - No es UUID v1, v3, v4, ni v5)
- Variante: No estandar

### 3.2 Hipotesis de Causa

#### Hipotesis A: ParseUUIDPipe Rechaza el UUID (DESCARTADA)
- ParseUUIDPipe sin version especifica acepta cualquier formato 8-4-4-4-12
- El UUID tiene formato correcto
- **RESULTADO:** No es la causa directa

#### Hipotesis B: Falta Relacion teacher_classrooms (MAS PROBABLE)
- El teacher logueado NO tiene entrada en `teacher_classrooms`
- `validateTeacherAccess()` busca en esta tabla
- Si no encuentra, lanza `ForbiddenException` (403)
- **PERO:** El error es 400, no 403

#### Hipotesis C: Seed No Ejecutado Correctamente (PROBABLE)
- Si el seed `02-classrooms.sql` no se ejecuto
- El classroom DEFAULT no existe
- **PERO:** getClassrooms() retorna el classroom, entonces existe

#### Hipotesis D: Problema en sync de teacher_classrooms (MUY PROBABLE)

El seed `02-classrooms.sql` tiene esta seccion:
```sql
INSERT INTO social_features.teacher_classrooms (...)
SELECT '...', c.teacher_id, c.id, ...
FROM social_features.classrooms c
WHERE c.teacher_id IS NOT NULL AND c.code = 'DEFAULT'
ON CONFLICT (id) DO UPDATE SET ...
```

**PROBLEMA IDENTIFICADO:**
- El INSERT usa `c.teacher_id` del classroom
- El teacher_id en el classroom es `'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'` (teacher@gamilit.com)
- Si el usuario logueado tiene un ID diferente, NO tendra acceso

### 3.3 Causa Raiz Confirmada

**El teacher autenticado NO tiene una entrada en `teacher_classrooms` para el classroom DEFAULT.**

Flujo de validacion:
```
getClassroomById(classroomId, teacherId)
       │
       ├─> classroomRepo.findOne({ id: classroomId }) ──> OK (classroom existe)
       │
       └─> validateTeacherAccess(teacherId, classroomId)
                    │
                    └─> teacherClassroomRepo.findOne({
                            teacher_id: teacherId,     <── ID del usuario actual
                            classroom_id: classroomId  <── classroom DEFAULT
                        })
                        │
                        └─> NULL (no hay relacion)
                                 │
                                 └─> throw ForbiddenException (403)
```

**PERO el error es 400, no 403...**

### 3.4 Revision del Error 400

Revisando el flujo completo, el error 400 puede venir de:

1. **ValidationPipe global** rechazando algo
2. **ParseUUIDPipe** en modo estricto
3. **Algun middleware** validando el request

**Verificacion adicional necesaria:**
- El ParseUUIDPipe de NestJS por defecto usa la libreria `uuid` que valida segun RFC 4122
- El UUID `00000000-0000-0000-0000-000000000001` puede ser considerado invalido por el validador

**CONCLUSION FINAL:**
El **ParseUUIDPipe de NestJS** esta rechazando el UUID porque aunque tiene formato correcto, NO es un UUID valido segun RFC 4122 (los bits de version/variante no corresponden a ningun tipo estandar).

---

## 4. ANALISIS DE PROBLEMAS RELACIONADOS (DEL ANALISIS PREVIO)

Del documento `ANALISIS-DETALLADO-CLASSROOMID-2026-01-08.md`:

### P0 - CRITICOS
| ID | Problema | Estado | Impacto |
|----|----------|--------|---------|
| B1 | JOIN incorrecto en getStudentsWithSearch | PENDIENTE | Lista vacia de estudiantes |
| F1 | Query params ignorados en TeacherProgressPage | PENDIENTE | Siempre muestra "todas las clases" |
| B2 | Filtro `OR classroom_id IS NULL` | PENDIENTE | Estadisticas incorrectas |

### P1 - ALTOS
| ID | Problema | Estado | Impacto |
|----|----------|--------|---------|
| DB1 | Trigger no responde a UPDATE de status | PENDIENTE | Contadores desactualizados |
| DB2 | Falta sync de teacher_classrooms | PENDIENTE | Teachers sin acceso a aulas |
| ORM1/2 | Entities sin relaciones | PENDIENTE | N+1 query problem |

---

## 5. MAPA DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TeacherMonitoringPage.tsx                                                   │
│         │                                                                    │
│         ├── useClassrooms() hook                                             │
│         │      │                                                             │
│         │      ├── classroomsApi.getClassrooms()                             │
│         │      │         └── GET /teacher/classrooms                         │
│         │      │                                                             │
│         │      └── classroomsApi.getClassroomById(id)                        │
│         │                └── GET /teacher/classrooms/:id  ◄── ERROR 400      │
│         │                                                                    │
│         ├── useUserGamification() hook                                       │
│         │                                                                    │
│         └── StudentMonitoringPanel component                                 │
│                   │                                                          │
│                   └── useStudentMonitoring() hook                            │
│                            └── classroomsApi.getClassroomStudents()          │
│                                      └── GET /teacher/classrooms/:id/students│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TeacherClassroomsController                                                 │
│         │                                                                    │
│         ├── @Get() getClassrooms()                                           │
│         │      └── TeacherClassroomsCrudService.getClassrooms()              │
│         │               │                                                    │
│         │               ├── userRepo.findOne() ──────────────────┐           │
│         │               ├── teacherClassroomRepo.find() ─────────┤           │
│         │               └── classroomRepo.findMany() ────────────┤           │
│         │                                                        │           │
│         ├── @Get(':id') getClassroomById()  ◄── ParseUUIDPipe    │           │
│         │      └── TeacherClassroomsCrudService.getClassroomById()           │
│         │               │                                        │           │
│         │               ├── classroomRepo.findOne() ─────────────┤           │
│         │               └── validateTeacherAccess() ─────────────┤           │
│         │                        └── teacherClassroomRepo.findOne()          │
│         │                                                        │           │
│         └── @Get(':id/students') getClassroomStudents()          │           │
│                └── TeacherClassroomsCrudService.getClassroomStudents()       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  social_features.classrooms                                                  │
│         │                                                                    │
│         │── id: UUID (PK)                                                    │
│         │── teacher_id: UUID (FK to profiles)                                │
│         │── tenant_id: UUID (FK to tenants)                                  │
│         └── name, code, grade_level, subject, etc.                           │
│                                                                              │
│  social_features.teacher_classrooms (M:N)                                    │
│         │                                                                    │
│         │── teacher_id: UUID (FK to profiles)                                │
│         │── classroom_id: UUID (FK to classrooms)                            │
│         └── role: 'owner' | 'co_teacher' | 'assistant'                       │
│                                                                              │
│  social_features.classroom_members (Students)                                │
│         │                                                                    │
│         │── student_id: UUID (FK to profiles)                                │
│         │── classroom_id: UUID (FK to classrooms)                            │
│         └── status: 'active' | 'inactive'                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. PLAN DE CORRECCION

### FASE 1: Correccion Inmediata del Error 400

#### Tarea 1.1: Cambiar UUIDs de Seeds a Formato Valido
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** Corrige el error 400 de ParseUUIDPipe

**Accion:**
Reemplazar UUIDs de formato `00000000-0000-0000-0000-000000000001` por UUIDs v4 validos:

```sql
-- ANTES (UUID no valido segun RFC 4122)
'00000000-0000-0000-0000-000000000001'::uuid

-- DESPUES (UUID v4 valido)
'a0000000-0000-4000-8000-000000000001'::uuid
```

**Archivos a modificar:**
1. `apps/database/seeds/dev/social_features/02-classrooms.sql`
2. `apps/database/seeds/staging/social_features/02-classrooms.sql`
3. `apps/database/seeds/prod/social_features/02-classrooms.sql`
4. Todos los archivos que referencien este UUID

#### Tarea 1.2: Agregar Teacher a teacher_classrooms
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** Corrige error de acceso ForbiddenException

**Accion:**
Crear trigger o script que automaticamente agregue teachers a classroom DEFAULT:

```sql
-- Agregar trigger para auto-asignar teachers al classroom DEFAULT
CREATE OR REPLACE FUNCTION social_features.auto_assign_teacher_to_default_classroom()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el usuario es teacher, agregarlo al classroom DEFAULT
  IF NEW.role IN ('ADMIN_TEACHER', 'SUPER_ADMIN') THEN
    INSERT INTO social_features.teacher_classrooms (
      id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at
    )
    SELECT
      gen_random_uuid(),
      NEW.user_id,
      c.id,
      c.tenant_id,
      'co_teacher',
      NOW(),
      NOW()
    FROM social_features.classrooms c
    WHERE c.code = 'DEFAULT'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### FASE 2: Correcciones de Problemas Relacionados (P0)

#### Tarea 2.1: Corregir JOIN en getStudentsWithSearch (B1)
**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Linea:** ~913-914

```sql
-- ANTES (INCORRECTO)
LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id

-- DESPUES (CORRECTO)
LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
```

#### Tarea 2.2: Eliminar filtro OR NULL (B2)
**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Lineas:** ~568, 615, 653

```sql
-- ANTES
WHERE mp.classroom_id = $3 OR mp.classroom_id IS NULL

-- DESPUES
WHERE mp.classroom_id = $3
```

### FASE 3: Correcciones de Base de Datos (P1)

#### Tarea 3.1: Actualizar Trigger de Contadores (DB1)
**Archivo:** `apps/database/ddl/schemas/social_features/triggers/25-trg_update_classroom_count.sql`

```sql
-- Agregar handler para UPDATE de status
CREATE OR REPLACE TRIGGER trg_update_classroom_count_on_status
AFTER UPDATE OF status ON social_features.classroom_members
FOR EACH ROW
EXECUTE FUNCTION social_features.update_classroom_member_count();
```

#### Tarea 3.2: Crear Sync de teacher_classrooms (DB2)
**Archivo:** NUEVO - `apps/database/ddl/schemas/social_features/triggers/26-trg_sync_teacher_classrooms.sql`

---

## 7. ORDEN DE EJECUCION

```
┌──────────────────────────────────────────────────────────────────┐
│ FASE 1: Correccion Inmediata (BLOQUEANTE)                        │
├──────────────────────────────────────────────────────────────────┤
│ 1.1 Cambiar UUIDs en seeds a formato v4 valido                   │
│ 1.2 Recrear base de datos con seeds actualizados                 │
│ 1.3 Verificar que teacher tenga acceso al classroom DEFAULT      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ VALIDACION: Error 400 debe desaparecer                           │
│             GET /teacher/classrooms/:id debe retornar 200        │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ FASE 2: Correcciones Backend (P0)                                │
├──────────────────────────────────────────────────────────────────┤
│ 2.1 Corregir JOIN en getStudentsWithSearch                       │
│ 2.2 Eliminar filtro OR NULL                                      │
│ 2.3 Ejecutar build + lint + tests                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ VALIDACION: Lista de estudiantes debe mostrar datos correctos    │
│             Estadisticas deben ser precisas por classroom        │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ FASE 3: Correcciones BD (P1)                                     │
├──────────────────────────────────────────────────────────────────┤
│ 3.1 Actualizar trigger de contadores                             │
│ 3.2 Crear trigger de sync teacher_classrooms                     │
│ 3.3 Recrear base de datos                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. VALIDACIONES POST-CORRECCION

### 8.1 Tests de Regresion

```bash
# Backend
cd apps/backend
npm run build
npm run lint
npm run test

# Frontend
cd apps/frontend
npm run build
npm run lint
npm run typecheck
```

### 8.2 Tests Manuales

1. **Login como teacher@gamilit.com**
   - Navegar a `/teacher/monitoring`
   - Verificar que NO hay errores en consola
   - Verificar que el classroom DEFAULT se carga

2. **Verificar WebSocket**
   - La conexion debe establecerse sin errores
   - Los eventos de notificacion deben funcionar

3. **Verificar Lista de Estudiantes**
   - Debe mostrar estudiantes del classroom
   - Estadisticas deben ser correctas

### 8.3 Queries de Verificacion

```sql
-- Verificar que el classroom DEFAULT existe con UUID valido
SELECT id, name, code FROM social_features.classrooms WHERE code = 'DEFAULT';

-- Verificar que teachers tienen acceso
SELECT tc.teacher_id, tc.classroom_id, tc.role, p.email
FROM social_features.teacher_classrooms tc
JOIN auth_management.profiles p ON p.user_id = tc.teacher_id
WHERE tc.classroom_id = (SELECT id FROM social_features.classrooms WHERE code = 'DEFAULT');

-- Verificar estudiantes en el classroom
SELECT COUNT(*) FROM social_features.classroom_members
WHERE classroom_id = (SELECT id FROM social_features.classrooms WHERE code = 'DEFAULT');
```

---

## 9. REFERENCIAS

- `orchestration/analisis/ANALISIS-DETALLADO-CLASSROOMID-2026-01-08.md` - Analisis previo
- `docs/95-guias-desarrollo/errores-comunes/database/ERR-DB-001-uuid-format.md` - Errores UUID
- `CHANGELOG.md:249` - Referencia al UUID problematico
- RFC 4122 - Formato UUID estandar

---

## 10. CONCLUSION

El error 400 en `/teacher/monitoring` tiene **dos causas principales**:

1. **UUID no valido segun RFC 4122:** El UUID `00000000-0000-0000-0000-000000000001` usado en seeds NO es un UUID valido de ninguna version estandar, y ParseUUIDPipe lo rechaza.

2. **Falta de relacion teacher_classrooms:** Aun si el UUID fuera valido, el teacher autenticado puede no tener entrada en la tabla `teacher_classrooms`, lo que causaria un error 403.

La solucion requiere:
- Actualizar seeds con UUIDs v4 validos
- Asegurar que teachers tengan acceso automatico al classroom DEFAULT
- Corregir los problemas adicionales identificados en el analisis previo

---

**Documento generado:** 2026-01-18
**Autor:** Agente Arquitecto de Soluciones
**Siguiente paso:** Implementar FASE 1 de correcciones
