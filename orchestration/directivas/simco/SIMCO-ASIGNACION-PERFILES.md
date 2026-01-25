# SIMCO: DIRECTIVA DE ASIGNACION DE PERFILES

**Version:** 1.0.0
**Fecha:** 2026-01-04
**Sistema:** NEXUS v3.4 + SIMCO
**Aplica a:** Todos los agentes que deleguen tareas

---

## PROPOSITO

Esta directiva establece el procedimiento obligatorio para asignar tareas a perfiles especializados, garantizando que cada tarea sea ejecutada por el agente mas adecuado.

---

## DIRECTIVA OBLIGATORIA

> **ANTES de delegar cualquier tarea a un subagente, el agente DEBE:**
>
> 1. **CONSULTAR** el mapa de perfiles: `orchestration/agents/perfiles/_MAP.md`
> 2. **IDENTIFICAR** el perfil adecuado usando el mapeo de palabras clave
> 3. **VERIFICAR** que la tarea coincide con `tipos_tarea` del perfil
> 4. **CONFIRMAR** que no aplica ninguna condicion de `no_asignar_si`
> 5. **INCLUIR** el alias del perfil y las directivas aplicables en la delegacion

---

## FLUJO DE DECISION

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECIBIR TAREA A DELEGAR                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 1: Leer _MAP.md                                           │
│  Ubicacion: orchestration/agents/perfiles/_MAP.md               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 2: Buscar palabras clave de la tarea                      │
│  Ejemplo: "crear endpoint" → buscar "endpoint" en mapeo         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 3: Identificar perfil candidato                           │
│  Resultado: @PERFIL_BACKEND                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 4: Verificar tipos_tarea del perfil                       │
│  ¿"Crear endpoint REST" esta en la lista? → SI                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 5: Verificar no_asignar_si                                │
│  ¿Proyecto usa Express? → NO (usa NestJS) → OK                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 6: Preparar delegacion con:                               │
│  - Alias del perfil (@PERFIL_BACKEND)                           │
│  - Directivas aplicables (@OP_BACKEND, @PAT_VALIDACION)         │
│  - Contexto minimo requerido                                    │
│  - Criterios de aceptacion                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EJECUTAR DELEGACION                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## MAPEO RAPIDO DE REFERENCIA

### Palabras Clave → Perfil

| Palabra Clave | Perfil | Alias |
|---------------|--------|-------|
| tabla, DDL, migracion, schema | Database | @PERFIL_DATABASE |
| endpoint, API, controller, NestJS | Backend | @PERFIL_BACKEND |
| Express, middleware, router | Backend-Express | @PERFIL_BACKEND_EXPRESS |
| componente, React, Vue, UI | Frontend | @PERFIL_FRONTEND |
| modelo ML, prediccion, features | ML-Specialist | @PERFIL_ML_SPEC |
| Docker, nginx, deploy simple | DevOps | @PERFIL_DEVOPS |
| pipeline, Jenkins, GitHub Actions | CICD-Specialist | @PERFIL_CICD_SPECIALIST |
| produccion, rollback, deploy prod | Production-Manager | @PERFIL_PRODUCTION_MANAGER |
| secretos, credenciales, .env | Secrets-Manager | @PERFIL_SECRETS_MANAGER |
| Prometheus, Grafana, alertas | Monitoring-Agent | @PERFIL_MONITORING_AGENT |
| puertos, entorno local | DevEnv | @PERFIL_DEVENV |
| test, cobertura, e2e | Testing | @PERFIL_TESTING |
| propagar, KB, catalogo | KB-Manager | @PERFIL_KB_MANAGER |

> **Referencia completa:** Ver `_MAP.md` para lista exhaustiva

---

## TEMPLATE DE DELEGACION

```markdown
## Delegacion a {ALIAS_PERFIL}

**Tarea:** {descripcion clara y especifica}

**Proyecto:** {nombre_proyecto}
**Ubicacion:** {ruta del working directory}

**Archivos de contexto:**
- {archivo_1}
- {archivo_2}

**Directivas aplicables:**
- {directiva_1}
- {directiva_2}

**Criterios de aceptacion:**
- [ ] {criterio_1}
- [ ] {criterio_2}
- [ ] {criterio_3}

**Notas adicionales:**
{informacion relevante para el subagente}
```

---

## ERRORES COMUNES A EVITAR

### 1. Asignar sin verificar el mapa
```yaml
incorrecto: "Delegar tarea de endpoint a cualquier agente disponible"
correcto: "Consultar _MAP.md, identificar @PERFIL_BACKEND"
```

### 2. Ignorar condiciones no_asignar_si
```yaml
incorrecto: "Asignar tarea de Express a @PERFIL_BACKEND"
correcto: "Verificar que proyecto usa NestJS, si usa Express → @PERFIL_BACKEND_EXPRESS"
```

### 3. No incluir directivas en delegacion
```yaml
incorrecto: "Crea un endpoint de usuarios"
correcto: "Crea un endpoint de usuarios siguiendo @OP_BACKEND y @PAT_VALIDACION"
```

### 4. Delegar tarea multi-capa a perfil de una sola capa
```yaml
incorrecto: "Implementar feature completa (DB + API + UI) → @PERFIL_BACKEND"
correcto: "Tarea multi-capa → @PERFIL_ORQUESTADOR para descomponer y delegar"
```

---

## CASOS ESPECIALES

### Tarea Ambigua
Si la tarea no coincide claramente con un perfil:
1. Descomponer en subtareas mas especificas
2. Asignar cada subtarea al perfil correspondiente
3. Si sigue ambigua, escalar a @PERFIL_TECH_LEADER

### Tarea Multi-Perfil
Si la tarea requiere multiples perfiles:
1. Delegar a @PERFIL_ORQUESTADOR
2. El orquestador descompondra y coordinara

### Perfil No Existe
Si no existe perfil para la tarea:
1. Documentar la necesidad
2. Escalar a @PERFIL_ARCHITECT para evaluar creacion
3. Temporalmente, usar perfil mas cercano

---

## VALIDACION POST-ASIGNACION

Despues de delegar, verificar:

```yaml
checklist_delegacion:
  - "[ ] Perfil asignado existe en _MAP.md"
  - "[ ] Tarea coincide con tipos_tarea del perfil"
  - "[ ] No aplica ninguna condicion no_asignar_si"
  - "[ ] Directivas incluidas en delegacion"
  - "[ ] Contexto minimo proporcionado"
  - "[ ] Criterios de aceptacion claros"
```

---

## REFERENCIAS

- Mapa de perfiles: `orchestration/agents/perfiles/_MAP.md`
- Aliases: `orchestration/referencias/ALIASES.yml`
- Directiva de delegacion: `orchestration/directivas/simco/SIMCO-DELEGACION.md`
- Template de delegacion: `orchestration/templates/TEMPLATE-DELEGACION-SUBAGENTE.md`

---

## RELACIÓN CON SISTEMA NEXUS (Gamilit)

**Esta directiva define el PROCEDIMIENTO de asignación de perfiles.**

Para las responsabilidades específicas de perfiles NEXUS en Gamilit, consultar:

- **DELIMITACION-PERFILES.md** (`/projects/gamilit/.claude/directivas/`)
  - Responsabilidades detalladas de cada perfil NEXUS
  - Flujos de coordinación entre perfiles
  - Resolución de conflictos de responsabilidad

**Jerarquía:**
```
NEXUS-DELIMITACION-PERFILES  →  QUÉ hace cada perfil (responsabilidades)
        ↓
SIMCO (este archivo)         →  CÓMO asignar tareas (procedimiento operativo)
```

---

**Version:** 1.0.1 | **Sistema:** NEXUS v3.4 + SIMCO | **Tipo:** Directiva SIMCO
**Actualizado:** 2026-01-10
