# SIMCO: BUSCAR Y EXPLORAR

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** TODO agente que necesite localizar archivos, código o información
**Prioridad:** RECOMENDADA

---

## RESUMEN EJECUTIVO

> **Antes de crear, BUSCA. Antes de preguntar, EXPLORA.**
> Este documento proporciona estrategias eficientes para encontrar información en el workspace.

---

## ESTRATEGIAS DE BÚSQUEDA

### 0. Búsqueda en Catálogo de Funcionalidades (PRIMERO)

**ANTES de buscar en código del proyecto, verificar si existe funcionalidad probada en @CATALOG:**

```bash
# Buscar en catálogo de funcionalidades reutilizables
grep -i "{funcionalidad}" @CATALOG_INDEX

# Funcionalidades catalogadas:
# - auth, session, rate-limiting, notifications
# - multi-tenancy, feature-flags, websocket, payments

# Si encuentra en catálogo → Usar @REUTILIZAR
# Si NO encuentra → Continuar con búsqueda normal
```

**Alias del catálogo:**
```bash
@CATALOG         → shared/catalog/
@CATALOG_INDEX   → shared/catalog/CATALOG-INDEX.yml
@CATALOG_AUTH    → shared/catalog/auth/
@CATALOG_SESSION → shared/catalog/session-management/
# ... ver @ALIASES para lista completa
```

---

### 1. Búsqueda por Alias (Más Rápida)

Usar los alias definidos en @ALIASES para navegación directa:

```bash
# Alias de ubicaciones frecuentes
@CATALOG       → shared/catalog/ (funcionalidades reutilizables)
@INVENTORY     → orchestration/inventarios/MASTER_INVENTORY.yml
@DDL           → {DB_DDL_PATH}/schemas/
@BACKEND       → {BACKEND_SRC}/modules/
@FRONTEND      → {FRONTEND_SRC}/apps/
@DOCS          → docs/
@GUIAS         → docs/95-guias-desarrollo/
```

### 2. Búsqueda en Inventarios (Anti-Duplicación)

**Para verificar si algo existe:**
```bash
# Buscar en inventario maestro
grep -i "{nombre}" @INVENTORY

# Buscar tabla específica
grep -A 5 "name: {tabla}" @INV_DB

# Buscar entity específica
grep -A 5 "name: {Entity}" @INV_BE

# Buscar componente específico
grep -A 5 "name: {Componente}" @INV_FE
```

### 3. Búsqueda en Código

**Buscar definiciones:**
```bash
# Buscar clase/tipo
grep -rn "class {Nombre}" apps/
grep -rn "interface {Nombre}" apps/
grep -rn "type {Nombre}" apps/

# Buscar función/método
grep -rn "function {nombre}" apps/
grep -rn "{nombre}(" apps/

# Buscar tabla SQL
grep -rn "CREATE TABLE.*{nombre}" @DDL_ROOT

# Buscar importaciones
grep -rn "import.*{Nombre}" apps/
```

**Buscar archivos:**
```bash
# Por nombre exacto
find apps/ -name "{nombre}.ts"
find apps/ -name "{nombre}.tsx"
find apps/ -name "{nombre}.sql"

# Por patrón
find apps/ -name "*{patron}*"
find apps/ -name "*.entity.ts"
find apps/ -name "*.service.ts"

# Por tipo
find apps/ -type f -name "*.md"
find apps/ -type d -name "{directorio}"
```

### 4. Búsqueda en Documentación

**Buscar en docs/:**
```bash
# Buscar término en documentación
grep -rn "{término}" docs/

# Buscar en guías de desarrollo
grep -rn "{término}" @GUIAS

# Buscar ADRs relacionados
grep -rn "{término}" @ADR

# Buscar especificaciones
grep -rn "{término}" docs/*/especificaciones/
```

**Buscar en orchestration/:**
```bash
# Buscar en directivas
grep -rn "{término}" @DIRECTIVAS

# Buscar en trazas
grep -rn "{término}" orchestration/trazas/

# Buscar en prompts
grep -rn "{término}" @PROMPTS
```

---

## CASOS DE USO COMUNES

### Caso 1: ¿Existe esta tabla?

```bash
# Paso 1: Buscar en inventario
grep -i "{nombre_tabla}" @INVENTORY

# Paso 2: Buscar DDL
find @DDL_ROOT -name "*{nombre}*.sql"
grep -rn "CREATE TABLE.*{nombre}" @DDL_ROOT

# Paso 3: Buscar entity relacionada
grep -rn "name: '{nombre}'" @BACKEND
```

### Caso 2: ¿Existe este componente?

```bash
# Paso 1: Buscar en inventario
grep -i "{NombreComponente}" @INV_FE

# Paso 2: Buscar archivo
find @FRONTEND_ROOT -name "*{Nombre}*"

# Paso 3: Buscar importaciones
grep -rn "import.*{Nombre}" @FRONTEND_ROOT
```

### Caso 3: ¿Dónde se usa esta función/método?

```bash
# Buscar invocaciones
grep -rn "{nombreFuncion}(" apps/

# Buscar importaciones
grep -rn "import.*{nombreFuncion}" apps/

# Ver contexto (5 líneas antes y después)
grep -rn -B 5 -A 5 "{nombreFuncion}" apps/
```

### Caso 4: ¿Qué endpoints tiene este módulo?

```bash
# Buscar en inventario
grep -A 20 "module: {modulo}" @INV_BE | grep -A 5 "endpoints"

# Buscar en controllers
grep -rn "@Get\|@Post\|@Put\|@Delete" @BACKEND/{modulo}/controllers/

# Buscar decoradores de ruta
grep -rn "@Controller" @BACKEND/{modulo}/
```

### Caso 5: ¿Qué decisiones arquitectónicas hay sobre X?

```bash
# Buscar en ADRs
grep -rn "{término}" @ADR

# Listar ADRs
ls -la @ADR

# Buscar en documentación transversal
grep -rn "{término}" @DOCS_TRANSVERSAL
```

### Caso 6: ¿Hay directivas sobre X?

```bash
# Buscar en directivas
grep -rn "{término}" @DIRECTIVAS

# Buscar en SIMCO
grep -rn "{término}" @SIMCO

# Buscar en principios
grep -rn "{término}" @PRINCIPIOS
```

---

## BÚSQUEDA CROSS-PROJECT

### Navegar a Otro Proyecto

```bash
# Usando proyectos conocidos de @ALIASES
cd ~/workspace/projects/{proyecto}

# Verificar estructura
ls -la
ls -la docs/
ls -la orchestration/
```

### Buscar Patrones en Múltiples Proyectos

```bash
# Buscar en todos los proyectos
grep -rn "{patrón}" ~/workspace/projects/

# Buscar archivos similares
find ~/workspace/projects/ -name "{nombre}*"

# Comparar implementaciones
diff -r proyecto1/apps/backend/src/modules/{modulo} \
        proyecto2/apps/backend/src/modules/{modulo}
```

### Referenciar Implementación de Otro Proyecto

```markdown
## Referencia Cross-Project

Se tomó como referencia la implementación de `{módulo}` en proyecto `{proyecto}`:

**Ruta:** `~/workspace/projects/{proyecto}/apps/{capa}/...`

**Adaptaciones realizadas:**
- {cambio 1}
- {cambio 2}
```

---

## HERRAMIENTAS DE BÚSQUEDA

### grep (búsqueda de contenido)

```bash
# Básico
grep "{patrón}" {archivo}

# Recursivo
grep -r "{patrón}" {directorio}

# Con número de línea
grep -rn "{patrón}" {directorio}

# Case insensitive
grep -ri "{patrón}" {directorio}

# Con contexto (líneas antes/después)
grep -rn -B 3 -A 3 "{patrón}" {directorio}

# Solo nombres de archivos
grep -rl "{patrón}" {directorio}

# Excluir directorios
grep -rn --exclude-dir={node_modules,.git} "{patrón}" .

# Regex extendido
grep -rE "{regex}" {directorio}
```

### find (búsqueda de archivos)

```bash
# Por nombre
find {directorio} -name "{nombre}"

# Por patrón
find {directorio} -name "*{patrón}*"

# Por tipo (archivo/directorio)
find {directorio} -type f -name "*.ts"
find {directorio} -type d -name "{nombre}"

# Modificados recientemente
find {directorio} -mtime -1  # últimas 24h
find {directorio} -mmin -60  # últimos 60min

# Excluir directorios
find {directorio} -name "*.ts" -not -path "*/node_modules/*"
```

### Combinaciones Útiles

```bash
# Encontrar archivos y buscar contenido
find apps/ -name "*.ts" -exec grep -l "{patrón}" {} \;

# Contar ocurrencias por archivo
grep -rc "{patrón}" apps/ | grep -v ":0$"

# Buscar y abrir en editor (si disponible)
grep -rl "{patrón}" apps/ | xargs code

# Buscar TODO/FIXME pendientes
grep -rn "TODO\|FIXME" apps/
```

---

## ÍNDICES Y MAPAS

### Archivos _MAP.md

Los directorios con múltiples archivos tienen un `_MAP.md` de navegación:

```bash
# Encontrar todos los mapas
find . -name "_MAP.md"

# Leer mapa de directivas
cat @DIRECTIVAS/_MAP.md

# Leer mapa de agentes
cat @PROMPTS/_MAP.md
```

### Estructura de Navegación

```
orchestration/
├── _MAP.md              # Índice general de orchestration
├── directivas/
│   └── _MAP.md          # Índice de directivas
├── agents/
│   └── _MAP.md          # Índice de agentes
└── templates/
    └── _MAP.md          # Índice de templates

docs/
├── README.md            # Índice maestro de docs
├── 00-vision-general/
│   └── _MAP.md
└── ...
```

---

## OPTIMIZACIÓN DE BÚSQUEDAS

### Orden Recomendado

1. **Primero:** Buscar en inventarios (@INVENTORY)
2. **Segundo:** Buscar en índices (_MAP.md)
3. **Tercero:** Buscar en código (grep/find)
4. **Cuarto:** Buscar en documentación (docs/)

### Evitar Búsquedas Innecesarias

```bash
# Excluir siempre
--exclude-dir=node_modules
--exclude-dir=dist
--exclude-dir=build
--exclude-dir=.git
--exclude-dir=coverage

# Comando optimizado
grep -rn --exclude-dir={node_modules,dist,build,.git,coverage} "{patrón}" .
```

### Cache Mental

Mantener presente:
- Estructura de `docs/` (por fases)
- Estructura de `orchestration/` (inventarios, trazas, directivas)
- Estructura de `apps/` (database, backend, frontend)
- Aliases más usados (@INVENTORY, @DDL, @BACKEND, @FRONTEND)

---

## REFERENCIAS

- **Aliases:** @ALIASES
- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Documentar:** @DOCUMENTAR (SIMCO-DOCUMENTAR.md)

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
