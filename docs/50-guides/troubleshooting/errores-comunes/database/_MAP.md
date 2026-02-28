---
titulo: Mapa de Navegacion - Errores Comunes Database
tipo: mapa-navegacion
fecha_creacion: 2025-10-01
ultima_actualizacion: 2026-02-28
estado: activo
---

# Mapa de Navegacion - Errores Comunes Database

## Descripcion
Documentacion de errores comunes encontrados en la base de datos de Gamilit y sus soluciones.

## Contenido

| Archivo | Descripcion | Severidad | Estado |
|---------|-------------|-----------|--------|
| [ERR-DB-001-uuid-format.md](./ERR-DB-001-uuid-format.md) | Formato UUID incorrecto en seeds | Alta | Completo |
| [ERR-DB-002-timezone-now.md](./ERR-DB-002-timezone-now.md) | Uso de NOW() en lugar de gamilit.now_mexico() | Media | Completo |
| [ERR-DB-003-seeds-conflictos-uuid.md](./ERR-DB-003-seeds-conflictos-uuid.md) | Conflictos de UUID duplicados en seeds | Critica | Completo |
| [ERR-DB-004-rls-policy-conflicto.md](./ERR-DB-004-rls-policy-conflicto.md) | Conflictos RLS entre schemas por nombres no calificados | Alta | Completo |
| [ERR-DB-005-trigger-recursion.md](./ERR-DB-005-trigger-recursion.md) | Recursion infinita en triggers que modifican su propia tabla | Critica | Completo |
| [ERR-DB-006-fk-cross-schema.md](./ERR-DB-006-fk-cross-schema.md) | Foreign key cross-schema sin nombre completamente calificado | Alta | Completo |

## Referencias
- [Directorio padre](../_MAP.md)

---
*Ultima actualizacion: 2026-02-13*
