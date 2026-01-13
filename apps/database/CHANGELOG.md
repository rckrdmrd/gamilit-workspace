# Changelog - Database GAMILIT

Todos los cambios notables en el proyecto de base de datos.

---

## [1.1.0] - 2026-01-13

### Scripts TCP
Soporte de conexion TCP para ambientes WSL2.

| Script | Version | Cambio Principal |
|--------|---------|------------------|
| init-database.sh | v3.10-TCP | Prioridad TCP, carga password desde .env |
| recreate-database.sh | v1.1-TCP | Skip eliminacion usuario en modo TCP |

### Correcciones DDL

| ID | Objeto | Cambio |
|----|--------|--------|
| CORR-002 | `validate_rueda_inferencias_text.sql` | Movido a _deprecated (duplicado) |
| CORR-003 | `gamification_system.missions` | Timestamps `with time zone`, progress `double precision` |
| CORR-004 | `mission.entity.ts` | Alineado con DDL |

### Cumplimiento Estandares
5 archivos "fix" movidos a `_deprecated/scripts-violacion-carga-limpia/`

### Estado BD

| Objeto | Cantidad |
|--------|----------|
| Schemas | 16 |
| Tablas | 129 |
| Vistas Materializadas | 4 |
| Funciones | 219 |
| Triggers | 105 |
| RLS Policies | 214 |

---

## [1.0.1] - 2026-01-07

### Consolidacion de Objetos DDL

| Fase | Descripcion | Archivos |
|------|-------------|----------|
| FASE 1 | Consolidar triggers updated_at | 27 movidos, 8 creados |
| FASE 2 | Migrar ENUMs a schemas | 22 creados |
| FASE 3 | Eliminar tabla notifications legacy | 1 eliminado |
| FASE 4 | Limpieza funciones deprecated | 1 script |
| FASE 5 | Sincronizacion ENUMs DB-Backend-Frontend | 5 archivos |
| FASE 6 | Validacion dependencias | 8 corregidos |

**Resultado:** 16 schemas, 141 tablas, 39 ENUMs, 225 funciones, 101 triggers

---

## [1.0.0] - 2025-12-18

### Release Inicial
- Estructura DDL multi-schema
- Scripts init-database.sh y recreate-database.sh
- Seeds dev/prod
- Politica de Carga Limpia implementada
- RLS policies por schema

---

## Referencias

| Documento | Descripcion |
|-----------|-------------|
| `_MAP.md` | Mapa de carpeta database |
| `README.md` | Documentacion principal |
| `FLUJO-CARGA-LIMPIA.md` | Politica de carga limpia |
