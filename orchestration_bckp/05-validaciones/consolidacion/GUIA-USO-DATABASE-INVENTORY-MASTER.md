# Guía de Uso: Database Inventory Master (DIM)

**Fecha:** 2025-11-07
**Versión:** 1.0
**Propósito:** Evitar duplicaciones de objetos DDL entre agentes con diferentes contextos

---

## 🎯 ¿Qué es el Database Inventory Master (DIM)?

El **Database Inventory Master** es la **fuente de verdad única** para todos los objetos de base de datos en GAMILIT.

Resuelve el problema identificado donde **cada agente tiene diferentes contextos**, causando:
- Creación de objetos duplicados con el mismo nombre en diferentes schemas
- Creación de objetos con nombres diferentes pero la misma función
- Referencias a objetos inexistentes
- Inconsistencias entre documentación e implementación

---

## 📋 Contenido del DIM

El DIM mapea tres dimensiones críticas:

```
📄 DOCUMENTACIÓN → 🎯 FUNCIÓN → 🗄️ IMPLEMENTACIÓN DDL
```

### 1. Inventario Completo de Objetos
- **13 Schemas**
- **62 Tablas** con descripciones funcionales
- **53 Enums únicos** (60 definiciones - 24 duplicados detectados)
- **61 Functions**
- **49 Triggers**
- **18 archivos RLS Policies**
- **94 Foreign Keys** mapeadas

### 2. Dependencias Mapeadas
- **Foreign Keys:** Qué tabla referencia a cuál
- **Trigger → Function:** Qué función ejecuta cada trigger
- **RLS Policy → Function:** Qué funciones usan las políticas
- **Function → Enum/Table:** Qué enums/tablas usa cada función
- **Table → Enum:** Qué enums usa cada tabla
- **Index → Table:** Qué índices tiene cada tabla

### 3. Mapeo Funcional
Cada objeto incluye:
- **Propósito funcional:** Qué hace
- **Schema purpose:** Categoría funcional del schema
- **Documentación:** Link a especificaciones (cuando existe)
- **Archivo DDL:** Ubicación exacta del código

### 4. Detección de Duplicados por FUNCIÓN
El DIM detecta:
- Enums con el mismo nombre en diferentes ubicaciones
- Tablas/funciones con nombres similares
- Objetos que cumplen la misma función pero tienen diferente nombre/schema

---

## 🚀 Cómo Usar el DIM

### Para Agentes de Base de Datos

#### Antes de Crear un Nuevo Objeto

1. **Consultar el DIM:**
   ```bash
   cat orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-2025-11-07.md
   ```

2. **Verificar si ya existe:**
   - Buscar por **nombre exacto**
   - Buscar por **función** (propósito)
   - Revisar el schema donde debería estar

3. **Si existe:**
   - ✅ Reusar el objeto existente
   - ✅ Actualizar referencias
   - ❌ NO crear duplicado

4. **Si NO existe:**
   - ✅ Crear el objeto
   - ✅ Actualizar el DIM después de crear
   - ✅ Actualizar _MAP.md correspondiente

#### Antes de Modificar un Objeto Existente

1. **Buscar TODAS las dependencias en el DIM:**
   - Qué tablas tienen FK a este objeto
   - Qué funciones usan este objeto
   - Qué triggers dependen de este objeto
   - Qué RLS policies lo referencian

2. **Planificar cambios en cascada:**
   - Listar todos los archivos que deben actualizarse
   - Verificar impacto en Backend (TypeORM entities)
   - Verificar impacto en Frontend (tipos)

3. **Ejecutar cambios:**
   - Actualizar objeto principal
   - Actualizar dependencias
   - Actualizar DIM
   - Actualizar _MAP.md

---

## 📂 Integración con SIMCO

El DIM está integrado en el sistema SIMCO:

### Nivel 1: Database Master _MAP.md
**Ubicación:** `apps/database/_MAP.md`

Contiene:
- Referencia al DIM
- Resumen ejecutivo de objetos
- Issues P0/P1 detectados
- Stats actualizadas

### Nivel 2: Schema _MAP.md
**Ejemplo:** `apps/database/ddl/schemas/auth_management/tables/_MAP.md`

Contiene:
- Lista de tablas del schema
- **Sección nueva:** Dependencias (FKs, Enums usados)
- **Sección nueva:** Issues conocidos (P0/P1)
- **Sección nueva:** Link al DIM

### Nivel 3: Database Inventory Master
**Ubicación:** `orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-2025-11-07.md`

Contiene:
- Inventario completo y detallado
- Todas las dependencias mapeadas
- Duplicados detectados con severidad
- Plan de acción priorizado

---

## 🔍 Casos de Uso Comunes

### Caso 1: ¿Este ENUM ya existe?

**Antes (sin DIM):**
```sql
-- Agente crea enum sin verificar
CREATE TYPE public.notification_type AS ENUM ('info', 'warning', 'error');
```

**Después (con DIM):**
```bash
# 1. Consultar DIM
grep -i "notification_type" DATABASE-INVENTORY-MASTER-2025-11-07.md

# 2. Resultado: Ya existe en 2 ubicaciones
#    - public.notification_type (00-prerequisites.sql:45)
#    - gamification_system.notification_type (enums/notification_type.sql:6)

# 3. Acción: NO crear, usar el existente en public
```

### Caso 2: ¿Qué objetos dependen de esta tabla?

**Pregunta:** "Voy a cambiar la tabla `auth_management.profiles`, ¿qué se va a romper?"

**Solución:**
```bash
# 1. Buscar en DIM sección "Foreign Keys"
grep "auth_management.profiles" DATABASE-INVENTORY-MASTER-2025-11-07.md

# 2. Resultado:
#    - 15 tablas tienen FK a profiles
#    - 7 RLS policies usan profiles
#    - 12 functions referencian profiles
#    - 3 triggers dependen de profiles
```

### Caso 3: Consolidar Duplicados

**Problema:** Encontrado enum `gamilit_role` en 2 lugares

**Proceso:**
1. Consultar DIM sección "DUPLICADOS DETECTADOS"
2. Ver plan de consolidación existente
3. Seguir plan paso a paso:
   - Identificar cuál es el "correcto" (auth_management.gamilit_role)
   - Listar todos los archivos con referencias incorrectas
   - Actualizar referencias
   - Eliminar duplicado
   - Validar con tests

---

## ⚠️ Issues Críticos Identificados

### P0-001: Enum `public.gamilit_role` NO EXISTE

**Impacto:**
- 3 tablas no pueden crearse
- 7 RLS policies fallan
- 1 función falla

**Archivos afectados (11):**
- `apps/database/ddl/schemas/auth/tables/01-users.sql:15`
- `apps/database/ddl/schemas/auth_management/tables/04-roles.sql:17`
- `apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql:20`
- 7 RLS policies en progress_tracking
- 1 función en public

**Solución:**
Cambiar TODAS las referencias a `auth_management.gamilit_role`

**Plan detallado:**
`orchestration/05-validaciones/consolidacion/PLAN-CONSOLIDACION-ENUM-GAMILIT-ROLE-2025-11-07.md`

### P0-002: Enum `auth_provider` con valores diferentes

**Problema:**
- 00-prerequisites.sql: 4 valores (falta 'apple')
- auth_providers.sql: 5 valores (incluye 'apple')

**Solución:**
Actualizar prerequisites para incluir 'apple'

### P1-001: 24 Enums Duplicados

**Detalle:**
23 enums definidos 2 veces (idénticos, pero causa confusión)

**Lista completa:**
Ver `orchestration/05-validaciones/consolidacion/REPORTE-COMPLETO-ENUMS-2025-11-07.md`

---

## 🔄 Mantener el DIM Actualizado

### Cuándo Regenerar el DIM

Regenerar el DIM cuando:
- ✅ Se agregan nuevos schemas
- ✅ Se crean 5+ tablas nuevas
- ✅ Se agregan/modifican enums
- ✅ Se cambian dependencias (FKs, triggers)
- ✅ Cada sprint/milestone

### Cómo Regenerar

```bash
# 1. Ejecutar scripts de inventario
bash /tmp/create_database_inventory.sh
bash /tmp/extract_dependencies.sh

# 2. Generar nuevo DIM
python3 /tmp/generate_master_inventory.py

# 3. Copiar a workspace con fecha
cp /tmp/DATABASE_INVENTORY_MASTER.md \
   orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-$(date +%Y-%m-%d).md

# 4. Actualizar _MAP.md principal
vim apps/database/_MAP.md
```

---

## 📚 Referencias

### Documentos Relacionados
- **DIM completo:** `orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-2025-11-07.md`
- **Plan consolidación gamilit_role:** `orchestration/05-validaciones/consolidacion/PLAN-CONSOLIDACION-ENUM-GAMILIT-ROLE-2025-11-07.md`
- **Reporte enums completo:** `orchestration/05-validaciones/consolidacion/REPORTE-COMPLETO-ENUMS-2025-11-07.md`
- **Database _MAP.md:** `apps/database/_MAP.md`

### Scripts de Generación
- `/tmp/create_database_inventory.sh` - Inventario de objetos
- `/tmp/extract_dependencies.sh` - Extracción de dependencias
- `/tmp/generate_master_inventory.py` - Generación del DIM

---

## 💡 Mejores Prácticas

### ✅ DO
- Consultar el DIM ANTES de crear objetos
- Buscar por FUNCIÓN, no solo por nombre
- Actualizar el DIM después de cambios grandes
- Seguir planes de consolidación para duplicados
- Mantener _MAP.md sincronizados con el DIM

### ❌ DON'T
- Crear objetos sin verificar duplicados
- Ignorar dependencias al modificar objetos
- Dejar duplicados "para después"
- Modificar objetos sin actualizar dependientes
- Saltarse la validación contra el DIM

---

## 🎓 Preguntas Frecuentes

### ¿El DIM reemplaza los _MAP.md?
**No.** El DIM es complementario:
- **_MAP.md:** Navegación rápida por estructura
- **DIM:** Análisis profundo de dependencias y duplicados

### ¿Qué pasa si encuentro un duplicado no listado?
1. Documentarlo en el DIM
2. Crear issue P0/P1 según severidad
3. Generar plan de consolidación
4. Notificar al equipo

### ¿Cómo sé si dos objetos tienen la misma FUNCIÓN?
Comparar:
- Descripción/comentarios en DDL
- Propósito funcional en documentación
- Columnas/campos (tablas)
- Valores (enums)
- Lógica (functions)

Si 80%+ coincide → probablemente duplicado funcional

---

**Última actualización:** 2025-11-07
**Mantenedor:** SQL Agent / Database Team
**Versión:** 1.0
