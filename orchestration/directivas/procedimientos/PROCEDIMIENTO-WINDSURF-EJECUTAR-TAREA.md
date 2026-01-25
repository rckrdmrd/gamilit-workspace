# PROCEDIMIENTO: Ejecutar Tarea (Windsurf/Cascade)

**Version:** 1.1.0
**Fecha:** 2026-01-20
**Aplica a:** Windsurf (Cascade) - Modelo que NO razona
**Criticidad:** OBLIGATORIA

---

## CONTEXTO: Flujo de 4 Fases

Este procedimiento corresponde a la **FASE 3** del flujo optimizado de agentes:

```
FASE 1: Claude Code → Análisis inicial + Plan alto nivel
FASE 2: Trae (Gemini) → Análisis detallado + Plan ATÓMICO  ← Genera tu input
FASE 3: Windsurf → EJECUCIÓN (ESTE PROCEDIMIENTO)
FASE 4: Claude/Trae → Validación detallada
```

**IMPORTANTE:** Si recibes una tarea directamente (sin pasar por Fase 2):
- Verificar que el plan sea ULTRA-DETALLADO
- Si hay ambigüedades, DETENER y solicitar clarificación
- Referencias: `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   WINDSURF NO RAZONA - EJECUTA INSTRUCCIONES LITERALMENTE                ║
║                                                                           ║
║   Por lo tanto:                                                           ║
║   - Cada paso debe ser EXPLÍCITO y COMPLETO                              ║
║   - Cada decisión debe tener ACCIONES DEFINIDAS                          ║
║   - Nunca asumir que el modelo "inferirá" el contexto                    ║
║   - Siempre VERIFICAR antes de CREAR                                     ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## FLUJO MAESTRO DE EJECUCIÓN

### FASE 0: SINCRONIZACIÓN GIT (SIEMPRE PRIMERO)
```bash
# EJECUTAR SIEMPRE antes de cualquier trabajo
cd {ruta_proyecto}
git fetch origin
git log HEAD..origin/main --oneline

# SI hay output (commits remotos):
git pull origin main

# SI es submodulo:
git submodule update --init --recursive
```

---

### FASE 1: VERIFICACIÓN PRE-EJECUCIÓN

**ANTES de ejecutar CUALQUIER tarea, seguir este árbol de decisiones:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASO 1.1: ¿La tarea requiere CREAR archivos nuevos?                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   SI → IR A VERIFICACIÓN ANTI-DUPLICACIÓN (Paso 1.2)                │
│   NO → IR A VERIFICACIÓN DE EXISTENCIA (Paso 1.3)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 1.2: VERIFICACIÓN ANTI-DUPLICACIÓN                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Ejecutar TODOS estos comandos de búsqueda:                          │
│                                                                      │
│ # Buscar en TODOS los módulos del proyecto                          │
│ find . -name "*{nombre}*" -type f                                   │
│ find . -name "*{Nombre}*" -type f                                   │
│                                                                      │
│ # Buscar definiciones de clase/interface                            │
│ grep -rn "class {Nombre}" --include="*.ts"                          │
│ grep -rn "interface {Nombre}" --include="*.ts"                      │
│ grep -rn "@Entity.*{nombre}" --include="*.ts"                       │
│                                                                      │
│ # Buscar en inventarios                                             │
│ grep -i "{nombre}" orchestration/inventarios/*.yml                  │
│                                                                      │
│ RESULTADO A: Se encontraron archivos similares                      │
│   → DETENER. NO crear nuevo archivo.                                │
│   → IR A PASO 1.4 (Decisión: Modificar o Integrar)                  │
│                                                                      │
│ RESULTADO B: No se encontraron archivos similares                   │
│   → CONTINUAR con creación del archivo                              │
│   → IR A FASE 2 (Ejecución)                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 1.3: VERIFICACIÓN DE EXISTENCIA (para tareas de modificación)  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Verificar que el archivo a modificar EXISTE:                        │
│                                                                      │
│ ls -la {ruta_archivo}                                               │
│                                                                      │
│ RESULTADO A: Archivo existe                                         │
│   → LEER el archivo completo antes de modificar                     │
│   → Entender estructura actual                                      │
│   → IR A FASE 2 (Ejecución)                                         │
│                                                                      │
│ RESULTADO B: Archivo NO existe                                      │
│   → REPORTAR: "El archivo {ruta} no existe"                         │
│   → DETENER y preguntar cómo proceder                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 1.4: DECISIÓN - MODIFICAR vs INTEGRAR                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Se encontró archivo similar en: {ubicación_encontrada}              │
│                                                                      │
│ LEER el archivo encontrado:                                         │
│ cat {ubicación_encontrada}                                          │
│                                                                      │
│ COMPARAR con lo que se iba a crear:                                 │
│                                                                      │
│ CASO A: Es EXACTAMENTE lo que se necesita                           │
│   → REPORTAR: "Ya existe en {ubicación}"                            │
│   → NO crear nada nuevo                                             │
│   → Marcar tarea como "Ya completada previamente"                   │
│                                                                      │
│ CASO B: Existe pero le FALTAN campos/funcionalidad                  │
│   → MODIFICAR el archivo existente                                  │
│   → Agregar los campos/funcionalidad faltantes                      │
│   → NO crear archivo duplicado                                      │
│                                                                      │
│ CASO C: Existe pero es DIFERENTE (otra entidad/propósito)           │
│   → CREAR nuevo archivo con nombre distintivo                       │
│   → Documentar la diferencia                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### FASE 2: EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASO 2.1: LEER REFERENCIAS ANTES DE ESCRIBIR                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Si vas a crear un archivo nuevo:                                    │
│                                                                      │
│ 1. Buscar archivo similar en el mismo módulo:                       │
│    ls {directorio_destino}                                          │
│                                                                      │
│ 2. Leer un archivo de referencia:                                   │
│    cat {archivo_similar}                                            │
│                                                                      │
│ 3. Usar MISMO patrón:                                               │
│    - Mismos imports                                                 │
│    - Misma estructura                                               │
│    - Mismas convenciones de nombres                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 2.2: CREAR/MODIFICAR ARCHIVO                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Aplicar cambios siguiendo el plan de la tarea.                      │
│                                                                      │
│ REGLAS:                                                             │
│ - Un archivo a la vez                                               │
│ - Guardar después de cada cambio                                    │
│ - Verificar sintaxis antes de continuar                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 2.3: ACTUALIZAR INDEX (si aplica)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Si creaste archivo nuevo, actualizar index.ts:                      │
│                                                                      │
│ 1. Buscar index.ts en el directorio:                                │
│    ls {directorio}/index.ts                                         │
│                                                                      │
│ 2. Si existe, agregar export:                                       │
│    export * from './{nuevo_archivo}';                               │
│                                                                      │
│ 3. Si NO existe, crear index.ts con todos los exports               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### FASE 3: VALIDACIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASO 3.1: VALIDAR BUILD                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ cd {ruta_proyecto}/backend                                          │
│ npm run build                                                       │
│                                                                      │
│ RESULTADO: BUILD FAILED                                             │
│   → Leer errores                                                    │
│   → Corregir cada error                                             │
│   → Repetir build hasta que pase                                    │
│                                                                      │
│ RESULTADO: BUILD SUCCESS                                            │
│   → Continuar a siguiente paso                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 3.2: VALIDAR LINT                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ npm run lint                                                        │
│                                                                      │
│ RESULTADO: ERRORES                                                  │
│   → Corregir errores de lint                                        │
│   → Repetir hasta que pase                                          │
│                                                                      │
│ RESULTADO: WARNINGS                                                 │
│   → Aceptable, continuar                                            │
│                                                                      │
│ RESULTADO: PASS                                                     │
│   → Continuar                                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### FASE 4: DOCUMENTACIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASO 4.1: ACTUALIZAR INVENTARIO                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Según tipo de archivo creado/modificado:                            │
│                                                                      │
│ - Entity → BACKEND_INVENTORY.yml                                    │
│ - Tabla DDL → DATABASE_INVENTORY.yml                                │
│ - Componente → FRONTEND_INVENTORY.yml                               │
│ - API Client → FRONTEND_INVENTORY.yml                               │
│                                                                      │
│ Agregar entrada con:                                                │
│ - Nombre del archivo                                                │
│ - Ruta completa                                                     │
│ - Fecha de creación/modificación                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 4.2: ACTUALIZAR TAREAS-PENDIENTES.yml                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Cambiar estado de la tarea:                                         │
│   estado: "pendiente" → "completada"                                │
│                                                                      │
│ Agregar:                                                            │
│   fecha_fin: "{YYYY-MM-DDTHH:MM:SSZ}"                               │
│   notas: "{descripción de lo realizado}"                            │
│                                                                      │
│ Agregar al historial:                                               │
│   - fecha: "{YYYY-MM-DDTHH:MM:SSZ}"                                 │
│     accion: "Tarea completada"                                      │
│     autor: "Cascade (Claude)"                                       │
│     descripcion: "{resumen detallado}"                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### FASE 5: COMMIT Y PUSH

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASO 5.1: GIT STATUS                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ git status                                                          │
│                                                                      │
│ Verificar:                                                          │
│ - Todos los archivos modificados son esperados                      │
│ - No hay archivos inesperados                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASO 5.2: COMMIT + PUSH                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ # Si es SUBMODULO:                                                  │
│ cd {ruta_submodulo}                                                 │
│ git add .                                                           │
│ git commit -m "[{TASK-ID}] {tipo}: {descripcion}"                   │
│ git push origin main                                                │
│                                                                      │
│ # Luego en WORKSPACE:                                               │
│ cd {ruta_workspace}                                                 │
│ git add .                                                           │
│ git commit -m "[{TASK-ID}] {tipo}: {descripcion}"                   │
│ git push origin main                                                │
│                                                                      │
│ VERIFICAR:                                                          │
│ git status   # Debe mostrar "working tree clean"                    │
│ git log origin/main..HEAD --oneline  # Debe estar vacío             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CHECKLIST DE REPORTE FINAL

Al completar la tarea, el reporte debe incluir:

```markdown
## Reporte de Ejecución: {TASK-ID}

### 1. Verificación Pre-Ejecución
- [ ] Búsqueda de duplicados realizada
- [ ] Resultado: {No encontrados / Encontrados en X}
- [ ] Decisión tomada: {Crear nuevo / Modificar existente / Ya existía}

### 2. Archivos Creados/Modificados
| Archivo | Acción | Ubicación |
|---------|--------|-----------|
| {nombre} | {creado/modificado} | {ruta completa} |

### 3. Validaciones
- [ ] Build: PASS/FAIL
- [ ] Lint: PASS/FAIL

### 4. Documentación
- [ ] Inventario actualizado
- [ ] TAREAS-PENDIENTES.yml actualizado

### 5. Git
- [ ] Commit realizado
- [ ] Push completado
- [ ] Working tree clean: SI/NO

### 6. Notas Adicionales
{Cualquier observación relevante}
```

---

## ERRORES COMUNES Y CÓMO EVITARLOS

| Error | Causa | Prevención |
|-------|-------|------------|
| Crear archivo duplicado | No verificó existencia | SIEMPRE ejecutar FASE 1 completa |
| Archivo en ubicación incorrecta | No consultó estructura | Leer archivo similar de referencia |
| Build falla | Syntax error | Validar ANTES de reportar completado |
| Inventario desactualizado | Olvidó actualizar | Incluir en checklist obligatorio |
| Git no sincronizado | Olvidó push | SIEMPRE terminar con git status clean |

---

## REGLA DE ORO

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   VERIFICAR → COMPARAR → DECIDIR → EJECUTAR → VALIDAR → DOCUMENTAR       ║
║                                                                           ║
║   NUNCA: EJECUTAR primero y verificar después                            ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

*PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA v1.0.0 - Sistema SIMCO*
