# SIMCO: PROYECTOS STANDALONE (NIVEL_2A)

**Version:** 1.0.0
**Fecha:** 2026-01-18
**Aplica a:** Agentes trabajando en proyectos independientes
**Prioridad:** OBLIGATORIA para proyectos sin jerarquia de herencia

---

## RESUMEN EJECUTIVO

> **Un proyecto STANDALONE es un proyecto independiente que NO hereda codigo de otros proyectos del workspace.**
> Estos proyectos usan las directivas SIMCO pero NO participan en cadenas de herencia ERP.
> Pueden CONTRIBUIR patrones al catalogo compartido pero NO propagan cambios a otros proyectos.

---

## DEFINICION

### Que es un Proyecto STANDALONE

```yaml
caracteristicas:
  - Nivel SIMCO: NIVEL_2A
  - Herencia de codigo: NINGUNA
  - Herencia de directivas: SI (SIMCO del workspace)
  - Propagacion a otros proyectos: NO
  - Sincronizacion de mirror: SI
  - Contribucion a catalogo: OPCIONAL

ejemplos_actuales:
  - gamilit          # Plataforma de gamificacion educativa
  - trading-platform # Plataforma de trading (integra template-saas parcialmente)
  - betting-analytics # Analytics de apuestas
  - inmobiliaria-analytics # Analytics inmobiliario

diferencia_con_erp:
  - ERP (NIVEL_2B): Hereda de erp-core, propaga a verticales
  - STANDALONE (NIVEL_2A): Independiente, solo sincroniza a mirror
```

### Tipos de Proyectos STANDALONE

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| **PURO** | Sin ninguna integracion con template-saas | gamilit |
| **INTEGRADO** | Usa modulos selectivos de template-saas | trading-platform |
| **REFERENCIA** | Fuente de patrones para otros | gamilit (REFERENCES) |

---

## ESTRUCTURA RECOMENDADA

### Estructura de Proyecto STANDALONE

```
projects/{standalone}/
├── apps/                          # Aplicaciones (monorepo)
│   ├── backend/                   # API (NestJS, Express, etc.)
│   ├── frontend/                  # SPA (React, Vue, etc.)
│   └── database/                  # DDL y seeds
│
├── docs/                          # Documentacion de usuario
│   ├── _MAP.md                    # Navegacion
│   ├── _definitions/              # Definiciones
│   └── [estructura por fases]     # EPICs, historias, etc.
│
├── orchestration/                 # Sistema de orquestacion LOCAL
│   ├── _MAP.md                    # Navegacion
│   ├── _inheritance.yml           # Declaracion: type: STANDALONE
│   ├── PROXIMA-ACCION.md          # Estado actual
│   ├── CONTEXT-MAP.yml            # Aliases locales (opcional)
│   ├── inventarios/               # Inventarios del proyecto
│   ├── trazas/                    # Trazas por dominio
│   ├── tareas/                    # Tareas documentadas
│   └── directivas/                # Directivas locales (opcional)
│
├── k8s/                           # Kubernetes (si aplica)
├── scripts/                       # Scripts de utilidad
└── README.md                      # Descripcion del proyecto
```

### Archivo _inheritance.yml para STANDALONE

```yaml
# orchestration/_inheritance.yml

version: "1.0.0"
proyecto: "{nombre-proyecto}"

herencia:
  tipo: "STANDALONE"
  nivel: "NIVEL_2A"
  parent: null                     # Sin parent
  parent_version: null

integraciones:                      # Solo si usa modulos de template-saas
  - source: "template-saas"
    modulos:
      - auth
      - billing
    tipo: "INTEGRATES"             # NO es herencia, es integracion selectiva

referencias:                        # Patrones consultados (NO heredados)
  - source: "odoo"
    tipo: "REFERENCES"
    uso: "Consulta de patrones ERP"

contribuciones:                     # Patrones que este proyecto provee
  catalogo:
    - categoria: "gamification"    # Si aplica
      patrones:
        - xp-system
        - achievements
        - leaderboards
  mirror: "shared/mirrors/{proyecto}/"

configuracion:
  sistema_orquestacion: "NEXUS"    # O "SIMCO-LOCAL"
  documentacion_redundante: true   # Para despliegue independiente
  sincronizacion_mirror: true

validacion:
  ultima_validacion: "2026-01-18"
  build_status: "passing"
```

---

## CICLO DE TRABAJO

### Diferencias con Proyectos ERP

| Aspecto | ERP (NIVEL_2B) | STANDALONE (NIVEL_2A) |
|---------|---------------|----------------------|
| **Al iniciar tarea** | Verificar herencia | Verificar mirror |
| **Al completar** | Propagar a verticales | Sincronizar mirror |
| **Security fix** | SLA 24h a todos | Solo actualizar proyecto |
| **Nueva feature** | Evaluar propagacion | Evaluar extraccion a catalogo |
| **Documentacion** | Propagar a cadena | Sincronizar a mirror |

### Flujo de Trabajo STANDALONE

```yaml
INICIO_TAREA:
  1. Cargar contexto:
     - orchestration/PROXIMA-ACCION.md
     - orchestration/inventarios/MASTER_INVENTORY.yml
     - Traza del dominio correspondiente

  2. Identificar nivel:
     - Confirmar: NIVEL_2A (STANDALONE)
     - NO hay propagacion a otros proyectos

  3. Ejecutar ciclo CAPVED:
     - C: Contexto del proyecto
     - A: Analisis de dependencias INTERNAS
     - P: Plan de cambios
     - V: Validacion pre-ejecucion
     - E: Ejecucion
     - D: Documentacion

FIN_TAREA:
  1. Validar cambios:
     - npm run build
     - npm run lint
     - npm run test

  2. Actualizar inventarios:
     - DATABASE_INVENTORY.yml (si aplica)
     - BACKEND_INVENTORY.yml (si aplica)
     - FRONTEND_INVENTORY.yml (si aplica)

  3. Actualizar trazas:
     - TRAZA-TAREAS-{DOMINIO}.md

  4. Sincronizar mirror:
     - Actualizar shared/mirrors/{proyecto}/
     - Si hay definiciones nuevas: definitions/
     - Actualizar PROPAGATION-STATUS.yml

  5. Evaluar contribucion:
     - Pregunta: "Es esta funcionalidad generalizable?"
     - Si SI: Documentar candidato en catalogo
     - Si NO: Solo documentar en proyecto
```

---

## SINCRONIZACION DE MIRROR

### Que se Sincroniza

```yaml
sincronizacion_automatica:
  - README.md                      # Descripcion del proyecto
  - QUICK-REFERENCE.md             # Referencia rapida
  - definitions/                   # Catalogos y schemas
  - aliases/                       # Aliases del proyecto
  - PROPAGATION-STATUS.yml         # Estado de sincronizacion

sincronizacion_manual:
  - Patrones nuevos a shared/catalog/
  - Documentacion extensa

NO_sincronizar:
  - Codigo fuente
  - Configuraciones sensibles (.env)
  - Datos de prueba
  - node_modules, dist, etc.
```

### Comando de Sincronizacion

```bash
# Sincronizar mirror manualmente
@SYNC-MIRROR {proyecto}

# Ejemplo
@SYNC-MIRROR gamilit
```

---

## CONTRIBUCION AL CATALOGO

### Cuando Contribuir

Un patron de proyecto STANDALONE puede ir al catalogo compartido cuando:

1. **Es generalizable**: Puede usarse en otros proyectos sin modificacion
2. **Esta maduro**: Probado en produccion, estable
3. **Esta documentado**: Tiene documentacion clara de uso
4. **No tiene dependencias especificas**: No requiere contexto del proyecto origen

### Proceso de Contribucion

```yaml
PASO_1_IDENTIFICAR:
  pregunta: "Esta funcionalidad es reutilizable?"
  criterios:
    - No depende de logica especifica del proyecto
    - Puede parametrizarse para otros contextos
    - Esta bien documentada

PASO_2_GENERALIZAR:
  acciones:
    - Remover referencias al proyecto origen
    - Parametrizar configuraciones
    - Crear interfaces genericas
    - Documentar casos de uso

PASO_3_DOCUMENTAR:
  ubicacion: "shared/catalog/{categoria}/{patron}/"
  archivos:
    - README.md           # Descripcion y uso
    - IMPLEMENTATION.md   # Guia de implementacion
    - EXAMPLES.md         # Ejemplos de uso
    - CHANGELOG.md        # Historial de cambios

PASO_4_REGISTRAR:
  archivo: "shared/catalog/CATALOG-INDEX.yml"
  entrada:
    - name: "{nombre-patron}"
      category: "{categoria}"
      source: "{proyecto-origen}"
      version: "1.0.0"
      description: "{descripcion}"

PASO_5_NOTIFICAR:
  accion: "Actualizar PROPAGATION-STATUS.yml del proyecto"
  contenido:
    contribuciones:
      - patron: "{nombre}"
        catalogo: "shared/catalog/{categoria}/{patron}/"
        fecha: "{fecha}"
```

---

## PROYECTOS STANDALONE REGISTRADOS

### gamilit

```yaml
proyecto: "gamilit"
tipo: "STANDALONE_PURO"
nivel: "NIVEL_2A"
estado: "production"
mirror: "shared/mirrors/gamilit/"

sistema_orquestacion: "NEXUS v4.0"
documentacion: "docs/60-proyectos/PROYECTO-GAMILIT.md"

patrones_candidatos:
  - gamificacion:
      - xp-system
      - achievements
      - ranks
      - missions
      - virtual-economy
  - arquitectura:
      - inventarios_yaml
      - trazas_por_dominio
      - coherencia_3_capas
```

### trading-platform

```yaml
proyecto: "trading-platform"
tipo: "STANDALONE_INTEGRADO"
nivel: "NIVEL_2A"
estado: "development"
mirror: "shared/mirrors/trading-platform/"

integraciones:
  - template-saas (auth, rbac, billing, plans, ai-integration, oauth)

patrones_candidatos:
  - trading:
      - market-data-streaming
      - order-management
```

### betting-analytics

```yaml
proyecto: "betting-analytics"
tipo: "STANDALONE_PURO"
nivel: "NIVEL_2A"
estado: "development"
mirror: "shared/mirrors/betting-analytics/"

patrones_candidatos:
  - analytics:
      - odds-calculation
      - historical-analysis
```

---

## VALIDACIONES

### Checklist Pre-Commit

```yaml
validaciones_standalone:
  - [ ] Build pasa sin errores
  - [ ] Lint pasa sin errores
  - [ ] Tests pasan (si existen)
  - [ ] Inventarios actualizados (si hubo cambios)
  - [ ] Trazas actualizadas

validaciones_mirror:
  - [ ] Mirror sincronizado (si hubo cambios en definiciones)
  - [ ] PROPAGATION-STATUS.yml actualizado
```

### Checklist Post-Feature

```yaml
evaluacion_contribucion:
  - [ ] Funcionalidad es generalizable?
  - [ ] Esta documentada?
  - [ ] No tiene dependencias especificas?
  - [ ] Beneficiaria a otros proyectos?

si_aplica:
  - [ ] Generalizar patron
  - [ ] Agregar a shared/catalog/
  - [ ] Registrar en CATALOG-INDEX.yml
```

---

## REFERENCIAS

### Documentacion Relacionada

- `orchestration/INHERITANCE-MODEL.yml` - Modelo de herencia
- `orchestration/directivas/triggers/TRIGGER-PROPAGACION-AUTOMATICA.md` - Trigger de propagacion
- `shared/mirrors/MIRRORS-INDEX.yml` - Indice de mirrors
- `shared/catalog/CATALOG-INDEX.yml` - Indice del catalogo

### Aliases Utiles

| Alias | Descripcion |
|-------|-------------|
| `@SYNC-MIRROR` | Sincronizar mirror de proyecto |
| `@VALIDATE-STANDALONE` | Validar proyecto standalone |
| `@CONTRIBUTE-CATALOG` | Contribuir patron al catalogo |

---

*SIMCO-STANDALONE v1.0.0 - Sistema SAAD*
*Creado: 2026-01-18*
