# RESOLUCIÓN GAP-003: Duración Podcast Ejercicio 3.4
## INVESTIGACIÓN ADR-009 COMPLETADA

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**GAP ID:** GAP-003
**Prioridad:** P1
**Estado:** ✅ INVESTIGADO - Pendiente implementación por Backend-Developer

---

## HALLAZGOS

### ADR-009 Confirma Decisión Arquitectónica

**Archivo:** `docs/97-adr/ADR-009-duracion-podcast-ejercicio-3-4.md`
**Estado ADR:** ACEPTADO
**Fecha ADR:** 2025-11-23
**Aprobado por:** Product Owner + Architecture-Analyst

**Decisión oficial:**
```yaml
Duración: 2 minutos (120 segundos)
Estructura:
  - Introducción: 30 segundos
  - Desarrollo: 1 minuto
  - Conclusión: 30 segundos
```

**Evidencia ADR (líneas 56-66):**
> Se mantiene la duración de 2 minutos implementada en el documento v6.4 para el
> Ejercicio 3.4 "Creación de Podcast Argumentativo".
>
> Esta decisión fue confirmada por el Product Owner el 2025-11-23.

---

## CONCLUSIÓN

**FUENTE DE VERDAD:** DocumentoDeDiseño v6.4 + ADR-009 = **2 MINUTOS** ✅

**IMPLEMENTACIÓN DB:** `apps/database/seeds/**/04-exercises-module3.sql` = **3-5 MINUTOS** ❌ (obsoleto)

**ACCIÓN REQUERIDA:** Actualizar seeds (Opción A de las delegaciones)

---

## ESPECIFICACIÓN DE CORRECCIÓN PARA BACKEND-DEVELOPER

### Archivos a modificar:

1. **PROD:** `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`
2. **DEV:** `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

### Cambios exactos:

**Línea 471-473 (aproximadamente):**

```sql
-- ANTES (INCORRECTO - 3-5 minutos):
'{
    "audioRecording": true,
    "scriptAlternative": true,
    "minDuration": 180,  -- ❌ 3 minutos
    "maxDuration": 300,  -- ❌ 5 minutos
    "requireStructure": true
}'::jsonb,

-- DESPUÉS (CORRECTO - 2 minutos según ADR-009):
'{
    "audioRecording": true,
    "scriptAlternative": true,
    "minDuration": 120,  -- ✅ 2 minutos (per ADR-009 + doc v6.4)
    "maxDuration": 120,  -- ✅ 2 minutos (exacto, no rango)
    "requireStructure": true
}'::jsonb,
```

**Justificación:**
- ADR-009 especifica **exactamente 2 minutos** (no un rango)
- Estructura es fija: 30s + 60s + 30s = 120s
- DocumentoDeDiseño v6.4 línea 9 confirma: "ajustada a 2 minutos"

---

## COMMIT SUGERIDO

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Editar ambos seeds
# (Backend-Developer usará herramienta Edit)

git add apps/database/seeds/prod/educational_content/04-exercises-module3.sql
git add apps/database/seeds/dev/educational_content/04-exercises-module3.sql

git commit -m "fix(seeds): align podcast duration M3 Ex3.4 to ADR-009 (2 minutes)

BREAKING CHANGE: Podcast duration reduced from 3-5 minutes to 2 minutes

- Updated minDuration 180→120 (2 minutes)
- Updated maxDuration 300→120 (2 minutes exact, no range)
- Aligns with DocumentoDeDiseño v6.4 and ADR-009 official decision
- Confirmed by Product Owner on 2025-11-23

Estructura definitiva (ADR-009):
- Introducción: 30 segundos
- Desarrollo: 60 segundos (3 argumentos ~20s cada uno)
- Conclusión: 30 segundos
- Total: 120 segundos

Resolves: GAP-003
See: docs/97-adr/ADR-009-duracion-podcast-ejercicio-3-4.md
Reference: orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/

Co-Authored-By: Architecture-Analyst <noreply@gamilit.com>"
```

---

## VALIDACIÓN POST-IMPLEMENTACIÓN

### Tests a ejecutar:

```bash
# 1. Validar sintaxis SQL
psql -d gamilit_platform -f apps/database/seeds/prod/educational_content/04-exercises-module3.sql

# 2. Validar JSON es válido
echo '{"minDuration": 120, "maxDuration": 120}' | jq .

# 3. Verificar en base de datos
psql -d gamilit_platform -c "
SELECT
    exercise_type,
    title,
    config->'minDuration' as min_duration,
    config->'maxDuration' as max_duration
FROM educational_content.exercises
WHERE exercise_type = 'podcast_argumentativo'
    AND module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA')
;"

# Resultado esperado:
# exercise_type        | title                               | min_duration | max_duration
# --------------------+-------------------------------------+--------------+--------------
# podcast_argumentativo| Creación de Podcast Argumentativo   | 120          | 120
```

---

## IMPACTO DEL CAMBIO

### Backend
- ✅ Validación de duración ajustada a 120s máximo
- ✅ Sin cambios en lógica (solo configuración)

### Frontend
- ⚠️ **VERIFICAR:** Componente de grabación de podcast
  - Timer debe mostrar 2:00 minutos máximo
  - Indicador de progreso: 30s (intro) / 60s (desarrollo) / 30s (conclusión)
  - Validación client-side: `if (duration > 120s) → error`

### Base de Datos
- ✅ Solo cambio en JSONB `config`
- ✅ No requiere migración (seeds se recargan)

---

## CHECKLIST PARA BACKEND-DEVELOPER

- [ ] Leer este reporte y ADR-009
- [ ] Editar `apps/database/seeds/prod/educational_content/04-exercises-module3.sql` (línea ~471-473)
- [ ] Editar `apps/database/seeds/dev/educational_content/04-exercises-module3.sql` (línea ~471-473)
- [ ] Validar sintaxis SQL
- [ ] Commit con mensaje sugerido
- [ ] Ejecutar tests de validación
- [ ] **IMPORTANTE:** Notificar a Frontend-Developer para verificar componente de grabación
- [ ] Actualizar `orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md`
- [ ] Marcar GAP-003 como RESUELTO

---

## REFERENCIAS

- **ADR-009:** `docs/97-adr/ADR-009-duracion-podcast-ejercicio-3-4.md`
- **DocumentoDeDiseño v6.4:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` (línea 9, 691, 1047)
- **Análisis Módulo 3:** `orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/01-ANALISIS-DETALLADO-MODULO-3.md`
- **Delegaciones:** `orchestration/agentes/architecture-analyst/modulo3-analisis-2025-11-23/02-DELEGACIONES-IMPLEMENTACION.md`

---

## PRÓXIMOS PASOS

1. 📋 **Backend-Developer:** Implementar corrección (15 minutos)
2. 🔔 **Backend-Developer → Frontend-Developer:** Notificar cambio para validar componente
3. ✅ **Architecture-Analyst:** Marcar GAP-003 como resuelto al recibir confirmación

---

**FIN DE INVESTIGACIÓN GAP-003**

**Conclusión:** ADR-009 confirma 2 minutos. DB seeds deben actualizarse de 3-5min → 2min exactos.

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
