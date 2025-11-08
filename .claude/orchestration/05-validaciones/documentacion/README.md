# Validaciones vs Documentación

Validaciones de coherencia entre implementación y documentación.

## Estructura

- `casos-uso/` - Validaciones contra UC-* (Casos de Uso)
- `especificaciones/` - Validaciones contra specs técnicas
- `reportes/` - Reportes de discrepancias

## Formato de Reportes

Cada reporte debe seguir el formato:

```markdown
# Validación vs Documentación: [UC-XXX o Spec]

**Fecha:** YYYY-MM-DD
**Documento origen:** [Ruta al documento]
**Estado:** ✅ COMPLETO / ⚠️ PARCIAL / ❌ NO IMPLEMENTADO

## Requisitos

### Funcionales
- ✅ RF-001: Descripción (implementado)
- ⚠️ RF-002: Descripción (parcial)
- ❌ RF-003: Descripción (faltante)

### No Funcionales
- ✅ RNF-001: Descripción (cumplido)
- ⚠️ RNF-002: Descripción (parcial)

## Discrepancias

1. **RF-XXX:** Descripción de la discrepancia
2. **RNF-YYY:** Descripción de la discrepancia

## Funcionalidad Extra

[Funcionalidad implementada pero no especificada]

## Recomendaciones

[Acciones para resolver discrepancias]

## Próximos Pasos

- [ ] Acción 1
- [ ] Acción 2
```
