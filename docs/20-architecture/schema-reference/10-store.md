---
titulo: Schema 10 - store (deprecated)
tipo: arquitectura
subtipo: schema-reference
schema: store
ultima_actualizacion: 2026-02-27
---

# Schema 10: store (deprecado)

> Este documento queda como referencia historica.
> El modelo activo de tienda/equipamiento se documenta en `gamification_system.*`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Estado

**Estado:** Deprecado para nuevas integraciones  
**Fecha de deprecacion documental:** 2026-02-17

Motivo:
- La implementacion actual y DDL vigente usan `gamification_system.shop_items`, `gamification_system.shop_categories`, `gamification_system.user_purchases` y `gamification_system.user_equipped_items`.
- Mantener `store.*` como fuente activa genera contradicciones de arquitectura y API.

---

## Redireccion oficial (SSOT)

Usar los siguientes documentos como fuente de verdad:

| Tema | Documento SSOT |
|------|-----------------|
| Tablas de gamificacion + tienda activa | `docs/20-architecture/schema-reference/04-gamification.md` |
| Contrato JSONB metadata | `docs/40-standards/ESTANDAR-METADATA-ITEMS.md` |
| Diseño técnico equipamiento | `docs/20-architecture/gamificacion/DISENO-SISTEMA-EQUIPAMIENTO.md` |
| Flujo tecnico equipamiento | `docs/20-architecture/gamificacion/FLUJO-TECNICO-EQUIPAMIENTO.md` |

---

## Nota de compatibilidad

Si existe codigo o documento legado que referencie `store.*`, debe tratarse como referencia historica y migrarse de forma gradual a `gamification_system.*`.
