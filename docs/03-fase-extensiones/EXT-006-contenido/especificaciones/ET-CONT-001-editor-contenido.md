---
id: "ET-CONT-001"
title: "Editor de Contenido - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Parcialmente Implementado"
priority: "P1"
epic: "EXT-006"
module: "content"
labels: ["content", "editor", "admin", "wysiwyg", "exercises"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-CONT-001"]
related_us: ["US-CONT-001"]
---

# ET-CONT-001: Editor de Contenido - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-CONT-001 |
| **Epic** | EXT-006 - Gestion de Contenido |
| **RF Relacionado** | RF-CONT-001 (Content Editor) |
| **US Relacionadas** | US-CONT-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Parcialmente Implementado |

---

## Descripcion Tecnica

El sistema de gestion de contenido permite a administradores y profesores crear, editar y organizar contenido educativo. Incluye:

1. **Admin Content Page**: Interfaz principal de gestion de contenido
2. **Exercise Content Editor**: Editor de ejercicios con preview
3. **Content Services**: Backend para CRUD de contenido
4. **Versionamiento**: Historial de cambios

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `AdminContentPage` | `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx` | Pagina de gestion de contenido |

### Componentes de Edicion

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ExerciseContentEditor` | `apps/frontend/src/apps/admin/components/content/ExerciseContentEditor.tsx` | Editor de ejercicios |
| `ExercisePreviewModal` | `apps/frontend/src/apps/admin/components/content/ExercisePreviewModal.tsx` | Preview de ejercicio |

### Componentes de Maestro

| Componente | Path | Descripcion |
|------------|------|-------------|
| `AssignmentCreator` | `apps/frontend/src/apps/teacher/components/assignments/AssignmentCreator.tsx` | Creador de asignaciones |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `AdminContentService` | `apps/backend/src/modules/admin/services/admin-content.service.ts` | Gestion de contenido admin |
| `TeacherContentService` | `apps/backend/src/modules/teacher/services/teacher-content.service.ts` | Gestion de contenido maestro |
| `MarieCurieContentService` | `apps/backend/src/modules/content/services/marie-curie-content.service.ts` | Contenido especifico Marie Curie |
| `FlaggedContentService` | `apps/backend/src/modules/content/services/flagged-content.service.ts` | Contenido reportado |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `AdminContentController` | `apps/backend/src/modules/admin/controllers/admin-content.controller.ts` | Endpoints de contenido admin |
| `TeacherContentController` | `apps/backend/src/modules/teacher/controllers/teacher-content.controller.ts` | Endpoints de contenido maestro |
| `MarieCurieContentController` | `apps/backend/src/modules/content/controllers/marie-curie-content.controller.ts` | Endpoints Marie Curie |
| `FlaggedContentController` | `apps/backend/src/modules/content/controllers/flagged-content.controller.ts` | Endpoints contenido reportado |

### Metodos del AdminContentService

```typescript
class AdminContentService {
  // Listar todo el contenido
  async findAll(filters?: ContentFilters): Promise<Content[]>;

  // Obtener contenido por ID
  async findById(id: string): Promise<Content>;

  // Crear contenido
  async create(createDto: CreateContentDto): Promise<Content>;

  // Actualizar contenido
  async update(id: string, updateDto: UpdateContentDto): Promise<Content>;

  // Eliminar contenido
  async delete(id: string): Promise<void>;

  // Publicar/despublicar contenido
  async togglePublish(id: string, isPublished: boolean): Promise<Content>;

  // Obtener estadisticas de contenido
  async getContentStats(): Promise<ContentStatsDto>;
}
```

---

## Tablas/Schemas de Base de Datos

### Schema: `educational_content`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `content` | Contenido educativo | id, title, type, body, is_published |
| `content_versions` | Historial de versiones | id, content_id, version, body, created_at |
| `content_categories` | Categorias de contenido | id, name, parent_id |
| `content_tags` | Tags de contenido | content_id, tag |

### Campos de la Tabla `content`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Titulo del contenido |
| `type` | ENUM | Tipo: article, exercise, video, lesson |
| `body` | TEXT | Contenido (HTML/Markdown/JSON) |
| `module_id` | INTEGER | FK a modulo educativo |
| `difficulty` | ENUM | Dificultad: easy, medium, hard |
| `is_published` | BOOLEAN | Estado de publicacion |
| `is_active` | BOOLEAN | Activo/Inactivo |
| `author_id` | UUID | FK a users |
| `created_at` | TIMESTAMP | Fecha de creacion |
| `updated_at` | TIMESTAMP | Fecha de actualizacion |
| `published_at` | TIMESTAMP | Fecha de publicacion |

### Schema: `gamification_system`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `exercises` | Ejercicios educativos | id, module_id, type, instructions, config |
| `exercise_types` | Tipos de ejercicio | id, name, component |

---

## APIs Endpoints

### Gestion de Contenido (Admin)

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/admin/content` | GET | Listar contenido |
| `/api/v1/admin/content/:id` | GET | Obtener contenido |
| `/api/v1/admin/content` | POST | Crear contenido |
| `/api/v1/admin/content/:id` | PUT | Actualizar contenido |
| `/api/v1/admin/content/:id` | DELETE | Eliminar contenido |
| `/api/v1/admin/content/:id/publish` | PATCH | Publicar/despublicar |
| `/api/v1/admin/content/stats` | GET | Estadisticas |

### Gestion de Contenido (Teacher)

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/content` | GET | Listar contenido del maestro |
| `/api/v1/teacher/content` | POST | Crear contenido |
| `/api/v1/teacher/content/:id` | PUT | Actualizar contenido |
| `/api/v1/teacher/content/:id` | DELETE | Eliminar contenido |

### Request: POST /api/v1/admin/content

```json
{
  "title": "Ejercicio de Comprension Literal",
  "type": "exercise",
  "body": "<p>Lee el siguiente texto...</p>",
  "module_id": 1,
  "difficulty": "medium",
  "is_published": false,
  "tags": ["lectura", "comprension", "literal"]
}
```

### Response: GET /api/v1/admin/content

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Ejercicio de Comprension Literal",
      "type": "exercise",
      "module_id": 1,
      "difficulty": "medium",
      "is_published": true,
      "author": {
        "id": "uuid",
        "name": "Admin User"
      },
      "created_at": "2026-01-27T10:00:00Z",
      "updated_at": "2026-01-27T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### Response: GET /api/v1/admin/content/stats

```json
{
  "total_content": 150,
  "published": 120,
  "draft": 30,
  "by_type": {
    "article": 50,
    "exercise": 80,
    "video": 10,
    "lesson": 10
  },
  "by_module": [
    { "module_id": 1, "count": 35 },
    { "module_id": 2, "count": 30 },
    { "module_id": 3, "count": 28 },
    { "module_id": 4, "count": 32 },
    { "module_id": 5, "count": 25 }
  ],
  "recent_activity": [
    {
      "content_id": "uuid",
      "title": "Nuevo ejercicio",
      "action": "created",
      "date": "2026-01-27T10:00:00Z"
    }
  ]
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Lista de Contenido

```
1. Admin navega a /admin/content
2. AdminContentPage carga con useContentList()
3. Lista paginada de contenido
4. Filtros: tipo, modulo, estado, busqueda
5. Ordenamiento por columnas
```

### Flujo 2: Crear Contenido

```
1. Click en "Nuevo Contenido"
2. Modal/pagina de creacion se abre
3. Completar formulario:
   - Titulo
   - Tipo (article, exercise, video, lesson)
   - Modulo
   - Dificultad
   - Contenido (editor)
4. Preview del contenido
5. "Guardar como borrador" o "Publicar"
6. POST /api/v1/admin/content
7. Redirigir a lista con mensaje de exito
```

### Flujo 3: Editar Ejercicio

```
1. Click en ejercicio de la lista
2. ExerciseContentEditor carga con datos existentes
3. Editar campos:
   - Instrucciones
   - Configuracion del ejercicio
   - Respuestas correctas
   - Puntuacion
4. ExercisePreviewModal para previsualizar
5. Guardar cambios
6. PUT /api/v1/admin/content/:id
```

### Flujo 4: Publicar/Despublicar

```
1. Toggle de "Publicado" en la lista
2. PATCH /api/v1/admin/content/:id/publish
3. Actualiza estado inmediatamente
4. Contenido disponible/no disponible para estudiantes
```

---

## Tipos de Contenido

### Exercise (Ejercicio)

```typescript
interface ExerciseContent {
  id: string;
  type: 'exercise';
  title: string;
  instructions: string;
  exercise_type: ExerciseType;
  config: ExerciseConfig;
  module_id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  max_score: number;
  time_limit?: number; // en segundos
  hints?: string[];
}

type ExerciseType =
  | 'crucigrama'
  | 'sopa_letras'
  | 'quiz'
  | 'drag_drop'
  | 'completar'
  | 'ordenar';
```

### Article (Articulo)

```typescript
interface ArticleContent {
  id: string;
  type: 'article';
  title: string;
  body: string; // HTML o Markdown
  summary?: string;
  reading_time?: number; // minutos
  media?: MediaReference[];
}
```

### Lesson (Leccion)

```typescript
interface LessonContent {
  id: string;
  type: 'lesson';
  title: string;
  objectives: string[];
  sections: LessonSection[];
  exercises: string[]; // IDs de ejercicios relacionados
}
```

---

## Dependencias

### Dependencias de Modulos

- `AdminModule` - Permisos de administrador
- `TeacherModule` - Permisos de maestro
- `EducationalModule` - Contenido educativo
- `MediaModule` - Recursos multimedia

### Dependencias Externas

- Editor WYSIWYG (futuro: TipTap o Quill)

---

## Criterios de Aceptacion

### CA-01: Lista de Contenido
- [x] Lista paginada de contenido
- [x] Filtros por tipo, modulo, estado
- [x] Busqueda por titulo
- [x] Ordenamiento por columnas
- [x] Indicadores de estado (publicado/borrador)

### CA-02: Crear Contenido
- [x] Formulario de creacion
- [x] Seleccion de tipo de contenido
- [x] Asignacion a modulo
- [x] Seleccion de dificultad
- [x] Guardar como borrador

### CA-03: Editar Contenido
- [x] Carga de datos existentes
- [x] Edicion de todos los campos
- [x] Historial de versiones (parcial)
- [x] Preview antes de guardar

### CA-04: Editor de Ejercicios
- [x] ExerciseContentEditor funcional
- [x] Configuracion especifica por tipo
- [x] Preview de ejercicio
- [ ] Editor WYSIWYG completo (pendiente)

### CA-05: Publicacion
- [x] Toggle de publicacion
- [x] Validacion antes de publicar
- [x] Fecha de publicacion registrada

### CA-06: Permisos
- [x] Solo admin puede ver todos los contenidos
- [x] Maestros ven solo su contenido
- [x] Control de acceso por endpoint

---

## Notas de Implementacion

### Contenido como JSON

```typescript
// Para ejercicios con configuracion compleja
interface ExerciseConfig {
  type: string;
  questions?: Question[];
  options?: Record<string, unknown>;
  scoring?: {
    correct: number;
    partial?: number;
    incorrect: number;
  };
}
```

### Versionamiento

```typescript
// Cada actualizacion crea una nueva version
async update(id: string, updateDto: UpdateContentDto): Promise<Content> {
  const existing = await this.findById(id);

  // Guardar version anterior
  await this.versionsRepository.save({
    content_id: id,
    version: existing.version,
    body: existing.body,
    created_at: new Date(),
  });

  // Actualizar contenido
  return this.contentRepository.save({
    ...existing,
    ...updateDto,
    version: existing.version + 1,
    updated_at: new Date(),
  });
}
```

---

## Estado de Implementacion

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Lista de contenido | Implementado | Con paginacion y filtros |
| CRUD basico | Implementado | Create, Read, Update, Delete |
| Editor de ejercicios | Implementado | Editor basico |
| Editor WYSIWYG | Pendiente | Para articulos y lecciones |
| Versionamiento | Parcial | Schema existe, UI pendiente |
| Preview | Implementado | ExercisePreviewModal |
| Publicacion | Implementado | Toggle con validacion |

---

## Referencias

- US-CONT-001: Editor WYSIWYG de Contenido
- AdminContentController: `apps/backend/src/modules/admin/controllers/admin-content.controller.ts`
- ContentModule: `apps/backend/src/modules/content/content.module.ts`

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
