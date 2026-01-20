---
id: "US-PM-009"
title: "Gestion de Recursos Educativos"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Frontend-Agent"
epic: "EXT-001"
story_points: 5
budget: "$2,000 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "resources", "media", "upload", "teacher"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# US-PM-009: Gestion de Recursos Educativos

**Epica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Fase 3 - Extensiones
**Story Points:** 5 SP
**Presupuesto:** $2,000 MXN
**Prioridad:** Media
**Estado:** Done

---

## Descripcion

Como profesor, quiero gestionar mis recursos educativos (documentos, imagenes, videos, audio) para organizar y compartir materiales didacticos con mis estudiantes.

**Contexto del Alcance:**

Esta pagina permite a los profesores:
- Subir archivos multimedia con validacion de tipo y tamano
- Visualizar recursos organizados por tipo
- Buscar y filtrar recursos
- Eliminar recursos no necesarios
- Vista en grid o lista

---

## Criterios de Aceptacion

### CA-01: Panel de Estadisticas
- [x] Mostrar total de recursos subidos
- [x] Mostrar almacenamiento utilizado
- [x] Contador de documentos
- [x] Contador de archivos multimedia (video + imagen + audio)

### CA-02: Busqueda y Filtros
- [x] Barra de busqueda por nombre de archivo
- [x] Filtro por tipo (Todos, Documentos, Imagenes, Videos, Audio)
- [x] Toggle de vista (Grid / Lista)
- [x] Filtros aplicados en tiempo real

### CA-03: Subida de Archivos
- [x] Modal de subida con zona de arrastre (drag & drop)
- [x] Validacion de tipo de archivo permitido
- [x] Validacion de tamano maximo por tipo:
  - Imagenes: 5MB
  - Videos: 100MB
  - Audio: 10MB
  - Documentos: 10MB
- [x] Barra de progreso durante subida
- [x] Lista de archivos seleccionados con opcion de remover
- [x] Notificacion de exito/error

### CA-04: Visualizacion de Recursos
- [x] Grid view con cards por recurso
- [x] List view con filas detalladas
- [x] Para cada recurso mostrar:
  - Icono segun tipo
  - Nombre del archivo
  - Tipo y tamano
  - Fecha de subida
- [x] Acciones por recurso: Ver, Eliminar

### CA-05: Eliminacion de Recursos
- [x] Modal de confirmacion antes de eliminar
- [x] Mensaje claro indicando que es irreversible
- [x] Notificacion de exito tras eliminacion
- [x] Actualizacion de lista sin recargar pagina

### CA-06: Estados Especiales
- [x] Estado de carga inicial con spinner
- [x] Estado vacio cuando no hay recursos
- [x] Estado de resultados vacios tras filtrar
- [x] Feature flag para modo "Under Construction"

---

## Especificaciones Tecnicas

### Frontend

**Ruta:**
```
/teacher/resources
```

**Pagina:**
- `TeacherResourcesPage.tsx` - Componente completo con layout integrado

**API Service:**
```typescript
import {
  mediaApi,
  type MediaType,
  type MediaAttachmentResponse,
  validateFile,
  formatFileSize,
  detectMediaType,
  DEFAULT_MAX_SIZES,
} from '@/shared/api/mediaApi';
```

**Interfaces Principales:**
```typescript
interface ResourceFile {
  id: string;
  name: string;
  originalName: string;
  type: MediaType; // 'image' | 'video' | 'audio' | 'document' | 'interactive' | 'animation'
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | MediaType;
```

**Helpers:**
```typescript
const getFileIcon = (type: MediaType) => { /* FileImage, FileVideo, FileAudio, FileText */ };
const getTypeColor = (type: MediaType): string => { /* CSS classes */ };
const getTypeLabel = (type: MediaType): string => { /* Labels en espanol */ };
```

### Backend

**Endpoints Utilizados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/media` | Obtener lista de recursos |
| POST | `/media/upload` | Subir nuevo archivo |
| DELETE | `/media/:id` | Eliminar recurso |

**Request de Subida:**
```typescript
POST /media/upload
Content-Type: multipart/form-data

file: File
type: MediaType
metadata?: object

Response:
{
  id: string;
  filename: string;
  originalFilename: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Recursos Educativos                            [+ Subir Recurso] |
|  Gestiona y organiza tus materiales didacticos                    |
+-------------------------------------------------------------------+
|  [4 Total]    [2.5 MB Almacenamiento]   [2 Docs]   [2 Multimedia]|
+-------------------------------------------------------------------+
|  [Buscar recursos...]        [Tipo: Todos v]   [Grid] [Lista]    |
+-------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+ |
|  | [PDF Icon]       |  | [MP4 Icon]       |  | [PNG Icon]       | |
|  | Presentacion.pdf |  | Tutorial M1.mp4  |  | Infografia.png   | |
|  | Documento - 2.5MB|  | Video - 45MB     |  | Imagen - 1.2MB   | |
|  | 10 Ene 2026      |  | 12 Ene 2026      |  | 14 Ene 2026      | |
|  | [Ver] [Eliminar] |  | [Ver] [Eliminar] |  | [Ver] [Eliminar] | |
|  +------------------+  +------------------+  +------------------+ |
+-------------------------------------------------------------------+
```

### Modal de Subida
```
+-------------------------------------------------------------------+
|  Subir Recursos                                              [X]  |
+-------------------------------------------------------------------+
|  +---------------------------------------------------------------+|
|  |                                                               ||
|  |    [Upload Icon]                                              ||
|  |    Arrastra archivos aqui o haz clic para seleccionar        ||
|  |    Imagenes (max 5MB), Videos (max 100MB), Docs (max 10MB)   ||
|  |                                                               ||
|  +---------------------------------------------------------------+|
|                                                                    |
|  Archivos seleccionados (2):                                      |
|  [x] documento.pdf (2.3 MB)                                       |
|  [x] imagen.png (890 KB)                                          |
|                                                                    |
|  [============================        ] 75%                       |
|                                                                    |
|  [Cancelar]                                        [Subir (2)]    |
+-------------------------------------------------------------------+
```

---

## Dependencias

### Dependencias de User Stories:
- US-PM-000 (Dashboard Maestro) - Navegacion
- EP001 (Auth System) - JWT auth y role='teacher'

### Dependencias de Backend:
- Sistema de media/archivos implementado
- Almacenamiento de archivos (S3/local)
- API de media con upload/download

---

## Estimacion de Esfuerzo

**Backend:** 1 SP
- Endpoints de media ya existentes
- Validaciones de permisos

**Frontend:** 3 SP
- Componente de lista con dos vistas
- Modal de subida con drag & drop
- Filtros y busqueda

**Testing:** 1 SP

**Total:** 5 SP = $2,000 MXN

---

## Notas de Implementacion

- Pagina implementada: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/apps/teacher/pages/TeacherResourcesPage.tsx`
- Utiliza mock data mientras se integra completamente con backend
- Feature flag `FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION` para modo construccion
- Diseado con tema "Detective" consistente con la plataforma

---

**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
**Estado:** Done - Implementado
