# PLAN DE CORRECCIONES - Regresión Student Portal
**Fecha:** 2025-12-14
**Agente:** Architecture-Analyst
**Ciclo:** CAPVED - Fase P (Planeación)

---

## DECISIONES TOMADAS

| Decisión | Resultado |
|----------|-----------|
| Sistema penalización tiempo QuizTikTok | ✅ MANTENER (intencional) |
| Mejoras defensivas (guards) | ✅ MANTENER |
| Regresiones de navegación | 🔧 CORREGIR |

---

## TAREAS DE CORRECCIÓN

### TAREA-001: Restaurar Navegación "Volver al Módulo"
**Prioridad:** P0 (CRÍTICA)
**Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`
**Tipo:** MODIFICAR

#### Descripción
Restaurar la funcionalidad de navegación desde el ejercicio de vuelta al módulo específico, manteniendo un fallback seguro solo cuando realmente no hay `module_id` disponible.

#### Cambios Específicos

**Ubicación 1: Función de navegación después de submit (línea ~560)**
```typescript
// ANTES (actual - roto):
const targetModuleId = exercise?.module_id;
if (targetModuleId && targetModuleId !== 'undefined') {
  navigate(`/modules/${targetModuleId}`);
} else {
  navigate('/dashboard');
}

// DESPUÉS (corregido):
const targetModuleId = exercise?.module_id || exercise?.moduleId || moduleId;
if (targetModuleId && targetModuleId !== 'undefined') {
  navigate(`/modules/${targetModuleId}`);
} else {
  console.warn('[ExercisePage] No valid moduleId found, navigating to dashboard');
  navigate('/dashboard');
}
```

**Ubicación 2: Botón "Volver" en header (línea ~717)**
```typescript
// ANTES (actual - roto):
onClick={() => navigate('/dashboard')}

// DESPUÉS (corregido):
onClick={() => {
  const targetModuleId = exercise?.module_id || exercise?.moduleId || moduleId;
  if (targetModuleId && targetModuleId !== 'undefined') {
    navigate(`/modules/${targetModuleId}`);
  } else {
    navigate('/dashboard');
  }
}}
```

**Ubicación 3: Texto del botón (línea ~720)**
```typescript
// ANTES (actual):
Volver al Dashboard

// DESPUÉS (corregido):
Volver al módulo
```

**Ubicación 4: Botón de finalización (línea ~1058)**
```typescript
// ANTES (actual - roto):
const targetModuleId = exercise?.module_id;
if (targetModuleId && targetModuleId !== 'undefined') {
  navigate(`/modules/${targetModuleId}`);
} else {
  navigate('/dashboard');
}

// DESPUÉS (corregido):
const targetModuleId = exercise?.module_id || exercise?.moduleId || moduleId;
if (targetModuleId && targetModuleId !== 'undefined') {
  navigate(`/modules/${targetModuleId}`);
} else {
  console.warn('[ExercisePage] No valid moduleId found after completion');
  navigate('/dashboard');
}
```

#### Validación
- [ ] Navegar desde ejercicio módulo 1 → debe volver a módulo 1
- [ ] Navegar desde ejercicio módulo 2 → debe volver a módulo 2
- [ ] Navegar desde ejercicio módulo 3 → debe volver a módulo 3
- [ ] Navegar desde ejercicio módulo 4 → debe volver a módulo 4
- [ ] Navegar desde ejercicio módulo 5 → debe volver a módulo 5
- [ ] Build Frontend pasa
- [ ] Lint Frontend pasa

---

### TAREA-002: Normalizar Acceso a module_id
**Prioridad:** P1 (ALTA)
**Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`
**Tipo:** MODIFICAR

#### Descripción
Asegurar acceso consistente a `module_id` independientemente de si la API envía `snake_case` o `camelCase`.

#### Cambios Específicos

**Ubicación: Línea ~270 (procesamiento de datos del ejercicio)**
```typescript
// ANTES (actual):
module_id: exerciseData.moduleId || exerciseData.module_id,

// DESPUÉS (más robusto):
// Normalizar module_id desde cualquier formato de la API
const moduleIdValue = exerciseData.module_id
  || exerciseData.moduleId
  || exerciseData['module_id'];
module_id: moduleIdValue,
```

#### Validación
- [ ] API envía `module_id` → funciona correctamente
- [ ] API envía `moduleId` → funciona correctamente
- [ ] Console.log muestra moduleId correcto en todos los casos

---

## TAREAS NO REQUERIDAS (Mantener Actual)

### NO-CAMBIAR-001: useModules.ts
**Razón:** El guard agregado para `moduleId === 'undefined'` es una mejora defensiva válida.

### NO-CAMBIAR-002: CrucigramaExercise.tsx
**Razón:** Los guards para grid vacío previenen crashes con datos malformados.

### NO-CAMBIAR-003: DetectiveTextualExercise.tsx
**Razón:** El guard para `inference_type` undefined es una mejora defensiva.

### NO-CAMBIAR-004: VerificadorFakeNewsExercise.tsx
**Razón:** Los guards previenen crashes con datos vacíos.

### NO-CAMBIAR-005: QuizTikTokExercise.tsx
**Razón:** Usuario confirmó mantener sistema de penalización por tiempo.

### NO-CAMBIAR-006: Backend Controllers/DTOs
**Razón:** Los cambios son mejoras de tipado y compatibilidad, no regresiones.

---

## ORDEN DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Backup de archivos afectados                        │
│         cp ExercisePage.tsx ExercisePage.tsx.backup         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Aplicar TAREA-001 y TAREA-002                       │
│         Modificar ExercisePage.tsx                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Validar                                             │
│         npm run build && npm run lint                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Test funcional                                      │
│         Verificar navegación módulos 1-5                    │
└─────────────────────────────────────────────────────────────┘
```

---

## CONTEXTO PARA SUBAGENTE

### Perfil Requerido
**Perfil:** `@PERFIL_FRONTEND`
**Directivas:** `@SIMCO-MODIFICAR`, `@SIMCO-VALIDAR`

### Prompt para Subagente Frontend

```markdown
## TAREA: Corrección de Navegación ExercisePage

### CONTEXTO
Se detectaron regresiones en la navegación del portal de estudiantes.
Los estudiantes NO pueden volver al módulo desde el ejercicio.

### ARCHIVOS A MODIFICAR
1. `apps/frontend/src/apps/student/pages/ExercisePage.tsx`

### CAMBIOS REQUERIDOS

#### Cambio 1: Restaurar navegación después de submit (~línea 560)
Buscar el bloque que navega al dashboard y modificar:
- Priorizar `exercise?.module_id || exercise?.moduleId || moduleId`
- Solo ir a dashboard como último fallback

#### Cambio 2: Botón "Volver" en header (~línea 717)
Modificar el onClick para navegar al módulo, no al dashboard.

#### Cambio 3: Texto del botón (~línea 720)
Cambiar "Volver al Dashboard" por "Volver al módulo"

#### Cambio 4: Botón de finalización (~línea 1058)
Aplicar la misma lógica de navegación que en Cambio 1.

### VALIDACIÓN OBLIGATORIA
1. npm run build - DEBE PASAR
2. npm run lint - DEBE PASAR (warnings aceptables)
3. Verificar navegación funciona para módulos 1-5

### NO MODIFICAR
- Lógica de penalización por tiempo de QuizTikTok
- Guards defensivos en otros archivos
- Tipado del backend
```

---

## ESTIMACIÓN

| Tarea | Complejidad | Archivos |
|-------|-------------|----------|
| TAREA-001 | BAJA | 1 |
| TAREA-002 | BAJA | 1 |
| **TOTAL** | **BAJA** | **1 archivo** |

---

## CHECKLIST PRE-EJECUCIÓN

- [x] Análisis completo de regresiones
- [x] Identificación de archivos afectados
- [x] Cambios específicos documentados
- [x] Validaciones definidas
- [x] Decisiones de negocio tomadas
- [x] Contexto para subagente preparado

---

**Estado:** PLAN COMPLETADO
**Próximo paso:** FASE V - Validación del Plan
**Última actualización:** 2025-12-14
