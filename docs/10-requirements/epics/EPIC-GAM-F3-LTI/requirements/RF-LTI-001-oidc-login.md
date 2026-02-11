---
id: "RF-LTI-001"
title: "OIDC Login"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "lti"
epic: "EXT-007"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# OIDC Login

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-LTI-001 |
| Modulo | lti |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-007 |

## Descripcion

El sistema debe implementar el flujo OIDC (OpenID Connect) de LTI 1.3 para autenticacion de usuarios provenientes de plataformas LMS externas. Incluye validacion de JWT, mapeo de claims a roles internos, y creacion automatica de cuenta si el usuario no existe en Gamilit.

## Requerimiento Funcional

- **RF-LTI-001.1:** Implementar endpoint de login OIDC que recibe y valida el id_token del LMS.
- **RF-LTI-001.2:** Validar firma JWT del id_token usando JWKS del platform registrado.
- **RF-LTI-001.3:** Mapear claims LTI a roles internos: Instructor -> admin_teacher, Learner -> student.
- **RF-LTI-001.4:** Crear cuenta automaticamente si el email del LTI claim no existe en Gamilit.
- **RF-LTI-001.5:** Generar sesion Gamilit (JWT propio) tras autenticacion LTI exitosa.

## Criterios de Aceptacion

- [x] AC-001: Flujo OIDC completo desde LMS hasta sesion Gamilit funcional.
- [x] AC-002: JWT del LMS validado contra JWKS del platform registrado.
- [x] AC-003: Roles mapeados correctamente segun claims del id_token.
- [x] AC-004: Usuario nuevo creado automaticamente con datos del LTI claim.
- [x] AC-005: Sesion Gamilit generada con permisos correctos segun rol mapeado.

## Referencias

- **User Story:** US-LTI-001
- **Especificacion:** ET-LTI-001
- **EPIC:** EXT-007
