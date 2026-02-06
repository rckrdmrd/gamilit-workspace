---
id: "RF-AUTH-004"
title: "Infraestructura Tecnica Base"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Autenticacion y Autorizacion"
epic: "EAI-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Infraestructura Tecnica Base

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AUTH-004 |
| Modulo | Autenticacion y Autorizacion |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-001 |

## Descripcion

La plataforma requiere una infraestructura tecnica base que soporte el desarrollo del MVP de forma eficiente y escalable. Esto incluye la configuracion de NestJS como backend, React con Vite como frontend, PostgreSQL con TypeORM como persistencia, y la estructura modular de carpetas que se usara durante todo el desarrollo.

## Requerimiento Funcional

- **RF-AUTH-004.1:** Configurar proyecto NestJS con estructura modular (modules, controllers, services, entities, DTOs), incluyendo configuracion de entorno via ConfigModule y validacion con class-validator.
- **RF-AUTH-004.2:** Configurar proyecto React con Vite, Tailwind CSS, estructura de carpetas por dominio (pages, components, hooks, services, stores), y soporte de TypeScript estricto.
- **RF-AUTH-004.3:** Configurar PostgreSQL con TypeORM incluyendo migraciones, seeds iniciales, conexion via variables de entorno, y esquemas separados por dominio (auth_management, gamification_system, educational_content).
- **RF-AUTH-004.4:** Implementar middleware base: CORS, helmet, rate limiting, request logging, y compression para el backend NestJS.
- **RF-AUTH-004.5:** Establecer scripts de desarrollo unificados (npm run dev, build, lint, test) para ambos proyectos con hot-reload funcional.

## Criterios de Aceptacion

- [ ] AC-001: El backend NestJS arranca sin errores y responde en /api/health
- [ ] AC-002: El frontend React compila y sirve en modo desarrollo con hot-reload
- [ ] AC-003: La conexion a PostgreSQL se establece correctamente con TypeORM
- [ ] AC-004: Los middleware de seguridad (CORS, helmet, rate limiting) estan activos
- [ ] AC-005: La estructura de carpetas sigue la convencion modular definida

## Referencias

- **User Story:** US-FUND-004
- **Especificacion:** ET-AUTH-004
- **EPIC:** EAI-001
