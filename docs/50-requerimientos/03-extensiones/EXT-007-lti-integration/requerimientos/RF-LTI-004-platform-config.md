---
id: "RF-LTI-004"
title: "Platform Config"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "lti"
epic: "EXT-007"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Platform Config

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-LTI-004 |
| Modulo | lti |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-007 |

## Descripcion

El sistema debe proporcionar interfaz de administracion para registrar y configurar plataformas LMS (platforms) que se conectan a Gamilit via LTI 1.3. Incluye registro de client_id, JWKS URL, auth endpoint, token endpoint y configuracion de deployment.

## Requerimiento Funcional

- **RF-LTI-004.1:** CRUD de platforms con campos: nombre, client_id, issuer, JWKS URL, auth URL, token URL.
- **RF-LTI-004.2:** Configurar deployment_id y tool_url para cada platform registrado.
- **RF-LTI-004.3:** Validar conectividad con platform al registrar (verificar JWKS endpoint accesible).
- **RF-LTI-004.4:** Generar y mostrar configuracion de tool para importar en el LMS.
- **RF-LTI-004.5:** Activar/desactivar platforms individuales sin eliminarlos.

## Criterios de Aceptacion

- [x] AC-001: CRUD de platforms operativo desde panel admin.
- [x] AC-002: Validacion de JWKS URL al registrar platform.
- [x] AC-003: Configuracion de tool exportable en formato JSON para LMS.
- [x] AC-004: Toggle de activacion/desactivacion funcional.
- [x] AC-005: Al menos 5 campos obligatorios validados al crear platform.

## Referencias

- **User Story:** US-LTI-004
- **Especificacion:** ET-LTI-004
- **EPIC:** EXT-007
