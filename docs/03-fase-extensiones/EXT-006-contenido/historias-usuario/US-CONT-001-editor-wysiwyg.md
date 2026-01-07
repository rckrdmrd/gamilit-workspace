---
id: "US-CONT-001"
title: "Editor WYSIWYG de Contenido"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-006"
story_points: 10
budget: "$5,700 MXN"
sprint: "Sprint-3"
labels: ["ext-006", "editor", "wysiwyg", "contenido", "tiptap", "rich-text", "multimedia", "matematicas", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-CONT-001: Editor WYSIWYG de Contenido

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-CONT-001 |
| **Épica** | EXT-006 - Gestión de Contenido |
| **Título** | Editor WYSIWYG Completo para Creación de Contenido |
| **Prioridad** | Alta (P1) |
| **Story Points** | 10 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $5,700 MXN |

---

## Historia de Usuario

**Como** profesor o creador de contenido
**Quiero** un editor WYSIWYG completo con rich text, multimedia, ecuaciones matemáticas y código
**Para** crear contenido educativo atractivo sin necesitar conocimientos técnicos

---

## Valor de Negocio

### Impacto
- **Autonomía**: Profesores crean contenido sin soporte técnico
- **Calidad**: Contenido rico aumenta engagement 50%
- **Velocidad**: Creación de módulos 3x más rápida
- **Escalabilidad**: Contenido generado por usuarios

### Métricas de Éxito
- >80% profesores usan editor semanalmente
- Tiempo de creación de módulo reduce 60%
- >90% satisfacción con facilidad de uso
- >1000 módulos creados en primer mes

---

## Criterios de Aceptación

### CA-01: Rich Text Editing
- Bold, italic, underline, strikethrough
- Headings (H1-H6) con TOC automático
- Listas (numeradas, bullets, anidadas)
- Quotes y blockquotes
- Alineación de texto (left, center, right, justify)
- Color de texto y fondo (color picker)
- Fuentes personalizadas (3-5 opciones)
- Undo/Redo ilimitado (historial)
- Shortcuts de teclado (Ctrl+B, Ctrl+I, etc.)

### CA-02: Insertar Multimedia
- **Imágenes**:
  - Upload desde computadora
  - URL externa
  - Galería de recursos (ver US-CONT-003)
  - Resize, crop, rotate en editor
  - Alt text para accesibilidad
  - Alineación (inline, float left/right, full width)
  - Lightbox preview al click
- **Videos**:
  - Upload de archivos (MP4, WebM)
  - Embed de YouTube/Vimeo (URL)
  - Player personalizado
  - Configurar autoplay, loop, controls
- **Audios**:
  - Upload de MP3/WAV
  - Player inline
  - Transcripción automática (opcional)

### CA-03: Ecuaciones Matemáticas
- Insertar ecuaciones con LaTeX syntax
- Renderizado con KaTeX o MathJax
- Editor inline con preview en tiempo real
- Biblioteca de símbolos matemáticos (paleta)
- Templates comunes (fracciones, integrales, matrices)
- Shortcuts: `$$` para block, `$` para inline
- Ejemplos: $\frac{a}{b}$, $\int_{0}^{\infty}$, $\sum_{i=1}^{n}$

### CA-04: Código con Syntax Highlighting
- Insertar bloques de código
- 20+ lenguajes soportados (Python, JS, Java, C++, etc.)
- Syntax highlighting con Prism.js o Highlight.js
- Temas (light, dark, monokai, etc.)
- Line numbers opcionales
- Copy button en bloques
- Inline code con backticks

### CA-05: Tablas
- Insertar tablas (NxM configurable)
- Agregar/eliminar filas y columnas
- Merge cells
- Header rows con estilo diferente
- Bordes y padding configurables
- Responsive (scroll horizontal en mobile)
- Importar desde CSV

### CA-06: Diagramas y Flowcharts
- Integración con Mermaid.js o similar
- Crear flowcharts, diagramas de secuencia, Gantt
- Sintaxis declarativa simple
- Preview en tiempo real
- Exportar como imagen
- Ejemplos predefinidos

### CA-07: Auto-Guardado
- Guardado automático cada 30 segundos
- Indicador de estado: "Guardando...", "Guardado", "Error"
- Recuperación de sesión si cierra navegador
- Versiones auto-guardadas (últimas 10)
- Restaurar versión anterior

### CA-08: Preview en Tiempo Real
- Split-screen: Editor | Preview
- Toggle preview on/off
- Preview actualizado en <500ms
- Preview exacto a renderizado final
- Responsive preview (desktop, tablet, mobile)

### CA-09: Markdown Support
- Escribir en Markdown y ver renderizado
- Toggle entre Markdown y WYSIWYG
- Shortcuts de Markdown (# para heading, ** para bold)
- Importar archivo .md
- Exportar como Markdown

### CA-10: Plantillas y Bloques Reutilizables
- Templates predefinidos:
  - "Introducción de módulo"
  - "Ejercicio con explicación"
  - "Resumen de conceptos"
- Guardar bloques como templates personalizados
- Biblioteca de bloques drag & drop
- Variables dinámicas (ej: {{nombre_estudiante}})

### CA-11: Colaboración (Opcional Avanzado)
- Comentarios en secciones específicas
- Sugerencias de cambios (track changes)
- Historial de ediciones con autor
- Edición simultánea (operational transforms o CRDTs)
- Notificaciones de cambios

### CA-12: Accesibilidad
- Navegación por teclado completa
- ARIA labels en toolbar
- Screen reader compatible
- Shortcuts accesibles
- Alt text requerido en imágenes
- Contrast checker para colores
- Semántica HTML correcta

### CA-13: Performance
- Editor carga en <2 segundos
- Smooth typing sin lag (60 FPS)
- Manejo de documentos >10,000 palabras
- Lazy loading de features pesadas
- Virtual scrolling para documentos largos
- Compresión de contenido guardado

### CA-14: Exportación de Contenido
- Exportar como HTML limpio
- Exportar como PDF (con estilos)
- Exportar como Markdown
- Exportar como DOCX (Word)
- Copiar HTML al portapapeles
- Preservar formato en exportación

### CA-15: Integración con Sistema
- Guardar contenido en base de datos
- Asociar a módulos/actividades
- Versionamiento (ver US-CONT-004)
- Permisos de edición por rol
- Audit trail de cambios
- API para crear/editar programáticamente

---

## Especificaciones Técnicas

### Technology Stack
```
Editor Options:
1. TipTap (recomendado)
   - Basado en ProseMirror
   - Extensible, moderno
   - TypeScript support
   - Buena documentación

2. Quill
   - Maduro, estable
   - Rica biblioteca de plugins
   - Más simple

3. Slate.js
   - Muy flexible
   - Curva de aprendizaje alta

Complementos:
- KaTeX para matemáticas
- Prism.js para código
- Mermaid.js para diagramas
- html-to-image para exportación
- Mammoth.js para importar DOCX
```

### Frontend Components
```
src/features/content-editor/
├── components/
│   ├── WYSIWYGEditor.tsx
│   ├── Toolbar.tsx
│   ├── ImageUploader.tsx
│   ├── MathEditor.tsx
│   ├── CodeBlockEditor.tsx
│   ├── TableEditor.tsx
│   ├── PreviewPanel.tsx
│   ├── TemplateSelector.tsx
│   └── AutoSaveIndicator.tsx
├── extensions/ (TipTap)
│   ├── MathExtension.ts
│   ├── CodeBlockExtension.ts
│   ├── ImageExtension.ts
│   └── VideoExtension.ts
└── hooks/
    ├── useEditor.ts
    ├── useAutoSave.ts
    └── useExport.ts
```

### Backend API
```typescript
POST   /api/content
PUT    /api/content/:id
GET    /api/content/:id
DELETE /api/content/:id
POST   /api/content/:id/autosave
GET    /api/content/:id/versions
POST   /api/content/:id/export/:format
```

---

## Diferenciación con Alcance Inicial

### Alcance Inicial (EAI)
- **EP005/US-005-11**: Editor básico de texto plano
- Sin rich text
- Sin multimedia
- Sin matemáticas

### Esta Historia (EXT-006)
- **Editor WYSIWYG profesional**
- **Rich text completo**: formato, colores, fuentes
- **Multimedia**: imágenes, videos, audios
- **Ecuaciones matemáticas**: LaTeX/KaTeX
- **Código con syntax highlighting**
- **Tablas, diagramas, Markdown**
- **Auto-guardado, preview, colaboración**
- Esto es **editor nivel Google Docs/Notion**

---

## Dependencias

### Depende de
- **US-CONT-003**: Biblioteca de recursos (para multimedia)
- **US-CONT-004**: Versionamiento (para historial)

---

## Definición de Terminado (DoD)

- [ ] TipTap/Quill integrado
- [ ] Rich text toolbar completo
- [ ] Upload de imágenes/videos/audios
- [ ] Editor de ecuaciones (KaTeX)
- [ ] Syntax highlighting para código
- [ ] Tablas con editor visual
- [ ] Diagramas con Mermaid
- [ ] Auto-guardado cada 30s
- [ ] Preview en tiempo real
- [ ] Markdown support
- [ ] Templates y bloques
- [ ] Exportación HTML/PDF/Markdown/DOCX
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Performance <2s carga
- [ ] Tests unitarios >80%
- [ ] Tests E2E de flujos
- [ ] Documentación de uso
- [ ] Video tutorial

---

## Estimación Detallada (10 SP)

| Tarea | Horas |
|-------|-------|
| Setup TipTap | 6h |
| Rich text features | 10h |
| Multimedia upload/embed | 12h |
| Math editor (KaTeX) | 8h |
| Code highlighting | 6h |
| Tables y diagramas | 8h |
| Auto-save | 6h |
| Preview panel | 6h |
| Markdown support | 6h |
| Templates | 8h |
| Export funcionalidad | 10h |
| Backend API | 10h |
| Testing | 12h |
| Documentación | 6h |
| **TOTAL** | **114h** |

**Presupuesto**: $5,700 MXN
**Duración**: 3-4 días

---

## Tags

#ext-006 #editor #wysiwyg #contenido #tiptap #rich-text #multimedia #matematicas #mes-3

---

**Creado**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Origen**: EP005/US-005-11-content-creator-page.md (editor extraído)
**Compliance**: PF-001 (XXX líneas)
