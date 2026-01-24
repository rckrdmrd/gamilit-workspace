# Reporte de Corrección: Routing Teacher Assignments

**Fecha:** 2025-12-18
**Tipo:** Corrección de Bug
**Severidad:** Crítica
**Estado:** Completado

---

## 1. PROBLEMA IDENTIFICADO

### Error Reportado
```
GET http://localhost:3006/api/v1/teacher/assignments/upcoming?days=7 500 (Internal Server Error)
QueryFailedError: invalid input syntax for type uuid: "upcoming"
```

### Ubicación del Error
- **Frontend:** `TeacherDashboard.tsx:132` - función `fetchUpcomingDeadlines()`
- **Backend:** `assignments.service.ts:104` - método `findOne()`

### Causa Raíz
En NestJS, las rutas se evalúan en **orden de declaración** dentro del controlador. La ruta genérica `@Get(':id')` estaba declarada **ANTES** de la ruta específica `@Get('upcoming')`, causando que "upcoming" fuera capturado como el parámetro `:id`.

```
ORDEN INCORRECTO (Antes):
  Línea 82:  @Get()           → /teacher/assignments
  Línea 133: @Get(':id')      → /teacher/assignments/:id   ← CAPTURA "upcoming"
  ...
  Línea 583: @Get('upcoming') → /teacher/assignments/upcoming  ← NUNCA ALCANZADA
```

---

## 2. SOLUCIÓN IMPLEMENTADA

### Archivo Modificado
```
apps/backend/src/modules/assignments/controllers/assignments.controller.ts
```

### Cambio Realizado
Movido el método `getUpcoming()` de la línea 583 a la línea 128 (después de `findAll()` y antes de `findOne()`).

### Orden Correcto (Después)
```
  @Get()              → /teacher/assignments
  @Get('upcoming')    → /teacher/assignments/upcoming  ← ESPECÍFICA PRIMERO
  @Get(':id')         → /teacher/assignments/:id       ← GENÉRICA DESPUÉS
```

### Comentario Agregado al Código
```typescript
/**
 * GET /api/teacher/assignments/upcoming
 * Get assignments with upcoming deadlines
 * BAJO-008: Upcoming assignments for Teacher Dashboard
 *
 * NOTE: This route MUST be declared BEFORE @Get(':id') to prevent
 * NestJS from interpreting 'upcoming' as an ID parameter.
 */
@Get('upcoming')
```

---

## 3. VALIDACIÓN

### Verificación de Compilación
```bash
npm run build  # Sin errores
```

### Verificación de Rutas Registradas
Los logs de NestJS confirman el orden correcto:
```
Mapped {/api/v1/teacher/assignments, POST} route
Mapped {/api/v1/teacher/assignments, GET} route
Mapped {/api/v1/teacher/assignments/upcoming, GET} route  ← ANTES
Mapped {/api/v1/teacher/assignments/:id, GET} route       ← DESPUÉS
```

### Impacto en Frontend
- Ningún cambio requerido en el frontend
- El endpoint `/teacher/assignments/upcoming` funciona correctamente
- TeacherDashboard puede cargar "Próximas Fechas Límite"

---

## 4. DOCUMENTACIÓN ACTUALIZADA

| Documento | Tipo de Actualización |
|-----------|----------------------|
| `BACKEND_INVENTORY.yml` | Agregada sección `teacher_assignments` con orden definitivo de rutas |
| `assignments.controller.ts` | Agregado comentario explicativo sobre orden de rutas |

---

## 5. LECCIONES APRENDIDAS

### Patrón a Seguir en NestJS
En controladores NestJS, SIEMPRE declarar rutas en este orden:
1. Rutas estáticas sin parámetros (`/`, `/upcoming`, `/stats`)
2. Rutas con sub-paths específicos (`/:id/submissions`)
3. Rutas genéricas con parámetros (`:id`) al FINAL

### Referencia de Controladores con Patrón Correcto
- `ranks.controller.ts` - `@Get('current')` antes de `@Get(':id')`
- `modules.controller.ts` - `@Get('search')` antes de `@Get(':id')`

---

## 6. ARCHIVOS AFECTADOS

| Archivo | Cambio |
|---------|--------|
| `apps/backend/src/modules/assignments/controllers/assignments.controller.ts` | Reordenamiento de método `getUpcoming()` |
| `orchestration/inventarios/BACKEND_INVENTORY.yml` | Documentación de orden de rutas |
| `orchestration/reportes/CORRECCION-ROUTING-TEACHER-ASSIGNMENTS-2025-12-18.md` | Este reporte |

---

## 7. RELACIONADO

- **Requisito:** BAJO-008 - TeacherDashboard Fechas Límite
- **Documento de Análisis:** `orchestration/analisis/ANALISIS-COHERENCIA-DATASOURCES-BD-DOC-2025-12-18.md`

---

**Autor:** Claude Opus 4.5
**Revisado por:** Pendiente
