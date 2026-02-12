# SIMCO: PLATFORM CONSTRAINTS

**Version:** 1.0.0
**Sistema:** SIMCO v4.0
**Proposito:** Restricciones de plataforma Windows/WSL2 para agentes
**Fecha:** 2026-02-11

---

## PRINCIPIO

> Todas las restricciones documentadas aqui provienen de fallos REALES observados
> en el workspace ISEM (Windows 11 + WSL2 Ubuntu). Los agentes DEBEN consultar
> esta directiva antes de ejecutar comandos de sistema.

---

## 1. WINDOWS NATIVE (Git Bash / PowerShell)

```yaml
RESTRICCIONES_WINDOWS:
  brace_expansion:
    problema: "mkdir dir/{a,b,c} NO funciona en Windows bash"
    solucion: "Crear directorios individualmente: mkdir dir/a && mkdir dir/b && mkdir dir/c"

  rsync:
    problema: "rsync NO disponible en Windows"
    solucion: "Usar cp -r en su lugar"

  cp_r:
    problema: "cp -r con glob '*' y variables '$var' en loops NO expanden"
    solucion: "Usar cp -r con rutas explicitas, /. suffix para contenido"
    ejemplo: "cp -r source/. dest/"

  paths:
    problema: "Backslash vs forward slash inconsistente"
    solucion: "Siempre usar forward slash en scripts bash"

  echo_redirection:
    problema: "echo con heredoc puede fallar en Git Bash"
    solucion: "Preferir Write tool sobre echo redirection"
```

---

## 2. WSL2 (Ubuntu)

```yaml
RESTRICCIONES_WSL2:
  econnreset:
    problema: "10+ conexiones TCP simultaneas via 127.0.0.1 causan ECONNRESET"
    solucion: "Usar IP directa de WSL2 (172.21.x.x) en lugar de localhost"
    nota: "La IP de WSL2 es DINAMICA — cambia en cada reboot"
    deteccion: "hostname -I | awk '{print $1}'"

  postgresql:
    version: "15 (NO 16 como documentado en algunos proyectos)"
    superuser: "earthdistance extension requiere sudo -u postgres"
    nota: "gamilit_user tiene permisos limitados al schema gamilit_platform"

  node:
    oom: "Tests OOM a 4GB heap — usar --max-old-space-size=8192 o split suites"

  ports:
    convention: "Backend: 3006, Frontend: 3005 (PM2 fork mode, Nginx proxy en prod)"
    nota: "Ver ecosystem.config.js y CLAUDE.md RC6 para configuracion de puertos"
```

---

## 3. GEMINI CLI

```yaml
RESTRICCIONES_GEMINI_CLI:
  quota:
    max_parallel: 2
    max_per_30min: 4
    consecuencia_exceder: "429 rate limit, recovery time impredecible"
    recomendacion: "Esperar 5+ min entre batches de 4+"
    fallback: "Si 429, switch inmediato a Claude subagents"

  paths:
    problema: "_products se convierte en products (pierde underscore)"
    solucion: "SIEMPRE usar full paths con underscores explicitos"

  counts:
    problema: "Conteos NO confiables (85% undercount observado)"
    solucion: "SIEMPRE cross-validate con find/Glob en filesystem"
    ejemplo: "Reporto 8 test files, realidad 55"

  background:
    problema: "Background tasks en Windows producen output files VACIOS"
    solucion: "SIEMPRE ejecutar en foreground"

  sandbox:
    problema: "Algunos modos solo permiten read_file, grep_search, glob"
    solucion: "Usar para ANALISIS only, ejecutar cambios con Claude/scripts"

  env:
    requisito: "export GEMINI_API_KEY='...' antes del comando"
    nota: "No esta en default env — verificar antes de invocar"
```

---

## 4. CLAUDE CODE

```yaml
RESTRICCIONES_CLAUDE_CODE:
  background_agents:
    problema: "Background agents en Windows retornan output files vacios (~30%)"
    solucion: "Para tareas criticas, usar foreground agents"
    diagnostico: "0-byte output file = COMPLETE FAILURE, no partial"

  parallel_limit:
    max_subagentes: 5
    recomendado_windows: "3-4 (Windows menos estable con 5)"
    recomendado_linux: 5

  compactacion:
    trigger: "Automatica al acercarse a limite de ventana"
    riesgo: "Perdida de contexto mid-session"
    mitigacion: "Ver SIMCO-CONTEXT-CLEANUP.md"
```

---

## 5. GENERAL

```yaml
REGLAS_GENERALES:
  - "NUNCA confiar en output de agentes sin verificar filesystem"
  - "NUNCA usar background para tareas criticas en Windows"
  - "SIEMPRE verificar que archivos creados tienen contenido (no 0-byte)"
  - "SIEMPRE usar foreground para Gemini CLI en Windows"
  - "SIEMPRE verificar IP de WSL2 antes de conexiones directas"
  - "PREFERIR forward slash en todos los paths de scripts"
```

---

## REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `SIMCO-MODEL-SELECTION.md` | Seleccion de modelo con platform awareness |
| `SIMCO-ORCHESTRATOR-VALIDATION-LOOP.md` | Validacion incluye platform checks |
| `SIMCO-ORCHESTRATION-PATTERNS.md` | Patrones con notas de plataforma |
| `ecosystem.config.js` | Configuracion PM2 puertos |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0 | **Tipo:** Directiva de Plataforma
