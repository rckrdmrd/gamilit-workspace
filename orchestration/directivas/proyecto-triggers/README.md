# Triggers de Proyecto - gamilit

**Version:** 1.0.0
**Fecha:** 2026-01-18
**Propagado desde:** workspace-v2/orchestration/directivas/triggers/

---

## ORIGEN

Los triggers en esta carpeta son **propagados desde workspace-v2** y adaptados al contexto local de gamilit. Esto asegura consistencia en las practicas de desarrollo mientras mantiene las referencias locales correctas.

**Fuente original:** `/home/isem/workspace-v2/orchestration/directivas/triggers/`

---

## TRIGGERS INCLUIDOS

| Archivo | Descripcion | Alias Local |
|---------|-------------|-------------|
| TRIGGER-CIERRE-TAREA-OBLIGATORIO.md | Obliga ejecucion de checklist post-tarea antes de marcar tarea como completada | @TRIGGER_CIERRE |
| TRIGGER-COHERENCIA-CAPAS.md | Obliga coherencia entre DDL, Backend y Frontend | @TRIGGER_COHERENCIA |

---

## DIFERENCIAS CON ORIGEN

Los triggers han sido adaptados para:

1. **Referencias locales**: Las rutas apuntan a `orchestration/` de gamilit en lugar de workspace-v2
2. **Alias locales**: Los aliases como `@DEF_CHK_POST` apuntan a definiciones locales
3. **Contexto de proyecto**: Adaptados para un proyecto individual vs workspace completo

---

## SINCRONIZACION

Estos triggers deben sincronizarse cuando:
- Se actualiza la version en workspace-v2
- Se agregan nuevas funcionalidades al workspace que aplican a proyectos

**Ultima sincronizacion:** 2026-01-18

---

## REFERENCIAS

| Referencia | Ruta Local |
|------------|------------|
| Triggers workspace | /home/isem/workspace-v2/orchestration/directivas/triggers/ |
| Definiciones locales | orchestration/_definitions/ |
| Inventarios locales | orchestration/inventarios/ |

---

**Nota:** No modificar estos archivos directamente. Si se requiere un cambio, hacerlo primero en workspace-v2 y luego propagar.
