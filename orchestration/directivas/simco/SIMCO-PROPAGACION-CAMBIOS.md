# SIMCO-PROPAGACION-CAMBIOS

> **Alias:** `@SIMCO-PROPAGACION`
> **Versión:** 1.0.0
> **Actualizado:** 2026-01-16
> **Estado:** ACTIVO

---

## Propósito

Protocolo para propagar cambios entre proyectos del workspace manteniendo consistencia y trazabilidad.

---

## Cuándo Aplicar

- Cambio en proyecto que es dependencia de otros (template-saas, erp-core)
- Security fix que debe distribuirse
- Actualización de documentación/definiciones compartidas
- Sincronización de funcionalidades

---

## Tipos de Cambio y SLAs

| Tipo | Propagación | SLA | Validación |
|------|-------------|-----|------------|
| **Security Fix** | FORZADA | 24h | Completa (build+lint+tests) |
| **Bug Fix** | PRIORITARIA | 72h | Completa |
| **Documentación** | INMEDIATA | Inmediato | Ninguna (sintaxis) |
| **Definiciones YAML** | INMEDIATA | Inmediato | Sintaxis YAML |
| **Interfaces TS** | AUTOMÁTICA | 1h | TypeScript |
| **Código Backend** | VALIDADA | Sprint | Completa |
| **Código Frontend** | VALIDADA | Sprint | Completa |

---

## Cadena de Propagación

```
┌─────────────────┐
│  template-saas  │  ← PROVIDER (origen de truth para SaaS)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    erp-core     │  ← INTERMEDIATE (adapta para ERP)
└────────┬────────┘
         │
         ├──────────┬──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼          ▼
┌──────────────┐┌──────────┐┌──────────┐┌─────────┐┌──────────┐
│ construccion ││ clinicas ││ diesel   ││ retail  ││ vidrio   │
└──────────────┘└──────────┘└──────────┘└─────────┘└──────────┘
                     CONSUMERS (verticales)
```

---

## Protocolo de Propagación

### FASE 1: Identificar Alcance

```bash
# Consultar grafo de dependencias
cat orchestration/DEPENDENCY-GRAPH.yml | grep -A 20 "proyecto_origen"

# Consultar trazabilidad
cat orchestration/TRACEABILITY-MASTER.yml | grep -A 10 "cambio_id"

# Identificar proyectos consumidores
cat orchestration/FUNCTIONALITY-TRACEABILITY.yml | grep -A 5 "propagation"
```

**Salida esperada:**
- Lista de proyectos afectados
- Tipo de cambio (código, docs, config)
- SLA aplicable

### FASE 2: Validar Origen

**ANTES de propagar, validar en proyecto origen:**

```bash
cd projects/proyecto_origen

# Backend
npm run build && npm run lint && npm run test

# Frontend (si aplica)
npm run build && npm run typecheck
```

**Si falla validación:**
- NO propagar
- Corregir en origen primero
- Re-ejecutar validación

### FASE 3: Preparar Cambio

**Para código:**
```bash
# Crear patch
git format-patch -1 HEAD --stdout > /tmp/change.patch

# O preparar cherry-pick
git log -1 --format="%H"  # Guardar commit hash
```

**Para documentación:**
```bash
# Copiar a mirrors
cp archivo_modificado.md shared/mirrors/proyecto_origen/
```

### FASE 4: Aplicar en Destinos

**Para cada proyecto consumidor:**

```bash
cd projects/proyecto_destino

# Opción A: Cherry-pick (código)
git cherry-pick <commit-hash>

# Opción B: Aplicar patch
git apply /tmp/change.patch

# Opción C: Copiar (docs/config)
cp shared/mirrors/proyecto_origen/archivo.md ./ruta/destino/

# Resolver conflictos si es necesario
git status
# Editar archivos con conflictos
git add .
git commit -m "[PROPAGATE] Descripción del cambio"
```

### FASE 5: Validar Destinos

**Para CADA proyecto destino:**

```bash
cd projects/proyecto_destino

# Validación completa
npm run build && npm run lint && npm run test

# Si falla:
# 1. Revisar si cambio necesita adaptación
# 2. Adaptar y re-validar
# 3. Documentar diferencias
```

### FASE 6: Registrar Propagación

**Actualizar trazabilidad:**

```yaml
# En orchestration/TRACEABILITY-MASTER.yml
propagations:
  - id: "PROP-2026-01-16-001"
    origen: "template-saas"
    destinos:
      - proyecto: "erp-core"
        status: "COMPLETADO"
        fecha: "2026-01-16"
      - proyecto: "erp-construccion"
        status: "COMPLETADO"
        fecha: "2026-01-16"
    tipo: "security_fix"
    descripcion: "Fix JWT refresh vulnerability"
```

**Actualizar status en mirrors (si aplica):**

```yaml
# En shared/mirrors/proyecto/PROPAGATION-STATUS.yml
last_sync: "2026-01-16"
pending_changes: 0
```

---

## Propagación por Tipo

### Security Fix (SLA: 24h)

```
DETECTAR → VALIDAR origen → PROPAGAR TODOS → VALIDAR TODOS → REGISTRAR
                                    ↓
                           Máxima prioridad
                           Sin excepciones
```

### Bug Fix (SLA: 72h)

```
DETECTAR → VALIDAR origen → EVALUAR impacto → PROPAGAR afectados → VALIDAR → REGISTRAR
```

### Feature (SLA: Sprint)

```
IMPLEMENTAR → VALIDAR → PLANIFICAR propagación → PROPAGAR gradual → VALIDAR → REGISTRAR
```

### Documentación (Inmediato)

```
MODIFICAR → COPIAR a mirrors → NOTIFICAR consumidores
```

---

## Comandos Rápidos

```bash
# Propagar a todas las verticales ERP
./scripts/propagation/propagate-to-erp-verticals.sh <commit-hash>

# Propagar documentación
./scripts/propagation/sync-docs.sh proyecto_origen proyecto_destino

# Ver status de propagación
cat shared/mirrors/*/PROPAGATION-STATUS.yml
```

---

## Checklist de Propagación

- [ ] Alcance identificado (proyectos afectados)
- [ ] SLA determinado según tipo
- [ ] Validación en origen completada
- [ ] Cambio preparado (patch/cherry-pick)
- [ ] Aplicado en cada destino
- [ ] Validado en cada destino
- [ ] Conflictos resueltos (si hubo)
- [ ] Trazabilidad registrada
- [ ] Mirrors actualizados

---

## Errores Comunes

| Error | Consecuencia | Prevención |
|-------|--------------|------------|
| Propagar sin validar origen | Bug se multiplica | SIEMPRE validar primero |
| Olvidar proyecto | Inconsistencia | Usar DEPENDENCY-GRAPH |
| No registrar | Pérdida de trazabilidad | SIEMPRE actualizar TRACEABILITY |
| Ignorar SLA security | Vulnerabilidad expuesta | Security = 24h MÁXIMO |

---

## Referencias

- `orchestration/DEPENDENCY-GRAPH.yml` - Grafo de dependencias
- `orchestration/TRACEABILITY-MASTER.yml` - Trazabilidad
- `orchestration/FUNCTIONALITY-TRACEABILITY.yml` - Mapeo funcionalidad→objetos
- `shared/mirrors/` - Repositorios espejo
- `@TRIGGER-PROPAGACION-AUTOMATICA` - Trigger de propagación
- `./scripts/propagate-changes.sh` - Script de propagación
