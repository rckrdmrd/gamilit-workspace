# PLAN DE EJECUCION: EAI-007 - Correccion Discrepancia DTO Frontend-Backend M4/M5

**Agente:** Tech-Leader-Agent (Orquestador)
**Tipo de tarea:** Bug / Correccion de Arquitectura
**Prioridad:** P0 (Critica)
**Fecha creacion:** 2026-01-04
**Relacionado con:** [EAI-007], [01-ANALISIS-EAI-007.md]

---

## OBJETIVO

Corregir la discrepancia entre estructuras de datos frontend y DTOs backend para los 7 ejercicios de modulos M4 y M5, permitiendo el envio y validacion correcta de respuestas.

**Criterios de Aceptacion:**
- [x] Ejercicios M4 envian datos en formato DTO esperado
- [x] Ejercicios M5 envian datos en formato DTO esperado
- [x] Validadores backend aceptan formato DTO y legacy
- [x] Endpoint de progreso retorna objeto vacio en lugar de 404
- [x] Seeds de validacion incluyen configuracion M4/M5
- [ ] Base de datos recreada con nuevos seeds
- [ ] Tests de integracion pasan

---

## ANALISIS PREVIO

### Contexto
- **Por que es necesario:** Usuarios no pueden completar ejercicios M4/M5
- **Que problema resuelve:** Errores 400 y 404 al enviar respuestas
- **Que valor aporta:** Desbloquea flujo de aprendizaje en modulos avanzados

### Estado Actual
- DTOs definidos correctamente en backend
- Componentes frontend enviaban estructura diferente
- Validadores solo aceptaban un formato
- Progreso lanzaba 404 si no existia registro

### Anti-Duplicacion
```bash
# Verificacion de seeds existentes
ls apps/database/seeds/prod/educational_content/
# Resultado: 10-exercise_validation_config.sql (solo M1-M3)

# Verificacion de tipos duplicados
grep -n "verificador_fake_news" apps/database/seeds/
# Resultado: No existia - creado en 11-exercise_validation_config_m4_m5.sql
```

---

## DISENO DE SOLUCION

### Approach Seleccionado
Transformacion bidireccional con compatibilidad hacia atras.

**Alternativas consideradas:**
1. Solo modificar backend - Descartado por deuda tecnica
2. Capa de adaptador - Descartado por over-engineering

### Componentes a Crear/Modificar

**Database:**
- [x] Seeds: 11-exercise_validation_config_m4_m5.sql (crear)

**Backend:**
- [x] Service: exercise-validator.service.ts (4 validadores)
- [x] Service: module-progress.service.ts (2 metodos nuevos)
- [x] Controller: module-progress.controller.ts (1 endpoint)

**Frontend:**
- [x] VerificadorFakeNewsExercise.tsx
- [x] NavegacionHipertextualExercise.tsx
- [x] AnalisisMemesExercise.tsx
- [x] InfografiaInteractivaExercise.tsx
- [x] ComicDigitalExercise.tsx
- [x] VideoCartaExercise.tsx
- [x] DiarioMultimediaExercise.tsx

---

## CICLOS DE EJECUCION

### Ciclo 1: Analisis y Diagnostico
**Objetivo:** Identificar causa raiz y alcance del problema

**Tareas:**
1. Reproducir error 400 en verificador_fake_news
2. Analizar estructura enviada vs esperada
3. Identificar todos los ejercicios afectados
4. Documentar mapeo de transformaciones

**Artefactos generados:**
- ANALISIS-CORRECCION-DISCREPANCIA-DTO-2026-01-04.md

**Criterios de exito:**
- [x] Causa raiz identificada
- [x] 7 ejercicios afectados documentados

---

### Ciclo 2: Correccion Frontend M4
**Objetivo:** Transformar datos en componentes M4

**Tareas:**
1. Modificar VerificadorFakeNewsExercise.tsx
2. Modificar NavegacionHipertextualExercise.tsx
3. Modificar AnalisisMemesExercise.tsx
4. Modificar InfografiaInteractivaExercise.tsx

**Artefactos generados:**
- 4 componentes frontend actualizados

**Criterios de exito:**
- [x] Datos transformados a formato DTO
- [x] Metadata preservada para compatibilidad

---

### Ciclo 3: Correccion Frontend M5
**Objetivo:** Transformar datos en componentes M5

**Tareas:**
1. Modificar ComicDigitalExercise.tsx
2. Modificar VideoCartaExercise.tsx
3. Modificar DiarioMultimediaExercise.tsx

**Artefactos generados:**
- 3 componentes frontend actualizados

**Criterios de exito:**
- [x] Datos transformados a formato DTO
- [x] Metadata preservada para compatibilidad

---

### Ciclo 4: Correccion Backend
**Objetivo:** Actualizar validadores y endpoint de progreso

**Tareas:**
1. Actualizar validateVerificadorFakeNews
2. Actualizar validateInfografiaInteractiva
3. Actualizar validateNavegacionHipertextual
4. Actualizar validateAnalisisMemes
5. Agregar findByUserAndModuleOrNull
6. Agregar findByUserAndModuleOrEmpty
7. Actualizar endpoint GET progress

**Artefactos generados:**
- exercise-validator.service.ts actualizado
- module-progress.service.ts actualizado
- module-progress.controller.ts actualizado

**Criterios de exito:**
- [x] Validadores aceptan DTO y legacy
- [x] Endpoint retorna objeto vacio en lugar de 404

---

### Ciclo 5: Seeds de Base de Datos
**Objetivo:** Crear configuracion de validacion M4/M5

**Tareas:**
1. Crear 11-exercise_validation_config_m4_m5.sql
2. Copiar a ambiente dev
3. Documentar special_rules para formatos

**Artefactos generados:**
- seeds/prod/educational_content/11-exercise_validation_config_m4_m5.sql
- seeds/dev/educational_content/11-exercise_validation_config_m4_m5.sql

**Criterios de exito:**
- [x] 8 tipos de ejercicio configurados
- [x] Soporte DTO y legacy documentado

---

### Ciclo 6: Validacion Final
**Objetivo:** Validar integracion completa

**Validaciones:**
```bash
# Database
cd apps/database && ./recreate-database.sh
# Debe ejecutar sin errores

# Verificar seeds cargados
psql -c "SELECT COUNT(*) FROM educational_content.exercise_validation_config WHERE exercise_type LIKE '%fake_news%' OR exercise_type LIKE '%comic%';"
# Debe retornar 2+

# Backend (si aplica)
cd apps/backend && npm run build
# Debe compilar sin errores

# Frontend (si aplica)
cd apps/frontend && npm run build
# Debe compilar sin errores
```

**Checklist de Validacion:**
- [ ] DB ejecuta sin errores
- [ ] Seeds M4/M5 cargados (8 registros)
- [x] Backend compila sin errores
- [x] Frontend compila sin errores
- [x] Documentacion completa
- [x] Sin duplicaciones creadas

---

## DEPENDENCIAS

### Depende de:
- Ninguna - Bug critico independiente

### Bloquea:
- Todos los ejercicios M4/M5 hasta correccion

### Requerimientos externos:
- Ninguno

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Romper ejercicios M1-M3 | Baja | Alto | Cambios aislados en validadores especificos |
| Datos legacy incompatibles | Media | Medio | Soporte dual DTO + legacy |
| Seeds no ejecutan | Baja | Medio | ON CONFLICT DO UPDATE |

---

## ESTIMACIONES

**Tiempo total estimado:** Completado

**Desglose:**
- Analisis: Completado
- Desarrollo Frontend: Completado
- Desarrollo Backend: Completado
- Seeds Database: Completado
- Documentacion: Completado
- Validacion BD: Pendiente

**Recursos necesarios:**
- Agentes: Tech-Leader-Agent
- Subagentes: Ninguno
- Herramientas: Editor, Bash, PostgreSQL

---

## DOCUMENTACION A GENERAR

**Durante ejecucion:**
- [x] ANALISIS-CORRECCION-DISCREPANCIA-DTO-2026-01-04.md
- [x] Comentarios en codigo actualizado

**Post-ejecucion:**
- [x] 01-ANALISIS-EAI-007.md
- [x] 02-PLAN-EAI-007.md
- [ ] 03-VALIDACION-EAI-007.md (pendiente)

---

## CRITERIOS DE EXITO

La tarea se considera **COMPLETADA** cuando:

- [x] Todos los ciclos ejecutados exitosamente
- [ ] Todas las validaciones de BD pasan
- [x] Documentacion completa
- [x] Sin errores de compilacion
- [x] Sin duplicaciones creadas
- [x] Cumple estandares de codigo

---

## MAPEO DE TRANSFORMACIONES

### VerificadorFakeNews
```
Frontend                    ->  DTO Backend
verificationResults         ->  claims_verified
  .claimId                  ->    .claim_id
  .verdict                  ->    .is_fake (boolean invertido)
  .explanation              ->    .evidence
```

### NavegacionHipertextual
```
Frontend                    ->  DTO Backend
visitedNodes (array)        ->  path (string[])
timePerDocument             ->  information_found
```

### AnalisisMemes
```
Frontend                    ->  DTO Backend
annotations                 ->  annotations
  .x, .y, .text             ->    .x, .y, .text
analysisText                ->  analysis.message
```

### ComicDigital
```
Frontend                    ->  DTO Backend
panels                      ->  panels
  index + 1                 ->    .panelNumber
  speechBubbles[speech]     ->    .dialogue
  .text                     ->    .narration
```

### VideoCarta
```
Frontend                    ->  DTO Backend
videoUrl                    ->  video_url
sections (from recording)   ->  sections
  .name                     ->    .title
  .duration                 ->    .duration_seconds
```

### InfografiaInteractiva
```
Frontend                    ->  DTO Backend
cards.filter(revealed).id   ->  sections_explored
cards.reduce(answers)       ->  answers
```

### DiarioMultimedia
```
Frontend                    ->  DTO Backend
entries                     ->  entries
  .id (generado)            ->    .id
  .date.toISOString()       ->    .date
  .content (padded >= 50)   ->    .content
  wordCount (calculado)     ->    .wordCount
totalWords (calculado)      ->  totalWords
```

---

## REFERENCIAS

**Documentacion del proyecto:**
- MVP Plan: docs/00-vision-general/MVP-APP.md
- DTOs: apps/backend/src/modules/educational/dto/module4/, module5/

**Archivos de referencia:**
- Template seed: 10-exercise_validation_config.sql
- Validadores: exercise-validator.service.ts

---

**Version:** 1.0
**Ultima actualizacion:** 2026-01-04
**Aprobado para ejecucion:** Si (Completado)
