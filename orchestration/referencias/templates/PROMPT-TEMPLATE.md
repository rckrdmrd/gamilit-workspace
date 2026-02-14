# Template de Prompt para Agente Externo

**Version:** 1.1.0
**Directiva:** SIMCO-PROMPTS-AGENTES.md
**Actualizado:** 2026-01-24

Use este template para crear prompts estandarizados para agentes externos.

---

## Instrucciones

1. Copiar la sección "PROMPT" completa
2. Reemplazar todos los placeholders `{...}`
3. Eliminar secciones opcionales que no apliquen
4. Verificar que todas las secciones obligatorias estén completas
5. Registrar en PROMPTS-ACTIVOS.yml antes de enviar al agente

---

## PROMPT

```
Hola, {ROL} para {PROYECTO}.

═══════════════════════════════════════════════════════════════════
CONTEXTO
═══════════════════════════════════════════════════════════════════

Proyecto: {RUTA_PROYECTO}
Tipo: {TIPO}  (STANDALONE | CONSUMER | PROVIDER | INTERMEDIATE)
Stack: {STACK}
Completitud: {PORCENTAJE}%

{CONTEXTO_ADICIONAL_SI_APLICA}

═══════════════════════════════════════════════════════════════════
ARCHIVOS A LEER (en orden)
═══════════════════════════════════════════════════════════════════

1. {ARCHIVO_CONFIG_AGENTE} - Tus capacidades y limitaciones
2. {ARCHIVO_REGLAS} - Reglas del proyecto
3. CLAUDE.md - Reglas base del workspace
4. {ARCHIVO_TAREAS} - Plan de trabajo

{ARCHIVOS_ADICIONALES_SI_APLICA}

═══════════════════════════════════════════════════════════════════
TAREA: {TITULO_TAREA}
═══════════════════════════════════════════════════════════════════

ID: {ID_TAREA}
Prioridad: {PRIORIDAD}
Tipo: {TIPO_TAREA}  (feature | bugfix | refactor | testing | docs)
Story Points: {SP}

Descripción:
{DESCRIPCION_DETALLADA}

═══════════════════════════════════════════════════════════════════
PASOS A EJECUTAR
═══════════════════════════════════════════════════════════════════

1. {PASO_1}
   - Detalle: {DETALLE_1}
   - Archivos: {ARCHIVOS_1}

2. {PASO_2}
   - Detalle: {DETALLE_2}
   - Archivos: {ARCHIVOS_2}

3. {PASO_3}
   - Detalle: {DETALLE_3}
   - Archivos: {ARCHIVOS_3}

{PASOS_ADICIONALES}

═══════════════════════════════════════════════════════════════════
CRITERIOS DE ACEPTACIÓN
═══════════════════════════════════════════════════════════════════

- [ ] {CRITERIO_1}
- [ ] {CRITERIO_2}
- [ ] {CRITERIO_3}
- [ ] Build pasa sin errores
- [ ] Lint pasa sin errores
- [ ] Tests pasan (si existen)

═══════════════════════════════════════════════════════════════════
VALIDACIONES OBLIGATORIAS
═══════════════════════════════════════════════════════════════════

Ejecutar ANTES de marcar como completada:

```bash
# Backend
{COMANDO_BUILD_BACKEND}
{COMANDO_LINT_BACKEND}
{COMANDO_TEST_BACKEND}

# Frontend (si aplica)
{COMANDO_BUILD_FRONTEND}
{COMANDO_LINT_FRONTEND}
```

═══════════════════════════════════════════════════════════════════
GIT (OBLIGATORIO)
═══════════════════════════════════════════════════════════════════

ANTES de trabajar:
```bash
git fetch origin
git pull origin master
```

AL TERMINAR (es submodulo):
```bash
# 1. Commit en proyecto
cd {RUTA_PROYECTO}
git add .
git commit -m "[{ID_TAREA}] {TIPO}: {DESCRIPCION_CORTA}"
git push origin master

# 2. Commit en workspace
cd ../..  # volver a workspace-v2
git add {RUTA_PROYECTO}
git commit -m "[WS] chore: Update {NOMBRE_PROYECTO} submodule"
git push origin master
```

═══════════════════════════════════════════════════════════════════
CHECKPOINTS (si tarea larga)
═══════════════════════════════════════════════════════════════════

Si el contexto supera 50% o necesitas pausar:

1. Crear checkpoint:
   ```markdown
   ## Checkpoint - {ID_TAREA}
   **Fecha:** {FECHA}
   **Progreso:** {X} de {Y} pasos

   **Completado:**
   - [x] Paso 1
   - [x] Paso 2

   **Pendiente:**
   - [ ] Paso 3

   **Archivos modificados:**
   - archivo1.ts

   **Siguiente acción:**
   {DESCRIPCION}
   ```

2. Guardar en: orchestration/checkpoints/CHECKPOINT-{ID_TAREA}.md

3. Pedir limpiar contexto y continuar

{SECCIONES_OPCIONALES}

═══════════════════════════════════════════════════════════════════
HANDOFF CONTRACT (Obligatorio para Fases 2, 3, 4)
═══════════════════════════════════════════════════════════════════

Validación de Entrada (verificar antes de iniciar):
- [ ] Requerimientos originales recibidos
- [ ] Módulos afectados listados
- [ ] Criterios de aceptación definidos
- [ ] Decisiones de fase anterior documentadas

Transfer Data:
- Decision Log: {RUTA_DECISIONS_ACTIVE o "N/A"}
- Archivos en edición: Consultar orchestration/trazas/ACTIVE-FILES.yml
- Bloqueos activos: Consultar orchestration/trazas/BLOCKED-TASKS.yml

Confirmación:
- Fase anterior completada: {SI/NO}
- Gaps detectados: {LISTA o "ninguno"}

SI HAY GAPS: DETENER y escalar a agente de fase anterior.

═══════════════════════════════════════════════════════════════════
REGLAS CRÍTICAS
═══════════════════════════════════════════════════════════════════

- NO eres Claude. Interpreta CLAUDE.md como gobernanza general.
- Carga archivos SOLO cuando los necesites (bajo demanda).
- Si contexto > 50%: crea checkpoint y pide limpiar.
- Sigue CAPVED: Contexto → Análisis → Planeación → Validación → Ejecución → Documentación
- Git: fetch antes, push al terminar (OBLIGATORIO).

═══════════════════════════════════════════════════════════════════

Listo para ejecutar.
```

---

## Secciones Opcionales

### Credenciales (si aplica)

```
═══════════════════════════════════════════════════════════════════
CREDENCIALES
═══════════════════════════════════════════════════════════════════

Base de datos:
- Database: {DATABASE}
- User: {USER}
- Password: {PASSWORD}
- Host: localhost
- Port: 5432

Usuarios de prueba:
- {ROL}: {EMAIL} / {PASSWORD}
```

### URLs (si aplica)

```
═══════════════════════════════════════════════════════════════════
URLs
═══════════════════════════════════════════════════════════════════

- Frontend: http://localhost:{PORT}
- Backend API: http://localhost:{PORT}/api
- Swagger: http://localhost:{PORT}/api/docs
- Health: http://localhost:{PORT}/health
```

### Dependencias (si aplica)

```
═══════════════════════════════════════════════════════════════════
DEPENDENCIAS
═══════════════════════════════════════════════════════════════════

Esta tarea REQUIERE que estén completadas:
- {ID_TAREA_PREVIA_1}: {DESCRIPCION}
- {ID_TAREA_PREVIA_2}: {DESCRIPCION}

Esta tarea BLOQUEA:
- {ID_TAREA_SIGUIENTE}: {DESCRIPCION}
```

### Referencias (si aplica)

```
═══════════════════════════════════════════════════════════════════
REFERENCIAS
═══════════════════════════════════════════════════════════════════

Documentación:
- {ARCHIVO_DOC_1}
- {ARCHIVO_DOC_2}

Código de referencia:
- {ARCHIVO_REF_1}
- {ARCHIVO_REF_2}

Patrones a seguir:
- {PATRON_1}
- {PATRON_2}
```

---

## Checklist Pre-Envío

Antes de enviar el prompt al agente, verificar:

- [ ] ID único generado (PROMPT-YYYY-MM-DD-NNN)
- [ ] Registrado en PROMPTS-ACTIVOS.yml
- [ ] Todos los placeholders reemplazados
- [ ] Contexto completo y claro
- [ ] Pasos específicos y ordenados
- [ ] Criterios de aceptación medibles
- [ ] Comandos de validación correctos
- [ ] Instrucciones de Git correctas
- [ ] Secciones opcionales agregadas si aplican
- [ ] Reglas críticas incluidas

---

## Roles Disponibles

| Placeholder | Opciones |
|-------------|----------|
| {ROL} | ejecutor de tareas, desarrollador full-stack, QA/Testing |
| {AGENTE} | trae, windsurf, gemini |
| {TIPO_TAREA} | feature, bugfix, refactor, testing, docs |
| {PRIORIDAD} | P0, P1, P2, P3 |

---

## Notas

- Para Gemini: Agregar sección de URLs y credenciales siempre
- Para Trae/Windsurf: Enfatizar que NO son Claude
- Para tareas largas (>8 SP): Incluir checkpoints obligatorios
- Para tareas con DB: Incluir credenciales
- Para Fases 2, 3, 4: OBLIGATORIO incluir HANDOFF CONTRACT

---

## Sección HANDOFF CONTRACT (Detalle)

Para prompts de Fase 2, 3 o 4, incluir esta sección completa:

```
═══════════════════════════════════════════════════════════════════
HANDOFF CONTRACT
═══════════════════════════════════════════════════════════════════

Esta tarea es FASE {NUMERO} del flujo de 4 fases.

FASE ANTERIOR ({NUMERO-1}):
- Agente: {AGENTE_ANTERIOR}
- Prompt ID: {PROMPT_ID_ANTERIOR}
- Estado: {COMPLETADA/EN_PROGRESO}
- Resultado: {DESCRIPCION_BREVE}

DECISIONES TOMADAS:
(Copiadas de orchestration/trazas/DECISIONS-ACTIVE.yml)
- {DECISION_1}: {DESCRIPCION}
- {DECISION_2}: {DESCRIPCION}

ARCHIVOS EN EDICIÓN:
(Copiados de orchestration/trazas/ACTIVE-FILES.yml)
- {ARCHIVO_1} por {AGENTE} (lock activo)
- Ninguno (si está vacío)

VERIFICACIÓN:
- [ ] Tengo toda la información de la fase anterior
- [ ] No hay contradicciones con decisiones previas
- [ ] No hay conflictos de archivos
- [ ] Puedo proceder sin ambigüedad

SI FALLA ALGUNA VERIFICACIÓN:
1. NO iniciar trabajo
2. Documentar en orchestration/trazas/BLOCKED-TASKS.yml
3. Esperar resolución de agente superior
```

---

## Archivos de Coordinación

Nuevos archivos para multi-agente:

| Archivo | Propósito | Cuándo Consultar |
|---------|-----------|------------------|
| orchestration/trazas/ACTIVE-FILES.yml | Locks de archivos | ANTES de editar |
| orchestration/trazas/BLOCKED-TASKS.yml | Bloqueos y escaladas | Al encontrar bloqueo |
| orchestration/trazas/DECISIONS-ACTIVE.yml | Decisiones arquitectónicas | ANTES de tomar decisiones |
