# Template: Herencia SIMCO para Proyectos

**Versión:** 1.0.0
**Sistema:** SIMCO v2.2.0 + CAPVED + CCA
**Uso:** Copiar y adaptar para cada proyecto

---

## Instrucciones de Uso

1. Copiar este archivo a `{proyecto}/orchestration/00-guidelines/HERENCIA-SIMCO.md`
2. Reemplazar todas las variables `{VARIABLE}` con valores del proyecto
3. Eliminar secciones que no apliquen según el nivel del proyecto
4. Este archivo REEMPLAZA el antiguo `HERENCIA-DIRECTIVAS.md`

---

# Herencia SIMCO - {NOMBRE_PROYECTO}

## Configuración del Proyecto

| Propiedad | Valor |
|-----------|-------|
| **Proyecto** | {NOMBRE_PROYECTO} |
| **Nivel** | {STANDALONE / SUITE / SUITE_CORE / VERTICAL / PRODUCT} |
| **Padre** | {PROYECTO_PADRE o "core" si es standalone} |
| **SIMCO Version** | 2.2.0 |
| **CAPVED** | Habilitado |
| **CCA Protocol** | Habilitado |

## Jerarquía de Herencia

```
{AJUSTAR SEGÚN NIVEL DEL PROYECTO}

Nivel 0: core/orchestration/                    ← FUENTE PRINCIPAL
    │
    └── Nivel 1: {suite}/orchestration/         ← (si aplica)
            │
            └── Nivel 2: {suite-core}/orchestration/  ← (si aplica)
                    │
                    └── Nivel 3: {ESTE_PROYECTO}/orchestration/
```

**Regla:** Las directivas de nivel inferior pueden EXTENDER las superiores, nunca REDUCIRLAS.

---

## Directivas Heredadas de CORE (OBLIGATORIAS)

Ubicación: `core/orchestration/`

### 1. Ciclo de Vida - USAR SIEMPRE

| Alias | Archivo | Propósito | Cuándo Usar |
|-------|---------|-----------|-------------|
| `@TAREA` | `directivas/simco/SIMCO-TAREA.md` | Punto de entrada | **Toda HU/tarea que genera commit** |
| `@CAPVED` | `directivas/principios/PRINCIPIO-CAPVED.md` | Ciclo de 6 fases | Contexto→Análisis→Plan→Validación→Ejecución→Doc |
| `@INICIALIZACION` | `directivas/simco/SIMCO-INICIALIZACION.md` | Bootstrap de agentes | Al iniciar cualquier agente |

### 2. Operaciones Universales

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@CREAR` | `directivas/simco/SIMCO-CREAR.md` | Crear cualquier archivo nuevo |
| `@MODIFICAR` | `directivas/simco/SIMCO-MODIFICAR.md` | Modificar archivos existentes |
| `@VALIDAR` | `directivas/simco/SIMCO-VALIDAR.md` | Validar código (build, lint, tests) |
| `@DOCUMENTAR` | `directivas/simco/SIMCO-DOCUMENTAR.md` | Documentar trabajo realizado |
| `@BUSCAR` | `directivas/simco/SIMCO-BUSCAR.md` | Buscar archivos e información |
| `@DELEGAR` | `directivas/simco/SIMCO-DELEGACION.md` | Delegar trabajo a subagentes |

### 3. Catálogo de Funcionalidades

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@CATALOG` | `catalog/` | Directorio de funcionalidades reutilizables |
| `@CATALOG_INDEX` | `catalog/CATALOG-INDEX.yml` | Índice machine-readable |
| `@REUTILIZAR` | `directivas/simco/SIMCO-REUTILIZAR.md` | ANTES de implementar algo común |
| `@CONTRIBUIR` | `directivas/simco/SIMCO-CONTRIBUIR-CATALOGO.md` | DESPUÉS de crear algo reutilizable |

### 4. Principios Fundamentales (5)

| Alias | Archivo | Resumen |
|-------|---------|---------|
| `@CAPVED` | `PRINCIPIO-CAPVED.md` | Toda tarea pasa por 6 fases |
| `@DOC_PRIMERO` | `PRINCIPIO-DOC-PRIMERO.md` | Consultar docs/ antes de implementar |
| `@ANTI_DUP` | `PRINCIPIO-ANTI-DUPLICACION.md` | Verificar que no existe antes de crear |
| `@VALIDACION` | `PRINCIPIO-VALIDACION-OBLIGATORIA.md` | Build y lint DEBEN pasar |
| `@TOKENS` | `PRINCIPIO-ECONOMIA-TOKENS.md` | Desglosar tareas grandes |

---

## Directivas por Dominio Técnico

Usar según las tecnologías del proyecto:

| Alias | Archivo | Tecnologías | Aplica a {NOMBRE_PROYECTO} |
|-------|---------|-------------|---------------------------|
| `@OP_DDL` | `SIMCO-DDL.md` | PostgreSQL, SQL | {SI/NO} |
| `@OP_BACKEND` | `SIMCO-BACKEND.md` | NestJS, Express, TypeORM, Prisma | {SI/NO} |
| `@OP_FRONTEND` | `SIMCO-FRONTEND.md` | React, TypeScript, Vite | {SI/NO} |
| `@OP_MOBILE` | `SIMCO-MOBILE.md` | React Native, Expo | {SI/NO} |
| `@OP_ML` | `SIMCO-ML.md` | Python, FastAPI, ML/AI | {SI/NO} |

---

## Directivas de Niveles y Propagación

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@NIVELES` | `SIMCO-NIVELES.md` | Identificar nivel jerárquico del proyecto |
| `@PROPAGACION` | `SIMCO-PROPAGACION.md` | Propagar cambios a niveles superiores |
| `@ALINEACION` | `SIMCO-ALINEACION.md` | Validar alineación DDL↔Entity↔DTO |
| `@DECISION_MATRIZ` | `SIMCO-DECISION-MATRIZ.md` | Decidir qué directiva usar |

---

## Patrones Heredados (RECOMENDADOS)

Ubicación: `core/orchestration/patrones/`

| Patrón | Cuándo Usar |
|--------|-------------|
| `MAPEO-TIPOS-DDL-TYPESCRIPT.md` | Mapear tipos PostgreSQL ↔ TypeScript |
| `PATRON-VALIDACION.md` | Validar inputs con class-validator/Zod |
| `PATRON-EXCEPTION-HANDLING.md` | Manejo de errores y excepciones |
| `PATRON-TESTING.md` | Escribir tests unitarios/integración |
| `PATRON-LOGGING.md` | Configurar logging estructurado |
| `PATRON-CONFIGURACION.md` | Variables de entorno y config |
| `PATRON-SEGURIDAD.md` | Implementar auth, OWASP Top 10 |
| `PATRON-PERFORMANCE.md` | Optimización y caching |
| `PATRON-TRANSACCIONES.md` | Transacciones de base de datos |
| `ANTIPATRONES.md` | Lo que NUNCA hacer |
| `NOMENCLATURA-UNIFICADA.md` | Convenciones de nombres |

---

## Impactos y Dependencias

Ubicación: `core/orchestration/impactos/`

| Documento | Consultar Cuando |
|-----------|------------------|
| `IMPACTO-CAMBIOS-DDL.md` | Modificar schema de BD |
| `IMPACTO-CAMBIOS-BACKEND.md` | Modificar servicios/controllers |
| `IMPACTO-CAMBIOS-ENTITY.md` | Modificar entities TypeORM |
| `IMPACTO-CAMBIOS-API.md` | Modificar endpoints REST |
| `MATRIZ-DEPENDENCIAS.md` | Ver cascada completa de dependencias |

---

## Checklists de Verificación

Ubicación: `core/orchestration/checklists/`

| Checklist | Usar Para |
|-----------|-----------|
| `CHECKLIST-CODE-REVIEW-API.md` | Revisar código de APIs |
| `CHECKLIST-REFACTORIZACION.md` | Antes de refactorizar |
| `CHECKLIST-PROPAGACION.md` | Verificar propagación de cambios |

---

## Perfiles de Agentes Disponibles

Ubicación: `core/orchestration/agents/perfiles/`

### Técnicos
| Perfil | Especialización |
|--------|-----------------|
| `PERFIL-DATABASE.md` | PostgreSQL, DDL, migraciones |
| `PERFIL-BACKEND.md` | NestJS, TypeORM |
| `PERFIL-BACKEND-EXPRESS.md` | Express.js, Prisma/Drizzle |
| `PERFIL-FRONTEND.md` | React, TypeScript |
| `PERFIL-MOBILE-AGENT.md` | React Native |
| `PERFIL-ML-SPECIALIST.md` | Python, ML/AI, FastAPI |

### Coordinación
| Perfil | Especialización |
|--------|-----------------|
| `PERFIL-ORQUESTADOR.md` | Coordinación general |
| `PERFIL-ARCHITECTURE-ANALYST.md` | Análisis de arquitectura |
| `PERFIL-REQUIREMENTS-ANALYST.md` | Análisis de requerimientos |

### Calidad
| Perfil | Especialización |
|--------|-----------------|
| `PERFIL-CODE-REVIEWER.md` | Revisión de código |
| `PERFIL-BUG-FIXER.md` | Corrección de bugs |
| `PERFIL-DOCUMENTATION-VALIDATOR.md` | Validación de documentación |
| `PERFIL-WORKSPACE-MANAGER.md` | Gestión de workspace |

---

## Directivas Heredadas del Padre (si aplica)

{SOLO PARA NIVELES 2, 3, 4 - AJUSTAR SEGÚN PROYECTO}

### Heredadas de {PROYECTO_PADRE}

Ubicación: `{RUTA_PADRE}/orchestration/directivas/`

| Directiva | Propósito | Cómo se Extiende |
|-----------|-----------|------------------|
| {DIRECTIVA_1} | {PROPÓSITO} | {EXTENSIÓN_LOCAL} |
| {DIRECTIVA_2} | {PROPÓSITO} | {EXTENSIÓN_LOCAL} |

---

## Directivas Específicas de {NOMBRE_PROYECTO}

Ubicación: `./directivas/`

| Directiva Local | Extiende | Propósito Específico |
|-----------------|----------|---------------------|
| {DIRECTIVA_LOCAL_1} | `@{ALIAS}` | {PROPÓSITO} |
| {DIRECTIVA_LOCAL_2} | `@{ALIAS}` | {PROPÓSITO} |

---

## Variables de Contexto del Proyecto

Para el protocolo CCA, este proyecto define:

```yaml
# Variables para resolver en ALIASES y templates
PROJECT_NAME: "{NOMBRE_PROYECTO}"
PROJECT_LEVEL: "{NIVEL}"
PROJECT_ROOT: "{RUTA_ABSOLUTA}"

# Rutas específicas
DB_DDL_PATH: "{RUTA}/database/ddl"
BACKEND_ROOT: "{RUTA}/backend"
FRONTEND_ROOT: "{RUTA}/frontend"

# Inventarios
MASTER_INVENTORY: "orchestration/inventarios/MASTER_INVENTORY.yml"
```

---

## Flujo de Trabajo con SIMCO + CAPVED

```
┌─────────────────────────────────────────────────────────────┐
│                    RECIBIR TAREA/HU                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. LEER @TAREA (SIMCO-TAREA.md)                            │
│     - Activa ciclo CAPVED                                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │    C    │    →     │    A    │    →     │    P    │
   │Contexto │          │Análisis │          │  Plan   │
   └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
        ▼                     ▼                     ▼
   @BUSCAR              @CATALOG_INDEX         @TOKENS
   @NIVELES             @IMPACTOS              @DELEGAR
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │    V    │    →     │    E    │    →     │    D    │
   │Validar  │          │Ejecutar │          │  Doc    │
   │  Plan   │          │         │          │         │
   └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
        ▼                     ▼                     ▼
   @ALINEACION          @OP_DDL              @DOCUMENTAR
   @DECISION_MATRIZ     @OP_BACKEND          @PROPAGACION
                        @OP_FRONTEND
                        @VALIDAR
```

---

## Mapeo: Directivas Antiguas → SIMCO

Si este proyecto usaba el sistema anterior:

| Directiva Antigua | Reemplazada Por | Alias |
|-------------------|-----------------|-------|
| `DIRECTIVA-FLUJO-5-FASES.md` | `SIMCO-TAREA.md` + `PRINCIPIO-CAPVED.md` | @TAREA, @CAPVED |
| `DIRECTIVA-VALIDACION-SUBAGENTES.md` | `SIMCO-VALIDAR.md` | @VALIDAR |
| `POLITICAS-USO-AGENTES.md` | `SIMCO-DELEGACION.md` | @DELEGAR |
| `DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` | `SIMCO-DOCUMENTAR.md` | @DOCUMENTAR |
| `DIRECTIVA-CALIDAD-CODIGO.md` | `patrones/ANTIPATRONES.md` | @PATRONES |
| `DIRECTIVA-DISENO-BASE-DATOS.md` | `SIMCO-DDL.md` | @OP_DDL |
| `ESTANDARES-API-REST-GENERICO.md` | `SIMCO-BACKEND.md` | @OP_BACKEND |

---

## Checklist de Configuración

- [ ] Archivo copiado a `orchestration/00-guidelines/HERENCIA-SIMCO.md`
- [ ] Variables `{VARIABLE}` reemplazadas
- [ ] Secciones no aplicables eliminadas
- [ ] Directivas por dominio marcadas SI/NO
- [ ] Directivas heredadas del padre documentadas (si aplica)
- [ ] Directivas específicas locales listadas
- [ ] Variables de contexto CCA definidas
- [ ] `CONTEXTO-PROYECTO.md` actualizado con referencia a este archivo

---

**Sistema:** SIMCO v2.2.0 + CAPVED + CCA Protocol
**Template Version:** 1.0.0
