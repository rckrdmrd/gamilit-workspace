---
titulo: "ADR-029: Consolidacion de TeacherResourcesPage en TeacherContentPage"
tipo: adr
fecha_creacion: "2026-01-25"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-029: Consolidacion de TeacherResourcesPage en TeacherContentPage

**Estado:** Aceptada
**Fecha:** 2026-01-25
**Contexto:** TASK-2026-01-30-CORRECCION-INTEGRAL (Fase 3.1)

---

## Contexto

El Portal del Profesor (Teacher Portal) tenia dos paginas separadas para gestionar contenido educativo:

1. **TeacherContentPage** - Gestion de contenido creado por el profesor
2. **TeacherResourcesPage** - Gestion de recursos adicionales

Esta separacion causaba:
- Duplicacion de funcionalidad
- Confusion para el usuario sobre donde gestionar que
- Codigo redundante en el frontend
- Rutas adicionales innecesarias

## Decision

**Eliminar TeacherResourcesPage y consolidar su funcionalidad en TeacherContentPage.**

### Acciones Tomadas

1. Funcionalidad de recursos integrada como tab/seccion dentro de TeacherContentPage
2. Eliminacion del archivo `TeacherResourcesPage.tsx`
3. Actualizacion de rutas del Teacher Portal
4. Migracion de imports y referencias

### Commit de Implementacion

- **Commit:** `f55d872b`
- **Fecha:** 2026-01-25

## Consecuencias

### Positivas

- **UX simplificada:** Un solo lugar para gestionar todo el contenido
- **Menos codigo:** Reduccion de ~200 LOC
- **Rutas simplificadas:** Una ruta menos en el router
- **Mantenimiento:** Un solo componente a mantener

### Negativas

- **Migracion requerida:** Ajustes en referencias existentes
- **Documentacion:** Actualizacion de guias de usuario

### Neutral

- No afecta el backend (los endpoints siguen funcionando igual)
- No afecta la base de datos

## Alternativas Consideradas

1. **Mantener separadas:** Descartado por duplicacion y confusion
2. **Crear super-componente:** Descartado por complejidad innecesaria
3. **Consolidar (elegida):** Solucion simple y efectiva

## Referencias

- Portal Teacher: `apps/frontend/src/apps/teacher/`
- TASK-2026-01-30-CORRECCION-INTEGRAL
- FRONTEND_INVENTORY.yml v4.10.0

---

*Sistema SIMCO v4.0.0*
*Fecha documentacion: 2026-01-30*
