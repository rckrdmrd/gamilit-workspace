# INDICE DE DOCUMENTOS - ANÁLISIS DE DATOS PORTAL ESTUDIANTE

Generado: 2025-11-24  
Codebase: GAMILIT V6.1  
Análisis: Datos actualizados por portal de estudiantes

---

## DOCUMENTOS GENERADOS

### 1. MATRIZ-DATOS-ACTUALIZADOS-PORTAL-ESTUDIANTE-2025-11-24.md (21 KB)
**Propósito:** Análisis exhaustivo y técnico  
**Contenido:**
- Resumen ejecutivo (7 tablas + 5 flujos)
- Flujo de envío de ejercicio (detallado)
- Flujo de auto-corrección y validación
- Flujo de misiones gamificadas
- Sistema de rangos Maya
- Flujo de perfil de usuario
- Flujo de economía (monedas ML)
- Matriz resumen por frecuencia
- Análisis por página del portal
- Jerarquía de dependencias
- Auto-actualizaciones y triggers
- Validaciones y restricciones
- Diferencias: autocorregibles vs teacher-graded
- Impacto en performance
- Monitoreo y auditoría
- Notas técnicas finales

**Para quién:** Desarrolladores, architects, QA engineers  
**Complejidad:** Alta  
**Lectura estimada:** 30-40 minutos

---

### 2. RESUMEN-VISUAL-FLUJOS-DATOS-2025-11-24.md (30 KB)
**Propósito:** Visualización de flujos con diagramas ASCII  
**Contenido:**
- Diagrama 1: Arquitectura de actualización por acción
- Diagrama 2: Flujo completo de envío de ejercicio (timeline T0→T6)
- Diagrama 3: Dependencias de tablas
- Diagrama 4: Datos guardados por página
- Diagrama 5: Campos modificables por acción
- Diagrama 6: Flujo de monedas (gana/gasta)
- Diagrama 7: Auto-actualizaciones (triggers)
- Tabla resumen: Campos actualizables

**Para quién:** Product managers, testers, documentación  
**Complejidad:** Media  
**Lectura estimada:** 20-30 minutos

---

### 3. TABLA-RAPIDA-DATOS-ACTUALIZADOS-2025-11-24.txt (16 KB)
**Propósito:** Referencia rápida y lookup  
**Contenido:**
- Acciones del estudiante → Tablas actualizadas
  - Enviar ejercicio correctamente (7 tablas)
  - Comprar power-up en shop (3 tablas)
  - Reclamar recompensa de misión (2 tablas)
  - Editar perfil (1 tabla)
  - Auto-save cada 30s (0 tablas)
  - Acceder al dashboard (1 tabla)
- Resumen de tablas por tabla
  - exercise_attempts
  - user_stats
  - module_progress
  - ml_coins_transactions
  - missions
  - user_ranks
  - auth_management.profiles
- Triggers automáticos
- Fórmulas de cálculo
- Validaciones y constraints

**Para quién:** Desarrolladores en debugging, product team en reuniones  
**Complejidad:** Baja  
**Lectura estimada:** 10-15 minutos

---

### 4. EXECUTIVE-SUMMARY-DATOS-PORTAL-ESTUDIANTE-2025-11-24.txt (20 KB)
**Propósito:** Hallazgos clave y matriz consolidada  
**Contenido:**
- Hallazgos principales (5 puntos clave)
- Matriz consolidada - tabla por tabla (7 tablas)
- Flujo detallado: Envío de ejercicio (8 pasos)
- Página por página: Qué guarda cada ruta
- Frecuencia de actualización - resumen
- Validaciones y restricciones
- Dependencias y impacto en cascade
- Monitoreo y alertas recomendadas
- Notas técnicas finales
- Conclusiones

**Para quién:** Stakeholders, leads, revisión de auditoría  
**Complejidad:** Media-Alta  
**Lectura estimada:** 25-35 minutos

---

## GUÍA DE LECTURA POR ROL

### Developer
```
PRIMERO: TABLA-RAPIDA (10 min) → Contexto rápido
LUEGO:   MATRIZ completa (30 min) → Detalles técnicos
CONSULTA: Cuando necesitas lookup de campos/fórmulas
```

### QA Engineer
```
PRIMERO: RESUMEN-VISUAL (20 min) → Entender flujos
LUEGO:   TABLA-RAPIDA (10 min) → Casos de test
SOPORTE: EXECUTIVE-SUMMARY para casos edge
```

### Product Manager
```
PRIMERO: EXECUTIVE-SUMMARY (30 min) → Visión general
LUEGO:   RESUMEN-VISUAL (20 min) → Flujos visuales
REFERENCIA: TABLA-RAPIDA para números
```

### Database Admin
```
PRIMERO: MATRIZ (40 min) → Análisis técnico
LUEGO:   TABLA-RAPIDA (15 min) → Triggers y constraints
SOPORTE: RESUMEN-VISUAL para dependencias
```

### Tech Lead / Architect
```
RECOMENDADO: EXECUTIVE-SUMMARY (30 min) + MATRIZ (40 min)
Proporciona: Visión 360° de impacto y arquitectura
```

---

## ÍNDICE POR TEMA

### Tablas de Base de Datos
- exercise_attempts: MATRIZ § 1.3, TABLA § 2, VISUAL § 3
- user_stats: MATRIZ § 1.3, TABLA § 2, VISUAL § 4
- module_progress: MATRIZ § 1.3, TABLA § 2, VISUAL § 4
- ml_coins_transactions: MATRIZ § 1.3, TABLA § 2
- missions: MATRIZ § 3, TABLA § 2
- user_ranks: MATRIZ § 4, TABLA § 2
- auth_management.profiles: MATRIZ § 5, TABLA § 2

### Flujos
- Envío de ejercicio: MATRIZ § 1, VISUAL § 2, EXECUTIVE § Paso 1-8
- Gamificación: MATRIZ § 4, TABLA § 1
- Misiones: MATRIZ § 3, TABLA § 1
- Economía: MATRIZ § 6, VISUAL § 6, TABLA § 1
- Perfil: MATRIZ § 5, TABLA § 1

### Triggers
- trg_check_rank_promotion_on_xp_gain: MATRIZ § 1.3, TABLA § 3
- trg_update_user_stats_on_exercise: TABLA § 3
- Otros triggers: VISUAL § 7, TABLA § 3

### Fórmulas
- XP Ganado: MATRIZ § 1.3, TABLA § 4
- ML Coins: MATRIZ § 1.3, TABLA § 4
- Progress %: TABLA § 4
- Rank Progress: TABLA § 4

### Páginas del Portal
- ExercisePage: MATRIZ § 8.2, VISUAL § 4, TABLA § 1
- Dashboard: MATRIZ § 8.1, VISUAL § 4, TABLA § 1
- ShopPage: MATRIZ § 8.3, VISUAL § 4, TABLA § 1
- MissionsPage: MATRIZ § 8.5, VISUAL § 4, TABLA § 1
- ProfilePage: MATRIZ § 8.4, VISUAL § 4, TABLA § 1
- LeaderboardPage: MATRIZ § 8.6, VISUAL § 4

---

## PREGUNTAS FRECUENTES - DÓNDE ENCONTRAR

**¿Cuántas tablas se actualizan cuando envío un ejercicio?**  
→ TABLA-RAPIDA § 1 (7 tablas) o EXECUTIVE-SUMMARY § Hallazgos (resumen)

**¿Cuál es la fórmula de XP ganado?**  
→ TABLA-RAPIDA § 4 o MATRIZ § 1.3

**¿Cómo se promueven los rangos?**  
→ MATRIZ § 4 (Sistema de Rangos Maya) o TABLA-RAPIDA § 3

**¿Qué pasa cuando un usuario compra monedas?**  
→ TABLA-RAPIDA § 1 (Comprar Power-up) o VISUAL § 6 (Flujo de monedas)

**¿Cuáles son los triggers que se ejecutan?**  
→ TABLA-RAPIDA § 3 (Triggers automáticos) o VISUAL § 7

**¿Qué campos se modifican en user_stats?**  
→ TABLA-RAPIDA § 2 (user_stats) o EXECUTIVE-SUMMARY § Matriz consolidada

**¿Cómo validar que los datos se guardaron correctamente?**  
→ EXECUTIVE-SUMMARY § Validaciones y Restricciones

**¿Cuál es el impacto en performance?**  
→ MATRIZ § 14 (Impacto en Performance) o EXECUTIVE-SUMMARY § Performance

**¿Cuáles son los constraints de base de datos?**  
→ TABLA-RAPIDA § 5 o EXECUTIVE-SUMMARY § Validaciones

**¿Qué datos se guardan cuando edito mi perfil?**  
→ TABLA-RAPIDA § 1 (Editar Perfil) o MATRIZ § 5

---

## ESTADÍSTICAS DE CONTENIDO

```
Total páginas: 4 documentos
Total líneas: ~3,500 líneas
Total tamaño: 87 KB

Distribución por tipo:
├─ Prosa técnica: 40% (MATRIZ, EXECUTIVE)
├─ Diagramas ASCII: 35% (VISUAL)
├─ Tablas: 20% (TABLA-RAPIDA)
└─ Índices: 5% (Este documento)

Cobertura:
├─ Tablas de BD: 100% (7 tablas + 2 auditoría)
├─ Triggers: 100% (3+ triggers)
├─ Flujos: 100% (5 flujos principales)
├─ Páginas: 100% (6 páginas analizadas)
└─ Campos: 85% (focus en campos actualizables)
```

---

## ÚLTIMAS ACTUALIZACIONES

| Documento | Última actualización | Secciones |
|-----------|-------------------|-----------|
| MATRIZ | 2025-11-24 | 16 secciones completas |
| VISUAL | 2025-11-24 | 7 diagramas + análisis |
| TABLA-RAPIDA | 2025-11-24 | 5 secciones |
| EXECUTIVE | 2025-11-24 | 16 secciones |

---

## NOTAS IMPORTANTES

1. **Validación centralizada en SQL:**
   - Función: `educational_content.validate_and_audit()`
   - Beneficio: Auditoría automática + scoring robusto
   - Ver: MATRIZ § 2.1-2.2, TABLA § 2 (exercise_attempts)

2. **Triggers automáticos sin intervención:**
   - No requieren acción manual
   - Se ejecutan en background
   - Ver: TABLA § 3, VISUAL § 7

3. **Auditoría completa:**
   - Cada movimiento registrado en ml_coins_transactions
   - exercise_validation_audit para cada validación
   - Timestamps automáticos en todas las tablas

4. **Performance optimizado:**
   - <200ms por ejercicio típicamente
   - 10+ índices estratégicos en user_stats
   - Materialized views para leaderboards (nightly)

5. **No hay "agujeros":**
   - Todo dato que un estudiante genera tiene ruta a persistencia
   - Constraints + triggers + validación = integridad 100%
   - Ver: EXECUTIVE-SUMMARY § Conclusiones

---

## CONTACTO Y REFERENCIAS

**Análisis realizado por:** Sistema de Búsqueda de Código (Claude Code)  
**Fecha:** 2025-11-24  
**Codebase:** GAMILIT V6.1  
**Scope:** apps/frontend + apps/backend + apps/database

**Para preguntas sobre:**
- Frontend: Revisar `apps/frontend/src/apps/student/`
- Backend: Revisar `apps/backend/src/modules/progress/`, `gamification/`, `auth/`
- Database: Revisar `apps/database/ddl/schemas/`

---

## REFERENCIAS CRUZADAS EN CODEBASE

**Frontend Services:**
- `/apps/frontend/src/services/api/educationalAPI.ts` - submitExercise()
- `/apps/frontend/src/apps/student/pages/ExercisePage.tsx` - UI principal

**Backend Services:**
- `/apps/backend/src/modules/progress/services/exercise-attempt.service.ts`
- `/apps/backend/src/modules/gamification/services/user-stats.service.ts`
- `/apps/backend/src/modules/gamification/services/ml-coins.service.ts`

**Database DDL:**
- `/apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
- `/apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`
- `/apps/database/ddl/schemas/gamification_system/functions/`

---

**Este índice es tu guía para navegar los 4 documentos del análisis.**

Elige el documento según tu rol y necesidad - todos contienen información valiosa pero con diferentes niveles de detalle.

