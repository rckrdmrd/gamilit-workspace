# DIRECTIVA: Validación Detallada por Agentes Claude

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Aplica a:** Claude Code (Opus, Sonnet) validando tareas de agentes externos
**Criticidad:** OBLIGATORIA

---

## PROPÓSITO

Esta directiva establece el proceso OBLIGATORIO para que agentes Claude validen
tareas ejecutadas por agentes externos (Windsurf, Trae, Gemini) que NO razonan
y pueden cometer errores sistemáticos.

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   VALIDAR ≠ VERIFICAR EXISTENCIA                                         ║
║                                                                           ║
║   INCORRECTO: "¿Existe el archivo? Sí → Validado"                        ║
║   CORRECTO:   "¿El código es correcto y no hay duplicados?"              ║
║                                                                           ║
║   Claude DEBE leer y analizar el CONTENIDO, no solo la presencia.        ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## NIVELES DE VALIDACIÓN

### Nivel 1: Validación de Existencia (INSUFICIENTE)
```
- Verificar que archivos reportados existen
- Verificar que TAREAS-PENDIENTES.yml está actualizado
```
**ESTE NIVEL NO ES SUFICIENTE PARA MARCAR TAREA COMO VALIDADA**

### Nivel 2: Validación de Contenido (MÍNIMO REQUERIDO)
```
- Leer archivos creados/modificados
- Verificar sintaxis y estructura
- Verificar build/lint pasan
```

### Nivel 3: Validación Detallada (RECOMENDADO)
```
- Todo de Nivel 2 +
- Verificar anti-duplicación
- Comparar con DDL/especificaciones
- Validar calidad del código
- Comparar con versiones existentes si hay duplicados
```

### Nivel 4: Validación Exhaustiva (PARA TAREAS CRÍTICAS)
```
- Todo de Nivel 3 +
- Ejecutar tests unitarios
- Verificar coherencia entre capas
- Validar integraciones
```

---

## PROCESO DE VALIDACIÓN DETALLADA

### PASO 1: Recibir Reporte de Tarea Completada

```
Input del usuario: "Tarea {ID} completada por Windsurf"

Claude debe:
1. Leer TAREAS-PENDIENTES.yml para obtener contexto
2. Identificar archivos reportados como creados/modificados
3. NO confiar ciegamente en el reporte
```

### PASO 2: Verificación Anti-Duplicación

```
EJECUTAR SIEMPRE antes de validar archivos:

1. Para cada archivo reportado como CREADO:
   - Buscar si existe archivo similar en OTRAS ubicaciones
   - Comando: find . -name "*{nombre}*" -type f
   - Comando: grep -rn "class {Nombre}" --include="*.ts"

2. SI se encuentran archivos similares:
   - LEER ambos archivos
   - COMPARAR contenido
   - DETERMINAR:
     a) ¿Es duplicado exacto? → ERROR CRÍTICO
     b) ¿Es versión inferior? → ERROR CRÍTICO
     c) ¿Es versión diferente válida? → OK pero documentar

3. SI hay duplicados:
   - REPORTAR como error
   - RECOMENDAR eliminar duplicado
   - NO marcar tarea como validada
```

### PASO 3: Validación de Contenido

```
Para cada archivo creado/modificado:

1. LEER el archivo completo (usar Read tool)

2. VERIFICAR según tipo de archivo:

   --- ENTITY (TypeORM) ---
   [ ] Decoradores correctos (@Entity, @Column, etc.)
   [ ] Tipos TypeScript correctos
   [ ] Nullable correctamente marcado
   [ ] Índices definidos
   [ ] Relaciones definidas (si aplica)
   [ ] Column names con snake_case (si aplica)
   [ ] Coherencia con DDL correspondiente

   --- SERVICE ---
   [ ] Inyección de dependencias correcta
   [ ] Métodos CRUD si es repositorio
   [ ] Manejo de errores
   [ ] Tipado correcto

   --- API CLIENT (Frontend) ---
   [ ] Endpoint correcto
   [ ] Tipos de request/response
   [ ] Métodos HTTP correctos
   [ ] Error handling

   --- HOOK (React Query) ---
   [ ] Query key definido
   [ ] useQuery/useMutation correctos
   [ ] Tipos genéricos correctos
   [ ] onSuccess/onError handlers
```

### PASO 4: Comparación con Especificación

```
Si la tarea tiene DDL o especificación de referencia:

1. LEER el DDL/especificación
2. COMPARAR campo por campo:
   - ¿Todos los campos del DDL están en la entity?
   - ¿Los tipos coinciden?
   - ¿Los defaults coinciden?
   - ¿Los índices coinciden?

3. DOCUMENTAR discrepancias:
   | Campo DDL | Valor DDL | Campo Entity | Valor Entity | Match? |
   |-----------|-----------|--------------|--------------|--------|
```

### PASO 5: Comparación con Originales (si hay duplicados)

```
Si se detectaron archivos similares:

1. LEER versión original
2. LEER versión nueva (creada por agente)
3. COMPARAR calidad:

   | Aspecto | Original | Nueva | Superior |
   |---------|----------|-------|----------|
   | Campos completos | ? | ? | ? |
   | Tipos TypeScript | ? | ? | ? |
   | Relaciones | ? | ? | ? |
   | Decoradores | ? | ? | ? |
   | Soft delete | ? | ? | ? |

4. DETERMINAR:
   - Si original es superior → Eliminar nueva, mantener original
   - Si nueva es superior → Eliminar original, mantener nueva
   - Si son iguales → Eliminar duplicado más reciente
```

---

## CHECKLIST DE VALIDACIÓN

### Validación Básica (Nivel 2)
```markdown
## Validación: {TASK-ID}

### Archivos Verificados
- [ ] Archivo 1: {ruta} - EXISTE
- [ ] Archivo 2: {ruta} - EXISTE

### Build/Lint
- [ ] Build pasa: SI/NO
- [ ] Lint pasa: SI/NO

### Estado
- [ ] VALIDADO: Todo correcto
- [ ] RECHAZADO: Errores encontrados
```

### Validación Detallada (Nivel 3) - USAR ESTE
```markdown
## Validación Detallada: {TASK-ID}

### 1. Verificación Anti-Duplicación
- [ ] Búsqueda realizada en todo el proyecto
- [ ] Duplicados encontrados: SI/NO
  - Si SI: {listar ubicaciones}
  - Decisión: {mantener/eliminar}

### 2. Análisis de Contenido
Para cada archivo:

#### Archivo: {ruta}
**Tipo:** {entity/service/component/etc}

**Checklist específico:**
- [ ] Sintaxis correcta
- [ ] Estructura correcta
- [ ] Tipos correctos
- [ ] Decoradores correctos (si aplica)
- [ ] Coherencia con DDL/spec

**Problemas encontrados:**
- {problema 1}
- {problema 2}

**Calidad del código:** {Excelente/Buena/Aceptable/Deficiente}

### 3. Comparación con Especificación
- [ ] DDL/spec leído
- [ ] Campos coinciden: SI/NO
- [ ] Tipos coinciden: SI/NO
- [ ] Discrepancias: {listar}

### 4. Comparación con Originales (si hay duplicados)
| Aspecto | Original | Nueva | Superior |
|---------|----------|-------|----------|
| ... | ... | ... | ... |

**Recomendación:** {Mantener original/Mantener nueva/Merge}

### 5. Veredicto Final

**Estado:**
- [ ] APROBADA - Todo correcto
- [ ] APROBADA CON OBSERVACIONES - Funciona pero hay mejoras
- [ ] RECHAZADA - Errores críticos
- [ ] REQUIERE CORRECCIÓN - Errores que deben corregirse

**Errores Críticos:**
- {error 1}

**Mejoras Recomendadas:**
- {mejora 1}

**Acciones Requeridas:**
- [ ] {acción 1}
- [ ] {acción 2}
```

---

## CRITERIOS DE RECHAZO AUTOMÁTICO

La tarea debe RECHAZARSE automáticamente si:

1. **Duplicación de archivos** - Se crearon archivos que ya existían
2. **Build falla** - El código no compila
3. **Coherencia DDL-Entity rota** - Campos no coinciden con DDL
4. **Versión inferior** - Nueva versión es menos completa que existente
5. **Ubicación incorrecta** - Archivo en módulo equivocado
6. **Sin actualización de inventario** - Inventarios desactualizados

---

## RESPUESTA ESTÁNDAR DE VALIDACIÓN

### Si Tarea APROBADA:
```markdown
## Validación N1-ERP-002: APROBADA

### Resumen
- Archivos validados: X
- Duplicados: NO
- Coherencia DDL: OK
- Calidad código: Buena

### Detalles
{tabla de validación}

### Siguiente Tarea
Proceder con {siguiente tarea}
```

### Si Tarea RECHAZADA:
```markdown
## Validación N1-ERP-002: RECHAZADA

### Errores Críticos Encontrados

1. **DUPLICACIÓN DE ARCHIVOS**
   - Archivo creado: {ruta_nueva}
   - Ya existía en: {ruta_original}
   - Versión original es SUPERIOR

2. **{otro error}**
   - Detalle...

### Acciones Correctivas Requeridas

1. ELIMINAR archivos duplicados:
   - {ruta1}
   - {ruta2}

2. REVERTIR estado de tarea a "pendiente"

3. RE-EJECUTAR tarea siguiendo procedimiento correcto

### NO proceder con siguientes tareas hasta corregir
```

---

## INTEGRACIÓN CON FLUJO DE TRABAJO

```
1. Agente externo completa tarea
           ↓
2. Usuario reporta a Claude: "Tarea completada"
           ↓
3. Claude ejecuta VALIDACIÓN DETALLADA (este documento)
           ↓
4. SI APROBADA → Continuar con siguiente tarea
   SI RECHAZADA → Indicar correcciones necesarias
           ↓
5. Agente externo corrige
           ↓
6. Volver a paso 2
```

---

## REGLA DE ORO

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   LEER el código, no solo verificar que existe.                          ║
║   COMPARAR con especificaciones, no confiar en reportes.                 ║
║   BUSCAR duplicados, no asumir que el agente lo hizo.                    ║
║   RECHAZAR si hay errores, no aprobar por defecto.                       ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

*DIRECTIVA-VALIDACION-DETALLADA-CLAUDE v1.0.0 - Sistema SIMCO*
