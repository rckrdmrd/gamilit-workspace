# Directivas: Paralelización de Subagentes

**Fecha:** 2025-11-02
**Versión:** 1.0
**Aplicable a:** Todos los agentes NEXUS-*

---

## 🎯 Principio

**Máximo 15 subagentes en paralelo COMPARTIDOS entre TODOS los agentes NEXUS.**

---

## ⚠️ Límite Compartido

**IMPORTANTE:** El límite de 15 subagentes es **GLOBAL** para todo el sistema NEXUS.

Si NEXUS-BACKEND tiene 8 subagentes activos y NEXUS-FRONTEND quiere lanzar 10, solo puede lanzar 7 (15 - 8 = 7 disponibles).

---

## 📋 Protocolo Obligatorio

**ANTES de lanzar subagentes:**

1. **Leer registro:**
   ```bash
   cat orchestration/REGISTRO-SUBAGENTES.json
   ```

2. **Verificar `slots_disponibles`:**
   ```json
   {
     "slots_disponibles": 10  # ¿Suficientes para mi tarea?
   }
   ```

3. **Si suficientes:**
   - Actualizar registro (agregar a `activos`, decrementar slots)
   - Lanzar subagentes
   - Esperar completitud
   - Actualizar registro (mover a `completados`, incrementar slots)

4. **Si insuficientes:**
   - OPCIÓN A: Esperar a que terminen otros subagentes
   - OPCIÓN B: Reducir número de subagentes a lanzar
   - OPCIÓN C: Dividir en tandas

---

## 🔄 Estructura del Registro

```json
{
  "limite_maximo": 15,
  "activos": [
    {
      "id": "SA-BACKEND-001",
      "agente_padre": "NEXUS-BACKEND",
      "tarea": "Implementar UserService",
      "inicio": "2025-11-02T10:30:00Z",
      "estado": "running",
      "modelo": "sonnet",
      "prioridad": 1,
      "orden_ejecucion": 1
    }
  ],
  "completados": [],
  "fallidos": [],
  "slots_disponibles": 14,
  "ultima_actualizacion": "2025-11-02T10:30:00Z"
}
```

---

## 🎯 Sistema de Prioridades

**Prioridad numérica:** 1 = más alta, 2, 3, etc.

Cuando hay escasez de slots, subagentes con prioridad 1 tienen preferencia.

---

## 🔗 Relación con Sistema SIMCO (Workspace)

**Esta directiva define límites GLOBALES a nivel proyecto Gamilit.**

Para detalles de ejecución de subagentes (tracking, herencia de contexto, sincronización por grupos), consultar:

- **SIMCO-DELEGACION-PARALELA.md** (`/orchestration/directivas/simco/`)
  - Define máx 5 subagentes por sesión individual
  - Proporciona SESSION-TRACKING para monitoreo
  - Establece reglas de orden (DDL → Backend → Frontend)

**Jerarquía:**
```
NEXUS (este archivo)    →  Límite global: 15 subagentes compartidos
        ↓
SIMCO-DELEGACION-PARALELA →  Orquestación por sesión: máx 5 por tarea
```

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-10
**Autor:** Sistema NEXUS
**Ver también:**
- DIRECTIVAS-PRINCIPALES.md (DE-002)
- `/orchestration/directivas/simco/SIMCO-DELEGACION-PARALELA.md`
