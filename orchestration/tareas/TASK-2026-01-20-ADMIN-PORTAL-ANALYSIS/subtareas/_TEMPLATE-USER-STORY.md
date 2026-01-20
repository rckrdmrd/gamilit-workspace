# US-AE-XXX: [Titulo de la User Story]

**Proyecto:** GAMILIT
**Epica:** EXT-002 Admin Extendido
**Version:** 1.0
**Fecha creacion:** [YYYY-MM-DD]
**Ultima actualizacion:** [YYYY-MM-DD]
**Estado:** IMPLEMENTADO | ESPECIFICADO | EN_PROGRESO

---

## Informacion General

| Atributo | Valor |
|----------|-------|
| **Codigo** | US-AE-XXX |
| **Prioridad** | P0 | P1 | P2 |
| **Story Points** | X SP |
| **Sprint** | Sprint X |
| **Estado** | [ESTADO] |

---

## Historia de Usuario

**Como** [rol de usuario],
**Quiero** [accion/funcionalidad],
**Para** [beneficio/valor de negocio].

---

## Descripcion

[Descripcion detallada de la funcionalidad]

---

## Criterios de Aceptacion

### AC-1: [Criterio 1]
**DADO** [contexto inicial]
**CUANDO** [accion del usuario]
**ENTONCES** [resultado esperado]

### AC-2: [Criterio 2]
**DADO** [contexto inicial]
**CUANDO** [accion del usuario]
**ENTONCES** [resultado esperado]

---

## Especificacion Tecnica

### Frontend

**Pagina:** `[NombrePage].tsx`
**Ubicacion:** `apps/frontend/src/apps/admin/pages/`

**Componentes:**
- `[Componente1]` - [descripcion]
- `[Componente2]` - [descripcion]

**Hooks:**
- `use[Hook]` - [descripcion]

### Backend

**Controlador:** `[nombre].controller.ts`
**Ubicacion:** `apps/backend/src/modules/admin/controllers/`

**Endpoints:**

| Metodo | Endpoint | DTO Entrada | DTO Salida | Descripcion |
|--------|----------|-------------|------------|-------------|
| GET | `/admin/[path]` | - | `[Dto]` | [desc] |
| POST | `/admin/[path]` | `[Dto]` | `[Dto]` | [desc] |

**Servicios:**
- `[Service]Service` - [descripcion]

### Base de Datos

**Entities:**
- `[Entity]` - [descripcion]

**Vistas/Tablas:**
- `[tabla]` - [descripcion]

---

## Mockups / Wireframes

[Descripcion de la interfaz o link a mockups]

---

## Notas de Implementacion

### Consideraciones
- [Nota 1]
- [Nota 2]

### Dependencias
- [Dependencia 1]
- [Dependencia 2]

---

## Testing

### Casos de Prueba

| ID | Descripcion | Resultado Esperado |
|----|-------------|--------------------|
| TC-01 | [descripcion] | [resultado] |
| TC-02 | [descripcion] | [resultado] |

---

## Trazabilidad

### Archivos Creados/Modificados

**Frontend:**
- `apps/frontend/src/apps/admin/pages/[Page].tsx` - [LOC]
- `apps/frontend/src/apps/admin/hooks/use[Hook].ts` - [LOC]
- `apps/frontend/src/apps/admin/components/[component]/` - [archivos]

**Backend:**
- `apps/backend/src/modules/admin/controllers/[controller].ts` - [LOC]
- `apps/backend/src/modules/admin/services/[service].ts` - [LOC]
- `apps/backend/src/modules/admin/dto/[category]/` - [archivos]

---

## Referencias

- Epica: [EXT-002 Admin Extendido](../README.md)
- Arquitectura: [ET-EXT-002-ARQUITECTURA-TECNICA.md](../especificaciones/ET-EXT-002-ARQUITECTURA-TECNICA.md)
- Best Practices: [ADMIN-PORTAL-BEST-PRACTICES.md](../guias/ADMIN-PORTAL-BEST-PRACTICES.md)

---

**Creado por:** [Agente]
**Revisado por:** [Usuario]
