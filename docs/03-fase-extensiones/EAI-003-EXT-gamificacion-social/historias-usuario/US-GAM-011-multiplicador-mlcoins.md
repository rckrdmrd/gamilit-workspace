---
id: "US-GAM-011"
title: "Multiplicador ML Coins por Rango"
type: "User Story"
status: "Backlog"
priority: "P1"
assignee: "@Backend-Agent"
epic: "EAI-003-EXT"
story_points: 5
sprint: "Sprint 9"
labels: ["gamification", "ml_coins", "ranks"]
created_date: "2026-01-17"
updated_date: "2026-01-17"
previous_id: "US-GAM-001"
---

# US-GAM-011: Multiplicador ML Coins por Rango

> **NOTA:** Este archivo fue renombrado de US-GAM-001 a US-GAM-011 para resolver
> conflicto de ID duplicado. El ID original US-GAM-001 pertenece a
> "Sistema de Rangos Maya" en EAI-003.

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-011 |
| **Epica** | EAI-003-EXT - Gamificacion Social |
| **Modulo** | gamification_system |
| **Prioridad** | P1 |
| **Story Points** | 5 |
| **Sprint** | Sprint 9 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent |

---

### Historia de Usuario

**Como** estudiante avanzado con rango alto,
**quiero** ganar mas ML Coins por completar actividades,
**para** sentir que mi progreso es recompensado proporcionalmente.

### Descripcion Detallada

Implementar el sistema de multiplicadores de ML Coins basado en el rango del estudiante segun la documentacion v6.1. Cada rango Maya tiene un multiplicador diferente que incrementa las recompensas de ML Coins obtenidas.

**Tabla de Multiplicadores (v6.1):**

| Rango | Nombre | Multiplicador |
|-------|--------|---------------|
| 1 | Semilla de Cacao | 1.0x |
| 2 | Recolector de Frutos | 1.1x |
| 3 | Artesano de Palabras | 1.2x |
| 4 | Escriba del Pueblo | 1.3x |
| 5 | Guardian de Historias | 1.4x |
| 6 | Sabio del Consejo | 1.5x |
| 7 | Chamán de las Letras | 1.6x |
| 8 | Señor del Conocimiento | 1.7x |
| 9 | Gran Sacerdote | 1.8x |
| 10 | K'uk'ulkan | 2.0x |

---

### Criterios de Aceptacion

**Escenario 1: Aplicar multiplicador a recompensas de ejercicios**
```gherkin
DADO que soy un estudiante con rango "Guardian de Historias" (rango 5)
Y el multiplicador de mi rango es 1.4x
CUANDO completo un ejercicio que otorga 100 ML Coins base
ENTONCES recibo 140 ML Coins (100 * 1.4)
Y veo mensaje: "+140 ML Coins (x1.4 bonus por rango)"
```

**Escenario 2: Aplicar multiplicador a recompensas de misiones**
```gherkin
DADO que soy un estudiante con rango "K'uk'ulkan" (rango 10)
Y el multiplicador de mi rango es 2.0x
CUANDO completo una mision diaria que otorga 50 ML Coins base
ENTONCES recibo 100 ML Coins (50 * 2.0)
Y la transaccion se registra con detalle del bonus
```

**Escenario 3: Actualizacion de multiplicador al subir de rango**
```gherkin
DADO que subo de rango de "Escriba del Pueblo" (1.3x) a "Guardian de Historias" (1.4x)
CUANDO completo mi siguiente actividad
ENTONCES el nuevo multiplicador 1.4x se aplica inmediatamente
Y recibo notificacion: "Nuevo multiplicador x1.4 activo!"
```

### Criterios Adicionales

- [ ] Multiplicador se calcula en tiempo real (no cache)
- [ ] Transacciones guardan multiplicador aplicado para auditoria
- [ ] Multiplicador visible en perfil del usuario
- [ ] No aplica a compras/transferencias, solo a ganancias

---

### Tareas Tecnicas

**Database:**
- [ ] DB-GAM-011-A: Agregar columna `current_multiplier` a `user_stats`
- [ ] DB-GAM-011-B: Crear funcion `calculate_rank_multiplier(rank_id)`
  ```sql
  CREATE FUNCTION calculate_rank_multiplier(rank_id INTEGER)
  RETURNS DECIMAL(3,1) AS $$
  BEGIN
    RETURN CASE rank_id
      WHEN 1 THEN 1.0
      WHEN 2 THEN 1.1
      -- ... etc
      WHEN 10 THEN 2.0
      ELSE 1.0
    END;
  END;
  $$ LANGUAGE plpgsql;
  ```

**Backend:**
- [ ] BE-GAM-011-A: Modificar `ExerciseRewardsService.claimRewards()` para aplicar multiplicador
- [ ] BE-GAM-011-B: Modificar `MissionClaimService.claimReward()` para aplicar multiplicador
- [ ] BE-GAM-011-C: Agregar campo `multiplier_applied` a `MLCoinTransactionDto`
- [ ] BE-GAM-011-D: Crear endpoint GET `/users/me/multiplier`

**Frontend:**
- [ ] FE-GAM-011-A: Mostrar multiplicador actual en perfil de usuario
- [ ] FE-GAM-011-B: Mostrar bonus en toast de recompensas
- [ ] FE-GAM-011-C: Agregar tooltip explicando multiplicador por rango

---

### Definition of Done

- [ ] Multiplicador calculado correctamente para todos los rangos
- [ ] Transacciones registran multiplicador aplicado
- [ ] Tests unitarios para calculo de multiplicador
- [ ] UI muestra bonus claramente
- [ ] Documentacion actualizada

---

**Creada por:** Requirements-Analyst
**Fecha:** 2026-01-17
