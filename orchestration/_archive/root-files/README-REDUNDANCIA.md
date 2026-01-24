# README-REDUNDANCIA.md
# Documentación Redundante para Independencia Productiva

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Propósito:** Permitir despliegue productivo de Gamilit sin acceso a workspace-v2

---

## CONTEXTO

Gamilit es un proyecto **STANDALONE** que opera en producción de forma independiente.
Para garantizar que los agentes puedan trabajar en el proyecto sin acceso al
workspace-v2 padre, se mantiene una copia redundante de las directivas SIMCO
críticas en este directorio.

---

## ESTRUCTURA DE REDUNDANCIA

```
orchestration/
├── principios/                    # Principios SIMCO fundamentales
│   ├── PRINCIPIO-CAPVED.md        # Ciclo de vida obligatorio
│   └── _INDEX.md                  # Índice de principios
│
├── simco-redundancia/             # Directivas SIMCO críticas
│   ├── SIMCO-TAREA.md             # Punto de entrada para HUs
│   ├── SIMCO-CREAR.md             # Crear archivos nuevos
│   ├── SIMCO-MODIFICAR.md         # Modificar existentes
│   ├── SIMCO-VALIDAR.md           # Validar código
│   ├── SIMCO-DOCUMENTAR.md        # Documentar trabajo
│   ├── SIMCO-DDL.md               # Operaciones de BD
│   ├── SIMCO-BACKEND.md           # Desarrollo NestJS
│   └── _INDEX.md                  # Índice de directivas
│
├── patrones-redundancia/          # Patrones de desarrollo
│   └── _INDEX.md                  # Índice de patrones
│
├── checklists-redundancia/        # Checklists de validación
│   └── _INDEX.md                  # Índice de checklists
│
└── README-REDUNDANCIA.md          # Este archivo
```

---

## POLÍTICA DE ACTUALIZACIÓN

### ¿Cuándo actualizar?

1. **Cuando cambia la versión de SIMCO en workspace-v2**
   - Verificar si el cambio afecta gamilit
   - Copiar versión actualizada
   - Documentar fecha y versión copiada

2. **Antes de despliegue productivo independiente**
   - Verificar que todas las directivas estén presentes
   - Validar que las versiones son compatibles

### ¿Cómo actualizar?

```bash
# Desde workspace-v2
cp orchestration/directivas/principios/PRINCIPIO-CAPVED.md \
   projects/gamilit/orchestration/principios/

cp orchestration/directivas/simco/SIMCO-TAREA.md \
   projects/gamilit/orchestration/simco-redundancia/
# ... repetir para cada archivo
```

---

## VERSIONES ACTUALES

| Archivo | Versión | Fecha Copia | Original |
|---------|---------|-------------|----------|
| PRINCIPIO-CAPVED.md | 1.0.0 | 2026-01-16 | orchestration/directivas/principios/ |
| SIMCO-TAREA.md | 1.1.0 | 2026-01-16 | orchestration/directivas/simco/ |
| SIMCO-CREAR.md | 1.0.0 | 2026-01-16 | orchestration/directivas/simco/ |
| SIMCO-MODIFICAR.md | 1.0.0 | 2026-01-16 | orchestration/directivas/simco/ |
| SIMCO-VALIDAR.md | 1.0.0 | 2026-01-16 | orchestration/directivas/simco/ |
| SIMCO-DOCUMENTAR.md | 1.0.0 | 2026-01-16 | orchestration/directivas/simco/ |
| SIMCO-DDL.md | 1.0.0 | 2026-01-16 | orchestration/directivas/simco/ |
| SIMCO-BACKEND.md | 1.0.0 | 2026-01-16 | orchestration/directivas/simco/ |

---

## USO EN AGENTES

### Si tienes acceso a workspace-v2:
```
Usar directivas de: /home/isem/workspace-v2/orchestration/directivas/
```

### Si NO tienes acceso a workspace-v2 (deployment independiente):
```
Usar directivas de: orchestration/principios/ y orchestration/simco-redundancia/
```

---

## RELACIÓN CON HERENCIA

Este directorio de redundancia complementa (no reemplaza) los archivos de herencia:

- `00-guidelines/HERENCIA-SIMCO.md` - Documenta qué se hereda
- `00-guidelines/HERENCIA-DIRECTIVAS.md` - Mapeo de herencia
- `00-guidelines/CONTEXTO-PROYECTO.md` - Variables CCA

La diferencia es:
- **HERENCIA**: Documenta la relación con workspace-v2
- **REDUNDANCIA**: Contiene copias locales para independencia

---

## NOTAS

- Esta redundancia es una **EXCEPCIÓN** para gamilit
- Otros proyectos NO deben duplicar directivas
- Gamilit necesita esto porque opera como workspace autónomo en producción

---

*Generado: 2026-01-16 | Sistema: SIMCO v4.0.0*
