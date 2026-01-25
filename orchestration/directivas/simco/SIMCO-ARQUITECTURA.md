# SIMCO-ARQUITECTURA: Directiva de Arquitectura

**Version:** 2.0.0
**Sistema:** SIMCO - Workspace v1
**Fecha:** 2025-12-18

---

## PROPOSITO

Establecer principios y patrones de arquitectura para el workspace.

---

## PRINCIPIO FUNDAMENTAL

> **La arquitectura debe ser explicita, documentada y enforzada.**

---

## ARQUITECTURA DE 3 CAPAS

### Control Plane

```yaml
Ubicacion: control-plane/
Proposito: Governance y orquestacion
Contenido:
  - Registries (puertos, dominios, BDs)
  - Manifests (repos, ambientes)
  - Directivas SIMCO
  - Perfiles de agentes
  - DevTools (scripts, docker, configs)
Owner: Tech-Leader
```

### Products (Proyectos)

```yaml
Ubicacion: projects/
Proposito: Codigo de productos
Contenido:
  - gamilit/
  - erp-suite/
  - trading-platform/
  - betting-analytics/
Owner: Equipos de desarrollo
```

### Shared

```yaml
Ubicacion: shared/
Proposito: Recursos compartidos
Contenido:
  - libs/ (librerias)
  - infra/ (infraestructura)
  - knowledge-base/
Owner: Tech-Leader + DevOps
```

---

## PATRONES DE ARQUITECTURA

### Backend - Modular Monolith

```yaml
Estructura recomendada:
src/
+-- modules/           # Dominios de negocio
|     +-- auth/        # Cada modulo es independiente
|     |     +-- controllers/
|     |     +-- services/
|     |     +-- entities/
|     |     +-- dto/
|     +-- users/
|     +-- orders/
+-- shared/            # Codigo compartido
      +-- guards/
      +-- filters/
      +-- interceptors/
      +-- utils/

Principios:
- Bajo acoplamiento entre modulos
- Alta cohesion dentro de modulos
- Dependencias explicitas
- Comunicacion via interfaces
```

### Frontend - Feature-Based

```yaml
Estructura recomendada:
src/
+-- components/        # Componentes reutilizables
|     +-- common/
|     +-- layout/
+-- features/          # Features de negocio
|     +-- auth/
|     |     +-- components/
|     |     +-- hooks/
|     |     +-- api/
|     +-- dashboard/
+-- pages/             # Paginas/rutas
+-- services/          # Servicios globales
+-- store/             # Estado global

Principios:
- Componentes atomicos
- Features encapsuladas
- Estado colocated
- Lazy loading
```

### Database - Schema-per-Domain

```yaml
Estructura recomendada:
Schemas:
- public     # Evitar, usar schemas especificos
- core       # Tablas compartidas (tenants, configs)
- auth       # Autenticacion/usuarios
- business   # Logica de negocio principal
- audit      # Logs y auditoria

Principios:
- Un schema por dominio
- Referencias cruzadas explicitas
- Permisos por schema
- Auditoria centralizada
```

---

## PATRONES DE COMUNICACION

### Sincrono (HTTP/REST)

```yaml
Usar cuando:
- Request-response simple
- Baja latencia requerida
- Operaciones CRUD

Patrones:
- REST APIs
- GraphQL (si multiples clientes)
- gRPC (servicios internos)
```

### Asincrono (Eventos)

```yaml
Usar cuando:
- Operaciones largas
- Notificaciones
- Integracion entre servicios
- Resiliencia requerida

Patrones:
- Message queues (RabbitMQ, Redis)
- Event sourcing (si auditoria critica)
- Webhooks (integraciones externas)
```

---

## REGLAS DE DEPENDENCIA

### Permitido

```yaml
- Servicio -> Libreria compartida
- Frontend -> Backend (via API)
- Backend -> Database
- Modulo -> Shared del mismo servicio
- Proyecto -> Control Plane (lectura)
```

### Prohibido

```yaml
- Frontend -> Database directamente
- Servicio A -> Codigo de Servicio B
- Proyecto -> Codigo de otro proyecto
- Cualquiera -> Modificar Control Plane sin aprobacion
```

---

## ARCHITECTURE DECISION RECORDS (ADRs)

### Cuando Crear ADR

```yaml
Crear ADR cuando:
- Nueva tecnologia
- Nuevo patron
- Cambio de arquitectura
- Decision con impacto amplio
- Trade-offs significativos
```

### Template ADR

```markdown
# ADR-XXX: Titulo

**Estado:** Propuesto | Aceptado | Deprecado
**Fecha:** YYYY-MM-DD
**Autor:** Nombre

## Contexto
Por que necesitamos tomar esta decision?

## Decision
Que decidimos hacer?

## Consecuencias
- Positivas: ...
- Negativas: ...
- Neutras: ...

## Alternativas Consideradas
1. Opcion A: descripcion, pros/cons
2. Opcion B: descripcion, pros/cons
```

---

## CHECKLIST DE ARQUITECTURA

### Nuevo Servicio

```markdown
[ ] Patron de arquitectura definido
[ ] Estructura de directorios documentada
[ ] Dependencias explicitas
[ ] Comunicacion con otros servicios definida
[ ] ADR creado (si decision significativa)
```

### Cambio de Arquitectura

```markdown
[ ] ADR creado
[ ] Impacto evaluado
[ ] Migracion planeada
[ ] Rollback plan
[ ] Aprobacion de Tech-Leader
```

---

## PROHIBICIONES

```yaml
NUNCA:
- Dependencias circulares
- Acoplamiento fuerte entre servicios
- Logica de negocio en controllers
- Base de datos compartida sin schema separation
- Cambios de arquitectura sin ADR
- Ignorar patrones establecidos
```

---

## CHANGELOG

### v2.0.0 (2025-12-18)
- Definida arquitectura de 3 capas
- Agregados patrones por tipo
- Actualizado para Workspace v1

---

**Directiva mantenida por:** Tech-Leader
**Ultima actualizacion:** 2025-12-18
