# PLAN DE CORRECCIÓN: ISSUES P0, P1, P2 - PORTAL TEACHER

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Issues a Corregir:** 6 (1 P0, 2 P1, 3 P2)

---

## 📋 RESUMEN DE ISSUES

| ID | Prioridad | Descripción | Acción |
|----|-----------|-------------|--------|
| ISS-001 | **P0** | teacher_classrooms sin RLS | Crear policies |
| ISS-002 | **P1** | teacher_classrooms FK inconsistente | Migrar FK |
| ISS-003 | **P2** | assignments FK legacy | Migrar FK |
| ISS-004 | **P2** | monitoring/activity faltante | Documentar alternativa |
| ISS-005 | **P2** | monitoring/realtime faltante | Documentar alternativa |
| ISS-006 | **P2** | progress/overview faltante | Documentar alternativa |

---

## 🔧 CORRECCIÓN ISS-001: RLS teacher_classrooms (P0)

### Archivos a Crear/Modificar

| Archivo | Acción | Agente |
|---------|--------|--------|
| `social_features/rls-policies/07-teacher-classrooms-policies.sql` | CREAR | Database-Agent |
| `social_features/rls-policies/01-enable-rls.sql` | MODIFICAR | Database-Agent |
| `social_features/rls-policies/03-grants.sql` | MODIFICAR | Database-Agent |

### Contenido de 07-teacher-classrooms-policies.sql

```sql
-- =====================================================
-- RLS Policies for: social_features.teacher_classrooms
-- Created: 2025-11-26
-- =====================================================

-- Policy 1: Teachers can view their own assignments
CREATE POLICY teacher_classrooms_read_teacher
    ON social_features.teacher_classrooms
    FOR SELECT
    USING (teacher_id = current_setting('app.current_user_id', true)::uuid);

-- Policy 2: Admins can view all
CREATE POLICY teacher_classrooms_read_admin
    ON social_features.teacher_classrooms
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
            AND ur.role IN ('super_admin', 'admin_teacher')
        )
    );

-- Policy 3: Only admins can update
CREATE POLICY teacher_classrooms_update_admin
    ON social_features.teacher_classrooms
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.user_roles ur
            WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
            AND ur.role IN ('super_admin', 'admin_teacher')
        )
    );
```

### Cambio en 01-enable-rls.sql

```sql
-- Agregar línea:
ALTER TABLE social_features.teacher_classrooms ENABLE ROW LEVEL SECURITY;
```

### Cambio en 03-grants.sql

```sql
-- Agregar línea:
GRANT SELECT, UPDATE ON social_features.teacher_classrooms TO gamilit_user;
```

---

## 🔧 CORRECCIÓN ISS-002: FK teacher_classrooms (P1)

### Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `social_features/tables/teacher_classrooms.sql` | Cambiar FK de auth.users a auth_management.profiles |

### SQL de Migración

```sql
-- Paso 1: Validar integridad
SELECT COUNT(*) FROM social_features.teacher_classrooms tc
LEFT JOIN auth_management.profiles p ON tc.teacher_id = p.id
WHERE p.id IS NULL;

-- Paso 2: Drop FK existente
ALTER TABLE social_features.teacher_classrooms
DROP CONSTRAINT IF EXISTS teacher_classrooms_teacher_id_fkey;

-- Paso 3: Crear nueva FK
ALTER TABLE social_features.teacher_classrooms
ADD CONSTRAINT teacher_classrooms_teacher_id_fkey
    FOREIGN KEY (teacher_id)
    REFERENCES auth_management.profiles(id)
    ON DELETE RESTRICT;
```

### Cambio en DDL

**Antes:**
```sql
teacher_id UUID NOT NULL REFERENCES auth.users(id),
```

**Después:**
```sql
teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE RESTRICT,
```

---

## 🔧 CORRECCIÓN ISS-003: FK assignments (P2)

### Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `educational_content/tables/05-assignments.sql` | Cambiar FK de auth.users a auth_management.profiles |

### SQL de Migración

```sql
-- Paso 1: Validar integridad
SELECT COUNT(*) FROM educational_content.assignments a
LEFT JOIN auth_management.profiles p ON a.teacher_id = p.id
WHERE p.id IS NULL;

-- Paso 2: Drop FK existente
ALTER TABLE educational_content.assignments
DROP CONSTRAINT IF EXISTS assignments_teacher_id_fkey;

-- Paso 3: Crear nueva FK (cambiar CASCADE a RESTRICT)
ALTER TABLE educational_content.assignments
ADD CONSTRAINT assignments_teacher_id_fkey
    FOREIGN KEY (teacher_id)
    REFERENCES auth_management.profiles(id)
    ON DELETE RESTRICT;
```

### Cambio en DDL

**Antes:**
```sql
teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
```

**Después:**
```sql
teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE RESTRICT,
```

---

## 🔧 CORRECCIÓN ISS-004/005/006: Endpoints Monitoring (P2)

### Decisión: NO CREAR - DOCUMENTAR ALTERNATIVAS

**Justificación:**
1. Ya existen endpoints equivalentes en `/teacher/dashboard/*`
2. Crear duplicados aumenta deuda técnica
3. Frontend ya usa las rutas existentes

### Archivo a Crear

| Archivo | Contenido |
|---------|-----------|
| `docs/API-MAPPING-TEACHER-MONITORING.md` | Documentación de mapeo |

### Mapeo de Alternativas

| Endpoint Solicitado | Usar En Su Lugar |
|---------------------|------------------|
| `GET /teacher/monitoring/activity` | `GET /teacher/dashboard/activities` |
| `GET /teacher/monitoring/realtime` | `GET /teacher/dashboard/stats` |
| `GET /teacher/progress/overview` | `GET /teacher/dashboard/module-progress` |

---

## 📊 PLAN DE EJECUCIÓN

### Agentes a Orquestar

| Agente | Tarea | Archivos |
|--------|-------|----------|
| **Database-Agent-1** | ISS-001: Crear RLS policies | 3 archivos SQL |
| **Database-Agent-2** | ISS-002: Migrar FK teacher_classrooms | 1 archivo SQL |
| **Database-Agent-3** | ISS-003: Migrar FK assignments | 1 archivo SQL |
| **Docs-Agent** | ISS-004/005/006: Crear documentación | 1 archivo MD |

### Secuencia de Ejecución

```
PARALELO:
├─ Database-Agent-1: RLS (P0)
├─ Database-Agent-2: FK teacher_classrooms (P1)
├─ Database-Agent-3: FK assignments (P2)
└─ Docs-Agent: Documentación endpoints (P2)
    │
    ▼
VALIDACIÓN por Architecture-Analyst
    │
    ▼
REPORTE FINAL
```

---

## ✅ CRITERIOS DE ÉXITO

### Para ISS-001 (RLS)
- [ ] Archivo 07-teacher-classrooms-policies.sql creado
- [ ] 01-enable-rls.sql actualizado
- [ ] 03-grants.sql actualizado
- [ ] Sin errores de sintaxis SQL

### Para ISS-002 (FK teacher_classrooms)
- [ ] FK cambiada a auth_management.profiles
- [ ] ON DELETE RESTRICT configurado
- [ ] DDL actualizado

### Para ISS-003 (FK assignments)
- [ ] FK cambiada a auth_management.profiles
- [ ] ON DELETE RESTRICT configurado
- [ ] DDL actualizado

### Para ISS-004/005/006 (Documentación)
- [ ] Documento API-MAPPING creado
- [ ] Mapeo de alternativas completo
- [ ] Ejemplos de uso incluidos

---

**Plan creado por:** Architecture-Analyst
**Fecha:** 2025-11-26
**Estado:** Listo para FASE 3 - Ejecución
