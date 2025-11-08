# Orchestration - Sistema NEXUS

**Propósito:** Documentación de ejecución, planes, y trazas de los agentes de desarrollo

---

## 📂 Estructura

```
orchestration/
├── README.md                    # Este archivo
├── REGISTRO-SUBAGENTES.json     # ⚠️ Registro compartido (15 slots max)
├── PROXIMA-ACCION.md            # Próxima tarea prioritaria
├── ESTRUCTURA-ORGANIZACION.md   # Estructura obligatoria
│
├── TRAZA-TAREAS-{PERFIL}.md     # Estado por perfil (5 archivos)
├── ESTADO-{PERFIL}.json         # Estado estructurado (5 archivos)
│
├── 01-analisis/                 # Análisis generados
├── 02-planes/                   # Planes de implementación
├── 03-subagentes/               # Documentación de subagentes
├── 04-logs/                     # Logs de ejecución
├── 05-validaciones/             # Validaciones
└── 06-respaldos/                # Backups
```

---

## ⚠️ IMPORTANTE: Registro de Subagentes

**El límite de 15 subagentes es COMPARTIDO entre TODOS los agentes NEXUS.**

**SIEMPRE antes de lanzar subagentes:**
```bash
cat REGISTRO-SUBAGENTES.json
# Verificar slots_disponibles
```

---

## 🔄 Flujo de Trabajo

1. **Leer** `PROXIMA-ACCION.md`
2. **Leer** `TRAZA-TAREAS-{TU_PERFIL}.md`
3. **Verificar** `REGISTRO-SUBAGENTES.json`
4. **Ejecutar** tarea
5. **Actualizar** documentación
6. **Actualizar** `PROXIMA-ACCION.md`

---

## 📚 Documentación

Ver `.claude/directivas/DIRECTIVAS-PRINCIPALES.md` para todas las directivas.

---

**Creado:** 2025-11-02
**Versión:** 1.0
