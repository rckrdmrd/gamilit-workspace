# ANÁLISIS DE MEJORA CONTINUA
# TASK-2026-01-20-ANALISIS-PORTALES-INTEGRAL

**Propósito:** Identificar oportunidades de mejora en directivas, estándares, definición de prompts y tareas estándar basadas en la ejecución de esta tarea.

---

## 1. ANÁLISIS DE DIRECTIVAS SIMCO

### 1.1 Directivas que Funcionaron Bien

| Directiva | Aplicación | Efectividad |
|-----------|------------|-------------|
| **CAPVED** | Estructura de fases clara | ✅ Alta - Organizó el trabajo |
| **Regla 7 (Gobernanza)** | Carpetas de tarea | ✅ Alta - Trazabilidad clara |
| **Regla 8 (Coherencia)** | Validación inventarios | ✅ Alta - Detectó gaps |
| **Paralelización** | Subagentes simultáneos | ✅ Alta - Redujo tiempo |

### 1.2 Directivas que Requieren Mejora

| Directiva | Problema Identificado | Propuesta de Mejora |
|-----------|----------------------|---------------------|
| **Ubicación de Tareas** | Confusión workspace vs submodule | Clarificar que tareas de proyecto van en el proyecto |
| **Trazas de Agente** | No se ejecutaban automáticamente | Agregar trigger post-tarea obligatorio |
| **Inventarios** | Changelog no obligatorio | Agregar sección changelog obligatoria |
| **Perfiles Combinados** | No hay guía de cuándo combinar | Documentar combinaciones comunes |

### 1.3 Propuestas de Nuevas Directivas

#### PROPUESTA 1: TRIGGER-VERIFICACION-PREEXISTENCIA

```yaml
nombre: TRIGGER-VERIFICACION-PREEXISTENCIA
descripcion: >
  Antes de crear cualquier documento, verificar si ya existe
  una versión del mismo en el codebase.

cuando_aplica:
  - Creación de User Stories
  - Creación de especificaciones
  - Creación de estándares

acciones:
  1. Buscar con Glob archivos similares
  2. Leer archivos encontrados
  3. Si existe y está completo: Reportar y no duplicar
  4. Si existe pero incompleto: Actualizar en lugar de crear

razon: >
  En esta tarea, US-AE-012 a US-AE-018 ya existían pero el análisis
  inicial indicaba que faltaban. Se perdió tiempo verificando.
```

#### PROPUESTA 2: DIRECTIVA-CONTEXTO-SUBAGENTE

```yaml
nombre: DIRECTIVA-CONTEXTO-SUBAGENTE
descripcion: >
  Estructura obligatoria para prompts de subagentes.

secciones_obligatorias:
  - PERFIL: Perfil(es) a usar
  - CONTEXTO: Descripción del problema
  - REFERENCIAS: Archivos específicos con rutas completas
  - INSTRUCCIONES: Pasos numerados
  - VALIDACION: Comandos a ejecutar
  - ENTREGABLE: Descripción del output

secciones_opcionales:
  - ANALISIS_PREVIO: Información de análisis anterior
  - OPCIONES: Alternativas de solución
  - PATRON_CORRECTO: Ejemplo del resultado esperado

razon: >
  Los prompts bien estructurados tuvieron 100% de éxito.
  Los prompts vagos causaron iteraciones adicionales.
```

#### PROPUESTA 3: TRIGGER-APICONFIG-VALIDATION

```yaml
nombre: TRIGGER-APICONFIG-VALIDATION
descripcion: >
  Cuando se modifique cualquier endpoint en backend,
  verificar que api.config.ts tenga la ruta correcta.

cuando_aplica:
  - Nuevo endpoint en backend
  - Cambio de ruta de endpoint
  - Fix de coherencia API

acciones:
  1. Identificar ruta del endpoint en backend
  2. Buscar referencia en api.config.ts
  3. Verificar que coincidan
  4. Si no coinciden: Corregir api.config.ts

razon: >
  GAP-SP-001 fue causado por desalineación entre backend
  y api.config.ts. Este trigger lo prevendría.
```

---

## 2. ANÁLISIS DE ESTÁNDARES

### 2.1 Estándares Aplicados Correctamente

| Estándar | Uso | Observación |
|----------|-----|-------------|
| Nomenclatura archivos | `TASK-YYYY-MM-DD-*` | Consistente |
| Estructura METADATA.yml | Campos estándar | Variaciones menores |
| Commits semánticos | `fix()`, `docs()` | 100% adherencia |

### 2.2 Estándares que Necesitan Documentación

| Área | Problema | Propuesta |
|------|----------|-----------|
| **Response Wrapping** | No había estándar claro | Crear `ESTANDAR-API-RESPONSE-FORMAT.md` |
| **Combinación de Perfiles** | Ad-hoc | Crear guía de combinaciones |
| **Estructura de Tests** | Dispersa | Documentar en plan de testing |

### 2.3 Propuesta: ESTANDAR-API-RESPONSE-FORMAT.md

```markdown
# Estándar de Formato de Respuestas API

## 1. Backend Response Format

El `TransformResponseInterceptor` envuelve TODAS las respuestas:

{
  "success": true,
  "data": <respuesta del controller>,
  "timestamp": "ISO-8601",
  "path": "/api/v1/..."
}

## 2. Frontend Unwrap Automático

El `apiClient` interceptor (apiClient.ts:99-108) hace unwrap:

// Después del interceptor:
response.data = <respuesta del controller>

## 3. Reglas

1. Backend controllers retornan datos DIRECTAMENTE (sin wrapper manual)
2. Frontend usa response.data (no response.data.data)
3. NUNCA hacer doble unwrap
4. Mappers solo para transformación snake_case → camelCase

## 4. Anti-patrones

// INCORRECTO:
return { data: result }; // Backend - wrapper manual innecesario

// INCORRECTO:
return response.data.data; // Frontend - doble unwrap

// CORRECTO:
return result; // Backend
return response.data; // Frontend
```

---

## 3. ANÁLISIS DE PROMPTS

### 3.1 Patrones de Prompts Exitosos

#### Patrón 1: Contexto Completo con Referencias

```markdown
### REFERENCIAS A CONSULTAR
1. `apps/frontend/src/config/api.config.ts` - Configuración de endpoints
2. `apps/backend/src/modules/gamification/controllers/ranks.controller.ts` - Controller actual
3. `orchestration/tareas/TASK-XXX/SUBTASKS.yml` - Análisis previo
```

**Por qué funciona:** El agente tiene rutas exactas, no pierde tiempo buscando.

#### Patrón 2: Opciones Predefinidas

```markdown
### PLANEACIÓN
opcion_a:
  descripcion: "Agregar endpoint en backend"
  pros: ["Frontend no cambia"]
  contras: ["Nuevo endpoint"]
opcion_b:
  descripcion: "Modificar frontend"
  pros: ["No cambia backend"]
  contras: ["Múltiples archivos"]

### DECISIÓN RECOMENDADA
**Opción A** - [razón]
```

**Por qué funciona:** Acelera la decisión, evita análisis redundante.

#### Patrón 3: Ejemplo de Resultado Esperado

```markdown
### PATRÓN CORRECTO
// Frontend debe hacer:
const response = await apiClient.get<Achievement[]>('/achievements');
return response.data;

// NO hacer:
return response.data.data;
```

**Por qué funciona:** Elimina ambigüedad sobre el output esperado.

### 3.2 Anti-patrones de Prompts

#### Anti-patrón 1: Instrucciones Vagas

```markdown
// MALO:
### INSTRUCCIONES
Arregla el problema de la API.

// BUENO:
### INSTRUCCIONES
1. Leer archivo X
2. Identificar línea con problema
3. Cambiar valor A por B
4. Ejecutar validación
```

#### Anti-patrón 2: Sin Validación

```markdown
// MALO:
### ENTREGABLE
Código corregido.

// BUENO:
### VALIDACIÓN OBLIGATORIA
cd apps/backend && npm run build
cd apps/backend && npm run lint

### ENTREGABLE
- Código corregido
- Confirmación de build exitoso
- Hash de commit
```

### 3.3 Template de Prompt Optimizado

```markdown
## TAREA: [Título descriptivo en imperativo]

### PERFIL
Actúa como [perfil principal] + [perfil secundario si aplica]

### CONTEXTO
**Problema:** [Descripción clara del problema]
**Severidad:** [CRÍTICO/ALTO/MEDIO/BAJO]
**Impacto:** [Componentes/páginas afectadas]

### ANÁLISIS PREVIO
[Información relevante de análisis anteriores, si existe]

### REFERENCIAS A CONSULTAR
1. `[ruta/completa/archivo1.ts]` - [propósito]
2. `[ruta/completa/archivo2.ts]` - [propósito]
3. `[ruta/completa/archivo3.ts]` - [propósito]

### OPCIONES DE SOLUCIÓN (si aplica)
**Opción A:** [descripción]
- Pros: [lista]
- Contras: [lista]

**Opción B:** [descripción]
- Pros: [lista]
- Contras: [lista]

**Decisión Recomendada:** Opción [X] porque [razón]

### INSTRUCCIONES DETALLADAS
1. **[Acción 1]:**
   - Detalle específico
   - Qué buscar/verificar

2. **[Acción 2]:**
   - Detalle específico
   - Cambio a realizar

3. **[Acción 3]:**
   - Validación

### PATRÓN CORRECTO (ejemplo de código si aplica)
// Código esperado después del fix
[ejemplo]

// Anti-patrón a evitar
[ejemplo de qué NO hacer]

### VALIDACIÓN OBLIGATORIA
[comando 1]
[comando 2]

### ENTREGABLE
- [Item 1]
- [Item 2]
- [Confirmaciones requeridas]
```

---

## 4. ANÁLISIS DE TAREAS ESTÁNDAR

### 4.1 Tipo de Tarea: Análisis de Portal

Esta tarea establece un patrón para "Análisis Integral de Portal":

```yaml
tipo: ANALISIS-PORTAL
fases:
  1_contexto:
    - Cargar inventarios (FRONTEND, BACKEND)
    - Identificar páginas del portal
    - Mapear componentes y hooks

  2_analisis:
    - Verificar coherencia FE-BE
    - Identificar GAPs
    - Clasificar por severidad

  3_planeacion:
    - Crear SUBTASKS.yml con CAPVED
    - Definir dependencias
    - Asignar perfiles

  4_ejecucion:
    - Tareas de código (GAP fixes)
    - Tareas de documentación
    - Paralelizar donde sea posible

  5_validacion:
    - Build + lint
    - Validación SIMCO
    - Actualizar inventarios

  6_documentacion:
    - Informe completo
    - Trazas de agente
    - Actualizar _INDEX

entregables_estandar:
  - METADATA.yml
  - SUBTASKS.yml
  - HALLAZGOS-CONSOLIDADOS.md
  - RESUMEN-EJECUTIVO.md
  - Documentación de GAPs resueltos
```

### 4.2 Checklist de Tarea Análisis-Portal

```markdown
## Pre-Ejecución
- [ ] Cargar FRONTEND_INVENTORY.yml
- [ ] Cargar BACKEND_INVENTORY.yml
- [ ] Identificar páginas del portal
- [ ] Crear carpeta de tarea

## Análisis
- [ ] Mapear componentes por página
- [ ] Mapear hooks utilizados
- [ ] Mapear APIs consumidas
- [ ] Verificar endpoints en backend
- [ ] Identificar GAPs de coherencia

## Planeación
- [ ] Crear SUBTASKS.yml
- [ ] Clasificar GAPs por severidad
- [ ] Definir dependencias entre subtareas
- [ ] Asignar perfiles a cada subtarea

## Ejecución - Código
- [ ] Ejecutar GAPs críticos primero
- [ ] Build después de cada fix
- [ ] Lint después de cada fix
- [ ] Commit con mensaje semántico

## Ejecución - Documentación
- [ ] Crear documentos requeridos
- [ ] Actualizar _MAP.md relevantes
- [ ] Actualizar README si aplica

## Validación
- [ ] Build completo (backend + frontend)
- [ ] Lint sin errores
- [ ] Validar estructura SIMCO
- [ ] Verificar inventarios actualizados
- [ ] Verificar trazas de agente

## Cierre
- [ ] Actualizar _INDEX.yml de tareas
- [ ] Crear informe completo
- [ ] Commit final
- [ ] Push a remoto
```

---

## 5. MÉTRICAS Y KPIs

### 5.1 Métricas de Esta Tarea

| Métrica | Valor | Benchmark |
|---------|-------|-----------|
| Subagentes lanzados | 25+ | - |
| Tasa de éxito subagentes | 100% | >90% |
| GAPs resueltos | 3 código + 5 doc | - |
| Tiempo total | ~6h | - |
| Archivos creados | 15+ | - |
| Líneas documentación | 5,000+ | - |
| Commits | 12 | - |

### 5.2 KPIs Propuestos para Tareas Futuras

| KPI | Descripción | Meta |
|-----|-------------|------|
| **Tasa Éxito Subagente** | % de subagentes que completan sin retry | >95% |
| **Cobertura SIMCO** | % de reglas SIMCO cumplidas | 100% |
| **Tiempo por GAP** | Tiempo promedio para resolver un GAP | <30min |
| **Duplicación Evitada** | % de documentos verificados antes de crear | 100% |
| **Validaciones Pasadas** | % de builds/lints exitosos al primer intento | >90% |

---

## 6. RECOMENDACIONES FINALES

### 6.1 Corto Plazo (Próxima Tarea)

1. **Usar template de prompt optimizado** (Sección 3.3)
2. **Verificar existencia antes de crear** documentos
3. **Incluir validación obligatoria** en todos los prompts de código
4. **Actualizar trazas de agente** inmediatamente después de completar

### 6.2 Mediano Plazo (Próximo Sprint)

1. **Crear ESTANDAR-API-RESPONSE-FORMAT.md**
2. **Documentar combinaciones de perfiles** comunes
3. **Agregar TRIGGER-VERIFICACION-PREEXISTENCIA** a directivas
4. **Crear checklist automatizado** para validación SIMCO

### 6.3 Largo Plazo (Próximo Trimestre)

1. **Automatizar actualización de inventarios** post-commit
2. **Crear dashboard de métricas** de tareas
3. **Implementar validación SIMCO** como pre-commit hook
4. **Documentar biblioteca de prompts** reutilizables

---

## 7. ARCHIVOS RELACIONADOS

| Archivo | Propósito |
|---------|-----------|
| `INFORME-TAREA-COMPLETO.md` | Informe principal de la tarea |
| `CONTEXTO-SUBAGENTES.md` | Prompts enviados a subagentes |
| `PLANTILLA-TAREA-ANALISIS-PORTAL.md` | Template reutilizable |
| `orchestration/directivas/triggers/` | Directorio de triggers |
| `docs/40-estandares/` | Directorio de estándares |

---

**Generado:** 2026-01-20
**Propósito:** Mejora continua del sistema SIMCO y procesos de desarrollo
**Próxima Revisión:** 2026-02-20
