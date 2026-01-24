# Mapa de Contenidos: Templates

**Propósito:** Templates reutilizables para prompts de subagentes, epicas y documentación
**Archivos totales:** 10
**Última actualización:** 2026-01-18

---

## Archivos

```
templates/
├── EPIC-MANIFEST-TEMPLATE.yml       # Template para EPIC-MANIFEST.yml
├── COMPLETENESS-ROADMAP-TEMPLATE.yml # Template para roadmap de epicas parciales
├── TASK-TEMPLATE.md                 # Template basico de tarea
├── TEMPLATE-ANALISIS.md             # Template de analisis
├── TEMPLATE-CONTEXTO-SUBAGENTE.md   # Contexto para subagentes
├── TEMPLATE-PLAN.md                 # Template de plan
├── TEMPLATE-TAREA-7-FASES.md        # Tarea con 7 fases
├── TEMPLATE-VALIDACION.md           # Template de validacion
├── TEMPLATES-SUBAGENTES.md          # Templates de subagentes consolidados
└── _MAP.md                          # Este archivo
```

---

## Templates de Epicas (NUEVO)

| Template | Proposito | Ubicacion Destino |
|----------|-----------|-------------------|
| EPIC-MANIFEST-TEMPLATE.yml | Metadatos completos de epica | docs/XX-fase-*/EPIC-XXX/EPIC-MANIFEST.yml |
| COMPLETENESS-ROADMAP-TEMPLATE.yml | Roadmap para epicas parciales | docs/XX-fase-*/EPIC-XXX/COMPLETENESS-ROADMAP.yml |

### Ejemplos Implementados:
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/EPIC-MANIFEST.yml` (epica modelo)
- `docs/03-fase-extensiones/EXT-007-lti-integration/COMPLETENESS-ROADMAP.yml` (epica parcial)

---

## Templates de Subagentes

Ver `TEMPLATES-SUBAGENTES.md` para todos los templates:

1. **T-README-SUBAGENTE** - Documentacion de subagente
2. **T-TRAZA-SUBAGENTE** - Traza de ejecucion
3. **T-OUTPUT-SUBAGENTE** - Output final
4. **T-ANALISIS-FEATURE** - Analisis de feature
5. **T-PLAN-IMPLEMENTACION** - Plan de implementacion
6. **T-EJECUCION-BACKEND** - Prompt para backend
7. **T-EJECUCION-FRONTEND** - Prompt para frontend
8. **T-EJECUCION-DATABASE** - Prompt para database
9. **T-VALIDACION** - Prompt para validacion

---

## Uso de Templates

### Para documentar una epica:
1. Copiar EPIC-MANIFEST-TEMPLATE.yml
2. Adaptar con datos de la epica especifica
3. Guardar en `docs/XX-fase-*/EPIC-XXX/EPIC-MANIFEST.yml`

### Para epicas parciales (completion < 100%):
1. Copiar COMPLETENESS-ROADMAP-TEMPLATE.yml
2. Definir fases de completitud
3. Guardar en `docs/XX-fase-*/EPIC-XXX/COMPLETENESS-ROADMAP.yml`

### Para crear documentacion de subagente:
1. Copiar T-README-SUBAGENTE
2. Adaptar con datos del subagente especifico
3. Guardar en `orchestration/03-subagentes/SA-{ID}/README.md`

### Para lanzar subagente:
1. Seleccionar template apropiado (T-EJECUCION-*)
2. Adaptar con contexto especifico
3. Usar con Task tool

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-18
**Version:** 2.0
