---
id: "RF-ETC-001"
title: "Consolidacion de APIs Frontend"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "frontend"
epic: "ETC-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-ETC-001: Consolidacion de APIs Frontend

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-ETC-001 |
| Modulo | Frontend (API Services) |
| Status | Done |
| EPIC | ETC-001 - Consolidacion Tecnica |

## Descripcion

Consolidar los multiples API clients duplicados del frontend en una unica fuente de verdad por dominio. Durante el desarrollo iterativo se crearon hasta 3 versiones de gamificationAPI, 2 de adminAPI, 2 de educationalAPI y 2 de progressAPI en distintas ubicaciones, generando riesgo de divergencia, bugs y aumento innecesario del bundle size.

## Requerimiento Funcional

- **RF-ETC-001.1:** Consolidar gamificationAPI (3 versiones) en un unico archivo canonico en `lib/api/gamification.api.ts`, preservando todas las funcionalidades existentes de cada version.
- **RF-ETC-001.2:** Consolidar adminAPI (2 versiones) en `lib/api/admin.api.ts`, unificando endpoints de gestion de usuarios, contenido y configuracion.
- **RF-ETC-001.3:** Consolidar educationalAPI (2 versiones) en `lib/api/educational.api.ts`, manteniendo compatibilidad con todos los componentes consumidores.
- **RF-ETC-001.4:** Consolidar progressAPI (2 versiones) en `lib/api/progress.api.ts`, asegurando que el tracking de progreso funcione sin regresiones.
- **RF-ETC-001.5:** Actualizar todos los imports en componentes afectados para apuntar a la ubicacion canonica y eliminar las versiones redundantes del codebase.

## Criterios de Aceptacion

- [ ] AC-001: Cada API service tiene exactamente 1 archivo canonico en `lib/api/`
- [ ] AC-002: Todas las funcionalidades de las versiones previas estan presentes en la version consolidada
- [ ] AC-003: Cero imports apuntando a ubicaciones eliminadas (validado con grep)
- [ ] AC-004: Build del frontend pasa sin errores ni warnings criticos
- [ ] AC-005: Bundle size no incrementa respecto al estado pre-consolidacion

## Referencias

- **User Story:** US-ETC-001 - Consolidacion de APIs Frontend
- **EPIC:** ETC-001 - Consolidacion Tecnica y Validacion de Integracion
- **Dependencia:** Requiere EAI-003 Gamificacion Base completada
