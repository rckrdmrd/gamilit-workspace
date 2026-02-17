# Templates de Subagentes - Sistema NEXUS

**Versión:** 1.0
**Fecha:** 2025-11-02
**Aplicable a:** Todos los agentes NEXUS-*

---

## 📋 Índice de Templates

0. **T-CLAUDE-TASK-TOOL** - Delegación estructurada para Claude Task tool
1. **T-README-SUBAGENTE** - README de subagente
2. **T-TRAZA-SUBAGENTE** - Traza de ejecución
3. **T-OUTPUT-SUBAGENTE** - Output final
4. **T-ANALISIS-FEATURE** - Análisis de feature
5. **T-PLAN-IMPLEMENTACION** - Plan de implementación
6. **T-EJECUCION-BACKEND** - Ejecución backend
7. **T-EJECUCION-FRONTEND** - Ejecución frontend
8. **T-EJECUCION-DATABASE** - Ejecución database
9. **T-VALIDACION** - Validación e integración

---

## 🤖 T-CLAUDE-TASK-TOOL

Referencia operativa:
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-CLAUDE-TASK-TOOL.md`
- `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md` (sección 8.5)

---

## 📄 T-README-SUBAGENTE

```markdown
# Subagente: SA-{PERFIL}-{NUM} - {Nombre Descriptivo}

**Fecha:** YYYY-MM-DD
**Microciclo:** Micro X-Y-Z
**Modelo:** sonnet/haiku/opus
**Duración estimada:** XX minutos
**Agente padre:** NEXUS-{PERFIL}

---

## Objetivo
{Descripción específica de qué debe lograr este subagente}

## Inputs
- {Archivo/dato 1}
- {Archivo/dato 2}

## Outputs Esperados
- {Archivo/resultado 1}
- {Archivo/resultado 2}

## Criterios de Éxito
- [ ] Criterio 1
- [ ] Criterio 2

## Estado
✅ COMPLETADO / ⏳ EN PROGRESO / ❌ FALLIDO
```

---

## 📝 T-TRAZA-SUBAGENTE

```markdown
# Traza de Ejecución: SA-{PERFIL}-{NUM}

**Inicio:** YYYY-MM-DD HH:MM UTC
**Fin:** YYYY-MM-DD HH:MM UTC
**Duración:** XX minutos

---

## Fase 1: {Nombre}
{Qué hizo, comandos ejecutados, archivos leídos}

## Fase 2: {Nombre}
{Continuación de la ejecución}

---

## Hallazgos
- Hallazgo 1
- Hallazgo 2

## Decisiones Tomadas
1. **Decisión:** ...
   **Razón:** ...

## Problemas Encontrados
{Si hubo problemas, describirlos}

## Output Final
Ver: [artifacts/](./artifacts/)
```

---

## 📦 T-OUTPUT-SUBAGENTE

```markdown
# Output Final: SA-{PERFIL}-{NUM}

**Fecha:** YYYY-MM-DD
**Microciclo:** Micro X-Y-Z

---

## Resumen Ejecutivo
{1-2 párrafos describiendo qué se logró}

## Archivos Generados
- `{path/archivo1}` - {Descripción}
- `{path/archivo2}` - {Descripción}

## Métricas
- Archivos creados: X
- Líneas de código: Y
- Tests creados: Z
- Coverage: W%

## Hallazgos Clave
1. {Hallazgo importante 1}
2. {Hallazgo importante 2}

## Referencias
- Análisis origen: [link](...)
- Plan: [link](...)
```

---

## 🔍 T-ANALISIS-FEATURE

```markdown
# Análisis: {Feature Name}

**ID:** ANALISIS-{ID}
**Fecha:** YYYY-MM-DD
**Agente:** NEXUS-{PERFIL}
**Requisito origen:** /docs/01-requerimientos/casos-uso/UC-*.md

---

## Resumen Ejecutivo
{1-2 párrafos describiendo la feature}

## Requerimientos

### Funcionales (RF)
- RF-001: {Descripción}
- RF-002: {Descripción}

### No Funcionales (RNF)
- RNF-001: {Descripción}

---

## Análisis Técnico

### Capas Afectadas
- [ ] Backend - {Módulos/servicios afectados}
- [ ] Frontend - {Componentes afectados}
- [ ] Database - {Tablas/schemas afectados}

### Archivos Existentes a Modificar
- `{path/archivo1}` - {Cambio necesario}
- `{path/archivo2}` - {Cambio necesario}

### Archivos Nuevos a Crear
- `{path/archivo1}` - {Propósito}
- `{path/archivo2}` - {Propósito}

---

## Dependencias
- Depende de: {Features/componentes previos}
- Bloquea a: {Features/componentes futuros}

## Estimación
- Complejidad: Baja / Media / Alta
- Tiempo estimado: X horas
- Riesgo: Bajo / Medio / Alto

---

## Próximos Pasos
1. Crear plan de implementación
2. Descomponer en microciclos
3. Implementar
```

---

## 📋 T-PLAN-IMPLEMENTACION

```markdown
# Plan de Implementación: {Feature/Bug Name}

**ID:** PLAN-CICLO-{N}
**Fecha:** YYYY-MM-DD
**Análisis origen:** [ANALISIS-{ID}](../01-analisis/...)

---

## Resumen Ejecutivo
{Descripción breve de la estrategia de implementación}

## Descomposición en Microciclos

### Micro {N}-1: {Nombre}
**Duración:** XX min
**Objetivo:** {Qué se logra}
**Subagentes:** X
**Output:** {Qué produce}

### Micro {N}-2: {Nombre}
**Duración:** XX min
**Objetivo:** {Qué se logra}
**Subagentes:** X
**Output:** {Qué produce}

---

## Orden de Ejecución
1. Micro {N}-1 (prerequisito: ninguno)
2. Micro {N}-2 (prerequisito: {N}-1)
3. ...

## Validación de Slots
- Subagentes totales: X
- Slots necesarios por micro: máximo Y
- Estrategia: {Secuencial / Paralelo}

---

## Criterios de Completitud
- [ ] Todos los microciclos completados
- [ ] Tests pasando (coverage ≥60%)
- [ ] Validación contra documentación OK
- [ ] Build exitoso
```

---

## ⚙️ T-EJECUCION-BACKEND

**Prompt para subagente de backend:**

```
Tarea: Implementar {descripción breve}

Contexto:
- Módulo: /apps/backend/src/{modulo}/
- Requisito origen: /docs/01-requerimientos/casos-uso/UC-*.md
- Tipos compartidos: /docs/02-especificaciones-tecnicas/tipos-compartidos/

Implementar:
1. {Componente 1 - ej: UserService.create()}
2. {Componente 2 - ej: CreateUserDTO}
3. Tests unitarios

Criterios de aceptación:
- Código TypeScript limpio (ESLint sin errores)
- Tests unitarios con coverage ≥80% del código nuevo
- Comentarios JSDoc en funciones públicas
- Validación de inputs con class-validator
- Manejo de errores apropiado

Directivas aplicables:
- DC-001: Estándares de código
- DC-002: Tests obligatorios
- DE-003: Archivos <400L

Output esperado:
- Código en /apps/backend/src/{modulo}/
- Tests en /apps/backend/test/unit/
- Documentar en OUTPUT.md
```

---

## 🎨 T-EJECUCION-FRONTEND

**Prompt para subagente de frontend:**

```
Tarea: Implementar componente {NombreComponente}

Contexto:
- Ubicación: /apps/frontend/src/features/{feature}/
- API backend: /docs/02-especificaciones-tecnicas/apis/
- Diseño: {referencia a diseño si existe}

Implementar:
1. Componente React {NombreComponente}
2. Hook personalizado {useNombre} (si aplica)
3. Tests con React Testing Library

Criterios de aceptación:
- Componente funcional con TypeScript
- Props bien tipadas
- Responsive design
- Tests con coverage ≥80%
- Accesibilidad (a11y) básica

Directivas aplicables:
- DC-001: Estándares de código
- DC-002: Tests obligatorios

Output esperado:
- {NombreComponente}.tsx
- {NombreComponente}.test.tsx
- {useNombre}.ts (si aplica)
```

---

## 🗄️ T-EJECUCION-DATABASE

**Prompt para subagente de database:**

```
Tarea: Crear migration para {descripción}

Contexto:
- Esquema: {nombre_esquema}
- Tablas afectadas: {lista}
- Tipos backend: /apps/backend/src/{modulo}/types/

Implementar:
1. Migration SQL versionada
2. Rollback migration
3. Seed de datos de prueba

Criterios de aceptación:
- SQL válido (PostgreSQL)
- Foreign keys con ON DELETE CASCADE apropiado
- Índices en columnas de búsqueda frecuente
- RLS habilitado en tablas sensibles
- Comentarios SQL en tablas y columnas

Directivas aplicables:
- DC-001: Estándares SQL
- DS-002: RLS en tablas sensibles

Output esperado:
- Migration: /apps/database/migrations/{timestamp}-{nombre}.sql
- Rollback: /apps/database/migrations/{timestamp}-{nombre}-rollback.sql
- Seed: /apps/database/seeds/dev/{nombre}.sql
```

---

## ✅ T-VALIDACION

**Prompt para NEXUS-INTEGRATION:**

```
Tarea: Validar implementación de {Feature/Bug}

Contexto:
- Análisis origen: orchestration/01-analisis/features/{nombre}.md
- Código backend: /apps/backend/src/{modulo}/
- Código frontend: /apps/frontend/src/{feature}/
- Schema SQL: /apps/database/ddl/schemas/{esquema}/

Validar:
1. **Coherencia 3 capas:**
   - Tipos SQL ↔ DTOs TypeScript
   - DTOs backend ↔ Interfaces frontend

2. **vs Documentación:**
   - vs /docs/01-requerimientos/ (todos los requisitos implementados?)
   - vs /docs/02-especificaciones-tecnicas/ (API coincide con spec?)

3. **Calidad:**
   - Tests pasando
   - Coverage ≥60%
   - Build exitoso
   - Lint sin errores

Criterios de aceptación:
- 0 discrepancias de tipos entre capas
- 100% de requisitos implementados
- Tests E2E cubriendo flujo completo

Output esperado:
- Reporte en orchestration/05-validaciones/integracion/
- Estado: ✅ Aprobado / ⚠️ Con observaciones / ❌ Rechazado
```

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Versión:** 1.0
