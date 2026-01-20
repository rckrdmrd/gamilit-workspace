# PROMPT: SA-001 - Analisis EPICs Fase 1

## Metadata

```yaml
subagente_id: "SA-001"
nombre: "Analisis de Epicas Fase 1"
perfil: "documentation-analyst"
tipo_tool: "Task (subagent_type: general-purpose)"
fecha_ejecucion: "2026-01-20"
tarea_padre: "TASK-2026-01-20-001"
```

---

## Prompt Enviado

```
**TAREA SA-001: Analisis de EPICs Fase 1 (Alcance Inicial)**

**Contexto:**
Eres un Documentation Analyst especializado en validacion de documentacion SCRUM.
Debes analizar las 7 EPICs de la Fase 1 del proyecto GAMILIT.

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Workspace:** /home/isem/workspace-v2/projects/gamilit

**Alcance:**
- EAI-001 a EAI-008 (7 EPICs)
- Directorio: docs/01-fase-alcance-inicial/

**EPICs a analizar:**
1. EAI-001-fundamentos
2. EAI-002-actividades
3. EAI-003-gamificacion
4. EAI-004-analytics
5. EAI-005-admin-base
6. EAI-006-configuracion-sistema
7. EAI-008-portal-admin

**Validaciones requeridas por EPIC:**
1. Estructura SCRUM completa:
   - README.md presente
   - _MAP.md presente
   - Carpeta requerimientos/ con RF-XXX-*.md
   - Carpeta especificaciones/ con ET-XXX-*.md
   - Carpeta historias-usuario/ con US-XXX-*.md
   - Carpeta tareas/ si aplica
   - implementacion/TRACEABILITY.yml

2. TRACEABILITY.yml:
   - Existe y tiene contenido
   - Mapea RF -> ET -> US
   - Links son validos

3. Coherencia:
   - RF documentados vs implementados
   - US documentadas vs en TRACEABILITY
   - Links cruzados funcionan

4. Metricas a extraer:
   - Story Points totales
   - Test coverage (si documentado)
   - Numero de HU
   - Numero de tareas

**Formato de salida esperado:**
Para cada EPIC, reportar:
- Estructura: OK/GAPS (listar faltantes)
- Traceability: Completa/Parcial/Minima/Falta
- US: X documentadas, Y en traceability
- Score: 0-100
- Estado: OK/GAPS/REESTRUCTURADO
- Gaps identificados (lista)
- Acciones requeridas (si hay gaps)

**Referencias:**
- Modelo de EPIC bien estructurada: EAI-003-gamificacion (usar como referencia)
- SSOT: docs/_SSOT/EPIC-INDEX.yml
- SSOT: docs/_SSOT/TRACEABILITY-MASTER.yml

**IMPORTANTE:**
- Lee los archivos reales para validar
- No asumas - verifica cada item
- Reporta gaps especificos con rutas
```

---

## Contexto Adicional Proporcionado

```yaml
archivos_referencia:
  - path: "docs/_MAP.md"
    proposito: "Entender estructura general de docs"

  - path: "docs/_SSOT/EPIC-INDEX.yml"
    proposito: "Obtener lista oficial de EPICs"

  - path: "docs/_SSOT/TRACEABILITY-MASTER.yml"
    proposito: "Verificar trazabilidad consolidada"

modelo_referencia:
  epic: "EAI-003-gamificacion"
  razon: "Mejor documentada, tiene EPIC-MANIFEST.yml"
  estructura:
    - README.md
    - _MAP.md
    - EPIC-MANIFEST.yml
    - requerimientos/
    - especificaciones/
    - historias-usuario/
    - tareas/
    - implementacion/TRACEABILITY.yml
```

---

## Resultado Obtenido

```yaml
resultado:
  epics_analizadas: 7
  score_promedio: 61

  por_epic:
    EAI-001:
      score: 85
      estado: "OK"
      estructura: "Completa"
      traceability: "760+ lineas"
      gaps: []

    EAI-002:
      score: 80
      estado: "OK"
      estructura: "Completa"
      traceability: "Parcial"
      gaps:
        - "US-ACT-001 a 008 no en TRACEABILITY"

    EAI-003:
      score: 90
      estado: "OK (MODELO)"
      estructura: "Completa + EPIC-MANIFEST"
      traceability: "Completa"
      gaps:
        - "US-GAM-001, 002, 007 no en TRACEABILITY"

    EAI-004:
      score: 40
      estado: "GAPS"
      estructura: "GAPS"
      traceability: "Minima"
      gaps:
        - "CRITICO: 0 requerimientos formales"
        - "CRITICO: 0 especificaciones"
        - "100% US huerfanas"
      accion: "P0-001"

    EAI-005:
      score: 45
      estado: "GAPS"
      estructura: "GAPS"
      traceability: "Minima"
      gaps:
        - "CRITICO: 0 requerimientos formales"
        - "CRITICO: 0 especificaciones"
        - "100% US huerfanas"
      accion: "P0-002"

    EAI-006:
      score: 70
      estado: "OK"
      estructura: "Completa"
      traceability: "Parcial"
      gaps:
        - "US no en TRACEABILITY"

    EAI-008:
      score: 60
      estado: "REESTRUCTURADO"
      estructura: "Solo _MAP"
      traceability: "Parcial"
      gaps:
        - "Legacy en archivados/"
```

---

## Notas de Ejecucion

- Subagente ejecutado en paralelo con SA-002 a SA-006
- Tiempo de ejecucion: ~3 minutos
- Archivos leidos: ~15
- Gaps criticos identificados: 2 (EAI-004, EAI-005)

---

**Generado:** 2026-01-20
