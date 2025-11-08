# Directiva: Validación Obligatoria contra Documentación

**ID:** DV-MASTER
**Versión:** 1.0
**Fecha:** 2025-11-02
**Prioridad:** 🚨 CRÍTICA - Cumplimiento obligatorio
**Aplicable a:** Todos los agentes NEXUS-* y todos los subagentes

---

## 🎯 Objetivo

**EVITAR ALUCINACIONES** y garantizar que toda implementación esté respaldada por documentación existente.

**Principio fundamental:**
> "Nada se implementa sin estar documentado. Nada se documenta sin estar actualizado."

---

## 📍 Path de Documentación

```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/
```

### Estructura de Documentación (4 Carpetas Principales)

| Carpeta | Propósito | Cuándo Consultar | Cuándo Actualizar |
|---------|-----------|------------------|-------------------|
| **01-requerimientos/** | Definición del proyecto (user stories, features, casos de uso) | **ANTES** de análisis y planificación | **Nunca** (solo Product Owner) |
| **02-especificaciones-tecnicas/** | Specs técnicas (API, DB, arquitectura) | **DURANTE** análisis y planificación | **Nunca** (solo Tech Lead) |
| **03-desarrollo/** | Documentación del desarrollo realizado | **DESPUÉS** de implementación (para validar) | **SIEMPRE** después de implementar |
| **04-planificacion/** | Planificación y avance del proyecto | **ANTES** de planificar, **DURANTE** ejecución | **SIEMPRE** al actualizar progreso |

### Carpetas Adicionales

| Carpeta | Propósito | Uso por Agentes |
|---------|-----------|-----------------|
| **00-overview/** | Visión general, onboarding, glosario | Consultar al inicializar agente por primera vez |
| **QUICK-REFERENCE/** | Cheatsheets y guías rápidas | Consultar para referencias rápidas |
| **adr/** | Architecture Decision Records | Consultar antes de decisiones arquitectónicas |
| **standards/** | Estándares de código, git workflow | Consultar antes de implementar |

---

## 🗺️ Sistema de Navegación Modularizada

### ⚠️ REGLA DE ORO: NO Leer Todos los Archivos

La documentación está **modularizada y mapeada**. Cada carpeta tiene un archivo `_MAP.md` que actúa como índice.

### Protocolo de Búsqueda

```bash
# Paso 1: Leer el mapa raíz
cat /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/_MAP.md

# Paso 2: Identificar subcarpeta relevante (ej: 01-requerimientos)
cat /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/01-requerimientos/_MAP.md

# Paso 3: Buscar la definición específica usando el mapa
# El _MAP.md te dirá exactamente qué archivo leer

# Paso 4: Leer SOLO el archivo específico que necesitas
cat /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/01-requerimientos/{archivo-especifico}.md
```

### ✅ Enfoque Correcto

```markdown
1. Usuario pide: "Implementar sistema de badges"
2. Agente lee: docs/_MAP.md
3. Identifica: 01-requerimientos/gamificacion/
4. Lee: docs/01-requerimientos/gamificacion/_MAP.md
5. Encuentra: BADGES-SISTEMA.md
6. Lee SOLO: docs/01-requerimientos/gamificacion/BADGES-SISTEMA.md
7. Valida que badges esté definido
8. Procede con implementación
```

### ❌ Enfoque Incorrecto

```markdown
1. Usuario pide: "Implementar sistema de badges"
2. Agente asume que conoce los requerimientos
3. Implementa sin validar
4. ⚠️ ALUCINACIÓN: Implementa funcionalidad no definida
```

---

## 🔄 Protocolo de Validación: 3 Momentos

### 1️⃣ ANTES: Validación Pre-Implementación

**Fase:** Análisis y Planificación
**Validar contra:**
- `/docs/01-requerimientos/` (¿Está definido el requerimiento?)
- `/docs/02-especificaciones-tecnicas/` (¿Cómo debe implementarse?)
- `/docs/04-planificacion/` (¿Está en el plan actual?)

**Preguntas obligatorias:**
- [ ] ¿Este requerimiento está documentado en `01-requerimientos/`?
- [ ] ¿Las especificaciones técnicas existen en `02-especificaciones-tecnicas/`?
- [ ] ¿Esta tarea está en la planificación actual de `04-planificacion/`?
- [ ] ¿Existen ADRs relevantes en `adr/` que debo considerar?

**Si la respuesta es NO a cualquiera:**
1. **DETENER** la implementación
2. Documentar en `orchestration/01-analisis/` la falta de definición
3. Solicitar al usuario que defina el requerimiento primero
4. **NO asumir** ni **NO inventar** funcionalidad

**Output obligatorio:**
```
orchestration/05-validaciones/documentacion/YYYY-MM-DD-pre-validacion-{feature}.md
```

---

### 2️⃣ DURANTE: Validación Continua

**Fase:** Ejecución
**Validar contra:**
- `/docs/02-especificaciones-tecnicas/` (¿Estoy siguiendo las specs?)
- `/docs/standards/` (¿Estoy siguiendo los estándares?)

**Preguntas obligatorias (cada microciclo):**
- [ ] ¿La implementación actual sigue las especificaciones técnicas?
- [ ] ¿Los nombres de variables/funciones/componentes coinciden con la documentación?
- [ ] ¿Los tipos de datos coinciden con el schema de base de datos?
- [ ] ¿Las APIs coinciden con los endpoints documentados?

**Si encuentro discrepancias:**
1. **DETENER** y documentar la discrepancia
2. Validar si la documentación está desactualizada
3. Si la documentación es correcta → Ajustar implementación
4. Si la documentación está desactualizada → Notificar al usuario

---

### 3️⃣ DESPUÉS: Validación Post-Implementación

**Fase:** Completitud
**Validar contra:**
- `/docs/01-requerimientos/` (¿Cumplí el requerimiento?)
- `/docs/02-especificaciones-tecnicas/` (¿Implementé según specs?)

**Actualizar obligatoriamente:**
- ✅ `/docs/03-desarrollo/` - Documentar lo implementado
- ✅ `/docs/04-planificacion/` - Actualizar progreso/estado

**Preguntas obligatorias:**
- [ ] ¿La implementación cumple con el requerimiento original?
- [ ] ¿Todos los criterios de aceptación están cubiertos?
- [ ] ¿He documentado lo implementado en `03-desarrollo/`?
- [ ] ¿He actualizado el progreso en `04-planificacion/`?
- [ ] ¿He actualizado TODOS los archivos que referencian lo que cambió?

**Output obligatorio:**
```
orchestration/05-validaciones/documentacion/YYYY-MM-DD-post-validacion-{feature}.md
artifacts/reports/validation/YYYY-MM-DD-validacion-completa-{feature}.md
```

---

## 📝 Actualización de Documentación: Política de Sincronización Total

### Principio de Sincronización

> "Si algo cambia, TODO lo que lo referencie debe actualizarse."

### Archivos a Actualizar SIEMPRE

#### 1. Documentación del Proyecto (`/docs/`)

**Después de implementar:**

| Cambio | Actualizar en `/docs/` |
|--------|------------------------|
| Nueva feature | `03-desarrollo/features/{feature}.md` |
| Nuevo endpoint API | `03-desarrollo/api/{modulo}.md` |
| Nuevo componente UI | `03-desarrollo/frontend/{componente}.md` |
| Nueva migración DB | `03-desarrollo/database/migraciones/{fecha}.md` |
| Bug fix | `03-desarrollo/bug-fixes/{bug-id}.md` |
| Refactoring | `03-desarrollo/refactoring/{modulo}.md` |

**Actualizar progreso:**

| Acción | Actualizar en `/docs/04-planificacion/` |
|--------|------------------------------------------|
| Completar tarea | Marcar como completada en sprint actual |
| Bloqueo | Documentar bloqueador |
| Cambio de prioridad | Actualizar prioridades |
| Nueva estimación | Actualizar estimaciones |

#### 2. Documentación de Orquestación (`/orchestration/`)

**SIEMPRE actualizar:**
- `TRAZA-TAREAS-{PERFIL}.md` - Estado de tareas
- `ESTADO-{PERFIL}.json` - Estado estructurado
- `REGISTRO-SUBAGENTES.json` - Estado de subagentes
- `PROXIMA-ACCION.md` - Próxima acción
- `01-analisis/` - Análisis realizados
- `02-planes/` - Planes de implementación
- `03-subagentes/` - Documentación de subagentes ejecutados
- `04-logs/` - Logs de sesión
- `05-validaciones/` - Validaciones realizadas

#### 3. Artefactos (`/artifacts/`)

**Generar reportes:**
- `reports/coverage/` - Reportes de cobertura de tests
- `reports/performance/` - Reportes de performance
- `reports/validation/` - Reportes de validación
- `changelogs/` - Registro de cambios

### Protocolo de Actualización

```bash
# Paso 1: Identificar archivos que referencian lo modificado
# Usar Grep para buscar referencias

# Paso 2: Actualizar CADA referencia encontrada
# NO dejar referencias desactualizadas

# Paso 3: Actualizar _MAP.md si se agregaron/removieron archivos

# Paso 4: Generar changelog entry
# En artifacts/changelogs/YYYY-MM-DD-{cambio}.md

# Paso 5: Validar que no haya referencias rotas
# Verificar todos los links
```

---

## 🚫 Casos de Bloqueo: Qué Hacer Si...

### Caso 1: No Encuentro el Requerimiento

**Situación:** Usuario pide implementar algo que no está en `/docs/01-requerimientos/`

**Acción:**
1. 🛑 **DETENER** implementación
2. Documentar en `orchestration/01-analisis/missing-requirements/YYYY-MM-DD-{feature}.md`
3. Preguntar al usuario:
   > "No encuentro el requerimiento para '{feature}' en `/docs/01-requerimientos/`.
   > ¿Puedes indicarme dónde está documentado o debo proceder sin validación?"
4. **SI** usuario confirma → Documentar en análisis que se procede sin requerimiento formal
5. **SI** usuario proporciona path → Validar y proceder
6. **NO asumir** funcionalidad

### Caso 2: Encuentro Contradicción entre Docs

**Situación:** `/docs/01-requerimientos/` dice A, pero `/docs/02-especificaciones-tecnicas/` dice B

**Acción:**
1. 🛑 **DETENER** implementación
2. Documentar contradicción en `orchestration/05-validaciones/documentacion/YYYY-MM-DD-contradiccion-{tema}.md`
3. Notificar al usuario:
   > "Encontré contradicción entre:
   > - `/docs/01-requerimientos/{archivo}.md` (dice A)
   > - `/docs/02-especificaciones-tecnicas/{archivo}.md` (dice B)
   > ¿Cuál debo seguir?"
4. Esperar clarificación
5. **NO asumir** cuál es correcta

### Caso 3: Documentación Desactualizada

**Situación:** El código actual no coincide con `/docs/03-desarrollo/`

**Acción:**
1. Analizar código actual
2. Analizar documentación actual
3. Identificar discrepancias
4. Generar reporte en `orchestration/05-validaciones/documentacion/YYYY-MM-DD-docs-desactualizadas-{modulo}.md`
5. Proponer al usuario:
   > "La documentación en `/docs/03-desarrollo/{archivo}.md` está desactualizada.
   > ¿Actualizo la documentación basándome en el código actual?"
6. Si usuario aprueba → Actualizar documentación
7. Si usuario rechaza → Entender cuál es la fuente de verdad

### Caso 4: Falta de Claridad en Specs

**Situación:** Las specs en `/docs/02-especificaciones-tecnicas/` son ambiguas o incompletas

**Acción:**
1. Documentar ambigüedad en `orchestration/01-analisis/ambiguities/YYYY-MM-DD-{tema}.md`
2. Listar interpretaciones posibles
3. Preguntar al usuario:
   > "Las especificaciones para '{feature}' en `/docs/02-especificaciones-tecnicas/{archivo}.md` son ambiguas.
   > Posibles interpretaciones:
   > A) ...
   > B) ...
   > ¿Cuál debo seguir?"
4. Esperar clarificación
5. **NO asumir** interpretación

---

## 📊 Validación de Tipos 3 Capas

### Validación Database → Backend

**Validar que:**
- [ ] Tipos TypeScript coinciden con tipos PostgreSQL
- [ ] Nombres de tablas/columnas coinciden
- [ ] Constraints se reflejan en validaciones backend
- [ ] Enums coinciden entre DB y Backend

**Documentar en:**
```
orchestration/05-validaciones/tipos/YYYY-MM-DD-db-backend-{modulo}.md
```

### Validación Backend → Frontend

**Validar que:**
- [ ] Tipos TypeScript del frontend coinciden con DTOs del backend
- [ ] Nombres de propiedades coinciden
- [ ] Tipos de datos coinciden (ej: Date vs string)
- [ ] Contratos de API son consistentes

**Documentar en:**
```
orchestration/05-validaciones/tipos/YYYY-MM-DD-backend-frontend-{feature}.md
```

### Validación End-to-End

**Validar que:**
- [ ] Un flujo completo (DB → Backend → Frontend) es consistente
- [ ] Los tipos se mapean correctamente en todas las capas
- [ ] No hay pérdida de información entre capas

**Documentar en:**
```
orchestration/05-validaciones/integracion/YYYY-MM-DD-e2e-{flujo}.md
```

---

## 🎯 Checklist de Validación por Fase

### Checklist: Análisis

- [ ] Leí `docs/_MAP.md` para orientarme
- [ ] Busqué el requerimiento en `docs/01-requerimientos/` usando `_MAP.md`
- [ ] Encontré el requerimiento documentado
- [ ] Leí las especificaciones técnicas en `docs/02-especificaciones-tecnicas/`
- [ ] Verifiqué ADRs relevantes en `docs/adr/`
- [ ] Verifiqué estándares aplicables en `docs/standards/`
- [ ] Documenté el análisis en `orchestration/01-analisis/`
- [ ] Generé reporte de pre-validación en `orchestration/05-validaciones/documentacion/`

### Checklist: Planificación

- [ ] El plan está alineado con `docs/01-requerimientos/`
- [ ] El plan sigue las specs de `docs/02-especificaciones-tecnicas/`
- [ ] El plan está documentado en `orchestration/02-planes/`
- [ ] Verifiqué que está en `docs/04-planificacion/` como tarea actual
- [ ] Si no está en planificación → Notifiqué al usuario

### Checklist: Ejecución

- [ ] Cada microciclo valido contra `docs/02-especificaciones-tecnicas/`
- [ ] Cada cambio lo documento en traza correspondiente
- [ ] Si encuentro discrepancia → Detengo y notifico
- [ ] Actualizo `REGISTRO-SUBAGENTES.json` en tiempo real
- [ ] Genero logs en `orchestration/04-logs/`

### Checklist: Completitud

- [ ] Validé que cumple con `docs/01-requerimientos/`
- [ ] Validé que sigue `docs/02-especificaciones-tecnicas/`
- [ ] Documenté lo implementado en `docs/03-desarrollo/`
- [ ] Actualicé progreso en `docs/04-planificacion/`
- [ ] Actualicé TODOS los archivos que referencian lo modificado
- [ ] Generé reporte de post-validación
- [ ] Generé changelog en `artifacts/changelogs/`
- [ ] Actualicé `_MAP.md` si agregué/removí archivos

---

## 🔧 Herramientas para Validación

### Buscar Referencias a un Archivo/Módulo

```bash
# Buscar todas las referencias a un módulo
grep -r "nombre-modulo" /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/

# Buscar referencias en documentación de desarrollo
grep -r "nombre-feature" /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/03-desarrollo/
```

### Validar Links Rotos

```bash
# Listar todos los links en archivos markdown
grep -r "\[.*\](.*)" /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/
```

### Verificar Actualización de _MAP.md

```bash
# Verificar que cada carpeta con >3 archivos tenga _MAP.md
find /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/ -type d -exec bash -c 'count=$(ls -1 "$0"/*.md 2>/dev/null | wc -l); if [ $count -gt 3 ] && [ ! -f "$0/_MAP.md" ]; then echo "Falta _MAP.md en: $0"; fi' {} \;
```

---

## 📈 Métricas de Validación

### Métricas a Rastrear

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| **% Validaciones Pre-Implementación** | 100% | Archivos en `orchestration/05-validaciones/documentacion/YYYY-MM-DD-pre-*` |
| **% Validaciones Post-Implementación** | 100% | Archivos en `orchestration/05-validaciones/documentacion/YYYY-MM-DD-post-*` |
| **% Documentación en `03-desarrollo/` actualizada** | 100% | Verificar que cada implementación tenga entrada |
| **% Planificación en `04-planificacion/` actualizada** | 100% | Verificar estado de tareas |
| **Tiempo promedio entre implementación y actualización de docs** | <1 hora | Diferencia de timestamps |

### Reporte de Validación

**Generar al final de cada ciclo:**
```
artifacts/reports/validation/YYYY-MM-DD-ciclo-{N}-validacion-completa.md
```

**Contenido mínimo:**
- Total de validaciones pre-implementación realizadas
- Total de validaciones post-implementación realizadas
- Total de discrepancias encontradas
- Total de documentación actualizada
- % de cumplimiento de la directiva

---

## 🚨 Consecuencias de No Cumplir

### Si NO se valida contra documentación:

❌ **Riesgo de alucinación** - Implementar funcionalidad no definida
❌ **Riesgo de inconsistencia** - Implementar de forma diferente a las specs
❌ **Riesgo de duplicación** - Implementar algo que ya existe
❌ **Riesgo de deuda técnica** - Código que no sigue estándares
❌ **Riesgo de bugs** - Implementación incorrecta

### Si NO se actualiza documentación:

❌ **Documentación desactualizada** - Otros desarrolladores se confunden
❌ **Pérdida de trazabilidad** - No se sabe qué se implementó
❌ **Imposible validar** - No hay fuente de verdad
❌ **Dificulta mantenimiento** - Nadie sabe cómo funciona el código

---

## ✅ Criterio de Éxito

**Una tarea se considera completa SI Y SOLO SI:**

1. ✅ Se validó contra documentación ANTES de implementar
2. ✅ Se validó contra documentación DURANTE implementación
3. ✅ Se validó contra documentación DESPUÉS de implementar
4. ✅ Se documentó lo implementado en `docs/03-desarrollo/`
5. ✅ Se actualizó progreso en `docs/04-planificacion/`
6. ✅ Se actualizaron TODOS los archivos que referencian lo modificado
7. ✅ Se generaron reportes de validación
8. ✅ Tests pasando
9. ✅ Build exitoso

**Si falta alguno → La tarea NO está completa.**

---

**Resumen:** Esta directiva garantiza que ninguna implementación se haga sin estar respaldada por documentación, y que toda documentación se mantenga actualizada. Es la defensa principal contra alucinaciones y la garantía de consistencia del proyecto.

**Próxima revisión:** Post Ciclo 1
**Owner:** @tech-lead @qa-team
