# ANÁLISIS PRE-EJECUCIÓN: {TAREA-ID} - {Nombre de la Tarea}

**Agente:** {Database-Agent | Backend-Agent | Frontend-Agent | etc}
**Tipo de tarea:** {Requerimiento | Bug | Feature | Corrección | Validación}
**Prioridad:** {P0 | P1 | P2 | P3}
**Fecha análisis:** {YYYY-MM-DD}
**Relacionado con:** [{REQ-XXX}], [{DB-XXX}], [{BE-XXX}]

---

## 📋 CONTEXTO DE LA TAREA

### Solicitud Original
{Descripción de lo que se solicita}

### Objetivo Final
{¿Qué se debe lograr al completar esta tarea?}

### Módulo Relacionado
**Módulo MVP:** {nombre del módulo según MVP-APP.md}
**Sección en MVP-APP.md:** {número de sección y página}

### Justificación
{¿Por qué es necesario? ¿Qué problema resuelve? ¿Qué valor aporta?}

---

## 🔍 INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [ ] MASTER_INVENTORY.yml
- [ ] DATABASE_INVENTORY.yml (si aplica)
- [ ] BACKEND_INVENTORY.yml (si aplica)
- [ ] FRONTEND_INVENTORY.yml (si aplica)
- [ ] DEPENDENCY_GRAPH.yml

**Comandos ejecutados:**
```bash
# Búsqueda de duplicados
grep -rn "{objeto}" orchestration/inventarios/
find apps/ -name "*{objeto}*"

# Resultado:
# ✅ No existe | ❌ Ya existe en {ubicación}
```

### Objetos Existentes Relacionados

**Base de Datos:**
- Schema: {nombre} → {existe | no existe}
- Tabla: {nombre} → {existe | no existe}
- Función: {nombre} → {existe | no existe}

**Backend:**
- Módulo: {nombre} → {existe | no existe}
- Entity: {nombre} → {existe | no existe}
- Service: {nombre} → {existe | no existe}

**Frontend:**
- Página: {nombre} → {existe | no existe}
- Componente: {nombre} → {existe | no existe}
- Store: {nombre} → {existe | no existe}

### Objetos a Crear/Modificar

**Nuevos objetos:**
- [ ] Schema: {nombre} (crear)
- [ ] Tabla: {nombre} (crear)
- [ ] Entity: {nombre} (crear)
- [ ] Página: {nombre} (crear)

**Objetos a modificar:**
- [ ] Tabla: {nombre} (agregar columnas X, Y)
- [ ] Service: {nombre} (agregar método Z)

---

## ⚠️ ANÁLISIS DE RIESGOS

### Riesgo de Duplicación

**Verificación:**
- [ ] NO existe schema similar
- [ ] NO existe tabla similar
- [ ] NO existe módulo/entity similar
- [ ] NO existe componente similar

**Objetos similares encontrados:**
{Si existen, listar aquí con decisión de qué hacer}

**Decisión:**
- [ ] Crear nuevo objeto (no hay similar)
- [ ] Modificar objeto existente: {nombre}
- [ ] Reutilizar objeto existente: {nombre}

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| {Riesgo 1} | Alta/Media/Baja | Alto/Medio/Bajo | {Estrategia de mitigación} |
| {Riesgo 2} | Alta/Media/Baja | Alto/Medio/Bajo | {Estrategia de mitigación} |

---

## 🔗 ANÁLISIS DE IMPACTO

### Archivos Afectados

**A crear:**
- apps/database/ddl/schemas/{schema}/{tipo}/{archivo}.sql
- apps/backend/src/modules/{modulo}/{tipo}/{archivo}.ts
- apps/frontend/web/src/apps/{rol}/pages/{Archivo}.tsx

**A modificar:**
- {lista de archivos existentes que se modificarán}

**Total archivos:**
- Crear: {N}
- Modificar: {M}

### Dependencias

**Esta tarea depende de:**
- [{TAREA-XXX}]: {descripción} → Estado: {Completado | Pendiente | En Progreso}
- [{TAREA-YYY}]: {descripción} → Estado: {Completado | Pendiente | En Progreso}

**Bloqueadores actuales:**
- {Ninguno | Lista de bloqueadores}

**Esta tarea bloquea:**
- [{TAREA-ZZZ}]: {descripción}

### Módulos Afectados

**Impacto directo:**
- Módulo: {nombre}
- Stack: {Database | Backend | Frontend | Todos}

**Impacto indirecto:**
- Módulos que consumen: {lista}
- Módulos relacionados: {lista}

---

## 🎯 DECISIÓN DE APPROACH

### Approach Seleccionado
{Descripción del enfoque elegido para resolver la tarea}

**Razones:**
1. {Razón 1}
2. {Razón 2}

### Alternativas Consideradas

**Alternativa 1:** {descripción}
- **Pros:** {lista}
- **Contras:** {lista}
- **Razón de descarte:** {descripción}

**Alternativa 2:** {descripción}
- **Pros:** {lista}
- **Contras:** {lista}
- **Razón de descarte:** {descripción}

---

## 🔄 NECESIDAD DE SUBAGENTES

### Análisis de Complejidad

**Criterios:**
- Número de pasos: {N} → {Simple (<3) | Media (3-5) | Compleja (>5)}
- Módulos afectados: {M} → {Simple (1) | Media (2-3) | Compleja (>3)}
- Archivos a crear: {F} → {Simple (<5) | Media (5-10) | Compleja (>10)}
- Coordinación entre capas: {Sí | No}

**Decisión:**
- [ ] **NO usar subagentes** - Tarea simple, ejecutar directamente
- [ ] **SÍ usar subagentes** - Tarea compleja, usar {N} subagentes

### Plan de Subagentes (si aplica)

**Subagente 1: {nombre-subagente}**
- **Tarea:** {descripción específica}
- **Duración estimada:** {tiempo}
- **Artefactos:** {lista de archivos que generará}

**Subagente 2: {nombre-subagente}**
- **Tarea:** {descripción específica}
- **Duración estimada:** {tiempo}
- **Artefactos:** {lista de archivos que generará}

---

## 📊 ESTIMACIÓN PRELIMINAR

### Tiempo Estimado por Fase

| Fase | Duración Estimada | Notas |
|------|-------------------|-------|
| Análisis | {tiempo} | Este documento |
| Planificación | {tiempo} | Crear plan detallado |
| Ejecución | {tiempo} | Desarrollo + tests |
| Validación | {tiempo} | Compilación + tests + E2E |
| Documentación | {tiempo} | Inventarios + trazas + README |
| **TOTAL** | **{tiempo}** | |

### Recursos Necesarios

**Agentes:**
- Agente principal: {nombre}
- Subagentes: {lista | ninguno}

**Herramientas:**
- {Lista de herramientas necesarias}

**Información adicional requerida:**
- {Lista | Ninguna}

---

## 📚 REFERENCIAS CONSULTADAS

### Documentación del Proyecto
- [ ] MVP-APP.md (Sección {N})
- [ ] docs/01-requerimientos/{archivo}.md
- [ ] docs/02-arquitectura/{archivo}.md
- [ ] docs/97-adr/ADR-{XXX}.md

### Código Existente
**Archivos de referencia (templates):**
- {ruta/archivo} - Usado como template para {propósito}
- {ruta/archivo} - Referencia de patrón similar

### Inventarios y Trazas
- [ ] MASTER_INVENTORY.yml
- [ ] TRAZA-REQUERIMIENTOS.md
- [ ] TRAZA-TAREAS-{GRUPO}.md

---

## ✅ CONCLUSIÓN DEL ANÁLISIS

### Resumen
{Párrafo resumiendo el análisis completo}

### Decisiones Clave
1. **Approach:** {decisión}
2. **Subagentes:** {usar | no usar}
3. **Objetos a crear:** {cantidad y tipo}
4. **Duración estimada:** {tiempo}

### Recomendaciones
1. {Recomendación 1}
2. {Recomendación 2}

### Aprobación para Proceder
- [ ] Análisis completo y documentado
- [ ] Sin bloqueadores identificados
- [ ] Recursos disponibles
- [ ] Estimaciones validadas
- [ ] **APROBADO PARA PLANIFICACIÓN**

---

## 🚀 PRÓXIMO PASO

**Acción:** Crear documento de planificación (02-PLAN.md)

**Template:** [TEMPLATE-PLAN.md](./TEMPLATE-PLAN.md)

---

**Analizado por:** {nombre-agente}
**Fecha:** {YYYY-MM-DD HH:MM}
**Versión:** 1.0
**Estado:** {Borrador | Revisión | Aprobado}
