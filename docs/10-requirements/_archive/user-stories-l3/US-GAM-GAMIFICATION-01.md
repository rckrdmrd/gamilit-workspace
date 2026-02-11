# US-GAM-GAMIFICATION-01: Ganar XP y Subir de Rango Maya

**Prefijo:** GAM | **Modulo:** gamification | **Prioridad:** P1 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** estudiante activo en la plataforma,
**Quiero** ganar puntos de experiencia (XP) por cada ejercicio completado y progresar a traves de los 5 rangos maya,
**Para** sentir progresion constante y motivarme a completar mas ejercicios.

---

## Criterios de Aceptacion

### Escenario 1: Ganar XP por ejercicio completado
**Given** un estudiante que acaba de completar un ejercicio con score de 85/100
**When** el sistema procesa el resultado
**Then** calcula XP: base_xp (20) * difficulty_multiplier (1.5) * (85/100) * streak_bonus (1.1) = 28 XP
**And** muestra animacion de XP ganado
**And** actualiza la barra de progreso hacia siguiente nivel
**And** registra transaccion de XP inmutable

### Escenario 2: Promover de rango
**Given** un estudiante con rango "Nacom" (1,000-4,999 XP) que tiene 4,950 XP
**When** gana 100 XP por un ejercicio
**Then** el sistema detecta que alcanzo 5,050 XP (threshold de Batab)
**And** muestra animacion especial de promocion de rango
**And** otorga recompensa de promocion (200 ML Coins + badge "Batab")
**And** envia notificacion push y in-app
**And** actualiza leaderboard con nuevo rango

### Escenario 3: Racha de dias consecutivos
**Given** un estudiante que ha completado al menos 1 ejercicio por dia durante 7 dias
**When** completa un ejercicio en el dia 7
**Then** el multiplicador de racha sube a 1.25x
**And** muestra indicador visual de racha activa ("7 dias seguidos!")
**And** otorga logro "Racha de 7 dias" si es la primera vez

---

## Definition of Done

- [ ] XP se calcula correctamente con todos los multiplicadores
- [ ] Transacciones XP son inmutables (audit trail)
- [ ] Promocion de rango funciona para los 5 niveles
- [ ] Animaciones de XP y promocion implementadas
- [ ] Notificaciones push y in-app al promover
- [ ] Racha se calcula y aplica correctamente
- [ ] Limite diario de XP funciona (anti-abuse)
- [ ] Tests unitarios para XPCalculator y RankChecker
