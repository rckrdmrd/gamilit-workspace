# Directivas: Flujos de Trabajo

**Fecha:** 2025-11-02
**Versión:** 1.0
**Aplicable a:** Todos los agentes NEXUS-*

---

## 🔄 Flujo de Trabajo: 3 Fases

Todo desarrollo sigue este flujo:

**ANÁLISIS → PLANEACIÓN → EJECUCIÓN**

---

## 📊 DF-001: Fase de ANÁLISIS (10-30% del tiempo)

### Objetivo
Entender completamente el problema/feature antes de implementar

### Actividades
1. Leer `/docs/01-fase-alcance-inicial/casos-uso/UC-*.md`
2. Leer `/docs/90-transversal/`
3. Analizar código existente en `/apps/`
4. Identificar archivos afectados
5. Detectar dependencias e impactos

### Output
- `orchestration/01-analisis/features/YYYY-MM-DD-{nombre}.md`

### Puede usar subagentes
Sí (análisis en paralelo por capa)

---

## 📋 DF-002: Fase de PLANEACIÓN (20-30% del tiempo)

### Objetivo
Definir estrategia de implementación con detalle granular

### Actividades
1. Descomponer tarea en ciclos/microciclos (hasta 5 niveles)
2. Definir orden de ejecución (dependencias)
3. **Verificar slots disponibles** en REGISTRO-SUBAGENTES.json
4. Asignar subagentes a cada micro
5. Definir criterios de aceptación
6. Estimar tiempos

### Output
- `orchestration/02-planes/ciclo-X/PLAN-CICLO-X.md`
- `orchestration/02-planes/ciclo-X/PLAN-MICRO-X-Y.md` (hasta 5 niveles)

### Referencias
- `DIRECTIVAS-MICROCICLOS-ANIDADOS.md` (criterios de anidación)
- `GUIA-ORQUESTACION.md` (cuándo usar subagentes)

---

## ⚙️ DF-003: Fase de EJECUCIÓN (50-70% del tiempo)

### Objetivo
Implementar código con validación continua

### Actividades
1. Ejecutar microciclos según plan
2. **Verificar slots** antes de lanzar subagentes
3. Orquestar subagentes con Task tool
4. Esperar completitud
5. Validar contra documentación
6. Ejecutar tests
7. Documentar cambios

### Output
- Código en `/apps/{backend|frontend|database|devops}/`
- Tests
- Logs en `orchestration/04-logs/{perfil}/`
- Validaciones en `orchestration/05-validaciones/`

### Importante
- Modularizar archivos >400L
- Tests obligatorios (coverage ≥60%)
- Validar coherencia de tipos 3 capas

---

## ✅ DF-004: Validación (transversal)

Ver `PROCESO-VALIDACION.md` para detalles completos.

**3 momentos:**
1. Antes de implementar (vs requerimientos)
2. Durante implementación (vs especificaciones)
3. Después de implementar (tests, coherencia 3 capas)

---

## 🔢 DF-005: Orden de Ejecución

**Sistema de prioridades:**
- Prioridad 1 = más alta
- Prioridad 2, 3, etc. = menor prioridad

En REGISTRO-SUBAGENTES.json, el campo `prioridad` define orden de ejecución cuando hay escasez de slots.

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Ver también:**
- DIRECTIVAS-PRINCIPALES.md (DF-001 a DF-005)
- PROCESO-VALIDACION.md
- GUIA-ORQUESTACION.md
