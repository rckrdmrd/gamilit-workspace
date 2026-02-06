---
id: "RF-TCH-011"
title: "Perfil y Preferencias del Maestro"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Perfil y Preferencias del Maestro

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-011 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar una seccion de configuracion donde el maestro puede gestionar su perfil profesional, preferencias de interfaz y ajustes por defecto para nuevas aulas. Incluye informacion personal, avatar, especializacion, horario de atencion, idioma preferido y configuraciones por defecto de gamificacion y calificacion.

## Requerimiento Funcional

- **RF-TCH-011.1:** El maestro puede editar su perfil profesional: nombre visible, titulo/especializacion, biografia breve, avatar y horario de atencion a estudiantes.
- **RF-TCH-011.2:** El maestro puede configurar preferencias de interfaz: tema (claro/oscuro), idioma, zona horaria y densidad de informacion en el dashboard.
- **RF-TCH-011.3:** El maestro puede definir valores por defecto para nuevas aulas: capacidad, mecanicas de gamificacion activas, rubrica base y politica de entregas tardias.
- **RF-TCH-011.4:** El maestro puede gestionar su contrasena, habilitar autenticacion de dos factores (2FA) y ver sesiones activas.

## Criterios de Aceptacion

- [ ] AC-001: Los cambios de perfil se reflejan inmediatamente en la vista publica del maestro.
- [ ] AC-002: El tema seleccionado persiste entre sesiones y se aplica a toda la interfaz.
- [ ] AC-003: Las nuevas aulas creadas heredan los valores por defecto configurados.
- [ ] AC-004: El 2FA se activa correctamente y requiere codigo en los siguientes logins.
- [ ] AC-005: El maestro puede cerrar sesiones activas remotamente desde la vista de seguridad.

## Reglas de Negocio

- El avatar se redimensiona automaticamente a 200x200px y no excede 2MB.
- La zona horaria afecta la visualizacion de fechas limite y entregas.
- Los valores por defecto no afectan aulas ya creadas, solo las nuevas.

## Dependencias

- Tabla `user_profiles` en esquema `auth`.
- Servicio de autenticacion para 2FA.
- Almacenamiento de avatares en servicio de storage.

## Referencias

- **User Story:** US-PM-011
- **Especificacion:** ET-TCH-011
- **EPIC:** EXT-001
