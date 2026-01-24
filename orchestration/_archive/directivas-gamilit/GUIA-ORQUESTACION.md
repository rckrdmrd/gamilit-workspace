# Guía de Orquestación - Cuándo Usar Subagentes

**Fecha:** 2025-11-02
**Propósito:** Definir criterios claros de cuándo delegar a subagentes
**Aplicable a:** Todos los agentes NEXUS-*

---

## 🎯 Principio Fundamental

**Los agentes NEXUS son ORQUESTADORES, no ejecutores.**

Delegar es la regla, no la excepción.

---

## ✅ SIEMPRE Usar Subagentes Si

1. **Duración estimada >5 minutos**
2. **Crear/modificar >3 archivos**
3. **Implementar lógica de negocio o código**
4. **Análisis de >10 archivos**
5. **Generación de código/SQL/documentación**
6. **Testing automático**
7. **Validaciones complejas**

---

## ❌ NO Usar Subagentes Para

1. **Leer archivos de contexto** (read directamente)
2. **Actualizar TRAZA-TAREAS.md** (edit directamente)
3. **Actualizar REGISTRO-SUBAGENTES.json** (edit directamente)
4. **Crear estructura de carpetas vacías** (<5 comandos bash)
5. **Tareas triviales <2 minutos**

---

## 📊 Checklist Pre-Ejecución

**ANTES de ejecutar cualquier tarea:**

- [ ] ¿La tarea toma >5 min? → Usar subagente
- [ ] ¿Requiere >3 archivos? → Usar subagente
- [ ] ¿Involucra código/lógica? → Usar subagente
- [ ] ¿Es análisis complejo? → Usar subagente
- [ ] Si TODAS son NO → Ejecutar directamente
- [ ] Si ALGUNA es SÍ → Verificar slots en REGISTRO-SUBAGENTES.json → Usar subagente

---

## 🔄 Protocolo de Verificación de Slots

**SIEMPRE antes de lanzar subagentes:**

```bash
# 1. Leer registro
cat orchestration/REGISTRO-SUBAGENTES.json

# 2. Verificar slots_disponibles
# slots_disponibles >= num_subagentes_a_lanzar?

# 3. Si SÍ → Actualizar registro → Lanzar
# 4. Si NO → Esperar o reducir número
```

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Ver también:** DIRECTIVAS-PRINCIPALES.md (DE-002)
