# SIMCO: MODIFICAR ARCHIVO

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** TODO agente que vaya a modificar un archivo existente
**Prioridad:** OBLIGATORIA

---

## RESUMEN EJECUTIVO

> **Modificar es más delicado que crear. Analiza el impacto antes de cambiar.**

---

## CHECKLIST RÁPIDO

```
ANTES DE MODIFICAR
├── [ ] 1. Leer archivo completo actual
├── [ ] 2. Entender propósito y contexto
├── [ ] 3. Analizar dependencias (quién usa este archivo)
├── [ ] 4. Verificar si hay tests relacionados
└── [ ] 5. Documentar estado ANTES del cambio

DURANTE MODIFICACIÓN
├── [ ] 6. Cambiar solo lo necesario (mínimo impacto)
├── [ ] 7. Mantener convenciones existentes
├── [ ] 8. Actualizar comentarios/documentación inline
└── [ ] 9. NO romper interfaces públicas sin plan de migración

DESPUÉS DE MODIFICAR
├── [ ] 10. Validar que build pasa (@VALIDAR)
├── [ ] 11. Verificar dependencias no rotas
├── [ ] 12. Ejecutar tests relacionados
├── [ ] 13. Actualizar inventario si cambió estructura
└── [ ] 14. Documentar en traza qué se cambió y por qué
```

---

## FASE 1: ANTES DE MODIFICAR

### 1.1 Análisis de Impacto

**Antes de tocar cualquier archivo, responder:**
```markdown
## Análisis de Impacto

### Archivo a Modificar
- **Ruta:** {ruta_completa}
- **Tipo:** DDL | Entity | Service | Controller | DTO | Componente | Hook
- **Propósito:** {descripción}

### Cambio Propuesto
- **Qué:** {descripción del cambio}
- **Por qué:** {justificación}
- **Alcance:** Menor | Moderado | Mayor

### Dependencias Directas (Nivel 1)
- {archivo_1} - usa {función/clase/tipo}
- {archivo_2} - importa {elemento}

### Dependencias Indirectas (Nivel 2-3)
- {archivo_3} - usa {archivo_1}
- {archivo_4} - usa {archivo_2}

### Riesgo de Ruptura
- [ ] Bajo: Cambio interno, no afecta interfaz
- [ ] Medio: Cambia interfaz pero hay pocos consumidores
- [ ] Alto: Cambia interfaz con muchos consumidores

### Tests Relacionados
- {test_1.spec.ts}
- {test_2.spec.ts}
```

### 1.2 Búsqueda de Dependencias

```bash
# Buscar quién importa este archivo
grep -rn "import.*{nombre_archivo}" apps/

# Buscar quién usa esta clase/función
grep -rn "{NombreClase}\|{nombreFuncion}" apps/

# Buscar en tests
grep -rn "{nombre}" apps/**/*.spec.ts

# Para DDL: buscar entities que mapean
grep -rn "'{nombre_tabla}'" @BACKEND
```

### 1.3 Backup Mental

Antes de modificar, documentar estado actual:
```markdown
## Estado Antes de Modificación

**Archivo:** {ruta}
**Commit actual:** {hash si aplica}
**Fecha:** {YYYY-MM-DD HH:MM}

### Secciones que cambiarán:
- Líneas {N}-{M}: {descripción}
- Función {nombre}: {cambio}

### Comportamiento actual:
{descripción breve}

### Comportamiento esperado después:
{descripción breve}
```

---

## FASE 2: DURANTE MODIFICACIÓN

### 2.1 Principio de Mínimo Cambio

```
╔══════════════════════════════════════════════════════════════════════╗
║  CAMBIAR SOLO LO NECESARIO                                           ║
║                                                                       ║
║  ❌ NO reformatear código no relacionado                             ║
║  ❌ NO cambiar estilo de código existente                            ║
║  ❌ NO "mejorar" código que no es parte del cambio                   ║
║  ❌ NO renombrar cosas sin necesidad                                 ║
║                                                                       ║
║  ✅ SÍ cambiar exactamente lo solicitado                             ║
║  ✅ SÍ mantener consistencia con código existente                    ║
║  ✅ SÍ actualizar documentación inline afectada                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 2.2 Mantener Convenciones

**Observar y replicar:**
- Estilo de indentación (espacios vs tabs)
- Formato de imports
- Estilo de comentarios
- Nombres de variables/funciones
- Estructura de archivos

**NO introducir:**
- Nuevos patrones sin discusión
- Librerías adicionales sin justificación
- Cambios de estilo inconsistentes

### 2.3 Cambios en Interfaces Públicas

**Si necesitas cambiar una interfaz pública (función, tipo, endpoint):**

```markdown
## Cambio de Interfaz Pública

### Interfaz Anterior
{definición anterior}

### Interfaz Nueva
{definición nueva}

### Razón del Cambio
{justificación}

### Impacto en Consumidores
- {consumidor_1}: requiere actualización en {línea}
- {consumidor_2}: requiere actualización en {línea}

### Plan de Migración
1. Actualizar interfaz
2. Actualizar consumidor 1
3. Actualizar consumidor 2
4. Ejecutar tests
5. Verificar build
```

### 2.4 Tipos de Modificación

**Agregar (más seguro):**
```typescript
// ✅ Agregar nuevo método sin cambiar existentes
class UserService {
    // ... métodos existentes sin cambios ...

    // NUEVO: Método agregado
    async findByEmail(email: string): Promise<UserEntity | null> {
        // implementación
    }
}
```

**Modificar (requiere cuidado):**
```typescript
// ⚠️ Modificar método existente
class UserService {
    // MODIFICADO: Agregado parámetro opcional
    async findOne(id: string, includeDeleted = false): Promise<UserEntity> {
        // implementación actualizada
    }
}
```

**Eliminar (más peligroso):**
```typescript
// 🛑 Eliminar método - VERIFICAR QUE NO SE USA
class UserService {
    // ELIMINADO: Ya no se usa (verificado con grep)
    // async oldMethod() { ... }
}
```

---

## FASE 3: DESPUÉS DE MODIFICAR

### 3.1 Validación Completa

```bash
# 1. Build
cd @BACKEND_ROOT && npm run build  # o @FRONTEND_ROOT

# 2. Lint
npm run lint

# 3. Tests específicos (si existen)
npm run test -- --grep "{nombre}"

# 4. Tests generales
npm run test
```

### 3.2 Verificar Dependencias

```bash
# Verificar que no hay errores de importación
grep -rn "Cannot find module\|has no exported member" .

# Verificar que no hay errores de tipo
npm run typecheck  # o tsc --noEmit
```

### 3.3 Actualizar Documentación

**En inventario (si cambió estructura):**
```yaml
# @INVENTORY
- name: {nombre}
  # ... campos existentes ...
  last_modified: "{YYYY-MM-DD}"
  modificacion_reciente: "{descripción breve del cambio}"
```

**En traza:**
```markdown
## [{TASK-ID}] Modificar {nombre}

**Fecha:** {YYYY-MM-DD HH:MM}
**Agente:** {Nombre-Agente}
**Tipo:** Modificación

### Archivo Modificado
`{ruta_completa}`

### Cambios Realizados
- {cambio 1}
- {cambio 2}

### Razón
{justificación del cambio}

### Impacto
- Archivos afectados: {N}
- Tests actualizados: {M}

### Validaciones
- [x] Build pasa
- [x] Lint pasa
- [x] Tests pasan
- [x] Dependencias OK
```

---

## MODIFICACIONES POR TIPO DE ARCHIVO

### DDL (SQL)

```markdown
⚠️ MODIFICAR DDL ES ESPECIALMENTE DELICADO

### Proceso Correcto
1. Modificar archivo DDL (NO crear migration)
2. Ejecutar carga limpia completa
3. Verificar integridad referencial
4. Actualizar entities relacionadas si aplica

### NUNCA
- Ejecutar ALTER TABLE directo en BD
- Crear archivo migration separado
- Dejar DDL y BD desincronizados
```

### Entity (TypeORM)

```markdown
### Proceso Correcto
1. Verificar que cambio está alineado con DDL
2. Modificar entity
3. Actualizar DTOs si cambió estructura
4. Actualizar services si cambió lógica
5. Build + tests

### NUNCA
- Cambiar entity sin verificar DDL
- Omitir decoradores de TypeORM
- Cambiar nombres de columnas sin actualizar DDL
```

### Service

```markdown
### Proceso Correcto
1. Verificar contratos (DTOs, interfaces)
2. Modificar lógica
3. Actualizar tests unitarios
4. Verificar controllers que usan el service
5. Build + tests

### NUNCA
- Cambiar firma de método público sin actualizar consumidores
- Introducir efectos secundarios no documentados
```

### Componente React

```markdown
### Proceso Correcto
1. Verificar props actuales
2. Modificar componente
3. Actualizar stories (Storybook) si existe
4. Verificar páginas que usan el componente
5. Build + visual check

### NUNCA
- Cambiar props sin actualizar consumidores
- Romper estilos de otros componentes
- Introducir side effects en render
```

---

## ROLLBACK

### Si algo sale mal después de modificar:

```markdown
## Rollback Requerido

### Problema Detectado
{descripción del problema}

### Acciones de Rollback
1. Revertir cambios en {archivo}
2. Ejecutar build para verificar
3. Ejecutar tests
4. Documentar lección aprendida

### Lección Aprendida
{qué se debió hacer diferente}
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Romper dependencias | No analizó impacto | SIEMPRE buscar dependencias primero |
| Tests fallando | No ejecutó tests | Tests son OBLIGATORIOS |
| Cambios excesivos | "Mejoró" código no relacionado | Solo cambiar lo necesario |
| Inconsistencia DDL-Entity | Modificó uno sin el otro | Mantener sincronizados |
| Sin documentación | Olvidó actualizar traza | Documentar TODO cambio |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **Documentar:** @DOCUMENTAR (SIMCO-DOCUMENTAR.md)
- **Análisis de impacto:** @DIRECTIVAS/DIRECTIVA-ANALISIS-IMPACTO-DEPENDENCIAS.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
