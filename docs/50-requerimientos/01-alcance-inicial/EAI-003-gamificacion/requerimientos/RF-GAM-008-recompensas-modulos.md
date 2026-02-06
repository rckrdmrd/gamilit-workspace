---
id: "RF-GAM-008"
title: "Recompensas por Completar Modulos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Gamificacion"
epic: "EAI-003"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Recompensas por Completar Modulos

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-008 |
| Modulo | Gamificacion |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-003 |

## Descripcion

El sistema debe otorgar recompensas especiales al completar modulos educativos completos, proporcionando un incentivo significativo que refuerce el sentido de logro. Las recompensas son fijas y mayores que las de actividades individuales, e incluyen XP, ML Coins, e insignias opcionales. Los valores estan hardcodeados en la definicion de cada modulo.

## Requerimiento Funcional

- **RF-GAM-008.1:** Otorgar recompensas fijas al completar un modulo: XP (ej: 50 XP), ML Coins (ej: 25 monedas), y opcionalmente una insignia exclusiva del modulo, con valores superiores a los de actividades individuales.
- **RF-GAM-008.2:** Mostrar pantalla de celebracion al completar modulo con animacion especial, detalle de recompensas obtenidas (XP, monedas, insignia), y resumen del rendimiento (puntuacion, tiempo, intentos).
- **RF-GAM-008.3:** Calcular bonus por rendimiento: puntuacion perfecta (100%) otorga bonus de 50% extra en XP y monedas. Completar sin usar comodines otorga bonus adicional de 25%.
- **RF-GAM-008.4:** Registrar la completacion del modulo en progress_tracking con timestamp, puntuacion final, recompensas otorgadas, y flag de primera vez (para evitar duplicar recompensas en revisitas).
- **RF-GAM-008.5:** Desbloquear el siguiente modulo en la secuencia tras completar el actual, actualizando la vista de modulos del estudiante con el nuevo modulo disponible.

## Criterios de Aceptacion

- [ ] AC-001: Las recompensas se otorgan automaticamente al completar el ultimo ejercicio del modulo
- [ ] AC-002: La pantalla de celebracion muestra todas las recompensas obtenidas con animacion
- [ ] AC-003: El bonus por rendimiento perfecto se calcula y otorga correctamente
- [ ] AC-004: Las recompensas no se duplican al revisitar un modulo ya completado
- [ ] AC-005: El siguiente modulo se desbloquea correctamente tras la completacion

## Referencias

- **User Story:** US-GAM-008
- **Especificacion:** ET-GAM-008
- **EPIC:** EAI-003
