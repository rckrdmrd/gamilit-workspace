# _MAP: Arquitectura de Base de Datos

**Carpeta:** docs/90-transversal/arquitectura-database/
**Proposito:** Documentacion de arquitectura, DDL, funciones y operaciones de base de datos
**Estado:** Definitivo
**Ultima actualizacion:** 2026-01-04

---

## Proposito

Esta carpeta contiene la documentacion completa de la arquitectura de base de datos PostgreSQL, incluyendo:
- Orden de carga de DDL y esquemas
- Estrategias de Foreign Keys
- Runbooks de migraciones y operaciones
- Inventario de funciones, triggers y views
- Guias de troubleshooting

---

## Contenido

### Documentacion Principal

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `README.md` | Indice general de la carpeta | Vigente |
| `DATABASE-README.md` | Documentacion principal de la BD | Vigente |
| `DESIGN-GUIDELINES.md` | Lineamientos de diseno de BD | Vigente |

### DDL y Estructura

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `DDL-SCHEMA-ORDER.md` | Orden de carga de DDL por schema | Vigente |
| `FK-STRATEGY.md` | Estrategia de Foreign Keys | Vigente |
| `SCHEMA-COMMUNICATION.md` | Comunicacion entre schemas | Vigente |
| `TABLAS-NUEVAS-2025-12.md` | Tablas agregadas en Dic 2025 | Vigente |

### Funciones y Triggers

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `TRIGGERS-INVENTARIO.md` | Inventario de triggers | Vigente |
| `FUNCIONES-VALIDACION-SIN-USO-DIRECTO.md` | Funciones de validacion internas | Referencia |
| `functions/` | Documentacion de funciones especificas | Vigente |

### Views e Indices

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `VIEWS-INVENTARIO.md` | Inventario de views y mat views | Vigente |
| `INDICES-DUPLICADOS.md` | Analisis de indices duplicados | Referencia |

### Operaciones y Runbooks

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `PROCEDIMIENTO-CREACION-BD.md` | Procedimiento creacion BD | Operacional |
| `RUNBOOK-MIGRACIONES.md` | Runbook de migraciones | Operacional |
| `GUIA-PROBLEMAS-RECURRENTES.md` | Troubleshooting | Operacional |
| `VALIDACION-DDL-SEEDS-2025-12-26.md` | Validacion de DDL y seeds | Vigente |

### Arquitectura

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `ARCHITECTURE-DUAL-EXERCISES-2025-11-24.md` | Arquitectura dual de ejercicios | Vigente |

---

## Subcarpetas

| Carpeta | Descripcion | Archivos |
|---------|-------------|----------|
| `functions/` | Documentacion de funciones SQL | 1+ |

---

## Metricas

| Componente | Cantidad |
|------------|----------|
| Archivos MD | 16 |
| Guias DDL | 4 |
| Runbooks | 3 |
| Inventarios | 3 |

---

## Referencias

- **Inventarios detallados:** `../inventarios-database/`
- **Codigo fuente:** `apps/database/`
- **SSOT:** `orchestration/inventarios/DATABASE_INVENTORY.yml`

---

**Actualizado:** 2025-01-04
**Version:** 2.0 (migracion completada)
