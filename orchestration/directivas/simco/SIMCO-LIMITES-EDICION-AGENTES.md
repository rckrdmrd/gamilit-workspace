# SIMCO-LIMITES-EDICION-AGENTES.md

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Tipo:** Quick Reference
**Relacionado:** SIMCO-EDICION-SEGURA.md

---

## Límites de Edición por Agente

| Agente | Límite Líneas | Acción si Excede |
|--------|---------------|------------------|
| **Claude Code** | 50 | Partir en subtareas |
| **Gemini CLI** | **30** | DETENER y partir |
| **Trae** | 40 | Checkpoint y partir |
| **Windsurf** | 50 | Reportar y esperar |

---

## Verificación Obligatoria Post-Edición

```bash
# Ejecutar después de CADA edición:
./scripts/validation/validate-no-placeholders.sh {archivo}

# O verificar todos los archivos modificados:
./scripts/validation/validate-no-placeholders.sh --all

# O solo archivos staged:
./scripts/validation/validate-no-placeholders.sh --staged
```

---

## Patrones Prohibidos (Todos los Agentes)

```
✗ // ...
✗ // ... existing code ...
✗ // resto del código
✗ // [código anterior]
✗ /* ... */
✗ TODO: implementar (sin implementación)
```

---

## Protocolo por Agente

### Claude Code (50 líneas)
```yaml
limite: 50
herramienta: "Edit (old_string → new_string)"
si_excede: "Proponer partición en subtareas < 50 líneas"
verificacion: "Automática antes de aplicar"
```

### Gemini CLI (30 líneas - MÁS ESTRICTO)
```yaml
limite: 30  # Más estricto por tendencia a resumir
herramienta: "Edición localizada por líneas"
si_excede: "DETENER inmediatamente y pedir partición"
verificacion: "grep + validate-no-placeholders.sh"
advertencia: "Gemini CLI tiende a crear placeholders - verificar siempre"
```

### Trae (40 líneas)
```yaml
limite: 40
herramienta: "Edición localizada"
si_excede: "Crear checkpoint, partir, continuar"
verificacion: "Manual + build"
```

### Windsurf (50 líneas)
```yaml
limite: 50
herramienta: "Seguir instrucciones literales del plan"
si_excede: "Reportar y esperar nuevas instrucciones"
verificacion: "Build + lint después de cada archivo"
nota: "Si el plan tiene placeholders, Windsurf los copiará"
```

---

## Flujo de Cambio Grande

```
SI cambio > límite de agente:
  1. DETENER
  2. REPORTAR: "Cambio afecta X líneas, excede límite de Y"
  3. PROPONER partición en subtareas
  4. ESPERAR aprobación
  5. EJECUTAR una subtarea a la vez
  6. VALIDAR entre cada subtarea
```

---

## Aliases

```
@LIMITES-EDICION     - Este documento
@VALIDAR-PLACEHOLDERS - scripts/validation/validate-no-placeholders.sh
@EDICION-SEGURA      - SIMCO-EDICION-SEGURA.md (directiva completa)
```

---

## Referencias

- Directiva completa: `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
- Roles de agentes: `orchestration/agents/AGENT-ROLES.md`
- Flujo optimizado: `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`
