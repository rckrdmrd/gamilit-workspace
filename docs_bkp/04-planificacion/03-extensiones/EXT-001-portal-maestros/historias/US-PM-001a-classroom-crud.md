# US-PM-001a: CRUD de Aulas Virtuales

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 1
**Story Points:** 8 SP
**Presupuesto:** $3,500 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-PM-001 (dividida en a/b)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero crear, editar, listar y eliminar mis classrooms (aulas virtuales) para organizar mis clases por grado y materia de forma eficiente.

**Contexto:** Esta user story es parte de la funcionalidad de Gestión de Classrooms, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca específicamente en las operaciones CRUD básicas de aulas virtuales.

## Criterios de Aceptación

### Funcionales

#### AC-01: Creación de Classroom
- [ ] **DADO** que soy un profesor autenticado
- [ ] **CUANDO** envío POST /api/teacher/classrooms con nombre válido
- [ ] **ENTONCES** se crea el classroom con teacher_id = mi user_id
- [ ] **Y** recibo respuesta 201 Created con los datos del classroom
- [ ] **Y** el classroom aparece en mi lista de classrooms

#### AC-02: Validación de Datos
- [ ] **DADO** que intento crear un classroom
- [ ] **CUANDO** envío nombre vacío o >255 caracteres
- [ ] **ENTONCES** recibo error 400 Bad Request
- [ ] **Y** el mensaje indica "Classroom name is required" o "Name too long"

#### AC-03: Paginación de Lista
- [ ] **DADO** que tengo 50 classrooms creados
- [ ] **CUANDO** solicito GET /api/teacher/classrooms?page=2&limit=25
- [ ] **ENTONCES** recibo 25 classrooms (items 26-50)
- [ ] **Y** recibo metadata con total, page, totalPages

#### AC-04: Filtrado por Materia
- [ ] **DADO** que tengo classrooms de Math, Science, History
- [ ] **CUANDO** solicito GET /api/teacher/classrooms?subject=Math
- [ ] **ENTONCES** recibo solo classrooms con subject="Math"

#### AC-05: Detalles con Estadísticas
- [ ] **DADO** que solicito GET /api/teacher/classrooms/:id
- [ ] **ENTONCES** recibo datos del classroom
- [ ] **Y** recibo estadísticas: total_students, active_assignments, avg_grade

#### AC-06: Actualización de Classroom
- [ ] **DADO** que soy el owner del classroom
- [ ] **CUANDO** envío PUT /api/teacher/classrooms/:id con nuevos datos
- [ ] **ENTONCES** el classroom se actualiza
- [ ] **Y** updated_at se actualiza a NOW()

#### AC-07: Soft Delete
- [ ] **DADO** que soy el owner del classroom
- [ ] **CUANDO** envío DELETE /api/teacher/classrooms/:id
- [ ] **ENTONCES** is_active = false
- [ ] **Y** el classroom no aparece en listados por defecto
- [ ] **Y** los estudiantes NO se eliminan (preservar datos)

### No Funcionales

#### AC-08: Performance
- [ ] Response time p95 < 200ms para todos los endpoints CRUD
- [ ] Paginación eficiente con LIMIT/OFFSET en SQL
- [ ] Indexes en: teacher_id, is_active, subject, grade_level

#### AC-09: Security
- [ ] Solo el teacher owner puede modificar su classroom
- [ ] Middleware verifyClassroomOwnership implementado
- [ ] Rate limiting: 100 req/15min por IP
- [ ] Input sanitization para prevenir XSS

#### AC-10: Validación
- [ ] Joi/Zod schemas implementados para todos los requests
- [ ] UUIDs validados con regex o validator library
- [ ] Nombres sanitizados (trim, max length)

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. POST /api/teacher/classrooms**
- Descripción: Crear nuevo classroom
- Auth: JWT Required (role: teacher)
- Rate Limit: 100 req/15min

Request Body:
```typescript
{
  name: string;              // Required, 1-255 chars
  description?: string;      // Optional, max 1000 chars
  school_id?: string;        // Optional, UUID
  grade_level?: string;      // Optional, max 50 chars
  subject?: string;          // Optional, max 100 chars
}
```

Response (201 Created):
```typescript
{
  success: true,
  data: {
    id: string,
    teacher_id: string,
    name: string,
    description: string | null,
    school_id: string | null,
    grade_level: string | null,
    subject: string | null,
    is_active: boolean,
    created_at: string,
    updated_at: string
  }
}
```

**2. GET /api/teacher/classrooms**
- Descripción: Listar classrooms del profesor
- Query Params:
  - `page`: number (default: 1)
  - `limit`: number (10, 25, 50, 100)
  - `is_active`: boolean
  - `subject`: string
  - `grade_level`: string

**3. GET /api/teacher/classrooms/:id**
- Descripción: Detalles del classroom con estadísticas

**4. PUT /api/teacher/classrooms/:id**
- Descripción: Actualizar información del classroom

**5. DELETE /api/teacher/classrooms/:id**
- Descripción: Soft delete (is_active = false)

#### Tareas Backend (5 SP)

1. Setup & Infrastructure (1 SP)
   - Crear estructura de carpetas (controllers, services, repositories, middleware)
   - Configurar rate limiting
   - Configurar Joi/Zod schemas

2. Database (1 SP)
   - Verificar schema classrooms
   - Crear indexes: `idx_classrooms_teacher_id`, `idx_classrooms_is_active`, `idx_classrooms_subject`
   - Crear migration scripts
   - Seed data para testing

3. Middleware (1 SP)
   - Implementar `verifyClassroomOwnership` middleware
   - Tests unitarios del middleware

4. Classroom CRUD (2 SP)
   - POST /api/teacher/classrooms (controller + service + repo)
   - GET /api/teacher/classrooms (con paginación y filtros)
   - GET /api/teacher/classrooms/:id (con stats)
   - PUT /api/teacher/classrooms/:id
   - DELETE /api/teacher/classrooms/:id (soft delete)
   - Tests unitarios CRUD

### Frontend

#### Componentes

- ClassroomList con paginación
- ClassroomCard (card view)
- CreateClassroomForm con validación
- EditClassroomForm
- Modal de confirmación para delete
- ClassroomDetails

#### Tareas Frontend (3 SP)

1. Setup & Store (0.5 SP)
   - Zustand store: classroomStore
   - API client functions (axios/fetch)
   - Types/interfaces TypeScript

2. Classroom List (1.5 SP)
   - Componente ClassroomList
   - Componente ClassroomCard
   - Paginación component
   - Filtros (subject, grade_level, is_active)
   - Loading skeletons

3. Create/Edit Forms (1 SP)
   - Formulario CreateClassroomForm
   - Formulario EditClassroomForm
   - Validación Zod schemas
   - React Hook Form integration

### Database

- Tabla: `classrooms`
- Indexes: teacher_id, is_active, subject, grade_level
- Foreign keys configuradas
- Triggers para updated_at automático
- RLS policies (si aplica PostgreSQL RLS)

## Dependencias

- **Requiere:**
  - EP001 (Auth System) - JWT auth y role='teacher'
  - Database Schema - Tabla classrooms debe existir

- **Relacionada:** US-PM-001b (Student Enrollment) - parte hermana

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tabla DB no existe | Baja | Alto | Verificar schema en Sprint Planning, crear migrations si es necesario |
| Performance con 1000+ classrooms | Media | Medio | Implementar paginación desde día 1, crear indexes |
| UX confusa para forms | Media | Bajo | Prototipo de UI en Figma antes de implementar |

## Testing

### Unit Tests
- Controllers: 6 tests
- Services: 5 tests
- Middleware: 3 tests

### Integration Tests
- 5 endpoints API

### E2E Tests
- Flujo: Login → Create classroom → Edit → Delete

## Métricas de Éxito

- 5 endpoints funcionando con 100% uptime
- Test coverage >80% (backend), >70% (frontend)
- Response time p95 <200ms
- 100% de profesores pueden crear classrooms exitosamente
- Tiempo promedio de creación <2 minutos

## Tareas de Implementación

### Backend (16h = 50%)

#### 1. Setup & Configuración (4h)
- [x] Crear estructura de carpetas: src/modules/teacher/classrooms
- [x] Configurar rate limiting (express-rate-limit): 100 req/15min
- [x] Configurar Joi validation schemas para classroom CRUD
- [ ] Configurar Winston logger para classroom operations

#### 2. Database & Migrations (3h)
- [x] Verificar schema de tabla classrooms en PostgreSQL
- [x] Crear índice compuesto idx_classrooms_teacher_id_active
- [ ] Crear índice idx_classrooms_subject para filtros
- [ ] Migration script para índices adicionales
- [ ] Seed data: 10 classrooms dummy para testing

#### 3. Middleware (2h)
- [x] Implementar verifyClassroomOwnership middleware
- [ ] Tests unitarios middleware (3 tests)
- [ ] Middleware de validación Joi para requests

#### 4. Classroom CRUD Endpoints (7h)
- [x] POST /api/teacher/classrooms: crear classroom
- [x] GET /api/teacher/classrooms: listar con paginación y filtros
- [ ] GET /api/teacher/classrooms/:id: detalles con stats
- [ ] PUT /api/teacher/classrooms/:id: actualizar classroom
- [ ] DELETE /api/teacher/classrooms/:id: soft delete
- [ ] Tests unitarios CRUD (6 tests)

### Frontend (9.6h = 30%)

#### 5. Setup & Store (1.6h)
- [x] Zustand store: classroomStore con actions CRUD
- [x] API client: classroomAPI.ts con 5 métodos
- [ ] TypeScript interfaces: Classroom, ClassroomFilters, ClassroomStats
- [ ] Error handling con toast notifications

#### 6. Classroom List (4.8h)
- [ ] Componente ClassroomList: tabla con paginación
- [ ] Componente ClassroomCard: card view con stats
- [ ] Filtros: subject, grade_level, is_active
- [ ] Paginación: Pagination component reutilizable
- [ ] Loading skeletons (Skeleton UI)
- [ ] Empty state cuando no hay classrooms

#### 7. Create/Edit Forms (3.2h)
- [ ] Formulario CreateClassroomForm con React Hook Form
- [ ] Formulario EditClassroomForm (misma base)
- [ ] Validación Zod: nombre (1-255), description (max 1000)
- [ ] Modal de confirmación para delete
- [ ] Success/error notifications con toast

### Testing & QA (4.8h = 15%)

#### 8. Unit Tests (2.4h)
- [ ] Backend: ClassroomService tests (5 tests)
- [ ] Backend: ClassroomController tests (6 tests)
- [ ] Frontend: classroomStore tests (4 tests)

#### 9. Integration Tests (1.6h)
- [ ] Test suite: 5 endpoints API
- [ ] Test: Paginación con 50 classrooms
- [ ] Test: Filtros combinados

#### 10. E2E Tests (0.8h)
- [ ] Flujo: Login → Create classroom → Edit → Delete
- [ ] Verificar soft delete no elimina estudiantes

### Deploy & Documentación (1.6h = 5%)

#### 11. Deploy (1h)
- [ ] Build backend con npm run build
- [ ] Build frontend con npm run build
- [ ] Verificar environment variables: DATABASE_URL, JWT_SECRET
- [ ] Deploy a staging environment
- [ ] Smoke tests en staging

#### 12. Documentación (0.6h)
- [ ] Actualizar API docs en Postman/Swagger
- [ ] README: instrucciones de setup para classrooms
- [ ] CHANGELOG entry para US-PM-001a

**Progreso Global:** 50% completado (16h de 32h)

## Notas

- ✅ Archivo modularizado desde US-PM-001-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Operaciones CRUD de classrooms
- 🔗 Complementa con US-PM-001b para gestión de estudiantes

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
