# PLAN REFINADO: Integración M3-M5 con Validación del Maestro

**Fecha:** 2026-01-07
**Autor:** Claude Opus 4.5 (Arquitecto de Soluciones)
**Versión:** 2.0 (Refinado)
**Estado:** FASE 5 COMPLETADA - Plan Refinado

---

## CAMBIOS RESPECTO AL PLAN ORIGINAL

### Hallazgos de la Validación

1. **Inconsistencia AnalisisFuentes (CRÍTICA)**
   - BD: `requires_manual_grading = TRUE`
   - Frontend: NO maneja `pending_review`, asume auto-evaluación
   - **Acción:** Agregar manejo de pending_review al componente

2. **Quiz TikTok es Auto-Evaluable (DOCUMENTAR)**
   - BD: `requires_manual_grading = FALSE`
   - Tiene respuestas correctas definidas
   - **Acción:** Documentar como excepción intencional

3. **Documentación Faltante**
   - 3 documentos necesitan crearse
   - **Acción:** Crear documentos en Fase 6

---

## PLAN DE EJECUCIÓN REFINADO

### FASE 6.1: CORRECCIÓN DE CÓDIGO (PRIORIDAD CRÍTICA)

#### 6.1.1 Corregir AnalisisFuentesExercise
**Archivo:** `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx`

**Líneas a modificar:** 243-265 (handleComplete function)

**Cambio requerido:**
```typescript
// ANTES (línea 243-264):
const response = await submitExercise(exerciseId, user.id, answers);
const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };
setFeedback({
  type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
  // ... muestra rewards inmediatamente
});

// DESPUÉS (agregar antes de setFeedback):
// CORR-AF-001: Manejar ejercicios con revisión manual
if (response.status === 'pending_review' || response.requiresManualReview) {
  setFeedback({
    type: 'info',
    title: 'Análisis Enviado',
    message: 'Tu análisis ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
    pendingReview: true,
  });
  setShowFeedback(true);
  onComplete?.(0, timeSpent);
  return;
}

// Continuar con flujo normal si no requiere revisión manual
const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };
// ...resto del código
```

**Dependencias:** Ninguna
**Riesgo:** Bajo (solo agrega un if antes del código existente)

---

### FASE 6.2: CREACIÓN DE DOCUMENTACIÓN

#### 6.2.1 Crear Documento de Flujo M3-M5
**Archivo nuevo:** `docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`

**Contenido:**
```markdown
# Flujo de Validación del Maestro - Módulos 3-5

## Resumen
Este documento describe el flujo completo de validación de ejercicios
que requieren evaluación manual del maestro.

## Ejercicios Incluidos (13 total)

### Módulo 3: Lectura Crítica (5 ejercicios)
1. analisis_fuentes - Evaluación de credibilidad de fuentes
2. debate_digital - Participación en debates argumentados
3. matriz_perspectivas - Análisis multiperspectiva
4. podcast_argumentativo - Creación de contenido de audio
5. tribunal_opiniones - Clasificación de opiniones fundamentadas

### Módulo 4: Lectura Digital (4 ejercicios + 1 auto-evaluable)
1. verificador_fake_news - Identificación de noticias falsas
2. infografia_interactiva - Diseño de infografías
3. navegacion_hipertextual - Navegación de contenido enlazado
4. analisis_memes - Evaluación de memes educativos
5. quiz_tiktok - **AUTO-EVALUABLE** (preguntas con respuesta única)

### Módulo 5: Producción Creativa (3 ejercicios - Elegir 1)
1. diario_multimedia - Entradas de diario con multimedia
2. comic_digital - Creación de cómic de 6 viñetas
3. video_carta - Video de 2-3 minutos

## Flujo Detallado

[Diagrama del flujo completo]

## Estados de la Submission
- draft: Guardado sin enviar
- submitted: Enviado, pendiente de revisión
- pending_review: En cola de revisión
- graded: Calificado por maestro
- reviewed: Revisión completada

## Recompensas
- XP: Calculado según score (0-100) y dificultad
- ML Coins: Base + multiplicadores por perfecto/sin pistas

## Notificaciones
- Al maestro: Cuando estudiante envía
- Al estudiante: Cuando maestro califica
```

#### 6.2.2 Crear RF-M3-001
**Archivo nuevo:** `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M3-001-ejercicios-m3.md`

**Contenido:** Especificaciones de los 5 ejercicios de M3 con:
- Descripción de cada ejercicio
- Flujo de validación manual
- Criterios de evaluación
- Recompensas configuradas

#### 6.2.3 Crear RESPONSES-M3-M5.md
**Archivo nuevo:** `docs/03-fase-extensiones/EXT-001-portal-maestros/paginas/RESPONSES-M3-M5.md`

**Contenido:** Documentación de TeacherExerciseResponsesPage

---

### FASE 6.3: ACTUALIZACIÓN DE DOCUMENTACIÓN EXISTENTE

#### 6.3.1 Actualizar Manual del Portal
**Archivo:** `docs/99-finiquito/Manual_Portal_Maestros_ACTUALIZADO.md`

**Agregar sección:**
```markdown
## Capítulo 7.1: Revisión de Ejercicios M3-M5

### Acceder al Panel de Revisión
1. Navegar a /teacher/reviews
2. Filtrar por módulo (M3, M4, M5)
3. Seleccionar submission pendiente

### Proceso de Calificación
1. Revisar respuesta del estudiante
2. Evaluar con rúbrica (si aplica)
3. Asignar score (0-100)
4. Agregar feedback
5. Click "Completar y Enviar"

### Recompensas Automáticas
- XP y ML Coins se asignan automáticamente
- El estudiante recibe notificación
```

#### 6.3.2 Actualizar Inventario
**Archivo:** `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml`

**Agregar sección:**
```yaml
ejercicios_revision_manual:
  total: 12  # Excluye quiz_tiktok
  modulo_3:
    count: 5
    tipos:
      - analisis_fuentes
      - debate_digital
      - matriz_perspectivas
      - podcast_argumentativo
      - tribunal_opiniones
  modulo_4:
    count: 4  # quiz_tiktok es auto-evaluable
    tipos:
      - verificador_fake_news
      - infografia_interactiva
      - navegacion_hipertextual
      - analisis_memes
    excepciones:
      - quiz_tiktok: "Auto-evaluable por diseño"
  modulo_5:
    count: 3
    tipos:
      - diario_multimedia
      - comic_digital
      - video_carta
```

---

### FASE 6.4: VALIDACIÓN FINAL

#### 6.4.1 Verificar Corrección de AnalisisFuentes
- [ ] Componente muestra mensaje "pendiente de revisión"
- [ ] No muestra rewards inmediatamente
- [ ] Backend recibe submission correctamente

#### 6.4.2 Verificar Documentación
- [ ] Documento de flujo consolidado creado
- [ ] RF-M3-001 creado
- [ ] RESPONSES-M3-M5.md creado
- [ ] Manual actualizado
- [ ] Inventario actualizado

#### 6.4.3 Verificar Consistencia
- [ ] 12/12 ejercicios manuales funcionan correctamente
- [ ] 1/1 ejercicio auto-evaluable documentado
- [ ] Notificaciones enviadas correctamente

---

## MATRIZ DE ARCHIVOS A MODIFICAR

### Código (1 archivo)
| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `AnalisisFuentesExercise.tsx` | MODIFICAR | CRÍTICA |

### Documentación Nueva (3 archivos)
| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` | CREAR | ALTA |
| `RF-M3-001-ejercicios-m3.md` | CREAR | ALTA |
| `RESPONSES-M3-M5.md` | CREAR | MEDIA |

### Documentación Actualizar (2 archivos)
| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `Manual_Portal_Maestros_ACTUALIZADO.md` | ACTUALIZAR | MEDIA |
| `DEVENV-MASTER-INVENTORY.yml` | ACTUALIZAR | BAJA |

---

## ORDEN DE EJECUCIÓN

```
1. CORRECCIÓN CRÍTICA
   └── 6.1.1 Corregir AnalisisFuentesExercise

2. DOCUMENTACIÓN NUEVA
   ├── 6.2.1 Crear documento de flujo
   ├── 6.2.2 Crear RF-M3-001
   └── 6.2.3 Crear RESPONSES-M3-M5

3. DOCUMENTACIÓN ACTUALIZAR
   ├── 6.3.1 Actualizar Manual del Portal
   └── 6.3.2 Actualizar Inventario

4. VALIDACIÓN
   ├── 6.4.1 Verificar corrección código
   ├── 6.4.2 Verificar documentación
   └── 6.4.3 Verificar consistencia
```

---

## CRITERIOS DE ÉXITO

### Código
- [x] 12/12 ejercicios con revisión manual muestran "pendiente de revisión"
- [ ] AnalisisFuentes corregido para manejar pending_review
- [x] Triggers de BD funcionan correctamente

### Documentación
- [ ] 6/6 documentos completos
- [ ] Quiz TikTok documentado como excepción
- [ ] Flujo completo documentado

### Validación
- [ ] Prueba E2E del flujo exitosa
- [ ] Sin regresiones en ejercicios existentes

---

## ESTIMACIÓN

| Fase | Archivos | Complejidad |
|------|----------|-------------|
| 6.1 Corrección código | 1 | Baja |
| 6.2 Documentación nueva | 3 | Media |
| 6.3 Documentación actualizar | 2 | Baja |
| 6.4 Validación | 0 | Baja |

**Total:** 6 archivos a modificar/crear

---

*Plan refinado listo para ejecución*
