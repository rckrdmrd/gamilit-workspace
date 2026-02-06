---
id: "RF-WL-002"
title: "Logo y Colores"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "white_label"
epic: "EXT-008"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Logo y Colores

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-WL-002 |
| Modulo | white_label |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-008 |

## Descripcion

El sistema debe permitir a las organizaciones personalizar el esquema visual de la plataforma: logo principal, logo compacto, paleta de colores primarios y secundarios, y seleccion de tema base (claro/oscuro). Los colores se aplican via CSS variables para cambio dinamico.

## Requerimiento Funcional

- **RF-WL-002.1:** Subir logo principal (SVG/PNG, max 500KB) y logo compacto para mobile/sidebar.
- **RF-WL-002.2:** Configurar paleta de colores: primario, secundario, accent, fondo, texto.
- **RF-WL-002.3:** Seleccionar tema base: claro, oscuro, o auto (detectar preferencia del sistema).
- **RF-WL-002.4:** Aplicar colores via CSS custom properties para cambio dinamico sin rebuild.
- **RF-WL-002.5:** Validar contraste de colores para cumplir WCAG 2.1 AA (minimo 4.5:1).

## Criterios de Aceptacion

- [x] AC-001: Logo visible en header, login page y emails.
- [x] AC-002: Colores aplicados a toda la interfaz via CSS variables.
- [x] AC-003: Tema claro/oscuro toggle funcional con colores personalizados.
- [x] AC-004: Validacion de contraste muestra warning si ratio < 4.5:1.

## Referencias

- **User Story:** US-WL-002
- **Especificacion:** ET-WL-002
- **EPIC:** EXT-008
