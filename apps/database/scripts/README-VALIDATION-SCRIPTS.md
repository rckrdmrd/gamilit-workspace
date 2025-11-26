# Scripts de Validación de Integridad - GAMILIT Database

**Fecha:** 2025-11-24
**Mantenido por:** Database-Agent
**Propósito:** Scripts para validar y mantener la integridad de datos de XP y ML Coins

---

## 📋 Scripts Disponibles

### 1. `quick-validate-xp.sql`

**Descripción:** Validación rápida (30 segundos) para detectar problemas de integridad en XP.

**Uso:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -f scripts/quick-validate-xp.sql
```

**Salida esperada (sistema saludable):**
```
1. Intentos con score > 0 pero xp_earned = 0:
   intentos_problematicos = 0

2. Usuarios con discrepancias:
   usuarios_con_discrepancias = 0

3. Estado de integridad:
   estado = "✅ INTEGRIDAD OK"
```

**Frecuencia recomendada:** Diaria o después de cada deployment

---

### 2. `validate-xp-integrity.sql`

**Descripción:** Validación completa (2-3 minutos) con reporte detallado de todos los aspectos de integridad.

**Uso:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -f scripts/validate-xp-integrity.sql
```

**Validaciones incluidas:**
1. Intentos con score > 0 pero xp_earned = 0
2. Usuarios con discrepancias entre attempts y user_stats
3. Intentos donde xp_earned no coincide con la fórmula esperada
4. User stats sin attempts registrados
5. Resumen general del sistema

**Frecuencia recomendada:** Semanal o cuando se detecten anomalías

---

### 3. `fix-historical-xp-ml-coins-v2.sql`

**Descripción:** Script de corrección automática de datos históricos (solo si se detectan problemas).

**⚠️ ADVERTENCIA:** Solo ejecutar si `quick-validate-xp.sql` reporta problemas.

**Uso:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -f scripts/fix-historical-xp-ml-coins-v2.sql

# Revisar output cuidadosamente antes de confirmar
# Si todo se ve bien, ejecutar en otra sesión:
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -c "COMMIT;"
```

**Acciones que realiza:**
1. Deshabilita trigger `trg_check_rank_promotion_on_xp_gain`
2. Corrige `xp_earned` y `ml_coins_earned` en `exercise_attempts`
3. Recalcula `user_stats` basado en suma de attempts
4. Rehabilita trigger
5. Valida integridad final

**Frecuencia recomendada:** Solo cuando sea necesario (no es una tarea periódica)

---

## 🔍 Interpretación de Resultados

### Estado: ✅ INTEGRIDAD OK

Todo funciona correctamente. No se requiere acción.

### Estado: ❌ HAY PROBLEMAS

**Pasos a seguir:**

1. **Ejecutar validación completa:**
   ```bash
   psql -d gamilit_platform -f scripts/validate-xp-integrity.sql
   ```

2. **Analizar reporte detallado:**
   - ¿Cuántos intentos afectados?
   - ¿Cuántos usuarios tienen discrepancias?
   - ¿Cuál es la magnitud del problema?

3. **Si hay pocos casos aislados (< 5 usuarios):**
   - Ejecutar script de corrección automática
   - Revisar logs antes de confirmar
   - Validar resultado

4. **Si hay muchos casos (> 5 usuarios):**
   - NO ejecutar script automático
   - Investigar la causa raíz
   - Consultar con Database-Agent o Tech Lead

---

## 📊 Fórmulas de XP y ML Coins

### XP Earned
```sql
xp_earned = GREATEST(0, score - (hints_used * 10))
```

**Ejemplos:**
- Score: 100, hints: 0 → XP: 100
- Score: 100, hints: 2 → XP: 80
- Score: 50, hints: 10 → XP: 0 (no negativo)

### ML Coins Earned
```sql
ml_coins_earned = GREATEST(0, FLOOR(score / 10) - (comodines_used * 2))
```

**Ejemplos:**
- Score: 100, comodines: 0 → ML Coins: 10
- Score: 100, comodines: 2 → ML Coins: 6
- Score: 50, comodines: 0 → ML Coins: 5

---

## 🚨 Problemas Comunes

### 1. Intentos con xp_earned = 0

**Causa:** Bug en el código que crea el attempt sin calcular XP.

**Solución:** Ejecutar script de corrección automática.

**Prevención:** Agregar validación en backend antes de insertar attempt.

### 2. Discrepancia entre attempts y user_stats

**Causa:** Trigger `update_user_stats_on_exercise_complete` no se ejecutó correctamente.

**Solución:** Recalcular user_stats con script de corrección.

**Prevención:** Monitorear logs de triggers.

### 3. Fórmulas inconsistentes

**Causa:** Cambio en lógica de negocio sin migración de datos históricos.

**Solución:** Decidir si mantener datos históricos o migrar.

**Prevención:** Documentar cambios en fórmulas.

---

## 📝 Historial de Correcciones

### 2025-11-24: Corrección inicial de datos históricos

- **Usuario afectado:** `85a2d456-a07d-4be9-b9ce-4a46b183a2a0`
- **Intentos corregidos:** 1
- **XP recuperado:** +600 XP (500 → 1100)
- **ML Coins recuperados:** +90 ML Coins (220 → 310)
- **Bug adicional:** Corregida función `promote_to_next_rank()`

**Ver detalles completos:**
- `/apps/database/REPORTE-CORRECCION-XP-ML-COINS-2025-11-24.md`
- `/apps/database/RESUMEN-EJECUTIVO-CORRECCION-XP-2025-11-24.md`

---

## 🔗 Referencias

- **Política DDL-First:** `/orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md`
- **Traza de tareas:** `/orchestration/trazas/TRAZA-TAREAS-DATABASE.md`
- **Prompt Database-Agent:** `/orchestration/prompts/PROMPT-DATABASE-AGENT.md`

---

## 📞 Contacto

**Mantenido por:** Database-Agent
**Última actualización:** 2025-11-24

Para preguntas o problemas, consultar:
1. Documentación en `/apps/database/docs/`
2. Trazas en `/orchestration/trazas/`
3. Tech Lead del proyecto GAMILIT

---

**FIN DEL README**
