# Schemas Placeholder y Vacios

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### public (legacy, vacio)
Schema publico de PostgreSQL. No se carga en creacion de BD nuevas.
- **Schema fisico DDL:** `public`
- **Estado:** Vacio, legacy

### storage (placeholder, vacio)
Schema de almacenamiento de archivos (compatible Supabase).
- **Schema fisico DDL:** `storage`
- **Estado:** Placeholder, sin tablas

### optimization (placeholder)
Schema para indexes y triggers de optimizacion de rendimiento.
- **Schema fisico DDL:** `optimization`
- **Estado:** Solo contiene definiciones de indexes, sin tablas

### billing (reservado)
Reservado para sistema de facturacion si se comercializa la plataforma.
- **Schema fisico DDL:** No existe aun
- **Estado:** Concepto futuro
