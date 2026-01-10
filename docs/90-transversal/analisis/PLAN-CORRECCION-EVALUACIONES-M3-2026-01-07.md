# PLAN DE EJECUCION: CORR-M3-001-002 - Evaluaciones Modulo 3

**Agente:** Orchestrator-Agent
**Tipo de tarea:** Correccion
**Prioridad:** P1
**Fecha creacion:** 2026-01-07
**Relacionado con:** [GAP-SEED-M3-001], [GAP-SEED-M3-002], [ANALISIS-EVAL-M3M4M5-2026-01-07]

---

## OBJETIVO

Corregir los ejercicios 3.1 (Analisis de Fuentes) y 3.5 (Tribunal de Opiniones) para que tengan `requires_manual_grading = true` en base de datos y aparezcan correctamente en el portal Teacher.

**Criterios de Aceptacion:**
- [x] Ejercicio "Analisis de Fuentes" con requires_manual_grading=true
- [x] Ejercicio "Tribunal de Opiniones" con requires_manual_grading=true
- [x] Seed prod actualizado con ON CONFLICT UPDATE
- [x] Seed dev sincronizado
- [x] BD actualizada (5/5 ejercicios M3 con flag)
- [x] Documentacion actualizada

---

## ANALISIS PREVIO

### Contexto
- **Por que es necesario?** Los ejercicios M3.1 y M3.5 no aparecen en portal Teacher
- **Que problema resuelve?** Permite evaluacion manual y distribucion de recompensas
- **Que valor aporta?** Completa la integracion del Modulo 3 con el sistema de evaluaciones

### Estado Actual
- **Objetos existentes:** Campo requires_manual_grading existe en tabla exercises
- **Dependencias:** Vista teacher_pending_reviews, trigger create_manual_review, servicios backend
- **Restricciones:** ON CONFLICT debe incluir el nuevo campo

### Anti-Duplicacion
```bash
# Verificacion de seeds existentes
ls -la apps/database/seeds/*/educational_content/04-exercises-module3.sql

# Resultado:
# prod/educational_content/04-exercises-module3.sql - EXISTE
# dev/educational_content/04-exercises-module3.sql - EXISTE
# No hay duplicacion - modificar existentes
```

---

## DISENO DE SOLUCION

### Approach Seleccionado
Modificar los seeds existentes agregando el campo `requires_manual_grading` a los INSERT statements y a las clausulas ON CONFLICT DO UPDATE.

**Alternativas consideradas:**
1. UPDATE directo en BD - Descartado: no persiste en recreacion
2. Cambiar DEFAULT en DDL - Descartado: semanticamente incorrecto

### Componentes a Crear/Modificar

**Database:**
- [ ] Schema: N/A
- [ ] Tablas: N/A
- [ ] Funciones: N/A
- [ ] Triggers: N/A
- [x] Seeds: 04-exercises-module3.sql (prod y dev)

**Backend:**
- No requiere cambios (entity ya mapea el campo)

**Frontend:**
- No requiere cambios (constante ya lista los 5 ejercicios)

---

## CICLOS DE EJECUCION

### Ciclo 1: Modificacion Seeds PROD
**Duracion estimada:** 10 minutos
**Objetivo:** Agregar requires_manual_grading a seed de produccion

**Tareas:**
1. Agregar campo a lista de columnas en INSERT (linea ~37)
2. Agregar valor `true` en VALUES (linea ~146)
3. Agregar campo en ON CONFLICT clause (linea ~149)
4. Repetir para segundo ejercicio (lineas ~506, ~606, ~609)

**Artefactos generados:**
- Archivo: apps/database/seeds/prod/educational_content/04-exercises-module3.sql (modificado)

**Validacion:**
```bash
grep -n "requires_manual_grading" seeds/prod/educational_content/04-exercises-module3.sql | wc -l
# Resultado esperado: 15 (3 por ejercicio x 5 ejercicios)
```

**Criterios de exito:**
- [x] Archivo modificado sin errores de sintaxis
- [x] 15 ocurrencias del campo en el archivo

---

### Ciclo 2: Sincronizacion Seeds DEV
**Duracion estimada:** 10 minutos
**Objetivo:** Aplicar mismos cambios a seed de desarrollo

**Tareas:**
1. Aplicar CORR-M3-001 a ejercicio Analisis de Fuentes
2. Aplicar CORR-M3-002 a ejercicio Tribunal de Opiniones

**Artefactos generados:**
- Archivo: apps/database/seeds/dev/educational_content/04-exercises-module3.sql (modificado)

**Validacion:**
```bash
grep -n "requires_manual_grading" seeds/dev/educational_content/04-exercises-module3.sql | wc -l
# Resultado esperado: 15
```

**Criterios de exito:**
- [x] Archivo dev sincronizado con prod
- [x] Ambos archivos con 15 ocurrencias

---

### Ciclo 3: Actualizacion Base de Datos
**Duracion estimada:** 5 minutos
**Objetivo:** Aplicar cambios a BD existente

**Tareas:**
1. Ejecutar seed de modulo 3 en BD de desarrollo
2. Verificar que ON CONFLICT UPDATE funcione

**Validacion:**
```bash
psql -c "SELECT title, requires_manual_grading
         FROM educational_content.exercises e
         JOIN educational_content.modules m ON e.module_id = m.id
         WHERE m.module_code = 'MOD-03-CRITICA'
         ORDER BY e.order_index;"
```

**Criterios de exito:**
- [x] Seed ejecuta sin errores
- [x] 5/5 ejercicios con requires_manual_grading = true

---

### Ciclo 4: Validacion Final
**Duracion estimada:** 10 minutos
**Objetivo:** Validar integracion completa

**Validaciones:**
```bash
# Verificar todos los modulos M3-M4-M5
psql -c "SELECT m.module_code, COUNT(*) as total,
                SUM(CASE WHEN requires_manual_grading THEN 1 ELSE 0 END) as manual
         FROM educational_content.exercises e
         JOIN educational_content.modules m ON e.module_id = m.id
         WHERE m.module_code IN ('MOD-03-CRITICA','MOD-04-DIGITAL','MOD-05-PRODUCCION')
         GROUP BY m.module_code
         ORDER BY m.module_code;"

# Resultado esperado:
# MOD-03-CRITICA: 5/5
# MOD-04-DIGITAL: 5/5
# MOD-05-PRODUCCION: 3/3
```

**Checklist de Validacion:**
- [x] Seed ejecuta sin errores
- [x] 13/13 ejercicios con evaluacion manual
- [x] Documentacion actualizada
- [x] Seeds sincronizados (prod = dev)

---

## DEPENDENCIAS

### Depende de:
- [DDL-exercises]: Campo requires_manual_grading en tabla (COMPLETADO)
- [Trigger-manual-review]: Trigger de creacion automatica (COMPLETADO)

### Bloquea:
- Portal Teacher: Evaluacion de ejercicios M3.1 y M3.5

### Requerimientos externos:
- Ninguno

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Seed falla por sintaxis SQL | Baja | Alto | Validar con grep antes de ejecutar |
| ON CONFLICT no actualiza | Media | Alto | Incluir campo explicito en UPDATE SET |
| Seeds desincronizados | Baja | Medio | Aplicar mismos cambios a ambos |

---

## ESTIMACIONES

**Tiempo total estimado:** 1 hora

**Desglose:**
- Analisis: 15 min (completado)
- Desarrollo: 20 min
- Testing: 10 min
- Documentacion: 15 min

**Recursos necesarios:**
- Agentes: Orchestrator-Agent
- Subagentes: Ninguno
- Herramientas: Edit, Bash, Read

---

## DOCUMENTACION A GENERAR

**Durante ejecucion:**
- [x] Comentarios CORR-M3-001 y CORR-M3-002 en codigo

**Post-ejecucion:**
- [x] VALIDACION-CORR-M3-001-002-2026-01-07.md
- [x] CORR-M3-001-002-requires-manual-grading.md
- [x] Actualizacion de _MAP.md de correcciones

---

## CRITERIOS DE EXITO

La tarea se considera **COMPLETADA** cuando:

- [x] Ciclos 1-4 ejecutados exitosamente
- [x] Validacion SQL confirma 13/13 ejercicios
- [x] Seeds prod y dev sincronizados
- [x] Documentacion completa
- [x] _MAP.md actualizado

---

## REFERENCIAS

**Documentacion del proyecto:**
- Analisis: ANALISIS-EVALUACIONES-M3-M4-M5-2026-01-07.md
- Correccion: CORR-M3-001-002-requires-manual-grading.md

**Archivos de referencia:**
- Template: 05-exercises-module4.sql (estructura correcta)
- Similar: 06-exercises-module5.sql (ya tiene campo)

---

**Version:** 2.0
**Ultima actualizacion:** 2026-01-07
**Aprobado para ejecucion:** Si (EJECUTADO)
