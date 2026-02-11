---
id: "RF-PERF-001"
title: "Personalizacion Perfil"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "profiles"
epic: "EXT-004"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Personalizacion Perfil

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PERF-001 |
| Modulo | profiles |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-004 |

## Descripcion

El sistema debe permitir a los usuarios personalizar su perfil con avatar, biografia, temas visuales y configuracion de privacidad. Los estudiantes pueden elegir entre avatares predefinidos del sistema Maya o subir imagen personalizada. Los cambios se reflejan en tiempo real en todas las vistas que muestren el perfil.

## Requerimiento Funcional

- **RF-PERF-001.1:** Editar informacion basica del perfil: nombre visible, biografia (max 500 chars), idioma preferido.
- **RF-PERF-001.2:** Seleccionar avatar de galeria predefinida o subir imagen personalizada (max 2MB, jpg/png).
- **RF-PERF-001.3:** Configurar privacidad del perfil: publico, solo amigos, privado.
- **RF-PERF-001.4:** Seleccionar tema visual de la interfaz: claro, oscuro, auto (segun sistema).
- **RF-PERF-001.5:** Cambios reflejados en tiempo real en leaderboards, aulas y actividad social.

## Criterios de Aceptacion

- [x] AC-001: Formulario de edicion de perfil con preview en tiempo real.
- [x] AC-002: Avatar cargado redimensionado automaticamente a 200x200px.
- [x] AC-003: Configuracion de privacidad respetada en busquedas y listados.
- [x] AC-004: Tema visual aplicado inmediatamente sin recarga de pagina.
- [x] AC-005: Datos persistidos en tabla auth_management.profiles.

## Referencias

- **User Story:** US-PERF-001
- **Especificacion:** ET-PERF-001
- **EPIC:** EXT-004
