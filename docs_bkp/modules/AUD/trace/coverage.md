# Coverage Report - M-AUD

**Generado:** 2025-11-07 22:38:30
**Estado:** Generado automáticamente desde trace.yml

---

## Métricas Globales

| Métrica | Valor |
|---------|-------|
| Requerimientos Totales | 4 |
| Especificaciones Totales | 3 |
| Tests Totales | 0 |
| Objetos Totales (DB+BE+FE) | 11 |
|   - DB Objects | 9 |
|   - Backend Objects | 2 |
|   - Frontend Objects | 0 |

---

## Cobertura

| Tipo | Porcentaje | Detalle |
|------|------------|---------|
| REQ → SPEC | 75.0% | 3/4 requerimientos con especificación |
| REQ → TEST | 0.0% | 0/4 requerimientos con tests |
| REQ → OBJ | 275.0% | Requerimientos con objetos implementados |

---

## Detalle de Requerimientos

| ID | Título | SPEC | TEST | OBJ | Estado |
|---|---|---|---|---|---|
| `M-AUD-REQ-001` | M-AUD-REQ-001: Sistema de Auditoría | ✅ | ❌ | ⚠️ | implemented |
| `M-AUD-REQ-002` | M-AUD-REQ-002: Sistema de Alertas y Notificaciones | ✅ | ❌ | ⚠️ | implemented |
| `M-AUD-REQ-003` | M-AUD-REQ-003: Niveles de Logging y Configuración  | ✅ | ❌ | ⚠️ | implemented |
| `M-AUD-REQ-004` | M-AUD-REQ-004: Políticas de Retención y Eliminació | ❌ | ❌ | ⚠️ | implemented |

---

## Gaps Identificados

### Prioridad P0 (Crítico)

- ✅ Ninguno

### Prioridad P1 (Alto)

- ⚠️ REQ M-AUD-REQ-004 sin especificación técnica
- ⚠️ REQ M-AUD-REQ-001 sin tests
- ⚠️ REQ M-AUD-REQ-002 sin tests
- ⚠️ REQ M-AUD-REQ-003 sin tests
- ⚠️ REQ M-AUD-REQ-004 sin tests

### Prioridad P2 (Medio)

- ✅ Ninguno

---

## Recomendaciones

1. Completar especificaciones técnicas para todos los requerimientos
2. Implementar tests unitarios e integración para cada requerimiento
3. Mantener trace.yml actualizado con cada cambio
4. Revisar y actualizar cobertura mensualmente

---

**Nota:** Este reporte se genera automáticamente desde `trace/trace.yml`. No editar manualmente.
