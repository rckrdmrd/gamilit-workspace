# Políticas de Modularización - Principio PF-001

**Versión:** 1.0
**Fecha:** 2025-11-01
**Principio:** PF-001 Cascade (Cascada de Modularización)
**Regla Fundamental:** Ningún archivo debe exceder 400 líneas excepto excepciones permitidas

---

## 🎯 Principio PF-001: Cascade

**Definición:** Cuando un archivo excede 400 líneas, debe convertirse en una carpeta con múltiples archivos más pequeños, creando una "cascada" de modularización.

**Objetivo:** Mantener archivos navegables, evitar problemas de carga en editores, facilitar mantenimiento.

---

## 📏 Thresholds y Acciones

| Líneas | Estado | Acción Requerida | Prioridad |
|--------|--------|------------------|-----------|
| **0-400** | ✅ OK | No hacer nada | - |
| **401-800** | ⚠️ Advertencia | Dividir en 2 archivos | Media |
| **801-1,200** | 🔴 Crítico | Dividir en 3 archivos | Alta |
| **1,201-1,600** | 🔴 Crítico | Dividir en 4 archivos | Alta |
| **>1,600** | 🚨 BLOQUEANTE | Dividir en 5+ archivos | Crítica |

---

## ✅ Excepciones Permitidas

### 1. Documentación Completa

**Criterios:**
- Archivo markdown de referencia única
- Contiene tabla de contenidos
- Navegación clara con headers
- Ejemplo: `PLAN-MIGRACION-DATABASE-MODULAR.md` (580L)

**Máximo permitido:** 1,500 líneas

### 2. Archivos Generados Automáticamente

**Ejemplos:**
- `package-lock.json`
- `yarn.lock`
- Archivos compilados

**Máximo permitido:** Sin límite (no modificables manualmente)

### 3. Scripts de Migración SQL Consolidados

**Criterios:**
- Migration atómica (no se puede dividir)
- Secciones bien delimitadas con comentarios
- Solo si es absolutamente necesario

**Máximo permitido:** 600 líneas

---

## 🔧 Proceso de Modularización

### Paso 1: Analizar Estructura

```markdown
1. Abrir archivo a modularizar
2. Identificar secciones lógicas
3. Contar líneas por sección
4. Determinar número de archivos necesarios:
   - Total líneas / 350 = Número aproximado de archivos
   - Ejemplo: 800L / 350 = 2.3 → 3 archivos
```

### Paso 2: Crear Carpeta

```bash
# Ejemplo: Modularizar auth_schema.sql (800L)
mkdir auth_schema/
```

### Paso 3: Dividir Contenido

**Estrategias de división:**

#### A. Por Tipo (SQL)
```
auth_schema/ (800L)
├── 01-tables.sql (200L)
├── 02-views.sql (150L)
├── 03-functions.sql (250L)
└── 04-triggers.sql (200L)
```

#### B. Por Responsabilidad (TypeScript)
```
UserService.ts (900L)
├── UserService/
│   ├── user.service.core.ts (300L)      # CRUD básico
│   ├── user.service.auth.ts (250L)      # Autenticación
│   ├── user.service.permissions.ts (200L) # Permisos
│   └── user.service.validation.ts (150L) # Validaciones
```

#### C. Por Módulo (React)
```
Dashboard.tsx (1,200L)
├── Dashboard/
│   ├── DashboardLayout.tsx (200L)
│   ├── DashboardHeader.tsx (150L)
│   ├── DashboardStats.tsx (250L)
│   ├── DashboardCharts.tsx (300L)
│   ├── DashboardTable.tsx (200L)
│   └── DashboardFilters.tsx (100L)
```

### Paso 4: Crear _MAP.md

**Siempre crear _MAP.md en la carpeta resultante:**

```markdown
# Mapa: auth_schema

**Propósito:** DDL del esquema de autenticación
**Archivos totales:** 4
**Última actualización:** 2025-11-01

---

## Estructura

```
auth_schema/
├── _MAP.md
├── 01-tables.sql       # Tablas: users, sessions, tokens
├── 02-views.sql        # Vistas: active_users, user_stats
├── 03-functions.sql    # Funciones: validate_token, hash_password
└── 04-triggers.sql     # Triggers: update_timestamps
```

## Orden de Ejecución

1. `01-tables.sql` - Crear tablas base
2. `02-views.sql` - Crear vistas
3. `03-functions.sql` - Crear funciones
4. `04-triggers.sql` - Crear triggers
```

### Paso 5: Actualizar Referencias

```bash
# Buscar archivos que importan/incluyen el archivo original
grep -r "import.*auth_schema" . | grep -v node_modules

# Actualizar cada referencia
# Antes: import { authSchema } from './auth_schema.sql';
# Después: import { authSchema } from './auth_schema/01-tables.sql';
```

### Paso 6: Eliminar Archivo Original

```bash
# Solo después de verificar que todo funciona
rm auth_schema.sql
```

---

## 📊 Ejemplos Detallados

### Ejemplo 1: SQL Schema (800L → 4 archivos)

**Antes:**
```
auth_management.sql (800L)
- CREATE SCHEMA auth_management
- CREATE TABLE users (200L)
- CREATE TABLE sessions (150L)
- CREATE VIEW active_users (100L)
- CREATE FUNCTION validate_token (250L)
- CREATE TRIGGER update_timestamp (100L)
```

**Después:**
```
auth_management/
├── _MAP.md (50L)
├── 01-schema.sql (10L)
│   CREATE SCHEMA auth_management;
├── 02-tables.sql (350L)
│   CREATE TABLE users ...
│   CREATE TABLE sessions ...
├── 03-views.sql (100L)
│   CREATE VIEW active_users ...
└── 04-functions-triggers.sql (350L)
    CREATE FUNCTION validate_token ...
    CREATE TRIGGER update_timestamp ...
```

### Ejemplo 2: TypeScript Service (900L → 4 archivos)

**Antes:**
```typescript
// UserService.ts (900L)
class UserService {
  // CRUD methods (300L)
  async create() {}
  async findOne() {}
  async update() {}
  async delete() {}

  // Auth methods (250L)
  async login() {}
  async logout() {}
  async validateToken() {}

  // Permission methods (200L)
  async hasPermission() {}
  async grantPermission() {}

  // Validation methods (150L)
  validateEmail() {}
  validatePassword() {}
}
```

**Después:**
```
UserService/
├── _MAP.md
├── user.service.ts (50L)              # Barrel export
│   export * from './user.service.crud';
│   export * from './user.service.auth';
│   export * from './user.service.permissions';
│   export * from './user.service.validation';
│
├── user.service.crud.ts (300L)
├── user.service.auth.ts (250L)
├── user.service.permissions.ts (200L)
└── user.service.validation.ts (150L)
```

### Ejemplo 3: React Component (1,200L → 6 archivos)

**Antes:**
```tsx
// Dashboard.tsx (1,200L)
export const Dashboard = () => {
  // State management (100L)
  // Layout JSX (200L)
  // Header JSX (150L)
  // Stats cards JSX (250L)
  // Charts JSX (300L)
  // Data table JSX (200L)
};
```

**Después:**
```
Dashboard/
├── _MAP.md
├── Dashboard.tsx (100L)               # Container principal
├── DashboardLayout.tsx (200L)
├── DashboardHeader.tsx (150L)
├── DashboardStats.tsx (250L)
├── DashboardCharts.tsx (300L)
└── DashboardTable.tsx (200L)
```

---

## 🚨 Validación Automática

### Script de Validación

```bash
#!/bin/bash
# validate-modularization.sh

echo "🔍 Validando modularización..."

# Buscar archivos >400L (excepto permitidos)
LARGE_FILES=$(find apps/ -type f \
  \( -name "*.sql" -o -name "*.ts" -o -name "*.tsx" \) \
  ! -name "package-lock.json" \
  ! -name "yarn.lock" \
  -exec wc -l {} \; | \
  awk '$1 > 400 {print $2 " → " $1 " líneas"}')

if [ -n "$LARGE_FILES" ]; then
  echo "⚠️ Archivos que requieren modularización:"
  echo "$LARGE_FILES"
  exit 1
else
  echo "✅ Todos los archivos cumplen con PF-001 (<400L)"
  exit 0
fi
```

### Integración con CI/CD

```yaml
# .github/workflows/validate-modularization.yml
name: Validate Modularization

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run modularization validation
        run: bash scripts/validate-modularization.sh
```

---

## 📋 Checklist de Modularización

### Antes de Dividir

- [ ] Archivo tiene >400 líneas
- [ ] No es una excepción permitida
- [ ] Identificadas secciones lógicas
- [ ] Calculado número de archivos necesarios

### Durante la División

- [ ] Carpeta creada con nombre del archivo original (sin extensión)
- [ ] Contenido dividido manteniendo cohesión
- [ ] Archivos renombrados con formato `{numero}-{nombre}.ext`
- [ ] Todos los archivos resultantes <400L
- [ ] _MAP.md creado

### Después de Dividir

- [ ] Referencias actualizadas
- [ ] Imports/includes funcionando
- [ ] Tests pasando (si aplica)
- [ ] Archivo original eliminado
- [ ] Cambios committeados

---

## 🎯 Buenas Prácticas

### DO's ✅

- **Dividir por responsabilidad lógica**
  - Mantener cohesión en cada archivo
  - Evitar dependencias circulares

- **Usar nomenclatura consistente**
  - `01-`, `02-`, `03-` para orden de ejecución/importación
  - Nombres descriptivos

- **Crear _MAP.md siempre**
  - Facilita navegación
  - Documenta propósito de cada archivo

- **Validar antes de eliminar original**
  - Ejecutar tests
  - Verificar que no hay referencias rotas

### DON'Ts ❌

- **No dividir arbitrariamente**
  - No partir funciones/clases a la mitad
  - Mantener unidades lógicas completas

- **No crear archivos muy pequeños**
  - Evitar archivos <50L a menos que sea necesario
  - Buscar balance entre modularización y pragmatismo

- **No olvidar actualizar referencias**
  - Buscar todos los imports/includes
  - Actualizar documentación

- **No commitear sin validar**
  - Asegurar que tests pasen
  - Verificar que build funciona

---

## 📊 Métricas de Éxito

### Objetivos del Proyecto

| Métrica | Estado Actual | Objetivo | % |
|---------|---------------|----------|---|
| Archivos >400L en apps/ | TBD | 0 | 0% |
| Carpetas sin _MAP.md (>3 archivos) | TBD | 0 | 0% |
| Cumplimiento PF-001 | TBD | 100% | 0% |

### Validación Continua

**Ejecutar en cada microciclo:**
```bash
bash scripts/validate-modularization.sh
```

---

**Versión:** 1.0
**Fecha:** 2025-11-01
**Autor:** ATLAS
**Principio:** PF-001 Cascade
**Status:** ✅ Activo
**Cumplimiento:** Obligatorio
