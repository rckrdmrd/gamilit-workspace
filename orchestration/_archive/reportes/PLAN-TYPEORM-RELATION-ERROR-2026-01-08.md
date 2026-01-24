# PLAN DE EJECUCION: BE-FIX-004 - TypeORM Relation Not Found Error

**Agente:** Backend-Agent
**Tipo de tarea:** Bug Fix / Correccion
**Prioridad:** P0 (Critico)
**Fecha creacion:** 2026-01-08
**Relacionado con:** [ANALISIS-TYPEORM-RELATION-ERROR-2026-01-08.md]

---

## OBJETIVO

Corregir el error de TypeORM que impide cargar estudiantes en el dashboard del teacher.

**Error a corregir:**
```
TypeORMError: Relation with property path module in entity was not found.
GET /api/v1/teacher/classrooms/:id/students (500 Internal Server Error)
```

**Criterios de Aceptacion:**
- [x] El endpoint `/api/v1/teacher/classrooms/:id/students` responde sin errores
- [x] TypeScript compila sin errores
- [x] La logica de negocio se mantiene (contar ejercicios activos de modulos publicados)
- [x] El patron es consistente con otros metodos del archivo

---

## ANALISIS PREVIO

### Contexto
El metodo `getTotalExercisesForClassroom()` usa TypeORM QueryBuilder con `.innerJoin('e.module', 'm')` pero la entidad `Exercise` no tiene una relacion `@ManyToOne` definida hacia `Module`.

### Estado Actual
- La entidad `Exercise` tiene `module_id` como columna UUID simple
- No existe `@ManyToOne(() => Module)` en la entidad
- Otros metodos del mismo archivo ya usan raw SQL para este tipo de joins

### Anti-Duplicacion
```bash
# Verificacion ejecutada
grep -rn "\.innerJoin.*e\.module" apps/backend/src/

# Resultado: Solo 1 ocurrencia en el archivo a modificar
# teacher-classrooms-crud.service.ts:1125
```

---

## DISENO DE SOLUCION

### Approach Seleccionado
Convertir de TypeORM QueryBuilder a raw SQL, siguiendo el patron establecido.

**Alternativas consideradas:**
1. Agregar relacion @ManyToOne a Entity - Descartado por riesgo de efectos secundarios
2. Usar subqueries - Descartado por complejidad innecesaria

### Componentes a Crear/Modificar

**Database:**
- [ ] Schema: Ninguno (sin cambios DDL)
- [ ] Tablas: Ninguna
- [ ] Funciones: Ninguna
- [ ] Triggers: Ninguno
- [ ] Seeds: Ninguno

**Backend:**
- [ ] Entities: Ninguna (no se modifica la entidad)
- [x] Services: `TeacherClassroomsCrudService.getTotalExercisesForClassroom()`
- [ ] Controllers: Ninguno
- [ ] DTOs: Ninguno

**Frontend:**
- No aplica

---

## CICLOS DE EJECUCION

### Ciclo 1: Correccion del Metodo
**Objetivo:** Reemplazar QueryBuilder por raw SQL

**Codigo ANTES:**
```typescript
private async getTotalExercisesForClassroom(): Promise<number> {
  const count = await this.exerciseRepo
    .createQueryBuilder('e')
    .innerJoin('e.module', 'm')  // ERROR: Relacion no definida
    .where('e.is_active = :isActive', { isActive: true })
    .andWhere('m.is_published = :isPublished', { isPublished: true })
    .getCount();

  return count || 50;
}
```

**Codigo DESPUES:**
```typescript
private async getTotalExercisesForClassroom(): Promise<number> {
  // FIX-2026-01-08: Usar raw SQL para join entre exercises y modules
  // TypeORM QueryBuilder NO soporta .innerJoin('e.module', ...) sin relacion definida
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

**Artefactos generados:**
- Archivo modificado: `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Validacion:**
```bash
# Compilacion TypeScript
cd apps/backend && npx tsc --noEmit
```

**Criterios de exito:**
- [x] Sin errores de compilacion
- [x] Patron consistente con otros metodos

---

### Ciclo 2: Validacion Final
**Objetivo:** Validar integracion completa

**Validaciones:**
```bash
# Backend
cd apps/backend && npx tsc --noEmit
# Debe compilar sin errores
```

**Checklist de Validacion:**
- [x] Backend compila sin errores
- [x] Documentacion actualizada
- [x] Reporte actualizado (v1.4.0)

---

## DEPENDENCIAS

### Depende de:
- Ninguna tarea pendiente

### Bloquea:
- Dashboard del Teacher (funcionalidad critica)

### Requerimientos externos:
- Ninguno

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Error de sintaxis SQL | Baja | Alto | Usar patron existente como referencia |
| Cambio de logica | Baja | Alto | SQL equivalente al QueryBuilder original |

---

## ESTIMACIONES

**Tiempo total estimado:** 30 minutos

**Desglose:**
- Analisis: 10 min
- Desarrollo: 5 min
- Testing: 5 min
- Documentacion: 10 min

**Recursos necesarios:**
- Agentes: Backend-Agent
- Subagentes: Ninguno

---

## DOCUMENTACION A GENERAR

**Durante ejecucion:**
- [x] Comentarios inline en codigo explicando el FIX

**Post-ejecucion:**
- [x] ANALISIS-TYPEORM-RELATION-ERROR-2026-01-08.md
- [x] PLAN-TYPEORM-RELATION-ERROR-2026-01-08.md
- [x] VALIDACION-TYPEORM-RELATION-ERROR-2026-01-08.md
- [x] Actualizacion de CORRECCION-ERRORES-RUNTIME-2026-01-07.md (v1.4.0)

---

## CRITERIOS DE EXITO

La tarea se considera **COMPLETADA** cuando:

- [x] Metodo corregido con raw SQL
- [x] TypeScript compila sin errores
- [x] Documentacion completa
- [x] Cumple patron establecido
- [x] Logica de negocio preservada

---

## REFERENCIAS

**Documentacion del proyecto:**
- orchestration/reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md

**Archivos de referencia:**
- `getStudentsCurrentActivity()` en teacher-classrooms-crud.service.ts (lineas 1084-1096)
- `getStudentsWithSearch()` en teacher-classrooms-crud.service.ts (lineas 889-941)

---

**Version:** 1.0
**Ultima actualizacion:** 2026-01-08
**Aprobado para ejecucion:** Si
