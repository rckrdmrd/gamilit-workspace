---
id: "RF-AE-005"
title: "Parametrizacion Gamificacion"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_gamification"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Parametrizacion Gamificacion

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-005 |
| Modulo | admin_gamification |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores configurar parametros del sistema de gamificacion: valores de XP por actividad, tasas de conversion de ML Coins, configuracion de rachas, umbrales de rangos Maya, y reglas de logros. Todos los cambios deben reflejarse inmediatamente en la experiencia del estudiante.

## Requerimiento Funcional

- **RF-AE-005.1:** Configurar valores de XP otorgados por tipo de actividad (ejercicio completado, racha diaria, logro desbloqueado).
- **RF-AE-005.2:** Ajustar tasas de conversion y economia de ML Coins (ganancia, gasto, multiplicadores).
- **RF-AE-005.3:** Definir umbrales de rangos Maya (XP requerido por nivel) y reglas de progresion.
- **RF-AE-005.4:** Configurar parametros de rachas: dias minimos, bonificaciones y penalizaciones.
- **RF-AE-005.5:** Habilitar/deshabilitar features de gamificacion por organizacion via feature flags.

## Criterios de Aceptacion

- [x] AC-001: Parametros de gamificacion editables desde panel admin con guardado inmediato.
- [x] AC-002: Cambios en parametros reflejados en la siguiente sesion del estudiante.
- [x] AC-003: Feature flags permiten activar/desactivar modulos de gamificacion por tenant.
- [x] AC-004: Valores configurados persistidos en system_configuration.system_settings.

## Referencias

- **User Story:** US-AE-005
- **Especificacion:** ET-ADM-005-audit-logs
- **EPIC:** EXT-002
