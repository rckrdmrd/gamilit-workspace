# CHECKLIST: NORMALIZACION DOCUMENTAL

**Version:** 1.0.0  
**Alias:** @DEF_CHK_DOC_NORMALIZATION  
**Aplica a:** `docs/` y `orchestration/`

## Objetivo

Validar segmentacion, no duplicacion y descubrimiento eficiente por mapas.

## Checklist

### Estructura

- [ ] Cada directorio con 3+ archivos tiene `_INDEX`.
- [ ] Cada directorio con 5+ archivos tiene `_MAP`.
- [ ] `README` funciona como entrada, no como contenedor monolitico.

### SSOT y duplicidad

- [ ] Cada concepto canonico tiene una sola fuente principal.
- [ ] Documentos satelite enlazan SSOT y no copian bloques largos.
- [ ] Metricas se leen desde `orchestration/inventarios/MASTER_INVENTORY.yml`.

### Carga de contexto para agentes

- [ ] Existe ruta de entrada por mapa (`docs/_MAP.md`, `orchestration/CONTEXT-MAP.yml`).
- [ ] Las rutas de Claude/Gemini/Trae/Cursor apuntan a archivos vigentes.
- [ ] La localizacion de definiciones se resuelve en <= 3 saltos.

### Integridad de enlaces

- [ ] No hay enlaces locales rotos en archivos modificados.
- [ ] Aliases documentados resuelven a rutas reales.
