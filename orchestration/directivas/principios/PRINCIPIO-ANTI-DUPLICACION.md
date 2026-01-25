# PRINCIPIO: ANTI-DUPLICACIÓN

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los agentes sin excepción

---

## DECLARACIÓN DEL PRINCIPIO

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║       ANTES DE CREAR, VERIFICAR QUE NO EXISTE                        ║
║                                                                       ║
║  "Un duplicado creado es tiempo perdido y confusión garantizada."    ║
║  "2 minutos de verificación ahorran horas de corrección."            ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## REGLA DE ORO

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   NUNCA crear un objeto (tabla, entity, componente, etc.)           │
│   sin antes verificar que NO existe algo igual o similar.            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PROCESO DE VERIFICACIÓN

### Paso 0: Consultar Catálogo de Funcionalidades (NUEVO - OBLIGATORIO)

```bash
# 🆕 PRIMERO: Verificar si existe funcionalidad en catálogo global
grep -i "{funcionalidad}" @CATALOG_INDEX

# Funcionalidades comunes ya catalogadas:
# - auth (login, registro, JWT)
# - session-management (sesiones, dispositivos)
# - rate-limiting (throttle, 429)
# - notifications (email, push)
# - multi-tenancy (tenant, RLS)
# - feature-flags (toggles)
# - websocket (realtime)
# - payments (stripe)
```

**Si encuentra en @CATALOG:**
```
✅ USAR CÓDIGO DEL CATÁLOGO
1. Ir a @CATALOG/{funcionalidad}/
2. Leer README.md (descripción y trade-offs)
3. Seguir IMPLEMENTATION.md (pasos)
4. Copiar _reference/ (código base)
5. Adaptar configuración al proyecto

Ver: @REUTILIZAR (SIMCO-REUTILIZAR.md)
```

### Paso 1: Consultar Inventario del Proyecto
```bash
# Buscar en inventario maestro
grep -i "{nombre}" @INVENTORY

# Buscar en inventario específico
grep -i "{nombre}" @INV_DB   # Para database
grep -i "{nombre}" @INV_BE   # Para backend
grep -i "{nombre}" @INV_FE   # Para frontend
```

### Paso 2: Buscar en Código
```bash
# Buscar archivos con nombre similar
find apps/ -name "*{nombre}*" -type f

# Buscar definiciones en código
grep -rn "CREATE TABLE.*{nombre}" apps/
grep -rn "class {Nombre}" apps/
grep -rn "export.*{Nombre}" apps/
```

### Paso 3: Evaluar Resultado

| Resultado | Acción |
|-----------|--------|
| Existe en @CATALOG | ✅ REUTILIZAR del catálogo (ver @REUTILIZAR) |
| No encontrado | ✅ Proceder a crear |
| Encontrado idéntico | 🛑 DETENER - No crear, usar existente |
| Encontrado similar | ⚠️ PREGUNTAR - ¿Modificar existente o crear diferente? |

---

## QUÉ VERIFICAR POR TIPO

### Database (DDL)
```bash
# Verificar tabla
grep -rn "CREATE TABLE.*{nombre}" @DDL_ROOT
grep -i "{nombre}" @INV_DB

# Verificar schema
grep -rn "CREATE SCHEMA.*{nombre}" @DDL_ROOT

# Verificar función
grep -rn "CREATE.*FUNCTION.*{nombre}" @DDL_ROOT
```

### Backend (NestJS)
```bash
# Verificar entity
find @BACKEND -name "*{nombre}*.entity.ts"
grep -rn "class {Nombre}Entity" @BACKEND

# Verificar service
find @BACKEND -name "*{nombre}*.service.ts"
grep -rn "class {Nombre}Service" @BACKEND

# Verificar controller
find @BACKEND -name "*{nombre}*.controller.ts"
```

### Frontend (React)
```bash
# Verificar componente
find @FRONTEND -name "*{Nombre}*.tsx"
grep -rn "export.*{Nombre}" @FRONTEND_ROOT

# Verificar hook
find @FRONTEND -name "use{Nombre}*.ts"

# Verificar type
grep -rn "interface {Nombre}\|type {Nombre}" @FRONTEND_ROOT
```

---

## SI ENCUENTRAS DUPLICADO

### Duplicado Exacto
```markdown
🛑 DETENER INMEDIATAMENTE

El objeto `{nombre}` YA EXISTE:
- **Ubicación:** {ruta}
- **Inventario:** {línea en inventario}
- **Estado:** {estado}

**Acción:** Usar el existente, NO crear nuevo.

**Si necesitas modificarlo:**
Ver @MODIFICAR (SIMCO-MODIFICAR.md)
```

### Objeto Similar
```markdown
⚠️ OBJETO SIMILAR ENCONTRADO

Encontré `{nombre_similar}` que podría ser lo mismo:
- **Ubicación:** {ruta}
- **Propósito:** {descripción}

**Preguntas a resolver:**
1. ¿Es el mismo objeto con diferente nombre?
2. ¿Debo modificar el existente?
3. ¿Son diferentes y debo crear con otro nombre?

ESPERAR CLARIFICACIÓN antes de proceder.
```

---

## CONSECUENCIAS DE DUPLICAR

```
❌ Confusión sobre cuál usar
   → Diferentes partes del código usan diferentes versiones

❌ Mantenimiento duplicado
   → Cambios deben hacerse en múltiples lugares

❌ Bugs por inconsistencia
   → Un objeto se actualiza, el duplicado no

❌ Inventarios incorrectos
   → Estado del proyecto confuso

❌ Tiempo perdido
   → Trabajo que hay que deshacer
```

---

## PREVENCIÓN PROACTIVA

### Al Planificar
```markdown
ANTES de diseñar nuevo objeto:
1. [ ] Busqué en inventarios
2. [ ] Busqué en código
3. [ ] Confirmé que no existe
```

### Al Crear
```markdown
DURANTE creación de objeto:
1. [ ] Nombre no colisiona con existente
2. [ ] Ubicación es única
3. [ ] Propósito no está cubierto por otro objeto
```

### Al Completar
```markdown
DESPUÉS de crear:
1. [ ] Actualicé inventario
2. [ ] No hay advertencias de duplicados
```

---

## CASOS ESPECIALES

### ¿Qué pasa si necesito algo PARECIDO pero diferente?

```markdown
Ejemplo: Existe `UserEntity`, necesito `AdminUserEntity`

Verificar:
1. ¿Es una extensión? → Heredar/extender existente
2. ¿Es un caso especial? → Agregar campo al existente
3. ¿Es realmente diferente? → Crear nuevo con nombre claro

Nombrar claramente:
- ❌ `User2Entity` (confuso)
- ✅ `AdminUserEntity` (claro y diferenciado)
```

### ¿Qué pasa si el existente está mal?

```markdown
Si el objeto existente tiene problemas:
1. Documentar los problemas
2. Decidir: ¿Corregir existente o reemplazar?
3. Si reemplazar: eliminar viejo completamente
4. NUNCA tener ambos coexistiendo
```

---

## CHECKLIST RÁPIDO

```
Antes de crear CUALQUIER objeto:
[ ] 🆕 Busqué funcionalidad en @CATALOG_INDEX (PRIMERO)
[ ] Busqué "{nombre}" en @INVENTORY
[ ] Busqué archivos con find
[ ] Busqué definiciones con grep
[ ] Confirmé que NO existe en catálogo NI en proyecto
[ ] Si existe en catálogo, seguí @REUTILIZAR
[ ] Si existe similar, pregunté qué hacer
```

---

## REFERENCIAS SIMCO

- **@CATALOG** - Catálogo de funcionalidades reutilizables (CONSULTAR PRIMERO)
- **@REUTILIZAR** - Proceso para reutilizar del catálogo
- **@CREAR** - Proceso completo de creación (incluye verificación)
- **@BUSCAR** - Estrategias de búsqueda
- **@DOCUMENTAR** - Actualización de inventarios

---

**Este principio es OBLIGATORIO y NO puede ser ignorado por ningún agente.**

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Principio Fundamental
