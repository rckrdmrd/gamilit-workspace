# TASK-2026-01-18-004: Contexto
## Fase C - Contexto del Ciclo CAPVED

**Fecha:** 2026-01-18
**Estado:** Completada

---

## 1. Origen de la Solicitud

**Tarea origen:** Incidente en produccion - Error 400 en /teacher/monitoring
**Tipo de origen:** Bug report - Error HTTP 400 Bad Request

Al acceder a la pagina /teacher/monitoring del portal de maestros, el sistema retornaba
Error 400 Bad Request al intentar cargar los datos del classroom. El error ocurria
al llamar al endpoint `GET /teacher/classrooms/:id`.

---

## 2. Clasificacion

| Atributo | Valor |
|----------|-------|
| **Tipo** | bug-fix |
| **Prioridad** | P0-CRITICAL |
| **Capa** | Database (Seeds) |
| **Modulo** | teacher-portal/monitoring |
| **Epic** | EXT-001-portal-maestros |

---

## 3. Proyecto Afectado

- **Proyecto:** Gamilit
- **Ruta:** /home/isem/workspace-v2/projects/gamilit/
- **Ambiente:** development, staging, production

---

## 4. Estado Actual (Antes del Fix)

### Problema
El UUID `00000000-0000-0000-0000-000000000001` usado en seeds NO es valido segun RFC 4122:

1. **Version UUID incorrecta**:
   - RFC 4122 requiere version en posicion 13: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
   - El UUID tenia `0` en posicion 13, no `4` (version 4)

2. **Variante incorrecta**:
   - Posicion 17 debe ser `8`, `9`, `a`, o `b`
   - El UUID tenia `0` en posicion 17

3. **ParseUUIDPipe de NestJS**:
   - Valida estrictamente UUIDs segun RFC 4122
   - Rechazaba el UUID con Error 400 Bad Request

### Ubicacion del UUID Problematico
```sql
-- apps/database/seeds/dev/social_features/02-classrooms.sql
-- Linea ~105: UUID del classroom DEFAULT
'00000000-0000-0000-0000-000000000001'::uuid
```

### Consecuencia Adicional
- Los teachers con rol `admin_teacher` o `super_admin` no tenian entrada en `teacher_classrooms`
- Resultaba en Error 403 Forbidden para teachers diferentes al owner

---

## 5. Comportamiento Esperado

El sistema debe:
1. Usar UUIDs validos segun RFC 4122 version 4
2. Todos los teachers deben tener acceso al classroom DEFAULT
3. El endpoint `GET /teacher/classrooms/:id` debe retornar 200 OK

---

## 6. Criterios de Exito

| Criterio | Metrica |
|----------|---------|
| UUID valido RFC 4122 v4 | Posicion 13 = `4`, Posicion 17 = `8/9/a/b` |
| ParseUUIDPipe acepta | No Error 400 |
| Teachers sincronizados | 2+ entries en teacher_classrooms |
| Database recreada | 0 errores en seeds |

---

## 7. Dependencias

### Depende de:
- Schema `social_features` existente
- Tabla `social_features.classrooms` creada
- Tabla `social_features.teacher_classrooms` creada

### Bloqueada por:
- Ninguna

### Bloquea:
- TASK-2026-01-18-005 (requiere classroom valido)

---

## 8. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Otros UUIDs invalidos en seeds | Media | Alto | Busqueda exhaustiva |
| Relaciones FK rotas | Baja | Alto | ON CONFLICT manejado |
| Seeds no re-ejecutables | Baja | Medio | UPSERT patterns |

---

## Referencias

- Analisis original: `orchestration/analisis/ANALISIS-TEACHER-MONITORING-400-2026-01-18.md`
- RFC 4122: https://tools.ietf.org/html/rfc4122
- NestJS ParseUUIDPipe: https://docs.nestjs.com/pipes#built-in-pipes
