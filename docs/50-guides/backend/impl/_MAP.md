---
titulo: Map - Guias de Desarrollo Backend
tipo: mapa-navegacion
fecha_creacion: 2025-10-01
ultima_actualizacion: 2026-02-28
estado: activo
---

# _MAP: Guias de Desarrollo Backend

**Carpeta:** docs/50-guides/backend/
**Proposito:** Guias de desarrollo para el backend NestJS
**Estado:** Completo
**Ultima actualizacion:** 2025-01-04

---

## Proposito

Esta carpeta contiene las guias de desarrollo para el backend NestJS, incluyendo:
- Estructura de modulos y componentes
- Convenciones de API y DTOs
- Integracion con base de datos
- Setup de desarrollo
- Testing y errores

**Codigo que mapea:** `apps/backend/`

---

## Contenido

### Estructura del Codigo

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `README.md` | Indice general del backend | Vigente |
| `ESTRUCTURA-MODULOS.md` | Mapa de modulos NestJS | Vigente |
| `ESTRUCTURA-SHARED.md` | Componentes compartidos | Vigente |

### Convenciones y Estandares

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `API-CONVENTIONS.md` | Convenciones de API REST | Vigente |
| `API-STANDARDS.md` | Estandares de API | Vigente |
| `DTO-CONVENTIONS.md` | Convenciones de DTOs | Vigente |
| `NAMING-CONVENTIONS-API.md` | Nomenclatura de API | Vigente |

### Integracion y Persistencia

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `DATABASE-INTEGRATION.md` | Integracion con PostgreSQL | Vigente |
| `ENTITIES-DOCUMENTACION.md` | Documentacion de entidades | Vigente |

### Inventarios y Referencias

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `ADMIN-DTOS.md` | Inventario de 125 DTOs admin | Referencia |
| `SERVICES-DUPLICADOS.md` | Analisis de servicios | Referencia |

### Operaciones y Desarrollo

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `SETUP-DEVELOPMENT.md` | Setup local del backend | Vigente |
| `ERROR-HANDLING.md` | Manejo de errores | Vigente |
| `TESTING-GUIDE.md` | Guia de testing Jest | Vigente |

---

## Metricas

| Componente | Cantidad |
|------------|----------|
| Archivos MD | 14 |
| Guias estructura | 2 |
| Guias convenciones | 4 |
| Guias operaciones | 3 |
| Referencias | 3 |

---

## Backend Stats (SSOT)

| Componente | Cantidad |
|------------|----------|
| Modulos | 13 |
| Entities | 92 |
| Services | 88 |
| Controllers | 71 |
| Endpoints | 417 |

---

## Navegacion

### Para nuevos desarrolladores:
1. `README.md` - Vision general
2. `SETUP-DEVELOPMENT.md` - Configurar entorno
3. `ESTRUCTURA-MODULOS.md` - Entender organizacion

### Para desarrollo activo:
- `API-CONVENTIONS.md` - Crear nuevos endpoints
- `DTO-CONVENTIONS.md` - Crear DTOs
- `DATABASE-INTEGRATION.md` - Trabajar con BD

### Para troubleshooting:
- `ERROR-HANDLING.md` - Manejo de errores
- `SERVICES-DUPLICADOS.md` - Servicios problematicos

---

## Referencias

- **Especificaciones API:** `../90-transversal/api/`
- **Codigo fuente:** `apps/backend/`
- **SSOT:** `orchestration/inventarios/BACKEND_INVENTORY.yml`

---

**Actualizado:** 2025-01-04
**Version:** 2.0 (migracion completada)
