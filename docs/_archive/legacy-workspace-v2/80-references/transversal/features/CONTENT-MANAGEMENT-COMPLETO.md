# Schema `content_management` - Gestión de Contenido

**Schema:** `content_management`
**Propósito:** CMS para gestión de contenido educativo, templates, versionado y moderación
**Tablas:** 5
**Estado:** ✅ Documentado
**Última actualización:** 2025-11-08

---

## 📋 Resumen

El schema `content_management` proporciona un sistema CMS completo con:

| Tabla | Propósito | Características |
|-------|-----------|-----------------|
| `content_templates` | Templates reutilizables de contenido | Plantillas para ejercicios |
| `marie_curie_content` | Contenido generado por IA (Marie Curie) | IA generativa |
| `media_files` | Archivos multimedia | Imágenes, videos, PDFs |
| `content_versions` | Versionado de contenido | Control de versiones |
| `flagged_content` | Contenido reportado/moderación | Sistema de reportes |

---

## 🗂️ Tablas

### 1. `content_templates`
**Propósito:** Plantillas reutilizables para creación de contenido educativo

**Uso:**
- Maestros crean ejercicios basados en templates
- Consistencia en estructura de contenido
- Acelera creación de contenido

---

### 2. `marie_curie_content`
**Propósito:** Contenido generado por IA (asistente Marie Curie)

**Características:**
- Generación automática de ejercicios
- Adaptación a nivel de estudiante
- Tracking de calidad del contenido IA

**Nota:** "Marie Curie" es el nombre del asistente IA del sistema

---

### 3. `media_files`
**Propósito:** Gestión de archivos multimedia

**Tipos soportados:**
- Imágenes (ejercicios, avatares)
- Videos educativos
- PDFs y documentos
- Audio

**Integración:** Sistema de Storage (ver schema `storage`)

---

### 4. `content_versions`
**Propósito:** Sistema de versionado de contenido

**Características:**
- Historial completo de cambios
- Rollback a versiones anteriores
- Auditoría de ediciones
- Diff entre versiones

**Uso:** Control de calidad, compliance educativo

---

### 5. `flagged_content`
**Propósito:** Sistema de moderación y reportes

**Flujo:**
1. Usuario reporta contenido inapropiado
2. Sistema crea flag en esta tabla
3. Moderador revisa y toma acción
4. Flag se marca como resuelto

**Tipos de flags:**
- Contenido inapropiado
- Error en ejercicio
- Contenido desactualizado
- Plagio

---

## 🔄 Workflows

### Workflow de Creación de Contenido
```
Template Selection → Content Creation → Version Save → Publish
```

### Workflow de Moderación
```
User Report → Flag Created → Moderator Review → Action Taken → Flag Resolved
```

---

## 🔗 Referencias

**Épica:** EXT-002 - Admin Extendido
**US:** US-AE-003 - Content Management (ya existe)
**TRACEABILITY:** Requiere actualización

---

**Issue:** ISSUE-005 ✅ RESUELTO
**Creado:** 2025-11-08
**Tipo:** Documentación transversal consolidada
