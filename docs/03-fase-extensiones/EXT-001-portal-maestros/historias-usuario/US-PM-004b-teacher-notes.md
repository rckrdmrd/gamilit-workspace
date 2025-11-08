# US-PM-004b: Notas Privadas del Profesor

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 4
**Story Points:** 5 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Media (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-PM-004 (dividida en a/b)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero agregar y consultar notas privadas sobre mis estudiantes para mantener un registro organizado de observaciones pedagógicas, comportamiento y progreso que solo yo pueda ver.

**Contexto:** Esta user story es parte de la funcionalidad de Seguimiento de Progreso Estudiantil, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en el sistema de notas privadas del profesor sobre estudiantes.

## Criterios de Aceptación

### Funcionales

#### AC-01: Ver Notas Privadas
- [ ] **DADO** que he creado 15 notas sobre un estudiante
- [ ] **CUANDO** solicito GET /api/teacher/students/:id/notes
- [ ] **ENTONCES** recibo lista de mis notas sobre ese estudiante
- [ ] **Y** solo veo mis propias notas (teacher_id = mi user_id)
- [ ] **Y** las notas están ordenadas por created_at DESC

#### AC-02: Paginación de Notas
- [ ] **DADO** que tengo 50 notas sobre un estudiante
- [ ] **CUANDO** solicito GET /notes?page=2&limit=10
- [ ] **ENTONCES** recibo 10 notas (items 11-20)
- [ ] **Y** recibo metadata con total, page, totalPages

#### AC-03: Crear Nota Privada
- [ ] **DADO** que quiero registrar una observación
- [ ] **CUANDO** envío POST /notes con texto "Student showed improvement in fractions"
- [ ] **ENTONCES** la nota se crea con is_private=true
- [ ] **Y** solo yo puedo verla (no otros profesores ni el estudiante)
- [ ] **Y** recibo confirmación con datos de la nota creada

#### AC-04: Rich Text en Notas
- [ ] **DADO** que creo una nota con formato HTML
- [ ] **CUANDO** envío "<p><strong>Strength:</strong> Problem solving</p>"
- [ ] **ENTONCES** el HTML se sanitiza (XSS prevention)
- [ ] **Y** se almacena y renderiza correctamente
- [ ] **Y** el formato se preserva (bold, lists, etc.)

#### AC-05: Editar Nota Existente
- [ ] **DADO** que tengo una nota creada
- [ ] **CUANDO** envío PUT /notes/:noteId con nuevo contenido
- [ ] **ENTONCES** la nota se actualiza
- [ ] **Y** updated_at se actualiza a NOW()
- [ ] **Y** solo yo puedo editar mis propias notas

#### AC-06: Eliminar Nota
- [ ] **DADO** que tengo una nota creada
- [ ] **CUANDO** envío DELETE /notes/:noteId
- [ ] **ENTONCES** la nota se elimina permanentemente
- [ ] **Y** solo yo puedo eliminar mis propias notas
- [ ] **Y** recibo confirmación de eliminación

#### AC-07: Búsqueda en Notas
- [ ] **DADO** que tengo 100 notas sobre diferentes estudiantes
- [ ] **CUANDO** solicito GET /notes?search=fractions
- [ ] **ENTONCES** recibo notas que contienen "fractions" en el contenido
- [ ] **Y** la búsqueda es case-insensitive

#### AC-08: Privacy Control
- [ ] **DADO** que creo una nota sobre un estudiante
- [ ] **CUANDO** otro profesor intenta ver mis notas
- [ ] **ENTONCES** NO puede verlas (403 Forbidden)
- [ ] **Y** el estudiante NO puede ver sus propias notas
- [ ] **Y** solo yo tengo acceso completo

### No Funcionales

#### AC-09: Performance
- [ ] Response time p95 < 200ms para GET notes
- [ ] Response time p95 < 150ms para POST/PUT/DELETE
- [ ] Búsqueda eficiente con full-text search o LIKE optimizado

#### AC-10: Security
- [ ] HTML sanitization en notas
- [ ] Notas privadas solo visibles para el teacher owner
- [ ] Middleware verifyNoteOwnership para editar/eliminar
- [ ] Rate limiting: 100 req/15min

#### AC-11: Validación
- [ ] Joi/Zod schemas
- [ ] Max length nota: 2000 caracteres
- [ ] Student ID debe ser UUID válido
- [ ] is_private siempre = true (forzado en backend)

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/students/:id/notes**
- Descripción: Ver notas privadas del profesor sobre el estudiante
- Auth: JWT Required (role: teacher)

Query Params:
```typescript
{
  page?: number;      // default: 1
  limit?: number;     // 10, 25, 50
  search?: string;    // buscar en contenido
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    id: string,
    student_id: string,
    teacher_id: string,
    note: string,               // Rich text HTML
    is_private: boolean,        // Always true
    created_at: string,
    updated_at: string
  }[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

**2. POST /api/teacher/students/:id/notes**
- Descripción: Crear nota privada sobre el estudiante
- Auth: JWT Required (role: teacher)

Request Body:
```typescript
{
  note: string;              // Required, rich text HTML, max 2000 chars
  is_private?: boolean;      // default: true, always forced to true
}
```

Response (201 Created):
```typescript
{
  success: true,
  data: {
    id: string,
    student_id: string,
    teacher_id: string,
    note: string,
    is_private: boolean,
    created_at: string
  }
}
```

**3. PUT /api/teacher/notes/:noteId**
- Descripción: Actualizar nota privada
- Auth: JWT Required (role: teacher)
- Middleware: verifyNoteOwnership

Request Body:
```typescript
{
  note: string;              // Required, rich text HTML, max 2000 chars
}
```

**4. DELETE /api/teacher/notes/:noteId**
- Descripción: Eliminar nota privada
- Auth: JWT Required (role: teacher)
- Middleware: verifyNoteOwnership

#### Tareas Backend (3 SP)

1. Database (0.5 SP)
   - Tabla: `teacher_student_notes`
   - Columns: id, student_id, teacher_id, note (text), is_private (boolean), created_at, updated_at
   - Indexes: `idx_notes_student_teacher`, `idx_notes_teacher_id`, `idx_notes_created_at`
   - Foreign keys: student_id → users(id), teacher_id → users(id)
   - Migration scripts

2. Notes Endpoints (2 SP)
   - GET /api/teacher/students/:id/notes
   - POST /api/teacher/students/:id/notes
   - PUT /api/teacher/notes/:noteId
   - DELETE /api/teacher/notes/:noteId
   - HTML sanitization
   - Middleware verifyNoteOwnership
   - Tests unitarios

3. Tests (0.5 SP)
   - Tests unitarios: NotesService (6 tests)
   - Tests de integración: 4 endpoints
   - Tests de privacy control

### Frontend

#### Componentes

- StudentNotes (lista + create form)
- NoteCard (card individual)
- CreateNoteForm (con Rich Text Editor)
- EditNoteModal
- DeleteConfirmationModal
- SearchNotesInput

#### Tareas Frontend (2 SP)

1. Notes UI (2 SP)
   - Componente StudentNotes (lista + form)
   - NoteCard con edit/delete buttons
   - CreateNoteForm con Rich Text Editor (TipTap)
   - EditNoteModal
   - DeleteConfirmationModal
   - SearchNotesInput
   - Paginación de notas
   - Loading states

### Database

- Tabla: `teacher_student_notes`
- Schema:
```sql
CREATE TABLE teacher_student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notes_student_teacher ON teacher_student_notes(student_id, teacher_id);
CREATE INDEX idx_notes_teacher_id ON teacher_student_notes(teacher_id);
CREATE INDEX idx_notes_created_at ON teacher_student_notes(created_at DESC);
```

## Dependencias

- **Requiere:**
  - US-PM-001a (Classroom Management) - para verificar relación teacher-student
  - US-PM-004a (Progress Analytics) - complementa con analytics

- **Relacionada:**
  - US-PM-004a (Progress Analytics)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Privacy leak (notas visibles a otros) | Baja | Crítico | Tests de access control exhaustivos, code review estricto |
| XSS en notas | Alta | Crítico | HTML sanitization estricta, CSP headers |
| Performance con búsqueda | Media | Bajo | Limitar búsqueda a notas del profesor, usar LIKE con índice |

## Testing

### Unit Tests
- NotesService: 6 tests
  - CRUD operations (4 tests)
  - Privacy control (1 test)
  - Search (1 test)

### Integration Tests
- 4 endpoints API
- Tests de ownership

### E2E Tests
- Flujo: Login → View student → Add note → Edit note → Delete note

## Wireframe

```
┌────────────────────────────────────────────────────────────┐
│ Private Notes                              [+ Add Note]    │
├────────────────────────────────────────────────────────────┤
│ [Search notes...]                                          │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Oct 28, 2025                          [Edit] [Delete] │ │
│ │ Student needs extra help with fractions.               │ │
│ │ Recommended tutoring sessions.                         │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Oct 15, 2025                          [Edit] [Delete] │ │
│ │ Excellent participation in class discussions.          │ │
│ │ Shows leadership potential.                            │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│                    [1] 2 3 ... 5 Next                      │
└────────────────────────────────────────────────────────────┘
```

## HTML Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeNote = (note: string): string => {
  return DOMPurify.sanitize(note, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
  });
};
```

## Métricas de Éxito

- 4 endpoints funcionando
- Test coverage >80%
- Response time p95 <200ms
- Zero privacy leaks
- >50% de profesores usan notas regularmente
- Zero XSS vulnerabilities

## Notas

- ✅ Archivo modularizado desde US-PM-004-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Sistema de notas privadas del profesor
- 🔗 Complementa con US-PM-004a para analytics de progreso
- ⚠️ IMPORTANTE: Privacy control crítico - solo teacher owner puede ver

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
