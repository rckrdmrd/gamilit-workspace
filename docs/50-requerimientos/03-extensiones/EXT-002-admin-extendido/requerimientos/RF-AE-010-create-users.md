---
id: "RF-AE-010"
title: "Create Users"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_users"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Create Users

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-010 |
| Modulo | admin_users |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores crear usuarios directamente desde el panel de administracion, asignando rol, organizacion y configuracion inicial. Los usuarios creados reciben credenciales temporales y se les marca como requiriendo cambio de contrasena en el primer login.

## Requerimiento Funcional

- **RF-AE-010.1:** Crear usuario con email, nombre, rol asignado y organizacion.
- **RF-AE-010.2:** Generar contrasena temporal segura y marcar require_password_reset=true.
- **RF-AE-010.3:** Opcionalmente enviar email de bienvenida con credenciales temporales.
- **RF-AE-010.4:** Validar que el email no este duplicado en el sistema.
- **RF-AE-010.5:** Registrar la creacion en audit trail con referencia al admin que creo el usuario.

## Criterios de Aceptacion

- [x] AC-001: POST /admin/users crea usuario con todos los campos requeridos.
- [x] AC-002: Email duplicado retorna error 409 Conflict.
- [x] AC-003: Usuario creado tiene flag require_password_reset activo.
- [x] AC-004: Audit trail registra admin_id y timestamp de creacion.

## Referencias

- **User Story:** US-AE-010
- **Especificacion:** ET-BULK-OPERATIONS
- **EPIC:** EXT-002
