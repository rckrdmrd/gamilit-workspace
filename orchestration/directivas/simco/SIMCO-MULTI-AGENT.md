# SIMCO-MULTI-AGENT.md - Directiva de Soporte Multi-Agente

**Versión:** 1.0.0
**Fecha:** 2026-01-20
**Estado:** ACTIVA
**Aplica a:** Todos los agentes (Claude, Gemini, Windsurf, otros)

---

## 1. PROPÓSITO

Esta directiva define cómo el sistema SIMCO se adapta para trabajar con múltiples tipos de agentes que tienen diferentes capacidades. Garantiza que las directivas SIMCO sean ejecutables independientemente del agente que las procese.

## 2. TIPOS DE AGENTES SOPORTADOS

### 2.1 Matriz de Capacidades

| Capacidad | Claude Code | Gemini | Windsurf |
|-----------|-------------|--------|----------|
| **Subagentes** | ✅ Sí | ❌ No | ❌ No |
| **Ejecución paralela** | ✅ Sí | ❌ No | ❌ No |
| **Context window** | 200K+ | Variable | Variable |
| **Web search** | ✅ Sí | ❌ No | ❌ No |
| **Web fetch** | ✅ Sí | ❌ No | ❌ No |
| **Terminal** | Bash | CMD/PS/Bash | CMD/PS/Bash |
| **Permisos granulares** | ✅ Sí | ❌ No | ❌ No |

### 2.2 Ubicación de Configuraciones

| Agente | Carpeta de Configuración |
|--------|--------------------------|
| Claude Code | `.claude/` |
| Gemini (Antigravity) | `.gemini/antigravity/` |
| Windsurf | `.windsurf/` |

### 2.3 Archivos de Configuración por Agente

Cada agente debe tener:

```
.{agente}/
├── README.md                 # Entry point
├── AGENT-CAPABILITIES.yml    # Capacidades y limitaciones
├── LOAD-MAP.yml              # Secuencia de carga de contexto
└── PROJECT_REGISTRY.yml      # Registro de proyectos (opcional)
```

**Archivo compartido:**
- `PLATFORM-CONFIG.yml` - Ubicado en `.gemini/antigravity/`, usado por todos

---

## 3. REGLAS DE ADAPTACIÓN

### 3.1 Regla General

> **Toda directiva SIMCO debe ser ejecutable por CUALQUIER agente.**
> Si una directiva requiere capacidades específicas, debe documentar alternativas.

### 3.2 Adaptación de Delegación (CRÍTICO)

Cuando una directiva menciona "delegar a subagente":

**Claude Code (tiene subagentes):**
```
→ Usar Task tool con subagent_type apropiado
→ Ejecutar en paralelo si es posible
```

**Gemini / Windsurf (sin subagentes):**
```
→ NO detenerse pidiendo subagentes
→ Aplicar Self-Persona Switch:
   1. Identificar perfil requerido (ej: PERFIL-DATABASE.md)
   2. Leer y adoptar las reglas de ese perfil
   3. Ejecutar la tarea con esas reglas
   4. Retornar al comportamiento general
→ Convertir tareas paralelas a secuenciales
```

### 3.3 Adaptación de Ejecución Paralela

Cuando una directiva menciona "ejecutar en paralelo":

**Claude Code:**
```
→ Usar múltiples Task tool calls en un solo mensaje
```

**Gemini / Windsurf:**
```
→ Convertir a ejecución secuencial
→ Ordenar por dependencias (independientes primero)
→ Usar todo list para trackear progreso
```

### 3.4 Adaptación de Plataforma

Cuando una directiva incluye comandos de terminal:

**Detectar plataforma primero:**
```
Ruta empieza con C:\ o D:\  → Windows
Ruta empieza con /home/     → Linux
Ruta empieza con /mnt/c/    → WSL
```

**Adaptar comandos:**

| Operación | Linux/WSL | Windows CMD |
|-----------|-----------|-------------|
| Listar archivos | `ls -la` | `dir` |
| Variable de entorno inline | `VAR=value cmd` | `set VAR=value && cmd` |
| Ejecutar script bash | `./script.sh` | `bash script.sh` o `wsl bash script.sh` |
| Buscar archivos | `find . -name "*.ts"` | Usar herramienta Glob del agente |
| Buscar contenido | `grep -r "pattern"` | Usar herramienta Grep del agente |

**npm scripts con variables de entorno:**
```bash
# ❌ NO funciona en Windows
NODE_OPTIONS='--max-old-space-size=4096' jest

# ✅ Funciona en todos (si package.json usa cross-env)
npm test
```

---

## 4. ESTRUCTURA DE DIRECTIVAS COMPATIBLES

### 4.1 Template de Directiva Multi-Agente

Toda directiva SIMCO debe seguir esta estructura:

```markdown
# SIMCO-{NOMBRE}.md

## Propósito
[Descripción]

## Aplicabilidad
- **Agentes:** Todos | Claude | Gemini | Windsurf
- **Requiere subagentes:** Sí/No
- **Plataforma:** Todas | Windows | Linux

## Procedimiento

### Paso N: [Nombre del paso]

**Acción estándar:**
[Descripción de la acción]

**Adaptación sin subagentes:** (si aplica)
[Cómo ejecutar si el agente no tiene subagentes]

**Adaptación Windows:** (si aplica)
[Comando o procedimiento alternativo para Windows]
```

### 4.2 Marcadores de Compatibilidad

Usar estos marcadores en directivas:

```markdown
> [!MULTI-AGENT]
> Esta sección requiere adaptación según el tipo de agente.
> Ver SIMCO-MULTI-AGENT.md para detalles.

> [!SUBAGENT-REQUIRED]
> Esta acción requiere subagentes. Agentes sin subagentes
> deben usar Self-Persona Switch.

> [!PLATFORM-SPECIFIC]
> Este comando varía según plataforma.
> Ver PLATFORM-CONFIG.yml para sintaxis correcta.
```

---

## 5. PROTOCOLO DE INICIALIZACIÓN POR AGENTE

### 5.1 Claude Code

```
1. Cargar CLAUDE.md (auto-cargado)
2. Cargar .claude/settings.local.json (permisos)
3. Identificar proyecto (si aplica)
4. Cargar directiva SIMCO según tarea
5. Asignar perfil o delegar a subagente
6. Ejecutar
```

### 5.2 Gemini (Antigravity)

```
1. Detectar plataforma (CRÍTICO - antes de cualquier comando)
2. Cargar .gemini/antigravity/BOOTLOADER_PROTOCOL.md
3. Verificar PROJECT_REGISTRY.yml
4. Cargar CLAUDE.md (reglas base)
5. Cargar AGENT-CAPABILITIES.yml (limitaciones)
6. Seguir LOAD-MAP.yml para contexto
7. Aplicar Self-Persona Switch si se requiere especialización
8. Ejecutar secuencialmente
```

### 5.3 Windsurf

```
1. Detectar plataforma (CRÍTICO)
2. Cargar .windsurf/README.md
3. Verificar PROJECT_REGISTRY.yml
4. Cargar CLAUDE.md (reglas base)
5. Cargar AGENT-CAPABILITIES.yml (limitaciones)
6. Seguir LOAD-MAP.yml para contexto
7. Aplicar Self-Persona Switch si se requiere especialización
8. Ejecutar secuencialmente
```

---

## 6. SELF-PERSONA SWITCH (Patrón de Adaptación)

### 6.1 Definición

El Self-Persona Switch es el patrón que permite a agentes sin subagentes ejecutar tareas que normalmente requerirían delegación.

### 6.2 Procedimiento

```
CUANDO: Tarea requiere conocimiento especializado (ej: DDL, Backend, Frontend)

1. IDENTIFICAR perfil requerido
   - Buscar en orchestration/agents/perfiles/_MAP.md
   - Ejemplo: tarea de base de datos → PERFIL-DATABASE.md

2. CARGAR perfil
   - Leer orchestration/agents/perfiles/PERFIL-{TIPO}.md
   - Notar: validaciones, restricciones, estándares

3. ADOPTAR reglas del perfil
   - Aplicar validaciones del perfil
   - Seguir estándares del perfil
   - Respetar restricciones del perfil

4. EJECUTAR tarea
   - Con las reglas del perfil adoptado

5. RETORNAR a comportamiento general
   - Continuar con siguiente tarea
```

### 6.3 Ejemplo Práctico

```
Tarea: "Crear tabla de usuarios con migraciones"

Sin Self-Persona Switch (Claude Code):
→ Delegar a NEXUS-DATABASE subagent
→ Subagente ejecuta y retorna

Con Self-Persona Switch (Gemini/Windsurf):
→ Leer PERFIL-DATABASE.md
→ Notar: "Toda tabla debe tener id UUID, created_at, updated_at"
→ Notar: "Validar con npm run build después de cambios DDL"
→ Ejecutar creación de tabla siguiendo esas reglas
→ Validar con build
→ Continuar con siguiente paso
```

---

## 7. MAPEO DE PERFILES A TAREAS

| Palabras clave en tarea | Perfil a adoptar |
|-------------------------|------------------|
| tabla, DDL, migración, schema, índice | PERFIL-DATABASE.md |
| endpoint, API, service, controller, NestJS | PERFIL-BACKEND.md |
| componente, React, UI, página, hook | PERFIL-FRONTEND.md |
| test, jest, spec, coverage, mock | PERFIL-TESTING.md |
| Docker, CI/CD, pipeline, deploy, k8s | PERFIL-DEVOPS.md |
| documentar, README, ADR, changelog | PERFIL-DOCUMENTATION.md |
| seguridad, auth, JWT, permisos, OWASP | PERFIL-SECURITY.md |

---

## 8. VALIDACIONES POR TIPO DE AGENTE

### 8.1 Validaciones Comunes (Todos los agentes)

```bash
npm run build     # Debe pasar
npm run lint      # Debe pasar
npm run test      # Si existen, deben pasar
```

### 8.2 Validaciones Específicas

**Claude Code:**
- Puede ejecutar validaciones en paralelo
- Puede delegar validación a subagente QA

**Gemini / Windsurf:**
- Ejecutar validaciones secuencialmente
- Usar cross-env si los scripts lo requieren

---

## 9. TROUBLESHOOTING MULTI-AGENTE

### 9.1 Agente se queda "pasmado"

**Síntoma:** Agente no avanza, parece bloqueado

**Diagnóstico:**
1. ¿Intentó ejecutar comando con sintaxis incorrecta de plataforma?
2. ¿Intentó delegar a subagente que no existe?
3. ¿Se agotó el contexto?

**Solución:**
1. Verificar PLATFORM-CONFIG.yml para sintaxis correcta
2. Aplicar Self-Persona Switch en lugar de delegar
3. Dividir tarea en pasos más pequeños

### 9.2 Comando falla en Windows

**Síntoma:** Error de sintaxis o comando no reconocido

**Diagnóstico:**
- `NODE_OPTIONS='...'` → Sintaxis bash, no funciona en CMD
- `./script.sh` → Script bash, no ejecutable en CMD

**Solución:**
- Usar cross-env en package.json
- Ejecutar via `bash script.sh` o `wsl bash script.sh`

### 9.3 Directiva pide subagente

**Síntoma:** Directiva dice "delegar a X-Agent"

**Solución para Gemini/Windsurf:**
```
1. NO detenerse
2. Identificar qué perfil corresponde a "X-Agent"
3. Leer ese perfil
4. Ejecutar la tarea con las reglas del perfil
5. Continuar
```

---

## 10. CHECKLIST DE COMPATIBILIDAD

Antes de crear o modificar una directiva SIMCO, verificar:

- [ ] ¿Funciona sin subagentes? (Self-Persona Switch documentado)
- [ ] ¿Funciona en Windows? (comandos adaptados o alternativas documentadas)
- [ ] ¿Funciona con contexto limitado? (pasos pequeños y claros)
- [ ] ¿Tiene marcadores de compatibilidad donde aplica?
- [ ] ¿Referencias a archivos usan rutas relativas?

---

## 11. REFERENCIAS

### Configuraciones de Agentes
- Claude: `.claude/settings.local.json`
- Gemini: `.gemini/antigravity/AGENT-CAPABILITIES.yml`
- Windsurf: `.windsurf/AGENT-CAPABILITIES.yml`

### Configuración de Plataforma
- `.gemini/antigravity/PLATFORM-CONFIG.yml` (compartido)

### Perfiles de Agentes
- `orchestration/agents/perfiles/_MAP.md`
- `orchestration/agents/ALIASES.yml`

### Otras Directivas Relacionadas
- `SIMCO-DELEGACION.md` - Protocolo de delegación (Claude)
- `SIMCO-DELEGACION-PARALELA.md` - Ejecución paralela (Claude)
- `SIMCO-TAREA.md` - Punto de entrada de tareas

---

## 12. HISTORIAL DE CAMBIOS

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-01-20 | Versión inicial con soporte Claude, Gemini, Windsurf |
