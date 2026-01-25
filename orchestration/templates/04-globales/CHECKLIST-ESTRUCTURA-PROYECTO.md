# CHECKLIST: Verificación de Estructura de Orchestration

**Versión:** 1.0.0
**Sistema:** NEXUS + SIMCO v2.2.0
**Propósito:** Validar que un proyecto tiene la estructura mínima requerida

---

## USO

Este checklist debe ejecutarse:
1. Al crear un nuevo proyecto
2. Al iniciar una sesión de trabajo en un proyecto existente
3. Durante auditorías periódicas del workspace

---

## NIVEL 2A: PROYECTO STANDALONE

### Estructura Mínima Requerida

```
projects/{proyecto}/
├── orchestration/
│   ├── 00-guidelines/
│   │   └── CONTEXTO-PROYECTO.md        # [OBLIGATORIO]
│   ├── PROXIMA-ACCION.md               # [OBLIGATORIO]
│   ├── inventarios/
│   │   ├── MASTER_INVENTORY.yml        # [OBLIGATORIO]
│   │   ├── DATABASE_INVENTORY.yml      # [SI HAY BD]
│   │   ├── BACKEND_INVENTORY.yml       # [SI HAY BACKEND]
│   │   └── FRONTEND_INVENTORY.yml      # [SI HAY FRONTEND]
│   └── trazas/
│       ├── TRAZA-TAREAS-DATABASE.md    # [SI HAY BD]
│       ├── TRAZA-TAREAS-BACKEND.md     # [SI HAY BACKEND]
│       └── TRAZA-TAREAS-FRONTEND.md    # [SI HAY FRONTEND]
└── docs/                               # [OBLIGATORIO]
```

### Checklist de Verificación

```markdown
## Proyecto: {NOMBRE}
## Fecha: {FECHA}
## Verificador: {AGENTE/USUARIO}

### 1. ESTRUCTURA BASE
- [ ] Carpeta `orchestration/` existe
- [ ] Carpeta `docs/` existe
- [ ] Archivo `PROXIMA-ACCION.md` existe

### 2. GUIDELINES
- [ ] Carpeta `00-guidelines/` existe
- [ ] Archivo `CONTEXTO-PROYECTO.md` existe
- [ ] CONTEXTO-PROYECTO.md contiene:
  - [ ] Nombre del proyecto
  - [ ] Código/identificador
  - [ ] Nivel (2A, 2B, 2B.1, 2B.2)
  - [ ] Estado actual
  - [ ] Stack tecnológico
  - [ ] Variables del proyecto (paths)
  - [ ] Referencias a directivas

### 3. INVENTARIOS
- [ ] Carpeta `inventarios/` existe
- [ ] `MASTER_INVENTORY.yml` existe
- [ ] MASTER_INVENTORY.yml contiene:
  - [ ] Resumen de épicas/módulos
  - [ ] Estado por capa
  - [ ] Referencias a otros inventarios

#### Por capa (si aplica):
- [ ] DATABASE: `DATABASE_INVENTORY.yml` existe y está poblado
- [ ] BACKEND: `BACKEND_INVENTORY.yml` existe y está poblado
- [ ] FRONTEND: `FRONTEND_INVENTORY.yml` existe y está poblado

### 4. TRAZAS
- [ ] Carpeta `trazas/` existe

#### Por capa (si aplica):
- [ ] DATABASE: `TRAZA-TAREAS-DATABASE.md` existe
- [ ] BACKEND: `TRAZA-TAREAS-BACKEND.md` existe
- [ ] FRONTEND: `TRAZA-TAREAS-FRONTEND.md` existe

### 5. ESTRUCTURA OPCIONAL (Recomendada)
- [ ] `01-analisis/` para análisis de tareas
- [ ] `02-planeacion/` para planes
- [ ] `03-tareas/` para desglose de tareas
- [ ] `04-ejecucion-logs/` para logs de ejecución
- [ ] `05-validaciones/` para checklists de validación
- [ ] `06-subagentes/` para delegaciones
- [ ] `directivas/` para directivas específicas del proyecto
- [ ] `estados/` para estado de agentes

### RESULTADO
- Total obligatorios: X/X
- Total recomendados: X/X
- Estado: [ ] COMPLETO | [ ] INCOMPLETO
- Acciones requeridas: {lista}
```

---

## NIVEL 2B.1: SUITE CORE

### Estructura Adicional

Además de todo lo de Nivel 2A:

```
erp-suite/apps/erp-core/orchestration/
├── 00-guidelines/
│   ├── CONTEXTO-PROYECTO.md
│   └── HERENCIA-DIRECTIVAS.md        # [OBLIGATORIO para suite]
└── ...
```

### Checklist Adicional

```markdown
### SUITE CORE ESPECÍFICO
- [ ] `HERENCIA-DIRECTIVAS.md` existe
- [ ] Define mapeo de herencia desde workspace/core
- [ ] Define qué directivas aplican a verticales
```

---

## NIVEL 2B.2: VERTICAL

### Estructura Adicional

```
erp-suite/apps/verticales/{vertical}/orchestration/
├── 00-guidelines/
│   ├── CONTEXTO-PROYECTO.md
│   └── HERENCIA-DIRECTIVAS.md        # [OBLIGATORIO]
├── directivas/
│   └── {directivas específicas}      # [SI HAY]
└── ...
```

### Checklist Adicional

```markdown
### VERTICAL ESPECÍFICO
- [ ] `HERENCIA-DIRECTIVAS.md` existe
- [ ] Define herencia desde suite-core Y core global
- [ ] Lista dependencias del core
- [ ] Lista directivas específicas de la vertical
```

---

## VERIFICACIÓN RÁPIDA (Script Mental)

```yaml
PASO 1: ¿Existe orchestration/?
  NO → Crear estructura completa
  SÍ → Continuar

PASO 2: ¿Existe CONTEXTO-PROYECTO.md?
  NO → BLOQUEANTE - Crear antes de continuar
  SÍ → Verificar contenido mínimo

PASO 3: ¿Existen inventarios?
  NO → Crear al menos MASTER_INVENTORY.yml
  SÍ → Verificar que estén poblados

PASO 4: ¿Existen trazas?
  NO → Crear templates de traza por capa
  SÍ → Verificar formato correcto

PASO 5: ¿El proyecto tiene código?
  SÍ → Inventarios deben reflejar el código existente
  NO → Inventarios pueden ser templates
```

---

## COMANDOS DE VERIFICACIÓN

```bash
# Verificar estructura de un proyecto
ls -la projects/{proyecto}/orchestration/

# Verificar inventarios
ls -la projects/{proyecto}/orchestration/inventarios/

# Verificar trazas
ls -la projects/{proyecto}/orchestration/trazas/

# Verificar contenido de CONTEXTO-PROYECTO
head -50 projects/{proyecto}/orchestration/00-guidelines/CONTEXTO-PROYECTO.md

# Buscar proyectos sin estructura completa
for p in projects/*/; do
  if [ ! -f "$p/orchestration/00-guidelines/CONTEXTO-PROYECTO.md" ]; then
    echo "FALTA CONTEXTO: $p"
  fi
done
```

---

## ACCIONES DE REMEDIACIÓN

### Si falta CONTEXTO-PROYECTO.md

1. Copiar template de `core/orchestration/templates/CONTEXTO-NIVEL-STANDALONE.md`
2. Adaptar variables del proyecto
3. Completar stack tecnológico
4. Agregar referencias

### Si faltan inventarios

1. Crear `MASTER_INVENTORY.yml` con estructura básica
2. Analizar código existente
3. Poblar inventarios por capa
4. Verificar contra código real

### Si faltan trazas

1. Crear archivos de traza por capa
2. Usar formato estándar (ver ejemplos en gamilit)
3. Registrar historial conocido si existe

---

## FRECUENCIA DE VERIFICACIÓN

| Evento | Frecuencia |
|--------|------------|
| Nuevo proyecto | Inmediatamente |
| Inicio de sesión | Al comenzar |
| Fin de épica | Al cerrar |
| Auditoría | Semanal |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v2.2.0 | **Tipo:** Checklist de Verificación
