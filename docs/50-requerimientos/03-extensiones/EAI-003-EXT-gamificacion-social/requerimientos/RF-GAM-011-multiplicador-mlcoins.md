---
id: "RF-GAM-011"
title: "Sistema Multiplicador ML Coins por Rango"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "gamification_system"
epic: "EAI-003-EXT"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-GAM-011: Sistema Multiplicador ML Coins por Rango

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-011 |
| Modulo | gamification_system |
| Status | Done |
| EPIC | EAI-003-EXT - Gamificacion Social |

## Descripcion

Implementar el sistema de multiplicadores de ML Coins documentado en el diseno v6.1. Cada rango Maya otorga un multiplicador progresivo (1.0x a 2.0x) que incrementa las recompensas de ML Coins en todas las actividades. Esto incentiva el progreso de largo plazo y recompensa proporcionalmente a los estudiantes avanzados.

## Requerimiento Funcional

- **RF-GAM-011.1:** Aplicar multiplicador de ML Coins automaticamente en toda transaccion de recompensa segun la tabla de rangos: Semilla de Cacao (1.0x), Recolector (1.1x), Artesano (1.2x), Escriba (1.3x), Guardian (1.4x), Sabio (1.5x), Chaman (1.6x), Senor (1.7x), Gran Sacerdote (1.8x), Halach Uinic (2.0x).
- **RF-GAM-011.2:** Almacenar el multiplicador actual del usuario en `user_stats` y actualizarlo automaticamente al cambiar de rango mediante trigger de base de datos.
- **RF-GAM-011.3:** Mostrar al usuario su multiplicador actual en el dashboard de gamificacion junto con el multiplicador del siguiente rango como incentivo de progresion.
- **RF-GAM-011.4:** Registrar en el historial de transacciones tanto el monto base como el monto final con multiplicador aplicado, para trazabilidad y auditoria.

## Criterios de Aceptacion

- [ ] AC-001: Multiplicador aplica correctamente en todas las fuentes de ML Coins (ejercicios, achievements, misiones)
- [ ] AC-002: Cambio de rango actualiza multiplicador en menos de 1 segundo via trigger
- [ ] AC-003: Dashboard muestra multiplicador actual y siguiente con progreso visual
- [ ] AC-004: Historial de transacciones registra monto_base y monto_final por separado
- [ ] AC-005: Tests unitarios cubren los 10 rangos y sus multiplicadores correspondientes

## Referencias

- **User Story:** US-GAM-011 - Multiplicador ML Coins por Rango
- **Especificacion:** ET-SOC-001 - Diseno Tecnico Sistema de Amigos (seccion multiplicadores)
- **EPIC:** EAI-003-EXT - Gamificacion Social
- **Diseno original:** DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md
