# ADR-004: Gamification System Design

**Fecha:** 2025-10-28
**Estado:** ✅ Aceptado
**Autores:** Product Owner, Game Designer, Backend Lead
**Impacto:** Alto - Core educational engagement system

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-003: Resolver ejercicio](../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md) - Ganancia de XP y ML Coins
- [UC-STU-004: Ver progreso](../../01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md) - Visualización de rangos y stats
- [UC-STU-007: Ver ranking](../../01-requerimientos/casos-uso/student/UC-STU-007-ver-ranking.md) - Leaderboards y competencia

**User Stories:**
- [US-GAM-001: Sistema de rangos Maya](../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-001-sistema-rangos-maya.md) - 5 rangos progresivos
- [US-GAM-002: Sistema de ML Coins](../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-002-sistema-ml-coins.md) - Economía virtual
- [US-GAM-003: Sistema de logros](../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-003-sistema-logros.md) - 50+ achievements
- [US-GAM-004: Power-ups y comodines](../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-004-powerups-comodines.md) - Pistas, Visión Lectora, Segunda Oportunidad
- [US-GAM-005: Leaderboards y competencia](../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-005-leaderboards-competencia.md) - Rankings por contexto

**Épicas:**
- [EAI-002: Gamificación](../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/_MAP.md) - 130 SP, $47,850 MXN

**Requerimientos funcionales:**
- Sistema de gamificación balanceado con temática cultural Maya
- Economía virtual cerrada (ML Coins): no pay-to-win, solo earned
- Rangos Maya: 5 niveles con significado histórico pedagógico
- PowerUps estratégicos: ayudan sin regalar respuestas
- Achievements: 50+ logros en 7 categorías
- Streaks: Incentivo de consistencia diaria
- Principios: Learning-First, Fair Progression, Teacher Visibility

**ADRs relacionados:**
- [ADR-001: Email Verification Removal](./ADR-001-email-verification-removal.md) - Onboarding simplificado para estudiantes
- [ADR-002: JWT Security Implementation](./ADR-002-jwt-security-implementation.md) - Autenticación en APIs de gamificación
- [ADR-003: RLS vs App-Layer Authorization](./ADR-003-rls-vs-app-layer-authorization.md) - Seguridad multi-tenant de stats
- [ADR-005: Multi-Tenancy Implementation](./ADR-005-multi-tenancy-implementation.md) - Aislamiento entre escuelas/leaderboards

**Especificaciones técnicas relacionadas:**
- [GAMIFICATION-API.md](../apis/GAMIFICATION-API.md) - API completa (32 endpoints)
- [gamificacion-api/01-RANGOS-MAYA.md](../apis/gamificacion-api/01-RANGOS-MAYA.md) - Sistema de rangos
- [gamificacion-api/02-ML-COINS.md](../apis/gamificacion-api/02-ML-COINS.md) - Economía ML Coins
- [gamificacion-api/03-ACHIEVEMENTS.md](../apis/gamificacion-api/03-ACHIEVEMENTS.md) - Sistema de logros
- [gamificacion-api/04-POWER-UPS.md](../apis/gamificacion-api/04-POWER-UPS.md) - PowerUps
- [gamificacion-api/05-LEADERBOARDS.md](../apis/gamificacion-api/05-LEADERBOARDS.md) - Rankings

---

## Contexto

GAMILIT es una plataforma educativa dirigida a estudiantes de educación primaria y secundaria (8-14 años) en el contexto mexicano. El sistema requiere mecanismos de engagement que:

1. **Motiven el aprendizaje continuo** sin convertirse en distracción del contenido educativo
2. **Integren elementos culturales relevantes** para el contexto mexicano (civilización Maya)
3. **Proporcionen feedback inmediato** y visible del progreso del estudiante
4. **Fomenten la competencia saludable** entre pares sin crear presión excesiva
5. **Sean monitoreables por maestros** para intervención pedagógica oportuna
6. **Eviten monetización** (no pay-to-win, no microtransacciones con dinero real)

**Restricciones:**
- Sistema multi-tenant (múltiples escuelas/organizaciones)
- Base de usuarios: estudiantes supervisados por instituciones educativas
- Contexto de uso: aulas, tareas en casa, aprendizaje autodirigido
- Dispositivos: web browsers (desktop, tablet, mobile)

---

## Problema

**¿Cómo diseñar un sistema de gamificación que mejore el engagement educativo sin convertirse en una distracción del aprendizaje?**

### Desafíos Específicos:

1. **Balance engagement vs aprendizaje:**
   - Riesgo: Estudiantes enfocados en "ganar puntos" en lugar de aprender
   - Necesidad: Recompensas alineadas con objetivos pedagógicos

2. **Economía virtual sostenible:**
   - Riesgo: Inflación de moneda virtual, desequilibrio económico
   - Necesidad: Sistema balanceado de earn/sink con límites

3. **Progresión significativa:**
   - Riesgo: Niveles arbitrarios sin relación con aprendizaje real
   - Necesidad: Progresión basada en dominio de contenido

4. **Equidad y accesibilidad:**
   - Riesgo: Ventajas por tiempo disponible (no todos tienen mismo acceso)
   - Necesidad: Límites diarios, nivelación por contexto (aula, escuela)

5. **Integración cultural:**
   - Riesgo: Temática genérica sin relevancia educativa
   - Necesidad: Sistema de rangos con valor pedagógico (historia Maya)

---

## Alternativas Consideradas

### Opción 1: Sistema de Puntos Simple (Points-Only)

**Descripción:** Solo puntos por ejercicios completados, leaderboard básico.

**Pros:**
- Simplicidad extrema en implementación (2-3 semanas)
- Bajo costo de mantenimiento
- Fácil de entender para usuarios

**Contras:**
- Engagement limitado (monotonía rápida)
- Sin elementos culturales diferenciadores
- No permite economía interna (no hay qué gastar)
- Pobre valor pedagógico

**Decisión:** ❌ Rechazada - Insuficiente para objetivos de engagement a largo plazo

---

### Opción 2: Sistema Completo Tipo Videojuego (Full Game Mechanics)

**Descripción:** Sistema complejo con clases, habilidades, equipo, inventario, quests narrativas, PvP.

**Pros:**
- Engagement máximo (muy adictivo)
- Diferenciación de mercado muy fuerte
- Rejugabilidad infinita

**Contras:**
- Complejidad extrema (6+ meses de desarrollo)
- Riesgo ALTO de distracción del aprendizaje
- Costo de balanceo continuo (game designer full-time)
- Difícil de monitorear para maestros (demasiados sistemas)
- Posible adicción no saludable

**Decisión:** ❌ Rechazada - Complejidad excesiva, riesgo de distracción

---

### Opción 3: Sistema Balanceado con Temática Maya (SELECCIONADA)

**Descripción:** Sistema de gamificación moderado con:
- Economía virtual (ML Coins)
- Rangos progresivos temáticos (Maya)
- PowerUps estratégicos (no esenciales)
- Achievements educativos
- Leaderboards por contexto
- Streaks/rachas

**Pros:**
- Balance óptimo engagement/aprendizaje (60/40)
- Valor educativo cultural (historia Maya)
- Complejidad manejable (3 meses inicial)
- Monitoreable por maestros (dashboards claros)
- Economía controlable (sin monetización real)
- Extensible (se pueden agregar features)

**Contras:**
- Complejidad media de implementación
- Requiere balanceo inicial de economía
- Necesita mantenimiento continuo (tuning)

**Decisión:** ✅ Aceptada - Mejor balance costo/beneficio/riesgo

---

## Decisión

**Implementar sistema de gamificación balanceado con temática Maya** compuesto por:

1. **XP (Experience Points)** - Métrica de progreso educativo
2. **Rangos Maya (5 niveles)** - Progresión temática con significado cultural
3. **ML Monedas** - Economía virtual cerrada (earned, not purchased)
4. **PowerUps (3 tipos)** - Ayudas estratégicas opcionales
5. **Logros (50+ achievements)** - Objetivos secundarios educativos
6. **Racha (Streak)** - Incentivo de consistencia diaria

---

## Componentes del Sistema

### 1. XP (Experience Points)

**Propósito:** Métrica principal de progreso educativo del estudiante.

**Características:**
- **Rango:** 0 → infinito
- **Ganancia:** Por completar ejercicios, módulos, logros, eventos
- **Pérdida:** No se puede perder XP (solo gana)
- **Niveles:** XP se traduce a niveles (1-50+)

**Fórmula de Ganancia:**
```
XP_total = XP_base × mult_difficulty × mult_rank × mult_streak × bonus_perfect × bonus_speed

Donde:
- XP_base: 50 (por ejercicio)
- mult_difficulty: 1.0x (easy), 1.5x (medium), 2.0x (hard), 2.5x (expert)
- mult_rank: 1.0x - 2.0x (según rango Maya)
- mult_streak: 1 + min(streak_days, 30) × 0.01 (max 1.3x)
- bonus_perfect: 1.5x si 100% correcto
- bonus_speed: 1.1x si completa en <60% del tiempo
```

**Ejemplo:**
```
Ejercicio difícil (hard) completado por estudiante rango "Ah K'in" (1.5x)
con racha de 12 días, puntuación perfecta, en 5 minutos (límite 10 min):

XP = 50 × 2.0 × 1.5 × 1.12 × 1.5 × 1.1
   = 277 XP
```

**Progresión de Niveles:**
```
Nivel 1:  0 - 999 XP
Nivel 2:  1,000 - 2,499 XP
Nivel 3:  2,500 - 4,499 XP
Nivel 4:  4,500 - 7,499 XP
Nivel 5:  7,500 - 11,499 XP
...
Nivel 50: 500,000+ XP
```

---

### 2. Rangos Maya (5 Tiers)

**Propósito:** Sistema de progresión temática que enseña sobre civilización Maya mientras motiva avance.

**Rangos Definidos:**

| Rango | Nombre Maya | Traducción | XP Req. | Módulos | Multiplier | Bonus ML |
|-------|-------------|------------|---------|---------|------------|----------|
| 1 | **Ajaw** | Señor/Gobernante | 0 | 1 | 1.0x | 50 |
| 2 | **Nacom** | Capitán de Guerra | 1,000 | 2 | 1.25x | 75 |
| 3 | **Ah K'in** | Sacerdote del Sol | 3,000 | 3 | 1.5x | 100 |
| 4 | **Halach Uinic** | Hombre Verdadero | 6,000 | 4 | 1.75x | 125 |
| 5 | **K'uk'ulkan** | Serpiente Emplumada | 10,000 | 5 | 2.0x | 150 |

**Significado Cultural (Valor Pedagógico):**

Cada rango incluye:
- **Contexto histórico** (quién era en sociedad Maya)
- **Responsabilidades** (qué hacían)
- **Habilidades especiales** (temáticas en plataforma)
- **Simbolismo visual** (iconografía Maya auténtica)

**Requisitos de Promoción:**

Para avanzar al siguiente rango, el estudiante debe cumplir **TODOS** los requisitos:
- ✅ XP mínimo requerido
- ✅ Módulos completados
- ✅ Puntuación promedio ≥ 70%
- ✅ Sin penalizaciones activas

**Beneficios por Rango:**
1. **Multiplicador permanente** aplicado a todas las ganancias de XP/Coins
2. **Bonus de ML Monedas** al momento de promoción
3. **Desbloqueo de contenido** (módulos avanzados)
4. **Insignia visual** en perfil y leaderboards
5. **Acceso a PowerUps avanzados** (rangos altos)

**Ejemplo de Progreso:**
```
Estudiante "Ana" (8 años):
- Inicia: Rango Ajaw (1.0x multiplier)
- Completa 5 módulos, alcanza 1,200 XP
- Promovida a Nacom
- Recibe: +100 ML Coins bonus
- Nuevo multiplier: 1.25x en todas las actividades
```

---

### 3. ML Monedas (In-Game Currency)

**Propósito:** Economía virtual cerrada para compra de PowerUps y personalización.

**Características:**
- **Nombre:** ML Monedas (ML Coins)
- **Abreviación:** ML
- **Símbolo:** 🪙
- **Obtención:** Solo mediante actividades educativas (no se compra con dinero real)
- **Uso:** PowerUps, personalizaciones, gifts a amigos

**Fuentes de Ingreso:**

| Fuente | ML Coins | Frecuencia |
|--------|----------|------------|
| Ejercicio completado | 15 base | Por ejercicio |
| Módulo completado | 50 | Por módulo |
| Logro desbloqueado | 25-200 | Por logro |
| Racha diaria | 5 × días | Diario |
| Login diario | 10 | Diario |
| Promoción de rango | 50-1,000 | Por promoción |
| Top 10 semanal | 100-500 | Semanal |
| Evento especial | Variable | Ocasional |

**Fórmula de Ganancia:**
```
ML_total = (ML_base + diff_bonus) × mult_rank × bonus_perfect × bonus_speed × penalty_powerups

Donde:
- ML_base: 15 (por ejercicio)
- diff_bonus: +0 (easy), +5 (medium), +10 (hard), +20 (expert)
- mult_rank: 1.0x - 2.5x (según rango)
- bonus_perfect: 1.5x si 100%
- bonus_speed: 1.1x si <60% tiempo
- penalty_powerups: 0.9x por cada PowerUp usado (min 0.5x)
```

**Gastos (Sinks):**

| Gasto | Costo ML | Descripción |
|-------|----------|-------------|
| Pista (Hint) | 15 | Ayuda en ejercicio actual |
| Visión Lectora | 25 | Resalta palabras clave |
| Segunda Oportunidad | 40 | Reintento sin penalización |
| Personalización Avatar | 50-200 | Cosméticos |
| Regalo a Amigo | 10+ | Transferencia entre estudiantes |

**Control de Inflación:**

Para mantener economía saludable:
- **Límite diario:** Máximo 500 ML ganables por día
- **Límite semanal:** Máximo 2,000 ML ganables por semana
- **Decay pasivo:** -1% de balance si inactivo >30 días
- **Ajuste dinámico:** Sistema monitorea inflación mensual (target: 3%)

**Métricas de Salud Económica:**
```
Inflación mensual = (Supply_actual - Supply_anterior) / Supply_anterior × 100
Target: 2-4%

Velocity = Transacciones_totales / Supply_total
Target: 0.8 - 1.2

Gini Coefficient (desigualdad): Target < 0.45
```

---

### 4. PowerUps (3 Tipos)

**Propósito:** Herramientas estratégicas opcionales que ayudan sin ser esenciales para aprendizaje.

**Principio de Diseño:** "Help, not cheat" - PowerUps facilitan, pero no regalan respuestas.

#### 4.1 Pistas (Hints)

**Costo:** 15 ML Coins
**Efecto:** Revela una pista contextual sobre el ejercicio
**Restricciones:** Máximo 3 pistas por ejercicio
**Penalización:** -10% XP, -10% ML Coins en recompensa final
**Cooldown:** Ninguno

**Tipos de Pistas:**
- **Pista Teórica:** Recuerda concepto relevante
- **Pista Eliminatoria:** Elimina 1 opción incorrecta (multiple choice)
- **Pista Direccional:** Sugiere enfoque sin dar respuesta

**Ejemplo:**
```
Ejercicio: "¿Cuál es el área de un triángulo con base 8cm y altura 5cm?"

Pista 1 (teórica): "El área de un triángulo se calcula con la fórmula: base × altura ÷ 2"
Pista 2 (direccional): "Primero multiplica la base por la altura"
Pista 3 (eliminatoria): "La respuesta NO es 40cm² ni 13cm²"
```

#### 4.2 Visión Lectora (Reading Vision)

**Costo:** 25 ML Coins
**Efecto:** Resalta palabras clave y números importantes en el enunciado
**Restricciones:** Solo 1 uso por ejercicio
**Penalización:** -5% XP
**Cooldown:** Ninguno
**Duración:** Permanece activo durante todo el ejercicio

**Útil para:**
- Ejercicios con enunciados largos
- Problemas de comprensión lectora
- Estudiantes con dificultades de atención

**Ejemplo:**
```
Original:
"María tiene 12 manzanas y regala 4 a su amigo Pedro. Luego compra 6 manzanas más. ¿Cuántas manzanas tiene ahora?"

Con Visión Lectora:
"María tiene **12 manzanas** y **regala 4** a su amigo Pedro. Luego **compra 6 manzanas más**. ¿Cuántas manzanas tiene **ahora**?"
```

#### 4.3 Segunda Oportunidad (Second Chance)

**Costo:** 40 ML Coins
**Efecto:** Permite reintentar ejercicio inmediatamente sin penalización en historial
**Restricciones:** Solo si primer intento fue <80%
**Penalización:** -15% XP, -15% ML Coins
**Cooldown:** 1 hora
**Límite:** Máximo 2 por día

**Mecánica:**
1. Estudiante completa ejercicio con 60% (suspenso)
2. Puede usar "Segunda Oportunidad" para borrar intento
3. Ejercicio se resetea completamente
4. Nuevo intento cuenta como intento único (sin registro del 60%)
5. Recompensas finales reducidas 15%

**Restricciones Éticas:**
- No disponible en exámenes oficiales
- No disponible en competencias entre estudiantes
- Maestros pueden desactivarlo por alumno/grupo

---

### 5. Logros (Achievements)

**Propósito:** Objetivos secundarios que incentivan exploración y dominio más allá del curriculum lineal.

**Total:** 50+ achievements

**Categorías (7):**

#### 5.1 Categoría: Ejercicios (Progress)
Logros por completar ejercicios y módulos.

| ID | Nombre | Descripción | Recompensa | Rareza |
|----|--------|-------------|------------|--------|
| ACH-001 | Primeros Pasos | Completa tu primer ejercicio | 25 ML, 10 XP | Common |
| ACH-002 | Estudiante Dedicado | Completa 10 ejercicios | 50 ML, 25 XP | Common |
| ACH-003 | Aprendiz Constante | Completa 50 ejercicios | 100 ML, 50 XP | Uncommon |
| ACH-004 | Maestro del Saber | Completa 100 ejercicios | 200 ML, 100 XP | Rare |
| ACH-005 | Leyenda Educativa | Completa 500 ejercicios | 500 ML, 250 XP | Epic |

#### 5.2 Categoría: Dominio (Mastery)
Logros por excelencia académica.

| ID | Nombre | Descripción | Recompensa | Rareza |
|----|--------|-------------|------------|--------|
| ACH-010 | Perfeccionista | 10 ejercicios con 100% | 75 ML, 40 XP | Uncommon |
| ACH-011 | Velocista | Completa ejercicio en <30% tiempo | 150 ML, 50 XP | Rare |
| ACH-012 | Sin Ayuda | Completa 5 ejercicios sin usar PowerUps | 100 ML, 60 XP | Rare |
| ACH-013 | Genio Matemático | 100% en módulo de matemáticas avanzadas | 200 ML, 100 XP | Epic |

#### 5.3 Categoría: Social (Social)
Logros por interacción con otros estudiantes.

| ID | Nombre | Descripción | Recompensa | Rareza |
|----|--------|-------------|------------|--------|
| ACH-020 | Amigo Solidario | Ayuda a 5 compañeros | 50 ML, 30 XP | Common |
| ACH-021 | Líder del Aula | Top 3 en leaderboard de aula 3 veces | 150 ML, 75 XP | Rare |
| ACH-022 | Inspiración | 10 compañeros te agregaron como amigo | 100 ML, 50 XP | Uncommon |

#### 5.4 Categoría: Racha (Streak)
Logros por consistencia.

| ID | Nombre | Descripción | Recompensa | Rareza |
|----|--------|-------------|------------|--------|
| ACH-030 | Semana Completa | Racha de 7 días | 100 ML, 50 XP | Common |
| ACH-031 | Mes Imparable | Racha de 30 días | 300 ML, 150 XP | Rare |
| ACH-032 | Año Legendario | Racha de 365 días | 1,000 ML, 500 XP | Legendary |

#### 5.5 Categoría: Especiales (Special)
Logros ocultos y de eventos.

| ID | Nombre | Descripción | Recompensa | Rareza |
|----|--------|-------------|------------|--------|
| ACH-040 | Explorador Curioso | Desbloquea 5 módulos opcionales | 150 ML, 75 XP | Rare |
| ACH-041 | ??? | [Secreto] | 500 ML, 250 XP | Legendary |
| ACH-042 | Campeón del Evento | Gana competencia escolar | 400 ML, 200 XP | Epic |

**Progresión de Logros:**

Algunos logros tienen cadenas (achievement chains):
```
ACH-001 (1 ejercicio) → ACH-002 (10) → ACH-003 (50) → ACH-004 (100) → ACH-005 (500)
```

**Logros Ocultos:**

10% de logros son "secretos" - no se muestran hasta desbloquearse:
- Fomenta exploración
- Sorpresas positivas
- Evita "checklist mentality"

---

### 6. Racha (Streak)

**Propósito:** Incentivar consistencia diaria en lugar de "binge learning".

**Tipos de Racha:**

#### 6.1 Racha de Login Diario
**Requisito:** Iniciar sesión cada día
**Recompensa:** 10 ML Coins por día
**Reset:** Si no inicia sesión en 24 horas

#### 6.2 Racha de Ejercicio Diario
**Requisito:** Completar al menos 1 ejercicio por día
**Recompensa:** 5 ML Coins × días de racha (max 50/día)
**Reset:** Si no completa ejercicio en 24 horas
**Bonus por Hitos:**
```
Día 3:  +10 ML extra
Día 7:  +25 ML extra + badge "Semana Completa"
Día 14: +50 ML extra
Día 30: +100 ML extra + badge "Mes Imparable"
Día 100: +500 ML extra + badge "Centenario"
```

**Mecánica de Protección (Shield):**

Estudiantes pueden comprar "Escudo de Racha" (100 ML):
- Protege racha por 1 día de inactividad
- Máximo 3 escudos acumulables
- Se consume automáticamente si falta un día

**Racha Flexible (Weekends):**

Para evitar presión excesiva:
- Fines de semana cuentan como 1 solo día
- Si completa ejercicio sábado O domingo, racha continúa
- Evita que estudiantes se sientan obligados 7/7

---

## Principios de Diseño

### 1. Learning-First (Aprendizaje Primero)

**Todas las mecánicas de gamificación deben reforzar, no distraer, el aprendizaje.**

Implementación:
- XP y ML Coins solo por actividades educativas (no por login simple)
- PowerUps ayudan, no regalan respuestas
- Leaderboards se pueden ocultar (opción parental)
- Logros alineados con curriculum
- Streaks tienen "pausa de fin de semana"

**Contraejemplos (evitados):**
- ❌ Minijuegos sin relación con contenido
- ❌ Gacha/lootboxes con recompensas aleatorias
- ❌ Timers de energía que limitan estudio
- ❌ PvP directo que genera estrés

---

### 2. Cultural Relevance (Relevancia Cultural)

**Integrar elementos culturales mexicanos con valor pedagógico.**

Implementación:
- Rangos basados en jerarquía Maya (con explicaciones históricas)
- Iconografía Maya auténtica (revisada por historiadores)
- Achievements sobre civilizaciones precolombinas
- Eventos especiales en fechas culturales (Día de Muertos, Independencia)

**Valor Pedagógico:**
- Estudiantes aprenden historia mientras avanzan
- Orgullo cultural e identidad
- Diferenciación de plataformas globales genéricas

---

### 3. Fair Progression (Progresión Justa)

**No pay-to-win. Progreso basado en esfuerzo educativo, no en tiempo disponible o dinero.**

Implementación:
- ML Coins NO se compran con dinero real
- Límites diarios de ganancias (cap de 500 ML/día)
- Leaderboards por contexto (aula, no global solo)
- PowerUps opcionales, no esenciales
- Sistema anti-farming (detección de intentos repetitivos sin aprender)

**Métricas de Equidad:**
- Gini coefficient de ML Coins < 0.45
- Top 10% no debe tener >30% del supply total
- Todos los estudiantes pueden alcanzar rango máximo en 1 año escolar

---

### 4. Social Engagement (Interacción Social Positiva)

**Fomentar colaboración y competencia sana entre pares.**

Implementación:
- Sistema de amigos (agregar compañeros)
- Leaderboards de aula (no globales por defecto)
- Achievements sociales (ayudar compañeros)
- Opción de "regalar" ML Coins a amigos (límite 50/día)
- Competencias por equipos (no solo individuales)

**Salvaguardas:**
- Opción de ocultar posición en leaderboard (anti-presión)
- No se muestran puntajes de otros sin consentimiento
- Chat/mensajes moderados o deshabilitados (COPPA compliance)

---

### 5. Teacher Visibility (Visibilidad para Maestros)

**Maestros deben poder monitorear y ajustar gamificación según necesidad pedagógica.**

Implementación:
- Dashboard de maestro muestra:
  - Progreso de XP por estudiante
  - Uso de PowerUps (posible indicador de dificultad)
  - Streaks activas/rotas
  - Comparación con promedio del aula
- Controles de maestro:
  - Deshabilitar PowerUps para exámenes
  - Ajustar límites de ML Coins
  - Crear logros personalizados
  - Otorgar bonificaciones manuales

**Reportes Disponibles:**
- Estudiantes en riesgo (racha rota, bajo XP)
- Estudiantes destacados (logros raros)
- Uso de PowerUps (quién usa más pistas)
- Actividad semanal (engagement trends)

---

## Implementación

### Base de Datos (PostgreSQL)

**Schema:** `gamification_system` (8 tablas principales)

#### Tabla 1: `user_stats`
```sql
CREATE TABLE gamification_system.user_stats (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL,

    -- XP y Niveles
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 1000,

    -- ML Coins
    ml_coins INTEGER DEFAULT 100,
    ml_coins_earned_total INTEGER DEFAULT 100,
    ml_coins_spent_total INTEGER DEFAULT 0,
    ml_coins_earned_today INTEGER DEFAULT 0,

    -- Streaks
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,

    -- Progreso
    exercises_completed INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    achievements_earned INTEGER DEFAULT 0,

    -- Métricas
    total_score INTEGER DEFAULT 0,
    average_score NUMERIC(5,2) DEFAULT 0.00,

    -- Timestamps
    last_activity_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla 2: `user_ranks`
```sql
CREATE TABLE gamification_system.user_ranks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,

    current_rank TEXT NOT NULL, -- nacom, batab, holcan, etc.
    previous_rank TEXT,
    is_current BOOLEAN DEFAULT true,

    rank_progress_percentage INTEGER DEFAULT 0,
    modules_required_for_next INTEGER,
    xp_required_for_next INTEGER,

    ml_coins_bonus INTEGER DEFAULT 50,
    achieved_at TIMESTAMP DEFAULT NOW(),

    rank_metadata JSONB DEFAULT '{}'
);
```

#### Tabla 3: `ml_coins_transactions`
```sql
CREATE TABLE gamification_system.ml_coins_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,

    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,

    transaction_type TEXT NOT NULL, -- earned_exercise, spent_powerup, etc.
    description TEXT NOT NULL,

    reference_id UUID, -- exercise_id, achievement_id, etc.
    reference_type TEXT,

    multiplier NUMERIC(3,2) DEFAULT 1.00,
    bonus_applied BOOLEAN DEFAULT false,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla 4: `achievements`
```sql
CREATE TABLE gamification_system.achievements (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,

    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- progress, mastery, social, streak, special
    icon TEXT DEFAULT '🏆',

    conditions JSONB NOT NULL,
    is_secret BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_repeatable BOOLEAN DEFAULT false,

    rewards JSONB DEFAULT '{"xp": 0, "ml_coins": 0}',
    rarity TEXT DEFAULT 'common', -- common, uncommon, rare, epic, legendary

    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla 5: `user_achievements`
```sql
CREATE TABLE gamification_system.user_achievements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL REFERENCES achievements(id),

    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 100,
    is_completed BOOLEAN DEFAULT false,

    completed_at TIMESTAMP,
    rewards_claimed BOOLEAN DEFAULT false,
    rewards_received JSONB DEFAULT '{}',

    UNIQUE(user_id, achievement_id)
);
```

#### Tabla 6: `comodines_inventory`
```sql
CREATE TABLE gamification_system.comodines_inventory (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,

    -- Pistas
    pistas_available INTEGER DEFAULT 0,
    pistas_used_total INTEGER DEFAULT 0,
    pistas_cost INTEGER DEFAULT 15,

    -- Visión Lectora
    vision_lectora_available INTEGER DEFAULT 0,
    vision_lectora_used_total INTEGER DEFAULT 0,
    vision_lectora_cost INTEGER DEFAULT 25,

    -- Segunda Oportunidad
    segunda_oportunidad_available INTEGER DEFAULT 0,
    segunda_oportunidad_used_total INTEGER DEFAULT 0,
    segunda_oportunidad_cost INTEGER DEFAULT 40,

    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla 7: `user_streaks`
```sql
CREATE TABLE gamification_system.user_streaks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,

    current_streak INTEGER DEFAULT 0,
    streak_type TEXT NOT NULL, -- daily_login, daily_exercise
    max_streak INTEGER DEFAULT 0,

    streak_started_at TIMESTAMP DEFAULT NOW(),
    last_activity_date DATE DEFAULT CURRENT_DATE,

    bonus_ml_coins_per_day INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true
);
```

#### Tabla 8: `leaderboards`
```sql
CREATE TABLE gamification_system.leaderboards (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,

    name TEXT NOT NULL,
    type TEXT NOT NULL, -- global, classroom, school, weekly
    scope_id UUID, -- classroom_id, school_id

    period TEXT, -- daily, weekly, monthly
    start_date TIMESTAMP,
    end_date TIMESTAMP,

    ranking_criteria TEXT DEFAULT 'total_xp',
    rankings JSONB DEFAULT '[]',

    last_updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

### Backend (Node.js/TypeScript)

**Módulos Principales:**

```
/src/modules/gamification/
├── gamification.routes.ts      (43 endpoints)
├── gamification.service.ts     (Legacy compatibility)
├── coins.service.ts            (ML Coins economy)
├── ranks.service.ts            (Maya ranks)
├── powerups.service.ts         (PowerUps)
├── leaderboard.service.ts      (Rankings)
├── achievements.service.ts     (Achievements)
└── missions/
    ├── missions.service.ts     (Daily/weekly missions)
    └── missions.templates.ts   (Mission definitions)
```

**API Endpoints (Principales):**

```typescript
// Ranks
GET    /api/gamification/ranks
GET    /api/gamification/ranks/user/:userId
POST   /api/gamification/ranks/promote/:userId

// ML Coins
GET    /api/gamification/coins/:userId
POST   /api/gamification/coins/earn
POST   /api/gamification/coins/spend
GET    /api/gamification/coins/leaderboard

// Achievements
GET    /api/gamification/achievements
GET    /api/gamification/achievements/:userId
POST   /api/gamification/achievements/unlock

// PowerUps
GET    /api/gamification/powerups/:userId
POST   /api/gamification/powerups/purchase
POST   /api/gamification/powerups/use

// Leaderboards
GET    /api/gamification/leaderboard/global
GET    /api/gamification/leaderboard/classroom/:id
GET    /api/gamification/leaderboard/weekly

// Missions
GET    /api/gamification/missions/daily/:userId
GET    /api/gamification/missions/weekly/:userId
POST   /api/gamification/missions/:id/progress
```

**Integración con Sistema de Ejercicios:**

Cuando estudiante completa ejercicio:

```typescript
// scoring.service.ts (líneas 24-538)
async submitExercise(submission) {
  // 1. Calcular puntuación base
  const baseScore = calculateBaseScore(submission);

  // 2. Obtener stats del usuario
  const userStats = await getUserStats(userId);
  const { currentRank, streakDays } = userStats;

  // 3. Aplicar multiplicadores
  const multipliers = {
    difficulty: getDifficultyMultiplier(exercise.difficulty),
    rank: getRankMultiplier(currentRank),
    streak: 1 + (streakDays * 0.01) // max 1.3x
  };

  // 4. Calcular bonuses
  const bonuses = {
    perfect: score === 100 ? 10 : 0,
    noHints: hintsUsed === 0 ? 5 : 0,
    speed: timeUsed < (timeLimit * 0.75) ? 5 : 0
  };

  // 5. Calcular recompensas
  const xp = Math.floor(50 * multipliers.difficulty * multipliers.rank);
  const mlCoins = Math.floor(15 * multipliers.rank);

  // 6. Actualizar user_stats
  await updateUserStats(userId, { xp, mlCoins, exercisesCompleted: +1 });

  // 7. Crear transacción
  await createMLCoinsTransaction({
    userId,
    amount: mlCoins,
    type: 'earned_exercise',
    multiplier: multipliers.rank,
    referenceId: exerciseId
  });

  // 8. Verificar achievements
  await checkAchievements(userId, { exercisesCompleted, score });

  // 9. Verificar promoción de rango
  await autoCheckPromotion(userId);

  return { score, xp, mlCoins, bonuses, achievements };
}
```

---

## Consecuencias

### Positivas ✅

#### 1. Aumento Proyectado de Engagement (60%)
**Fundamento:** Estudios de gamificación en educación muestran:
- 40-70% aumento en tiempo en plataforma
- 50-60% aumento en completitud de ejercicios
- 30-40% mejora en retención a 30 días

**Métricas a Monitorear:**
- Daily Active Users (DAU)
- Ejercicios completados por usuario/semana
- Tasa de retorno día 1, 7, 30
- Tiempo promedio en plataforma

#### 2. Componente Cultural Educativo
**Beneficio Pedagógico:**
- Estudiantes aprenden sobre civilización Maya orgánicamente
- Conexión con historia mexicana (curriculum escolar)
- Orgullo cultural e identidad
- Diferenciación de competidores globales

**Evidencia:**
- Cada promoción de rango incluye lección histórica
- Logros temáticos sobre arqueología, matemáticas mayas
- Iconografía auténtica revisada por historiadores

#### 3. Sin Presión de Monetización
**Ventaja Estratégica:**
- No hay tentación de diseñar para maximizar compras
- Diseño centrado en aprendizaje, no en ingresos
- Confianza de padres y escuelas
- Cumplimiento de regulaciones educativas

**Modelo de Negocio:**
- Ingresos por suscripción institucional (escuelas)
- No por microtransacciones de estudiantes
- Alineación completa con objetivos educativos

#### 4. Feedback Inmediato y Visible
**Beneficio Psicológico:**
- Estudiantes ven progreso en tiempo real
- Refuerzo positivo constante
- Motivación intrínseca (no solo extrínseca)

**Implementación:**
- Animaciones de +XP y +ML Coins al completar
- Notificaciones de logros desbloqueados
- Barra de progreso de rango siempre visible

#### 5. Extensibilidad Futura
**Diseño Modular:**
- Fácil agregar nuevos PowerUps
- Sistema de achievements extensible (50+ templates)
- Leaderboards configurables por maestro
- API lista para integraciones (webhooks, eventos)

**Roadmap Futuro:**
- Guilds/Clans (grupos colaborativos)
- Misiones narrativas (storytelling)
- Eventos temporales (competencias escolares)
- Sistema de mentores (estudiantes avanzados ayudan novatos)

---

### Negativas ❌

#### 1. Complejidad en Balanceo Inicial
**Riesgo:** Economía desequilibrada en primeras semanas.

**Mitigación:**
- Beta testing con 3-5 escuelas piloto (100-200 estudiantes)
- Monitoreo diario de métricas económicas (inflación, velocity, Gini)
- Ajustes rápidos mediante configuración (no requiere deploy)
- Sistema de "ajuste suave" (cambios graduales, no abruptos)

**Métricas a Vigilar:**
```
Inflación objetivo: 2-4% mensual
Velocity objetivo: 0.8-1.2
Gini coefficient: <0.45
```

#### 2. Requiere Tuning Continuo
**Costo Operativo:**
- Game designer part-time (10 horas/semana) = $800/mes
- Análisis mensual de economía
- Ajustes trimestrales de recompensas
- Creación de contenido nuevo (logros, eventos)

**ROI Esperado:**
- Inversión: ~$10K/año
- Retorno: +60% engagement → +40% retención → +$50K ARR incremental

#### 3. Posible Distracción si Mal Implementado
**Riesgo:** Estudiantes enfocados en "subir de nivel" más que en aprender.

**Mitigación:**
- Principio "Learning-First" en todos los features
- A/B testing de mecánicas nuevas
- Opción de padres/maestros de "modo simplificado"
- Monitoreo de learning outcomes (no solo engagement)

**KPIs de Balance:**
```
Tiempo en ejercicios / Tiempo total > 80%
Tasa de éxito en ejercicios sin PowerUps > 70%
Correlación engagement-aprendizaje > 0.6
```

#### 4. Riesgo de Farming/Gaming del Sistema
**Riesgo:** Estudiantes intentan explotar sistema para ganar XP/Coins sin aprender.

**Mitigación:**
- Límites diarios de ganancias (cap de 500 ML/día)
- Detección de patrones sospechosos (10 ejercicios en 5 minutos)
- Variación aleatoria de ejercicios (no repetición exacta)
- Penalización por intentos repetitivos sin mejora

**Detección Automática:**
```sql
-- Ejemplo: Detectar farming
SELECT user_id, COUNT(*) as attempts, AVG(time_spent)
FROM exercise_attempts
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 20 AND AVG(time_spent) < INTERVAL '30 seconds'
```

#### 5. Curva de Aprendizaje para Maestros
**Desafío:** Maestros deben entender sistema para monitorear efectivamente.

**Mitigación:**
- Documentación clara para maestros (guías visuales)
- Onboarding interactivo (tour guiado)
- Webinars mensuales de capacitación
- Dashboards simplificados (métricas clave resaltadas)
- Soporte prioritario para escuelas

**Materiales Necesarios:**
- Guía de maestro (PDF, 20 páginas)
- Videos tutoriales (5 × 3 minutos)
- FAQ de gamificación
- Casos de uso (estudiante motivado, desmotivado, avanzado)

---

## Métricas de Éxito

### Métricas de Engagement (Core KPIs)

| Métrica | Baseline | Target 3 meses | Target 6 meses |
|---------|----------|----------------|----------------|
| **Daily Active Users (DAU)** | 40% | 60% | 70% |
| **Ejercicios completados/usuario/semana** | 8 | 12 | 15 |
| **Retention Day 7** | 45% | 65% | 75% |
| **Retention Day 30** | 25% | 40% | 50% |
| **Tiempo promedio en plataforma** | 25 min | 35 min | 45 min |

### Métricas de Economía (ML Coins)

| Métrica | Target | Frecuencia |
|---------|--------|------------|
| **Inflación mensual** | 2-4% | Mensual |
| **Velocity (transacciones/supply)** | 0.8-1.2 | Semanal |
| **Gini coefficient** | <0.45 | Mensual |
| **% usuarios con balance >0** | >85% | Semanal |
| **Average ML Coins per user** | 200-400 | Semanal |

### Métricas de Aprendizaje (Learning Outcomes)

| Métrica | Baseline | Target |
|---------|----------|--------|
| **Tasa de éxito en ejercicios** | 68% | 75% |
| **Puntuación promedio** | 72% | 78% |
| **Ejercicios sin PowerUps** | 60% | 70% |
| **Módulos completados/mes** | 2.1 | 3.5 |
| **Correlación engagement-aprendizaje** | - | >0.6 |

### Métricas de Salud del Sistema

| Métrica | Target | Alertas |
|---------|--------|---------|
| **API Response Time (p95)** | <200ms | >500ms |
| **Transacciones fallidas** | <0.1% | >1% |
| **Inconsistencias de balance** | 0 | >5/día |
| **Reportes de bugs de gamificación** | <5/mes | >15/mes |

---

## Decisiones Relacionadas

- **ADR-001:** Email Verification Removal (afecta onboarding de estudiantes)
- **ADR-002:** JWT Security Implementation (autenticación para endpoints)
- **ADR-003:** RLS vs App-Layer Authorization (seguridad de datos de gamificación)
- **ADR-005:** Multi-Tenancy Implementation (aislamiento entre escuelas/leaderboards)

---

## Referencias

### Investigación de Gamificación en Educación

1. **Deterding et al. (2011)** - "From Game Design Elements to Gamefulness"
2. **Hamari et al. (2014)** - "Does Gamification Work? A Literature Review"
3. **Dicheva et al. (2015)** - "Gamification in Education: A Systematic Mapping Study"

### Diseño de Economía Virtual

1. **Castronova (2014)** - "Wildcat Currency: How the Virtual Money Revolution Is Transforming the Economy"
2. **Lehdonvirta & Castronova (2014)** - "Virtual Economies: Design and Analysis"

### Contexto Cultural Maya

1. **Thompson, J.E.S. (1954)** - "The Rise and Fall of Maya Civilization"
2. **Sharer & Traxler (2006)** - "The Ancient Maya" (6th Edition)
3. **Coe, Michael D. (2011)** - "The Maya" (8th Edition)

### Especificaciones Técnicas del Proyecto

> **Fuentes de requerimientos:**
> - [Requerimientos de Gamificación](../../01-requerimientos/gamificacion/) - Sistema completo de gamificación
> - [RNF-GAM-001 - Sistema de Rangos Maya](../../01-requerimientos/requerimientos-no-funcionales/RNF-GAM-001-rangos-maya.md)

**Especificaciones técnicas:**
1. [Gamification API](../apis/gamificacion-api/README.md) - API completa modularizada
2. [Sistema de Gamificación - Tipos](../tipos-compartidos/TYPES-GAMIFICATION.md) - Tipos TypeScript
3. [Backend Architecture](../arquitectura/BACKEND-ARCHITECTURE.md) - Módulo de gamificación

**Desarrollo:**
1. [Base de Datos - Gamification Schema](../../03-desarrollo/base-de-datos/schemas/gamification_system/) - Esquema completo
2. [Backend - Servicios de Gamificación](../../03-desarrollo/backend/servicios/Servicios-Gamificacion.md) - Implementación

---

## Revisiones

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-10-28 | Decisión inicial | Product Owner, Game Designer, Backend Lead |
| - | Pendiente: Revisión post-beta (3 meses) | - |
| - | Pendiente: Ajustes económicos post-lanzamiento | - |

---

## Apéndice A: Ejemplos de Progresión de Estudiante

### Caso 1: Ana (8 años, 3er grado)

**Semana 1:**
- Rango: Ajaw (inicial)
- XP: 0 → 450 (15 ejercicios completados)
- ML Coins: 100 (inicio) + 225 (ganados) - 30 (pistas) = 295 ML
- Racha: 5 días
- Logros: "Primeros Pasos" (ACH-001), "Estudiante Dedicado" (ACH-002)

**Semana 4:**
- Rango: Nacom (promovida en semana 3)
- XP: 1,250
- ML Coins: 580
- Racha: 21 días (ganó "Semana Completa" × 3)
- Logros: 8 desbloqueados
- Módulos: 5 completados

**Mes 3:**
- Rango: Nacom
- XP: 3,500
- ML Coins: 1,200
- Racha: 45 días (récord personal)
- Logros: 15 desbloqueados (incluyendo "Perfeccionista")
- Posición: Top 5 en leaderboard de aula

---

### Caso 2: Carlos (12 años, 6to grado)

**Perfil:** Estudiante avanzado, competitivo.

**Mes 1:**
- Rango: Nacom (progresión rápida)
- XP: 3,800
- ML Coins: 950
- Racha: 28 días consecutivos
- Logros: 12 (incluyendo "Velocista" y "Sin Ayuda")
- Estrategia: Nunca usa PowerUps para maximizar recompensas

**Mes 3:**
- Rango: Ajaw SUPERIOR
- XP: 11,200
- ML Coins: 2,100 (gasta poco, acumula)
- Racha: 90 días
- Posición: #1 en aula, Top 10 en escuela
- Logros: 25 (incluyendo 3 raros, 1 épico)

---

## Apéndice B: Configuración Recomendada por Contexto

### Contexto: Escuela Primaria (Grados 1-3)

**Ajustes:**
- Dificultad: Solo "easy" y "medium"
- PowerUps: Costo reducido 30% (pistas a 10 ML)
- Leaderboards: Solo visible para maestro (no para estudiantes)
- Streaks: Modo flexible (fines de semana no rompen racha)
- Límite diario: 300 ML (evitar obsesión)

---

### Contexto: Escuela Secundaria (Grados 7-9)

**Ajustes:**
- Dificultad: Todas disponibles (easy → expert)
- PowerUps: Costo estándar
- Leaderboards: Visibles, competencia activa
- Streaks: Modo estricto (todos los días cuentan)
- Límite diario: 500 ML

---

### Contexto: Educación Especial

**Ajustes:**
- PowerUps: Gratis o muy baratos (5 ML)
- Multiplicadores: Aumentados 1.5x (mayor recompensa por esfuerzo)
- Achievements: Personalizados por maestro
- Leaderboards: Deshabilitados (sin competencia)
- Streaks: Muy flexibles (meta semanal, no diaria)

---

*ADR-004 - Creado: 28 de Octubre, 2025*
*Estado: Aceptado - Pendiente implementación completa*
