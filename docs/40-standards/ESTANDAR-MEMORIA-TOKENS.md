# Estandar de Memoria y Tokens

**Version:** 1.0.0
**Actualizado:** 2026-02-11
**Referencia Operacional:** `@MEMORIA-TOKENS` -> `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md`

---

## Resumen

Este estandar define como gestionar el uso de tokens y memoria durante las sesiones de trabajo con agentes IA, optimizando el contexto y previniendo compactaciones.

---

## Presupuesto por Agente

### Claude Code (Opus 4.6)

| Umbral | Tokens | % | Accion |
|--------|--------|---|--------|
| Normal | < 160,000 | < 80% | Operacion normal |
| Alerta | 160,000 | 80% | Evaluar purga L3 |
| Critico | 180,000 | 90% | Purgar L3, evaluar L2 |
| Emergencia | 190,000 | 95% | Guardar checkpoint |
| Limite | 200,000 | 100% | Compactacion forzada |

### Otros Agentes

| Agente | Limite Claude | Notas |
|--------|--------------|-------|
| Gemini CLI | 0 | Usa tokens Gemini |
| Trae | 0 | Usa tokens Gemini |
| Windsurf SWE | 0 | Contexto minimo |

---

## Sistema NEXUS - Niveles de Contexto

### Distribucion de Tokens

```
╔═══════════════════════════════════════════════════════╗
║  NIVEL   │  TOKENS  │   %   │  CONTENIDO             ║
╠═══════════════════════════════════════════════════════╣
║  L0      │   8,000  │  40%  │  Sistema (CLAUDE.md)   ║
║  L1      │   5,000  │  25%  │  Proyecto activo       ║
║  L2      │   4,000  │  20%  │  Dominio (DDL/BE/FE)   ║
║  L3      │   3,000  │  15%  │  Tarea actual          ║
╠═══════════════════════════════════════════════════════╣
║  TOTAL   │  20,000  │  10%  │  Contexto              ║
║  TRABAJO │ 180,000  │  90%  │  Disponible            ║
╚═══════════════════════════════════════════════════════╝
```

> **Nota:** 180K es el maximo teorico disponible. Para operacion segura, usar 130K como presupuesto de trabajo (150K seguro - 20K base). Ver SIMCO-CONTROL-TOKENS.md.

### Descripcion de Niveles

| Nivel | Persistencia | Contenido Tipico |
|-------|--------------|------------------|
| **L0** | Siempre | CLAUDE.md, BOOTLOADER |
| **L1** | Por proyecto | Inventarios, estructura |
| **L2** | Por dominio | Directivas SIMCO especificas |
| **L3** | Por tarea | Archivos en edicion |

---

## Estrategias de Optimizacion

### 1. Carga Diferida (Lazy Loading)

```
ANTES (eager loading):
├── Carga todos los inventarios
├── Carga todas las directivas
└── Resultado: 15,000 tokens sin usar

DESPUES (lazy loading):
├── Solo CLAUDE.md + BOOTLOADER
├── Carga segun keywords de tarea
└── Resultado: 5,000 tokens iniciales
```

**Regla:** No cargar hasta que se necesite.

### 2. Purga Proactiva

| Evento | Accion |
|--------|--------|
| Subtarea completada | Purgar L3 |
| Cambio de dominio | Purgar L2, cargar nuevo |
| Cambio de proyecto | Purgar L1+L2+L3 |
| Umbral 80% | Evaluar purga L3 |
| Umbral 90% | Purgar L3 obligatorio |

### 3. Compresion de Contexto

| Tecnica | Ejemplo |
|---------|---------|
| Resumir outputs | "npm install OK" vs 500 lineas |
| Referencias | "Ver archivo X:45-60" vs copiar todo |
| Eliminar resueltos | Quitar errores ya corregidos |

---

## Gestion de Compactaciones

### Preparacion Pre-Compactacion

Antes de alcanzar el limite:

1. **Guardar estado:**
   - Actualizar PROXIMA-ACCION.md
   - Commit y push cambios
   - Documentar decisiones

2. **Purgar prescindible:**
   - Resultados de busquedas
   - Outputs de comandos
   - Errores resueltos

3. **Preservar critico:**
   - Archivos en edicion
   - Dependencias pendientes
   - Bloqueos conocidos

### Recuperacion Post-Compactacion

1. Leer PROXIMA-ACCION.md
2. Ejecutar BOOTLOADER
3. Cargar solo contexto necesario
4. Verificar git status
5. Retomar desde checkpoint

---

## Tokens por Tipo de Tarea

| Tipo de Tarea | Tokens Recomendados |
|---------------|---------------------|
| Analisis | 30,000 max |
| Implementacion | 50,000 max |
| Validacion | 20,000 max |
| Multi-dominio | 40,000/dominio |

### Consejos por Tipo

**Analisis:**
- Usar subagentes para exploracion
- Resumir hallazgos progresivamente
- Purgar archivos despues de analizar

**Implementacion:**
- Mantener archivos en edicion
- Delegar subtareas a Windsurf
- Usar referencias para archivos grandes

**Validacion:**
- Solo cargar archivos modificados
- Resumir resultados de build
- Purgar al aprobar/rechazar

---

## Checklist de Sesion

### Al Iniciar
- [ ] Verificar tokens disponibles
- [ ] Cargar solo L0 inicialmente
- [ ] Leer PROXIMA-ACCION.md si existe

### Durante Ejecucion
- [ ] Monitorear uso de tokens
- [ ] Purgar despues de cada subtarea
- [ ] No cargar "por si acaso"

### Al Finalizar
- [ ] Actualizar PROXIMA-ACCION.md
- [ ] Commit y push pendientes
- [ ] Purgar contexto no persistente

---

## Referencias

- **Sistema NEXUS:** `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md`
- **Context Cleanup:** `orchestration/directivas/simco/SIMCO-CONTEXT-CLEANUP.md`
- **Control Tokens:** `orchestration/directivas/simco/SIMCO-CONTROL-TOKENS.md`
- **CLAUDE.md:** Seccion NEXUS v4.1

## Ver tambien

- [PRINCIPIO-ECONOMIA-TOKENS](../../orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md) - Principio de economia de tokens para agentes IA

---

*Documentacion de usuario - Sistema SIMCO v4.0.0 + NEXUS v4.1*
