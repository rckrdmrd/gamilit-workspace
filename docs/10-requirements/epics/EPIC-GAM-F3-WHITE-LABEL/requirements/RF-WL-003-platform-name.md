---
id: "RF-WL-003"
title: "Platform Name"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "white_label"
epic: "EXT-008"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Platform Name

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-WL-003 |
| Modulo | white_label |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-008 |

## Descripcion

El sistema debe permitir a las organizaciones personalizar completamente el nombre de la plataforma en todos los puntos de contacto: interfaz, emails, notificaciones, reportes exportados y pagina de login. El nombre reemplaza "Gamilit" por el nombre configurado por la organizacion.

## Requerimiento Funcional

- **RF-WL-003.1:** Configurar nombre de plataforma que reemplaza "Gamilit" en toda la interfaz.
- **RF-WL-003.2:** Nombre visible en header, footer, titulo del navegador y breadcrumbs.
- **RF-WL-003.3:** Nombre utilizado en emails transaccionales y notificaciones push.
- **RF-WL-003.4:** Nombre incluido en reportes exportados (PDF, Excel) como identificador.
- **RF-WL-003.5:** Pagina de login personalizada con nombre y branding de la organizacion.

## Criterios de Aceptacion

- [x] AC-001: Nombre personalizado visible en al menos 5 puntos de la interfaz.
- [x] AC-002: Emails enviados muestran nombre de la organizacion en lugar de "Gamilit".
- [x] AC-003: Reportes exportados incluyen nombre de la organizacion en header.
- [x] AC-004: Login page muestra branding completo de la organizacion.

## Referencias

- **User Story:** US-WL-003
- **Especificacion:** ET-WL-003
- **EPIC:** EXT-008
