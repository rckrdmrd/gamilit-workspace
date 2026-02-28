---
titulo: "ANALISIS PRE-EJECUCION: EAI-007 - Correccion Discrepancia DTO Frontend-Backend M4/M5"
tipo: requerimiento-funcional
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ANALISIS PRE-EJECUCION: EAI-007 - Correccion Discrepancia DTO Frontend-Backend M4/M5

**Agente:** Tech-Leader-Agent (Orquestador)
**Tipo de tarea:** Bug / Correccion de Arquitectura
**Prioridad:** P0 (Critica)
**Fecha analisis:** 2026-01-04
**Relacionado con:** [EAI-007], [FE-M4], [FE-M5], [BE-PROGRESS]

---

## CONTEXTO DE LA TAREA

### Solicitud Original
Se reportaron errores criticos al enviar respuestas de ejercicios en modulos 4 y 5:
1. **Error 400 (Bad Request)** en ejercicio verificador_fake_news: `ValidationError: claims_verified must contain at least one verification, claims_verified must be an array`
2. **Error 404 (Not Found)** en endpoint de progreso: `GET /api/v1/progress/users/:userId/modules/:moduleId 404`

### Objetivo Final
Corregir la discrepancia sistematica entre la estructura de datos enviada por los componentes frontend de ejercicios M4/M5 y los DTOs de validacion esperados por el backend, permitiendo el correcto funcionamiento de todos los ejercicios.

### Modulo Relacionado
**Modulo MVP:** Modulos 4 (Lectura Digital) y 5 (Produccion Lectora)
**Seccion en MVP-APP.md:** Seccion 3.4 y 3.5

### Justificacion
Los usuarios no pueden completar ejercicios de M4/M5 debido a errores de validacion. Esto bloquea el flujo de aprendizaje y afecta la experiencia del usuario. La correccion es critica para el funcionamiento del MVP.

---

## INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] DTOs de validacion M4: `/apps/backend/src/modules/educational/dto/module4/`
- [x] DTOs de validacion M5: `/apps/backend/src/modules/educational/dto/module5/`
- [x] Componentes frontend M4: `/apps/frontend/src/features/mechanics/module4/`
- [x] Componentes frontend M5: `/apps/frontend/src/features/mechanics/module5/`
- [x] Validadores de ejercicios: `/apps/backend/src/modules/progress/services/validators/`
- [x] Seeds de validacion: `/apps/database/seeds/prod/educational_content/`

**Comandos ejecutados:**
```bash
## Busqueda de DTOs M4/M5
find apps/backend -name "*module4*" -o -name "*module5*"
## Resultado: Encontrados 8 DTOs (4 M4 + 3 M5 + quiz_tiktok)

## Busqueda de componentes frontend
ls apps/frontend/src/features/mechanics/module4/
ls apps/frontend/src/features/mechanics/module5/
## Resultado: 7 componentes de ejercicios afectados
```

### Objetos Existentes Relacionados

**Base de Datos:**
- Schema: educational_content -> existe
- Tabla: exercise_validation_config -> existe (solo M1-M3)
- Seed: 10-exercise_validation_config.sql -> existe (17 tipos)

**Backend:**
- Modulo: progress -> existe
- Service: exercise-validator.service.ts -> existe (requiere actualizacion)
- Service: module-progress.service.ts -> existe (requiere metodos nuevos)
- Controller: module-progress.controller.ts -> existe (requiere actualizacion)

**Frontend:**
- Componente: VerificadorFakeNewsExercise.tsx -> existe (requiere transformacion)
- Componente: NavegacionHipertextualExercise.tsx -> existe (requiere transformacion)
- Componente: AnalisisMemesExercise.tsx -> existe (requiere transformacion)
- Componente: InfografiaInteractivaExercise.tsx -> existe (requiere transformacion)
- Componente: ComicDigitalExercise.tsx -> existe (requiere transformacion)
- Componente: VideoCartaExercise.tsx -> existe (requiere transformacion)
- Componente: DiarioMultimediaExercise.tsx -> existe (requiere transformacion)

### Objetos a Crear/Modificar

**Nuevos objetos:**
- [x] Seed: 11-exercise_validation_config_m4_m5.sql (crear)

**Objetos a modificar:**
- [x] Service: exercise-validator.service.ts (actualizar 4 validadores)
- [x] Service: module-progress.service.ts (agregar 2 metodos)
- [x] Controller: module-progress.controller.ts (actualizar endpoint)
- [x] Componentes frontend: 7 archivos (transformacion de datos)

---

## ANALISIS DE RIESGOS

### Riesgo de Duplicacion

**Verificacion:**
- [x] NO existe schema similar
- [x] NO existe tabla similar
- [x] NO existe modulo/entity similar - se modifica existente
- [x] NO existe componente similar - se modifica existente

**Objetos similares encontrados:**
- Validadores existentes para M1-M3 en exercise-validator.service.ts
- Pattern de transformacion usado en otros ejercicios

**Decision:**
- [x] Modificar objeto existente: exercise-validator.service.ts
- [x] Modificar objeto existente: module-progress.service.ts
- [x] Crear nuevo seed: 11-exercise_validation_config_m4_m5.sql

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Romper compatibilidad con datos existentes | Media | Alto | Mantener soporte para formatos legacy en validadores |
| Afectar ejercicios M1-M3 | Baja | Alto | Cambios aislados en validadores especificos |
| Inconsistencia entre ambientes | Media | Medio | Copiar seeds a dev y prod |

---

## ANALISIS DE IMPACTO

### Archivos Afectados

**A crear:**
- apps/database/seeds/prod/educational_content/11-exercise_validation_config_m4_m5.sql
- apps/database/seeds/dev/educational_content/11-exercise_validation_config_m4_m5.sql
- docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/01-ANALISIS-EAI-007.md
- docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/02-PLAN-EAI-007.md

**A modificar:**
- apps/backend/src/modules/progress/services/validators/exercise-validator.service.ts
- apps/backend/src/modules/progress/services/module-progress.service.ts
- apps/backend/src/modules/progress/controllers/module-progress.controller.ts
- apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx
- apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise.tsx
- apps/frontend/src/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx
- apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx
- apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx
- apps/frontend/src/features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx
- apps/frontend/src/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx

**Total archivos:**
- Crear: 4 (2 seeds + 2 docs)
- Modificar: 10 (3 backend + 7 frontend)

### Dependencias

**Esta tarea depende de:**
- Ninguna - Es correccion de bug critico

**Bloqueadores actuales:**
- Ninguno

**Esta tarea bloquea:**
- Todos los ejercicios de M4/M5 hasta su correccion

### Modulos Afectados

**Impacto directo:**
- Modulo: progress (Backend)
- Modulo: mechanics/module4 (Frontend)
- Modulo: mechanics/module5 (Frontend)
- Stack: Backend + Frontend

**Impacto indirecto:**
- Modulo educational_content (seeds de BD)
- Sistema de gamificacion (XP, ML Coins)

---

## DECISION DE APPROACH

### Approach Seleccionado
**Transformacion bidireccional**: Modificar frontend para enviar datos en formato DTO, y actualizar validadores backend para aceptar ambos formatos (DTO y legacy) para compatibilidad hacia atras.

**Razones:**
1. Minimiza riesgo de romper datos existentes
2. Permite migracion gradual de otros componentes
3. Sigue el patron establecido en ejercicios M1-M3

### Alternativas Consideradas

**Alternativa 1:** Solo modificar backend para aceptar formato frontend actual
- **Pros:** Menos cambios en frontend
- **Contras:** DTOs quedarian desalineados con la implementacion real
- **Razon de descarte:** Genera deuda tecnica y confusion en mantenimiento

**Alternativa 2:** Crear capa de adaptador intermediario
- **Pros:** Separacion clara de responsabilidades
- **Contras:** Mas complejidad, mas archivos, mas puntos de fallo
- **Razon de descarte:** Over-engineering para este caso

---

## NECESIDAD DE SUBAGENTES

### Analisis de Complejidad

**Criterios:**
- Numero de pasos: 5 -> Compleja
- Modulos afectados: 3 (progress, module4, module5) -> Media
- Archivos a crear/modificar: 14 -> Compleja
- Coordinacion entre capas: Si (Frontend + Backend + DB)

**Decision:**
- [x] **NO usar subagentes** - Tarea ya ejecutada, documentando resultados

### Plan de Subagentes (si aplica)
No aplica - Tarea ejecutada directamente por Tech Leader.

---

## ESTIMACION PRELIMINAR

### Tiempo Estimado por Fase

| Fase | Duracion Real | Notas |
|------|---------------|-------|
| Analisis | Completado | Este documento |
| Planificacion | Completado | 02-PLAN-EAI-007.md |
| Ejecucion Frontend | Completado | 7 componentes modificados |
| Ejecucion Backend | Completado | 3 archivos modificados |
| Ejecucion Database | Completado | Seed M4/M5 creado |
| Validacion | Pendiente | Recrear BD y tests |
| Documentacion | En progreso | 4 archivos |
| **TOTAL** | **Completado** | Validacion pendiente |

### Recursos Necesarios

**Agentes:**
- Agente principal: Tech-Leader-Agent
- Subagentes: No requeridos

**Herramientas:**
- Editor de codigo (Read, Edit, Write)
- Bash para scripts de BD
- Grep/Glob para busquedas

**Informacion adicional requerida:**
- Ninguna

---

## REFERENCIAS CONSULTADAS

### Documentacion del Proyecto
- [x] MVP-APP.md (Secciones 3.4, 3.5 - Modulos M4, M5)
- [x] DTOs de validacion M4/M5
- [x] Seeds existentes de exercise_validation_config

### Codigo Existente
**Archivos de referencia (templates):**
- exercise-validator.service.ts - Patron de validadores flexibles
- 10-exercise_validation_config.sql - Template para seeds de validacion

### Inventarios y Trazas
- [x] Seeds educational_content
- [x] DTOs module4, module5

---

## CONCLUSION DEL ANALISIS

### Resumen
Se identifico una discrepancia sistematica entre la estructura de datos enviada por los 7 componentes frontend de ejercicios M4/M5 y los DTOs esperados por el backend. La causa raiz fue la falta de alineacion durante el desarrollo inicial. Se implemento correccion bidireccional: transformacion en frontend + validadores flexibles en backend + seeds de configuracion para M4/M5.

### Decisiones Clave
1. **Approach:** Transformacion bidireccional con compatibilidad legacy
2. **Subagentes:** No requeridos
3. **Objetos a crear:** 1 seed (M4/M5), 2 documentos
4. **Objetos a modificar:** 10 archivos (3 backend, 7 frontend)

### Recomendaciones
1. Ejecutar recreacion de BD para validar seeds
2. Ejecutar tests de integracion para validar transformaciones
3. Documentar mapeo de transformaciones para referencia futura

### Aprobacion para Proceder
- [x] Analisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles
- [x] Estimaciones validadas
- [x] **APROBADO PARA PLANIFICACION**

---

## PROXIMO PASO

**Accion:** Ver documento de planificacion (02-PLAN-EAI-007.md)

---

**Analizado por:** Tech-Leader-Agent
**Fecha:** 2026-01-04
**Version:** 1.0
**Estado:** Completado
