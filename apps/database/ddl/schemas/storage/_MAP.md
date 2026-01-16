# _MAP: storage/

**Ultima actualizacion:** 2026-01-14
**Estado:** RESERVADO (futuras integraciones)
**Tipo:** System/Storage
**Objetos activos:** 0

---

## Proposito

Schema reservado para futuras integraciones de almacenamiento (S3, Supabase Storage, etc.).
Actualmente sin objetos activos - ENUMs deprecados movidos a `_deprecated/`.

**Audiencia:** DBAs, Backend Developers

---

## Estructura

```
ddl/schemas/storage/
├── enums/
│   └── _deprecated/
│       └── buckettype.sql    # DEPRECATED (DB-158)
└── _MAP.md                   # Este archivo
```

**Total objetos DDL activos:** 0

---

## ENUMs Deprecados

| ENUM | Archivo | Razon Deprecacion | Ticket |
|------|---------|-------------------|--------|
| `buckettype` | enums/_deprecated/buckettype.sql | Sin uso en ninguna tabla | DB-158 |

---

## Uso Futuro

Este schema se activara cuando se implemente:
- Integracion con Supabase Storage
- Sistema de archivos adjuntos
- Media uploads para contenido educativo

---

## Dependencias

**Este schema depende de:** Ninguno
**Schemas que dependen de este:** Ninguno (actualmente)

---

## Referencia

- `create-database.sh` Fase 4 - Storage schema (solo ENUMs)
- `DATABASE_INVENTORY.yml` - 4 ENUMs deprecated en storage

---

**Mantenido por:** Database Team
**Version:** 2.0
