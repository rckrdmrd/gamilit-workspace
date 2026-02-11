---
id: "RF-ETC-002"
title: "Limpieza y Optimizacion Backend"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "backend"
epic: "ETC-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-ETC-002: Limpieza y Optimizacion Backend

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-ETC-002 |
| Modulo | Backend (NestJS) |
| Status | Done |
| EPIC | ETC-001 - Consolidacion Tecnica |

## Descripcion

Eliminar codigo obsoleto, duplicado y redundante del backend NestJS. La auditoria de duplicidades identifico un auth.service.ts stub de 145 lineas coexistiendo con la version de produccion de 801 lineas, DTOs de notificaciones con 3 capas de re-exports innecesarios, y naming conflicts en DTOs de recent-activity.

## Requerimiento Funcional

- **RF-ETC-002.1:** Eliminar `auth/auth.service.ts` obsoleto (stub 145 lineas) tras verificar que ningun archivo lo importa, manteniendo unicamente `auth/services/auth.service.ts` (produccion, 801 lineas).
- **RF-ETC-002.2:** Limpiar re-exports redundantes de notification DTOs, consolidando las 3 capas de re-export en imports directos desde la ubicacion canonica.
- **RF-ETC-002.3:** Resolver naming conflicts en `recent-activity.dto.ts`, renombrando o consolidando las 2 versiones con nombres similares pero propositos distintos.
- **RF-ETC-002.4:** Verificar que no existen otros archivos obsoletos o stubs en el codebase backend que puedan generar confusion.

## Criterios de Aceptacion

- [ ] AC-001: Archivo `auth/auth.service.ts` (stub) eliminado del codebase
- [ ] AC-002: Notification DTOs con imports directos, sin capas intermedias de re-export
- [ ] AC-003: Cero naming conflicts en DTOs (cada nombre es unico)
- [ ] AC-004: `npm run build` del backend pasa sin errores
- [ ] AC-005: `npm run lint` sin warnings criticos nuevos

## Referencias

- **User Story:** US-ETC-002 - Limpieza de Codigo Backend
- **EPIC:** ETC-001 - Consolidacion Tecnica y Validacion de Integracion
- **Archivo eliminado:** `apps/backend/src/modules/auth/auth.service.ts`
- **Archivo mantenido:** `apps/backend/src/modules/auth/services/auth.service.ts`
