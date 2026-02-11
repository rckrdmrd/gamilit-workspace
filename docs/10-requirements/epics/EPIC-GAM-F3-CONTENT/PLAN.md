# Plan de Desarrollo: EPIC-GAM-F3-CONTENT

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 40
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-CONT-001 | Editor WYSIWYG | 13 | F1-AUTH | Sprint 15 |
| 2 | US-CONT-002 | Gestion Ejercicios | 8 | US-CONT-001, F1-EXERCISES | Sprint 15 |
| 3 | US-CONT-003 | Biblioteca Recursos | 8 | US-CONT-001 | Sprint 16 |
| 4 | US-CONT-004 | Versionamiento | 5 | US-CONT-001 | Sprint 16 |
| 5 | US-CONT-005 | Import/Export | 5 | US-CONT-003 | Sprint 17 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 16 / React 19 / TipTap (WYSIWYG)
- **Base de datos:** Schema `educational_content` (tablas content_items, content_versions, media_assets, content_categories)
- **Patron:** CMS headless, versionado con historial, media upload con S3/Cloudinary

## Estrategia de Testing
- **Unit:** content.service, versioning.service, media-upload (Jest)
- **Integration:** /api/v1/content/*, /api/v1/media/* (supertest)
- **E2E:** Crear contenido WYSIWYG, agregar media, versionar, exportar (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Editor WYSIWYG complejidad | Alta | Medio | Usar TipTap (extensible, probado), limitar features |
| Storage de media costoso | Media | Medio | Limites por tenant, compresion automatica |
| Import de formatos variados | Media | Medio | Soportar JSON/CSV inicialmente, otros en v2 |

---

*Generado: 2026-02-10 | ADR-0020*
