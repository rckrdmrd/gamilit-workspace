# ANÁLISIS DETALLADO: AdminContentPage

**Fecha:** 2025-11-26
**Página:** 5 de 12
**Estado:** ANÁLISIS COMPLETADO

---

## PROBLEMAS IDENTIFICADOS

### CRÍTICOS (P0)

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 1 | **Endpoint mismatch** | api.config.ts:224-227 | Frontend usa /admin/approvals, backend /admin/content → 404 |
| 2 | **Response format mismatch** | Hook vs Backend | {data,total} vs {items,pagination} |
| 3 | **Preview modal incompleto** | AdminContentPage.tsx:276 | No muestra detalles del ejercicio |

### ALTOS (P1)

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 4 | **Mapeo PendingContent pierde metadata** | AdminContentPage.tsx:71-79 | Preview incompleto |
| 5 | **useCallback deps incorrectas** | useContentManagement.ts:120 | Múltiples fetch |

---

## PLAN DE CORRECCIONES

### FASE A: Fix endpoints (P0)
1. Cambiar `admin.approvals` → `admin.content` en api.config.ts

### FASE B: Fix response format (P0)
2. Normalizar respuesta en hook para aceptar ambos formatos

### FASE C: Mejoras UI (P1)
3. Mejorar mapeo de contenido
4. Agregar validaciones

