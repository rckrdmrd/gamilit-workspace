---
id: "CORR-003-PLAN"
title: "Plan de Ejecucion - Error 400 ValidationError en Submit de Ejercicios"
type: "Plan"
status: "Done"
priority: "P0"
assignee: "@Orquestador"
related_task: "CORR-003"
affected_modules: ["progress"]
labels: ["correccion", "backend", "plan"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# CORR-003: Plan de Ejecucion - Error 400 ValidationError en Submit de Ejercicios

## 1. OBJETIVO

**Corregir el error 400 ValidationError eliminando los constructores problematicos de 9 DTOs de respuestas.**

### Criterios de Aceptacion

- [x] Los 9 DTOs NO tienen constructores
- [x] Compilacion TypeScript exitosa
- [x] El flujo de submit funciona correctamente
- [x] No hay regresiones en otros tipos de ejercicio

---

## 2. CICLOS DE EJECUCION

### Ciclo 1: Correccion de DTOs Modulo 3

**Objetivo:** Eliminar constructores de DTOs de Modulo 3 (Comprension Critica)

**Tareas:**
1. Eliminar constructor de `tribunal-opiniones-answers.dto.ts` (lineas 80-82)
2. Eliminar constructor de `matriz-perspectivas-answers.dto.ts` (lineas 28-30)

**Artefactos modificados:**
- `/apps/backend/src/modules/progress/dto/answers/tribunal-opiniones-answers.dto.ts`
- `/apps/backend/src/modules/progress/dto/answers/matriz-perspectivas-answers.dto.ts`

**Validacion:**
```bash
# Verificar que no hay constructores
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/tribunal-opiniones-answers.dto.ts
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/matriz-perspectivas-answers.dto.ts
```

---

### Ciclo 2: Correccion de DTOs Modulo 2

**Objetivo:** Eliminar constructores de DTOs de Modulo 2 (Comprension Inferencial)

**Tareas:**
1. Eliminar constructor de `detective-textual-answers.dto.ts`
2. Eliminar constructor de `construccion-hipotesis-answers.dto.ts`
3. Eliminar constructor de `prediccion-narrativa-answers.dto.ts`
4. Eliminar constructor de `rueda-inferencias-answers.dto.ts`

**Artefactos modificados:**
- `/apps/backend/src/modules/progress/dto/answers/detective-textual-answers.dto.ts`
- `/apps/backend/src/modules/progress/dto/answers/construccion-hipotesis-answers.dto.ts`
- `/apps/backend/src/modules/progress/dto/answers/prediccion-narrativa-answers.dto.ts`
- `/apps/backend/src/modules/progress/dto/answers/rueda-inferencias-answers.dto.ts`

**Validacion:**
```bash
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/detective-textual-answers.dto.ts
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/construccion-hipotesis-answers.dto.ts
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/prediccion-narrativa-answers.dto.ts
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/rueda-inferencias-answers.dto.ts
```

---

### Ciclo 3: Correccion de DTOs Auxiliares

**Objetivo:** Eliminar constructores de DTOs auxiliares (Discrepancy Fixes)

**Tareas:**
1. Eliminar constructor de `detective-connections-answers.dto.ts`
2. Eliminar constructor de `prediction-scenarios-answers.dto.ts`
3. Eliminar constructor de `cause-effect-matching-answers.dto.ts`

**Artefactos modificados:**
- `/apps/backend/src/modules/progress/dto/answers/detective-connections-answers.dto.ts`
- `/apps/backend/src/modules/progress/dto/answers/prediction-scenarios-answers.dto.ts`
- `/apps/backend/src/modules/progress/dto/answers/cause-effect-matching-answers.dto.ts`

**Validacion:**
```bash
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/detective-connections-answers.dto.ts
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/prediction-scenarios-answers.dto.ts
grep -n "constructor()" apps/backend/src/modules/progress/dto/answers/cause-effect-matching-answers.dto.ts
```

---

### Ciclo 4: Validacion Final

**Objetivo:** Verificar que todos los cambios son correctos y no hay regresiones

**Tareas:**
1. Verificar que NO hay constructores en ninguno de los 9 DTOs
2. Compilar TypeScript sin errores
3. Verificar que el validador sigue mapeando correctamente los tipos

**Validacion:**
```bash
# Verificar que no hay constructores
grep -r "constructor()" apps/backend/src/modules/progress/dto/answers/*.dto.ts

# Compilar TypeScript
cd apps/backend && npx tsc --noEmit

# Verificar git diff
git diff --stat apps/backend/src/modules/progress/dto/answers/
```

---

## 3. CRITERIOS DE EXITO

| # | Criterio | Validacion |
|---|----------|------------|
| 1 | 0 constructores en DTOs de answers | `grep -r "constructor()" *.dto.ts` retorna vacio |
| 2 | Compilacion exitosa | `npx tsc --noEmit` sin errores |
| 3 | 9 archivos modificados, 36 lineas eliminadas | `git diff --stat` confirma |
| 4 | Validador funciona correctamente | Submit de ejercicio no retorna 400 |

---

## 4. ROLLBACK

En caso de problemas, revertir los cambios:

```bash
git checkout -- apps/backend/src/modules/progress/dto/answers/
```

---

**Fecha:** 2026-01-07
**Autor:** Claude Code (Orchestrator Agent)
**Version:** 1.0
