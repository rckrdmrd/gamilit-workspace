---
titulo: "Architecture - GAMILIT"
tipo: readme
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Architecture - GAMILIT

Arquitectura tecnica del proyecto.

---

## Contenido

| Documento | Descripcion |
|-----------|-------------|
| [STACK-TECNOLOGICO.md](STACK-TECNOLOGICO.md) | NestJS 11, React 19, PostgreSQL 15, stack completo |
| [ARQUITECTURA-GAMIFICACION.md](ARQUITECTURA-GAMIFICACION.md) | XP, rangos maya, achievements, economia, scoring |
| [MODELO-DATOS.md](MODELO-DATOS.md) | 18 schemas, 173 tablas, RLS policies, funciones |
| [SCHEMA-REFERENCE.md](SCHEMA-REFERENCE.md) | Referencia detallada de schemas y tablas |
| [MECANICAS-GAMIFICACION-V6.md](MECANICAS-GAMIFICACION-V6.md) | Indice legacy de mecanicas (contenido segmentado) |
| [gamificacion/README.md](gamificacion/README.md) | Estructura canonica de gamificacion por subtema y modulo |
| [DATOS-GAMIFICACION.md](DATOS-GAMIFICACION.md) | Estructuras de datos del sistema de gamificacion |
| [COHERENCE-ENTITIES-DDL.md](COHERENCE-ENTITIES-DDL.md) | Auditoria coherencia DDL-Backend (82.5%) |
| [TRACEABILITY-US-SCHEMAS.md](TRACEABILITY-US-SCHEMAS.md) | Trazabilidad User Stories a Schemas de BD |

---

## Quick Reference

### Stack
NestJS 11 + React 19 + PostgreSQL 15 (RLS) + TypeORM 0.3.x + Socket.IO 4.8+ + Vite 6.x + Redis

### Arquitectura
- **MONOREPO:** backend + frontend + database en mismo repo
- **Modular:** modulos NestJS por dominio funcional
- **Multi-tenant:** RLS activo (ver inventarios SSOT)
- **Real-time:** Socket.IO para leaderboards y notificaciones
- **Gamificacion:** XP + Rangos Maya + Achievements + ML Coins

### Base de Datos
Esquemas y conteos actualizados en `orchestration/inventarios/MASTER_INVENTORY.yml`.

---

*Ver documentos individuales para detalle completo.*
