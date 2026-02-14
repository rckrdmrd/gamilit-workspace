# TEMPLATE: DELEGACION COMPLETA A SUBAGENTE

**Version:** 1.2.0
**Sistema:** SIMCO - NEXUS v4.0
**Proposito:** Template completo para delegaciones complejas (>2 archivos)
**Tokens:** ~1,800

> **NOTA:** Para tareas mas simples, usar:
> - `TEMPLATE-DELEGACION-ESTANDAR.md` (1-2 archivos, ~600 tokens)
> - `TEMPLATE-DELEGACION-MINIMA.md` (1 archivo, ~250 tokens)

---

## PRINCIPIO FUNDAMENTAL

> **Un subagente sin contexto completo = alucinaciones garantizadas**
> **Un subagente con contexto heredado = ejecución precisa**

---

## 🆕 VERIFICACIÓN DE CATÁLOGO (OBLIGATORIO)

> **ANTES de delegar, verificar si la funcionalidad existe en el catálogo:**

```bash
# Buscar en catálogo global
grep -i "{funcionalidad}" shared/catalog/CATALOG-INDEX.yml
```

**Si existe en @CATALOG:**
- Instruir al subagente usar `@REUTILIZAR` (SIMCO-REUTILIZAR.md)
- Proporcionar ruta al código de referencia: `@CATALOG_{FUNCIONALIDAD}/`
- El subagente debe ADAPTAR, no crear desde cero

**Funcionalidades catalogadas:** auth, session-management, rate-limiting, notifications,
multi-tenancy, feature-flags, websocket, payments

---

## TEMPLATE DE DELEGACIÓN

```markdown
# ═══════════════════════════════════════════════════════════════
# DELEGACIÓN A SUBAGENTE
# ═══════════════════════════════════════════════════════════════

## BLOQUE 1: IDENTIDAD Y CONTEXTO

### Identidad del Subagente
```yaml
perfil: "{DATABASE | BACKEND | FRONTEND}"
proyecto: "{NOMBRE_PROYECTO}"
workspace: "/home/isem/workspace"
```

### Protocolo de Inicialización
```
Serás {PERFIL}-Agent trabajando en el proyecto {PROYECTO}
para realizar: {DESCRIPCION_TAREA}

ANTES de actuar, ejecuta el protocolo CCA:
1. Lee shared/catalog/CATALOG-INDEX.yml (🆕 verificar si existe funcionalidad)
2. Si existe en catálogo: Lee SIMCO-REUTILIZAR.md
3. Lee core/orchestration/directivas/simco/SIMCO-INICIALIZACION.md
4. Sigue los pasos de carga de contexto
5. Confirma "READY_TO_EXECUTE" antes de implementar
```

---

## BLOQUE 2: CONTEXTO HEREDADO (PRE-CARGADO)

### Variables Resueltas del Proyecto
```yaml
# Copiar de PROJECT-CONTEXT.md del proyecto
DB_NAME: "{valor}"
DB_DDL_PATH: "{valor}"
DB_SCRIPTS_PATH: "{valor}"
BACKEND_ROOT: "{valor}"
BACKEND_SRC: "{valor}"
FRONTEND_ROOT: "{valor}"
FRONTEND_SRC: "{valor}"
```

### Alias Resueltos
```yaml
# Copiar alias resueltos relevantes
@DDL: "{ruta_completa}"
@BACKEND: "{ruta_completa}"
@FRONTEND: "{ruta_completa}"
@INVENTORY: "{ruta_completa}"
@INV_DB: "{ruta_completa}"
@INV_BE: "{ruta_completa}"
@INV_FE: "{ruta_completa}"
```

### Estado Actual del Proyecto
```yaml
# Resumen del inventario relevante
tablas_existentes:
  - "{schema}.{tabla1}"
  - "{schema}.{tabla2}"

entities_existentes:
  - "{Entity1}"
  - "{Entity2}"

endpoints_existentes:
  - "GET /api/{recurso}"
  - "POST /api/{recurso}"
```

---

## BLOQUE 3: DIRECTIVAS A SEGUIR

### Principios (OBLIGATORIO leer)
```yaml
siempre_leer:
  - core/orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
  - core/orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md
  - core/orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md
```

### SIMCO Específicos (según tarea)
```yaml
# Ajustar según la tarea delegada
operacion: "{REUTILIZAR | CREAR | MODIFICAR | VALIDAR}"  # 🆕 REUTILIZAR si existe en catálogo
dominio: "{DDL | BACKEND | FRONTEND}"

leer_simco:
  - core/orchestration/directivas/simco/SIMCO-REUTILIZAR.md  # 🆕 SI existe en catálogo
  - core/orchestration/directivas/simco/SIMCO-{OPERACION}.md
  - core/orchestration/directivas/simco/SIMCO-{DOMINIO}.md

# Referencias del catálogo (si aplica)
catalogo:
  funcionalidad: "{auth | session | rate-limiting | ...}"
  path: "shared/catalog/{funcionalidad}/"
  readme: "shared/catalog/{funcionalidad}/README.md"
```

---

## BLOQUE 4: TAREA ESPECÍFICA

### Descripción de la Tarea
```yaml
tarea: "{Descripción clara y específica}"
objetivo: "{Qué debe lograr}"
alcance: "{Qué incluye y qué NO incluye}"
```

### Archivos a Crear/Modificar
```yaml
archivos_esperados:
  - path: "{ruta/archivo1.ext}"
    tipo: "crear | modificar"
    descripcion: "{qué es este archivo}"

  - path: "{ruta/archivo2.ext}"
    tipo: "crear | modificar"
    descripcion: "{qué es este archivo}"
```

### Documentación de Referencia
```yaml
# Documentos que DEBE consultar antes de implementar
docs_obligatorios:
  - path: "projects/{PROYECTO}/docs/{documento1}.md"
    proposito: "{qué contiene}"

  - path: "projects/{PROYECTO}/docs/{documento2}.md"
    proposito: "{qué contiene}"
```

### Código de Referencia
```yaml
# 🆕 PRIMERO: Verificar catálogo global
catalogo_global:
  - path: "shared/catalog/{funcionalidad}/"
    usar_si: "Funcionalidad existe en CATALOG-INDEX.yml"
    nota: "Usar SIMCO-REUTILIZAR.md para adaptar"

# Código existente en el proyecto que debe usar como patrón
patrones_a_seguir:
  - path: "{ruta/codigo_similar}"
    usar_para: "{qué copiar de aquí}"
```

---

## BLOQUE 5: DEPENDENCIAS

### Pre-requisitos (DEBEN existir)
```yaml
dependencias:
  - tipo: "tabla"
    nombre: "{schema}.{tabla}"
    verificar_en: "@INV_DB"
    si_no_existe: "ERROR - No continuar"

  - tipo: "entity"
    nombre: "{EntityName}"
    verificar_en: "@INV_BE"
    si_no_existe: "ERROR - No continuar"
```

### Post-requisitos (crear DESPUÉS de esta tarea)
```yaml
crear_despues:
  - tipo: "entity"
    nombre: "{EntityName}"
    agente: "Backend-Agent"
    nota: "Informar al completar DDL"
```

---

## BLOQUE 6: CRITERIOS DE ACEPTACIÓN

### Funcionales
```yaml
criterios_funcionales:
  - [ ] "{Criterio 1 específico}"
  - [ ] "{Criterio 2 específico}"
  - [ ] "{Criterio 3 específico}"
```

### Técnicos
```yaml
criterios_tecnicos:
  - [ ] Verificó @CATALOG antes de crear  # 🆕
  - [ ] Si usó catálogo: adaptó correctamente sin romper estructura
  - [ ] Nomenclatura sigue convenciones del proyecto
  - [ ] Documentación inline completa (COMMENT ON / JSDoc)
  - [ ] Sin código duplicado
  - [ ] Alineado con DDL/DTOs existentes
```

### Validaciones Obligatorias
```yaml
validaciones:
  database:
    - [ ] Carga limpia pasa (./{RECREATE_CMD})
    - [ ] Estructura verificada (\dt, \di)

  backend:
    - [ ] npm run build pasa
    - [ ] npm run lint pasa
    - [ ] npm run test pasa (si hay tests)

  frontend:
    - [ ] npm run build pasa
    - [ ] npm run lint pasa
    - [ ] npm run typecheck pasa
```

---

## BLOQUE 7: ENTREGABLES

### Al Completar, Reportar
```yaml
reporte_entrega:
  archivos_creados:
    - "{lista de archivos}"

  archivos_modificados:
    - "{lista de archivos}"

  validaciones_ejecutadas:
    - "{validación}: {PASS | FAIL}"

  inventario_actualizado:
    - "{inventario}: {sí | no}"

  traza_actualizada:
    - "{traza}: {sí | no}"

  siguiente_paso_recomendado:
    - "{qué debe hacer el siguiente agente}"
```

### Formato de Respuesta
```markdown
## ENTREGA: {TAREA}

### Archivos Creados
- `{ruta/archivo}`: {descripción breve}

### Validaciones
- Build: ✅ PASS
- Lint: ✅ PASS
- {Otra}: ✅ PASS

### Inventario Actualizado
- {INVENTORY}.yml: ✅

### Siguiente Paso
{Descripción de qué sigue}
```

---

## BLOQUE 8: RESTRICCIONES

### NO Hacer
```yaml
prohibido:
  - NO crear archivos fuera del alcance definido
  - NO modificar código no relacionado con la tarea
  - NO saltarse validaciones
  - NO asumir sin verificar en docs/
  - NO dejar build roto
  - NO crear duplicados
```

### Escalar Si
```yaml
escalar_a_orquestador:
  - Si encuentro conflicto con código existente
  - Si la especificación es ambigua
  - Si necesito crear algo fuera del alcance
  - Si las dependencias no existen
```

# ═══════════════════════════════════════════════════════════════
# FIN DEL TEMPLATE
# ═══════════════════════════════════════════════════════════════
```

---

## EJEMPLO COMPLETO: Delegación a Database-Agent

```markdown
# ═══════════════════════════════════════════════════════════════
# DELEGACIÓN A SUBAGENTE: Database-Agent
# ═══════════════════════════════════════════════════════════════

## BLOQUE 1: IDENTIDAD Y CONTEXTO

### Identidad del Subagente
```yaml
perfil: "DATABASE"
proyecto: "trading-platform"
workspace: "/home/isem/workspace"
```

### Protocolo de Inicialización
```
Serás Database-Agent trabajando en el proyecto trading-platform
para realizar: Crear tabla notifications en schema notification_system

ANTES de actuar, ejecuta el protocolo CCA:
1. Lee core/orchestration/directivas/simco/SIMCO-INICIALIZACION.md
2. Sigue los pasos de carga de contexto
3. Confirma "READY_TO_EXECUTE" antes de implementar
```

---

## BLOQUE 2: CONTEXTO HEREDADO

### Variables Resueltas
```yaml
DB_NAME: "orbiquant_trading"
DB_DDL_PATH: "apps/database/ddl"
DB_SCRIPTS_PATH: "apps/database"
DB_SEEDS_PATH: "apps/database/seeds"
RECREATE_CMD: "drop-and-recreate-database.sh"
```

### Alias Resueltos
```yaml
@DDL: "apps/database/ddl/schemas/"
@SEEDS: "apps/database/seeds/"
@DB_SCRIPTS: "apps/database/"
@INV_DB: "projects/trading-platform/orchestration/inventarios/DATABASE_INVENTORY.yml"
```

### Estado Actual
```yaml
schemas_existentes:
  - auth_management
  - trading_core
  - notification_system  # Ya existe, agregar tabla aquí

tablas_en_notification_system:
  - notification_templates
  - notification_preferences
  # notifications NO existe - crear
```

---

## BLOQUE 3: DIRECTIVAS

### Principios
```yaml
siempre_leer:
  - core/orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
  - core/orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md
  - core/orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md
```

### SIMCO
```yaml
operacion: "CREAR"
dominio: "DDL"
leer_simco:
  - core/orchestration/directivas/simco/SIMCO-CREAR.md
  - core/orchestration/directivas/simco/SIMCO-DDL.md
```

---

## BLOQUE 4: TAREA

### Descripción
```yaml
tarea: "Crear tabla notifications"
objetivo: "Almacenar notificaciones del sistema para usuarios"
alcance: "Solo la tabla, NO seeds ni funciones adicionales"
```

### Archivos a Crear
```yaml
archivos_esperados:
  - path: "apps/database/ddl/schemas/notification_system/05-notifications.sql"
    tipo: "crear"
    descripcion: "DDL de la tabla notifications"
```

### Documentación de Referencia
```yaml
docs_obligatorios:
  - path: "projects/trading-platform/docs/01-fase-mvp/notificaciones.md"
    proposito: "Especificación de campos y tipos"
```

### Código de Referencia
```yaml
patrones_a_seguir:
  - path: "apps/database/ddl/schemas/notification_system/02-notification_templates.sql"
    usar_para: "Convenciones de nomenclatura, estructura, COMMENT ON"
```

---

## BLOQUE 5: DEPENDENCIAS

### Pre-requisitos
```yaml
dependencias:
  - tipo: "schema"
    nombre: "notification_system"
    verificar_en: "apps/database/ddl/00-init.sql"
    si_no_existe: "ERROR - Schema debe existir"

  - tipo: "tabla"
    nombre: "auth_management.users"
    verificar_en: "@INV_DB"
    si_no_existe: "ERROR - FK a users"
```

### Post-requisitos
```yaml
crear_despues:
  - tipo: "entity"
    nombre: "NotificationEntity"
    agente: "Backend-Agent"
    nota: "Informar al completar para crear Entity alineada"
```

---

## BLOQUE 6: CRITERIOS DE ACEPTACIÓN

### Funcionales
```yaml
criterios_funcionales:
  - [ ] Tabla tiene campos: id, user_id, type, title, message, read, created_at
  - [ ] FK a auth_management.users funciona
  - [ ] Índice en user_id para queries frecuentes
```

### Técnicos
```yaml
criterios_tecnicos:
  - [ ] snake_case en todos los nombres
  - [ ] COMMENT ON en tabla y columnas
  - [ ] UUID para id usando gen_random_uuid()
  - [ ] Timestamps con timezone
```

### Validaciones
```yaml
validaciones:
  database:
    - [ ] ./drop-and-recreate-database.sh pasa
    - [ ] psql -d orbiquant_trading -c "\d notification_system.notifications" muestra estructura
```

---

## BLOQUE 7: ENTREGABLES

### Al Completar
```yaml
reporte_entrega:
  archivos_creados:
    - apps/database/ddl/schemas/notification_system/05-notifications.sql

  validaciones_ejecutadas:
    - "Carga limpia: PASS"

  inventario_actualizado:
    - "DATABASE_INVENTORY.yml: sí"

  siguiente_paso_recomendado:
    - "Backend-Agent debe crear NotificationEntity alineada con este DDL"
```

---

## BLOQUE 8: RESTRICCIONES

### NO Hacer
```yaml
prohibido:
  - NO crear seeds (solo DDL)
  - NO crear funciones/triggers (solo tabla)
  - NO modificar otras tablas
  - NO crear Entity (es tarea de Backend-Agent)
```

# ═══════════════════════════════════════════════════════════════
```

---

## EJEMPLO: Delegación a Backend-Agent

```markdown
# ═══════════════════════════════════════════════════════════════
# DELEGACIÓN A SUBAGENTE: Backend-Agent
# ═══════════════════════════════════════════════════════════════

## BLOQUE 1: IDENTIDAD

```yaml
perfil: "BACKEND"
proyecto: "trading-platform"
workspace: "/home/isem/workspace"
```

### Protocolo
```
Serás Backend-Agent trabajando en el proyecto trading-platform
para realizar: Crear módulo de notificaciones con Entity, Service, Controller y DTOs

ANTES de actuar, ejecuta el protocolo CCA.
```

---

## BLOQUE 2: CONTEXTO HEREDADO

```yaml
BACKEND_ROOT: "apps/backend"
BACKEND_SRC: "apps/backend/src"

@BACKEND: "apps/backend/src/modules/"
@INV_BE: "projects/trading-platform/orchestration/inventarios/BACKEND_INVENTORY.yml"
@INV_DB: "projects/trading-platform/orchestration/inventarios/DATABASE_INVENTORY.yml"
```

### DDL de Referencia (CRÍTICO)
```sql
-- Tabla notification_system.notifications
-- Copiar estructura exacta del DDL para alinear Entity
CREATE TABLE notification_system.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_management.users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## BLOQUE 3: DIRECTIVAS

```yaml
leer_simco:
  - SIMCO-CREAR.md
  - SIMCO-BACKEND.md
```

---

## BLOQUE 4: TAREA

```yaml
tarea: "Crear módulo notifications completo"
alcance:
  - NotificationEntity (alineada con DDL)
  - NotificationService (CRUD básico)
  - NotificationController (endpoints REST)
  - CreateNotificationDto, UpdateNotificationDto, NotificationResponseDto
```

### Archivos a Crear
```yaml
archivos_esperados:
  - apps/backend/src/modules/notifications/notification.entity.ts
  - apps/backend/src/modules/notifications/notification.service.ts
  - apps/backend/src/modules/notifications/notification.controller.ts
  - apps/backend/src/modules/notifications/dto/create-notification.dto.ts
  - apps/backend/src/modules/notifications/dto/update-notification.dto.ts
  - apps/backend/src/modules/notifications/dto/notification-response.dto.ts
  - apps/backend/src/modules/notifications/notification.module.ts
```

---

## BLOQUE 5: DEPENDENCIAS

```yaml
dependencias:
  - tipo: "tabla"
    nombre: "notification_system.notifications"
    verificar_en: "@INV_DB"
    si_no_existe: "ERROR - Delegar a Database-Agent primero"
```

---

## BLOQUE 6: CRITERIOS

```yaml
criterios_funcionales:
  - [ ] Entity tiene EXACTAMENTE los mismos campos que DDL
  - [ ] Tipos TypeScript coinciden con PostgreSQL
  - [ ] Endpoints: GET /notifications, GET /notifications/:id, POST, PATCH, DELETE

validaciones:
  backend:
    - [ ] npm run build pasa
    - [ ] npm run lint pasa
```

---

## BLOQUE 8: RESTRICCIONES

```yaml
prohibido:
  - NO modificar DDL (ya existe)
  - NO crear componentes frontend
  - NO agregar campos que no estén en DDL
```

# ═══════════════════════════════════════════════════════════════
```

---

## CHECKLIST PARA EL ORQUESTADOR

Antes de enviar delegación, verificar:

```markdown
- [ ] 🆕 Verificó @CATALOG para funcionalidades existentes
- [ ] 🆕 Si existe en catálogo: incluyó instrucción de usar @REUTILIZAR
- [ ] Perfil correcto identificado
- [ ] Variables del proyecto incluidas
- [ ] Alias resueltos incluidos
- [ ] Estado actual del proyecto documentado
- [ ] Directivas SIMCO especificadas
- [ ] Tarea claramente definida
- [ ] Archivos esperados listados
- [ ] Documentación de referencia incluida
- [ ] Dependencias verificadas (existen)
- [ ] Criterios de aceptación definidos
- [ ] Validaciones requeridas especificadas
- [ ] Restricciones claras
```

---

**Versión:** 1.1.0 | **Sistema:** SIMCO-CCA + Catálogo | **Tipo:** Template de Delegación
