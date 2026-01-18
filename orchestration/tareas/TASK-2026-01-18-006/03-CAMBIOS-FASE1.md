# Fase 1: Cambios Realizados

**Tarea:** TASK-2026-01-18-006
**Fecha:** 2026-01-18
**Fase:** 1 - Correcciones Críticas

---

## Resumen de Cambios

### Archivo Modificado
`apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx`

### Problema Corregido
- **E2:** AnimatePresence mode="wait" con múltiples children
- **E3:** Maximum update depth exceeded (loop infinito)

### Causa Raíz
`AnimatePresence` con `mode="wait"` requiere UN SOLO hijo directo con key única.
El código anterior tenía:
1. Fragment `<>...</>` con múltiples `SkeletonRow` cuando `loading=true`
2. Múltiples `TableRow` cuando había datos

Esto causaba que Framer Motion intentara animar múltiples elementos simultáneamente,
generando un loop infinito de re-renders.

---

## Cambio Aplicado

### Antes (líneas 381-401):
```tsx
<tbody>
  <AnimatePresence mode="wait">
    {loading ? (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </>
    ) : data.length === 0 ? (
      <EmptyState />
    ) : (
      data.map((attempt, index) => (
        <TableRow
          key={attempt.id}
          attempt={attempt}
          index={index}
          onView={onViewDetail}
        />
      ))
    )}
  </AnimatePresence>
</tbody>
```

### Después (líneas 381-394):
```tsx
<tbody>
  {loading
    ? [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={`skeleton-${i}`} />)
    : data.length === 0
      ? <EmptyState />
      : data.map((attempt, index) => (
          <TableRow
            key={attempt.id}
            attempt={attempt}
            index={index}
            onView={onViewDetail}
          />
        ))
  }
</tbody>
```

### Import actualizado (línea 14):
```diff
- import { motion, AnimatePresence } from 'framer-motion';
+ import { motion } from 'framer-motion';
```

---

## Justificación Técnica

1. **Se removió AnimatePresence** porque:
   - No es necesario para animar filas de tabla
   - `TableRow` ya tiene `motion.tr` con animaciones individuales
   - Las animaciones de entrada (`initial`, `animate`) funcionan sin AnimatePresence

2. **Se mantienen las animaciones** en `TableRow`:
   ```tsx
   <motion.tr
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.2, delay: index * 0.02 }}
   >
   ```

3. **Beneficios:**
   - Elimina el loop infinito de re-renders
   - Mantiene animaciones suaves de entrada
   - Código más simple y mantenible

---

## Validación

```bash
# Build
npm run build
✓ built in 19.46s

# Lint
npm run lint
✖ 237 problems (0 errors, 237 warnings)
# Todos los warnings son preexistentes, no relacionados con este cambio
```

---

## Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `ResponsesTable.tsx` | Removido AnimatePresence, simplificado render condicional |

---

## Próximos Pasos

- [x] Fase 1 completada
- [ ] Fase 2: Agregar `requires_manual_review` (backend + frontend)
- [ ] Fase 2: Agregar columna "Estado" a tabla
- [ ] Fase 2: Agregar filtro de Módulo
