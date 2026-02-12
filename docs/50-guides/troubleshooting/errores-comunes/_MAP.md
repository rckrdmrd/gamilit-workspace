# _MAP: Errores Comunes

**Carpeta:** docs/95-guias-desarrollo/ERRORES-COMUNES/
**Proposito:** Base de conocimiento de errores recurrentes y sus soluciones
**Estado:** Activo
**Ultima actualizacion:** 2025-12-28

---

## Contenido

### Carpetas por Dominio

| Carpeta | Descripcion | Errores |
|---------|-------------|---------|
| [database/](./database/) | Errores DDL, seeds, triggers, funciones | 3 |
| [backend/](./backend/) | Errores NestJS, TypeORM, endpoints | 3 |
| [frontend/](./frontend/) | Errores React, hooks, API calls | 2 |
| [integracion/](./integracion/) | Errores entre capas DB-BE-FE | 2 |

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
- ERR-DB-003: Conflictos UUID en Seeds

**Altos (Funcionalidad afectada):**
- ERR-DB-001: Formato UUID incorrecto
- ERR-BE-002: Queries N+1 en TypeORM
- ERR-BE-003: Validacion faltante en DTOs
- ERR-FE-001: API endpoints hardcodeados
- ERR-INT-001: Database-Backend desalineado
- ERR-INT-002: DTOs desalineados FE-BE

**Medios (Degradacion):**
- ERR-DB-002: NOW() vs gamilit.now_mexico()
- ERR-FE-002: Estados de carga no manejados

### Lista Completa de Errores

| ID | Titulo | Severidad | Archivo |
|----|--------|-----------|---------|
| ERR-DB-001 | Formato UUID incorrecto | Alta | database/ |
| ERR-DB-002 | NOW() vs gamilit.now_mexico() | Media | database/ |
| ERR-DB-003 | Conflictos UUID en Seeds | Critica | database/ |
| ERR-BE-001 | Endpoints prefijo duplicado | Critica | backend/ |
| ERR-BE-002 | Queries N+1 en TypeORM | Alta | backend/ |
| ERR-BE-003 | Validacion DTOs faltante | Alta | backend/ |
| ERR-FE-001 | API endpoints hardcodeados | Alta | frontend/ |
| ERR-FE-002 | Loading states no manejados | Media | frontend/ |
| ERR-INT-001 | DB-Backend desalineado | Alta | integracion/ |
| ERR-INT-002 | DTOs desalineados FE-BE | Alta | integracion/ |

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
4. Actualizar _MAP.md e indice README.md
      |
      v
5. Agregar referencia desde docs principales
```

---

## Referencias Cruzadas

### Desde docs/README.md
Ver seccion "Errores Comunes y Correcciones"

### Desde docs/90-transversal/_MAP.md
Ver seccion "Base de Conocimiento"

### Desde orchestration/
Los reportes de correcciones referencian errores documentados aqui

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Total errores documentados | 10 |
| Database | 3 |
| Backend | 3 |
| Frontend | 2 |
| Integracion | 2 |

---

**Actualizado:** 2025-12-28
**Por:** Requirements-Analyst
**Version:** 1.1
