# SIMCO: CREAR ARCHIVO

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** TODO agente que vaya a crear un archivo nuevo
**Prioridad:** OBLIGATORIA

---

## RESUMEN EJECUTIVO

> **Antes de crear cualquier archivo, VERIFICA que no exista y sigue las convenciones.**

---

## CHECKLIST RÁPIDO

```
ANTES DE CREAR
├── [ ] 0. 🆕 Verificar @CATALOG_INDEX → ¿Existe funcionalidad en catálogo?
│         Si existe → Seguir @REUTILIZAR en lugar de crear nuevo
├── [ ] 0.5 ⚙️ Consultar @PERFIL_DEVENV → ¿Involucra configuración?
│           Si es config (DB, puertos, env) → Verificar inventarios DevEnv
│           PostgreSQL: 5432 (instancia única compartida)
│           Redis: 6379 (instancia única, DB 0-15 por proyecto)
├── [ ] 1. Verificar @INVENTORY → ¿Ya existe objeto similar en proyecto?
├── [ ] 2. Buscar con grep/find → ¿Archivo duplicado?
├── [ ] 3. Identificar ubicación correcta según tipo
└── [ ] 4. Leer template/referencia si existe

DURANTE CREACIÓN
├── [ ] 5. Seguir convenciones de nomenclatura
├── [ ] 6. Incluir encabezado estándar
└── [ ] 7. Documentar inline (comentarios)

DESPUÉS DE CREAR
├── [ ] 8. Validar localmente (compilar/ejecutar)
├── [ ] 9. Actualizar inventario correspondiente
└── [ ] 10. Actualizar traza correspondiente
```

---

## FASE 0: VERIFICAR CATÁLOGO (NUEVO - OBLIGATORIO)

### 0.1 Consultar Catálogo de Funcionalidades

**ANTES de crear cualquier funcionalidad común, verificar si existe en el catálogo:**

```bash
# Buscar en índice del catálogo
grep -i "{funcionalidad}" @CATALOG_INDEX

# Funcionalidades catalogadas:
# - auth (login, registro, JWT, OAuth)
# - session-management (sesiones concurrentes, dispositivos)
# - rate-limiting (throttle, 429)
# - notifications (email, push, in-app)
# - multi-tenancy (tenant, RLS)
# - feature-flags (toggles dinámicos)
# - websocket (realtime, streaming)
# - payments (Stripe, suscripciones)
```

**Si encuentra en @CATALOG:**
```
🛑 NO CREAR NUEVO - REUTILIZAR DEL CATÁLOGO

1. Ir a: shared/catalog/{funcionalidad}/
2. Leer: README.md (descripción y trade-offs)
3. Seguir: IMPLEMENTATION.md (pasos detallados)
4. Copiar: _reference/ (código base)
5. Adaptar: configuración al proyecto actual

Ver directiva completa: @REUTILIZAR (SIMCO-REUTILIZAR.md)
```

**Si NO encuentra en @CATALOG:**
```
✅ Continuar con Fase 0.5 (consulta DevEnv) o Fase 1 (crear nuevo)
```

---

## FASE 0.5: CONSULTA DEVENV (OBLIGATORIO PARA CONFIGURACIONES)

### 0.5.1 Cuándo Consultar a DevEnv

**OBLIGATORIO consultar a @PERFIL_DEVENV cuando el archivo involucre:**
- Configuración de base de datos (puertos, usuarios, nombres BD)
- Variables de entorno (.env, docker-compose)
- Configuración de servicios externos (Redis, cache)
- Puertos de aplicación (API, Frontend, servicios)
- Configuración de ambiente (dev, qa, prod)

### 0.5.2 Arquitectura de Infraestructura Compartida

> **IMPORTANTE**: El workspace utiliza infraestructura compartida, NO instancias separadas.

```yaml
# ARQUITECTURA CORRECTA (instancia única compartida)
postgresql:
  puerto: 5432          # UNICA instancia para TODOS los proyectos
  separacion: "database + user por proyecto"

redis:
  puerto: 6379          # UNICA instancia para TODOS los proyectos
  separacion: "database number (0-15) por proyecto"

# INCORRECTO: NO crear instancias adicionales
# postgresql_proyecto_x: 5433  ❌ INCORRECTO
# redis_proyecto_y: 6380       ❌ INCORRECTO
```

### 0.5.3 Proceso de Consulta

```
1. VERIFICAR asignaciones existentes:
   - Consultar: @DEVENV_PORTS_INVENTORY
   - Consultar: @DEVENV_MASTER_INVENTORY

2. SOLICITAR asignación (si nuevo proyecto):
   - Nombre de base de datos
   - Usuario de base de datos
   - Número de Redis DB (0-15)
   - Puertos de aplicación

3. DOCUMENTAR en el proyecto:
   - Crear/actualizar: orchestration/environment/ENVIRONMENT-INVENTORY.yml
   - Incluir comentarios de instancia compartida
```

### 0.5.4 Ejemplo de Configuración Correcta

```yaml
# .env del proyecto
DB_HOST=localhost
DB_PORT=5432                    # Instancia compartida
DB_NAME=miproyecto_dev          # Separación por nombre
DB_USER=miproyecto_dev          # Separación por usuario

REDIS_HOST=localhost
REDIS_PORT=6379                 # Instancia compartida
REDIS_DB=5                      # Separación por DB number
```

### 0.5.5 Si NO Consulta DevEnv

```
⚠️  ADVERTENCIA: Omitir consulta DevEnv puede causar:
- Conflictos de puertos entre proyectos
- Bases de datos duplicadas
- Configuraciones inconsistentes
- Problemas en ambiente compartido

🛑 Las correcciones serán requeridas posteriormente.
```

---

## FASE 1: ANTES DE CREAR

### 1.1 Verificación Anti-Duplicación (OBLIGATORIO)

**Consultar inventario:**
```bash
# Verificar en inventario maestro
grep -i "{nombre_objeto}" @INVENTORY

# Si es base de datos
grep -i "{nombre_tabla}" @INV_DB

# Si es backend
grep -i "{nombre_entity}" @INV_BE

# Si es frontend
grep -i "{nombre_componente}" @INV_FE
```

**Buscar en código:**
```bash
# Buscar archivos similares
find apps/ -name "*{nombre}*" -type f

# Buscar contenido similar
grep -rn "CREATE TABLE.*{nombre}" @DDL_ROOT
grep -rn "class {Nombre}" @BACKEND
grep -rn "export.*{Nombre}" @FRONTEND
```

**Si encuentras duplicado:**
```
🛑 DETENER INMEDIATAMENTE

Reportar:
- Objeto existente: {ubicación}
- Objeto que iba a crear: {ubicación propuesta}
- Pregunta: ¿Modificar existente o crear nuevo con diferente nombre?

NO CONTINUAR sin clarificación.
```

### 1.2 Identificar Ubicación Correcta

| Tipo de Archivo | Ubicación (@ALIAS) | Patrón de Nombre |
|-----------------|-------------------|------------------|
| Tabla DDL | @DDL/{schema}/tables/ | `{NN}-{nombre}.sql` |
| Function DDL | @DDL/{schema}/functions/ | `{nombre}.sql` |
| Trigger DDL | @DDL/{schema}/triggers/ | `trg_{tabla}_{accion}.sql` |
| Seed Dev | @SEEDS_DEV | `{NN}-{nombre}.sql` |
| Entity Backend | @BACKEND/{modulo}/entities/ | `{nombre}.entity.ts` |
| Service Backend | @BACKEND/{modulo}/services/ | `{nombre}.service.ts` |
| Controller Backend | @BACKEND/{modulo}/controllers/ | `{nombre}.controller.ts` |
| DTO Backend | @BACKEND/{modulo}/dto/ | `{accion}-{nombre}.dto.ts` |
| Componente Frontend | @FRONTEND/{app}/components/ | `{Nombre}.tsx` |
| Página Frontend | @FRONTEND/{app}/pages/ | `{Nombre}Page.tsx` |
| Hook Frontend | @FRONTEND/{app}/hooks/ | `use{Nombre}.ts` |

### 1.3 Leer Referencias

**Antes de crear, lee un archivo similar existente:**
```bash
# Para DDL: leer tabla existente del mismo schema
cat @DDL/{schema}/tables/01-*.sql | head -100

# Para Entity: leer entity existente del módulo
cat @BACKEND/{modulo}/entities/*.entity.ts | head -100

# Para Componente: leer componente similar
cat @FRONTEND/{app}/components/*.tsx | head -100
```

**Extraer de la referencia:**
- Formato de encabezado
- Estilo de comentarios
- Convenciones de imports
- Estructura general

---

## FASE 2: DURANTE CREACIÓN

### 2.1 Encabezados Estándar

**Para archivos SQL:**
```sql
-- ============================================================================
-- {Tipo}: {nombre}
-- Schema: {schema}
-- Descripción: {descripción breve}
-- Autor: {Agente}
-- Fecha: {YYYY-MM-DD}
-- Dependencias: {lista o "Ninguna"}
-- ============================================================================
```

**Para archivos TypeScript (Backend):**
```typescript
/**
 * {Nombre} - {descripción breve}
 *
 * @description {descripción detallada}
 * @module {módulo}
 * @author {Agente}
 * @date {YYYY-MM-DD}
 * @see {referencia a DDL o especificación}
 */
```

**Para archivos TSX (Frontend):**
```typescript
/**
 * {NombreComponente}
 *
 * @description {descripción del componente}
 * @module {app/módulo}
 * @author {Agente}
 * @date {YYYY-MM-DD}
 */
```

### 2.2 Convenciones de Nomenclatura

**SQL (PostgreSQL):**
```sql
-- Schemas: snake_case
CREATE SCHEMA auth_management;

-- Tablas: snake_case, plural
CREATE TABLE users, student_progress, badges;

-- Columnas: snake_case
user_id, first_name, created_at

-- Índices: idx_{tabla}_{columna(s)}
CREATE INDEX idx_users_email ON users(email);

-- Foreign Keys: fk_{tabla}_to_{tabla_ref}
CONSTRAINT fk_students_to_users

-- Checks: chk_{tabla}_{columna}
CONSTRAINT chk_users_status

-- Triggers: trg_{tabla}_{accion}
CREATE TRIGGER trg_users_updated
```

**TypeScript (Backend):**
```typescript
// Entities: PascalCase + Entity suffix
UserEntity, StudentProgressEntity, BadgeEntity

// Services: PascalCase + Service suffix
UserService, GamificationService

// Controllers: PascalCase + Controller suffix
UserController, AuthController

// DTOs: PascalCase + Dto suffix
CreateUserDto, UpdateUserDto

// Métodos: camelCase
createUser(), findById()

// Constantes: UPPER_SNAKE_CASE
MAX_LOGIN_ATTEMPTS, DEFAULT_PAGE_SIZE
```

**TypeScript (Frontend):**
```typescript
// Componentes: PascalCase
UserProfile, LoginForm, Dashboard

// Hooks: use + PascalCase
useUser, useAuth, useDashboard

// Stores: camelCase + Store
userStore, authStore

// Types/Interfaces: PascalCase
User, AuthState, DashboardProps
```

### 2.3 Documentación Inline

**OBLIGATORIO incluir:**
- Comentarios en lógica compleja
- JSDoc/TSDoc en funciones públicas
- COMMENT ON en tablas y columnas SQL
- Descripción de props en componentes

---

## FASE 3: DESPUÉS DE CREAR

### 3.1 Validación Local (OBLIGATORIO)

**Para SQL:**
```bash
# Ejecutar DDL
psql -d {DB_NAME} -f {archivo.sql}

# Verificar estructura
psql -d {DB_NAME} -c "\d {schema}.{tabla}"
```

**Para Backend:**
```bash
cd @BACKEND_ROOT
npm run build    # DEBE pasar
npm run lint     # DEBE pasar
```

**Para Frontend:**
```bash
cd @FRONTEND_ROOT
npm run build    # DEBE pasar
npm run lint     # DEBE pasar
```

### 3.2 Actualizar Inventario (OBLIGATORIO)

**Agregar entrada en @INVENTORY:**
```yaml
# Ejemplo para tabla
database:
  schemas:
    {schema}:
      tables:
        - name: {nombre_tabla}
          file: @DDL/{schema}/tables/{archivo}.sql
          created_by: {Agente}
          fecha: {YYYY-MM-DD}
          status: "✅ Completo"

# Ejemplo para entity
backend:
  modules:
    {modulo}:
      entities:
        - name: {NombreEntity}
          file: @BACKEND/{modulo}/entities/{archivo}.ts
          related_table: {schema}.{tabla}
          created_by: {Agente}
          fecha: {YYYY-MM-DD}
          status: "✅ Completo"
```

### 3.3 Actualizar Traza (OBLIGATORIO)

**Agregar entrada en traza correspondiente:**
```markdown
## [{ID}] Crear {nombre}

**Fecha:** {YYYY-MM-DD HH:MM}
**Estado:** ✅ Completado
**Agente:** {Nombre-Agente}

### Archivos Creados
- `{ruta_completa_archivo}`

### Validaciones
- [x] Compilación exitosa
- [x] Inventario actualizado
- [x] Sin duplicados

### Notas
{observaciones relevantes}
```

---

## ERRORES COMUNES Y CÓMO EVITARLOS

| Error | Causa | Solución |
|-------|-------|----------|
| Duplicado creado | No verificó inventario | SIEMPRE verificar @INVENTORY primero |
| Ubicación incorrecta | No consultó alias | Usar tabla de ubicaciones arriba |
| Nombre incorrecto | No siguió convenciones | Revisar sección 2.2 |
| Build falla | No validó localmente | SIEMPRE ejecutar build antes de reportar |
| Inventario desactualizado | Olvidó actualizar | Incluir en checklist final |

---

## REFERENCIAS

- **Catálogo de funcionalidades:** @CATALOG (CONSULTAR PRIMERO)
- **Reutilización:** @REUTILIZAR (SIMCO-REUTILIZAR.md)
- **Convenciones completas:** @DIRECTIVAS/ESTANDARES-NOMENCLATURA-BASE.md
- **Validación:** @VALIDAR (SIMCO-VALIDAR.md)
- **Documentación:** @DOCUMENTAR (SIMCO-DOCUMENTAR.md)
- **Aliases:** @ALIASES
- **DevEnv - Perfil:** @PERFIL_DEVENV (PERFIL-DEVENV.md)
- **DevEnv - Puertos:** @DEVENV_PORTS_INVENTORY (orchestration/inventarios/DEVENV-PORTS-INVENTORY.yml)
- **DevEnv - Master:** @DEVENV_MASTER_INVENTORY (orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml)

---

**Versión:** 1.1.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
