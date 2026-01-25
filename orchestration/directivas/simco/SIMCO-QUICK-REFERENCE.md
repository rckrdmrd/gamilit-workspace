# SIMCO: REFERENCIA RÁPIDA

**Versión:** 1.0.0 | **Fecha:** 2025-12-08 | **Uso:** Consulta rápida sin cargar archivos extensos

---

## FLUJO DE INICIALIZACIÓN (CCA) - 7 PASOS

```
PASO_0 → Identificar NIVEL (workspace/proyecto/vertical)
PASO_1 → Identificar perfil, proyecto, tarea, operación
PASO_2 → Cargar CORE (@CATALOG, principios, _INDEX)
PASO_3 → Cargar PROYECTO (CONTEXTO, PROXIMA-ACCION, inventarios)
PASO_4 → Cargar OPERACIÓN (SIMCO según tarea)
PASO_5 → Cargar TAREA (docs/, dependencias)
PASO_6 → Verificar dependencias
→ READY_TO_EXECUTE
```

---

## CICLO CAPVED - 6 FASES

```
C → Contexto   : Vincular HU, cargar SIMCO, verificar @CATALOG
A → Análisis   : Mapear objetos, dependencias, riesgos
P → Planeación : Desglosar subtareas, asignar agentes
V → Validación : ⚠️ NO DELEGAR - verificar A vs P
E → Ejecución  : docs/ PRIMERO, delegar, build+lint
D → Documentar : GATE - inventarios, trazas, lecciones
```

---

## NIVELES JERÁRQUICOS

| Nivel | Tipo | Propaga a |
|-------|------|-----------|
| 0 | Workspace Root | - |
| 1 | Core | 0 |
| 2A | Standalone | 0 |
| 2B | Suite | 0 |
| 2B.1 | Suite Core | 2B → 0 |
| 2B.2 | Vertical | 2B → 0 |
| 3 | Catálogo | 1 → 0 |

---

## ALIAS ESENCIALES

```yaml
# Operaciones
@CREAR @MODIFICAR @VALIDAR @DOCUMENTAR @BUSCAR @DELEGAR @REUTILIZAR

# Dominio
@OP_DDL @OP_BACKEND @OP_FRONTEND

# Niveles
@NIVELES @PROPAGACION

# Catálogo
@CATALOG @CATALOG_INDEX

# Proyecto
@INVENTORY @CONTEXTO @PROXIMA
```

---

## PRINCIPIOS (5 FUNDAMENTALES)

1. **CAPVED**: Toda tarea pasa por 6 fases
2. **DOC-PRIMERO**: Consultar docs/ antes de código
3. **ANTI-DUP**: Verificar @INVENTORY + @CATALOG antes de crear
4. **VALIDACIÓN**: Build + Lint DEBEN pasar
5. **ECONOMÍA-TOKENS**: Desglosar tareas grandes, prompts <2000 tokens

---

## DELEGACIÓN - CHECKLIST MÍNIMO

```yaml
INCLUIR_SIEMPRE:
  - nivel_actual + orchestration_path + propagate_to
  - variables_resueltas (NO placeholders)
  - criterios_aceptacion (verificables)
  - archivos_referencia (rutas exactas)
  - validaciones_requeridas (comandos)

LIMITES:
  - Max 5 subagentes paralelos
  - Max 3 niveles anidación
  - Prompt < 2000 tokens
```

---

## VALIDACIÓN RÁPIDA

```bash
# Database
cd @DB_SCRIPTS && ./{RECREATE_CMD}

# Backend
cd @BACKEND_ROOT && npm run build && npm run lint

# Frontend
cd @FRONTEND_ROOT && npm run build && npm run lint
```

---

## CUÁNDO USAR CADA SIMCO

| Situación | SIMCO | Archivos Relacionados |
|-----------|-------|-----------------------|
| HU/Tarea completa | SIMCO-TAREA | - |
| Crear archivo nuevo | SIMCO-CREAR + SIMCO-{DOMINIO} | SIMCO-BACKEND, SIMCO-FRONTEND, SIMCO-DDL |
| Modificar existente | SIMCO-MODIFICAR + SIMCO-{DOMINIO} | SIMCO-BACKEND, SIMCO-FRONTEND, SIMCO-DDL |
| Validar código | SIMCO-VALIDAR | - |
| Documentar trabajo | SIMCO-DOCUMENTAR | - |
| Buscar información | SIMCO-BUSCAR | - |
| Asignar a subagente | SIMCO-DELEGACION | SIMCO-ESCALAMIENTO |
| Funcionalidad común | SIMCO-REUTILIZAR | @CATALOG |
| Contribuir a catálogo | SIMCO-CONTRIBUIR-CATALOGO | @CATALOG_INDEX |
| Gestionar niveles | SIMCO-NIVELES | SIMCO-PROPAGACION |
| Alinear directivas | SIMCO-ALINEACION | - |
| Decisiones arquitecturales | SIMCO-DECISION-MATRIZ | - |
| Control de versiones | SIMCO-GIT | - |

---

## TABLA DE REFERENCIA CRUZADA

### Por tipo de operación

| Operación | SIMCO Principal | SIMCO Soporte | Fase CAPVED |
|-----------|----------------|---------------|-------------|
| **Crear entidad BD** | SIMCO-DDL | SIMCO-CREAR, SIMCO-VALIDAR | E (Ejecución) |
| **Crear service backend** | SIMCO-BACKEND | SIMCO-CREAR, SIMCO-REUTILIZAR | E (Ejecución) |
| **Crear componente React** | SIMCO-FRONTEND | SIMCO-CREAR, SIMCO-REUTILIZAR | E (Ejecución) |
| **Refactorizar código** | SIMCO-MODIFICAR | SIMCO-VALIDAR, SIMCO-DOCUMENTAR | P-E (Planeación-Ejecución) |
| **Buscar patrón existente** | SIMCO-BUSCAR | SIMCO-REUTILIZAR | A (Análisis) |
| **Delegar subtarea** | SIMCO-DELEGACION | SIMCO-ESCALAMIENTO | P (Planeación) |
| **Validar implementación** | SIMCO-VALIDAR | SIMCO-DOCUMENTAR | V-D (Validación-Documentar) |
| **Propagar cambios** | SIMCO-PROPAGACION | SIMCO-NIVELES | D (Documentar) |

### Por dominio técnico

| Dominio | SIMCO | Alias | Catálogo Relacionado |
|---------|-------|-------|---------------------|
| **Base de datos** | SIMCO-DDL | @OP_DDL | - |
| **Backend (NestJS)** | SIMCO-BACKEND | @OP_BACKEND | auth, payments, session-management |
| **Frontend (React)** | SIMCO-FRONTEND | @OP_FRONTEND | - |
| **Machine Learning** | SIMCO-ML | @OP_ML | - |
| **Mobile** | SIMCO-MOBILE | @OP_MOBILE | - |

---

## EJEMPLOS ESPECÍFICOS

### Ejemplo 1: Crear módulo de autenticación completo

```yaml
CONTEXTO: Proyecto nuevo necesita auth con JWT

PASO_1: Identificar
  perfil: agente_principal
  tarea: "Implementar autenticación JWT"
  operación: CREAR

PASO_2: Cargar CORE
  @CATALOG → catalog/auth/_reference/

PASO_3: Buscar reutilización
  SIMCO: SIMCO-BUSCAR + SIMCO-REUTILIZAR
  Comando: Consultar catalog/auth/_reference/
  Resultado: auth.service.reference.ts encontrado

PASO_4: Crear con patrón
  SIMCO: SIMCO-CREAR + SIMCO-BACKEND
  Base: auth.service.reference.ts
  Adaptar: imports, entidades, variables de entorno

PASO_5: Validar
  SIMCO: SIMCO-VALIDAR
  Comandos:
    - cd backend && npm run build
    - npm run lint
    - npm run test:e2e -- auth

PASO_6: Documentar
  SIMCO: SIMCO-DOCUMENTAR
  Actualizar:
    - @INVENTORY (nuevo módulo auth)
    - PROXIMA-ACCION.md (marcar HU completa)
```

### Ejemplo 2: Modificar endpoint existente

```yaml
CONTEXTO: Agregar filtros a GET /users

PASO_1: Buscar implementación actual
  SIMCO: SIMCO-BUSCAR
  Comando: grep -r "GET /users" backend/src/

PASO_2: Analizar dependencias
  CAPVED: A (Análisis)
  Verificar: DTOs, entities, services involucrados

PASO_3: Modificar código
  SIMCO: SIMCO-MODIFICAR + SIMCO-BACKEND
  Archivos:
    - users.controller.ts (agregar @Query)
    - users.service.ts (agregar lógica filtros)
    - user.dto.ts (crear FilterUsersDto)

PASO_4: Validar
  SIMCO: SIMCO-VALIDAR
  Build + Lint + Tests

PASO_5: Documentar cambio
  SIMCO: SIMCO-DOCUMENTAR
  Actualizar:
    - API docs (Swagger)
    - @INVENTORY (endpoint modificado)
```

### Ejemplo 3: Delegar tarea a subagente

```yaml
CONTEXTO: Tarea grande - dividir en subtareas

PASO_1: Desglosar en CAPVED-Planeación
  Tarea principal: "Implementar sistema de notificaciones"
  Subtareas:
    1. Crear entidades BD (notifications, user_preferences)
    2. Crear service backend (NotificationService)
    3. Integrar webhook (email, push)
    4. Crear componentes frontend (NotificationBell, NotificationList)

PASO_2: Preparar delegación
  SIMCO: SIMCO-DELEGACION
  Para cada subtarea:
    - nivel_actual: 2B (Proyecto Suite)
    - orchestration_path: orchestration/directivas/simco/
    - propagate_to: 2B → 1 → 0
    - variables_resueltas: DB_NAME=gamilit_auth, ...
    - criterios_aceptacion: "Build pasa, tests pasan, ..."
    - archivos_referencia: [@CATALOG/notifications/_reference/]

PASO_3: Ejecutar delegación (máx 5 paralelos)
  Subagente_1: Subtarea 1 (BD) → SIMCO-DDL
  Subagente_2: Subtarea 2 (Backend) → SIMCO-BACKEND
  Subagente_3: Subtarea 3 (Webhook) → SIMCO-BACKEND
  Subagente_4: Subtarea 4 (Frontend) → SIMCO-FRONTEND

PASO_4: Validación central (NO DELEGAR)
  CAPVED: V (Validación)
  Agente principal valida integración completa

PASO_5: Documentar todo
  SIMCO: SIMCO-DOCUMENTAR
  Consolidar:
    - Trazas de todos los subagentes
    - Lecciones aprendidas
    - Actualizar @INVENTORY
```

### Ejemplo 4: Contribuir al catálogo

```yaml
CONTEXTO: Patrón de rate-limiting reutilizable

PASO_1: Identificar patrón
  Origen: gamilit/backend/src/guards/rate-limit.guard.ts
  Calidad: Probado en producción, genérico, bien documentado

PASO_2: Preparar contribución
  SIMCO: SIMCO-CONTRIBUIR-CATALOGO
  Destino: catalog/rate-limiting/_reference/

PASO_3: Crear archivos
  rate-limit.guard.reference.ts (código)
  rate-limit.decorator.reference.ts (decorador)
  README.md (documentación)

PASO_4: Actualizar índices
  Archivos:
    - catalog/rate-limiting/CATALOG-ENTRY.yml
    - catalog/CATALOG-INDEX.yml
    - catalog/CATALOG-USAGE-TRACKING.yml

PASO_5: Validar formato
  SIMCO: SIMCO-VALIDAR
  Verificar:
    - Comentarios @description, @usage, @origin
    - Variables genéricas (no hardcoded)
    - README con ejemplos y adaptación

PASO_6: Propagar a niveles superiores
  SIMCO: SIMCO-PROPAGACION
  Niveles: 3 → 1 → 0
```

---

## ERRORES COMUNES

| Error | Solución | SIMCO Relevante |
|-------|----------|-----------------|
| Referencia rota | Verificar @ALIASES, revisar rutas absolutas | SIMCO-BUSCAR |
| Duplicado creado | Consultar @INVENTORY + @CATALOG primero | SIMCO-REUTILIZAR |
| Build falla | No marcar como completo, ejecutar SIMCO-VALIDAR | SIMCO-VALIDAR |
| Propagación olvidada | Ejecutar SIMCO-PROPAGACION después de cambios | SIMCO-PROPAGACION |
| Token overload | Desglosar en subtareas más pequeñas (max 2000 tokens) | SIMCO-DELEGACION |
| Validación delegada | NUNCA delegar fase V de CAPVED | SIMCO-TAREA |
| Variables sin resolver | Pasar valores exactos, NO placeholders | SIMCO-DELEGACION |
| Nivel incorrecto | Consultar SIMCO-NIVELES, verificar propagación | SIMCO-NIVELES |
| Git hooks fallan | Ejecutar pre-commit antes de commit | SIMCO-GIT |
| Catálogo desactualizado | Verificar CATALOG-INDEX.yml antes de usar | SIMCO-REUTILIZAR |

---

## COMBINACIONES FRECUENTES

```yaml
# Crear + Validar + Documentar
SIMCO-CREAR → SIMCO-VALIDAR → SIMCO-DOCUMENTAR

# Buscar + Reutilizar + Modificar
SIMCO-BUSCAR → SIMCO-REUTILIZAR → SIMCO-MODIFICAR

# Delegar + Validar (agente principal)
SIMCO-DELEGACION → SIMCO-VALIDAR (fase V no se delega)

# Crear catálogo + Propagar
SIMCO-CONTRIBUIR-CATALOGO → SIMCO-PROPAGACION

# DDL + Backend + Frontend (stack completo)
SIMCO-DDL → SIMCO-BACKEND → SIMCO-FRONTEND → SIMCO-VALIDAR
```

---

**Archivo:** SIMCO-QUICK-REFERENCE.md | **~250 líneas** | **Optimizado para tokens**
