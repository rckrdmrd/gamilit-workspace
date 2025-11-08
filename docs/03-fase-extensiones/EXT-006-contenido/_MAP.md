# _MAP: EXT-006 - Gestión de Contenido

**Épica:** EXT-006
**Nombre:** CMS para Contenido Educativo
**Fase:** 3 - Extensiones
**Presupuesto:** $10,000 MXN
**Story Points:** 40 SP
**Estado:** ✅ Completado 100%

---

## 📋 Propósito

Content Management System completo para contenido educativo con editor WYSIWYG, biblioteca de contenido, versionamiento, preview mode y workflow de aprobación.

**Impacto:** **ALTO** - Escalabilidad de contenido

---

## 📁 Contenido

| Archivo | Descripción |
|---------|-------------|
| [README.md](./README.md) | Overview de la épica |
| [historias-usuario/](./historias-usuario/) | User stories (~9) |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad |

---

## 🎯 Funcionalidades

### 1. Editor de Contenido
- WYSIWYG editor (TipTap)
- Markdown support
- Media embed
- Code blocks para ejercicios

### 2. Biblioteca
- Content browsing
- Search & filters
- Tags & categorization
- Favorites

### 3. Versionamiento
- Version history
- Diff viewer
- Rollback capability
- Branch/merge (simple)

### 4. Workflow
- Draft → Review → Published
- Approval process
- Comments & feedback
- Scheduled publishing

---

## 🏗️ Implementación

### Backend
- **Módulo:** `content-management`
- **Endpoints:** ~10 endpoints

### Frontend
- **Feature:** `content-editor`
- **Components:** WYSIWYGEditor, ContentLibrary, VersionHistory, ApprovalWorkflow

### Base de Datos
- **Tablas:** content_versions, content_approvals
- **Soft deletes:** Para recuperación de contenido

---

**Generado:** 2025-11-08
