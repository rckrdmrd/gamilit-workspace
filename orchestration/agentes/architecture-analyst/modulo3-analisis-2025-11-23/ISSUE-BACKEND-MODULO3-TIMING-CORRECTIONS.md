# ISSUE: Corrección de Tiempos - Módulo 3 Ejercicios 3.2 y 3.4
## HANDOFF PARA BACKEND-DEVELOPER

**Fecha creación:** 2025-11-23
**Creado por:** Architecture-Analyst
**Asignado a:** Backend-Developer
**Prioridad:** P1 (URGENTE - MVP)
**Esfuerzo estimado:** 20 minutos
**Estado:** 🔴 PENDIENTE

---

## 📋 RESUMEN EJECUTIVO

Se requiere actualizar **tiempos de duración** en 2 ejercicios del Módulo 3 para alinear seeds de base de datos con DocumentoDeDiseño v6.4 (fuente de verdad oficial).

**Cambios necesarios:**
1. **Ejercicio 3.4 (Podcast):** Reducir de 3-5 min → **2 min exactos**
2. **Ejercicio 3.2 (Debate):** Reducir de 25 min → **10 min exactos**

**Impacto:** MVP (Módulo 3 está dentro del alcance inicial)

---

## 🎯 CONTEXTO

### Origen del Issue

Durante análisis arquitectónico del Módulo 3, se identificaron 2 discrepancias de tiempos entre:
- **Fuente de verdad:** DocumentoDeDiseño_Mecanicas_GAMILIT v6.4 + ADR-009
- **Implementación:** Seeds de base de datos

### Decisiones Arquitectónicas

**ADR-009:** Confirma duración de podcast = **2 minutos**
- Aprobado por Product Owner (2025-11-23)
- Razón: Coherencia con ejercicios digitales modernos, facilita evaluación, reduce fricción

**Homologación debate:** Se adoptó el **tiempo más corto** definido (10 minutos)
- Decisión de Product Owner (2025-11-23)
- Razón: Maximizar eficiencia, mantener atención estudiantil

---

## 📝 ESPECIFICACIONES DE CAMBIOS

### CAMBIO 1: Ejercicio 3.4 - Podcast Argumentativo

**Gap ID:** GAP-003

#### Archivos a modificar:

1. `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`
2. `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

#### Localización exacta:

**Línea aproximada:** ~471-476 (buscar `exercise_type = 'podcast_argumentativo'`)

**Contexto código:**
```sql
INSERT INTO educational_content.exercises (
    ...
    exercise_type, order_index,
    config, content, solution,
    ...
) VALUES (
    mod_id,
    'Creación de Podcast Argumentativo',
    ...
    'podcast_argumentativo', 4,
    '{
        "audioRecording": true,
        "scriptAlternative": true,
        "minDuration": 180,  -- ❌ CAMBIAR ESTO
        "maxDuration": 300,  -- ❌ CAMBIAR ESTO
        "requireStructure": true
    }'::jsonb,
    ...
```

#### Cambio requerido:

```sql
-- ANTES (INCORRECTO):
'{
    "audioRecording": true,
    "scriptAlternative": true,
    "minDuration": 180,  -- 3 minutos
    "maxDuration": 300,  -- 5 minutos
    "requireStructure": true
}'::jsonb,

-- DESPUÉS (CORRECTO - per ADR-009):
'{
    "audioRecording": true,
    "scriptAlternative": true,
    "minDuration": 120,  -- 2 minutos (CHANGED: 180→120 per ADR-009)
    "maxDuration": 120,  -- 2 minutos exactos (CHANGED: 300→120 per ADR-009)
    "requireStructure": true
}'::jsonb,
```

#### Justificación:

- **ADR-009** (docs/97-adr/ADR-009-duracion-podcast-ejercicio-3-4.md) especifica 2 minutos exactos
- **DocumentoDeDiseño v6.4** línea 9: "Ejercicio 3.4: Duración de podcast ajustada a 2 minutos"
- **Estructura oficial:** Intro (30s) + Desarrollo (60s) + Conclusión (30s) = 120s

---

### CAMBIO 2: Ejercicio 3.2 - Debate Digital

**Gap ID:** GAP-004

#### Archivos a modificar:

1. `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`
2. `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

#### Localización exacta:

**Línea aproximada:** ~172-178 (buscar `exercise_type = 'debate_digital'`)

**Contexto código:**
```sql
INSERT INTO educational_content.exercises (
    ...
    exercise_type, order_index,
    config, content, solution,
    ...
) VALUES (
    mod_id,
    'Debate Digital Estructurado',
    ...
    'debate_digital', 2,
    '{
        "allowCounterarguments": true,
        "timeLimit": 1500,  -- ❌ CAMBIAR ESTO
        "requireEvidence": true,
        "minArguments": 3
    }'::jsonb,
    ...
```

#### Cambio requerido:

```sql
-- ANTES (INCORRECTO):
'{
    "allowCounterarguments": true,
    "timeLimit": 1500,  -- 25 minutos (1500 segundos)
    "requireEvidence": true,
    "minArguments": 3
}'::jsonb,

-- DESPUÉS (CORRECTO - homologado):
'{
    "allowCounterarguments": true,
    "timeLimit": 600,  -- 10 minutos (CHANGED: 1500→600 per homologación PO)
    "requireEvidence": true,
    "minArguments": 3
}'::jsonb,
```

#### Justificación:

- **DocumentoDeDiseño v6.4** actualizado (líneas 614-633): Tiempo total = 10 minutos
- **Decisión Product Owner:** Adoptar tiempo más corto definido (10 min)
- **Estructura optimizada:**
  - Fase 1 - Preparación: 3 minutos
  - Fase 2 - Debate activo: 6 minutos
  - Fase 3 - Cierre y votación: 1 minuto
  - **Total:** 600 segundos = 10 minutos

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Cambios aplicados correctamente:

- [ ] **PROD:** `04-exercises-module3.sql` modificado (ambos ejercicios)
- [ ] **DEV:** `04-exercises-module3.sql` modificado (ambos ejercicios)
- [ ] Validación sintaxis SQL ejecutada sin errores
- [ ] Cambios commiteados con mensaje descriptivo

### Validación técnica:

- [ ] Config JSONB es válido (verificar con `jq`)
- [ ] Seeds se cargan sin errores en base de datos de prueba
- [ ] Tiempos correctos verificados en DB:
  - Podcast: `minDuration=120, maxDuration=120`
  - Debate: `timeLimit=600`

### Comunicación:

- [ ] Frontend-Developer notificado para verificar componentes:
  - Componente grabación podcast (timer 2 min)
  - Componente debate (timer 10 min)
- [ ] Architecture-Analyst notificado de resolución

---

## 🔍 VALIDACIÓN POST-IMPLEMENTACIÓN

### Tests SQL:

```bash
# 1. Validar sintaxis
psql -d gamilit_platform -f apps/database/seeds/prod/educational_content/04-exercises-module3.sql

# 2. Verificar JSON es válido
echo '{"minDuration": 120, "maxDuration": 120}' | jq .
echo '{"timeLimit": 600}' | jq .

# 3. Consultar valores en DB
psql -d gamilit_platform -c "
SELECT
    exercise_type,
    title,
    config->'minDuration' as min_duration_podcast,
    config->'maxDuration' as max_duration_podcast,
    config->'timeLimit' as time_limit_debate
FROM educational_content.exercises
WHERE module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA')
  AND exercise_type IN ('podcast_argumentativo', 'debate_digital')
ORDER BY order_index;
"
```

### Resultado esperado:

```
exercise_type        | title                           | min_duration | max_duration | time_limit
---------------------+---------------------------------+--------------+--------------+------------
debate_digital       | Debate Digital Estructurado     | null         | null         | 600
podcast_argumentativo| Creación de Podcast Argumentativo| 120          | 120          | null
```

---

## 📦 COMMIT SUGERIDO

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Aplicar cambios con herramienta Edit

git add apps/database/seeds/prod/educational_content/04-exercises-module3.sql
git add apps/database/seeds/dev/educational_content/04-exercises-module3.sql

git commit -m "fix(seeds): align M3 exercise timings to design docs (GAP-003, GAP-004)

BREAKING CHANGE: Exercise timings reduced for MVP optimization

Exercise 3.4 (Podcast Argumentativo):
- Updated minDuration 180→120 seconds (3min→2min)
- Updated maxDuration 300→120 seconds (5min→2min)
- Aligns with ADR-009 and DocumentoDeDiseño v6.4
- Estructura: Intro (30s) + Desarrollo (60s) + Conclusión (30s)

Exercise 3.2 (Debate Digital):
- Updated timeLimit 1500→600 seconds (25min→10min)
- Homologated to shortest defined time per PO decision
- Estructura: Preparación (3min) + Debate (6min) + Cierre (1min)

Confirmed by Product Owner: 2025-11-23
Reference: ADR-009, DocumentoDeDiseño v6.4 líneas 9, 614-633

Resolves: GAP-003, GAP-004
See: orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/
Impact: MVP (Módulo 3 in scope)

Co-Authored-By: Architecture-Analyst <noreply@gamilit.com>
🤖 Generated with Claude Code"
```

---

## 📞 COMUNICACIÓN REQUERIDA

### A Frontend-Developer (CRÍTICO):

**Asunto:** Verificar componentes M3 - Tiempos actualizados

**Mensaje:**
```markdown
Hola,

Se actualizaron los tiempos de 2 ejercicios del Módulo 3 (MVP):

1. **Podcast Argumentativo (3.4):** 3-5 min → **2 min exactos**
   - Componente afectado: Grabador de audio/podcast
   - Verificar: Timer muestra 2:00 minutos máximo
   - Validación: Bloquear grabación al llegar a 120 segundos

2. **Debate Digital (3.2):** 25 min → **10 min exactos**
   - Componente afectado: Interface de debate
   - Verificar: Timer muestra 10:00 minutos máximo
   - Validación: Notificar/bloquear al llegar a 600 segundos

Por favor verificar que los componentes estén alineados con estos nuevos tiempos.

Referencia: orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/
```

---

## 📚 REFERENCIAS

### Documentación:
- **ADR-009:** `docs/97-adr/ADR-009-duracion-podcast-ejercicio-3-4.md`
- **DocumentoDeDiseño v6.4:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
  - Línea 9: Changelog podcast
  - Líneas 614-633: Estructura debate actualizada
  - Líneas 685-726: Estructura podcast

### Análisis Arquitectónico:
- `orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/00-README.md`
- `orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/01-ANALISIS-DETALLADO-MODULO-3.md`
- `orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/03-RESUMEN-EJECUTIVO-GAP-003.md`

### Trazas:
- `orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md` (pendiente actualizar)

---

## ⚠️ NOTAS IMPORTANTES

### BREAKING CHANGE:
- Reducción de tiempos puede afectar ejercicios ya iniciados por usuarios
- **Recomendación:** Comunicar cambio a usuarios activos del Módulo 3
- **Mitigación:** Si hay ejercicios en progreso, considerar ventana de gracia

### Impacto Frontend:
- **CRÍTICO:** Verificar componentes de grabación y timer
- Si componentes no están alineados, usuarios podrían exceder tiempo sin validación client-side

### Testing requerido:
- [ ] Cargar seeds en DB de prueba
- [ ] Verificar que ejercicios funcionan con nuevos tiempos
- [ ] Probar flujo completo: inicio → grabación/debate → envío

---

## 🚀 PRÓXIMOS PASOS

### Inmediato (hoy):
1. ✅ Backend-Developer: Aplicar cambios a seeds (PROD y DEV)
2. ✅ Backend-Developer: Validar sintaxis y cargar en DB de prueba
3. ✅ Backend-Developer: Commit con mensaje sugerido
4. ✅ Backend-Developer: Notificar a Frontend-Developer

### Corto plazo (mañana):
5. 📋 Frontend-Developer: Verificar componentes de grabación/debate
6. 📋 QA: Probar flujo completo de ejercicios 3.2 y 3.4

### Seguimiento:
7. 📋 Architecture-Analyst: Actualizar traza tras confirmación
8. 📋 Architecture-Analyst: Marcar GAP-003 y GAP-004 como RESUELTOS

---

## ✅ CHECKLIST DE FINALIZACIÓN

- [ ] Cambios aplicados a `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`
- [ ] Cambios aplicados a `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`
- [ ] Validación sintaxis SQL ejecutada sin errores
- [ ] Config JSONB validado con `jq`
- [ ] Seeds cargados en DB de prueba exitosamente
- [ ] Valores verificados en DB (query de validación ejecutada)
- [ ] Commit realizado con mensaje descriptivo
- [ ] Frontend-Developer notificado
- [ ] Architecture-Analyst notificado de resolución
- [ ] Traza actualizada

---

**FIN DEL ISSUE**

**Creado:** 2025-11-23
**Por:** Architecture-Analyst
**Prioridad:** P1 (URGENTE - MVP)
**Esfuerzo:** 20 minutos
**Estado:** 🔴 PENDIENTE DE BACKEND-DEVELOPER

---

**Notas finales:**

Este issue consolida 2 gaps críticos identificados durante análisis arquitectónico del Módulo 3. Ambos cambios están aprobados por Product Owner y son necesarios para MVP.

La especificación es completa y autónoma - Backend-Developer tiene toda la información necesaria para ejecutar sin bloqueos.

**Contacto:** Architecture-Analyst disponible para aclaraciones.
