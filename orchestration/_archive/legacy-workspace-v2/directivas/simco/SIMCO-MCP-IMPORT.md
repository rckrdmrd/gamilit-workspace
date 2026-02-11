# SIMCO-MCP-IMPORT: Importacion de MCP Servers Externos

**Version:** 1.0.0
**Fecha:** 2026-01-04
**Aplica a:** Agentes que evaluan e importan MCP Servers externos
**Prioridad:** OBLIGATORIA para importacion de MCP externos

---

## RESUMEN EJECUTIVO

> **Solo importar MCP de fuentes confiables. Evaluar seguridad, documentar decision, registrar en _sources.yml.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════════╗
║  IDENTIFICAR → EVALUAR → PROBAR → APROBAR → DOCUMENTAR                  ║
║                                                                           ║
║  1. Verificar fuente en trusted_sources                                  ║
║  2. Evaluar seguridad y dependencias                                     ║
║  3. Probar funcionalidad en ambiente aislado                             ║
║  4. Aprobar o rechazar con justificacion                                 ║
║  5. Documentar en _sources.yml                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## FUENTES CONFIABLES

### Nivel 1: Oficial (Auto-aprobacion)

| Fuente | URL | Confianza |
|--------|-----|-----------|
| Anthropic Official | github.com/anthropics | MAXIMA |
| Model Context Protocol | github.com/modelcontextprotocol | MAXIMA |

### Nivel 2: Comunidad Verificada (Requiere revision)

| Fuente | URL | Confianza |
|--------|-----|-----------|
| MCP Community | github.com/mcp-community | ALTA |

### Nivel 3: Terceros (Evaluacion completa)

Cualquier otra fuente requiere evaluacion completa de seguridad.

---

## PROCESO DE EVALUACION

### Paso 1: Identificacion

```yaml
verificar:
  - Repositorio publico con codigo fuente
  - README con documentacion
  - Licencia compatible (MIT, Apache, BSD)
  - Actividad reciente (< 6 meses)
  - Issues respondidos

registrar:
  archivo: "core/mcp-servers/external/_sources.yml"
  seccion: "pending_evaluation"
  datos:
    name: "{nombre}"
    source: "{url}"
    requested_by: "{agente}"
    requested_date: "{fecha}"
    reason: "{por que se necesita}"
```

### Paso 2: Evaluacion de Seguridad

```bash
# 1. Clonar en ambiente aislado
git clone {url} /tmp/mcp-eval/{nombre}
cd /tmp/mcp-eval/{nombre}

# 2. Auditar dependencias
npm audit
# ✅ Sin vulnerabilidades criticas o altas

# 3. Revisar permisos requeridos
cat package.json | grep -A 20 "permissions"
# ✅ Permisos razonables para la funcionalidad

# 4. Buscar patrones sospechosos
grep -r "eval\|exec\|spawn" src/
# ✅ Sin codigo potencialmente peligroso

# 5. Verificar conexiones externas
grep -r "http\|https\|fetch\|axios" src/
# ✅ Solo conexiones documentadas y necesarias
```

### Paso 3: Prueba de Funcionalidad

```yaml
proceso:
  1_instalar:
    - npm install
    - cp .env.example .env
    - Configurar variables minimas

  2_ejecutar:
    - npm run start
    - Verificar health check

  3_probar_tools:
    - Ejecutar cada tool documentado
    - Verificar inputs/outputs esperados
    - Documentar comportamiento

  4_verificar:
    - Tests incluidos pasan
    - Documentacion coincide con comportamiento
    - Sin errores en logs
```

### Paso 4: Decision

```yaml
aprobar_si:
  - Sin vulnerabilidades criticas
  - Codigo fuente revisable
  - Documentacion adecuada
  - Funcionalidad probada
  - Permisos razonables

rechazar_si:
  - Vulnerabilidades sin parche
  - Codigo ofuscado
  - Sin documentacion
  - Comportamiento inesperado
  - Permisos excesivos
  - Sin mantenimiento (> 1 año)
```

### Paso 5: Documentacion

```yaml
# Si APROBADO - agregar a _sources.yml
installed:
  - name: "{nombre}"
    source: "{url}"
    version: "{version}"
    installed_date: "{fecha}"
    installed_by: "@PERFIL_MCP_INTEGRATOR"
    location: "external/installed/{nombre}"
    review_notes: |
      - Seguridad: OK (npm audit clean)
      - Funcionalidad: OK (todos los tools probados)
      - Documentacion: OK (README completo)
      - Permisos: OK (solo acceso a red para API)

# Si RECHAZADO - agregar a _sources.yml
rejected:
  - name: "{nombre}"
    source: "{url}"
    rejected_date: "{fecha}"
    reason: |
      {razon detallada del rechazo}
      Ejemplo: Vulnerabilidad critica en dependencia X
      sin parche disponible.
```

---

## INSTALACION DE MCP APROBADO

```bash
# 1. Navegar a carpeta de externos
cd /home/isem/workspace-v1/core/mcp-servers/external/installed

# 2. Clonar
git clone {url} {nombre}

# 3. Instalar
cd {nombre}
npm install

# 4. Configurar
cp .env.example .env
# Editar .env

# 5. Verificar
npm run start
curl http://localhost:${PORT}/health
```

---

## ACTUALIZACIONES

### Verificar Actualizaciones

```bash
# Revisar si hay actualizaciones disponibles
cd core/mcp-servers/external/installed/{nombre}
git fetch origin
git log HEAD..origin/main --oneline
```

### Proceso de Actualizacion

```yaml
proceso:
  1_backup:
    - git stash (si hay cambios locales)

  2_actualizar:
    - git pull origin main

  3_auditar:
    - npm audit
    - Revisar CHANGELOG

  4_probar:
    - npm install
    - npm run test
    - Verificar funcionalidad

  5_documentar:
    - Actualizar version en _sources.yml
    - Registrar cambios importantes
```

---

## CHECKLIST DE EVALUACION

```
IDENTIFICACION
├── [ ] Repositorio publico
├── [ ] README existe
├── [ ] Licencia compatible
├── [ ] Fuente en trusted_sources?

SEGURIDAD
├── [ ] npm audit sin criticos
├── [ ] Sin codigo sospechoso
├── [ ] Permisos razonables
├── [ ] Conexiones documentadas

FUNCIONALIDAD
├── [ ] Instala correctamente
├── [ ] Health check responde
├── [ ] Tools funcionan como documentado
├── [ ] Tests incluidos pasan

DOCUMENTACION
├── [ ] Registrado en _sources.yml
├── [ ] Estado: approved/rejected
├── [ ] Notas de revision
├── [ ] Fecha de evaluacion
```

---

## ERRORES COMUNES

| Error | Causa | Solucion |
|-------|-------|----------|
| "npm audit high" | Vulnerabilidad en dependencia | Buscar version parcheada o rechazar |
| "Permisos excesivos" | MCP pide acceso innecesario | Evaluar si es realmente necesario |
| "Sin documentacion" | README incompleto | Contactar autor o rechazar |
| "Codigo ofuscado" | Minificacion o ocultamiento | Rechazar (no auditable) |

---

## REFERENCIAS

- **Registry:** `core/mcp-servers/_registry.yml`
- **Sources:** `core/mcp-servers/external/_sources.yml`
- **Perfil:** @PERFIL_MCP_INTEGRATOR
- **Arquitecto:** @PERFIL_MCP_ARCHITECT

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **EPIC:** EPIC-013
