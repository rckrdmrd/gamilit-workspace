# PLAN DE EJECUCION: BUG-TYPEORM-001 - TypeORM Relation Module Not Found

**Agente:** Backend-Agent
**Tipo de tarea:** Bug / Correccion
**Prioridad:** P0
**Fecha creacion:** 2026-01-08
**Relacionado con:** CORRECCION-ERRORES-RUNTIME-2026-01-07 (v1.4.0)

---

## OBJETIVO

Corregir el error `TypeORMError: Relation with property path module in entity was not found` en el endpoint `/api/v1/teacher/classrooms/:id/students`.

**Criterios de Aceptacion:**
- [x] Endpoint responde sin error 500
- [x] Metodo `getTotalExercisesForClassroom()` funciona correctamente
- [x] Backend compila sin errores
- [x] Documentacion actualizada

---

## ANALISIS PREVIO

### Contexto

El metodo `getTotalExercisesForClassroom()` usaba TypeORM QueryBuilder con `.innerJoin('e.module', 'm')`, pero la entidad `Exercise` no tiene una relacion TypeORM definida hacia `Module`.

### Estado Actual

- Entity `Exercise`: Solo tiene `module_id` como columna UUID
- Entity `Module`: Sin relacion inversa definida
- Patron raw SQL: Ya usado en otros metodos del mismo servicio

### Anti-Duplicacion

```bash
# Comandos ejecutados para verificar
grep -rn "\.module" apps/backend/src/modules/teacher/

# Resultado: Solo en comentarios (FIX ya aplicado)
```

---

## DISENO DE SOLUCION

### Approach Seleccionado

Cambiar de TypeORM QueryBuilder a raw SQL para el join entre `exercises` y `modules`.

### Componentes a Modificar

**Backend:**
- [x] Service: `teacher-classrooms-crud.service.ts` - metodo `getTotalExercisesForClassroom()`

---

## CICLOS DE EJECUCION

### Ciclo 1: Implementar Fix

**Duracion estimada:** 5 min
**Objetivo:** Reemplazar QueryBuilder con raw SQL

**Cambio:**
```typescript
// ANTES:
private async getTotalExercisesForClassroom(): Promise<number> {
  const count = await this.exerciseRepo
    .createQueryBuilder('e')
    .innerJoin('e.module', 'm')  // ERROR
    .where('e.is_active = :isActive', { isActive: true })
    .andWhere('m.is_published = :isPublished', { isPublished: true })
    .getCount();
  return count || 50;
}

// DESPUES:
private async getTotalExercisesForClassroom(): Promise<number> {
  const sql = `
    SELECT COUNT(*) as count
    FROM educational_content.exercises e
    INNER JOIN educational_content.modules m ON m.id = e.module_id
    WHERE e.is_active = true
      AND m.is_published = true
  `;
  const result = await this.dataSource.query(sql);
  return parseInt(result[0]?.count || '0') || 50;
}
```

**Artefactos:**
- `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

### Ciclo 2: Validacion

**Duracion estimada:** 10 min
**Objetivo:** Verificar compilacion y funcionamiento

**Validaciones:**
```bash
# Backend
cd apps/backend && npx tsc --noEmit
# Debe compilar sin errores

# Test endpoint
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3006/api/v1/teacher/classrooms/00000000-0000-0000-0000-000000000001/students?limit=100"
# Debe retornar 401 (auth required) o 200 (si autenticado), NO 500
```

**Criterios de exito:**
- [x] TypeScript compila sin errores
- [x] Endpoint no retorna 500

---

## DEPENDENCIAS

### Depende de:
- Ninguna

### Bloquea:
- Funcionalidad de monitoring en Teacher Portal

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Query SQL incorrecta | Baja | Alto | Validar con recreacion de BD |
| Otros metodos con mismo patron | Media | Medio | Busqueda exhaustiva realizada |

---

## ESTIMACIONES

**Tiempo total estimado:** 50 min

**Desglose:**
- Analisis: 15 min
- Ejecucion: 5 min
- Validacion: 10 min
- Documentacion: 20 min

---

## DOCUMENTACION A GENERAR

**Durante ejecucion:**
- [x] 03-EJECUCION.md

**Post-ejecucion:**
- [x] 04-VALIDACION.md
- [x] Actualizacion de CORRECCION-ERRORES-RUNTIME-2026-01-07.md (ya incluido en v1.4.0)

---

## CRITERIOS DE EXITO

La tarea se considera **COMPLETADA** cuando:

- [x] Fix implementado
- [x] Backend compila sin errores
- [x] Endpoint funciona (no error 500)
- [x] Documentacion completa
- [x] Sin errores de compilacion

---

**Version:** 1.0
**Ultima actualizacion:** 2026-01-08
**Aprobado para ejecucion:** Si
