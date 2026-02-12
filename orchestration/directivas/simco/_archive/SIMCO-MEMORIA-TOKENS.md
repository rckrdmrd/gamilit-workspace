# SIMCO-MEMORIA-TOKENS.md

**Sistema:** SIMCO v4.3.0 + NEXUS v4.1
**Version:** 1.1.0
**Fecha:** 2026-01-24
**Actualizado:** 2026-01-24

---

## 1. Propósito

Esta directiva define la estrategia de gestión de memoria y tokens para todos los agentes del sistema, optimizando el uso de contexto y previniendo compactaciones innecesarias.

---

## 2. Presupuesto de Tokens por Agente

```
╔══════════════════════════════════════════════════════════════════════════╗
║                      PRESUPUESTO DE TOKENS (BASE)                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   CLAUDE CODE (Opus 4.6)                                                  ║
║   ├── Límite sesión: 200,000 tokens                                      ║
║   ├── Alerta: 160,000 (80%)                                              ║
║   ├── Crítico: 180,000 (90%)                                             ║
║   └── Reserva compactación: 20,000 (10%)                                 ║
║                                                                           ║
║   GEMINI CLI / TRAE                                                       ║
║   ├── Sin límite de tokens Claude                                        ║
║   ├── Límite contexto: ~1M tokens (Gemini)                               ║
║   └── Recomendación: Mantener < 100K por tarea                           ║
║                                                                           ║
║   WINDSURF SWE                                                            ║
║   ├── Contexto limitado                                                   ║
║   ├── Prompt máximo: 50 líneas de código                                 ║
║   └── Sin persistencia entre tareas                                      ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Distribución de Tokens por Nivel NEXUS

### Presupuesto por Nivel (Claude Code)

| Nivel | Descripción | Tokens Máx | % del Total |
|-------|-------------|------------|-------------|
| L0 | Sistema (CLAUDE.md, BOOTLOADER) | 8,000 | 40% |
| L1 | Proyecto activo | 5,000 | 25% |
| L2 | Dominio (DDL/Backend/Frontend) | 4,000 | 20% |
| L3 | Tarea actual (dinámico) | 3,000 | 15% |
| **Subtotal Contexto** | | **20,000** | **10%** |
| **Disponible Trabajo** | | **180,000** | **90%** |

> **Nota:** 180K es el maximo teorico disponible. Para operacion segura, usar 130K como presupuesto de trabajo (150K seguro - 20K base). Ver SIMCO-CONTROL-TOKENS.md.

### Tokens Fijos vs Dinámicos

```yaml
tokens_fijos:
  CLAUDE.md: 4000          # Siempre cargado
  BOOTLOADER: 1000         # Al inicio de sesión
  CONTEXT-MAP.yml: 500     # Referencia rápida

tokens_dinamicos:
  directivas_simco: 800-1500   # Según dominio
  inventarios: 500-2000        # Según proyecto
  archivos_codigo: variable    # Según tarea

tokens_efimeros:
  resultados_busqueda: 0       # Purgar inmediatamente
  output_comandos: 500 max     # Resumir si excede
  errores_resueltos: 0         # Purgar al resolver
```

---

## 4. Estrategias de Optimización

### 4.1 Carga Diferida (Lazy Loading)

```
REGLA: No cargar hasta que se necesite

ANTES (eager loading):
├── Lee todos los inventarios al inicio
├── Carga todas las directivas SIMCO
└── Resultado: 15,000 tokens gastados sin usar

DESPUÉS (lazy loading):
├── Solo carga CLAUDE.md + BOOTLOADER
├── Resuelve contexto según keywords de tarea
└── Resultado: 5,000 tokens iniciales
```

### 4.2 Purga Proactiva

```
TRIGGERS DE PURGA AUTOMÁTICA:

Al completar subtarea:
├── Purgar L3 (archivos específicos de subtarea)
├── Mantener L2 si próxima subtarea es mismo dominio
└── Ejecutar: actualizar PROXIMA-ACCION.md

Al cambiar dominio:
├── Purgar L2 completo
├── Cargar nuevo dominio
└── Mantener L1 (mismo proyecto)

Al cambiar proyecto:
├── Purgar L1 + L2 + L3
├── Cargar BOOTLOADER de nuevo proyecto
└── Mantener solo L0
```

### 4.3 Compresión de Contexto

```
TÉCNICAS DE COMPRESIÓN:

1. Resumir resultados de comandos largos:
   ✗ Incluir 500 líneas de npm install output
   ✓ Resumir: "npm install completado, 0 vulnerabilidades"

2. Referencias en lugar de contenido completo:
   ✗ Copiar archivo entero de 200 líneas
   ✓ "Ver archivo X, función Y en líneas 45-60"

3. Eliminar contexto resuelto:
   ✗ Mantener error después de corregirlo
   ✓ Solo mantener: "Error corregido en línea X"
```

---

## 5. Gestión de Compactaciones

### 5.1 Prevención

```
UMBRALES DE ACCIÓN:

160,000 tokens (80%):
├── Alerta amarilla
├── Evaluar purga de L3
└── No cargar archivos grandes innecesarios

180,000 tokens (90%):
├── Alerta roja
├── Purgar L3 obligatorio
├── Evaluar purga de L2
└── Considerar delegar a agente externo

190,000 tokens (95%):
├── CRÍTICO
├── Guardar PROXIMA-ACCION.md inmediatamente
├── Completar operación actual
└── NO iniciar nuevas operaciones complejas
```

### 5.2 Preparación para Compactación

```
ANTES de compactación detectada:

1. GUARDAR estado actual:
   ├── Actualizar PROXIMA-ACCION.md
   ├── Commit y push cambios pendientes
   └── Documentar decisiones tomadas

2. PURGAR contexto prescindible:
   ├── Resultados de búsquedas
   ├── Outputs de comandos
   └── Errores ya resueltos

3. PRESERVAR información crítica:
   ├── Archivos en edición activa
   ├── Dependencias pendientes
   └── Bloqueos conocidos
```

### 5.3 Recuperación Post-Compactación

```
PROTOCOLO DE RECUPERACIÓN:

1. Leer PROXIMA-ACCION.md primero
2. Ejecutar BOOTLOADER del proyecto
3. Cargar solo contexto necesario para continuar
4. Verificar estado de git
5. Retomar desde punto guardado
```

---

## 6. Estrategias por Tipo de Tarea

### 6.1 Tareas de Análisis

```yaml
tokens_recomendados: 30,000 max
estrategia:
  - Cargar solo archivos relevantes
  - Usar subagentes para exploración
  - Resumir hallazgos progresivamente
  - Purgar archivos leídos después de analizar
```

### 6.2 Tareas de Implementación

```yaml
tokens_recomendados: 50,000 max
estrategia:
  - Mantener archivos en edición en contexto
  - Purgar dependencias después de verificar
  - Usar referencias para archivos grandes
  - Delegar subtareas atómicas a subagentes
```

### 6.3 Tareas de Validación

```yaml
tokens_recomendados: 20,000 max
estrategia:
  - Solo cargar archivos modificados
  - Resumir resultados de build/lint
  - Purgar inmediatamente al aprobar/rechazar
```

---

## 7. Reglas para Subagentes

```
╔══════════════════════════════════════════════════════════════════════════╗
║                 CONTEXTO DE SUBAGENTES                                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   RECIBEN:                                                               ║
║   ├── Contexto pre-definido por orquestador                              ║
║   ├── Presupuesto asignado (típico: 10,000-30,000)                       ║
║   └── Lista explícita de archivos permitidos                             ║
║                                                                           ║
║   NO PUEDEN:                                                             ║
║   ├── Expandir contexto sin aprobación                                   ║
║   ├── Cargar archivos fuera de la lista                                  ║
║   └── Exceder presupuesto asignado                                       ║
║                                                                           ║
║   DEBEN:                                                                 ║
║   ├── Reportar si falta contexto (no cargarlo)                           ║
║   ├── Purgar contexto propio al terminar                                 ║
║   └── Devolver resultado compacto al orquestador                         ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 8. Checklist de Cumplimiento

### Al Inicio de Sesión
- [ ] Verificar tokens disponibles
- [ ] Cargar solo L0 inicialmente
- [ ] Leer PROXIMA-ACCION.md si existe

### Durante Ejecución
- [ ] Monitorear uso de tokens
- [ ] Purgar contexto después de cada subtarea
- [ ] No cargar archivos "por si acaso"

### Al Finalizar
- [ ] Actualizar PROXIMA-ACCION.md
- [ ] Verificar todos los cambios commiteados
- [ ] Purgar contexto no persistente

### Antes de Compactación
- [ ] Guardar estado en PROXIMA-ACCION.md
- [ ] Commit y push pendientes
- [ ] Documentar punto de continuación

---

## 9. Referencias

- `@NEXUS` - Sistema de gestión de contexto
- `@IOC-CONTEXTO` - Inversión de control
- `@CONTEXT-MAP` - Mapa de resolución de contexto
- `@PROXIMA-ACCION` - Template de checkpoint

---

*SIMCO-MEMORIA-TOKENS.md - Gestión Optimizada de Memoria y Tokens*
*Parte del Sistema NEXUS v4.1*
