---
titulo: Base de Conocimiento - Errores Comunes
tipo: readme
fecha_creacion: 2025-12-28
ultima_actualizacion: 2026-02-28
estado: activo
---

# Base de Conocimiento: Errores Comunes

**Proyecto:** GAMILIT
**Fecha creacion:** 2025-12-28
**Objetivo:** Documentar patrones de errores recurrentes y sus soluciones para acelerar el desarrollo y reducir regresiones.

---

## Proposito

Esta base de conocimiento contiene errores que se han identificado durante el desarrollo del proyecto. Consultar esta documentacion ANTES de implementar nuevas funcionalidades permite:

1. **Evitar repetir errores** - Los patrones documentados aqui ya han sido resueltos
2. **Acelerar debugging** - Sintomas conocidos tienen soluciones probadas
3. **Mejorar calidad** - Aplicar las correcciones preventivas desde el inicio
4. **Reducir tiempo** - No reinventar soluciones ya descubiertas

---

## Estructura

```
ERRORES-COMUNES/
|-- README.md           # Este archivo
|-- _MAP.md             # Mapa de navegacion
|-- database/           # Errores de base de datos (DDL, seeds, triggers)
|-- backend/            # Errores de backend (NestJS, TypeORM)
|-- frontend/           # Errores de frontend (React, hooks, API)
|-- integracion/        # Errores de integracion entre capas
```

---

## Convencion de Nombres

Los errores siguen el formato: `ERR-{DOMINIO}-{NUMERO}-{descripcion}.md`

Donde:
- **DOMINIO**: DB (database), BE (backend), FE (frontend), INT (integracion)
- **NUMERO**: Secuencial por dominio (001, 002, etc.)
- **descripcion**: Breve descripcion en kebab-case

Ejemplo: `ERR-DB-001-uuid-format.md`

---

## Como Usar Esta Documentacion

### Antes de Desarrollar

1. Identifica el dominio donde vas a trabajar (DB, BE, FE)
2. Lee los errores comunes de ese dominio
3. Verifica que tu implementacion no caiga en patrones conocidos

### Cuando Encuentras un Error

1. Busca si ya esta documentado
2. Si existe, aplica la solucion documentada
3. Si es nuevo, documenta el error siguiendo el template

### Despues de Resolver un Error

1. Si el error es recurrente (2+ ocurrencias), documentalo
2. Actualiza la fecha de ultima ocurrencia si ya existe
3. Agrega mejoras a la solucion si descubriste algo nuevo

---

## Template de Error

Cada error documentado sigue esta estructura:

```markdown
# ERR-{DOMINIO}-{NUMERO}: {TITULO}

## Descripcion
[Descripcion breve del error - que es y cuando ocurre]

## Sintomas
- [Lista de sintomas observables]

## Causa Raiz
[Explicacion tecnica de por que ocurre]

## Solucion
[Pasos para resolver, con codigo si aplica]

## Prevencion
[Como evitar que ocurra en el futuro]

## Ocurrencias
| Fecha | Archivo | Commit | Estado |
|-------|---------|--------|--------|

## Referencias
- [Links a documentacion, issues, PRs relacionados]
```

---

## Indice por Dominio

### Database (DDL, Seeds, Triggers)
| ID | Titulo | Severidad | Archivo |
|----|--------|-----------|---------|
| ERR-DB-001 | Formato UUID incorrecto | Alta | [ERR-DB-001-uuid-format.md](./database/ERR-DB-001-uuid-format.md) |
| ERR-DB-002 | NOW() vs gamilit.now_mexico() | Media | [ERR-DB-002-timezone-now.md](./database/ERR-DB-002-timezone-now.md) |
| ERR-DB-003 | Conflictos UUID en Seeds | Critica | [ERR-DB-003-seeds-conflictos-uuid.md](./database/ERR-DB-003-seeds-conflictos-uuid.md) |

### Backend (NestJS, TypeORM)
| ID | Titulo | Severidad | Archivo |
|----|--------|-----------|---------|
| ERR-BE-001 | Endpoints con prefijo duplicado | Critica | [ERR-BE-001-endpoints-prefijo-duplicado.md](./backend/ERR-BE-001-endpoints-prefijo-duplicado.md) |
| ERR-BE-002 | Queries N+1 en TypeORM | Alta | [ERR-BE-002-queries-n-plus-1.md](./backend/ERR-BE-002-queries-n-plus-1.md) |
| ERR-BE-003 | Validacion faltante en DTOs | Alta | [ERR-BE-003-validacion-dtos-faltante.md](./backend/ERR-BE-003-validacion-dtos-faltante.md) |

### Frontend (React, Hooks, API)
| ID | Titulo | Severidad | Archivo |
|----|--------|-----------|---------|
| ERR-FE-001 | API endpoints hardcodeados | Alta | [ERR-FE-001-api-endpoints-hardcoded.md](./frontend/ERR-FE-001-api-endpoints-hardcoded.md) |
| ERR-FE-002 | Estados de carga no manejados | Media | [ERR-FE-002-loading-states.md](./frontend/ERR-FE-002-loading-states.md) |

### Integracion
| ID | Titulo | Severidad | Archivo |
|----|--------|-----------|---------|
| ERR-INT-001 | Database-Backend desalineado | Alta | [ERR-INT-001-db-backend-desalineado.md](./integracion/ERR-INT-001-db-backend-desalineado.md) |
| ERR-INT-002 | DTOs desalineados FE-BE | Alta | [ERR-INT-002-dtos-desalineados.md](./integracion/ERR-INT-002-dtos-desalineados.md) |

---

## Principio SIMCO

Esta base de conocimiento aplica el principio SIMCO:

> **SIMCO-BUSCAR:** Antes de implementar, buscar si existe solucion conocida
> **SIMCO-DOCUMENTAR:** Despues de resolver, documentar para el futuro

---

## Metricas

| Metrica | Valor | Objetivo |
|---------|-------|----------|
| Errores documentados | 10 | 20+ |
| Por dominio | DB:3, BE:3, FE:2, INT:2 | Equilibrado |
| Tiempo promedio resolucion | TBD | -50% |
| Errores recurrentes | TBD | 0 |

---

## Contacto

Para agregar nuevos errores o sugerir mejoras:
- Crear archivo en la carpeta correspondiente
- Seguir el template establecido
- Actualizar este README con el nuevo error

---

**Creado por:** Requirements-Analyst Agent
**Fecha:** 2025-12-28
**Version:** 1.0
