# DEVENV-PORT-STANDARDS

**Version:** 2.1.0
**Fecha:** 2025-12-08
**Mantenedor:** DevEnv Agent

---

## DIRECTIVA OBLIGATORIA

> **TODOS los agentes DEBEN consultar al agente DevEnv antes de asignar puertos.**
>
> El inventario centralizado esta en: `@DEVENV_PORTS`
> (`core/orchestration/inventarios/DEVENV-PORTS-INVENTORY.yml`)

---

## ESTANDAR v2.0.0 (NUEVO)

El proyecto **gamilit** define el estandar base de asignacion de puertos:

| Servicio | Puerto | Patron |
|----------|--------|--------|
| Frontend | 3005 | base |
| Backend | 3006 | base + 1 |

**Regla principal:** Frontend y Backend tienen **1 numero de diferencia**.

---

## ASIGNACION OFICIAL DE PUERTOS

Cada proyecto tiene una base y sigue el patron FE=base, BE=base+1:

| Proyecto | Base | Frontend | Backend | Estado |
|----------|------|----------|---------|--------|
| gamilit | 3005 | 3005 | 3006 | PRODUCCION |
| erp-core | 3010 | 3010 | 3011 | Activo |
| construccion | 3020 | 3020 | 3021 | Activo |
| vidrio-templado | 3030 | 3030 | 3031 | Activo |
| mecanicas-diesel | 3040 | 3040 | 3041 | Activo |
| retail | 3050 | 3050 | 3051 | Activo |
| clinicas | 3060 | 3060 | 3061 | Activo |
| pos-micro | 3070 | 3070 | 3071 | Activo |
| trading-platform | 3080 | 3080 | 3081 | Activo |
| betting-analytics | 3090 | 3090 | 3091 | Reservado |
| inmobiliaria | 3100 | 3100 | 3101 | Reservado |
| pmc | 3110 | 3110 | 3111 | Activo |

**Rango disponible:** 3112-3199 para futuros proyectos.

---

## MAPA VISUAL DE PUERTOS

```
Puerto     Proyecto              Estado
────────────────────────────────────────
3005/3006  gamilit               PRODUCCION
3010/3011  erp-core              Activo
3020/3021  construccion          Activo
3030/3031  vidrio-templado       Activo
3040/3041  mecanicas-diesel      Activo
3050/3051  retail                Activo
3060/3061  clinicas              Activo
3070/3071  pos-micro             Activo
3080-3087  trading-platform      Activo (FE/BE/WS/ML/Data/LLM/Agents/WebUI)
3090/3091  betting-analytics     Reservado
3100/3101  inmobiliaria          Reservado
3110/3111  pmc                   Activo
────────────────────────────────────────
3112-3199  [DISPONIBLE]          Futuros proyectos
```

---

## OFFSETS ESTANDAR

Para servicios adicionales dentro de cada proyecto:

```yaml
OFFSETS:
  frontend:         +0    # Aplicacion web principal (base)
  backend_api:      +1    # API principal
  backend_ws:       +2    # WebSocket server
  backend_admin:    +3    # Panel de administracion API
  backend_workers:  +4    # Workers/Jobs
  auxiliary:        +5-9  # Servicios auxiliares
```

### Ejemplo para un nuevo proyecto "mi-proyecto" (base 3120):

```yaml
mi-proyecto:
  frontend:         3120
  backend_api:      3121
  backend_ws:       3122
  backend_admin:    3123
  backend_workers:  3124
```

---

## BASES DE DATOS

## IMPORTANTE: Arquitectura de Instancia Unica Compartida

> **CORRECCION 2026-01-07**: El workspace utiliza UNA SOLA instancia de PostgreSQL (5432) y UNA SOLA instancia de Redis (6379).
> Los proyectos se separan por NOMBRE DE BASE DE DATOS + USUARIO, NO por puertos diferentes.

### PostgreSQL - Instancia Unica
| Servicio | Puerto | Separacion |
|----------|--------|------------|
| PostgreSQL | 5432 | database + user por proyecto |

### Redis - Instancia Unica
| Servicio | Puerto | Separacion |
|----------|--------|------------|
| Redis | 6379 | database number (0-15) por proyecto |

### Asignacion actual de Bases de Datos (PostgreSQL 5432):

| Database | User | Proyecto |
|----------|------|----------|
| gamilit_platform | gamilit_user | gamilit |
| erp_core_dev | erp_core_dev | erp-core |
| trading_dev | trading_dev | trading-platform |
| michangarrito_dev | michangarrito_dev | michangarrito |

### Asignacion actual de Redis DB Numbers (6379):

| DB Number | Proyecto |
|-----------|----------|
| 0 | gamilit |
| 1 | erp-core |
| 2 | trading-platform |
| 8 | michangarrito |
| 5439 | inmobiliaria-analytics (reservado) |

### Asignacion actual de Redis:

| Puerto | Proyecto |
|--------|----------|
| 6379 | Default / shared |
| 6380 | construccion |
| 6381 | vidrio-templado |
| 6383 | retail |
| 6384 | clinicas |
| 6385 | betting-analytics (reservado) |
| 6386 | inmobiliaria-analytics (reservado) |

---

## PUERTOS RESERVADOS (NO USAR)

Estos puertos estan reservados y no deben usarse:

| Puerto | Razon |
|--------|-------|
| 22 | SSH |
| 80 | HTTP estandar |
| 443 | HTTPS estandar |
| 3000 | Muy comun en desarrollo, conflictos frecuentes |
| 8080 | Muy comun en desarrollo, conflictos frecuentes |

---

## PROCESO DE ASIGNACION

### 1. Nuevo Proyecto

```yaml
Cuando: Se crea un proyecto nuevo
Quien: Tech-Leader delega a DevEnv
Proceso:
  1. Identificar siguiente base disponible (multiplos de 10)
  2. Asignar puertos: FE=base, BE=base+1
  3. Registrar en DEVENV-PORTS-INVENTORY.yml
  4. Crear archivo .env.ports en el proyecto
  5. Comunicar puertos asignados al Tech-Leader
```

### 2. Nuevo Servicio en Proyecto Existente

```yaml
Cuando: Se agrega servicio a proyecto existente
Quien: Agente de capa consulta a DevEnv
Proceso:
  1. Verificar puertos disponibles en rango del proyecto (base+2 a base+9)
  2. Asignar siguiente puerto segun tipo de servicio
  3. Actualizar DEVENV-PORTS-INVENTORY.yml
  4. Actualizar .env.ports del proyecto
  5. Comunicar configuracion al agente solicitante
```

### 3. Verificacion de Conflictos

```bash
# Verificar puerto especifico
lsof -i :3005

# Verificar rango de puertos
for port in {3000..3120}; do
  (echo >/dev/tcp/localhost/$port) 2>/dev/null && echo "Puerto $port en uso"
done

# Puertos en docker
docker ps --format "{{.Ports}}"

# Todos los puertos escuchando
netstat -tlnp | grep LISTEN
```

---

## TEMPLATE: .env.ports

Cada proyecto debe tener un archivo `.env.ports` en su raiz:

```bash
# =============================================================================
# {NOMBRE_PROYECTO} - PORT ASSIGNMENTS
# =============================================================================
# Archivo centralizado de asignacion de puertos
# Gestionado por: DevEnv Agent
# Fecha: {FECHA}
# Base: {BASE}
# Estandar: FE=base, BE=base+1
# =============================================================================

# SERVICIOS PRINCIPALES
FRONTEND_PORT={BASE}
BACKEND_PORT={BASE+1}

# SERVICIOS ADICIONALES (si aplica)
BACKEND_WS_PORT={BASE+2}
BACKEND_ADMIN_PORT={BASE+3}

# BASES DE DATOS (si son especificos del proyecto)
POSTGRES_PORT={ASIGNADO}
REDIS_PORT={ASIGNADO}

# =============================================================================
# NOTAS
# =============================================================================
# - Estandar: Frontend = base, Backend = base + 1
# - Registrado en: @DEVENV_PORTS
# - Cualquier cambio debe coordinarse con DevEnv Agent
# =============================================================================
```

---

## SERVICIOS ESPECIALES

### Trading Platform - Todos los Servicios

Trading-platform tiene servicios Python integrados en el rango 3080:

```yaml
trading-platform:
  # Servicios principales (Node.js)
  frontend: 3080
  backend: 3081
  websocket: 3082

  # Servicios Python (FastAPI) - ACTUALIZADO v3.1.0
  ml_engine: 3083
  data_service: 3084
  llm_agent: 3085
  trading_agents: 3086
  ollama_webui: 3087

  # Servicio externo
  ollama: 11434  # LLM server local (sin cambio)
```

### Platform Marketing Content

```yaml
pmc:
  frontend: 3110
  backend: 3111
  comfyui: 8188  # Servicio externo de IA
```

---

## ALIAS RELEVANTES

```yaml
@DEVENV_PORTS: "core/orchestration/inventarios/DEVENV-PORTS-INVENTORY.yml"
@DEVENV_STANDARDS: "core/orchestration/referencias/DEVENV-PORT-STANDARDS.md"
@DEVENV_PROFILE: "core/orchestration/agents/perfiles/PERFIL-DEVENV.md"
```

---

## CHANGELOG

| Version | Fecha | Cambios |
|---------|-------|---------|
| 2.1.0 | 2025-12-08 | Trading-platform Python services actualizados a rango 3083-3087 |
| 2.0.0 | 2025-12-08 | Nuevo estandar: FE=base, BE=base+1 (1 numero diferencia) |
| 1.0.0 | 2025-12-08 | Estandar inicial: FE=base+5, BE=base+6 |

---

**Version:** 2.1.0 | **Sistema:** SIMCO + DevEnv | **Tipo:** Referencia
