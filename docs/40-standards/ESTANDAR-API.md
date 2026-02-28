---
titulo: Estandar de API
tipo: estandar-workspace
scope: workspace
version: 2.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-28
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/API-STANDARDS.md para endpoints especificos.
tags:
  - api
  - rest
  - swagger
  - http
  - nestjs
  - seguridad
---

# Estandar de APIs REST

> Convenciones RESTful, documentacion Swagger, codigos de respuesta y seguridad para APIs backend con NestJS

**Este archivo es un hub. El contenido detallado esta dividido en archivos especializados bajo `estandar-api/`.**

---

## Contenido

| Archivo | Secciones | Descripcion |
|---------|-----------|-------------|
| [01-RESTFUL-VERSIONING.md](estandar-api/01-RESTFUL-VERSIONING.md) | §1-2 | Verbos HTTP, estructura de URLs, versionamiento, politica de deprecacion |
| [02-SWAGGER.md](estandar-api/02-SWAGGER.md) | §3 | Configuracion Swagger, decoradores obligatorios, documentacion de DTOs |
| [03-RESPONSES.md](estandar-api/03-RESPONSES.md) | §4-5 | Codigos HTTP 2xx/4xx/5xx, formato de respuestas, interceptor de respuesta |
| [04-PAGINATION-FILTERS.md](estandar-api/04-PAGINATION-FILTERS.md) | §6 | Query parameters estandar, PaginationDto, filtros avanzados |
| [05-SECURITY-CHECKLIST.md](estandar-api/05-SECURITY-CHECKLIST.md) | §7-9+Refs | Rate limiting, seguridad, checklists de validacion, referencias |

## Resumen de Secciones

1. **RESTful Conventions** — Verbos HTTP correctos, estructura de URLs, implementacion NestJS
2. **Versionamiento** — URL versioning (recomendado), header versioning, politica de deprecacion
3. **Documentacion Swagger** — Configuracion base, decoradores obligatorios, DTOs documentados
4. **Codigos HTTP** — 2xx exito, 4xx errores cliente, 5xx errores servidor, tabla de decision
5. **Formato de Respuestas** — Estructura estandar exito/error, interceptor de respuesta
6. **Paginacion y Filtros** — Query params, DTOs paginacion, filtros avanzados por campo
7. **Rate Limiting** — Configuracion throttler, headers, respuesta 429, limites por endpoint
8. **Seguridad** — Referencia a ESTANDAR-SEGURIDAD, resumen rapido CORS/Input/Output/Helmet
9. **Checklist** — RESTful, versionamiento, Swagger, codigos HTTP, respuestas, seguridad

## Referencias Rapidas

- [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) - OWASP Top 10, autenticacion JWT
- [ESTANDAR-BACKEND-PROFESIONAL.md](ESTANDAR-BACKEND-PROFESIONAL.md) - Patrones backend
- [ESTANDAR-CODIGO.md](ESTANDAR-CODIGO.md) - Convenciones de codigo
- [NestJS Documentation](https://docs.nestjs.com/) - Documentacion oficial
- [Swagger/OpenAPI](https://swagger.io/) - Especificacion OpenAPI
