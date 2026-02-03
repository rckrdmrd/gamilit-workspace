# Analisis de GAPs de Ejercicios

**Fecha de Analisis:** 2026-01-20
**Version:** 1.0.0
**Tarea Origen:** TASK-2026-01-20-EXERCISES-VALIDATION
**Estado:** Activo

---

## 1. Resumen Ejecutivo

La validacion exhaustiva de los 30 ejercicios en los modulos M1-M5 identifico **16 GAPs** de los cuales 1 fue invalidado tras analisis detallado. El estado final es:

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| CRITICO | 5 | Requieren atencion inmediata |
| ALTO | 4 | Priorizados para Sprint actual |
| MEDIO | 4 | Planificados para Sprint siguiente |
| BAJO/INVALIDADO | 3 | Documentacion o no accionables |
| **TOTAL ACTIVOS** | **15** | |

### Tabla Consolidada de GAPs

| ID | Titulo | Severidad | Estado | Esfuerzo | Recomendacion |
|----|--------|-----------|--------|----------|---------------|
| GAP-EX-001 | Emparejamiento sin envio backend | N/A | **INVALIDADO** | - | No accion requerida |
| GAP-EX-002 | Progreso no actualiza en tiempo real | CRITICO | CONFIRMADO | Alto | Implementar WebSockets/SSE |
| GAP-EX-003 | Respuestas abiertas no visibles | MEDIO | **PARCIAL** | Bajo | Solo M5 afectado |
| GAP-EX-004 | Multimedia no reproducible | CRITICO | CONFIRMADO | Alto | Implementar servicio upload S3 |
| GAP-EX-005 | Rubrica sin estructura formal | MEDIO | CONFIRMADO | Medio | Disenar sistema de rubricas |
| GAP-EX-006 | Validacion semantica faltante | MEDIO | DIFERIDO | Alto | Fase 2 con NLP |
| GAP-EX-007 | Mecanicas M4 removidas | N/A | **INVALIDADO** | - | Ya documentadas en SPEC |
| GAP-EX-008 | Documentacion integracion faltante | MEDIO | CONFIRMADO | Bajo | Crear guia de integracion |
| GAP-EX-011 | SubmitExerciseButton sin uso | CRITICO | CONFIRMADO | Bajo | Deprecar o integrar |
| GAP-EX-012 | HintModal sin uso | CRITICO | CONFIRMADO | Medio | Integrar sistema premium |
| GAP-EX-013 | 85% ejercicios sin mostrar rewards | CRITICO | CONFIRMADO | Bajo | Agregar XP/MLCoins a feedback |
| GAP-EX-014 | 8 ejercicios sin pendingReview | ALTO | **PARCIAL** | Bajo | Solo 3 ejercicios afectados |
| GAP-EX-015 | 27 ejercicios sin hints | ALTO | CONFIRMADO | Alto | Plan de contenido hints |
| GAP-EX-016 | CompletionModal sin uso | ALTO | CONFIRMADO | Medio | Integrar en flujo completion |
| GAP-EX-017 | 4 auxiliares sin backend | ALTO | CONFIRMADO | Medio | Crear endpoints auxiliares |
| GAP-EX-018 | PrediccionNarrativa eval incorrecta | MEDIO | NUEVO | Bajo | Alinear con SPEC |
| GAP-EX-019 | DTO discrepancias vs SPEC | BAJO | NUEVO | Bajo | Documentar formato oficial |

---

## 2. GAPs Criticos (Accion Inmediata Requerida)

### GAP-EX-011: SubmitExerciseButton Sin Uso

**Severidad:** CRITICO
**Estado:** CONFIRMADO
**Identificado en:** FASE 1 - SUBTASK 1.1

#### Descripcion
El componente `SubmitExerciseButton` ubicado en `/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx` fue creado como componente compartido oficial para envio de respuestas pero **no se utiliza en ningun ejercicio (0%)**.

#### Impacto
- **UX Inconsistente:** Cada ejercicio implementa su propio boton con estilos y comportamientos diferentes
- **Mantenibilidad:** Cambios en el flujo de submit requieren modificar 30 archivos individuales
- **Desperdicio de codigo:** Componente bien disenado pero abandonado

#### Analisis de Causa Raiz
1. **Falta de documentacion:** No existe guia de integracion que indique usar este componente
2. **Desarrollo paralelo:** Ejercicios se desarrollaron antes de crear el componente compartido
3. **No hay enforcement:** Ningun trigger o linter que detecte uso directo de botones inline

#### Evidencia
```
Busqueda en codebase:
- SubmitExerciseButton imports: 0 archivos
- Botones inline de submit: 30 ejercicios
```

#### Recomendacion
**Opcion A (Recomendada):** Integrar gradualmente
1. Actualizar documentacion con guia de uso obligatorio
2. Migrar 5 ejercicios piloto (1 por modulo)
3. Validar UX con usuarios
4. Completar migracion restante

**Opcion B:** Deprecar componente
1. Documentar decision arquitectonica (ADR)
2. Extraer mejores practicas a guia de estilo
3. Eliminar componente

#### Esfuerzo Estimado
- Opcion A: 8-12 horas (migracion gradual)
- Opcion B: 2 horas (deprecacion)

---

### GAP-EX-012: HintModal Sin Uso

**Severidad:** CRITICO
**Estado:** CONFIRMADO
**Identificado en:** FASE 1 - SUBTASK 1.2

#### Descripcion
El componente `HintModal` ubicado en `/apps/frontend/src/apps/student/components/exercise/HintModal.tsx` implementa un sistema de hints con **costo en ML Coins** como mecanismo de gamificacion, pero no se usa en ningun ejercicio.

En su lugar, algunos ejercicios (solo 3) usan `HintSystem` que proporciona hints gratuitos.

#### Impacto
- **Gamificacion desperdiciada:** El sistema de ML Coins tiene mecanismo para "comprar" ayuda pero no se usa
- **Monetizacion interna perdida:** ML Coins deberian tener usos significativos
- **Inconsistencia:** Estudiantes no tienen ayuda contextual en 90% de ejercicios

#### Analisis de Causa Raiz
1. **Diseño no adoptado:** HintModal requiere hints pre-configurados por ejercicio
2. **Contenido faltante:** No hay hints definidos para ejercicios
3. **Confusion de componentes:** Existen 2 sistemas (HintModal vs HintSystem)

#### Comparacion de Sistemas

| Caracteristica | HintModal | HintSystem |
|----------------|-----------|------------|
| Costo ML Coins | Si (configurable) | No |
| Hints escalonados | Si (nivel 1, 2, 3) | No |
| Animaciones | Si | Basico |
| Uso actual | 0% | 10% |
| Ubicacion | student/components | shared/components |

#### Recomendacion
1. **Definir sistema oficial:** Unificar en un solo componente
2. **Crear contenido:** Plan de creacion de hints por ejercicio
3. **Integrar economicamente:** Conectar con sistema ML Coins existente
4. **Implementar gradualmente:** Comenzar con M1 (ejercicios mas simples)

#### Esfuerzo Estimado
- Decision arquitectonica: 2 horas
- Contenido hints (por ejercicio): 30 min cada uno
- Integracion tecnica: 4-6 horas
- **Total estimado:** 20-30 horas (incluyendo contenido)

---

### GAP-EX-013: 85% Ejercicios Sin Mostrar Rewards

**Severidad:** CRITICO
**Estado:** CONFIRMADO
**Identificado en:** FASE 1 - SUBTASK 1.3

#### Descripcion
Solo **4 de 26 ejercicios** (15%) muestran las recompensas obtenidas (XP y ML Coins) en el feedback al completar. El resto solo muestra mensaje de exito o score sin indicar recompensas.

#### Ejercicios que SI Muestran Rewards
1. RuedaInferencias (M2-06)
2. VerificadorFakeNews (M4-01)
3. DiarioMultimedia (M5-01)
4. PrediccionNarrativa (M2-04)

#### Ejercicios Sin Rewards en Feedback (22)
- M1: VerdaderoFalso, CompletarEspacios, Emparejamiento, SopaLetras, Crucigrama, Timeline, MapaConceptual
- M2: DetectiveTextual, LecturaInferencial, CausaEfecto, PuzzleContexto
- M3: Todos (5 ejercicios)
- M4: InfografiaInteractiva, QuizTikTok, NavegacionHipertextual, AnalisisMemes
- M5: ComicDigital, VideoCarta

#### Impacto
- **Motivacion perdida:** Estudiantes no ven recompensa inmediata de su esfuerzo
- **Gamificacion invisible:** XP y ML Coins se acumulan pero pasan desapercibidos
- **Engagement reducido:** Sin feedback positivo visible, menor motivacion para continuar

#### Analisis de Causa Raiz
1. **Props opcionales:** `FeedbackModal` acepta `xpEarned` y `mlCoinsEarned` pero son opcionales
2. **Backend retorna datos:** El endpoint si devuelve rewards pero frontend no los usa
3. **Inconsistencia de implementacion:** Cada desarrollador implemento diferente

#### Recomendacion
**Accion inmediata (Bajo esfuerzo, Alto impacto):**
1. Auditar respuesta de backend para cada ejercicio
2. Pasar props `xpEarned` y `mlCoinsEarned` a `FeedbackModal`
3. Validar visualmente que se muestren correctamente

**Ejemplo de cambio requerido:**
```typescript
// ANTES:
<FeedbackModal
  isCorrect={result.isCorrect}
  message={result.message}
/>

// DESPUES:
<FeedbackModal
  isCorrect={result.isCorrect}
  message={result.message}
  xpEarned={result.xpEarned}
  mlCoinsEarned={result.mlCoinsEarned}
/>
```

#### Esfuerzo Estimado
- Por ejercicio: 15-20 minutos
- Total (22 ejercicios): 6-8 horas
- **Prioridad:** P0 por alto impacto y bajo esfuerzo

---

### GAP-EX-002: Progreso No Actualiza en Tiempo Real

**Severidad:** CRITICO
**Estado:** CONFIRMADO
**Modulos afectados:** M3, M4, M5

#### Descripcion
En ejercicios con evaluacion manual (M3-M5), el progreso del estudiante no refleja el envio hasta que el docente califica. El estudiante ve su dashboard sin cambios inmediatamente despues de enviar.

#### Impacto
- **Confusion:** Estudiante no sabe si su envio fue exitoso
- **Re-envios:** Estudiantes pueden enviar multiples veces creyendo que fallo
- **Experiencia frustrante:** Falta de feedback inmediato

#### Analisis de Causa Raiz
1. **Diseño de estados:** Solo existen `completed` y `not_started`, falta `pending_review`
2. **Cache no invalidado:** React Query no actualiza dashboard tras submit
3. **Backend no notifica:** No hay mecanismo de push para actualizaciones

#### Recomendacion
1. **Corto plazo:** Mostrar estado `pendingReview` inmediatamente en frontend (optimistic update)
2. **Mediano plazo:** Implementar invalidacion de cache correcta
3. **Largo plazo:** WebSockets/SSE para actualizaciones en tiempo real

#### Esfuerzo Estimado
- Corto plazo: 4-6 horas
- Mediano plazo: 8-12 horas
- Largo plazo: 20-30 horas

---

### GAP-EX-004: Multimedia No Reproducible en Teacher Portal

**Severidad:** CRITICO
**Estado:** CONFIRMADO - BLOQUEANTE
**Modulos afectados:** M5

#### Descripcion
Los ejercicios de M5 (DiarioMultimedia, VideoCarta) permiten subir contenido multimedia (imagenes, audio, video) pero estos archivos:
1. Se almacenan como `blob:` URLs temporales
2. Solo existen en memoria del browser del estudiante
3. No hay servicio de upload a storage permanente
4. Teacher Portal recibe URLs invalidas

#### Impacto
- **M5 NO ES EVALUABLE:** Docentes no pueden ver contenido multimedia
- **Perdida de trabajo:** Contenido se pierde al cerrar browser
- **Funcionalidad prometida pero rota**

#### Analisis de Causa Raiz
1. **Arquitectura incompleta:** Se implemento captura pero no persistencia
2. **Falta servicio de storage:** No hay endpoint de upload
3. **No hay integracion S3/GCS:** Storage en la nube no configurado

#### Recomendacion
**Implementacion requerida:**
1. Crear servicio de upload: `POST /api/v1/uploads/media`
2. Integrar con S3 o Google Cloud Storage
3. Retornar URLs permanentes publicas
4. Actualizar ejercicios M5 para usar URLs permanentes
5. Migrar componentes de captura multimedia

**Arquitectura propuesta:**
```
[Estudiante] -> [Frontend] -> [Upload Service] -> [S3]
                                    |
                              [URL permanente]
                                    |
[Docente] <- [Teacher Portal] <- [Database]
```

#### Esfuerzo Estimado
- Backend upload service: 8-12 horas
- Integracion S3: 4-6 horas
- Actualizacion frontend M5: 6-8 horas
- Testing E2E: 4 horas
- **Total: 22-30 horas**

---

## 3. GAPs Altos (Sprint Actual)

### GAP-EX-014: Ejercicios Sin Flag pendingReview

**Severidad:** ALTO
**Estado:** PARCIALMENTE CONFIRMADO

#### Descripcion Original
Se identificaron 8 ejercicios de M3-M5 sin implementar `pendingReview` en el feedback.

#### Actualizacion tras FASE 2
La validacion detallada revelo que **M3 SI implementa correctamente pendingReview** en los 5 ejercicios. El gap solo aplica a:

| Ejercicio | Modulo | Estado |
|-----------|--------|--------|
| InfografiaInteractiva | M4 | FALTA |
| NavegacionHipertextual | M4 | FALTA |
| AnalisisMemes | M4 | FALTA |

**Nota:** Los 3 ejercicios afectados en M4 SI usan el hook `useExerciseSubmission` que deberia manejar `pendingReview` pero el feedback no lo refleja visualmente.

#### Recomendacion
Verificar que el feedback de estos 3 ejercicios incluya indicador visual de "Pendiente de revision".

#### Esfuerzo Estimado
- 1-2 horas (3 ejercicios)

---

### GAP-EX-015: 27 Ejercicios Sin Sistema de Hints

**Severidad:** ALTO
**Estado:** CONFIRMADO

#### Descripcion
90% de ejercicios (27 de 30) no tienen hints integrados. Los estudiantes no reciben ayuda contextual cuando estan atascados.

#### Recomendacion
1. **Fase 1:** Definir estrategia de hints por tipo de ejercicio
2. **Fase 2:** Crear contenido de hints (requiere equipo pedagogico)
3. **Fase 3:** Integrar tecnicamente

#### Esfuerzo Estimado
- Estrategia: 4 horas
- Contenido: 30 horas (equipo pedagogico)
- Integracion: 10 horas
- **Total: 44 horas (multi-equipo)**

---

### GAP-EX-016: CompletionModal Sin Uso

**Severidad:** ALTO
**Estado:** CONFIRMADO

#### Descripcion
El componente `CompletionModal` en `/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx` ofrece funcionalidades avanzadas:
- Visualizacion de achievements desbloqueados
- Animacion de rank-up
- Contador de streaks
- Celebracion con confetti

Ninguno de estos se usa actualmente.

#### Recomendacion
Integrar CompletionModal como modal final tras completar:
1. Un modulo completo
2. Un achievement especifico
3. Un streak de X dias

#### Esfuerzo Estimado
- 6-8 horas (integracion con sistema de achievements)

---

### GAP-EX-017: 4 Auxiliares Sin Backend

**Severidad:** ALTO
**Estado:** CONFIRMADO

#### Ejercicios Afectados
1. CollagePrensa
2. CallToAction
3. ComprensionAuditiva
4. TextoEnMovimiento

#### Descripcion
Estos ejercicios auxiliares funcionan solo en frontend. El progreso no se persiste y no contribuyen a metricas del estudiante.

#### Recomendacion
1. Evaluar si deben persistir (decision de producto)
2. Si SI: Crear endpoints similares a ejercicios principales
3. Si NO: Documentar como "ejercicios de practica sin tracking"

#### Esfuerzo Estimado
- Decision: 1 hora
- Implementacion (si aplica): 8-12 horas

---

## 4. GAPs Medios (Sprint Siguiente)

### GAP-EX-003: Respuestas Abiertas No Visibles (Parcial)

**Severidad:** MEDIO
**Estado:** PARCIALMENTE INVALIDADO

#### Actualizacion
FASE 2 valido que las respuestas de M3 y M4 SI son accesibles via:
- `GET /api/v1/teacher/reviews/:id`
- Componente `ReviewDetail` en Teacher Portal

Solo M5 tiene el problema de multimedia descrito en GAP-EX-004.

#### Recomendacion
Cerrar este GAP como "parcialmente resuelto" y enfocar esfuerzos en GAP-EX-004.

---

### GAP-EX-005: Rubrica Sin Estructura Formal

**Severidad:** MEDIO
**Estado:** CONFIRMADO

#### Descripcion
La evaluacion manual en M3-M5 no tiene criterios formales. Docentes evaluan con score numerico sin rubrica estructurada.

#### Recomendacion
Disenar sistema de rubricas con:
- Criterios por tipo de ejercicio
- Escala consistente
- Guia para evaluadores

#### Esfuerzo Estimado
- Diseño: 8 horas (equipo pedagogico)
- Implementacion: 16-20 horas

---

### GAP-EX-006: Validacion Semantica Faltante

**Severidad:** MEDIO
**Estado:** DIFERIDO

#### Descripcion
Solo hay validacion de longitud minima/maxima, no de calidad o coherencia del contenido.

#### Recomendacion
Diferir para Fase 2 cuando se implemente integracion con servicios NLP.

---

### GAP-EX-008: Documentacion de Integracion Faltante

**Severidad:** MEDIO
**Estado:** CONFIRMADO

#### Descripcion
No existe guia que explique como integrar componentes compartidos (SubmitExerciseButton, FeedbackModal, HintModal) en nuevos ejercicios.

#### Recomendacion
Crear documento `/docs/95-guias-desarrollo/frontend/GUIA-INTEGRACION-EJERCICIOS.md`

#### Esfuerzo Estimado
- 4-6 horas

---

### GAP-EX-018: PrediccionNarrativa Evaluacion Incorrecta

**Severidad:** MEDIO
**Estado:** NUEVO

#### Descripcion
El ejercicio PrediccionNarrativa (M2) tiene discrepancia entre SPEC y codigo:
- **SPEC:** Evaluacion "Parcial" (seleccion auto + justificacion manual)
- **Codigo:** 100% automatica sin campo justificacion

#### Recomendacion
1. Si justificacion es importante: Agregar campo y evaluacion manual
2. Si no: Actualizar SPEC para reflejar implementacion actual

#### Esfuerzo Estimado
- 2-4 horas

---

## 5. GAPs Menores / Invalidados

### GAP-EX-001: INVALIDADO - Emparejamiento SI Envia al Backend

**Estado:** INVALIDADO
**Fecha:** 2026-01-20

#### Razon de Invalidacion
FASE 1 valido que el ejercicio Emparejamiento SI envia respuestas al backend via:
```typescript
import { submitExercise } from '@/features/progress/api/progressAPI';

const handleCheck = async () => {
  if (isComplete && user?.id) {
    const response = await submitExercise(exercise.id, user.id, { matches });
  }
};
```

La percepcion inicial del gap posiblemente se debio a:
- Envio condicional (solo si `isComplete && user?.id`)
- Errores silenciados
- Cache no invalidado correctamente

---

### GAP-EX-007: INVALIDADO - Mecanicas M4 Documentadas

**Estado:** INVALIDADO
**Fecha:** 2026-01-20

#### Razon de Invalidacion
Las mecanicas removidas de M4 (EmailFormal, ChatLiterario, EnsayoArgumentativo, ResenaCritica) SI estan documentadas en SPEC-MECANICAS-M4.md linea 14.

---

### GAP-EX-009: Alternativas de Respuesta No Documentadas

**Severidad:** BAJO
**Estado:** DOCUMENTACION

No requiere accion inmediata.

---

### GAP-EX-010: Estados de Validacion Ambiguos

**Severidad:** BAJO
**Estado:** DOCUMENTACION

No requiere accion inmediata.

---

### GAP-EX-019: DTO Discrepancias vs SPEC

**Severidad:** BAJO
**Estado:** NUEVO

#### Descripcion
5 ejercicios de M1 tienen discrepancias entre formato DTO en codigo vs SPEC:

| Ejercicio | SPEC Key | Codigo Key |
|-----------|----------|------------|
| Emparejamiento | `matches: {qId: aId}` | `matches: [{leftId, rightId}]` |
| SopaLetras | `foundWords: [{coords}]` | `words: ["str"]` |
| Crucigrama | `answers` | `clues` |
| Timeline | `order` | `events` |
| MapaConceptual | `connections: [{obj}]` | `connections: ["str"]` |

#### Recomendacion
Documentar formato oficial usado en codigo. No requiere cambio de codigo.

---

## 6. Plan de Remediacion Propuesto

### Sprint Actual (P0 - Critico)

| # | GAP | Accion | Responsable | Horas |
|---|-----|--------|-------------|-------|
| 1 | GAP-EX-013 | Agregar XP/MLCoins a 22 ejercicios | Frontend | 8h |
| 2 | GAP-EX-004 | Implementar servicio upload multimedia | Backend + Infra | 30h |
| 3 | GAP-EX-002 | Implementar optimistic update para pendingReview | Frontend | 6h |
| 4 | GAP-EX-011 | Decidir: integrar o deprecar SubmitExerciseButton | Arquitectura | 2h |

**Total Sprint Actual: 46 horas**

### Sprint Siguiente (P1 - Alto)

| # | GAP | Accion | Responsable | Horas |
|---|-----|--------|-------------|-------|
| 5 | GAP-EX-012 | Definir e integrar sistema de hints oficial | Frontend + Pedagogia | 20h |
| 6 | GAP-EX-016 | Integrar CompletionModal con achievements | Frontend | 8h |
| 7 | GAP-EX-017 | Evaluar e implementar backend auxiliares | Backend | 12h |
| 8 | GAP-EX-014 | Corregir pendingReview en 3 ejercicios M4 | Frontend | 2h |

**Total Sprint Siguiente: 42 horas**

### Backlog (P2 - Medio)

| # | GAP | Accion | Horas |
|---|-----|--------|-------|
| 9 | GAP-EX-008 | Crear guia de integracion ejercicios | 6h |
| 10 | GAP-EX-005 | Disenar sistema de rubricas | 24h |
| 11 | GAP-EX-015 | Plan de contenido hints (pedagogia) | 40h |
| 12 | GAP-EX-018 | Alinear PrediccionNarrativa con SPEC | 4h |

**Total Backlog: 74 horas**

---

## 7. Metricas de Seguimiento

### KPIs de Remediacion

| Metrica | Actual | Objetivo Sprint | Objetivo Final |
|---------|--------|-----------------|----------------|
| Ejercicios con XP/MLCoins visible | 15% | 100% | 100% |
| Ejercicios con sistema hints | 10% | 10% | 50% |
| M5 evaluable (multimedia) | 0% | 100% | 100% |
| Componentes compartidos en uso | 33% | 50% | 80% |
| Gaps criticos abiertos | 5 | 2 | 0 |

### Criterios de Cierre

Un GAP se considera cerrado cuando:
1. La solucion esta implementada y desplegada
2. Se ha validado funcionalmente
3. La documentacion esta actualizada
4. No hay regresiones en CI/CD

---

## 8. Referencias

### Documentos Relacionados
- [METADATA.yml](../../../orchestration/tareas/TASK-2026-01-20-EXERCISES-VALIDATION/METADATA.yml)
- [FASE-1-VALIDACION-COMPONENTES.md](../../../orchestration/tareas/TASK-2026-01-20-EXERCISES-VALIDATION/FASE-1-VALIDACION-COMPONENTES.md)
- [FASE-2-VALIDACION-MODULOS.md](../../../orchestration/tareas/TASK-2026-01-20-EXERCISES-VALIDATION/FASE-2-VALIDACION-MODULOS.md)

### Especificaciones de Mecanicas
- [SPEC-MECANICAS-M1-M3.md](../mecanicas/SPEC-MECANICAS-M1-M3.md)
- [SPEC-MECANICAS-M4.md](../mecanicas/SPEC-MECANICAS-M4.md)
- [SPEC-MECANICAS-M5.md](../mecanicas/SPEC-MECANICAS-M5.md)

### Componentes Clave
- `/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx`
- `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`
- `/apps/frontend/src/apps/student/components/exercise/HintModal.tsx`
- `/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx`

---

*Documento generado: 2026-01-20*
*Ultima actualizacion: 2026-01-20*
*Tarea: TASK-2026-01-20-EXERCISES-VALIDATION (SUBTASK-4.1 + 4.2)*
