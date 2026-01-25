# SIMCO: DOCUMENTAR

**Versión:** 2.0.0
**Fecha:** 2026-01-16
**Aplica a:** TODO agente al completar cualquier tarea
**Prioridad:** OBLIGATORIA
**Alias:** @DOCUMENTAR

---

## RESUMEN EJECUTIVO

> **"Si no está documentado, no existe."**
> Toda tarea debe actualizar inventarios, trazas y documentación relevante.

---

## SISTEMA DE GOBERNANZA DE DOCUMENTACIÓN

> **IMPORTANTE:** A partir de v2.0.0, existe un sistema de gobernanza obligatorio.
> Ver: @TRIGGER-DOC (`orchestration/directivas/triggers/TRIGGER-DOCUMENTACION-OBLIGATORIA.md`)

### Estructura de Tareas
```
orchestration/tareas/
├── _INDEX.yml                    # Índice de todas las tareas
├── _templates/TASK-TEMPLATE/     # Templates para nueva tarea
│   ├── METADATA.yml
│   ├── 01-CONTEXTO.md
│   ├── 02-ANALISIS.md
│   ├── 03-PLAN.md
│   ├── 04-VALIDACION.md
│   ├── 05-EJECUCION.md
│   └── 06-DOCUMENTACION.md
└── TASK-YYYY-MM-DD-NNN/          # Carpeta por tarea
```

### Flujo de Documentación
```
1. Crear carpeta de tarea (copiar de _templates/)
2. Completar METADATA.yml
3. Documentar fases conforme se avanza (C→A→P→V→E→D)
4. Actualizar _INDEX.yml al completar
5. Actualizar traza de agente
```

### Referencias del Sistema
- **@TAREAS:** `orchestration/tareas/`
- **@NUEVA-TAREA:** `orchestration/tareas/_templates/TASK-TEMPLATE/`
- **@MAPA-DOC:** `orchestration/MAPA-DOCUMENTACION.yml`
- **@TRIGGER-DOC:** Directiva de documentación obligatoria

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOCUMENTACIÓN PRIMERO, IMPLEMENTACIÓN DESPUÉS                       ║
║                                                                       ║
║  1. Verificar docs/ existente ANTES de implementar                   ║
║  2. Actualizar docs/ si hay cambios de diseño                        ║
║  3. Implementar código                                                ║
║  4. Actualizar inventarios y trazas DESPUÉS de implementar           ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## CHECKLIST DE DOCUMENTACIÓN

```
AL INICIAR TAREA
├── [ ] 1. Leer documentación existente en @DOCS
├── [ ] 2. Verificar si hay especificaciones relacionadas
└── [ ] 3. Identificar si docs/ necesita actualización

DURANTE IMPLEMENTACIÓN
├── [ ] 4. Documentar inline (comentarios, JSDoc, COMMENT ON)
└── [ ] 5. Actualizar docs/ si el diseño cambia

AL COMPLETAR TAREA
├── [ ] 6. Actualizar inventario correspondiente (@INVENTORY)
├── [ ] 7. Actualizar traza correspondiente (@TRAZA_*)
├── [ ] 8. Actualizar @PROXIMA con siguiente paso
└── [ ] 9. Generar reporte de entrega (si aplica)
```

---

## TIPOS DE DOCUMENTACIÓN

### 1. Documentación Inline (en código)

**SQL - COMMENT ON:**
```sql
-- Comentar tabla
COMMENT ON TABLE {schema}.{tabla} IS
    '{Descripción de la tabla y su propósito}';

-- Comentar columnas importantes
COMMENT ON COLUMN {schema}.{tabla}.{columna} IS
    '{Descripción de la columna, valores válidos, restricciones}';
```

**TypeScript - JSDoc/TSDoc:**
```typescript
/**
 * {NombreClase} - {descripción breve}
 *
 * @description {descripción detallada del propósito}
 * @example
 * ```typescript
 * const service = new UserService();
 * await service.findOne('uuid');
 * ```
 */
export class UserService {
    /**
     * Busca un usuario por ID
     *
     * @param id - UUID del usuario
     * @returns Usuario encontrado
     * @throws NotFoundException si no existe
     */
    async findOne(id: string): Promise<UserEntity> {
        // ...
    }
}
```

**React - Documentación de Props:**
```typescript
/**
 * UserProfile - Muestra información del perfil de usuario
 *
 * @component
 * @example
 * ```tsx
 * <UserProfile userId="123" showAvatar={true} />
 * ```
 */
interface UserProfileProps {
    /** ID único del usuario */
    userId: string;
    /** Si mostrar avatar o no */
    showAvatar?: boolean;
    /** Callback cuando se actualiza el perfil */
    onUpdate?: (user: User) => void;
}
```

---

### 2. Inventarios (@INVENTORY)

**Ubicación:** `orchestration/inventarios/MASTER_INVENTORY.yml`

**Estructura para Database:**
```yaml
database:
  schemas:
    {schema_name}:
      status: "✅ Completo" | "🔄 En Progreso" | "📋 Planificado"
      tables:
        - name: {nombre_tabla}
          file: "@DDL/{schema}/tables/{archivo}.sql"
          descripcion: "{descripción breve}"
          columnas: {N}
          indexes: {N}
          constraints:
            fk: {N}
            check: {N}
            unique: {N}
          triggers: {N}
          rls_policies: {N}
          relaciones:
            - tabla: "{schema}.{tabla_relacionada}"
              tipo: "FK"
              columna: "{columna}"
          created_by: "{Agente}"
          fecha_creacion: "{YYYY-MM-DD}"
          last_modified: "{YYYY-MM-DD}"
          status: "✅ Completo"
```

**Estructura para Backend:**
```yaml
backend:
  modules:
    {nombre_modulo}:
      status: "✅ Completo" | "🔄 En Progreso"
      entities:
        - name: "{NombreEntity}"
          file: "@BACKEND/{modulo}/entities/{archivo}.ts"
          related_table: "{schema}.{tabla}"
          status: "✅ Completo"

      services:
        - name: "{NombreService}"
          file: "@BACKEND/{modulo}/services/{archivo}.ts"
          methods: [{lista de métodos}]
          status: "✅ Completo"

      controllers:
        - name: "{NombreController}"
          file: "@BACKEND/{modulo}/controllers/{archivo}.ts"
          endpoints:
            - method: "GET"
              path: "/api/{recurso}"
              descripcion: "{descripción}"
            - method: "POST"
              path: "/api/{recurso}"
              descripcion: "{descripción}"
          status: "✅ Completo"

      dto:
        - name: "{NombreDto}"
          file: "@BACKEND/{modulo}/dto/{archivo}.ts"
          tipo: "create" | "update" | "response"
          status: "✅ Completo"
```

**Estructura para Frontend:**
```yaml
frontend:
  apps:
    {nombre_app}:
      status: "✅ Completo" | "🔄 En Progreso"
      pages:
        - name: "{NombrePage}"
          file: "@FRONTEND/{app}/pages/{archivo}.tsx"
          ruta: "/{path}"
          status: "✅ Completo"

      components:
        - name: "{NombreComponente}"
          file: "@FRONTEND/{app}/components/{archivo}.tsx"
          tipo: "ui" | "form" | "layout" | "feature"
          status: "✅ Completo"

      hooks:
        - name: "use{Nombre}"
          file: "@FRONTEND/{app}/hooks/{archivo}.ts"
          descripcion: "{descripción}"
          status: "✅ Completo"
```

---

### 3. Trazas (@TRAZA_*)

**Ubicación por capa:**
- Database: `@TRAZA_DB` → `orchestration/trazas/TRAZA-TAREAS-DATABASE.md`
- Backend: `@TRAZA_BE` → `orchestration/trazas/TRAZA-TAREAS-BACKEND.md`
- Frontend: `@TRAZA_FE` → `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md`

**Formato de entrada:**
```markdown
## [{TASK-ID}] {Descripción breve de la tarea}

**Fecha:** {YYYY-MM-DD HH:MM}
**Estado:** ✅ Completado | 🔄 En Progreso | ❌ Bloqueado
**Agente:** {Nombre-Agente}
**Duración:** {X}h (estimado: {Y}h)

### Descripción
{Descripción detallada de lo que se hizo}

### Archivos Creados
- `{ruta_completa_1}`
- `{ruta_completa_2}`

### Archivos Modificados
- `{ruta_completa_1}` - {descripción del cambio}
- `{ruta_completa_2}` - {descripción del cambio}

### Especificaciones Implementadas
- **{Elemento 1}:** {detalle}
- **{Elemento 2}:** {detalle}

### Validaciones Ejecutadas
- [x] Build: ✅ Pasa
- [x] Lint: ✅ Pasa
- [x] Tests: ✅ Pasan | ⏭️ N/A
- [x] Carga limpia: ✅ Pasa | ⏭️ N/A
- [x] Inventario: ✅ Actualizado
- [x] Sin duplicados: ✅ Verificado

### Convenciones Seguidas
- ✅ Nomenclatura según ESTANDARES-NOMENCLATURA-BASE.md
- ✅ Ubicación correcta de archivos
- ✅ Documentación inline incluida

### Problemas Encontrados
{Lista de problemas o "Ninguno"}

### Próximos Pasos
1. {Siguiente tarea relacionada}
2. {Otra tarea dependiente}

### Notas
{Observaciones adicionales}

---
```

---

### 4. Próxima Acción (@PROXIMA)

**Ubicación:** `orchestration/PROXIMA-ACCION.md`

**Actualizar al completar cada tarea:**
```markdown
# PRÓXIMA ACCIÓN

**Fecha actualización:** {YYYY-MM-DD HH:MM}
**Actualizado por:** {Agente}
**Proyecto:** {PROJECT_NAME}

## Estado del Desarrollo

**Fase actual:** {fase}
**Épica actual:** {EPIC-ID} - {nombre}
**Progreso:** {X}/{Y} tareas ({Z}%)

## Siguiente Tarea Prioritaria

**ID:** {TASK-ID}
**Tipo:** Database | Backend | Frontend
**Descripción:** {descripción}
**Especificación:** {archivo o referencia}
**Dependencias:** {lista de dependencias completadas}

### Pre-requisitos
- [x] {dependencia completada}
- [x] {otra dependencia}

### Contexto
{Información relevante para continuar}

## Tareas Pendientes (próximas)

1. **{TASK-ID}:** {descripción corta}
2. **{TASK-ID}:** {descripción corta}
3. **{TASK-ID}:** {descripción corta}

## Bloqueadores Activos
{Lista de bloqueadores o "Ninguno"}

## Notas para Siguiente Sesión
{Información importante que no debe perderse}
```

---

### 5. Reporte de Entrega (para tareas complejas)

**Template de reporte:**
```markdown
# Reporte de Entrega: {TASK-ID}

**Fecha:** {YYYY-MM-DD}
**Agente:** {Nombre}
**Estado:** ✅ COMPLETADO

## Resumen Ejecutivo

{1-2 párrafos describiendo qué se hizo y el resultado}

## Archivos Generados

### Código
| Archivo | Tipo | Líneas | Estado |
|---------|------|--------|--------|
| {archivo1} | {tipo} | {N} | ✅ |
| {archivo2} | {tipo} | {N} | ✅ |

### Documentación
- @INVENTORY actualizado
- @TRAZA_{CAPA} actualizada
- @PROXIMA actualizado

## Especificaciones Implementadas

| Elemento | Solicitado | Implementado | Estado |
|----------|------------|--------------|--------|
| {elem1} | {spec} | {impl} | ✅ |
| {elem2} | {spec} | {impl} | ✅ |

## Validaciones

| Validación | Resultado |
|------------|-----------|
| Build | ✅ Pasa |
| Lint | ✅ Pasa |
| Tests | ✅ Pasan |
| Coherencia | ✅ OK |

## Métricas

- **Tiempo estimado:** {X}h
- **Tiempo real:** {Y}h
- **Archivos creados:** {N}
- **Archivos modificados:** {M}

## Próximos Pasos Recomendados

1. {paso 1}
2. {paso 2}
3. {paso 3}
```

---

## DOCUMENTACIÓN POR TIPO DE TAREA

| Tipo de Tarea | Inline | Inventario | Traza | @PROXIMA | Reporte |
|---------------|--------|------------|-------|----------|---------|
| Nueva tabla | COMMENT ON | ✅ DB | ✅ @TRAZA_DB | ✅ | Opcional |
| Nueva entity | JSDoc | ✅ BE | ✅ @TRAZA_BE | ✅ | Opcional |
| Nuevo service | JSDoc | ✅ BE | ✅ @TRAZA_BE | ✅ | Opcional |
| Nuevo componente | TSDoc | ✅ FE | ✅ @TRAZA_FE | ✅ | Opcional |
| Bug fix | Comentario | Actualizar | ✅ Afectada | ✅ | Opcional |
| Feature completa | Todo | ✅ Todas | ✅ Todas | ✅ | ✅ Recomendado |
| Refactor grande | Comentarios | ✅ Afectadas | ✅ Afectadas | ✅ | ✅ Recomendado |

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Inventario desactualizado | Olvidó actualizar | Incluir en checklist final |
| Traza incompleta | Prisa por terminar | Usar template de traza |
| @PROXIMA no actualizado | No pensó en continuidad | SIEMPRE actualizar al terminar |
| Sin documentación inline | "El código es obvio" | Comentar TODO lo público |
| Reporte faltante | "Era tarea pequeña" | Reporte mínimo siempre |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **Estándares de documentación:** @DIRECTIVAS/ESTANDAR-DOCUMENTACION.md
- **Documentación obligatoria:** @DIRECTIVAS/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
- **Documentación Agile:** @DIRECTIVAS/DIRECTIVA-DOCUMENTACION-AGILE.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
