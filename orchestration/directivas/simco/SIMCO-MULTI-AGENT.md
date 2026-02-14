# SIMCO-MULTI-AGENT

**Version:** 2.0.0
**Fecha:** 2026-02-13
**Aplica a:** Todos los agentes (Claude, Gemini, Windsurf, otros)
**Criticidad:** RECOMENDADA
**Tipo:** Directiva de Compatibilidad Multi-Agente
**Alias:** @MULTI_AGENT
**Depende de:** SIMCO-DELEGACION.md

---

## 1. Proposito

Define como el sistema SIMCO se adapta para trabajar con multiples tipos de agentes
que tienen diferentes capacidades. Garantiza que las directivas SIMCO sean ejecutables
independientemente del agente que las procese.

---

## 2. Tipos de Agentes Soportados

### 2.1 Matriz de Capacidades

| Capacidad | Claude Code | Gemini | Windsurf |
|-----------|-------------|--------|----------|
| **Subagentes** | Si | No | No |
| **Ejecucion paralela** | Si | No | No |
| **Context window** | 200K+ | Variable | Variable |
| **Web search** | Si | No | No |
| **Web fetch** | Si | No | No |
| **Terminal** | Bash | CMD/PS/Bash | CMD/PS/Bash |
| **Permisos granulares** | Si | No | No |

### 2.2 Ubicacion de Configuraciones

| Agente | Carpeta de Configuracion |
|--------|--------------------------|
| Claude Code | `.claude/` |
| Gemini | `.gemini/` |
| Windsurf | `.windsurf/` |

---

## 3. Reglas de Adaptacion

### 3.1 Regla General

> **Toda directiva SIMCO debe ser ejecutable por CUALQUIER agente.**
> Si una directiva requiere capacidades especificas, debe documentar alternativas.

### 3.2 Adaptacion de Delegacion (CRITICO)

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
   1. Identificar perfil requerido (ej: PERFIL-DATABASE-POSTGRESQL.md)
   2. Leer y adoptar las reglas de ese perfil
   3. Ejecutar la tarea con esas reglas
   4. Retornar al comportamiento general
→ Convertir tareas paralelas a secuenciales
```

### 3.3 Adaptacion de Ejecucion Paralela

Cuando una directiva menciona "ejecutar en paralelo":

**Claude Code:**
```
→ Usar multiples Task tool calls en un solo mensaje
```

**Gemini / Windsurf:**
```
→ Convertir a ejecucion secuencial
→ Ordenar por dependencias (independientes primero)
→ Usar todo list para trackear progreso
```

### 3.4 Adaptacion de Plataforma

Cuando una directiva incluye comandos de terminal:

**Detectar plataforma primero:**
```
Ruta empieza con C:\ o D:\  → Windows
Ruta empieza con /home/     → Linux
Ruta empieza con /mnt/c/    → WSL
```

**Adaptar comandos:**

| Operacion | Linux/WSL | Windows CMD |
|-----------|-----------|-------------|
| Listar archivos | `ls -la` | `dir` |
| Variable de entorno inline | `VAR=value cmd` | `set VAR=value && cmd` |
| Ejecutar script bash | `./script.sh` | `bash script.sh` o `wsl bash script.sh` |
| Buscar archivos | `find . -name "*.ts"` | Usar herramienta Glob del agente |
| Buscar contenido | `grep -r "pattern"` | Usar herramienta Grep del agente |

**npm scripts con variables de entorno:**
```bash
# NO funciona en Windows
NODE_OPTIONS='--max-old-space-size=4096' jest

# Funciona en todos (si package.json usa cross-env)
npm test
```

---

## 4. Estructura de Directivas Compatibles

### 4.1 Template de Directiva Multi-Agente

Toda directiva SIMCO debe seguir esta estructura:

```markdown
# SIMCO-{NOMBRE}.md

## Proposito
[Descripcion]

## Aplicabilidad
- **Agentes:** Todos | Claude | Gemini | Windsurf
- **Requiere subagentes:** Si/No
- **Plataforma:** Todas | Windows | Linux

## Procedimiento

### Paso N: [Nombre del paso]

**Accion estandar:**
[Descripcion de la accion]

**Adaptacion sin subagentes:** (si aplica)
[Como ejecutar si el agente no tiene subagentes]

**Adaptacion Windows:** (si aplica)
[Comando o procedimiento alternativo para Windows]
```

### 4.2 Marcadores de Compatibilidad

Usar estos marcadores en directivas:

```markdown
> [!MULTI-AGENT]
> Esta seccion requiere adaptacion segun el tipo de agente.
> Ver SIMCO-MULTI-AGENT.md para detalles.

> [!SUBAGENT-REQUIRED]
> Esta accion requiere subagentes. Agentes sin subagentes
> deben usar Self-Persona Switch.

> [!PLATFORM-SPECIFIC]
> Este comando varia segun plataforma.
```

---

## 5. Self-Persona Switch (Patron de Adaptacion)

### 5.1 Definicion

El Self-Persona Switch es el patron que permite a agentes sin subagentes ejecutar
tareas que normalmente requeririan delegacion.

### 5.2 Procedimiento

```
CUANDO: Tarea requiere conocimiento especializado (ej: DDL, Backend, Frontend)

1. IDENTIFICAR perfil requerido
   - Buscar en orchestration/agents/perfiles/_MAP.md
   - Ejemplo: tarea de base de datos → PERFIL-DATABASE-POSTGRESQL.md

2. CARGAR perfil
   - Leer orchestration/agents/perfiles/PERFIL-{TIPO}.md
   - Notar: validaciones, restricciones, estandares

3. ADOPTAR reglas del perfil
   - Aplicar validaciones del perfil
   - Seguir estandares del perfil
   - Respetar restricciones del perfil

4. EJECUTAR tarea
   - Con las reglas del perfil adoptado

5. RETORNAR a comportamiento general
   - Continuar con siguiente tarea
```

### 5.3 Ejemplo Practico (gamilit)

```
Tarea: "Crear tabla de rangos maya con DDL"

Sin Self-Persona Switch (Claude Code):
→ Delegar a Database-PostgreSQL-Agent subagent
→ Subagente ejecuta y retorna

Con Self-Persona Switch (Gemini/Windsurf):
→ Leer PERFIL-DATABASE-POSTGRESQL.md
→ Notar: "Toda tabla debe tener id UUID, created_at, updated_at"
→ Notar: "Validar con recreate-database.sh despues de cambios DDL"
→ Ejecutar creacion de tabla siguiendo esas reglas
→ Validar con recreate-database.sh
→ Continuar con siguiente paso
```

---

## 6. Mapeo de Perfiles a Tareas

| Palabras clave en tarea | Perfil a adoptar |
|-------------------------|------------------|
| tabla, DDL, migracion, schema, indice | PERFIL-DATABASE-POSTGRESQL.md |
| endpoint, API, service, controller, NestJS | PERFIL-BACKEND-NESTJS.md |
| componente, React, UI, pagina, hook | PERFIL-FRONTEND-REACT.md |
| test, jest, spec, coverage, mock | PERFIL-TESTING.md |
| Docker, CI/CD, pipeline, deploy | PERFIL-DEVOPS.md |
| documentar, README, ADR, changelog | PERFIL-DOCUMENTATION-VALIDATOR.md |
| seguridad, auth, JWT, permisos, OWASP | PERFIL-SECURITY-AUDITOR.md |

---

## 7. Validaciones por Tipo de Agente

### 7.1 Validaciones Comunes (Todos los agentes)

```bash
# Backend
cd apps/backend && npm run build && npm run lint && npm run test

# Frontend
cd apps/frontend && npm run build && npm run lint && npm run typecheck
```

### 7.2 Validaciones Especificas

**Claude Code:**
- Puede ejecutar validaciones en paralelo
- Puede delegar validacion a subagente QA

**Gemini / Windsurf:**
- Ejecutar validaciones secuencialmente
- Usar cross-env si los scripts lo requieren

---

## 8. Protocolo de Inicializacion por Agente

### 8.1 Claude Code

```
1. Cargar CLAUDE.md (auto-cargado)
2. Cargar .claude/settings.local.json (permisos)
3. Cargar directiva SIMCO segun tarea
4. Asignar perfil o delegar a subagente
5. Ejecutar
```

### 8.2 Gemini

```
1. Detectar plataforma (CRITICO - antes de cualquier comando)
2. Cargar .gemini/BOOTLOADER_PROTOCOL.md (si existe)
3. Cargar CLAUDE.md (reglas base)
4. Cargar AGENT-CAPABILITIES.yml (limitaciones)
5. Aplicar Self-Persona Switch si se requiere especializacion
6. Ejecutar secuencialmente
```

### 8.3 Windsurf

```
1. Detectar plataforma (CRITICO)
2. Cargar .windsurf/README.md (si existe)
3. Cargar CLAUDE.md (reglas base)
4. Aplicar Self-Persona Switch si se requiere especializacion
5. Ejecutar secuencialmente
```

---

## 9. Troubleshooting Multi-Agente

### 9.1 Agente se queda bloqueado

**Sintoma:** Agente no avanza, parece bloqueado

**Diagnostico:**
1. Intento ejecutar comando con sintaxis incorrecta de plataforma?
2. Intento delegar a subagente que no existe?
3. Se agoto el contexto?

**Solucion:**
1. Verificar plataforma (Windows vs Linux/WSL)
2. Aplicar Self-Persona Switch en lugar de delegar
3. Dividir tarea en pasos mas pequenos

### 9.2 Comando falla en Windows

**Sintoma:** Error de sintaxis o comando no reconocido

**Solucion:**
- Usar cross-env en package.json
- Ejecutar via `bash script.sh` o `wsl bash script.sh`

### 9.3 Directiva pide subagente

**Sintoma:** Directiva dice "delegar a X-Agent"

**Solucion para Gemini/Windsurf:**
```
1. NO detenerse
2. Identificar que perfil corresponde a "X-Agent"
3. Leer ese perfil
4. Ejecutar la tarea con las reglas del perfil
5. Continuar
```

---

## 10. Checklist de Compatibilidad

Antes de crear o modificar una directiva SIMCO, verificar:

- [ ] Funciona sin subagentes? (Self-Persona Switch documentado)
- [ ] Funciona en Windows? (comandos adaptados o alternativas documentadas)
- [ ] Funciona con contexto limitado? (pasos pequenos y claros)
- [ ] Tiene marcadores de compatibilidad donde aplica?
- [ ] Referencias usan rutas relativas al workspace?

---

## 11. Referencias

| Directiva | Relacion |
|-----------|----------|
| SIMCO-DELEGACION.md | Protocolo de delegacion (Claude) |
| SIMCO-DELEGACION-PARALELA.md | Ejecucion paralela (Claude) |
| SIMCO-TAREA.md | Punto de entrada de tareas |
| orchestration/agents/perfiles/_MAP.md | Mapa de perfiles de agentes |

---

**Reactivado de:** _archive/SIMCO-MULTI-AGENT.md (v1.0.0)
**Adaptado para:** gamilit standalone (rutas actualizadas, ejemplos contextualizados)
