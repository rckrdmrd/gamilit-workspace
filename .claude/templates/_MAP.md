# Mapa de Contenidos: Templates

**Propósito:** Templates reutilizables para prompts de subagentes y documentación
**Archivos totales:** 2 (consolidado + mapa)
**Última actualización:** 2025-11-02

---

## 📋 Archivos

```
templates/
├── TEMPLATES-SUBAGENTES.md     # ⭐ Todos los templates consolidados
└── _MAP.md                     # Este archivo
```

---

## 📑 Templates Disponibles

Ver `TEMPLATES-SUBAGENTES.md` para todos los templates:

1. **T-README-SUBAGENTE** - Documentación de subagente
2. **T-TRAZA-SUBAGENTE** - Traza de ejecución
3. **T-OUTPUT-SUBAGENTE** - Output final
4. **T-ANALISIS-FEATURE** - Análisis de feature
5. **T-PLAN-IMPLEMENTACION** - Plan de implementación
6. **T-EJECUCION-BACKEND** - Prompt para backend
7. **T-EJECUCION-FRONTEND** - Prompt para frontend
8. **T-EJECUCION-DATABASE** - Prompt para database
9. **T-VALIDACION** - Prompt para validación

---

## 🔄 Uso de Templates

### Para crear documentación de subagente:
1. Copiar T-README-SUBAGENTE
2. Adaptar con datos del subagente específico
3. Guardar en `orchestration/03-subagentes/SA-{ID}/README.md`

### Para lanzar subagente:
1. Seleccionar template apropiado (T-EJECUCION-*)
2. Adaptar con contexto específico
3. Usar con Task tool

---

**Creado:** 2025-11-02
**Versión:** 1.0
