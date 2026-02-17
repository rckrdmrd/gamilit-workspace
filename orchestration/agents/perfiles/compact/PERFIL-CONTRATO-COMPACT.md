# CONTRATO TRANSVERSAL DE PERFILES COMPACT

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Aplica a:** perfiles compact en `orchestration/agents/perfiles/compact/`

---

## Objetivo

Estandarizar perfiles compact para subagentes con contexto mínimo verificable y salida accionable.

---

## Estructura minima compact

1. `IDENTIDAD`
2. `CONTEXTO MINIMO`
3. `COMPORTAMIENTO OBLIGATORIO`
4. `REPORTE DE SALIDA`

---

## Contrato minimo de entrada

```yaml
input_minimo:
  - subtarea_id
  - objetivo_claro
  - archivos_objetivo
  - restricciones
  - criterios_aceptacion
```

## Contrato minimo de salida

```yaml
output_minimo:
  - estado
  - archivos_creados_modificados
  - validaciones
  - siguiente_paso
```

---

## Regla de uso

- Perfil compact solo en modo subagente.
- No ejecutar CCA completo, usar CCA ligero de `SIMCO-SUBAGENTE.md`.
- No delegar a terceros desde un subagente.
