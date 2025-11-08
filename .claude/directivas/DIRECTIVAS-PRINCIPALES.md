# Directivas para Agentes NEXUS - Desarrollo GAMILIT

**Versión:** 1.0
**Fecha:** 2025-11-02
**Aplicable a:** Todos los agentes NEXUS-* y sus subagentes
**Prioridad:** CRÍTICA - Cumplimiento obligatorio

---

## 🚨 DIRECTIVA CRÍTICA: Validación Obligatoria contra Documentación

**⚠️ LEER PRIMERO:** [DIRECTIVA-VALIDACION-DOCUMENTACION.md](./DIRECTIVA-VALIDACION-DOCUMENTACION.md)

### Regla de Oro

> "Nada se implementa sin estar documentado. Nada se documenta sin estar actualizado."

### Principios Fundamentales

1. **EVITAR ALUCINACIONES**: Toda implementación debe estar respaldada por documentación en `/docs/`
2. **NAVEGACIÓN MODULARIZADA**: Usar `_MAP.md` para encontrar definiciones, NO leer todos los archivos
3. **VALIDACIÓN TRIPLE**: ANTES (análisis) + DURANTE (ejecución) + DESPUÉS (completitud)
4. **ACTUALIZACIÓN TOTAL**: Si algo cambia, actualizar TODO lo que lo referencie
5. **DOCUMENTAR DESARROLLO**: Todo lo implementado se documenta en `/docs/03-desarrollo/`
6. **ACTUALIZAR PLANIFICACIÓN**: Todo progreso se refleja en `/docs/04-planificacion/`

### Rutas de Documentación

```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/
├── 01-requerimientos/        # Validar ANTES de implementar
├── 02-especificaciones-tecnicas/  # Validar DURANTE implementación
├── 03-desarrollo/            # Actualizar DESPUÉS de implementar
└── 04-planificacion/         # Actualizar SIEMPRE con progreso
```

**Ver detalles completos:** [DIRECTIVA-VALIDACION-DOCUMENTACION.md](./DIRECTIVA-VALIDACION-DOCUMENTACION.md)

---

## 🔀 Perfiles de Agentes NEXUS

Los agentes NEXUS operan en modo especializado según el perfil:

### NEXUS-BACKEND
**Track:** Desarrollo Backend (NestJS/TypeScript)
**Archivo de traza:** `orchestration/TRAZA-TAREAS-BACKEND.md`
**Archivo de estado:** `orchestration/ESTADO-BACKEND.json`

### NEXUS-FRONTEND
**Track:** Desarrollo Frontend (React/TypeScript)
**Archivo de traza:** `orchestration/TRAZA-TAREAS-FRONTEND.md`
**Archivo de estado:** `orchestration/ESTADO-FRONTEND.json`

### NEXUS-DATABASE
**Track:** Desarrollo Database (PostgreSQL)
**Archivo de traza:** `orchestration/TRAZA-TAREAS-DATABASE.md`
**Archivo de estado:** `orchestration/ESTADO-DATABASE.json`

### NEXUS-DEVOPS
**Track:** DevOps (Docker, CI/CD)
**Archivo de traza:** `orchestration/TRAZA-TAREAS-DEVOPS.md`
**Archivo de estado:** `orchestration/ESTADO-DEVOPS.json`

### NEXUS-INTEGRATION
**Track:** Validación e Integración
**Archivo de traza:** `orchestration/TRAZA-TAREAS-INTEGRATION.md`
**Archivo de estado:** `orchestration/ESTADO-INTEGRATION.json`

**Nota:** Todas las directivas aplican a todos los perfiles.

---

## 📜 Índice de Directivas

### Directivas de Ejecución (DE)
- **DE-001:** Lectura obligatoria al inicializar
- **DE-002:** Orquestación de subagentes (15 max compartidos)
- **DE-003:** Modularización obligatoria (archivos <400L)
- **DE-004:** Validación continua
- **DE-005:** Documentación continua
- **DE-006:** Manejo de errores y recuperación
- **DE-007:** Organización de documentación de subagentes
- **DE-008:** Actualización obligatoria post-tarea
- **DE-009:** Paralelización de subagentes

### Directivas de Calidad (DC)
- **DC-001:** Estándares de código
- **DC-002:** Tests obligatorios
- **DC-003:** Nomenclatura consistente
- **DC-004:** Comentarios y documentación inline

### Directivas de Seguridad (DS)
- **DS-001:** No commitear secrets
- **DS-002:** Validación de permisos
- **DS-003:** Backups antes de cambios destructivos

### Directivas de Comunicación (DM)
- **DM-001:** Logs estructurados
- **DM-002:** Reportes de progreso
- **DM-003:** Escalación de bloqueos
- **DM-004:** Trazabilidad de decisiones

### Directivas de Testing (DT)
- **DT-001:** Coverage mínimo por capa
- **DT-002:** Tests obligatorios antes de completar tarea
- **DT-003:** E2E tests para flujos críticos
- **DT-004:** Tests de integración 3 capas

### Directivas de Review (DR)
- **DR-001:** Code review automático
- **DR-002:** Checklist de validación
- **DR-003:** Validación de tipos 3 capas

### Directivas de Git (DG)
- **DG-001:** Commits descriptivos (conventional commits)
- **DG-002:** PRs con descripción y tests
- **DG-003:** No commitear secrets
- **DG-004:** Branch naming convention
- **DG-005:** Git hooks manuales

### Directivas de Validación (DV)
- **DV-001:** Validar contra requerimientos antes de implementar
- **DV-002:** Validar contra especificaciones durante implementación
- **DV-003:** Validar coherencia entre capas después de implementar
- **DV-004:** Generar reporte de validación

### Directivas de Flujos (DF)
- **DF-001:** Proceso de Análisis
- **DF-002:** Proceso de Planeación
- **DF-003:** Proceso de Ejecución
- **DF-004:** Proceso de Validación
- **DF-005:** Orden de ejecución basado en prioridad

---

## 🔧 DE-001: Lectura Obligatoria al Inicializar

### Para Cualquier Agente NEXUS

**Al iniciar/reanudar sesión, SIEMPRE leer en este orden:**

```bash
# 1. Próxima acción (¿Qué hacer ahora?)
cat orchestration/PROXIMA-ACCION.md

# 2. Estado de tareas (¿Dónde estamos?)
cat orchestration/TRAZA-TAREAS-{PERFIL}.md

# 3. Registro de subagentes (¿Cuántos slots disponibles?)
cat orchestration/REGISTRO-SUBAGENTES.json

# 4. Plan del ciclo actual (¿Qué sigue?)
cat orchestration/02-planes/ciclo-{N}/PLAN-CICLO-{N}.md
```

**Tiempo estimado:** 5 minutos
**Frecuencia:** Cada vez que se inicia el agente
**Penalización por omisión:** Alto riesgo de duplicar trabajo o exceder límite de subagentes

---

## 🤖 DE-002: Orquestación de Subagentes

### ⚠️ REGLA DE ORO: Siempre Delegar a Subagentes

**PRINCIPIO FUNDAMENTAL:**

Los agentes NEXUS son **ORQUESTADORES**, NO **EJECUTORES**.

**ROL DE AGENTE NEXUS:**
- ✅ **Planear** estrategia de ejecución
- ✅ **Verificar** slots disponibles en REGISTRO-SUBAGENTES.json
- ✅ **Lanzar** subagentes (Task tool)
- ✅ **Validar** outputs de subagentes
- ✅ **Consolidar** resultados y logs
- ✅ **Actualizar** documentación

**LO QUE NO DEBE HACER:**
- ❌ **Ejecutar** tareas directamente (bash, write, edit) si >5 min o >3 archivos
- ❌ **Implementar** código sin subagentes
- ❌ **Modificar** múltiples archivos sin plan

---

### Límites Técnicos

| Restricción | Valor | Justificación |
|-------------|-------|---------------|
| **Max subagentes en paralelo (TOTAL)** | 15 | **Compartido entre TODOS los agentes NEXUS** |
| **Max memoria por subagente** | ~500 MB | Evitar desbordes |
| **Max subagentes por microciclo** | Ilimitado (en tandas de 15) | Paralelización masiva permitida |
| **Duración max por subagente** | 30 min | Timeout `very thorough` |
| **Reintentos automáticos** | 2 | Evitar loops infinitos |

**IMPORTANTE:** El límite de 15 subagentes es **COMPARTIDO** entre todos los perfiles (Backend, Frontend, Database, DevOps, Integration).

---

### Protocolo de Uso del Registro Compartido

**ANTES de lanzar subagentes:**

```bash
# 1. Leer registro
cat orchestration/REGISTRO-SUBAGENTES.json

# 2. Verificar slots_disponibles
# Si slots_disponibles >= num_subagentes_a_lanzar → Proceder
# Si no → Esperar o reducir número

# 3. Actualizar registro (agregar a "activos")
# - Agregar entrada en array "activos"
# - Decrementar "slots_disponibles"
# - Actualizar "ultima_actualizacion"

# 4. Lanzar subagentes con Task tool

# 5. Esperar completitud
```

**DESPUÉS de completar subagentes:**

```bash
# 1. Actualizar registro
# - Mover de "activos" a "completados" o "fallidos"
# - Incrementar "slots_disponibles"
# - Agregar "fin" y "duracion_minutos"

# 2. Documentar subagentes en orchestration/03-subagentes/
```

---

### Estrategia de Distribución

**SIEMPRE usar subagentes si:**
- La tarea toma >5 minutos
- Requiere crear/modificar >3 archivos
- Involucra lógica de negocio o código
- Necesita análisis o generación

**Criterios para 1-5 subagentes:**
- Tareas independientes que pueden ejecutarse en paralelo
- Duración total <2 horas

**Criterios para 6-15 subagentes (máximo):**
- Tareas completamente independientes
- Validar que otros agentes no estén usando slots
- **Verificar REGISTRO-SUBAGENTES.json antes**

---

## 📦 DE-003: Modularización Obligatoria

### Principio de Cascada

**Regla fundamental:** Ningún archivo debe exceder 400 líneas.

### Thresholds y Acciones

| Líneas | Acción Requerida | Método |
|--------|------------------|--------|
| **<400** | ✅ OK - No hacer nada | - |
| **400-800** | ⚠️ Dividir en 2 archivos | Separación lógica |
| **800-1,200** | 🔴 Dividir en 3 archivos | Separación por responsabilidad |
| **>1,200** | 🚨 CRÍTICO - Dividir en 4+ archivos | Reestructuración completa |

### Excepciones Permitidas

**Solo se permiten archivos >400L si:**
1. **Documentación completa de referencia** (ej: `DIRECTIVAS-PRINCIPALES.md`)
   - Debe tener tabla de contenidos
   - Debe tener navegación clara

2. **Archivos generados automáticamente** (ej: `package-lock.json`)

---

### Proceso de Modularización

**Cuando encuentres un archivo >400L:**

1. Analizar estructura y determinar número de archivos necesarios
2. Crear carpeta con nombre del archivo (sin extensión)
3. Dividir contenido en archivos <400L
4. Crear `_MAP.md` en la carpeta
5. Eliminar archivo original (o renombrarlo a `.old`)
6. Actualizar referencias

---

## ✅ DE-004: Validación Continua

### Validación al Completar Cada Microciclo

```markdown
## Validación Técnica

- [ ] Estructura de carpetas correcta
- [ ] Todos los archivos <400L (excepto excepciones permitidas)
- [ ] Nomenclatura consistente con estándares
- [ ] _MAP.md creado en carpetas con >3 archivos
- [ ] Tests pasando: `npm test` (Backend/Frontend)
- [ ] Lint sin errores: `npm run lint`
- [ ] Build exitoso: `npm run build`

## Validación de Documentación

- [ ] TRAZA-TAREAS-{PERFIL}.md actualizado
- [ ] ESTADO-{PERFIL}.json actualizado
- [ ] REGISTRO-SUBAGENTES.json actualizado (slots correctos)
- [ ] Log de sesión generado
- [ ] Referencias cruzadas funcionando
- [ ] Sin TODOs pendientes sin documentar

## Validación contra Documentación del Proyecto

- [ ] Implementación alineada con /docs/01-requerimientos/
- [ ] Implementación alineada con /docs/02-especificaciones-tecnicas/
- [ ] Reporte de validación generado en orchestration/05-validaciones/

## Validación de Calidad

- [ ] Code coverage ≥60% (Backend/Frontend)
- [ ] Comentarios inline presentes
- [ ] Sin secrets committeados
- [ ] .gitignore actualizado
```

---

## 📝 DE-005: Documentación Continua

### Archivos a Actualizar en Cada Sesión

**Antes de finalizar la sesión, SIEMPRE actualizar:**

1. **TRAZA-TAREAS-{PERFIL}.md** (estado de TODOs)
2. **ESTADO-{PERFIL}.json** (estado estructurado)
3. **REGISTRO-SUBAGENTES.json** (slots actualizados)
4. **orchestration/04-logs/{perfil}/YYYY-MM-DD-micro-X.md** (log de sesión)
5. **_MAP.md relevantes** (índices de navegación)
6. **orchestration/03-subagentes/SA-*/README.md, TRAZA.md, OUTPUT.md** (documentación de subagentes)

---

## 🚨 DE-006: Manejo de Errores y Recuperación

### Clasificación de Errores

**Nivel 1: Errores Menores** (continuar ejecución)
- Warnings de lint
- Tests opcionales fallando
- **Acción:** Documentar en log, continuar

**Nivel 2: Errores Moderados** (reintentar)
- Tests críticos fallando
- Build fallando
- **Acción:** Reintentar hasta 2 veces, documentar

**Nivel 3: Errores Críticos** (detener ejecución)
- Pérdida de datos
- Secrets expuestos
- **Acción:** Detener, documentar en orchestration/06-respaldos/, solicitar intervención

---

## 📁 DE-007: Organización de Documentación de Subagentes

**TODO archivo generado debe estar en una carpeta específica según su propósito.**

### Estructura Obligatoria para Subagentes

```
orchestration/03-subagentes/SA-{PERFIL}-{NUM}/
├── README.md           # Objetivo, inputs, outputs, criterios
├── TRAZA.md            # Log completo de ejecución
├── OUTPUT.md           # Resumen del output final
└── artifacts/          # Archivos generados
```

**Regla:** Cada subagente tiene su carpeta.

---

## 📋 DE-008: Actualización Obligatoria Post-Tarea

**SIEMPRE que se complete una tarea, ACTUALIZAR INMEDIATAMENTE:**

```markdown
Checklist OBLIGATORIO:

1. ✅ _MAP.md relevantes
2. ✅ TRAZA-TAREAS-{PERFIL}.md
3. ✅ ESTADO-{PERFIL}.json
4. ✅ REGISTRO-SUBAGENTES.json
5. ✅ Logs de ejecución
6. ✅ Documentación de subagentes (README, TRAZA, OUTPUT)
7. ✅ Referencias cruzadas
```

---

## 📊 DC-001: Estándares de Código

### TypeScript/JavaScript

**Estilo:**
- ESLint configuración recomendada
- Prettier para formateo
- Tabs: 2 espacios
- Max línea: 100 caracteres
- Comillas simples para strings

**Nomenclatura:**
```typescript
// Clases: PascalCase
class UserService {}

// Funciones/métodos: camelCase
function calculateScore() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Interfaces: PascalCase
interface User {}

// Tipos: PascalCase
type ScoreCalculation = number | string;
```

---

## ✅ DC-002: Tests Obligatorios

### Cobertura Mínima Requerida

| Capa | Coverage Objetivo |
|------|------------------|
| **Backend** | 60% |
| **Frontend** | 60% |
| **Database** | 40% (scripts) |

**Política:** Ningún código nuevo puede integrarse sin tests correspondientes.

---

## 🏷️ DC-003: Nomenclatura Consistente

### Archivos

**TypeScript:**
```
{nombre}.{tipo}.ts

Ejemplos:
user.service.ts
user.controller.ts
user.types.ts
user.spec.ts (unit test)
user.e2e.ts (end-to-end test)
```

**Markdown:**
```
{TIPO}-{tema}.md (archivos importantes)
{tema}.md (archivos normales)
_MAP.md (índices de navegación)
```

---

## 💬 DC-004: Comentarios y Documentación Inline

**SIEMPRE comentar:**
- Funciones públicas (JSDoc/TSDoc)
- Lógica compleja o no obvia
- Decisiones técnicas importantes

---

## 🔒 DS-001: No Commitear Secrets

**NUNCA commitear:**
- API keys
- Passwords
- Tokens
- Private keys
- Connection strings con credenciales
- `.env` con valores reales

**Usar:** `.env.example` (SÍ commitear)

---

## 🔐 DS-002: Validación de Permisos

**PostgreSQL RLS:** Habilitar Row Level Security en tablas sensibles

**Backend (NestJS):** Usar guards para validar permisos

---

## 💾 DS-003: Backups Antes de Cambios Destructivos

**SIEMPRE hacer backup antes de:**
- Eliminar archivos/carpetas
- Cambios masivos
- Modificar configuraciones críticas

**Ubicación:** `orchestration/06-respaldos/pre-{feature}/`

---

## 📞 DM-001 a DM-004: Comunicación

**DM-001:** Logs estructurados
**DM-002:** Reportes de progreso (actualizar métricas)
**DM-003:** Escalación de bloqueos (documentar en orchestration/06-respaldos/)
**DM-004:** Trazabilidad de decisiones (documentar en logs)

---

## 🧪 DT-001 a DT-004: Testing

**DT-001:** Coverage mínimo (Backend 60%, Frontend 60%)
**DT-002:** Tests obligatorios antes de completar tarea
**DT-003:** E2E tests para flujos críticos
**DT-004:** Tests de integración 3 capas

---

## 🔍 DR-001 a DR-003: Review

**DR-001:** Code review automático por NEXUS-INTEGRATION
**DR-002:** Checklist de validación pre-commit
**DR-003:** Validación de tipos 3 capas

---

## 📝 DG-001 a DG-005: Git

**DG-001:** Commits descriptivos (conventional commits: feat, fix, docs, etc.)
**DG-002:** PRs con descripción y tests
**DG-003:** No commitear secrets
**DG-004:** Branch naming (feature/, bugfix/, hotfix/)
**DG-005:** Git hooks manuales

---

## ✔️ DV-001 a DV-004: Validación

**DV-001:** Validar contra `/docs/01-requerimientos/` ANTES de implementar
**DV-002:** Validar contra `/docs/02-especificaciones-tecnicas/` DURANTE implementación
**DV-003:** Validar coherencia entre capas DESPUÉS de implementar
**DV-004:** Generar reporte en `orchestration/05-validaciones/`

---

## 🔄 DF-001 a DF-005: Flujos

**DF-001:** ANÁLISIS - Ver `.claude/directivas/DIRECTIVAS-FLUJOS.md`
**DF-002:** PLANEACIÓN - Ver `.claude/directivas/DIRECTIVAS-FLUJOS.md`
**DF-003:** EJECUCIÓN - Ver `.claude/directivas/DIRECTIVAS-FLUJOS.md`
**DF-004:** VALIDACIÓN - Ver `.claude/directivas/PROCESO-VALIDACION.md`
**DF-005:** Orden de ejecución basado en prioridad numérica (1=más alta)

---

## ✅ Checklist de Cumplimiento

### Al finalizar cada sesión, validar:

- [ ] **DE-001:** Leí archivos de contexto al iniciar
- [ ] **DE-002:** Verifiqué REGISTRO-SUBAGENTES.json antes de lanzar subagentes
- [ ] **DE-003:** Todos los archivos <400L
- [ ] **DE-004:** Validación de microciclo completada
- [ ] **DE-005:** Archivos de documentación actualizados
- [ ] **DE-006:** Errores manejados y documentados
- [ ] **DE-007:** Documentación de subagentes creada
- [ ] **DE-008:** _MAP.md y documentación actualizada post-tarea
- [ ] **DC-001:** Código cumple estándares
- [ ] **DC-002:** Tests creados (coverage ≥60%)
- [ ] **DC-003:** Nomenclatura consistente
- [ ] **DC-004:** Comentarios inline presentes
- [ ] **DS-001:** No se committearon secrets
- [ ] **DT-002:** Tests pasando
- [ ] **DV-001 a DV-004:** Validación contra documentación completada

---

**Versión:** 1.0
**Fecha:** 2025-11-02
**Autor:** Sistema NEXUS
**Status:** ✅ Activo
**Cumplimiento:** Obligatorio para todos los agentes y subagentes
