# 40-Estandares: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Ultima actualizacion:** 2026-01-24

---

## Descripcion

Estandares tecnicos del proyecto GAMILIT para mantener consistencia en codigo, APIs, base de datos y procesos de desarrollo.

---

## Estandares Vigentes

| ID | Documento | Descripcion |
|----|-----------|-------------|
| STD-API-001 | [ESTANDAR-NOMENCLATURA-API.md](./ESTANDAR-NOMENCLATURA-API.md) | snake_case/camelCase entre backend y frontend |

---

## Estandares Pendientes (Backlog)

| ID | Titulo | Prioridad | Descripcion |
|----|--------|-----------|-------------|
| STD-CODE-001 | Estructura Carpetas Frontend | P2 | Convenciones de organizacion de archivos |
| STD-CODE-002 | Manejo de Errores | P1 | Error handling patterns consistentes |
| STD-CODE-003 | Testing | P1 | Unit, integration, e2e testing standards |
| STD-API-002 | Endpoints RESTful | P2 | Convenciones de rutas y respuestas |
| STD-DB-001 | Migraciones BD | P2 | Politica Clean Load y migraciones |
| STD-GIT-001 | Commits y Branching | P2 | Conventional commits y git flow |

---

## Ubicacion de Estandares Relacionados

| Tipo | Ubicacion |
|------|-----------|
| Workspace SIMCO | `orchestration/directivas/simco/` |
| Guias Desarrollo | `docs/50-guides/` |
| Referencias | `docs/80-references/` |
| ADRs | `docs/90-adr/` |

---

## Como Crear un Nuevo Estandar

1. Copiar estructura desde _MAP.md (7 secciones obligatorias)
2. Asignar ID: `STD-{CATEGORIA}-{NNN}`
3. Documentar problema, solucion, ejemplos
4. Actualizar este README y _MAP.md
5. Notificar al equipo

---

*Ver mapa completo en: [_MAP.md](./_MAP.md)*
