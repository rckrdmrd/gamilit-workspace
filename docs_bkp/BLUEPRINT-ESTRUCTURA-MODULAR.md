# Blueprint: Estructura Modular de Documentación

**Versión:** 1.0
**Fecha:** 2025-11-07
**Propósito:** Definir convenciones, estructura y plantillas para documentación modular

---

## 🎯 Principios de Diseño

### 1. Modularidad
- **Un archivo = Un concepto/requerimiento**
- Archivos pequeños y enfocados (~500-1000 líneas)
- Fácil navegación y mantenimiento

### 2. Trazabilidad Completa
- Referencias bidireccionales entre documentos
- Paths relativos desde `docs/`
- Citas exactas a líneas de código DDL

### 3. Referencias Concretas
- No "ver archivo X"
- Sí "ver `archivo.sql:123-145`"
- Links clickeables entre documentos

### 4. Consistencia
- Nomenclatura estándar
- Estructura de archivos uniforme
- Metadata completa

---

## 📁 Estructura de Carpetas

```
docs/
├── 01-requerimientos/
│   └── {NN-nombre-modulo}/
│       ├── _MAP.md                      # Índice del módulo
│       ├── RF-{MOD}-001-{nombre}.md     # Requerimiento 1
│       ├── RF-{MOD}-002-{nombre}.md     # Requerimiento 2
│       └── ...
│
├── 02-especificaciones-tecnicas/
│   └── {NN-nombre-modulo}/
│       ├── _MAP.md                      # Índice del módulo
│       ├── ET-{MOD}-001-{nombre}.md     # Especificación 1
│       ├── ET-{MOD}-002-{nombre}.md     # Especificación 2
│       └── ...
│
└── 03-desarrollo/
    └── base-de-datos/
        ├── MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md
        └── ...
```

---

## 🏷️ Convenciones de Nomenclatura

### Carpetas de Módulos

**Formato:** `{NN-nombre-modulo}/`

Donde:
- `NN` = Número de módulo (01-08)
- `nombre-modulo` = Kebab-case descriptivo

**Ejemplos:**
- ✅ `01-autenticacion-autorizacion/`
- ✅ `02-gamificacion/`
- ✅ `05-caracteristicas-sociales/`
- ❌ `Autenticacion/` (sin número, CamelCase)
- ❌ `1_auth/` (formato incorrecto)

---

### Archivos de Requerimientos Funcionales (RF)

**Formato:** `RF-{MOD}-{NNN}-{nombre}.md`

Donde:
- `RF` = Requerimiento Funcional (fijo)
- `{MOD}` = Código del módulo (3-4 letras, UPPERCASE)
- `{NNN}` = Número secuencial (001, 002, ...)
- `{nombre}` = Kebab-case descriptivo

**Códigos de Módulos:**
| Módulo | Código |
|--------|--------|
| Autenticación | AUTH |
| Gamificación | GAM |
| Contenido Educativo | EDU |
| Progreso | PRG |
| Social | SOC |
| Notificaciones | NOT |
| Contenido/Media | CNT |
| Auditoría | AUD |
| Configuración | CFG |

**Ejemplos:**
- ✅ `RF-AUTH-001-roles.md`
- ✅ `RF-GAM-002-comodines.md`
- ✅ `RF-EDU-001-mecanicas-ejercicios.md`
- ❌ `RF-auth-1-roles.md` (lowercase, sin ceros)
- ❌ `roles-requerimiento.md` (sin prefijo)

---

### Archivos de Especificaciones Técnicas (ET)

**Formato:** `ET-{MOD}-{NNN}-{nombre}.md`

Donde:
- `ET` = Especificación Técnica (fijo)
- Resto igual que RF

**Ejemplos:**
- ✅ `ET-AUTH-001-rbac.md`
- ✅ `ET-GAM-001-achievements.md`
- ❌ `SPEC-AUTH-001.md` (prefijo incorrecto)

---

### Archivos Índice (_MAP.md)

**Formato:** `_MAP.md` (siempre en raíz de carpeta)

**Propósito:**
- Índice de todos los archivos del módulo
- Mapa visual de relaciones
- Estadísticas del módulo
- Enlaces a documentos relacionados

---

## 📄 Plantilla: Requerimiento Funcional (RF)

```markdown
# RF-{MOD}-{NNN}: {Título del Requerimiento}

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-{MOD}-{NNN} |
| **Módulo** | {Nombre del módulo} |
| **Prioridad** | Alta / Media / Baja |
| **Estado** | ✅ Implementado / 🔄 En desarrollo / ⏸️ Pendiente |
| **Versión** | 1.0 |
| **Fecha creación** | YYYY-MM-DD |
| **Última actualización** | YYYY-MM-DD |

## 🔗 Referencias

### Especificación Técnica
📐 [ET-{MOD}-{NNN}: {Título}](../../02-especificaciones-tecnicas/{modulo}/ET-{MOD}-{NNN}-{nombre}.md)

### Implementación DDL
🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:{línea-inicio}-{línea-fin}`
- **Tipo:** `{schema}.{tipo}`
- **Valores:** `{valor1}`, `{valor2}`, ...

🗄️ **Tablas que usan el ENUM:**
1. `{schema}.{tabla}` → `apps/database/ddl/schemas/{schema}/tables/{archivo}.sql:{línea}`
2. ...

### Backend
💻 **Implementación:**
- **Enum:** `apps/backend/src/{path}/enums/{nombre}.enum.ts`
- **Service:** `apps/backend/src/{path}/services/{nombre}.service.ts`
- **Guard/Middleware:** (si aplica)

### Frontend
🎨 **Componentes:**
- **Types:** `apps/frontend/src/types/{nombre}.types.ts`
- **Componentes:**
  - `apps/frontend/src/components/{path}/{Componente}.tsx`
  - ...

### Mapeo Completo
📊 [Ver mapeo completo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#{ancla})

---

## 📝 Descripción del Requerimiento

### Contexto

{1-2 párrafos explicando el contexto de negocio}

### Necesidad del Negocio

**Problema:**
{Descripción del problema que se resuelve}

**Solución:**
{Descripción de alto nivel de la solución}

---

## 🎯 Requerimiento Funcional

### RF-{MOD}-{NNN}.1: {Subtítulo}

{Descripción detallada del requerimiento}

**Especificaciones:**
- {Especificación 1}
- {Especificación 2}
- ...

---

## 📊 Casos de Uso

### UC-{XXX}-001: {Título del Caso de Uso}
**Actor:** {Tipo de usuario}
**Precondiciones:** {Condiciones previas}
**Flujo:**
1. {Paso 1}
2. {Paso 2}
3. ...

**Resultado:** {Resultado esperado}

---

## 🔐 Consideraciones de Seguridad

{Consideraciones específicas de seguridad para este requerimiento}

---

## ✅ Criterios de Aceptación

### AC-001: {Criterio 1}
- [x] {Sub-criterio 1}
- [x] {Sub-criterio 2}
- ...

---

## 🧪 Testing

### Test Case 1: {Título}
```{lenguaje}
{Código de test case}
```

---

## 📚 Referencias Adicionales

### Documentos Relacionados
- 📄 [{ID}: {Título}](../{path}/{archivo}.md)
- ...

### Estándares de Industria
- [{Nombre del estándar}]({URL})

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | YYYY-MM-DD | {Autor} | Creación inicial |

---

**Documento:** `docs/01-requerimientos/{modulo}/RF-{MOD}-{NNN}-{nombre}.md`
**Ruta relativa desde docs/:** `01-requerimientos/{modulo}/RF-{MOD}-{NNN}-{nombre}.md`
```

---

## 📐 Plantilla: Especificación Técnica (ET)

```markdown
# ET-{MOD}-{NNN}: {Título de la Especificación}

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-{MOD}-{NNN} |
| **Módulo** | {Nombre del módulo} |
| **Tipo** | Especificación Técnica |
| **Estado** | ✅ Implementado / 🔄 En desarrollo / ⏸️ Pendiente |
| **Versión** | 1.0 |
| **Fecha creación** | YYYY-MM-DD |

## 🔗 Referencias

### Requerimiento Funcional
📄 [RF-{MOD}-{NNN}: {Título}](../../01-requerimientos/{modulo}/RF-{MOD}-{NNN}-{nombre}.md)

### Implementación DDL
🗄️ **Archivos relacionados:**

**ENUM Principal:**
```sql
-- apps/database/ddl/00-prerequisites.sql:{línea-inicio}-{línea-fin}
CREATE TYPE {schema}.{nombre} AS ENUM (
    '{valor1}',  -- {Descripción}
    '{valor2}',  -- {Descripción}
    ...
);
```

**Tablas:**
- `{schema}.{tabla}:{línea}` - `{columna} {tipo} {constraints}`
- ...

**Funciones:**
- `{schema}.{funcion}():{líneas}` - {Descripción}
- ...

**RLS Policies:**
1. `{schema}.{tabla}` → `{policy_name}`
2. ...

### Mapeo Completo
📊 [Ver en: Mapeo Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#{ancla})

---

## 🏗️ Arquitectura

### Diseño General

```
{Diagrama ASCII de arquitectura}
```

{Descripción del diseño}

---

## 📐 Matriz de {Concepto}

{Tabla detallada con especificaciones técnicas}

---

## 🔧 Implementación Técnica

### 1. DDL - Definición del ENUM

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:{línea}`

```sql
{Código SQL completo}
```

**Decisiones de Diseño:**
- ✅ {Decisión 1}
- ✅ {Decisión 2}
- ...

---

### 2. Backend - {Componente}

**Ubicación:** `apps/backend/src/{path}/{archivo}`

```typescript
{Código TypeScript}
```

**Notas Técnicas:**
- {Nota 1}
- {Nota 2}

---

### 3. Frontend - {Componente}

**Ubicación:** `apps/frontend/src/{path}/{archivo}`

```typescript
{Código TypeScript/React}
```

---

## 🔒 Row Level Security (RLS) Policies

{Si aplica, ejemplos completos de RLS policies}

---

## 📊 Performance y Escalabilidad

### Consideraciones

{Consideraciones de performance}

---

## 🧪 Testing

### Unit Tests
```typescript
{Test cases}
```

### E2E Tests
```typescript
{Test cases}
```

---

## 📚 Referencias

### Documentos Relacionados
- 📄 [{ID}: {Título}](../{path}/{archivo}.md)

### Estándares
- [{Nombre}]({URL})

---

**Documento:** `docs/02-especificaciones-tecnicas/{modulo}/ET-{MOD}-{NNN}-{nombre}.md`
**Ruta relativa desde docs/:** `02-especificaciones-tecnicas/{modulo}/ET-{MOD}-{NNN}-{nombre}.md`
```

---

## 🗺️ Plantilla: Índice de Módulo (_MAP.md)

```markdown
# Módulo {N}: {Nombre del Módulo} - {Requerimientos/Especificaciones}

## 📋 Índice de {Requerimientos Funcionales/Especificaciones Técnicas}

Este módulo contiene {descripción breve del módulo}.

---

## 📄 {Tipo de Documentos}

### {ID}: {Título}
**Archivo:** [`{archivo}.md`](./{archivo}.md)
**Estado:** ✅ Implementado / 🔄 En desarrollo / ⏸️ Pendiente
**Prioridad:** Alta / Media / Baja

**Descripción:** {Descripción breve de 1-2 líneas}

**Implementación DDL:**
- ENUM: `{ubicación}:{líneas}`
- Tablas: {lista}
- Funciones: {lista}

**Especificación Técnica:** [`{ID}.md`](../../02-especificaciones-tecnicas/{modulo}/{archivo}.md)

**Backend:** {lista de archivos}

**Frontend:** {lista de componentes}

---

{Repetir para cada documento}

---

## 🗺️ Mapa de Relaciones

```
{Diagrama ASCII mostrando relaciones entre documentos}
```

---

## 📊 Estadísticas

- **Total {Tipo}:** {N}
- **Estado:** {N}/{Total} Implementados ({%})
- **ENUMs Definidos:** {N}
- **Tablas Afectadas:** {N}
- **RLS Policies:** {N}
- **Backend Services:** {N}
- **Frontend Components:** {N}

---

## 🔗 Enlaces Relacionados

### {Tipo} Complementarias
- [{ID}: {Título}](../../{path}/{archivo}.md)

### Otros Módulos Relacionados
- [{ID}: {Título}](../{modulo}/{archivo}.md)

### ADRs
- [{ADR}: {Título}](../../02-especificaciones-tecnicas/adr/{archivo}.md)

### Mapeo Completo
- [Mapeo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#{ancla})

---

## 📅 Historial

| Fecha | Evento | Descripción |
|-------|--------|-------------|
| YYYY-MM-DD | {Evento} | {Descripción} |

---

**Ruta:** `docs/{carpeta}/{modulo}/_MAP.md`
**Última actualización:** YYYY-MM-DD
```

---

## 📏 Guías de Estilo

### Markdown

**Headers:**
- H1 (`#`) = Título del documento (solo uno)
- H2 (`##`) = Secciones principales
- H3 (`###`) = Subsecciones
- H4 (`####`) = Sub-subsecciones (evitar H5, H6)

**Enlaces:**
```markdown
# Enlaces relativos (preferido)
[Texto del link](../../ruta/relativa/desde/docs/archivo.md)

# Enlaces con ancla
[Texto del link](../../ruta/archivo.md#seccion)

# NO usar enlaces absolutos
❌ [Link](/home/user/docs/archivo.md)
```

**Citas a Código:**
```markdown
# Con número de línea
`apps/database/ddl/00-prerequisites.sql:30-32`

# Con función/sección específica
`apps/backend/src/guards/roles.guard.ts:15-45` (clase RolesGuard)
```

**Bloques de Código:**
````markdown
```sql
-- Incluir comentarios explicativos
CREATE TYPE auth_management.gamilit_role AS ENUM (
    'student',       -- Estudiante regular
    'admin_teacher'  -- Profesor/Admin
);
```
````

**Listas:**
```markdown
# Checkboxes para criterios de aceptación
- [x] Criterio completado
- [ ] Criterio pendiente

# Listas con iconos
- ✅ Implementado
- 🔄 En desarrollo
- ⏸️ Pendiente
- ❌ No permitido
```

---

### Iconos Estándar

| Icono | Uso | Ejemplo |
|-------|-----|---------|
| 📋 | Metadata, índices | `## 📋 Metadata` |
| 🔗 | Referencias, enlaces | `## 🔗 Referencias` |
| 📄 | Documentos, requerimientos | `📄 RF-AUTH-001` |
| 📐 | Especificaciones técnicas | `📐 ET-AUTH-001` |
| 🗄️ | Base de datos, DDL | `🗄️ Implementación DDL` |
| 💻 | Backend | `💻 Backend Implementation` |
| 🎨 | Frontend | `🎨 Frontend Components` |
| 📊 | Estadísticas, gráficos | `## 📊 Estadísticas` |
| 🎯 | Objetivos, requerimientos | `## 🎯 Requerimiento Funcional` |
| 🔐 | Seguridad | `## 🔐 Consideraciones de Seguridad` |
| 🧪 | Testing | `## 🧪 Testing` |
| 📚 | Referencias externas | `## 📚 Referencias Adicionales` |
| 📅 | Historial, fechas | `## 📅 Historial de Cambios` |
| 🗺️ | Mapas, navegación | `## 🗺️ Mapa de Relaciones` |
| ⚠️ | Advertencias | `⚠️ Importante: ...` |
| ✅ | Completado, correcto | `✅ Implementado` |
| 🔄 | En progreso | `🔄 En desarrollo` |
| ⏸️ | Pendiente, pausado | `⏸️ Pendiente` |
| ❌ | Incorrecto, no permitido | `❌ No usar` |

---

## 🔄 Proceso de Creación de Nuevos Documentos

### 1. Identificar Módulo

¿El requerimiento pertenece a un módulo existente o requiere uno nuevo?

**Módulos Existentes:** 01-08 (ver INDICE-MAESTRO.md)
**Módulo Nuevo:** Crear carpeta con número siguiente (09, 10, ...)

---

### 2. Crear Requerimiento Funcional (RF)

1. **Determinar ID:**
   - Módulo: {MOD} (AUTH, GAM, EDU, etc.)
   - Número: Siguiente disponible en el módulo
   - Ejemplo: `RF-AUTH-004-...`

2. **Crear archivo:**
   ```bash
   touch docs/01-requerimientos/{modulo}/RF-{MOD}-{NNN}-{nombre}.md
   ```

3. **Copiar plantilla** de este documento

4. **Completar secciones:**
   - Metadata (ID, prioridad, estado)
   - Referencias (DDL con líneas exactas)
   - Descripción del requerimiento
   - Casos de uso
   - Criterios de aceptación

5. **Validar enlaces:**
   - Todos los paths son relativos desde `docs/`
   - Referencias DDL incluyen números de línea
   - Links a especificación técnica creado (aunque ET no exista aún)

---

### 3. Crear Especificación Técnica (ET)

1. **Usar mismo ID que RF:**
   - `RF-AUTH-004-...` → `ET-AUTH-004-...`

2. **Crear archivo:**
   ```bash
   touch docs/02-especificaciones-tecnicas/{modulo}/ET-{MOD}-{NNN}-{nombre}.md
   ```

3. **Copiar plantilla**

4. **Completar secciones:**
   - Metadata
   - Referencia a RF (bidireccional)
   - Arquitectura técnica
   - Código SQL, TypeScript, etc. (completo, no snippets)
   - RLS policies (si aplica)
   - Testing

5. **Incluir detalles técnicos:**
   - Índices de base de datos
   - Consideraciones de performance
   - Decisiones de diseño justificadas

---

### 4. Actualizar Índice del Módulo (_MAP.md)

1. **Abrir** `docs/01-requerimientos/{modulo}/_MAP.md`

2. **Agregar nueva entrada:**
   ```markdown
   ### RF-{MOD}-{NNN}: {Título}
   **Archivo:** [`RF-{MOD}-{NNN}-{nombre}.md`](./RF-{MOD}-{NNN}-{nombre}.md)
   **Estado:** ⏸️ Pendiente
   ...
   ```

3. **Actualizar estadísticas:**
   - Total Requerimientos: +1
   - Estado: Recalcular porcentaje

4. **Actualizar mapa de relaciones**

5. **Repetir para** `docs/02-especificaciones-tecnicas/{modulo}/_MAP.md`

---

### 5. Actualizar MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md

1. **Abrir** `docs/03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md`

2. **Agregar sección en módulo correspondiente:**
   ```markdown
   ### {N}.{M} {Título del ENUM/Feature}

   #### 📄 Requerimientos Funcionales
   - **Documento:** `01-requerimientos/{modulo}/RF-{MOD}-{NNN}-{nombre}.md`
   - ...

   #### 📐 Especificaciones Técnicas
   - **Documento:** `02-especificaciones-tecnicas/{modulo}/ET-{MOD}-{NNN}-{nombre}.md`
   - ...

   #### 🗄️ Implementación DDL
   - **Ubicación:** `apps/database/ddl/00-prerequisites.sql:{líneas}`
   - ...
   ```

3. **Actualizar estadísticas** al final del documento

---

### 6. Actualizar INDICE-MAESTRO.md

1. **Abrir** `docs/INDICE-MAESTRO.md`

2. **Agregar a sección del módulo:**
   ```markdown
   - [`RF-{MOD}-{NNN}: {Título}`](01-requerimientos/{modulo}/RF-{MOD}-{NNN}-{nombre}.md) → {Descripción breve}
   ```

3. **Actualizar tabla de estadísticas**

---

## ✅ Checklist de Calidad

Antes de considerar un documento completo, verificar:

### Requerimiento Funcional (RF)
- [ ] Metadata completa (ID, módulo, prioridad, estado, fechas)
- [ ] Referencias DDL con números de línea exactos
- [ ] Link a especificación técnica (ET) correspondiente
- [ ] Link a mapeo completo con ancla específica
- [ ] Referencias a backend/frontend con paths completos
- [ ] Al menos 1 caso de uso detallado
- [ ] Criterios de aceptación con checkboxes
- [ ] Consideraciones de seguridad (si aplica)
- [ ] Test cases o referencia a tests
- [ ] Historial de cambios iniciado
- [ ] Pie de página con ruta del documento

### Especificación Técnica (ET)
- [ ] Metadata completa
- [ ] Link bidireccional a RF
- [ ] Referencias DDL con código SQL completo
- [ ] Código backend completo (no snippets)
- [ ] Código frontend completo (no snippets)
- [ ] Diagrama de arquitectura (ASCII o link a imagen)
- [ ] RLS policies completas (si aplica)
- [ ] Consideraciones de performance
- [ ] Unit tests y E2E tests
- [ ] Referencias a estándares de industria
- [ ] Historial de cambios
- [ ] Pie de página con ruta

### Índice de Módulo (_MAP.md)
- [ ] Lista todos los documentos del módulo
- [ ] Descripción breve de cada documento
- [ ] Mapa de relaciones actualizado
- [ ] Estadísticas correctas
- [ ] Enlaces a otros módulos relacionados
- [ ] Historial de eventos del módulo

---

## 🎓 Ejemplos de Referencias

La estructura actual incluye ejemplos completos en:

**Módulo 1: Autenticación y Autorización**
- ✅ [`RF-AUTH-001-roles.md`](01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md) - Ejemplo completo de RF
- ✅ [`ET-AUTH-001-rbac.md`](02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md) - Ejemplo completo de ET
- ✅ [`_MAP.md`](01-requerimientos/01-autenticacion-autorizacion/_MAP.md) - Ejemplo de índice de módulo

**Documentos Maestros:**
- ✅ [`INDICE-MAESTRO.md`](INDICE-MAESTRO.md) - Vista completa de documentación
- ✅ [`MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md`](03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md) - Mapeo completo

---

## 📞 Contacto y Mantenimiento

**Responsable:** Database Team
**Última actualización:** 2025-11-07
**Versión del Blueprint:** 1.0

Para consultas sobre esta estructura o sugerencias de mejora, contactar al Database Team.

---

**Documento:** `docs/BLUEPRINT-ESTRUCTURA-MODULAR.md`
**Ruta:** `BLUEPRINT-ESTRUCTURA-MODULAR.md` (raíz de docs/)
