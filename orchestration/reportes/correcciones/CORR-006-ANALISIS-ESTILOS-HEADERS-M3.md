---
id: "CORR-006-ANALISIS"
title: "Analisis - Estilos Headers Ejercicios Modulo 3"
type: "Analisis"
status: "Done"
priority: "P2"
assignee: "@Orquestador"
related_task: "CORR-006"
affected_modules: ["frontend", "mechanics", "module3"]
affected_files:
  - "apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx"
  - "apps/frontend/src/features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx"
  - "apps/frontend/src/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx"
  - "apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx"
  - "apps/frontend/src/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx"
labels: ["correccion", "frontend", "estilos", "analisis", "module3"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# ANALISIS PRE-EJECUCION: CORR-006 - Estilos Headers Ejercicios Modulo 3

**Agente:** Orquestador (Tech Lead)
**Tipo de tarea:** Correccion de Estilos
**Prioridad:** P2
**Fecha analisis:** 2026-01-07
**Relacionado con:** Frontend, Mechanics, Module3

---

## CONTEXTO DE LA TAREA

### Solicitud Original

Los headers de los ejercicios del Modulo 3 no implementaban correctamente los estilos establecidos como estandar en el proyecto. Se requeria alinear los estilos con el patron definido en el Modulo 4 (ejercicio VerificadorFakeNews).

### Objetivo Final

Unificar los estilos de headers de todos los ejercicios del Modulo 3 para que sigan el mismo patron visual que el resto de los modulos, especificamente el definido en `VerificadorFakeNewsExercise.tsx`.

### Modulo Relacionado

**Modulo MVP:** Mechanics - Ejercicios Interactivos
**Seccion en MVP-APP.md:** Gamificacion > Ejercicios por Modulo

### Justificacion

- **Consistencia visual:** Los ejercicios deben tener apariencia uniforme en toda la plataforma
- **UX mejorada:** Los estudiantes reconocen visualmente los ejercicios
- **Mantenibilidad:** Un patron estandarizado facilita futuras modificaciones

---

## INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] Codigo fuente de ejercicios Module 3
- [x] Codigo fuente de ejercicios Module 4 (referencia)
- [x] Patrones de estilos Tailwind CSS utilizados

**Comandos ejecutados:**
```bash
# Busqueda de archivos de ejercicios Module 3
find apps/frontend/src/features/mechanics/module3 -name "*Exercise.tsx"

# Resultado: 5 archivos identificados
```

### Objetos Existentes Relacionados

**Frontend:**
- Componente: `VerificadorFakeNewsExercise.tsx` (Modulo 4) → **PATRON DE REFERENCIA**
- Componente: `AnalisisFuentesExercise.tsx` → existe (requiere modificacion)
- Componente: `DebateDigitalExercise.tsx` → existe (requiere modificacion)
- Componente: `TribunalOpinionesExercise.tsx` → existe (requiere modificacion)
- Componente: `MatrizPerspectivasExercise.tsx` → existe (requiere modificacion)
- Componente: `PodcastArgumentativoExercise.tsx` → existe (requiere modificacion)

### Objetos a Crear/Modificar

**Objetos a modificar:**
- [x] `AnalisisFuentesExercise.tsx` - Actualizar header
- [x] `DebateDigitalExercise.tsx` - Actualizar header
- [x] `TribunalOpinionesExercise.tsx` - Actualizar header
- [x] `MatrizPerspectivasExercise.tsx` - Actualizar header
- [x] `PodcastArgumentativoExercise.tsx` - Actualizar header

---

## ANALISIS DE RIESGOS

### Riesgo de Duplicacion

**Verificacion:**
- [x] NO hay duplicacion - solo modificacion de estilos existentes
- [x] NO se crean nuevos componentes
- [x] NO se modifican otros modulos

**Objetos similares encontrados:**
Todos los ejercicios del Modulo 3 tenian implementaciones de header inconsistentes.

**Decision:**
- [x] Modificar objeto existente: Headers de 5 ejercicios

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Romper estilos existentes | Baja | Medio | Verificar build despues de cada cambio |
| Imports innecesarios de motion | Baja | Bajo | Verificar que motion se usa en otras partes |

---

## ANALISIS DETALLADO

### Patron de Referencia (Correcto - Module 4)

**Archivo:** `VerificadorFakeNewsExercise.tsx`

```tsx
<div className="rounded-xl bg-gradient-to-r from-blue-800 to-orange-500 p-6 text-white shadow-lg">
  <div className="mb-2 flex items-center gap-3">
    <Shield className="h-8 w-8" />
    <h2 className="text-detective-2xl font-bold">Verificador de Noticias Falsas</h2>
  </div>
  <p className="mb-4 text-detective-base opacity-90">
    Analiza articulos sobre Marie Curie y verifica la veracidad de las afirmaciones.
  </p>
</div>
```

**Caracteristicas del patron correcto:**
- Contenedor: `<div>` simple (NO `motion.div`)
- Border radius: `rounded-xl` (NO `rounded-detective-lg`)
- Gradiente: `from-blue-800 to-orange-500` (NO `from-detective-blue to-detective-orange`)
- Shadow: `shadow-lg` (NO `shadow-detective-lg`)
- Titulo: `<h2>` con `text-detective-2xl` (NO `<h1>` con `text-detective-3xl`)

### Estado Incorrecto Encontrado (Module 3)

Los ejercicios del Modulo 3 tenian headers con:
- `motion.div` con animaciones innecesarias
- Clases `rounded-detective-lg`, `shadow-detective-lg` no estandar
- Gradientes `from-detective-blue to-detective-orange` no estandar
- Elementos `<h1>` en lugar de `<h2>`
- Clases `text-detective-3xl` en lugar de `text-detective-2xl`

---

## ANALISIS DE IMPACTO

### Archivos Afectados

**A modificar:**
1. `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx`
2. `apps/frontend/src/features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx`
3. `apps/frontend/src/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx`
4. `apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx`
5. `apps/frontend/src/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx`

**Total archivos:**
- Crear: 0
- Modificar: 5

### Dependencias

**Esta tarea depende de:**
- Ninguna - cambio aislado de estilos

**Bloqueadores actuales:**
- Ninguno

**Esta tarea bloquea:**
- Ninguna tarea bloqueada

### Modulos Afectados

**Impacto directo:**
- Modulo: Module 3 - Ejercicios de Pensamiento Critico
- Stack: Frontend

**Impacto indirecto:**
- Ninguno - cambio visual sin cambios funcionales

---

## DECISION DE APPROACH

### Approach Seleccionado

Modificar los headers de los 5 ejercicios del Modulo 3 para seguir exactamente el patron establecido en el ejercicio `VerificadorFakeNewsExercise.tsx` del Modulo 4.

**Razones:**
1. Consistencia visual con el resto de la aplicacion
2. Patron ya validado y funcionando en produccion
3. Cambio minimo y localizado

### Alternativas Consideradas

**Alternativa 1:** Crear componente HeaderExercise reutilizable
- **Pros:** Mayor reutilizacion, cambios centralizados
- **Contras:** Requiere refactoring de TODOS los ejercicios, mayor riesgo
- **Razon de descarte:** Scope excesivo para esta correccion puntual

**Alternativa 2:** Mantener estilos custom del Modulo 3
- **Pros:** No requiere cambios
- **Contras:** Inconsistencia visual permanente
- **Razon de descarte:** No resuelve el problema identificado

---

## NECESIDAD DE SUBAGENTES

### Analisis de Complejidad

**Criterios:**
- Numero de pasos: 5 → Simple
- Modulos afectados: 1 (Frontend) → Simple
- Archivos a modificar: 5 → Simple
- Coordinacion entre capas: No

**Decision:**
- [x] **NO usar subagentes** - Tarea simple, ejecutar directamente

---

## ESTIMACION PRELIMINAR

### Recursos Necesarios

**Agentes:**
- Agente principal: Orquestador

**Herramientas:**
- Editor de codigo (Edit tool)
- Bash para validacion de build

**Informacion adicional requerida:**
- Ninguna

---

## REFERENCIAS CONSULTADAS

### Documentacion del Proyecto
- [x] Codigo de ejercicios Module 3
- [x] Codigo de ejercicios Module 4 (referencia)

### Codigo Existente

**Archivos de referencia (templates):**
- `apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx` - Patron de header correcto

---

## CONCLUSION DEL ANALISIS

### Resumen

Se identifico que los 5 ejercicios del Modulo 3 no seguian el patron estandarizado de headers definido en el Modulo 4. Las diferencias incluian uso incorrecto de clases CSS, elementos HTML incorrectos (h1 vs h2), y animaciones innecesarias. La solucion requiere modificar los headers de los 5 archivos para alinearlos con el patron de referencia.

### Decisiones Clave

1. **Approach:** Modificacion directa de estilos en cada archivo
2. **Subagentes:** No usar
3. **Objetos a modificar:** 5 componentes React
4. **Riesgo:** Bajo

### Recomendaciones

1. Ejecutar build de frontend despues de cada modificacion para validar
2. Verificar que los imports de `motion` se mantienen donde se usan en otros lugares
3. Documentar el patron para futuras referencias

### Aprobacion para Proceder

- [x] Analisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles
- [x] Estimaciones validadas
- [x] **APROBADO PARA EJECUCION**

---

## PROXIMO PASO

**Accion:** Ejecutar plan de modificacion de estilos

**Documentos relacionados:**
- [CORR-006-PLAN-EJECUCION.md](./CORR-006-PLAN-EJECUCION.md)
- [CORR-006-REPORTE-EJECUCION.md](./CORR-006-REPORTE-EJECUCION.md)

---

**Analizado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** COMPLETADO
