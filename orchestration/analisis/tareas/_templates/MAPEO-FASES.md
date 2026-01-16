# Mapeo de Fases: NEXUS F1-F7 ↔ CAPVED

**Sistema:** NEXUS v4.0 + Gobernanza de Documentación
**Proyecto:** GAMILIT
**Propósito:** Documentar equivalencia entre sistemas de fases

---

## Resumen

GAMILIT usa el sistema de fases F1-F7 heredado de NEXUS v4.0, mientras que workspace-v2 usa el ciclo CAPVED de 6 fases. Este documento establece el mapeo entre ambos sistemas para garantizar interoperabilidad.

---

## Mapeo Completo

| Fase NEXUS | Nombre | Fase CAPVED | Equivalencia |
|------------|--------|-------------|--------------|
| **F1** | Análisis Inicial | **C** (Contexto) | Entender el problema, clasificar, vincular |
| **F2** | Análisis Detallado | **A** (Análisis) | Mapear impacto, dependencias, riesgos |
| **F3** | Plan de Corrección | **P** (Planeación) | Desglosar subtareas, diseñar solución |
| **F4** | Validación del Plan | **V** (Validación) | Gate antes de ejecutar |
| **F5** | Refinamiento | **V+** | Validación extendida (opcional) |
| **F6** | Ejecución | **E** (Ejecución) | Implementar cambios |
| **F7** | Validación Ejecución | **D** (Documentación) | Actualizar inventarios, trazas |

---

## Descripción por Fase

### F1 - Análisis Inicial (≈ C: Contexto)

**Propósito:** Comprender el problema a alto nivel

**Actividades:**
- Leer documentación relevante en `/docs/`
- Identificar alcance de la tarea
- Clasificar tipo de tarea (feature, bugfix, refactor, etc.)
- Vincular con épica/user story si aplica

**Archivo típico:** `F1-ANALISIS-INICIAL-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Problema entendido, alcance definido

---

### F2 - Análisis Detallado (≈ A: Análisis)

**Propósito:** Analizar en profundidad el problema

**Actividades:**
- Analizar código existente
- Identificar dependencias
- Mapear impacto de cambios
- Documentar riesgos

**Archivo típico:** `F2-ANALISIS-DETALLADO-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Análisis completo documentado

---

### F3 - Plan de Corrección (≈ P: Planeación)

**Propósito:** Diseñar la solución

**Actividades:**
- Crear plan detallado de implementación
- Desglosar en subtareas
- Definir orden de ejecución
- Identificar recursos necesarios

**Archivo típico:** `F3-PLAN-CORRECCION-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Plan aprobable

---

### F4 - Validación del Plan (≈ V: Validación)

**Propósito:** Gate de calidad antes de ejecutar

**Actividades:**
- Validar plan contra documentación
- Verificar que no hay duplicación
- Confirmar que dependencias están resueltas
- Aprobar o rechazar plan

**Archivo típico:** `F4-VALIDACION-PLAN-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Plan aprobado para ejecución

---

### F5 - Refinamiento (≈ V+: Validación Extendida)

**Propósito:** Ajustes finales al plan (opcional)

**Actividades:**
- Incorporar feedback de validación
- Refinar detalles de implementación
- Actualizar estimaciones si es necesario

**Archivo típico:** `F5-REFINAMIENTO-PLAN-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Plan final listo

**Nota:** Esta fase es OPCIONAL. Puede omitirse si F4 aprobó sin cambios.

---

### F6 - Ejecución (≈ E: Ejecución)

**Propósito:** Implementar los cambios

**Actividades:**
- Escribir/modificar código
- Ejecutar validaciones (build, lint, tests)
- Crear commits
- Resolver problemas encontrados

**Archivo típico:** `F6-EJECUCION-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Implementación completa, builds pasando

---

### F7 - Validación de Ejecución (≈ D: Documentación)

**Propósito:** Validar y documentar resultado

**Actividades:**
- Verificar que builds pasan
- Verificar que no hay imports rotos
- Actualizar inventarios (BACKEND_INVENTORY, FRONTEND_INVENTORY, etc.)
- Actualizar trazas de tareas
- Documentar lecciones aprendidas

**Archivo típico:** `F7-VALIDACION-EJECUCION-{DOMINIO}-{FECHA}.md`

**Criterio de salida:** Tarea completada y documentada

---

## Cuándo Usar Cada Sistema

### Usar Nomenclatura F1-F7 cuando:
- Trabajando dentro de GAMILIT exclusivamente
- Continuando tareas existentes que usan F1-F7
- El agente NEXUS está activo

### Usar Nomenclatura CAPVED cuando:
- Trabajando a nivel de workspace-v2
- Propagando cambios entre proyectos
- El agente META-ORQUESTADOR está activo

---

## Ejemplo de Mapeo en METADATA.yml

```yaml
fases:
  f1_analisis_inicial:
    estado: "completada"
    archivo: "F1-ANALISIS-INICIAL-AUTH-2026-01-10.md"
    capved_equivalente: "C"  # Mapeo explícito
    completado_en: "2026-01-10 09:00"

  f2_analisis_detallado:
    estado: "completada"
    archivo: "F2-ANALISIS-DETALLADO-AUTH-2026-01-10.md"
    capved_equivalente: "A"
    completado_en: "2026-01-10 11:00"
```

---

## Notas de Implementación

1. **Compatibilidad:** Ambos sistemas son compatibles. No es necesario migrar tareas existentes.

2. **Fases Mínimas:** Para tareas tipo `@QUICK`, solo se requieren:
   - F1 (Contexto mínimo)
   - F6 (Ejecución)
   - F7 (Documentación)

3. **Fases Completas:** Para tareas tipo `@FULL`, se requieren todas las fases.

4. **Saltar Fases:** Una fase puede marcarse como `omitida` si no aplica.

---

**Creado:** 2026-01-16
**Sistema:** NEXUS v4.0 + Gobernanza
