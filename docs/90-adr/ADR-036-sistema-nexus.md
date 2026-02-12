# ADR-036: Adopcion del Sistema NEXUS v4.1 (Gestion de Contexto)

**Estado:** Accepted
**Fecha:** 2026-02-11
**Contexto:** Gestion de contexto jerarquico en gamilit standalone

## Contexto

Los modelos de lenguaje tienen un limite de tokens de contexto (Claude: 200K, Gemini: 1M). En sesiones largas de desarrollo sobre gamilit, se enfrentaban problemas criticos:

1. **Sobrecarga de contexto:** Agentes cargaban archivos "por si acaso", desperdiciando tokens
2. **Compactaciones destructivas:** Al alcanzar limites, el modelo compactaba perdiendo estado critico
3. **Recuperacion lenta:** Reiniciar sesion requeria tiempo reconstruyendo contexto manualmente
4. **Ambiguedad en delegacion:** Subagentes recibian contexto incompleto o excesivo
5. **Sin memoria persistente:** Al compactar, se perdia historial de tareas completadas

Gamilit necesitaba un sistema de gestion de contexto jerarquico que mantuviera contexto critico permanente y permitiera purgas selectivas.

## Decision

Adoptar **NEXUS v4.1 (Next-generation EXecution Understanding System)** con arquitectura de 4 niveles jerarquicos y presupuesto total de 20,000 tokens.

### Arquitectura de 4 Niveles

```
+-------------------------------------------------------------------+
| NIVEL 0 - SISTEMA (Workspace Standalone)                          |
| - CLAUDE.md, SIMCO-TAREA.md, PRINCIPIO-CAPVED.md                  |
| - Directivas globales, triggers, politicas                         |
| - Presupuesto: 8,000 tokens (40%)                                  |
| - Carga: SIEMPRE (automatica) | Purga: NUNCA                       |
+-------------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------------+
| NIVEL 1 - PROYECTO (Gamilit)                                       |
| - PROJECT-CONTEXT.md, PROXIMA-ACCION.md, MASTER_INVENTORY.yml     |
| - Variables del proyecto, stack (NestJS 11, React 19, PG 15)      |
| - Presupuesto: 5,000 tokens (25%)                                  |
| - Carga: Al iniciar sesion | Purga: NUNCA (standalone)            |
+-------------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------------+
| NIVEL 2 - OPERACION (Dominio)                                      |
| - SIMCO-DDL.md, SIMCO-BACKEND.md, SIMCO-FRONTEND.md               |
| - Inventario del dominio (DATABASE_, BACKEND_, FRONTEND_)         |
| - Presupuesto: 4,000 tokens (20%)                                  |
| - Carga: Segun dominio | Purga: Al cambiar dominio                 |
+-------------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------------+
| NIVEL 3 - TAREA (Dinamico)                                         |
| - Archivos especificos (entities, controllers, componentes)       |
| - Dependencias directas, tests relacionados                        |
| - Presupuesto: 3,000 tokens (15%)                                  |
| - Carga: Bajo demanda | Purga: Al completar subtarea               |
+-------------------------------------------------------------------+
```

### Distribucion de Presupuesto

| Nivel | Nombre | Tokens | Porcentaje | Persistencia |
|-------|--------|--------|------------|--------------|
| L0 | Sistema | 8,000 | 40% | Siempre |
| L1 | Proyecto | 5,000 | 25% | Por sesion |
| L2 | Operacion | 4,000 | 20% | Por dominio |
| L3 | Tarea | 3,000 | 15% | Dinamico |
| **Total** | | **20,000** | **100%** | |

**Disponible para tarea:** ~130,000 tokens (modelo Claude Opus 4.6/Sonnet 4.5)

### Umbrales de Alerta

```yaml
umbral_alerta: 160000     # 80% de 200K - Advertencia
umbral_critico: 190000    # 95% de 200K - Iniciar purga automatica
```

### Componentes del Sistema

1. **CONTEXT-MAP.yml:** Mapea keywords a archivos de contexto
2. **PROXIMA-ACCION.md:** Checkpoint de sesion (estado critico persistente)
3. **BOOTLOADER Protocol:** Secuencia de arranque en 5 pasos
4. **Triggers de Purga:** Automaticos por nivel

### Bootloader (5 Pasos)

```
PASO 1: Cargar L0 (Sistema)
  - CLAUDE.md, SIMCO-TAREA.md, PRINCIPIO-CAPVED.md
  - Verificar: Aliases disponibles, reglas criticas (RC1-RC6)

PASO 2: Identificar Proyecto
  - Proyecto: gamilit (standalone)
  - Workspace: C:\Empresas\ISEM\gamilit-workspace

PASO 3: Cargar L1 (Proyecto)
  - PROJECT-CONTEXT.md, PROXIMA-ACCION.md, MASTER_INVENTORY.yml
  - Verificar: Stack (NestJS 11, React 19, PostgreSQL 15)

PASO 4: Determinar Dominio
  - Clasificar tarea (DDL, Backend, Frontend, Docs, DevOps)
  - Cargar L2 correspondiente (SIMCO + inventario)

PASO 5: Iniciar Tarea
  - Cargar L3 segun necesidad (entities, services, componentes)
  - Ejecutar CAPVED segun modo (@FULL, @QUICK, @ANALYSIS)
```

### Cleanup de Contexto Mid-Session

```
Triggers de limpieza:
  post_5_files:        5+ archivos leidos → clasificar ACTIVE/REFERENCE/STALE
  post_subtarea:       Subtarea completada → purgar L3
  contexto_50_pct:     >50% ventana usada → inventariar + purgar STALE
  pre_delegacion:      Antes de delegar → limpiar para subagente
  compactacion:        Sistema avisa → PROXIMA-ACCION + purga agresiva

Clasificacion:
  ACTIVE    = Necesario AHORA → mantener completo
  REFERENCE = Ya leido → reemplazar por path + resumen 1 linea
  STALE     = De tarea anterior → descartar
```

## Consecuencias

### Positivas

- **Tiempo de recuperacion:** 2-3 minutos vs 10-15 minutos sin NEXUS
- **Precision de recuperacion:** ~95% vs ~60% sin NEXUS
- **Cero compactaciones inesperadas:** Purga proactiva antes de alcanzar limites
- **Subagentes ligeros:** Reciben solo contexto necesario via template
- **Memoria persistente:** PROXIMA-ACCION sobrevive a compactaciones
- **Escalabilidad:** Sistema funciona igual con sesiones cortas o largas

### Negativas

- **Complejidad adicional:** 4 niveles + triggers + checkpoints
  - Mitigacion: BOOTLOADER automatiza la secuencia, agentes no gestionan manualmente
- **Overhead de archivos:** CONTEXT-MAP.yml, PROXIMA-ACCION.md requieren mantenimiento
  - Mitigacion: Formato YAML estructurado, actualizacion automatica por triggers
- **Curva de aprendizaje:** Agentes deben entender el modelo de niveles
  - Mitigacion: Documentacion clara en orchestration/directivas/simco/

## Alternativas Consideradas

1. **Contexto plano sin niveles**
   - Rechazada: Imposible priorizar que purgar; todo o nada

2. **Sin checkpoints (PROXIMA-ACCION)**
   - Rechazada: Perdida de estado al compactar, recuperacion manual lenta

3. **MCP-CONTEXT externo**
   - Considerada complementaria: Requiere infraestructura adicional
   - No reemplaza NEXUS: NEXUS es suficiente para proyecto standalone

## Implementacion en Gamilit

### Archivos Clave

```
gamilit/
  orchestration/
    CONTEXT-MAP.yml                          # Mapeo keywords -> archivos
    PROJECT-CONTEXT.md                       # L1 del proyecto
    PROXIMA-ACCION.md                        # Checkpoint de sesion
    BOOTLOADER.md                            # Protocolo de arranque
    directivas/simco/
      SIMCO-CONTEXT-MANAGEMENT-V2.md        # Directiva maestra NEXUS
      SIMCO-BOOTLOADER.md                   # Protocolo de arranque
      SIMCO-CONTEXT-CLEANUP.md              # Protocolo de limpieza
      SIMCO-CONTEXT-ENGINEERING.md          # Ingenieria de contexto
      SIMCO-CONTROL-TOKENS.md               # Control de tokens
```

### Metricas de Exito

| Metrica | Objetivo | Alerta |
|---------|----------|--------|
| Tokens usados | < 160,000 | > 160,000 |
| Compactaciones/sesion | < 1 | > 2 |
| Tiempo recuperacion | < 3 min | > 5 min |
| Precision recuperacion | > 95% | < 90% |

## Referencias

- [ADR-0005 (workspace-arch)](C:\Empresas\ISEM\workspace-arch\docs\90-adr\ADR-0005-sistema-nexus.md) - ADR original
- [orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md](../../orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md) - Directiva maestra
- [orchestration/CONTEXT-MAP.yml](../../orchestration/CONTEXT-MAP.yml) - Mapeo de contexto
- [CLAUDE.md](../../CLAUDE.md) - Seccion NEXUS v4.1

---

**Documentado por:** Sistema SIMCO
**Ubicacion:** docs/90-adr/ADR-036-sistema-nexus.md
