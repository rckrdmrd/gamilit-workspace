# Mapa de Contenidos: Perfiles de Agentes NEXUS

**Propósito:** Define los perfiles de agentes especializados para desarrollo del proyecto GAMILIT
**Archivos totales:** 6
**Última actualización:** 2025-11-02

---

## 📋 Estructura de Archivos

```
agents/
├── INIT-NEXUS-BACKEND.md        # Agente de desarrollo Backend
├── INIT-NEXUS-FRONTEND.md       # Agente de desarrollo Frontend
├── INIT-NEXUS-DATABASE.md       # Agente de desarrollo Database
├── INIT-NEXUS-DEVOPS.md         # Agente de DevOps
├── INIT-NEXUS-INTEGRATION.md    # Agente de validación e integración
└── _MAP.md                      # Este archivo

```

---

## 🤖 Perfiles de Agentes

### 1. NEXUS-BACKEND
**Archivo:** `INIT-NEXUS-BACKEND.md`
**Responsabilidades:**
- Desarrollo de servicios backend (NestJS/TypeScript)
- APIs REST/GraphQL
- Lógica de negocio
- Testing backend (coverage ≥60%)
- Integración con base de datos

**Áreas de trabajo:**
- `/apps/backend/src/`
- `/apps/backend/test/`

**Coordinación:**
- NEXUS-DATABASE (validación de tipos)
- NEXUS-FRONTEND (contratos de API)
- NEXUS-INTEGRATION (validación 3 capas)

---

### 2. NEXUS-FRONTEND
**Archivo:** `INIT-NEXUS-FRONTEND.md`
**Responsabilidades:**
- Desarrollo de componentes React/TypeScript
- Hooks personalizados
- State management
- Testing frontend (coverage ≥60%)
- UI/UX implementation

**Áreas de trabajo:**
- `/apps/frontend/src/`
- `/apps/frontend/tests/`

**Coordinación:**
- NEXUS-BACKEND (consumo de APIs)
- NEXUS-INTEGRATION (validación 3 capas)

---

### 3. NEXUS-DATABASE
**Archivo:** `INIT-NEXUS-DATABASE.md`
**Responsabilidades:**
- Diseño de esquemas SQL (PostgreSQL)
- Migrations versionadas
- Seeds de datos
- Row Level Security (RLS)
- Tests de integridad

**Áreas de trabajo:**
- `/apps/database/ddl/`
- `/apps/database/migrations/`
- `/apps/database/seeds/`

**Coordinación:**
- NEXUS-BACKEND (coherencia de tipos SQL ↔ TypeScript)
- NEXUS-INTEGRATION (validación de esquemas)

---

### 4. NEXUS-DEVOPS
**Archivo:** `INIT-NEXUS-DEVOPS.md`
**Responsabilidades:**
- Docker y Docker Compose
- CI/CD pipelines (GitHub Actions)
- Scripts de deployment
- Backup y restore automatizado
- Configuración de entornos

**Áreas de trabajo:**
- `/apps/devops/docker/`
- `/apps/devops/ci-cd/`
- `/apps/devops/scripts/`

**Coordinación:**
- Todos los agentes (configuración de deployment)

---

### 5. NEXUS-INTEGRATION
**Archivo:** `INIT-NEXUS-INTEGRATION.md`
**Responsabilidades:**
- Validación de coherencia 3 capas (Database ↔ Backend ↔ Frontend)
- Validación contra documentación del proyecto
- Code review automático
- Testing E2E
- Detección de discrepancias

**Áreas de trabajo:**
- Lectura de todas las capas
- Escritura en `orchestration/05-validaciones/`

**Coordinación:**
- Todos los agentes (validación de sus implementaciones)

---

## 🔄 Orden de Lectura Recomendado

### Para entender el sistema completo:
1. **INIT-NEXUS-BACKEND.md** - Entender flujo de trabajo base (aplica a todos)
2. **INIT-NEXUS-INTEGRATION.md** - Entender validación entre capas
3. **INIT-NEXUS-FRONTEND.md**, **INIT-NEXUS-DATABASE.md**, **INIT-NEXUS-DEVOPS.md** - Según especialización necesaria

### Para inicializar un agente específico:
1. Leer solo el archivo `INIT-NEXUS-{PERFIL}.md` correspondiente
2. Seguir las instrucciones de "Contexto Inicial - Lectura Obligatoria"

---

## 📊 Características Comunes a Todos los Perfiles

Todos los agentes NEXUS comparten:

### Principio fundamental:
- Son **ORQUESTADORES**, no ejecutores
- Delegan a subagentes especializados
- Siguen fases: Análisis → Planeación → Ejecución

### Límite compartido:
- **15 subagentes máximo en paralelo** entre TODOS los agentes
- Verificación obligatoria en `orchestration/REGISTRO-SUBAGENTES.json`

### Archivos de control:
- `orchestration/TRAZA-TAREAS-{PERFIL}.md` - Estado de TODOs
- `orchestration/ESTADO-{PERFIL}.json` - Estado estructurado
- `orchestration/PROXIMA-ACCION.md` - Próxima acción prioritaria

### Directivas:
- Todas aplican las mismas directivas (ver `.claude/directivas/DIRECTIVAS-PRINCIPALES.md`)
- DE-001 a DE-008, DC-001 a DC-004, DS-001 a DS-004, DM-001 a DM-004
- DT-001 a DT-004, DR-001 a DR-003, DG-001 a DG-005, DV-001 a DV-004, DF-001 a DF-005

### Validación:
- Tests obligatorios (coverage ≥60%)
- Archivos <400 líneas
- Validación contra documentación del proyecto

---

## 🔗 Referencias

- **Directivas:** `.claude/directivas/DIRECTIVAS-PRINCIPALES.md`
- **Guía de orquestación:** `.claude/directivas/GUIA-ORQUESTACION.md`
- **Flujos de trabajo:** `.claude/directivas/DIRECTIVAS-FLUJOS.md`
- **Templates:** `.claude/templates/TEMPLATES-SUBAGENTES.md`
- **Referencias del proyecto:** `.claude/referencias/CONTEXTO-REFERENCIAS.md`

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Versión:** 1.0
