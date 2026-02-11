# Plan de Tareas -- EPIC-GAM-F3-CONTENT
Estado: PLANIFICADO | US: 5 | SP Total: 40

## Tareas Planificadas

| # | Tarea | Area | US Relacionadas | SP Est. | Prioridad |
|---|-------|------|-----------------|---------|-----------|
| 1 | Integrar TipTap editor con extensiones (math KaTeX, code Prism, Mermaid) | Frontend | US-CONT-001 | 5 | P1 |
| 2 | Toolbar completo: rich text, multimedia upload, tablas, plantillas | Frontend | US-CONT-001 | 3 | P1 |
| 3 | API content CRUD + autosave + export (HTML/PDF/Markdown/DOCX) | Backend | US-CONT-001 | 3 | P1 |
| 4 | Constructor visual de ejercicios (23 tipos, configuracion, preview) | Frontend | US-CONT-002 | 4 | P1 |
| 5 | API ejercicios: CRUD, templates, asignacion a modulos | Backend | US-CONT-002 | 3 | P1 |
| 6 | Biblioteca recursos: upload media, organizacion categorias/tags, busqueda | Fullstack | US-CONT-003 | 4 | P2 |
| 7 | Optimizacion media: thumbnails, compresion, CDN, lazy loading | Backend | US-CONT-003 | 2 | P2 |
| 8 | Sistema versionamiento: historial, rollback, diff viewer side-by-side | Fullstack | US-CONT-004 | 4 | P2 |
| 9 | Audit trail + papelera reciclaje (30 dias retencion) | Backend | US-CONT-004 | 2 | P2 |
| 10 | Import/export masivo (CSV, JSON, SCORM, paquetes educativos) | Fullstack | US-CONT-005 | 4 | P2 |
| 11 | Preview en tiempo real (split-screen editor/preview, responsive) | Frontend | US-CONT-001 | 2 | P1 |
| 12 | Tests unitarios + E2E editor + performance (<2s carga) | Testing | Todas | 4 | P1 |

## Dependencias
- Requiere: Portal maestros (EXT-001) funcional, storage S3/Cloudinary configurado
- Bloquea: Nada directamente (enriquece experiencia de creacion de contenido)
