# _MAP: Errores Comunes

**Carpeta:** docs/50-guides/troubleshooting/errores-comunes/
**Proposito:** Base de conocimiento de errores recurrentes y sus soluciones
**Estado:** Activo
**Ultima actualizacion:** 2026-02-13

---

## Contenido

### Carpetas por Dominio

| Carpeta | Descripcion | Errores |
|---------|-------------|---------|
| [database/](./database/) | Errores DDL, seeds, triggers, funciones, RLS | 6 |
| [backend/](./backend/) | Errores NestJS, TypeORM, endpoints, modulos | 8 |
| [frontend/](./frontend/) | Errores React, hooks, API calls, barrel imports | 6 |
| [integracion/](./integracion/) | Errores entre capas DB-BE-FE, datasources | 5 |

### Archivos Raiz

| Archivo | Descripcion |
|---------|-------------|
| README.md | Indice y guia de uso |
| _MAP.md | Este archivo - mapa de navegacion |

---

## Navegacion Rapida

### Por Severidad

**Criticos (Bloqueadores):**
- ERR-BE-001: Endpoints con prefijo duplicado
- ERR-BE-004: Datasource entity path incorrecto
- ERR-BE-008: Barrel export referencia archivo inexistente
- ERR-DB-003: Conflictos UUID en Seeds
- ERR-DB-005: Recursion infinita en triggers
- ERR-FE-003: Import barrel roto
- ERR-INT-003: Modulo registrado sin entidades en datasource
- ERR-INT-004: Relacion entity cross-datasource sin include

**Altos (Funcionalidad afectada):**
- ERR-DB-001: Formato UUID incorrecto
- ERR-DB-004: Conflictos RLS entre schemas
- ERR-DB-006: Foreign key cross-schema sin search_path
- ERR-BE-002: Queries N+1 en TypeORM
- ERR-BE-003: Validacion faltante en DTOs
- ERR-BE-005: Modulo huerfano sin registrar en AppModule
- ERR-BE-006: Dependencia circular entre modulos
- ERR-BE-007: Orden incorrecto de decoradores Guard
- ERR-FE-001: API endpoints hardcodeados
- ERR-FE-005: API service duplicado entre lib/ y services/
- ERR-INT-001: Database-Backend desalineado
- ERR-INT-002: DTOs desalineados FE-BE
- ERR-INT-005: Dual AuthProvider con comportamiento inconsistente

**Medios (Degradacion):**
- ERR-DB-002: NOW() vs gamilit.now_mexico()
- ERR-FE-002: Estados de carga no manejados
- ERR-FE-004: Archivo utility duplicado
- ERR-FE-006: React Query cache key collision

### Lista Completa de Errores

| ID | Titulo | Severidad | Archivo |
|----|--------|-----------|---------|
| ERR-DB-001 | Formato UUID incorrecto | Alta | database/ |
| ERR-DB-002 | NOW() vs gamilit.now_mexico() | Media | database/ |
| ERR-DB-003 | Conflictos UUID en Seeds | Critica | database/ |
| ERR-DB-004 | Conflictos RLS entre schemas | Alta | database/ |
| ERR-DB-005 | Recursion infinita en triggers | Critica | database/ |
| ERR-DB-006 | Foreign key cross-schema sin search_path | Alta | database/ |
| ERR-BE-001 | Endpoints prefijo duplicado | Critica | backend/ |
| ERR-BE-002 | Queries N+1 en TypeORM | Alta | backend/ |
| ERR-BE-003 | Validacion DTOs faltante | Alta | backend/ |
| ERR-BE-004 | Datasource entity path incorrecto | Critica | backend/ |
| ERR-BE-005 | Modulo huerfano sin .module.ts | Alta | backend/ |
| ERR-BE-006 | Dependencia circular entre modulos | Alta | backend/ |
| ERR-BE-007 | Orden incorrecto decoradores Guard | Alta | backend/ |
| ERR-BE-008 | Barrel export roto | Critica | backend/ |
| ERR-FE-001 | API endpoints hardcodeados | Alta | frontend/ |
| ERR-FE-002 | Loading states no manejados | Media | frontend/ |
| ERR-FE-003 | Import barrel roto | Critica | frontend/ |
| ERR-FE-004 | Archivo utility duplicado | Media | frontend/ |
| ERR-FE-005 | API service duplicado lib/ vs services/ | Alta | frontend/ |
| ERR-FE-006 | React Query cache key collision | Media | frontend/ |
| ERR-INT-001 | DB-Backend desalineado | Alta | integracion/ |
| ERR-INT-002 | DTOs desalineados FE-BE | Alta | integracion/ |
| ERR-INT-003 | Modulo sin entidades en datasource | Critica | integracion/ |
| ERR-INT-004 | Cross-datasource relation sin include | Critica | integracion/ |
| ERR-INT-005 | Dual AuthProvider inconsistente | Alta | integracion/ |

---

## Proceso de Documentacion

```
1. Identificar error recurrente (2+ ocurrencias)
      |
      v
2. Crear archivo ERR-{DOM}-{NUM}-{desc}.md
      |
      v
3. Seguir template del README.md
      |
      v
4. Actualizar _MAP.md de dominio + raiz
      |
      v
5. Agregar referencia desde docs principales
```

---

## Referencias Cruzadas

### Desde docs/README.md
Ver seccion "Errores Comunes y Correcciones"

### Desde docs/80-references/transversal/_MAP.md
Ver seccion "Base de Conocimiento"

### Desde orchestration/
Los reportes de correcciones referencian errores documentados aqui

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Total errores documentados | 25 |
| Database | 6 |
| Backend | 8 |
| Frontend | 6 |
| Integracion | 5 |

---

**Actualizado:** 2026-02-13
**Por:** Architecture-Analyst
**Version:** 2.0
