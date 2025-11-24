# ADR-010: DocumentoDeDiseño como Fuente de Verdad para Módulos y Ejercicios

**Estado:** Aceptado
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-MOD1-001, GAP-MOD3-001, REPORTE-DESALINEACION-MODULOS-EJERCICIOS-2025-11-23.md

---

## Contexto

El 2025-11-23, se identificó una **desalineación crítica** entre la documentación oficial de diseño (`DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` v6.4) y la implementación real en base de datos (seeds de producción).

### Hallazgos del Análisis

**Módulo 1 (Comprensión Literal):**
- **Documentado:** Crucigrama, Línea de Tiempo, Completar Espacios, Verdadero/Falso, Sopa de Letras
- **Implementado:** Crucigrama, Línea de Tiempo, Sopa de Letras, Mapa Conceptual, Emparejamiento
- **Discrepancia:** 3 de 5 ejercicios NO coinciden

**Módulo 3 (Comprensión Crítica):**
- **Documentado:** 5 ejercicios (3.1-3.5)
- **Implementado:** 4 ejercicios (falta 3.5 "Matriz de Perspectivas")

**Módulos 4-5:**
- **Documentado:** Diseño completo con 5 ejercicios (M4) y 3 opciones (M5)
- **Implementado:** 0 ejercicios (status 'backlog')

### Contexto Histórico Reportado

Según información del Product Owner:
> "Ya estaba todo desarrollado solo se estaban corrigiendo bugs pero en algún punto echaron a perder todo el avance que se tenía"

Esto indica que:
1. Existió una implementación correcta previa alineada con el diseño
2. En algún momento del desarrollo se sobrescribió/modificó incorrectamente
3. Los seeds actuales NO reflejan el diseño pedagógico aprobado

---

## Decisión

**Se establece como principio arquitectónico que:**

1. **El `DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` es la FUENTE DE VERDAD** para:
   - Cantidad de módulos y ejercicios
   - Nombres y tipos de ejercicios
   - Orden de ejercicios (order_index)
   - Mecánicas pedagógicas (basadas en modelo Cassany)
   - XP y ML Coins por ejercicio
   - Dificultad y tiempos estimados

2. **Cualquier desviación del diseño documentado requiere**:
   - ADR justificando el cambio con razones pedagógicas/técnicas
   - Actualización del DocumentoDeDiseño a nueva versión
   - Aprobación del Product Owner
   - Validación del Architecture-Analyst

3. **El código debe alinearse con la documentación**, NO al revés:
   - Si hay desalineación, corregir seeds/código
   - NO modificar DocumentoDeDiseño para aceptar código incorrecto
   - Excepción: errores menores tipográficos o de formato

4. **Alcance del MVP actual: Módulos 1-3 completos + Módulos 4-5 en backlog**:
   - Módulos 1-3 deben implementarse EXACTAMENTE según DocumentoDeDiseño v6.4
   - Módulos 4-5 quedan en backlog para fase posterior (roadmap TBD)
   - Frontend mostrará módulos 4-5 como "En Construcción" con información clara

---

## Consecuencias

### Positivas

1. **Coherencia pedagógica garantizada**
   - Progresión Cassany (literal → inferencial → crítica) preservada
   - Ejercicios validados pedagógicamente en diseño

2. **Trazabilidad mejorada**
   - Única fuente de verdad para desarrollo
   - Cambios requieren documentación formal (ADR)

3. **Calidad del producto**
   - Usuarios reciben experiencia diseñada y validada
   - Previene desviaciones accidentales futuras

4. **Facilita desarrollo**
   - Desarrolladores consultan diseño, no necesitan "adivinar"
   - QA puede validar contra especificación clara

### Negativas

1. **Trabajo de corrección inmediato requerido**
   - Módulo 1: corregir 3 ejercicios (1.3, 1.4, 1.5)
   - Módulo 3: agregar ejercicio 3.5
   - Estimado: 2-3 días de trabajo

2. **Posible pérdida de trabajo previo**
   - Si "Mapa Conceptual" y "Emparejamiento" requirieron esfuerzo significativo
   - Mitigación: preservar en branch separado por si se reutilizan

3. **Requiere proceso de validación continua**
   - Architecture-Analyst debe validar periódicamente coherencia
   - CI/CD debería incluir validaciones automatizadas futuras

### Mitigaciones

1. **Para trabajo perdido:**
   - Crear branch `backup/modulo1-ejercicios-alternativos` antes de modificar
   - Preservar seeds de "Mapa Conceptual" y "Emparejamiento" por si se reutilizan en módulos futuros

2. **Para prevenir futuras desalineaciones:**
   - Implementar checklist de validación pre-merge
   - Architecture-Analyst revisa cambios en seeds vs DocumentoDeDiseño
   - Agregar comentarios en seeds referenciando líneas del DocumentoDeDiseño

3. **Para mantenimiento:**
   - Versionado sincronizado (DocumentoDeDiseño v6.4 ↔ seeds v6.4)
   - Scripts de validación automatizada (comparar seeds vs diseño)

---

## Alternativas Consideradas

### Alternativa 1: Actualizar DocumentoDeDiseño para aceptar código actual ❌ RECHAZADA

**Razones de rechazo:**
- Violaría el diseño pedagógico validado basado en Cassany
- El PO confirmó que diseño original es correcto
- Se perdería trazabilidad de por qué se hicieron cambios
- Ejercicios actuales (Mapa Conceptual, Emparejamiento) no están validados pedagógicamente

### Alternativa 2: Mantener ambas versiones (diseño vs código divergentes) ❌ RECHAZADA

**Razones de rechazo:**
- Genera confusión permanente en equipo de desarrollo
- QA no sabría qué validar
- Usuarios recibirían producto no diseñado
- Viola principio de "single source of truth"

### Alternativa 3: Diseño como guía, código como realidad ❌ RECHAZADA

**Razones de rechazo:**
- Permite drift continuo entre documentación y código
- No hay accountability para desviaciones
- Documentación se vuelve obsoleta rápidamente
- Dificulta onboarding de nuevos desarrolladores

---

## Plan de Corrección

### Fase 1: Corrección Inmediata (2025-11-23 al 2025-11-29)

**Responsable:** Database-Developer (delegado por Architecture-Analyst)

#### Módulo 1: Corrección Completa

**Archivo:** `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`

**Acciones:**
1. **Preservar trabajo actual (backup):**
   ```bash
   git checkout -b backup/modulo1-ejercicios-alternativos
   git add apps/database/seeds/prod/educational_content/02-exercises-module1.sql
   git commit -m "backup: Preservar Mapa Conceptual y Emparejamiento antes de corrección"
   git checkout master
   ```

2. **Implementar ejercicio 1.3: Completar Espacios en Blanco**
   - Referencia: DocumentoDeDiseño líneas 267-297
   - `exercise_type: 'completar_espacios'`
   - `order_index: 3`

3. **Implementar ejercicio 1.4: Verdadero o Falso**
   - Referencia: DocumentoDeDiseño líneas 300-349
   - `exercise_type: 'verdadero_falso'`
   - 10 afirmaciones según diseño

4. **Mover ejercicio 1.5: Sopa de Letras**
   - Cambiar `order_index: 3` → `order_index: 5`
   - Agregar flag `is_bonus: true` según diseño

5. **Eliminar ejercicios NO documentados:**
   - Ejercicio 1.4 actual: "Mapa Conceptual" → ELIMINAR
   - Ejercicio 1.5 actual: "Emparejamiento" → ELIMINAR
   - (Preservados en branch backup)

#### Módulo 3: Completar Faltante

**Archivo:** `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`

**Acciones:**
1. **Implementar ejercicio 3.5: Matriz de Perspectivas**
   - Referencia: DocumentoDeDiseño líneas 729-766
   - `exercise_type: 'matriz_perspectivas'`
   - `order_index: 5`
   - Evento: "Marie gana el Nobel de Química en 1911 en medio de escándalo personal"
   - 6 perspectivas según diseño

### Fase 2: Validación (2025-11-29 al 2025-11-30)

**Responsable:** Architecture-Analyst

**Checklist de validación:**
- [ ] Módulo 1 tiene exactamente 5 ejercicios según DocumentoDeDiseño
- [ ] Ejercicios 1.1-1.5 corresponden a tipos correctos
- [ ] Order_index correcto (1-5)
- [ ] Módulo 3 tiene 5 ejercicios completos
- [ ] Ejercicio 3.5 implementado según especificación
- [ ] Seeds ejecutan sin errores
- [ ] Backend devuelve ejercicios correctos en API
- [ ] Frontend muestra ejercicios correctos en UI

### Fase 3: Actualización Documental (2025-11-30)

**Responsable:** Architecture-Analyst

**Acciones:**
1. Actualizar comentarios en seeds con referencias:
   ```sql
   -- =====================================================
   -- EXERCISE 1.3: COMPLETAR ESPACIOS EN BLANCO
   -- Referencia: DocumentoDeDiseño v6.4 líneas 267-297
   -- Validado: 2025-11-29 (Architecture-Analyst)
   -- =====================================================
   ```

2. Crear documento de trazabilidad:
   - `orchestration/reportes/VALIDACION-ALINEACION-POST-CORRECCION-2025-11-30.md`

---

## Referencias

### Documentos Relacionados

- **Diseño:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` (v6.4)
- **Análisis de Gaps:** `orchestration/agentes/architecture-analyst/gap-analysis/REPORTE-DESALINEACION-MODULOS-EJERCICIOS-2025-11-23.md`
- **Matriz de Gaps:** `orchestration/agentes/architecture-analyst/gap-analysis/gaps-matrix.yml`

### Prompts de Agentes

- **Database-Developer:** `orchestration/prompts/PROMPT-DATABASE-AGENT.md`
- **Architecture-Analyst:** `orchestration/prompts/PROMPT-ARCHITECTURE-ANALYST.md`

### Directivas Aplicables

- `DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` - Documentar cambios en diseño
- `DIRECTIVA-VALIDACION-SUBAGENTES.md` - Proceso de validación de implementaciones
- `POLITICAS-USO-AGENTES.md` - Roles y responsabilidades

---

## Implementación

### Responsables

| Rol | Persona/Agente | Responsabilidad |
|-----|----------------|-----------------|
| **Decisión** | Product Owner | Aprobar ADR y alcance MVP |
| **Documentación** | Architecture-Analyst | Crear ADR, validar coherencia |
| **Implementación** | Database-Developer | Corregir seeds según diseño |
| **Validación** | Architecture-Analyst | Verificar alineación post-corrección |

### Timeline

| Fecha | Milestone |
|-------|-----------|
| 2025-11-23 | ADR-010 creado y aprobado |
| 2025-11-25 | Inicio corrección Módulo 1 |
| 2025-11-27 | Implementación ejercicio 3.5 |
| 2025-11-29 | Correcciones completadas |
| 2025-11-30 | Validación Architecture-Analyst |
| 2025-12-01 | Reporte final de alineación |

---

## Métricas de Éxito

### Pre-Corrección (Estado Actual)

```yaml
coherencia_documentacion_codigo: 60%
ejercicios_correctos: 11/23 (48%)
ejercicios_incorrectos: 3/23 (13%)
ejercicios_faltantes: 9/23 (39%)
```

### Post-Corrección (Estado Objetivo MVP)

```yaml
coherencia_documentacion_codigo: 100% (módulos 1-3)
ejercicios_correctos: 15/15 (100% del alcance MVP)
ejercicios_incorrectos: 0
ejercicios_faltantes_en_mvp: 0
ejercicios_en_backlog: 8 (módulos 4-5, fase 2)
```

---

## Proceso de Validación Continua

Para prevenir futuras desalineaciones, se establece:

### Checklist Pre-Merge (Obligatorio)

**Para cambios en seeds educacionales:**
- [ ] Cambio referencia línea específica del DocumentoDeDiseño
- [ ] Si hay desviación del diseño, existe ADR justificándola
- [ ] Architecture-Analyst revisó y aprobó cambios
- [ ] Comentarios en código indican versión de diseño usada

### Revisión Periódica

**Frecuencia:** Mensual o antes de releases
**Responsable:** Architecture-Analyst

**Acciones:**
1. Ejecutar script de validación (a crear en futuro)
2. Comparar seeds vs DocumentoDeDiseño manualmente
3. Generar reporte de coherencia
4. Escalar gaps encontrados a Product Owner

---

**Versión ADR:** 1.0
**Estado:** APROBADO (2025-11-23)
**Próxima Revisión:** Post-correcciones (2025-12-01)

---

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Product Owner | [Pendiente] | 2025-11-23 | ✅ Aprobado (decisión verbal) |
| Architecture-Analyst | Claude (Architecture-Analyst) | 2025-11-23 | ✅ Creado |
| Tech Lead | [Pendiente] | 2025-11-23 | ⏳ Pendiente |

---

## Notas Adicionales

**Lecciones Aprendidas:**

1. La falta de un rol Architecture-Analyst activo permitió que se introdujeran desviaciones sin validación
2. Seeds deben tener referencias explícitas a documentación de diseño
3. Cambios en seeds requieren proceso de revisión formal

**Mejoras Futuras:**

1. Script de validación automatizada (comparar JSON seeds vs diseño)
2. Pre-commit hook que verifique coherencia
3. CI/CD que falle si seeds no coinciden con diseño
4. Template de seed con campos obligatorios de trazabilidad
