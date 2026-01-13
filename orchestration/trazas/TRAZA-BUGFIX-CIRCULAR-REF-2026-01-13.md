# TRAZA BUGFIX - Circular Reference Stack Overflow

**Fecha:** 2026-01-13
**Tipo:** Bug Fix
**Prioridad:** P0 (Crítico)
**Estado:** COMPLETADO

---

## 1. RESUMEN EJECUTIVO

Corrección de dos errores críticos en el backend que causaban crashes del servidor:

1. **Error Principal:** `RangeError: Maximum call stack size exceeded` en `TransformResponseInterceptor`
2. **Error Secundario:** `Cannot set headers after they are sent to the client` en `AllExceptionsFilter`

---

## 2. ANÁLISIS DEL PROBLEMA

### 2.1 Error #1: Stack Overflow en TransformResponseInterceptor

**Ubicación:** `src/shared/interceptors/transform-response.interceptor.ts:65-73`

**Causa Raíz:**
- La función `transformDates()` recorre recursivamente objetos para convertir strings ISO a objetos Date
- No manejaba **referencias circulares** en los objetos
- TypeORM entities frecuentemente tienen relaciones bidireccionales (ej: `User.profile.user`)
- Al encontrar una referencia circular, la función entraba en recursión infinita

**Stack Trace:**
```
RangeError: Maximum call stack size exceeded
    at TransformResponseInterceptor.transformDates (transform-response.interceptor.ts:65:22)
    at Array.map (<anonymous>)
    at TransformResponseInterceptor.transformDates (transform-response.interceptor.ts:65:18)
    at TransformResponseInterceptor.transformDates (transform-response.interceptor.ts:73:35)
    [... recursión infinita ...]
```

### 2.2 Error #2: Headers Already Sent en AllExceptionsFilter

**Ubicación:** `src/shared/filters/http-exception.filter.ts:78`

**Causa Raíz:**
- Cuando ocurría el stack overflow, el interceptor podía haber iniciado el envío de la respuesta
- El `AllExceptionsFilter` intentaba enviar una respuesta de error
- Express ya había comenzado a enviar headers, causando el error secundario

**Stack Trace:**
```
Error: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (node:_http_outgoing:642:11)
    at AllExceptionsFilter.catch (http-exception.filter.ts:78:29)
```

---

## 3. SOLUCIÓN IMPLEMENTADA

### 3.1 Fix para TransformResponseInterceptor (v1.1.0)

**Cambios:**

1. **Detección de referencias circulares con WeakSet:**
   ```typescript
   const visited = new WeakSet();
   const transformedData = this.transformDates(data, visited, 0);
   ```

2. **Límite de profundidad de recursión:**
   ```typescript
   private static readonly MAX_DEPTH = 50;

   if (depth > TransformResponseInterceptor.MAX_DEPTH) {
     return obj;
   }
   ```

3. **Manejo de objetos ya visitados:**
   ```typescript
   if (visited.has(obj)) {
     return '[Circular Reference]';
   }
   visited.add(obj);
   ```

4. **Manejo especial para objetos Date:**
   ```typescript
   if (obj instanceof Date) {
     return obj;
   }
   ```

### 3.2 Fix para AllExceptionsFilter (v1.1.0)

**Cambios:**

1. **Verificación de headers antes de responder:**
   ```typescript
   if (response.headersSent) {
     logger.warn(`Headers already sent for ${request.method} ${request.url}`);
     return;
   }
   ```

2. **Try-catch para el envío de respuesta:**
   ```typescript
   try {
     response.status(status).json({ ... });
   } catch (sendError) {
     logger.error('Failed to send error response:', sendError);
   }
   ```

3. **Logging mejorado con contexto de request:**
   ```typescript
   console.error(`AllExceptionsFilter caught [${request.method} ${request.url}]:`,
     exception instanceof Error ? exception.message : exception);
   ```

---

## 4. ARCHIVOS MODIFICADOS

| Archivo | Versión | Cambios |
|---------|---------|---------|
| `src/shared/interceptors/transform-response.interceptor.ts` | 1.0.0 → 1.1.0 | +35 líneas, detección circular refs |
| `src/shared/filters/http-exception.filter.ts` | 1.0.0 → 1.1.0 | +15 líneas, verificación headers |

---

## 5. VALIDACIÓN

### 5.1 Build
```
✅ npm run build - PASSED (tsc compiled successfully)
```

### 5.2 Lint
```
✅ Archivos modificados sin errores nuevos
⚠️ 6 warnings preexistentes (no-explicit-any)
```

### 5.3 Pruebas de Regresión
```
✅ Health endpoint: healthy
✅ Database connection: OK
✅ No stack overflow errors en logs
✅ No "Cannot set headers" errors en logs
```

### 5.4 Servidor Dev
```
✅ Backend corriendo en http://localhost:3006
✅ 5 requests consecutivos sin errores
```

---

## 6. IMPACTO

### 6.1 Beneficios
- **Estabilidad:** Elimina crashes por referencias circulares
- **Resiliencia:** El servidor maneja errores gracefully sin crashes secundarios
- **Observabilidad:** Mejor logging para diagnóstico de problemas

### 6.2 Riesgos Mitigados
- Stack overflow por entities con relaciones bidireccionales
- Crashes en cascada por manejo incorrecto de errores
- Pérdida de requests por respuestas no enviadas

### 6.3 Compatibilidad
- **Breaking Changes:** Ninguno
- **Comportamiento Cambiado:** Referencias circulares ahora se muestran como `[Circular Reference]`

---

## 7. LECCIONES APRENDIDAS

1. **TypeORM + Recursión:** Las entities de TypeORM con `@ManyToOne`/`@OneToMany` bidireccionales crean referencias circulares. Cualquier función recursiva debe manejarlas.

2. **WeakSet para Detección:** `WeakSet` es ideal para tracking de objetos visitados porque no previene garbage collection.

3. **Defense in Depth:** El límite de profundidad (`MAX_DEPTH`) actúa como segunda línea de defensa.

4. **Headers Sent Check:** Siempre verificar `response.headersSent` antes de intentar enviar respuestas en exception filters.

---

## 8. REFERENCIAS

- **Commit:** Pendiente de commit
- **Issue:** N/A (detectado en runtime)
- **Documentación:** Este archivo

---

**Autor:** Claude Code
**Fecha Completado:** 2026-01-13
